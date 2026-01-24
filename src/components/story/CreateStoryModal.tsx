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
        <DialogContent className="max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto bg-white p-0">
          {/* Header с градиентом */}
          <div className="sticky top-0 z-10 bg-gradient-to-b from-white via-white to-white/95 backdrop-blur-sm px-5 sm:px-8 pt-6 pb-4 border-b border-zinc-100">
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl font-bold text-zinc-900 pr-8">
                Расскажите свою историю
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="space-y-6 sm:space-y-8 px-5 sm:px-8 py-6">
            {/* Местоположение */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 sm:p-5 border border-amber-100/80 shadow-sm">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-200/50">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-amber-600/80 font-semibold uppercase tracking-wider">Местоположение</div>
                  {locationLoading ? (
                    <div className="flex items-center gap-2 text-zinc-500 mt-1">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Определение...</span>
                    </div>
                  ) : (
                    <div className="text-sm sm:text-base font-medium text-zinc-800 truncate mt-0.5">
                      {locationName || 'Россия'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Блок 1: Информация об авторе */}
            <div className="space-y-4 sm:space-y-5">
              <h3 className="text-base sm:text-lg font-semibold text-zinc-800 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-zinc-600" />
                </div>
                Информация об авторе
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Имя */}
                <div className="space-y-2">
                  <Label htmlFor="authorName" className="text-sm font-medium text-zinc-700">Ваше имя</Label>
                  <Input
                    id="authorName"
                    placeholder="Аноним"
                    maxLength={50}
                    value={formData.authorName}
                    onChange={(e) => setFormData(prev => ({ ...prev, authorName: e.target.value }))}
                    className="h-11 sm:h-12 rounded-xl border-zinc-200 focus:border-amber-400 focus:ring-amber-400/20 transition-all"
                  />
                </div>

                {/* Дата рождения */}
                <div className="space-y-2">
                  <Label htmlFor="birthDate" className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                    <Calendar className="w-4 h-4 text-zinc-500" />
                    Дата рождения
                  </Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.authorBirthDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, authorBirthDate: e.target.value }))}
                    className="h-11 sm:h-12 rounded-xl border-zinc-200 focus:border-amber-400 focus:ring-amber-400/20 transition-all"
                  />
                </div>
              </div>

              {/* Краткая биография */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-medium text-zinc-700">
                  Краткая биография
                  <span className="text-zinc-400 ml-2 font-normal">
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
                  className="rounded-xl border-zinc-200 focus:border-amber-400 focus:ring-amber-400/20 resize-none transition-all"
                />
              </div>

              {/* Фото автора */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-zinc-700">Фото автора</Label>
                {authorPhotoPreview ? (
                  <div className="relative inline-block">
                    <img
                      src={authorPhotoPreview}
                      alt="Фото автора"
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-zinc-200 shadow-md"
                    />
                    <button
                      type="button"
                      onClick={removeAuthorPhoto}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-all shadow-lg hover:scale-110"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div
                    {...getAuthorPhotoRootProps()}
                    className="border-2 border-dashed border-zinc-200 rounded-2xl p-5 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 transition-all group"
                  >
                    <input {...getAuthorPhotoInputProps()} />
                    <div className="w-12 h-12 mx-auto bg-zinc-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-amber-100 transition-colors">
                      <Upload className="w-6 h-6 text-zinc-400 group-hover:text-amber-600 transition-colors" />
                    </div>
                    <p className="text-sm text-zinc-600 font-medium">
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
            <div className="space-y-4 sm:space-y-5">
              <h3 className="text-base sm:text-lg font-semibold text-zinc-800">Категория истории</h3>

              <RadioGroup
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as StoryCategoryId }))}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
              >
                {Object.values(STORY_CATEGORIES).map((cat) => (
                  <label
                    key={cat.id}
                    className={`
                      relative flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200
                      ${formData.category === cat.id
                        ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg shadow-amber-100/50 scale-[1.02]'
                        : 'border-zinc-200 hover:border-amber-300 hover:bg-amber-50/30 hover:shadow-md'
                      }
                    `}
                  >
                    <RadioGroupItem value={cat.id} id={cat.id} className="sr-only" />
                    <span className="text-2xl">{cat.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-zinc-900 text-sm sm:text-base">{cat.label}</div>
                      <div className="text-xs text-zinc-500 truncate">{cat.description}</div>
                    </div>
                    {formData.category === cat.id && (
                      <div className="absolute top-2.5 right-2.5 w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </label>
                ))}
              </RadioGroup>
            </div>

            {/* Блок 3: Текст истории */}
            <div className="space-y-4 sm:space-y-5">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-zinc-800 mb-2">Ваша история</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  Расскажите свою историю: о подвиге, любви, интересной жизни, заслуге,
                  памяти о близком или просто о том, что важно для вас.
                </p>
              </div>

              {/* Заголовок истории */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-zinc-700">Заголовок истории</Label>
                <Input
                  id="title"
                  placeholder="Краткое название вашей истории"
                  maxLength={100}
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="h-12 sm:h-14 rounded-xl border-zinc-200 focus:border-amber-400 focus:ring-amber-400/20 text-base sm:text-lg font-medium transition-all"
                />
              </div>

              <RichTextEditor
                content={formData.content}
                onChange={(content) => setFormData(prev => ({ ...prev, content }))}
              />

              {/* Загрузка изображений */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <ImageIcon className="w-4 h-4 text-zinc-500" />
                  Изображения ({formData.images.length}/10)
                </Label>

                <div
                  {...getImagesRootProps()}
                  className="border-2 border-dashed border-zinc-200 rounded-2xl p-4 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 transition-all group"
                >
                  <input {...getImagesInputProps()} />
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                      <Upload className="w-5 h-5 text-zinc-400 group-hover:text-amber-600 transition-colors" />
                    </div>
                    <span className="text-sm text-zinc-600 font-medium">Добавить изображения</span>
                  </div>
                </div>

                {formData.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.images.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Изображение ${index + 1}`}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-zinc-200 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-md"
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
              <h3 className="text-base sm:text-lg font-semibold text-zinc-800 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-zinc-600" />
                </div>
                Контактные данные
              </h3>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-zinc-700">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@mail.ru"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="h-11 sm:h-12 rounded-xl border-zinc-200 focus:border-amber-400 focus:ring-amber-400/20 transition-all"
                />
                <p className="text-xs text-zinc-400">
                  На этот адрес придёт секретная ссылка для управления историей
                </p>
              </div>
            </div>
          </div>

          {/* Фиксированный футер с кнопкой */}
          <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-white/95 backdrop-blur-sm px-5 sm:px-8 py-5 border-t border-zinc-100">
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-xl shadow-orange-500/25 rounded-2xl transition-all duration-300 hover:shadow-orange-500/40 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
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
