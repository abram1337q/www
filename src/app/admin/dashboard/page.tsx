'use client';

// Дашборд административной панели
// Модерация историй, статистика, управление

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Clock, CheckCircle, XCircle, Eye, LogOut,
  Users, CreditCard, TrendingUp, RefreshCw, Loader2, Undo2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { STORY_CATEGORIES, type StoryCategoryId, type Story } from '@/types';

interface AdminStats {
  totalStories: number;
  pendingModeration: number;
  approvedStories: number;
  rejectedStories: number;
  totalPayments: number;
  totalRevenue: number;
}

interface ModerationStory extends Story {
  email: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingStories, setPendingStories] = useState<ModerationStory[]>([]);
  const [allStories, setAllStories] = useState<ModerationStory[]>([]);
  const [selectedStory, setSelectedStory] = useState<ModerationStory | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    checkAuth();
    loadData();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/check');
      const data = await response.json();
      if (!data.authenticated) {
        router.push('/admin');
      }
    } catch (err) {
      router.push('/admin');
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, pendingRes, allRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/stories?status=ON_MODERATION'),
        fetch('/api/admin/stories'),
      ]);

      const statsData = await statsRes.json();
      const pendingData = await pendingRes.json();
      const allData = await allRes.json();

      if (statsData.success) setStats(statsData.stats);
      if (pendingData.success) setPendingStories(pendingData.stories);
      if (allData.success) setAllStories(allData.stories);
    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (storyId: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/stories/${storyId}/approve`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        loadData();
        setSelectedStory(null);
      }
    } catch (err) {
      console.error('Ошибка одобрения:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedStory || !rejectReason.trim()) return;

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/stories/${selectedStory.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const data = await response.json();
      if (data.success) {
        loadData();
        setSelectedStory(null);
        setShowRejectDialog(false);
        setRejectReason('');
      }
    } catch (err) {
      console.error('Ошибка отклонения:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefund = async () => {
    if (!selectedStory) return;

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/stories/${selectedStory.id}/refund`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        alert('Возврат выполнен успешно');
        loadData();
        setSelectedStory(null);
        setShowRefundDialog(false);
      } else {
        alert(data.error || 'Ошибка возврата');
      }
    } catch (err) {
      console.error('Ошибка возврата:', err);
      alert('Ошибка выполнения возврата');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="w-10 h-10 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Шапка */}
      <header className="bg-white border-b border-zinc-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-zinc-900">
            Панель администратора
          </h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={loadData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Обновить
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Выход
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Статистика */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats?.pendingModeration || 0}</div>
                  <div className="text-sm text-zinc-500">На модерации</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats?.approvedStories || 0}</div>
                  <div className="text-sm text-zinc-500">Опубликовано</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <CreditCard className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats?.totalPayments || 0}</div>
                  <div className="text-sm text-zinc-500">Платежей</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {((stats?.totalRevenue || 0) / 100).toLocaleString('ru-RU')} ₽
                  </div>
                  <div className="text-sm text-zinc-500">Доход</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Табы с историями */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="w-4 h-4" />
              На модерации
              {pendingStories.length > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {pendingStories.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-2">
              <Users className="w-4 h-4" />
              Все истории
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Очередь модерации</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingStories.length === 0 ? (
                  <div className="text-center py-12 text-zinc-500">
                    Нет историй для модерации
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingStories.map((story) => (
                      <div
                        key={story.id}
                        className="flex items-start gap-4 p-4 border border-zinc-200 rounded-lg hover:bg-zinc-50"
                      >
                        <div className="text-3xl">
                          {STORY_CATEGORIES[story.category as StoryCategoryId].emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{story.authorName}</span>
                            <Badge variant="secondary" className="text-xs">
                              {STORY_CATEGORIES[story.category as StoryCategoryId].label}
                            </Badge>
                          </div>
                          <div className="text-sm text-zinc-500 mb-2">
                            {story.email}
                          </div>
                          <div
                            className="text-sm text-zinc-600 line-clamp-2"
                            dangerouslySetInnerHTML={{
                              __html: story.content.replace(/<[^>]*>/g, '').slice(0, 200)
                            }}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedStory(story)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleApprove(story.id)}
                            disabled={isProcessing}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedStory(story);
                              setShowRejectDialog(true);
                            }}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>Все истории ({allStories.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allStories.map((story) => (
                    <div
                      key={story.id}
                      className="flex items-center gap-4 p-3 border border-zinc-200 rounded-lg"
                    >
                      <span className="text-2xl">
                        {STORY_CATEGORIES[story.category as StoryCategoryId].emoji}
                      </span>
                      <div className="flex-1">
                        <div className="font-medium">{story.authorName}</div>
                        <div className="text-sm text-zinc-500">{story.email}</div>
                      </div>
                      <Badge
                        variant={story.status === 'APPROVED' ? 'default' : 'secondary'}
                        className={
                          story.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          story.status === 'ON_MODERATION' ? 'bg-blue-100 text-blue-800' :
                          story.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          ''
                        }
                      >
                        {story.status === 'APPROVED' && 'Опубликовано'}
                        {story.status === 'ON_MODERATION' && 'На модерации'}
                        {story.status === 'REJECTED' && 'Отклонено'}
                        {story.status === 'DELETED' && 'Удалено'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedStory(story)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Модальное окно просмотра истории */}
      <Dialog open={!!selectedStory && !showRejectDialog} onOpenChange={() => setSelectedStory(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">
                {selectedStory && STORY_CATEGORIES[selectedStory.category as StoryCategoryId].emoji}
              </span>
              {selectedStory?.authorName}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[50vh]">
            <div className="space-y-4 pr-4">
              <div className="text-sm text-zinc-500">
                Email: {selectedStory?.email}
              </div>
              {selectedStory?.authorBio && (
                <div className="text-sm italic text-zinc-600">
                  {selectedStory.authorBio}
                </div>
              )}
              <div
                className="prose prose-zinc max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedStory?.content || '' }}
              />
            </div>
          </ScrollArea>

          <DialogFooter className="gap-2">
            {/* Кнопка возврата платежа */}
            <Button
              variant="outline"
              onClick={() => setShowRefundDialog(true)}
              className="mr-auto"
            >
              <Undo2 className="w-4 h-4 mr-2" />
              Возврат платежа
            </Button>

            {selectedStory?.status === 'ON_MODERATION' && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => setShowRejectDialog(true)}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Отклонить
                </Button>
                <Button
                  onClick={() => handleApprove(selectedStory.id)}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Одобрить
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог отклонения */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отклонение истории</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Причина отклонения</Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Укажите причину отклонения..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim() || isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              Отклонить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог возврата платежа */}
      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Возврат платежа</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-zinc-600">
              Вы уверены, что хотите выполнить возврат платежа для истории от{' '}
              <strong>{selectedStory?.authorName}</strong>?
            </p>
            <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
              Сумма возврата: 990 руб. Возврат будет выполнен через ЮKassa.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRefundDialog(false)}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleRefund}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Undo2 className="w-4 h-4 mr-2" />
              )}
              Выполнить возврат
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
