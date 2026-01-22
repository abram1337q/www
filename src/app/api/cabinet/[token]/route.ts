// API для личного кабинета автора
// GET - получение истории по токену
// PATCH - обновление истории
// DELETE - удаление истории

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { isValidTokenFormat } from '@/lib/auth/tokens';
import { STORY_CATEGORIES, type StoryCategoryId } from '@/types';

// Получение истории по токену
export async function GET(
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
      include: {
        images: { orderBy: { position: 'asc' } },
      },
    });

    if (!story) {
      return NextResponse.json(
        { success: false, error: 'История не найдена' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      story: {
        id: story.id,
        authorName: story.authorName,
        authorBirthDate: story.authorBirthDate,
        authorBio: story.authorBio,
        authorPhotoUrl: story.authorPhotoUrl,
        category: story.category,
        content: story.content,
        latitude: story.latitude,
        longitude: story.longitude,
        regionName: story.regionName,
        settlementName: story.settlementName,
        status: story.status,
        rejectionReason: story.rejectionReason,
        heartsCount: story.heartsCount,
        images: story.images,
        createdAt: story.createdAt,
        updatedAt: story.updatedAt,
      },
    });
  } catch (error) {
    console.error('Ошибка получения истории:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}

// Обновление истории
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();

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

    const { authorName, authorBirthDate, authorBio, category, content } = body;

    // Валидация категории
    if (category && !STORY_CATEGORIES[category as StoryCategoryId]) {
      return NextResponse.json(
        { success: false, error: 'Неверная категория' },
        { status: 400 }
      );
    }

    // Обновляем историю
    const updated = await prisma.story.update({
      where: { id: story.id },
      data: {
        authorName: authorName || story.authorName,
        authorBirthDate: authorBirthDate ? new Date(authorBirthDate) : story.authorBirthDate,
        authorBio: authorBio !== undefined ? authorBio : story.authorBio,
        category: category || story.category,
        content: content || story.content,
        updatedAt: new Date(),
      },
      include: {
        images: { orderBy: { position: 'asc' } },
      },
    });

    // Логируем
    await prisma.activityLog.create({
      data: {
        action: 'STORY_UPDATED',
        storyId: story.id,
        details: JSON.stringify({ fields: Object.keys(body) }),
      },
    });

    return NextResponse.json({
      success: true,
      story: updated,
    });
  } catch (error) {
    console.error('Ошибка обновления истории:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}

// Удаление истории
export async function DELETE(
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

    // Помечаем как удалённую (мягкое удаление)
    await prisma.story.update({
      where: { id: story.id },
      data: {
        status: 'DELETED',
        deletedAt: new Date(),
      },
    });

    // Логируем
    await prisma.activityLog.create({
      data: {
        action: 'STORY_DELETED',
        storyId: story.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка удаления истории:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}
