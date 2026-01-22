// Хелпер для применения rate limiting к API routes
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIP, createRateLimitKey } from './rateLimit';

interface RateLimitOptions {
  config: { windowMs: number; maxRequests: number };
  endpoint: string;
}

/**
 * Применяет rate limiting к запросу
 * Возвращает null если запрос разрешён, или NextResponse с ошибкой
 */
export function applyRateLimit(
  request: NextRequest,
  options: RateLimitOptions
): NextResponse | null {
  const ip = getClientIP(request.headers);
  const key = createRateLimitKey(ip, options.endpoint);
  const result = checkRateLimit(key, options.config);

  if (!result.allowed) {
    return NextResponse.json(
      {
        error: 'Too many requests',
        message: 'Слишком много запросов. Пожалуйста, подождите.',
        retryAfter: result.retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(result.retryAfter || 60),
          'X-RateLimit-Limit': String(options.config.maxRequests),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(result.resetTime),
        },
      }
    );
  }

  return null;
}

/**
 * Добавляет заголовки rate limit к ответу
 */
export function addRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult,
  maxRequests: number
): NextResponse {
  response.headers.set('X-RateLimit-Limit', String(maxRequests));
  response.headers.set('X-RateLimit-Remaining', String(result.remaining));
  response.headers.set('X-RateLimit-Reset', String(result.resetTime));
  return response;
}
