// Типы и интерфейсы для проекта "След на Земле"

// Категории историй с соответствующими эмодзи
export const STORY_CATEGORIES = {
  LOVE_FAMILY: {
    id: 'LOVE_FAMILY',
    label: 'Любовь и семья',
    emoji: '❤️',
    description: 'Истории о любви, семье, отношениях'
  },
  HEROISM: {
    id: 'HEROISM',
    label: 'Подвиг и служение',
    emoji: '🎖️',
    description: 'Истории о героизме, служении Родине'
  },
  WORK_PROFESSION: {
    id: 'WORK_PROFESSION',
    label: 'Труд и профессия',
    emoji: '🛠️',
    description: 'Истории о профессиональном пути'
  },
  LIFE_WISDOM: {
    id: 'LIFE_WISDOM',
    label: 'Жизнь и мудрость',
    emoji: '📖',
    description: 'Философские истории, жизненный опыт'
  },
  MEMORY: {
    id: 'MEMORY',
    label: 'Память',
    emoji: '🕯️',
    description: 'Мемориальные истории об умерших'
  }
} as const;

export type StoryCategoryId = keyof typeof STORY_CATEGORIES;

// Статусы историй
export const STORY_STATUSES = {
  PENDING_PAYMENT: { id: 'PENDING_PAYMENT', label: 'Ожидает оплаты', color: 'yellow' },
  ON_MODERATION: { id: 'ON_MODERATION', label: 'На модерации', color: 'blue' },
  APPROVED: { id: 'APPROVED', label: 'Опубликовано', color: 'green' },
  REJECTED: { id: 'REJECTED', label: 'Отклонено', color: 'red' },
  DELETED: { id: 'DELETED', label: 'Удалено', color: 'gray' }
} as const;

export type StoryStatusId = keyof typeof STORY_STATUSES;

// Интерфейс истории для отображения на карте
export interface StoryMapMarker {
  id: string;
  latitude: number;
  longitude: number;
  category: StoryCategoryId;
  authorName: string;
  heartsCount: number;
  previewText?: string;
  regionId?: string;
  regionName?: string;
}

// Полная информация об истории
export interface Story {
  id: string;
  authorName: string;
  authorBirthDate?: Date | null;
  authorBio?: string | null;
  authorPhotoUrl?: string | null;
  email: string;
  category: StoryCategoryId;
  title?: string | null;
  content: string;
  latitude: number;
  longitude: number;
  regionId?: string | null;
  regionName?: string | null;
  settlementName?: string | null;
  address?: string | null;
  status: StoryStatusId;
  rejectionReason?: string | null;
  heartsCount: number;
  cabinetToken: string;
  images: StoryImage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StoryImage {
  id: string;
  url: string;
  position: number;
}

// Форма создания истории
export interface CreateStoryForm {
  authorName: string;
  authorBirthDate?: string;
  authorBio?: string;
  authorPhoto?: File;
  category: StoryCategoryId;
  content: string;
  email: string;
  latitude: number;
  longitude: number;
  regionId?: string;
  regionName?: string;
  settlementName?: string;
  address?: string;
  images?: File[];
}

// Регион России
export interface Region {
  id: string;
  name: string;
  storiesCount: number;
  geometry: GeoJSON.Geometry;
  center: [number, number];
}

// Населённый пункт
export interface Settlement {
  id: string;
  name: string;
  regionId: string;
  population?: number;
  storiesCount: number;
  coordinates: [number, number];
}

// GeoJSON для карты
export interface StoryGeoJSON {
  type: 'FeatureCollection';
  features: StoryFeature[];
}

export interface StoryFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    id: string;
    category: StoryCategoryId;
    authorName: string;
    heartsCount: number;
    emoji: string;
  };
}

// Уровни детализации карты
export enum MapZoomLevel {
  COUNTRY = 1,      // Вся Россия - регионы
  REGION = 2,       // Регион - населённые пункты
  SETTLEMENT = 3    // Населённый пункт - улицы
}

// Результат платежа
export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  confirmationUrl?: string;
  error?: string;
}

// Ответ API
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Статистика для админки
export interface AdminStats {
  totalStories: number;
  pendingModeration: number;
  approvedStories: number;
  rejectedStories: number;
  totalPayments: number;
  totalRevenue: number;
}
