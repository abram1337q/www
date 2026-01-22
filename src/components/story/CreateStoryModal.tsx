'use client';

// Модальное окно создания новой истории
// Включает форму с полями автора, категорией, текстом и загрузкой фото

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, Image as ImageIcon, Calendar, User, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { STORY_CATEGORIES, type StoryCategoryId } from '@/types';
import { RichTextEditor } from './RichTextEditor';
import { LegalAgreementModal } from './LegalAgreementModal';

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  coordinates: { lng: number; lat: number } | null;
  onSubmit: (data: CreateStoryFormData) => Promise<void>;
}

export interface CreateStoryFormData {
  authorName: string;
  authorBirthDate: string;
  authorBio: string;
  authorPhoto: File | null;
  category: StoryCategoryId;
  title: string;
  content: string;
  email: string;
  latitude: number;
  longitude: number;
  regionId: string;
  regionName: string;
  settlementName: string;
  address: string;
  images: File[];
}

export function CreateStoryModal({
  isOpen,
  onClose,
  coordinates,
  onSubmit
}: CreateStoryModalProps) {
  // Состояние формы
  const [formData, setFormData] = useState<CreateStoryFormData>({
    authorName: '',
    authorBirthDate: '',
    authorBio: '',
    authorPhoto: null,
    category: '' as StoryCategoryId,
    title: '',
    content: '',
    email: '',
    latitude: coordinates?.lat || 0,
    longitude: coordinates?.lng || 0,
    regionId: '',
    regionName: '',
    settlementName: '',
    address: '',
    images: [],
  });

  const [locationLoading, setLocationLoading] = useState(false);
  const [locationName, setLocationName] = useState<string>('');

  // Загрузка информации о местоположении при открытии
  useEffect(() => {
    if (coordinates && isOpen) {
      setLocationLoading(true);
      setFormData(prev => ({
        ...prev,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
      }));

      fetch(`/api/geocode?lat=${coordinates.lat}&lng=${coordinates.lng}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            const { regionId, regionName, settlementName, address } = data.data;
            setFormData(prev => ({
              ...prev,
              regionId: regionId || '',
              regionName: regionName || '',
              settlementName: settlementName || '',
              address: address || '',
            }));

            // Формируем название места - используем address для более точного адреса
            const parts = [address, settlementName, regionName].filter(Boolean);
            // Убираем дубликаты (адрес может содержать город/регион)
            const uniqueParts: string[] = [];
            for (const part of parts) {
              if (!uniqueParts.some(p => part.includes(p) || p.includes(part))) {
                uniqueParts.push(part);
              }
            }
            setLocationName(uniqueParts.join(', ') || 'Россия');
          }
        })
        .catch(err => {
          console.error('Geocoding error:', err);
          setLocationName('Россия');
        })
        .finally(() => setLocationLoading(false));
    }
  }, [coordinates, isOpen]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [authorPhotoPreview, setAuthorPhotoPreview] = useState<string | null>(null);

  // Валидация формы
  const isFormValid =
    formData.content.trim().length > 0 &&
    formData.category &&
    formData.email.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

  // Обработка загрузки фото автора
  const onDropAuthorPhoto = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFormData(prev => ({ ...prev, authorPhoto: file }));
      setAuthorPhotoPreview(URL.createObjectURL(file));
    }
  }, []);

  const { getRootProps: getAuthorPhotoRootProps, getInputProps: getAuthorPhotoInputProps } = useDropzone({
    onDrop: onDropAuthorPhoto,
    accept: { 'image/jpeg': [], 'image/png': [] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5 МБ
  });

  // Обработка загрузки изображений в текст
  const onDropImages = useCallback((acceptedFiles: File[]) => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...acceptedFiles].slice(0, 10), // Максимум 10 изображений
    }));
  }, []);

  const { getRootProps: getImagesRootProps, getInputProps: getImagesInputProps } = useDropzone({
    onDrop: onDropImages,
    accept: { 'image/jpeg': [], 'image/png': [] },
    maxFiles: 10,
    maxSize: 5 * 1024 * 1024,
  });

  // Обработка отправки формы
  const handleSubmit = () => {
    if (!isFormValid) return;
    setShowLegalModal(true);
  };

  // Подтверждение после принятия условий
  const handleLegalAccepted = async () => {
    setShowLegalModal(false);
    setIsSubmitting(true);

    try {
      await onSubmit({
        ...formData,
        latitude: coordinates?.lat || 0,
        longitude: coordinates?.lng || 0,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Удаление фото автора
  const removeAuthorPhoto = () => {
    setFormData(prev => ({ ...prev, authorPhoto: null }));
    if (authorPhotoPreview) {
      URL.revokeObjectURL(authorPhotoPreview);
      setAuthorPhotoPreview(null);
    }
  };

  // Удаление изображения из списка
  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-zinc-900">
              Расскажите свою историю
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Местоположение */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-amber-600 font-medium uppercase tracking-wide">Местоположение</div>
                  {locationLoading ? (
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Определение...</span>
                    </div>
                  ) : (
                    <div className="text-sm font-medium text-zinc-800 truncate">
                      {locationName || 'Россия'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Блок 1: Информация об авторе */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-zinc-800 flex items-center gap-2">
                <User className="w-5 h-5" />
                Информация об авторе
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Имя */}
                <div className="space-y-2">
                  <Label htmlFor="authorName">Ваше имя</Label>
                  <Input
                    id="authorName"
                    placeholder="Аноним"
                    maxLength={50}
                    value={formData.authorName}
                    onChange={(e) => setFormData(prev => ({ ...prev, authorName: e.target.value }))}
                  />
                </div>

                {/* Дата рождения */}
                <div className="space-y-2">
                  <Label htmlFor="birthDate" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Дата рождения
                  </Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.authorBirthDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, authorBirthDate: e.target.value }))}
                  />
                </div>
              </div>

              {/* Краткая биография */}
              <div className="space-y-2">
                <Label htmlFor="bio">
                  Краткая биография
                  <span className="text-zinc-400 ml-2">
                    {formData.authorBio.length}/200
                  </span>
                </Label>
                <Textarea
                  id="bio"
                  placeholder="Расскажите немного о себе..."
                  maxLength={200}
                  rows={2}
                  value={formData.authorBio}
                  onChange={(e) => setFormData(prev => ({ ...prev, authorBio: e.target.value }))}
                />
              </div>

              {/* Фото автора */}
              <div className="space-y-2">
                <Label>Фото автора</Label>
                {authorPhotoPreview ? (
                  <div className="relative inline-block">
                    <img
                      src={authorPhotoPreview}
                      alt="Фото автора"
                      className="w-24 h-24 rounded-full object-cover border-2 border-zinc-200"
                    />
                    <button
                      type="button"
                      onClick={removeAuthorPhoto}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    {...getAuthorPhotoRootProps()}
                    className="border-2 border-dashed border-zinc-300 rounded-lg p-4 text-center cursor-pointer hover:border-zinc-400 transition-colors"
                  >
                    <input {...getAuthorPhotoInputProps()} />
                    <Upload className="w-8 h-8 mx-auto text-zinc-400 mb-2" />
                    <p className="text-sm text-zinc-500">
                      Перетащите фото или нажмите для выбора
                    </p>
                    <p className="text-xs text-zinc-400 mt-1">
                      JPG, PNG до 5 МБ
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Блок 2: Выбор категории */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-zinc-800">Категория истории</h3>

              <RadioGroup
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as StoryCategoryId }))}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
              >
                {Object.values(STORY_CATEGORIES).map((cat) => (
                  <label
                    key={cat.id}
                    className={`
                      relative flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                      ${formData.category === cat.id
                        ? 'border-amber-500 bg-amber-50 shadow-md shadow-amber-100'
                        : 'border-zinc-200 hover:border-amber-300 hover:bg-amber-50/50'
                      }
                    `}
                  >
                    <RadioGroupItem value={cat.id} id={cat.id} className="sr-only" />
                    <span className="text-2xl">{cat.emoji}</span>
                    <div>
                      <div className="font-medium text-zinc-900">{cat.label}</div>
                      <div className="text-xs text-zinc-500">{cat.description}</div>
                    </div>
                    {formData.category === cat.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </label>
                ))}
              </RadioGroup>
            </div>

            {/* Блок 3: Текст истории */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-zinc-800 mb-2">Ваша история</h3>
                <p className="text-sm text-zinc-500">
                  Расскажите свою историю: о подвиге, любви, интересной жизни, заслуге,
                  памяти о близком или просто о том, что важно для вас. Это может быть
                  короткий рассказ или целая книга — пишите от сердца.
                </p>
              </div>

              {/* Заголовок истории */}
              <div className="space-y-2">
                <Label htmlFor="title">Заголовок истории</Label>
                <Input
                  id="title"
                  placeholder="Краткое название вашей истории"
                  maxLength={100}
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="text-lg font-medium"
                />
              </div>

              <RichTextEditor
                content={formData.content}
                onChange={(content) => setFormData(prev => ({ ...prev, content }))}
              />

              {/* Загрузка изображений */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Изображения в тексте ({formData.images.length}/10)
                </Label>

                <div
                  {...getImagesRootProps()}
                  className="border-2 border-dashed border-zinc-300 rounded-lg p-4 text-center cursor-pointer hover:border-zinc-400 transition-colors"
                >
                  <input {...getImagesInputProps()} />
                  <Upload className="w-6 h-6 mx-auto text-zinc-400 mb-2" />
                  <p className="text-sm text-zinc-500">Добавить изображения</p>
                </div>

                {formData.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.images.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Изображение ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border border-zinc-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <p className="text-xs text-zinc-400">
                Вы можете редактировать или удалить историю в любой момент
              </p>
            </div>

            {/* Блок 4: Контактные данные */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-zinc-800 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Контактные данные
              </h3>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@mail.ru"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
                <p className="text-xs text-zinc-400">
                  На этот адрес придёт секретная ссылка для управления историей
                </p>
              </div>
            </div>

            {/* Кнопка публикации */}
            <div className="pt-4 border-t border-zinc-200">
              <Button
                onClick={handleSubmit}
                disabled={!isFormValid || isSubmitting}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-orange-500/25 transition-all duration-200"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Опубликовать историю
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-zinc-400 mt-3">
                Публикация истории — 990 ₽
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Модальное окно юридических документов */}
      <LegalAgreementModal
        isOpen={showLegalModal}
        onClose={() => setShowLegalModal(false)}
        onAccept={handleLegalAccepted}
      />
    </>
  );
}

export default CreateStoryModal;
