// API для повторной отправки истории на модерацию
// POST - отправляет отредактированную историю на модерацию без оплаты

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { isValidTokenFormat } from '@/lib/auth/tokens';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!isValidTokenFormat(token)) {
      return NextResponse.json(
        { success: false, error: 'Неверный формат ссылки' },
        { status: 400 }
      );
    }

    const story = await prisma.story.findFirst({
      where: {
        cabinetToken: token,
        deletedAt: null,
      },
    });

    if (!story) {
      return NextResponse.json(
        { success: false, error: 'История не найдена' },
        { status: 404 }
      );
    }

    // Проверяем, что история может быть отправлена на модерацию
    if (story.status !== 'REJECTED' && story.status !== 'APPROVED') {
      return NextResponse.json(
        { success: false, error: 'История уже на модерации' },
        { status: 400 }
      );
    }

    // Обновляем статус
    await prisma.story.update({
      where: { id: story.id },
      data: {
        status: 'ON_MODERATION',
        rejectionReason: null,
      },
    });

    // Логируем
    await prisma.activityLog.create({
      data: {
        action: 'STORY_RESUBMITTED',
        storyId: story.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка отправки на модерацию:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}
