// API отклонения истории модератором

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/db/prisma';
import { sendRejectionNotification } from '@/lib/email/mailer';

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
    const { reason } = await request.json();

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { success: false, error: 'Укажите причину отклонения' },
        { status: 400 }
      );
    }

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
        status: 'REJECTED',
        moderatedAt: new Date(),
        moderatedBy: decoded.adminId,
        rejectionReason: reason.trim(),
      },
    });

    // Логируем
    await prisma.activityLog.create({
      data: {
        action: 'STORY_REJECTED',
        storyId: id,
        adminId: decoded.adminId,
        details: JSON.stringify({ reason: reason.trim() }),
      },
    });

    // Отправляем уведомление автору
    await sendRejectionNotification(
      story.email,
      story.authorName,
      reason.trim(),
      story.cabinetToken
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка отклонения истории:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}
