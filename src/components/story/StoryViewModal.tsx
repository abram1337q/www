'use client';

// Модальное окно просмотра опубликованной истории
// Отображает информацию об авторе, текст и кнопку "сердечко"

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Heart, X, Calendar, MapPin, User } from 'lucide-react';
import Cookies from 'js-cookie';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { STORY_CATEGORIES, type Story } from '@/types';

interface StoryViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: Story | null;
  onHeart?: (storyId: string) => Promise<void>;
}

export function StoryViewModal({ isOpen, onClose, story, onHeart }: StoryViewModalProps) {
  const [heartsCount, setHeartsCount] = useState(story?.heartsCount || 0);
  const [hasHearted, setHasHearted] = useState(false);
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);

  // Проверяем, ставил ли пользователь сердечко
  useEffect(() => {
    if (story) {
      const heartedStories = Cookies.get('hearted_stories');
      if (heartedStories) {
        const ids = JSON.parse(heartedStories) as string[];
        setHasHearted(ids.includes(story.id));
      }
      setHeartsCount(story.heartsCount);
    }
  }, [story]);

  if (!story) return null;

  const category = STORY_CATEGORIES[story.category];

  // Обработка клика по сердечку
  const handleHeart = async () => {
    if (hasHearted) return;

    setIsHeartAnimating(true);
    setHeartsCount(prev => prev + 1);
    setHasHearted(true);

    // Сохраняем в куки
    const heartedStories = Cookies.get('hearted_stories');
    const ids = heartedStories ? JSON.parse(heartedStories) : [];
    ids.push(story.id);
    Cookies.set('hearted_stories', JSON.stringify(ids), { expires: 365 });

    // Отправляем на сервер
    if (onHeart) {
      await onHeart(story.id);
    }

    setTimeout(() => setIsHeartAnimating(false), 500);
  };

  // Форматирование даты
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return null;
    return format(new Date(date), 'd MMMM yyyy', { locale: ru });
  };

  // Получаем инициалы для аватара
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] sm:max-h-[85vh] p-0 overflow-hidden bg-white">
        {/* Шапка с информацией об авторе */}
        <div className="relative p-5 sm:p-6 border-b border-zinc-100 bg-gradient-to-br from-amber-50/80 via-orange-50/50 to-white">
          {/* Декоративный элемент */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-100/50 to-transparent rounded-bl-full pointer-events-none" />

          <div className="relative flex items-start gap-4">
            {/* Аватар */}
            <Avatar className="w-14 h-14 sm:w-16 sm:h-16 border-[3px] border-white shadow-xl ring-2 ring-amber-100/50">
              <AvatarImage src={story.authorPhotoUrl || undefined} alt={story.authorName} />
              <AvatarFallback className="bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700 text-base sm:text-lg font-bold">
                {getInitials(story.authorName)}
              </AvatarFallback>
            </Avatar>

            {/* Информация об авторе */}
            <div className="flex-1 min-w-0 pr-8">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-zinc-900">
                  {story.authorName}
                </h2>
                <span className="text-xl sm:text-2xl">{category.emoji}</span>
              </div>

              <Badge className="mt-1.5 text-xs font-medium bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border-amber-200/80 rounded-lg px-2.5 py-0.5">
                {category.label}
              </Badge>

              {story.authorBirthDate && (
                <div className="flex items-center gap-1.5 text-sm text-zinc-500 mt-2">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(story.authorBirthDate)}
                </div>
              )}

              {story.authorBio && (
                <p className="text-sm text-zinc-600 italic mt-2 line-clamp-2">
                  {story.authorBio}
                </p>
              )}

              {story.settlementName && (
                <div className="flex items-center gap-1.5 text-sm text-zinc-500 mt-2">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" />
                  <span className="truncate">
                    {story.settlementName}
                    {story.regionName && `, ${story.regionName}`}
                  </span>
                </div>
              )}
            </div>

            {/* Кнопка закрытия */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full bg-white/80 hover:bg-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-500" />
            </button>
          </div>
        </div>

        {/* Контент истории */}
        <ScrollArea className="flex-1 max-h-[45vh] sm:max-h-[50vh]">
          <div className="p-5 sm:p-6">
            {story.title && (
              <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 mb-4 leading-tight">
                {story.title}
              </h3>
            )}

            <div
              className="prose prose-zinc prose-sm sm:prose-base max-w-none prose-headings:font-semibold prose-p:leading-relaxed prose-a:text-amber-600 prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: story.content }}
            />

            {/* Изображения */}
            {story.images && story.images.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
                {story.images.map((image) => (
                  <img
                    key={image.id}
                    src={image.url}
                    alt=""
                    className="w-full rounded-2xl object-cover shadow-md hover:shadow-lg transition-shadow duration-200"
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Футер с сердечком */}
        <div className="p-4 sm:p-5 border-t border-zinc-100 bg-gradient-to-t from-zinc-50 to-white">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <Button
              onClick={handleHeart}
              disabled={hasHearted}
              variant={hasHearted ? "secondary" : "default"}
              className={`
                w-full sm:w-auto gap-2.5 h-11 sm:h-12 px-5 sm:px-6 rounded-2xl font-semibold transition-all duration-300
                ${isHeartAnimating ? 'scale-110' : ''}
                ${hasHearted
                  ? 'bg-gradient-to-r from-red-50 to-pink-50 text-red-600 hover:from-red-100 hover:to-pink-100 border-2 border-red-200/80 shadow-sm'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02]'
                }
              `}
            >
              <Heart
                className={`w-5 h-5 transition-all duration-300 ${hasHearted ? 'fill-red-500 text-red-500 scale-110' : ''}`}
              />
              <span className="text-sm sm:text-base">
                {hasHearted ? 'Тронуло' : 'Эта история тронула меня'}
              </span>
            </Button>

            <div className="text-sm text-zinc-500 text-center sm:text-right">
              {heartsCount > 0 ? (
                <span className="flex items-center gap-1.5 justify-center sm:justify-end">
                  <Heart className="w-4 h-4 fill-red-400 text-red-400" />
                  <span>
                    <span className="font-semibold text-zinc-700">{heartsCount}</span>{' '}
                    {heartsCount === 1 ? 'человек' : heartsCount < 5 ? 'человека' : 'человек'}
                  </span>
                </span>
              ) : (
                <span className="text-zinc-400">Будьте первым</span>
              )}
            </div>
          </div>
        </div>

        {/* Анимация сердечка */}
        <style jsx global>{`
          @keyframes heart-pulse {
            0%, 100% { transform: scale(1); }
            25% { transform: scale(1.2); }
            50% { transform: scale(0.95); }
            75% { transform: scale(1.1); }
          }
          .animate-heart-pulse {
            animation: heart-pulse 0.4s ease-in-out;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}

export default StoryViewModal;
