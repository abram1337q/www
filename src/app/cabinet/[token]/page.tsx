'use client';

// Личный кабинет автора
// Доступ по секретной ссылке с токеном

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Edit3, Trash2, Eye, Clock, CheckCircle, XCircle,
  AlertTriangle, Save, ArrowLeft, Loader2, Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { RichTextEditor } from '@/components/story/RichTextEditor';
import { STORY_CATEGORIES, STORY_STATUSES, type StoryCategoryId, type Story } from '@/types';

interface CabinetPageProps {
  params: Promise<{ token: string }>;
}

export default function CabinetPage({ params }: CabinetPageProps) {
  const { token } = use(params);
  const router = useRouter();

  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Форма редактирования
  const [formData, setFormData] = useState({
    authorName: '',
    authorBirthDate: '',
    authorBio: '',
    category: '' as StoryCategoryId,
    content: '',
  });

  // Загрузка данных истории
  useEffect(() => {
    loadStory();
  }, [token]);

  const loadStory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/cabinet/${token}`);
      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'История не найдена');
        return;
      }

      setStory(data.story);
      setFormData({
        authorName: data.story.authorName,
        authorBirthDate: data.story.authorBirthDate
          ? new Date(data.story.authorBirthDate).toISOString().split('T')[0]
          : '',
        authorBio: data.story.authorBio || '',
        category: data.story.category,
        content: data.story.content,
      });
    } catch (err) {
      setError('Ошибка загрузки данных');
    } finally {
      setIsLoading(false);
    }
  };

  // Сохранение изменений
  const handleSave = async () => {
    if (!hasChanges) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/cabinet/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setStory(data.story);
        setIsEditing(false);
        setHasChanges(false);
      } else {
        alert(data.error || 'Ошибка сохранения');
      }
    } catch (err) {
      alert('Ошибка сохранения');
    } finally {
      setIsSaving(false);
    }
  };

  // Отправка на повторную модерацию
  const handleResubmit = async () => {
    try {
      const response = await fetch(`/api/cabinet/${token}/resubmit`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        loadStory();
        alert('История отправлена на модерацию');
      } else {
        alert(data.error || 'Ошибка отправки');
      }
    } catch (err) {
      alert('Ошибка отправки');
    }
  };

  // Удаление истории
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/cabinet/${token}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        router.push('/');
      } else {
        alert(data.error || 'Ошибка удаления');
      }
    } catch (err) {
      alert('Ошибка удаления');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // Обновление формы
  const updateForm = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  // Получение статуса
  const getStatusInfo = () => {
    if (!story) return null;
    const status = STORY_STATUSES[story.status];
    return status;
  };

  // Отображение загрузки
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header transparent={false} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-zinc-400 mx-auto mb-4" />
            <p className="text-zinc-500">Загрузка...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Отображение ошибки
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header transparent={false} />
        <main className="flex-1 flex items-center justify-center px-4">
          <Card className="max-w-md w-full">
            <CardContent className="p-8 text-center">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-xl font-semibold text-zinc-900 mb-2">
                Страница не найдена
              </h1>
              <p className="text-zinc-500 mb-6">{error}</p>
              <Button asChild>
                <Link href="/">На главную</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Header transparent={false} />

      <main className="flex-1 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Заголовок */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link
                href="/"
                className="text-sm text-zinc-500 hover:text-zinc-700 flex items-center gap-1 mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                На карту
              </Link>
              <h1 className="text-2xl font-bold text-zinc-900">
                Личный кабинет
              </h1>
            </div>

            {/* Статус */}
            {statusInfo && (
              <Badge
                variant={story?.status === 'APPROVED' ? 'default' : 'secondary'}
                className={`
                  ${story?.status === 'APPROVED' ? 'bg-green-100 text-green-800' : ''}
                  ${story?.status === 'ON_MODERATION' ? 'bg-blue-100 text-blue-800' : ''}
                  ${story?.status === 'REJECTED' ? 'bg-red-100 text-red-800' : ''}
                `}
              >
                {story?.status === 'APPROVED' && <CheckCircle className="w-3 h-3 mr-1" />}
                {story?.status === 'ON_MODERATION' && <Clock className="w-3 h-3 mr-1" />}
                {story?.status === 'REJECTED' && <XCircle className="w-3 h-3 mr-1" />}
                {statusInfo.label}
              </Badge>
            )}
          </div>

          {/* Предупреждение об отклонении */}
          {story?.status === 'REJECTED' && story.rejectionReason && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-red-800 mb-1">
                    История отклонена модератором
                  </div>
                  <div className="text-sm text-red-700">
                    {story.rejectionReason}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Основной контент */}
          <div className="grid gap-6">
            {/* Информация об авторе */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Информация об авторе</CardTitle>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Редактировать
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Имя</Label>
                        <Input
                          value={formData.authorName}
                          onChange={(e) => updateForm({ authorName: e.target.value })}
                          maxLength={50}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Дата рождения</Label>
                        <Input
                          type="date"
                          value={formData.authorBirthDate}
                          onChange={(e) => updateForm({ authorBirthDate: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Краткая биография ({formData.authorBio.length}/200)</Label>
                      <Textarea
                        value={formData.authorBio}
                        onChange={(e) => updateForm({ authorBio: e.target.value })}
                        maxLength={200}
                        rows={2}
                      />
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-zinc-500">Имя</div>
                      <div className="font-medium">{story?.authorName}</div>
                    </div>
                    {story?.authorBirthDate && (
                      <div>
                        <div className="text-sm text-zinc-500">Дата рождения</div>
                        <div className="font-medium">
                          {new Date(story.authorBirthDate).toLocaleDateString('ru-RU')}
                        </div>
                      </div>
                    )}
                    {story?.authorBio && (
                      <div className="md:col-span-2">
                        <div className="text-sm text-zinc-500">Биография</div>
                        <div className="font-medium">{story.authorBio}</div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Категория */}
            <Card>
              <CardHeader>
                <CardTitle>Категория</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <RadioGroup
                    value={formData.category}
                    onValueChange={(value) => updateForm({ category: value as StoryCategoryId })}
                    className="grid grid-cols-2 md:grid-cols-3 gap-3"
                  >
                    {Object.values(STORY_CATEGORIES).map((cat) => (
                      <label
                        key={cat.id}
                        className={`
                          flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer
                          ${formData.category === cat.id
                            ? 'border-zinc-900 bg-zinc-50'
                            : 'border-zinc-200 hover:border-zinc-300'
                          }
                        `}
                      >
                        <RadioGroupItem value={cat.id} className="sr-only" />
                        <span className="text-xl">{cat.emoji}</span>
                        <span className="text-sm font-medium">{cat.label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">
                      {STORY_CATEGORIES[story?.category || 'LIFE_WISDOM'].emoji}
                    </span>
                    <span className="font-medium">
                      {STORY_CATEGORIES[story?.category || 'LIFE_WISDOM'].label}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Текст истории */}
            <Card>
              <CardHeader>
                <CardTitle>Текст истории</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <RichTextEditor
                    content={formData.content}
                    onChange={(content) => updateForm({ content })}
                  />
                ) : (
                  <div
                    className="prose prose-zinc max-w-none"
                    dangerouslySetInnerHTML={{ __html: story?.content || '' }}
                  />
                )}
              </CardContent>
            </Card>

            {/* Кнопки действий */}
            <div className="flex flex-wrap gap-3">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || !hasChanges}
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Сохранить изменения
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setHasChanges(false);
                      if (story) {
                        setFormData({
                          authorName: story.authorName,
                          authorBirthDate: story.authorBirthDate
                            ? new Date(story.authorBirthDate).toISOString().split('T')[0]
                            : '',
                          authorBio: story.authorBio || '',
                          category: story.category,
                          content: story.content,
                        });
                      }
                    }}
                  >
                    Отмена
                  </Button>
                </>
              ) : (
                <>
                  {(story?.status === 'REJECTED' || hasChanges) && (
                    <Button onClick={handleResubmit}>
                      <Send className="w-4 h-4 mr-2" />
                      Отправить на модерацию
                    </Button>
                  )}
                  <Button asChild variant="outline">
                    <Link href={`/?story=${story?.id}`}>
                      <Eye className="w-4 h-4 mr-2" />
                      Посмотреть на карте
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Удалить историю
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Диалог подтверждения удаления */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Удаление истории
            </DialogTitle>
          </DialogHeader>
          <p className="text-zinc-600">
            Вы уверены? Восстановить историю будет невозможно.
            Деньги за публикацию не возвращаются.
          </p>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Удалить навсегда
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
