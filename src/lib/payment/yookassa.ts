// Интеграция с платёжной системой ЮKassa
// Документация: https://yookassa.ru/developers

import { v4 as uuidv4 } from 'uuid';

// Типы для ЮKassa API
interface YooKassaPayment {
  id: string;
  status: 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled';
  amount: {
    value: string;
    currency: string;
  };
  confirmation?: {
    type: string;
    confirmation_url?: string;
  };
  created_at: string;
  description?: string;
  metadata?: Record<string, string>;
}

interface CreatePaymentParams {
  storyId: string;
  email: string;
  returnUrl: string;
  description?: string;
}

interface PaymentResult {
  success: boolean;
  paymentId?: string;
  confirmationUrl?: string;
  error?: string;
}

// Базовый URL API ЮKassa
const YOOKASSA_API_URL = 'https://api.yookassa.ru/v3';

// Получение заголовков авторизации
function getAuthHeaders(): HeadersInit {
  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secretKey = process.env.YOOKASSA_SECRET_KEY;

  if (!shopId || !secretKey) {
    throw new Error('Не настроены учётные данные ЮKassa');
  }

  const credentials = Buffer.from(`${shopId}:${secretKey}`).toString('base64');

  return {
    'Authorization': `Basic ${credentials}`,
    'Content-Type': 'application/json',
    'Idempotence-Key': uuidv4(), // Уникальный ключ для идемпотентности
  };
}

// Создание платежа
export async function createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
  const { storyId, email, returnUrl, description } = params;
  const amount = process.env.PAYMENT_AMOUNT || '990';

  try {
    const response = await fetch(`${YOOKASSA_API_URL}/payments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        amount: {
          value: amount,
          currency: 'RUB',
        },
        confirmation: {
          type: 'redirect',
          return_url: returnUrl,
        },
        capture: true, // Автоматическое подтверждение платежа
        description: description || 'Публикация истории на сервисе "История моей жизни"',
        metadata: {
          story_id: storyId,
        },
        receipt: {
          customer: {
            email: email,
          },
          items: [
            {
              description: 'Публикация истории на карте',
              quantity: '1',
              amount: {
                value: amount,
                currency: 'RUB',
              },
              vat_code: 1, // Без НДС
              payment_mode: 'full_payment',
              payment_subject: 'service',
            },
          ],
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Ошибка ЮKassa:', errorData);
      return {
        success: false,
        error: errorData.description || 'Ошибка создания платежа',
      };
    }

    const payment: YooKassaPayment = await response.json();

    return {
      success: true,
      paymentId: payment.id,
      confirmationUrl: payment.confirmation?.confirmation_url,
    };
  } catch (error) {
    console.error('Ошибка при создании платежа:', error);
    return {
      success: false,
      error: 'Не удалось создать платёж. Попробуйте позже.',
    };
  }
}

// Получение информации о платеже
export async function getPayment(paymentId: string): Promise<YooKassaPayment | null> {
  try {
    const response = await fetch(`${YOOKASSA_API_URL}/payments/${paymentId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка получения платежа:', error);
    return null;
  }
}

// Проверка статуса платежа
export async function checkPaymentStatus(paymentId: string): Promise<{
  status: 'pending' | 'succeeded' | 'canceled' | 'unknown';
  storyId?: string;
}> {
  const payment = await getPayment(paymentId);

  if (!payment) {
    return { status: 'unknown' };
  }

  return {
    status: payment.status === 'waiting_for_capture' ? 'succeeded' : payment.status,
    storyId: payment.metadata?.story_id,
  };
}

// Обработка webhook от ЮKassa
export async function handleWebhook(body: unknown): Promise<{
  success: boolean;
  storyId?: string;
  status?: string;
}> {
  try {
    const data = body as {
      event: string;
      object: YooKassaPayment;
    };

    const { event, object: payment } = data;

    // Проверяем тип события
    if (event === 'payment.succeeded' || event === 'payment.waiting_for_capture') {
      return {
        success: true,
        storyId: payment.metadata?.story_id,
        status: 'succeeded',
      };
    }

    if (event === 'payment.canceled') {
      return {
        success: true,
        storyId: payment.metadata?.story_id,
        status: 'canceled',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Ошибка обработки webhook:', error);
    return { success: false };
  }
}

// Возврат платежа (для администратора)
export async function refundPayment(
  paymentId: string,
  amount?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const payment = await getPayment(paymentId);

    if (!payment || payment.status !== 'succeeded') {
      return { success: false, error: 'Платёж не найден или не может быть возвращён' };
    }

    const refundAmount = amount || payment.amount.value;

    const response = await fetch(`${YOOKASSA_API_URL}/refunds`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        payment_id: paymentId,
        amount: {
          value: refundAmount,
          currency: payment.amount.currency,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.description };
    }

    return { success: true };
  } catch (error) {
    console.error('Ошибка возврата платежа:', error);
    return { success: false, error: 'Не удалось выполнить возврат' };
  }
}
