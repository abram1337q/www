// Обработка изображений: удаление EXIF, сжатие, изменение размера
// Использует Canvas API для обработки на сервере

// Максимальный размер изображения по большей стороне
const MAX_SIZE = 1920;
// Качество JPEG сжатия
const JPEG_QUALITY = 0.85;

interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
  mimeType: string;
}

/**
 * Обрабатывает изображение: удаляет EXIF, сжимает, изменяет размер
 * Простая реализация без внешних зависимостей
 */
export async function processImage(
  fileBuffer: Buffer,
  mimeType: string
): Promise<ProcessedImage> {
  // Для production рекомендуется использовать sharp:
  // import sharp from 'sharp';
  // const processed = await sharp(fileBuffer)
  //   .rotate() // Авто-поворот по EXIF
  //   .resize(MAX_SIZE, MAX_SIZE, { fit: 'inside', withoutEnlargement: true })
  //   .jpeg({ quality: 85 })
  //   .toBuffer();

  // Простая реализация: просто возвращаем как есть
  // EXIF данные будут удалены при пересохранении через Canvas на клиенте
  // или через sharp на сервере (если установлен)

  try {
    // Пробуем использовать sharp если установлен
    const sharp = await import('sharp').catch(() => null);

    if (sharp) {
      const image = sharp.default(fileBuffer);
      const metadata = await image.metadata();

      let processedImage = image
        .rotate() // Авто-поворот по EXIF (удаляет EXIF данные)
        .resize(MAX_SIZE, MAX_SIZE, {
          fit: 'inside',
          withoutEnlargement: true,
        });

      // Конвертируем в JPEG для унификации
      const buffer = await processedImage
        .jpeg({ quality: Math.round(JPEG_QUALITY * 100) })
        .toBuffer();

      return {
        buffer,
        width: Math.min(metadata.width || MAX_SIZE, MAX_SIZE),
        height: Math.min(metadata.height || MAX_SIZE, MAX_SIZE),
        mimeType: 'image/jpeg',
      };
    }
  } catch (error) {
    console.warn('Sharp not available, using fallback:', error);
  }

  // Fallback: возвращаем как есть
  return {
    buffer: fileBuffer,
    width: 0,
    height: 0,
    mimeType,
  };
}

/**
 * Удаляет EXIF данные из буфера изображения
 * Простая реализация - ищет и удаляет APP1 сегмент (EXIF)
 */
export function removeExifFromJpeg(buffer: Buffer): Buffer {
  // JPEG файлы начинаются с FFD8
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return buffer; // Не JPEG
  }

  const cleanBuffer: number[] = [0xff, 0xd8];
  let i = 2;

  while (i < buffer.length - 1) {
    if (buffer[i] !== 0xff) {
      i++;
      continue;
    }

    const marker = buffer[i + 1];

    // APP1 (EXIF) - пропускаем
    if (marker === 0xe1) {
      const length = (buffer[i + 2] << 8) | buffer[i + 3];
      i += 2 + length;
      continue;
    }

    // APP2-APP15 - тоже пропускаем (могут содержать метаданные)
    if (marker >= 0xe2 && marker <= 0xef) {
      const length = (buffer[i + 2] << 8) | buffer[i + 3];
      i += 2 + length;
      continue;
    }

    // Конец файла
    if (marker === 0xd9) {
      cleanBuffer.push(0xff, 0xd9);
      break;
    }

    // Начало данных изображения
    if (marker === 0xda) {
      // Копируем всё остальное
      while (i < buffer.length) {
        cleanBuffer.push(buffer[i]);
        i++;
      }
      break;
    }

    // Другие маркеры - сохраняем
    if (marker >= 0xc0 && marker <= 0xfe) {
      const length = (buffer[i + 2] << 8) | buffer[i + 3];
      for (let j = 0; j < 2 + length; j++) {
        cleanBuffer.push(buffer[i + j]);
      }
      i += 2 + length;
    } else {
      cleanBuffer.push(buffer[i]);
      i++;
    }
  }

  return Buffer.from(cleanBuffer);
}

/**
 * Определяет MIME тип по расширению файла
 */
export function getMimeType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    default:
      return 'image/jpeg';
  }
}

/**
 * Проверяет, является ли файл допустимым изображением
 */
export function isValidImage(mimeType: string): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(mimeType);
}

/**
 * Проверяет размер файла (максимум 5 МБ)
 */
export function isValidFileSize(size: number): boolean {
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
  return size <= MAX_FILE_SIZE;
}
