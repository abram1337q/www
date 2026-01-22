// Rate limiting для защиты API от злоупотреблений
// Простая реализация на основе Map (для production лучше использовать Redis)

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Хранилище для rate limiting (в памяти)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Очистка устаревших записей каждые 5 минут
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

interface RateLimitConfig {
  windowMs: number;  // Окно времени в миллисекундах
  maxRequests: number;  // Максимум запросов за окно
}

// Предустановленные лимиты для разных типов запросов
export const RATE_LIMITS = {
  // Общие API запросы
  api: { windowMs: 60 * 1000, maxRequests: 100 },
  // Создание историй (более строгий)
  createStory: { windowMs: 60 * 60 * 1000, maxRequests: 5 },
  // Отправка сердечек
  heart: { windowMs: 60 * 1000, maxRequests: 30 },
  // Авторизация админа
  adminAuth: { windowMs: 15 * 60 * 1000, maxRequests: 10 },
  // Геокодирование
  geocode: { windowMs: 60 * 1000, maxRequests: 60 },
} as const;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * Проверяет rate limit для указанного ключа
 * @param key - Уникальный ключ (обычно IP + endpoint)
 * @param config - Конфигурация лимита
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // Если записи нет или она устарела, создаём новую
  if (!entry || entry.resetTime < now) {
    const resetTime = now + config.windowMs;
    rateLimitStore.set(key, { count: 1, resetTime });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime,
    };
  }

  // Увеличиваем счётчик
  entry.count++;

  // Проверяем лимит
  if (entry.count > config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter: Math.ceil((entry.resetTime - now) / 1000),
    };
  }

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Получает IP адрес из заголовков запроса
 */
export function getClientIP(headers: Headers): string {
  // Проверяем различные заголовки прокси
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  return 'unknown';
}

/**
 * Создаёт ключ для rate limiting
 */
export function createRateLimitKey(ip: string, endpoint: string): string {
  return `${ip}:${endpoint}`;
}
