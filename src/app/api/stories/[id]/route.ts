// API для работы с конкретной историей
// GET - получение полной информации об истории

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const story = await prisma.story.findFirst({
      where: {
        id,
        status: 'APPROVED',
        deletedAt: null,
      },
      include: {
        images: {
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!story) {
      return NextResponse.json(
        { success: false, error: 'История не найдена' },
        { status: 404 }
      );
    }

    // Убираем приватные данные
    const publicStory = {
      id: story.id,
      authorName: story.authorName,
      authorBirthDate: story.authorBirthDate,
      authorBio: story.authorBio,
      authorPhotoUrl: story.authorPhotoUrl,
      category: story.category,
      title: story.title,
      content: story.content,
      latitude: story.latitude,
      longitude: story.longitude,
      regionName: story.regionName,
      settlementName: story.settlementName,
      heartsCount: story.heartsCount,
      images: story.images,
      createdAt: story.createdAt,
    };

    return NextResponse.json({
      success: true,
      story: publicStory,
    });
  } catch (error) {
    console.error('Ошибка получения истории:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}
