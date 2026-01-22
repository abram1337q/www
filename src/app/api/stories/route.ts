// API для работы с историями
// GET - получение списка опубликованных историй
// POST - создание новой истории

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { generateCabinetToken } from '@/lib/auth/tokens';
import { createPayment } from '@/lib/payment/yookassa';
import { STORY_CATEGORIES, type StoryCategoryId } from '@/types';
import { applyRateLimit } from '@/lib/security/withRateLimit';
import { RATE_LIMITS } from '@/lib/security/rateLimit';

// Получение списка опубликованных историй для карты
export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimitError = applyRateLimit(request, {
    config: RATE_LIMITS.api,
    endpoint: 'stories:get',
  });
  if (rateLimitError) return rateLimitError;
  try {
    const stories = await prisma.story.findMany({
      where: {
        status: 'APPROVED',
        deletedAt: null,
      },
      select: {
        id: true,
        latitude: true,
        longitude: true,
        category: true,
        authorName: true,
        heartsCount: true,
        content: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Преобразуем для карты
    const mapStories = stories.map(story => ({
      id: story.id,
      latitude: story.latitude,
      longitude: story.longitude,
      category: story.category as StoryCategoryId,
      authorName: story.authorName,
      heartsCount: story.heartsCount,
      previewText: story.content.replace(/<[^>]*>/g, '').slice(0, 100),
    }));

    return NextResponse.json({
      success: true,
      stories: mapStories,
    });
  } catch (error) {
    console.error('Ошибка получения историй:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера', stories: [] },
      { status: 200 }
    );
  }
}

// Создание новой истории
export async function POST(request: NextRequest) {
  // Rate limiting (более строгий для создания)
  const rateLimitError = applyRateLimit(request, {
    config: RATE_LIMITS.createStory,
    endpoint: 'stories:create',
  });
  if (rateLimitError) return rateLimitError;

  try {
    const formData = await request.formData();

    const authorName = formData.get('authorName') as string || 'Аноним';
    const authorBirthDate = formData.get('authorBirthDate') as string;
    const authorBio = formData.get('authorBio') as string;
    const category = formData.get('category') as StoryCategoryId;
    const content = formData.get('content') as string;
    const email = formData.get('email') as string;
    const latitude = parseFloat(formData.get('latitude') as string);
    const longitude = parseFloat(formData.get('longitude') as string);

    // Валидация
    if (!content || !category || !email || !latitude || !longitude) {
      return NextResponse.json(
        { success: false, error: 'Заполните все обязательные поля' },
        { status: 400 }
      );
    }

    if (!STORY_CATEGORIES[category]) {
      return NextResponse.json(
        { success: false, error: 'Неверная категория' },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Неверный формат email' },
        { status: 400 }
      );
    }

    const cabinetToken = generateCabinetToken();

    const story = await prisma.story.create({
      data: {
        authorName,
        authorBirthDate: authorBirthDate ? new Date(authorBirthDate) : null,
        authorBio: authorBio || null,
        category,
        content,
        email,
        latitude,
        longitude,
        cabinetToken,
        status: 'PENDING_PAYMENT',
      },
    });

    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const paymentResult = await createPayment({
      storyId: story.id,
      email,
      returnUrl: `${appUrl}/payment/success?story=${story.id}`,
      description: `Публикация истории на сервисе "История моей жизни"`,
    });

    if (!paymentResult.success || !paymentResult.confirmationUrl) {
      await prisma.story.delete({ where: { id: story.id } });
      return NextResponse.json(
        { success: false, error: paymentResult.error || 'Ошибка создания платежа' },
        { status: 500 }
      );
    }

    await prisma.payment.create({
      data: {
        storyId: story.id,
        yookassaId: paymentResult.paymentId,
        payerIp: ip,
        payerEmail: email,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: 'STORY_CREATED',
        storyId: story.id,
        ipAddress: ip,
        details: JSON.stringify({ email, category }),
      },
    });

    return NextResponse.json({
      success: true,
      storyId: story.id,
      paymentUrl: paymentResult.confirmationUrl,
    });
  } catch (error) {
    console.error('Ошибка создания истории:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}
