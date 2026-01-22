'use client';

// Страница успешной оплаты
// Отображается после возврата с ЮKassa

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Clock, Mail, ArrowRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const storyId = searchParams.get('story');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Имитация проверки статуса
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card className="max-w-lg w-full shadow-xl border-0">
      <CardContent className="p-8 text-center">
        {isLoading ? (
          <div className="py-8">
            <div className="w-16 h-16 border-4 border-zinc-200 border-t-zinc-800 rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">
              Проверяем оплату...
            </h2>
            <p className="text-zinc-500">
              Пожалуйста, подождите
            </p>
          </div>
        ) : (
          <>
            {/* Иконка успеха */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>

            {/* Заголовок */}
            <h1 className="text-2xl font-bold text-zinc-900 mb-3">
              Оплата прошла успешно!
            </h1>

            <p className="text-zinc-600 mb-8">
              Ваша история отправлена на модерацию. Мы проверим её в течение 24 часов.
            </p>

            {/* Информационные блоки */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl text-left">
                <Mail className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-zinc-900 mb-1">
                    Проверьте почту
                  </div>
                  <div className="text-sm text-zinc-600">
                    Мы отправили вам письмо с секретной ссылкой для управления историей.
                    Сохраните её — она понадобится для редактирования.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-xl text-left">
                <Clock className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-zinc-900 mb-1">
                    Модерация до 24 часов
                  </div>
                  <div className="text-sm text-zinc-600">
                    После одобрения ваша история появится на карте.
                    Мы уведомим вас по электронной почте.
                  </div>
                </div>
              </div>
            </div>

            {/* Кнопки */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild variant="outline" className="flex-1">
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  На главную
                </Link>
              </Button>
              <Button asChild className="flex-1">
                <Link href="/">
                  Смотреть карту
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function LoadingFallback() {
  return (
    <Card className="max-w-lg w-full shadow-xl border-0">
      <CardContent className="p-8 text-center">
        <div className="py-8">
          <div className="w-16 h-16 border-4 border-zinc-200 border-t-zinc-800 rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-xl font-semibold text-zinc-900 mb-2">
            Загрузка...
          </h2>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-zinc-50 to-white">
      <Header transparent={false} />

      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <Suspense fallback={<LoadingFallback />}>
          <PaymentSuccessContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
