// API статистики для административной панели

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/db/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';

export async function GET() {
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

    // Получаем статистику
    const [
      totalStories,
      pendingModeration,
      approvedStories,
      rejectedStories,
      totalPayments,
      payments,
    ] = await Promise.all([
      prisma.story.count({ where: { deletedAt: null } }),
      prisma.story.count({ where: { status: 'ON_MODERATION', deletedAt: null } }),
      prisma.story.count({ where: { status: 'APPROVED', deletedAt: null } }),
      prisma.story.count({ where: { status: 'REJECTED', deletedAt: null } }),
      prisma.payment.count({ where: { status: 'succeeded' } }),
      prisma.payment.findMany({
        where: { status: 'succeeded' },
        select: { amount: true },
      }),
    ]);

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    return NextResponse.json({
      success: true,
      stats: {
        totalStories,
        pendingModeration,
        approvedStories,
        rejectedStories,
        totalPayments,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}
