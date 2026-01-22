'use client';

// Главная страница сервиса "След на Земле"
// Интерактивная 3D карта России с историями пользователей

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CreateStoryModal, type CreateStoryFormData } from '@/components/story/CreateStoryModal';
import { StoryViewModal } from '@/components/story/StoryViewModal';
import type { Story, StoryMapMarker } from '@/types';
import { Loader2, MapPin, Heart, Users } from 'lucide-react';

// Динамический импорт карты (без SSR, так как MapLibre работает только в браузере)
const InteractiveMap = dynamic(
  () => import('@/components/map/InteractiveMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-6 animate-pulse">
              <MapPin className="w-10 h-10 text-white" />
            </div>
            <div className="absolute inset-0 w-20 h-20 rounded-full bg-amber-400/30 mx-auto animate-ping" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">История моей жизни</h2>
          <p className="text-slate-400">Загружаем карту России...</p>
        </div>
      </div>
    )
  }
);

export default function HomePage() {
  // Состояние для историй на карте
  const [stories, setStories] = useState<StoryMapMarker[]>([]);
  const [isLoadingStories, setIsLoadingStories] = useState(true);

  // Состояние для модального окна создания истории
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createCoordinates, setCreateCoordinates] = useState<{ lng: number; lat: number } | null>(null);

  // Состояние для модального окна просмотра истории
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [selectedStoryId, setSelectedStoryId] = useState<string | undefined>();

  // Состояние для приветственного блока
  const [isWelcomeDismissed, setIsWelcomeDismissed] = useState(false);

  // Загрузка историй при монтировании
  useEffect(() => {
    loadStories();
  }, []);

  // Функция загрузки историй
  const loadStories = async () => {
    try {
      setIsLoadingStories(true);
      const response = await fetch('/api/stories');
      if (response.ok) {
        const data = await response.json();
        setStories(data.stories || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки историй:', error);
    } finally {
      setIsLoadingStories(false);
    }
  };

  // Обработка клика по карте (открытие формы создания)
  const handleMapClick = useCallback((lngLat: { lng: number; lat: number }) => {
    setCreateCoordinates(lngLat);
    setIsCreateModalOpen(true);
  }, []);

  // Обработка клика по маркеру истории
  const handleStoryClick = useCallback(async (storyId: string) => {
    setSelectedStoryId(storyId);

    try {
      const response = await fetch(`/api/stories/${storyId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedStory(data.story);
        setIsViewModalOpen(true);
      }
    } catch (error) {
      console.error('Ошибка загрузки истории:', error);
    }
  }, []);

  // Обработка отправки формы создания
  const handleCreateSubmit = async (formData: CreateStoryFormData) => {
    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'authorPhoto' && value) {
          submitData.append(key, value as File);
        } else if (key === 'images' && Array.isArray(value)) {
          (value as File[]).forEach((file, index) => {
            submitData.append(`images[${index}]`, file);
          });
        } else if (value !== null && value !== undefined) {
          submitData.append(key, String(value));
        }
      });

      const response = await fetch('/api/stories', {
        method: 'POST',
        body: submitData,
      });

      const data = await response.json();

      if (data.success && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error(data.error || 'Ошибка создания истории');
      }
    } catch (error) {
      console.error('Ошибка отправки формы:', error);
      alert('Произошла ошибка. Пожалуйста, попробуйте позже.');
    }
  };

  // Обработка сердечка
  const handleHeart = async (storyId: string) => {
    try {
      await fetch(`/api/stories/${storyId}/heart`, {
        method: 'POST',
      });

      setStories(prev => prev.map(s =>
        s.id === storyId ? { ...s, heartsCount: s.heartsCount + 1 } : s
      ));
    } catch (error) {
      console.error('Ошибка отправки сердечка:', error);
    }
  };

  // Закрытие модальных окон
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setCreateCoordinates(null);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedStory(null);
    setSelectedStoryId(undefined);
  };

  // Подсчёт статистики
  const totalHearts = stories.reduce((sum, s) => sum + s.heartsCount, 0);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Шапка */}
      <Header />

      {/* Основной контент - карта на всю высоту */}
      <main className="flex-1 relative mt-16">
        {/* Карта */}
        <div className="absolute inset-0">
          <InteractiveMap
            stories={stories}
            onMapClick={handleMapClick}
            onStoryClick={handleStoryClick}
            selectedStoryId={selectedStoryId}
          />
        </div>

        {/* Индикатор загрузки историй */}
        {isLoadingStories && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
            <div className="bg-white/95 backdrop-blur-xl rounded-full pl-4 pr-5 py-2.5 shadow-xl border border-zinc-100 flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
              </div>
              <span className="text-sm font-medium text-zinc-700">Загрузка историй...</span>
            </div>
          </div>
        )}

        {/* Мини-статистика (мобильная версия - внизу, десктоп - справа) */}
        {!isLoadingStories && stories.length > 0 && (
          <div className="absolute bottom-20 sm:bottom-auto sm:top-4 right-4 z-20">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-zinc-100">
              <div className="flex items-center gap-4 sm:flex-col sm:gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-zinc-900">{stories.length}</div>
                    <div className="text-xs text-zinc-500 hidden sm:block">
                      {stories.length === 1 ? 'история' : stories.length < 5 ? 'истории' : 'историй'}
                    </div>
                  </div>
                </div>
                <div className="w-px h-8 bg-zinc-200 sm:w-full sm:h-px" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-zinc-900">{totalHearts}</div>
                    <div className="text-xs text-zinc-500 hidden sm:block">
                      {totalHearts === 1 ? 'сердце' : 'сердец'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Приветственный блок для пустой карты */}
        {!isLoadingStories && stories.length === 0 && !isWelcomeDismissed && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-zinc-100 max-w-md mx-4 text-center pointer-events-auto">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 mb-3">
                Добро пожаловать!
              </h2>
              <p className="text-zinc-600 mb-6">
                Это интерактивная карта историй жителей России.
                Приблизьте карту и нажмите на любое место, чтобы оставить свою историю.
              </p>
              <button
                onClick={() => setIsWelcomeDismissed(true)}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium py-3 px-6 rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg shadow-amber-500/25"
              >
                Понятно, начать
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Компактный футер поверх карты */}
      <div className="relative z-30">
        <Footer />
      </div>

      {/* Модальное окно создания истории */}
      <CreateStoryModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        coordinates={createCoordinates}
        onSubmit={handleCreateSubmit}
      />

      {/* Модальное окно просмотра истории */}
      <StoryViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        story={selectedStory}
        onHeart={handleHeart}
      />
    </div>
  );
}
