// Утилита для работы с S3-совместимым хранилищем (Yandex Object Storage)
// Загрузка, удаление и получение URL файлов

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Конфигурация S3 клиента
const s3Config = {
  endpoint: process.env.S3_ENDPOINT || 'https://storage.yandexcloud.net',
  region: process.env.S3_REGION || 'ru-central1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || '',
    secretAccessKey: process.env.S3_SECRET_KEY || '',
  },
};

const BUCKET_NAME = process.env.S3_BUCKET || 'sled-na-zemle-uploads';

// Создаём S3 клиент
let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client(s3Config);
  }
  return s3Client;
}

/**
 * Проверяет, настроен ли S3
 */
export function isS3Configured(): boolean {
  return !!(process.env.S3_ACCESS_KEY && process.env.S3_SECRET_KEY);
}

/**
 * Генерирует уникальное имя файла
 */
function generateFileName(originalName: string, prefix: string = ''): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  return `${prefix}${timestamp}-${random}.${extension}`;
}

/**
 * Загружает файл в S3
 * @param file - Буфер файла
 * @param originalName - Оригинальное имя файла
 * @param folder - Папка в бакете
 * @param contentType - MIME тип
 */
export async function uploadToS3(
  file: Buffer,
  originalName: string,
  folder: string = 'images',
  contentType: string = 'image/jpeg'
): Promise<{ success: boolean; url?: string; key?: string; error?: string }> {
  if (!isS3Configured()) {
    console.warn('S3 not configured, using placeholder URL');
    return {
      success: true,
      url: `https://placeholder.com/${folder}/${originalName}`,
      key: `${folder}/${originalName}`,
    };
  }

  try {
    const client = getS3Client();
    const key = `${folder}/${generateFileName(originalName)}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
      ACL: 'public-read',
    });

    await client.send(command);

    // Формируем публичный URL
    const url = `${s3Config.endpoint}/${BUCKET_NAME}/${key}`;

    return { success: true, url, key };
  } catch (error) {
    console.error('S3 upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Удаляет файл из S3
 * @param key - Ключ файла в бакете
 */
export async function deleteFromS3(key: string): Promise<boolean> {
  if (!isS3Configured()) {
    console.warn('S3 not configured');
    return true;
  }

  try {
    const client = getS3Client();

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await client.send(command);
    return true;
  } catch (error) {
    console.error('S3 delete error:', error);
    return false;
  }
}

/**
 * Получает публичный URL файла
 */
export function getPublicUrl(key: string): string {
  return `${s3Config.endpoint}/${BUCKET_NAME}/${key}`;
}
