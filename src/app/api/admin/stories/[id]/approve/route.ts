// API одобрения истории модератором

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/db/prisma';
import { sendApprovalNotification } from '@/lib/email/mailer';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';

interface JwtPayload {
  adminId: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Проверяем авторизацию
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Не авторизован' },
        { status: 401 }
      );
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch {
      return NextResponse.json(
        { success: false, error: 'Не авторизован' },
        { status: 401 }
      );
    }

    // Находим историю
    const story = await prisma.story.findFirst({
      where: { id, deletedAt: null },
    });

    if (!story) {
      return NextResponse.json(
        { success: false, error: 'История не найдена' },
        { status: 404 }
      );
    }

    // Обновляем статус
    await prisma.story.update({
      where: { id },
      data: {
        status: 'APPROVED',
        moderatedAt: new Date(),
        moderatedBy: decoded.adminId,
        rejectionReason: null,
      },
    });

    // Логируем
    await prisma.activityLog.create({
      data: {
        action: 'STORY_APPROVED',
        storyId: id,
        adminId: decoded.adminId,
      },
    });

    // Отправляем уведомление автору
    await sendApprovalNotification(story.email, story.authorName, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка одобрения истории:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}
