// API для добавления "сердечка" к истории
// POST - увеличивает счётчик на 1

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Проверяем существование истории
    const story = await prisma.story.findFirst({
      where: {
        id,
        status: 'APPROVED',
        deletedAt: null,
      },
    });

    if (!story) {
      return NextResponse.json(
        { success: false, error: 'История не найдена' },
        { status: 404 }
      );
    }

    // Увеличиваем счётчик
    const updated = await prisma.story.update({
      where: { id },
      data: {
        heartsCount: { increment: 1 },
      },
    });

    return NextResponse.json({
      success: true,
      heartsCount: updated.heartsCount,
    });
  } catch (error) {
    console.error('Ошибка добавления сердечка:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}
