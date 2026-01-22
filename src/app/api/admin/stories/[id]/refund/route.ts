import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { refundPayment } from '@/lib/payment/yookassa';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// POST /api/admin/stories/[id]/refund - возврат платежа
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Проверяем авторизацию админа
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Не авторизован' },
        { status: 401 }
      );
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET || 'secret');
    } catch {
      return NextResponse.json(
        { success: false, error: 'Неверный токен' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Находим историю и связанный платёж
    const story = await prisma.story.findUnique({
      where: { id },
      include: {
        payment: true,
      },
    });

    if (!story) {
      return NextResponse.json(
        { success: false, error: 'История не найдена' },
        { status: 404 }
      );
    }

    const payment = story.payment;
    if (!payment || payment.status !== 'SUCCEEDED') {
      return NextResponse.json(
        { success: false, error: 'Платёж не найден' },
        { status: 404 }
      );
    }

    // Выполняем возврат через ЮKassa
    if (!payment.yookassaId) {
      return NextResponse.json(
        { success: false, error: 'ID платежа ЮKassa не найден' },
        { status: 400 }
      );
    }
    const refundResult = await refundPayment(payment.yookassaId);

    if (!refundResult.success) {
      return NextResponse.json(
        { success: false, error: refundResult.error || 'Ошибка возврата' },
        { status: 400 }
      );
    }

    // Обновляем статус платежа
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'REFUNDED' },
    });

    // Логируем действие
    await prisma.activityLog.create({
      data: {
        action: 'REFUND_PAYMENT',
        entityType: 'STORY',
        entityId: id,
        details: `Возврат платежа ${payment.paymentId} на сумму ${payment.amount / 100} руб.`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Возврат выполнен успешно',
    });
  } catch (error) {
    console.error('Refund error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}
