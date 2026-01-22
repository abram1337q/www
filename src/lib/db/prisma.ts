// Клиент базы данных Prisma
// Используем singleton паттерн для избежания множественных подключений
// Настроен для работы с Neon serverless PostgreSQL

import { PrismaClient } from '@prisma/client';

// Расширяем глобальный объект для хранения клиента
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Создаём или используем существующий клиент
// Для Neon: используем connection pooling и настройки для serverless
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// В режиме разработки сохраняем клиент в глобальном объекте
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
