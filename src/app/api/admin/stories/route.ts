// API получения списка историй для модерации

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/db/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';

export async function GET(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Не авторизован' },
        { status: 401 }
      );
    }

    try {
      jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Не авторизован' },
        { status: 401 }
      );
    }

    // Получаем параметры
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Формируем фильтр
    const where: Record<string, unknown> = { deletedAt: null };
    if (status) {
      where.status = status;
    }

    // Получаем истории
    const stories = await prisma.story.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        images: { orderBy: { position: 'asc' } },
      },
    });

    return NextResponse.json({
      success: true,
      stories,
    });
  } catch (error) {
    console.error('Ошибка получения историй:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}
