// Webhook для обработки уведомлений от ЮKassa
// POST - обрабатывает события платёжной системы

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { sendCabinetLink } from '@/lib/email/mailer';

// Типы событий ЮKassa
interface YooKassaWebhookEvent {
  type: string;
  event: string;
  object: {
    id: string;
    status: string;
    amount: {
      value: string;
      currency: string;
    };
    metadata?: {
      story_id?: string;
    };
    paid: boolean;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: YooKassaWebhookEvent = await request.json();

    const { event, object } = body;
    const paymentId = object.id;
    const storyId = object.metadata?.story_id;

    console.log('Webhook от ЮKassa:', { event, paymentId, storyId });

    if (!storyId) {
      console.error('Webhook без story_id');
      return NextResponse.json({ success: true });
    }

    // Находим платёж в базе
    const payment = await prisma.payment.findFirst({
      where: { yookassaId: paymentId },
      include: { story: true },
    });

    if (!payment) {
      console.error('Платёж не найден:', paymentId);
      return NextResponse.json({ success: true });
    }

    // Обрабатываем события
    if (event === 'payment.succeeded' || event === 'payment.waiting_for_capture') {
      // Платёж успешен
      await prisma.$transaction([
        // Обновляем статус платежа
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'succeeded',
            paidAt: new Date(),
          },
        }),
        // Переводим историю на модерацию
        prisma.story.update({
          where: { id: storyId },
          data: { status: 'ON_MODERATION' },
        }),
        // Логируем
        prisma.activityLog.create({
          data: {
            action: 'PAYMENT_SUCCEEDED',
            storyId,
            details: JSON.stringify({ paymentId, amount: object.amount.value }),
          },
        }),
      ]);

      // Отправляем email с секретной ссылкой
      if (payment.story) {
        await sendCabinetLink(
          payment.story.email,
          payment.story.cabinetToken,
          payment.story.authorName
        );
      }

      console.log('Платёж обработан успешно:', paymentId);
    }

    if (event === 'payment.canceled') {
      // Платёж отменён
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'canceled' },
        }),
        prisma.activityLog.create({
          data: {
            action: 'PAYMENT_CANCELED',
            storyId,
            details: JSON.stringify({ paymentId }),
          },
        }),
      ]);

      console.log('Платёж отменён:', paymentId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка обработки webhook:', error);
    // Возвращаем 200, чтобы ЮKassa не повторяла запрос
    return NextResponse.json({ success: false });
  }
}
