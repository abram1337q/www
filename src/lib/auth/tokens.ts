// Утилиты для генерации криптографически стойких токенов
// Используется для создания секретных ссылок личного кабинета

import CryptoJS from 'crypto-js';

// Генерация случайного токена заданной длины
export function generateSecureToken(length: number = 64): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  // Используем криптографически стойкий генератор
  const randomValues = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randomValues);
  } else {
    // Fallback для серверной среды
    for (let i = 0; i < length; i++) {
      randomValues[i] = Math.floor(Math.random() * 256);
    }
  }

  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }

  return result;
}

// Генерация токена для личного кабинета
export function generateCabinetToken(): string {
  const timestamp = Date.now().toString(36);
  const random = generateSecureToken(52);
  return `${timestamp}${random}`.slice(0, 64);
}

// Хеширование токена для безопасного хранения (если нужно)
export function hashToken(token: string): string {
  const salt = process.env.CABINET_TOKEN_SALT || 'default-salt';
  return CryptoJS.SHA256(token + salt).toString();
}

// Валидация формата токена
export function isValidTokenFormat(token: string): boolean {
  // Токен должен быть 64 символа, только буквы и цифры
  return /^[A-Za-z0-9]{64}$/.test(token);
}
