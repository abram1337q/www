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
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden bg-white">
        {/* Шапка с информацией об авторе */}
        <div className="p-6 border-b border-zinc-100 bg-gradient-to-r from-amber-50/50 to-orange-50/50">
          <div className="flex items-start gap-4">
            {/* Аватар */}
            <Avatar className="w-16 h-16 border-3 border-amber-200 shadow-lg shadow-amber-100">
              <AvatarImage src={story.authorPhotoUrl || undefined} alt={story.authorName} />
              <AvatarFallback className="bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700 text-lg font-semibold">
                {getInitials(story.authorName)}
              </AvatarFallback>
            </Avatar>

            {/* Информация об авторе */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-semibold text-zinc-900">
                  {story.authorName}
                </h2>
                <span className="text-2xl">{category.emoji}</span>
                <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-200">
                  {category.label}
                </Badge>
              </div>

              {story.authorBirthDate && (
                <div className="flex items-center gap-1 text-sm text-zinc-500 mt-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(story.authorBirthDate)}
                </div>
              )}

              {story.authorBio && (
                <p className="text-sm text-zinc-600 italic mt-2">
                  {story.authorBio}
                </p>
              )}

              {story.settlementName && (
                <div className="flex items-center gap-1 text-sm text-zinc-500 mt-2">
                  <MapPin className="w-4 h-4" />
                  {story.settlementName}
                  {story.regionName && `, ${story.regionName}`}
                </div>
              )}
            </div>

            {/* Кнопка закрытия */}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-zinc-100 transition-colors"
            >
              <X className="w-5 h-5 text-zinc-500" />
            </button>
          </div>
        </div>

        {/* Контент истории */}
        <ScrollArea className="flex-1 max-h-[50vh]">
          <div className="p-6">
            {story.title && (
              <h3 className="text-2xl font-semibold text-zinc-900 mb-4">
                {story.title}
              </h3>
            )}

            <div
              className="prose prose-zinc max-w-none"
              dangerouslySetInnerHTML={{ __html: story.content }}
            />

            {/* Изображения */}
            {story.images && story.images.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-4">
                {story.images.map((image) => (
                  <img
                    key={image.id}
                    src={image.url}
                    alt=""
                    className="w-full rounded-lg object-cover"
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Футер с сердечком */}
        <div className="p-6 border-t border-zinc-100 bg-zinc-50">
          <div className="flex items-center justify-between">
            <Button
              onClick={handleHeart}
              disabled={hasHearted}
              variant={hasHearted ? "secondary" : "default"}
              className={`
                gap-2 transition-all duration-300
                ${isHeartAnimating ? 'scale-110' : ''}
                ${hasHearted ? 'bg-red-50 text-red-600 hover:bg-red-100 border-red-200' : ''}
              `}
            >
              <Heart
                className={`w-5 h-5 transition-all ${hasHearted ? 'fill-red-500 text-red-500' : ''}`}
              />
              {hasHearted ? 'История тронула меня' : 'Эта история тронула меня'}
            </Button>

            <div className="text-sm text-zinc-600">
              {heartsCount > 0 ? (
                <>
                  Эту историю отметил{heartsCount === 1 ? '' : 'и'}{' '}
                  <span className="font-semibold text-zinc-900">{heartsCount}</span>{' '}
                  {heartsCount === 1 ? 'человек' : heartsCount < 5 ? 'человека' : 'человек'}
                </>
              ) : (
                'Будьте первым, кто отметит эту историю'
              )}
            </div>
          </div>
        </div>

        {/* Анимация сердечка */}
        <style jsx global>{`
          @keyframes heart-pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
          }
          .animate-heart-pulse {
            animation: heart-pulse 0.3s ease-in-out;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}

export default StoryViewModal;
