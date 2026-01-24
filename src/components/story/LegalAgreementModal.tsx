'use client';

// Модальное окно принятия юридических документов
// Отображается перед переходом к оплате

import { useState } from 'react';
import Link from 'next/link';
import { FileText, ExternalLink, Check, ShieldCheck, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface LegalAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export function LegalAgreementModal({ isOpen, onClose, onAccept }: LegalAgreementModalProps) {
  const [isAccepted, setIsAccepted] = useState(false);

  // Документы для ознакомления
  const documents = [
    {
      title: 'Пользовательское соглашение',
      href: '/legal/terms',
      description: 'Правила использования сервиса',
      icon: '📋',
    },
    {
      title: 'Политика конфиденциальности',
      href: '/legal/privacy',
      description: 'Обработка персональных данных',
      icon: '🔒',
    },
    {
      title: 'Правила модерации',
      href: '/legal/moderation',
      description: 'Требования к публикуемому контенту',
      icon: '✓',
    },
  ];

  const handleAccept = () => {
    if (!isAccepted) return;
    onAccept();
    setIsAccepted(false);
  };

  const handleClose = () => {
    setIsAccepted(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-lg bg-white p-0 overflow-hidden">
        {/* Header */}
        <div className="px-5 sm:px-6 pt-6 pb-4 border-b border-zinc-100 bg-gradient-to-br from-zinc-50 to-white">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-bold text-zinc-900 flex items-center gap-3 pr-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center shadow-sm">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
              </div>
              Юридические документы
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="px-5 sm:px-6 py-5 space-y-5">
          <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
            Перед публикацией истории ознакомьтесь с документами и примите условия:
          </p>

          {/* Список документов */}
          <div className="space-y-2.5">
            {documents.map((doc) => (
              <Link
                key={doc.href}
                href={doc.href}
                target="_blank"
                className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border-2 border-zinc-100 hover:border-amber-200 hover:bg-gradient-to-r hover:from-amber-50/50 hover:to-orange-50/30 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{doc.icon}</span>
                  <div>
                    <div className="font-semibold text-zinc-900 group-hover:text-amber-700 transition-colors text-sm sm:text-base">
                      {doc.title}
                    </div>
                    <div className="text-xs sm:text-sm text-zinc-500">
                      {doc.description}
                    </div>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-zinc-100 group-hover:bg-amber-100 flex items-center justify-center transition-colors flex-shrink-0">
                  <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-amber-600 transition-colors" />
                </div>
              </Link>
            ))}
          </div>

          {/* Чекбокс принятия условий */}
          <div
            className={`flex items-start gap-3 p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
              isAccepted
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                : 'bg-zinc-50 border-zinc-100 hover:border-zinc-200'
            }`}
            onClick={() => setIsAccepted(!isAccepted)}
          >
            <Checkbox
              id="accept-terms"
              checked={isAccepted}
              onCheckedChange={(checked) => setIsAccepted(checked === true)}
              className={`mt-0.5 h-5 w-5 rounded-lg border-2 transition-all ${
                isAccepted
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-zinc-300'
              }`}
            />
            <label
              htmlFor="accept-terms"
              className={`text-sm leading-relaxed cursor-pointer transition-colors ${
                isAccepted ? 'text-green-800' : 'text-zinc-600'
              }`}
            >
              Я ознакомился(-ась) с документами и принимаю условия пользовательского
              соглашения, политики конфиденциальности и правил модерации
            </label>
          </div>

          {/* Информация о стоимости */}
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200/60 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-200/50 flex-shrink-0">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-amber-800 text-base sm:text-lg">
                  990 ₽
                </div>
                <p className="text-xs sm:text-sm text-amber-700/80">
                  Перенаправление на ЮKassa
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 px-5 sm:px-6 pb-6 pt-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1 h-11 sm:h-12 rounded-xl border-2 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 font-semibold transition-all"
          >
            Отмена
          </Button>
          <Button
            onClick={handleAccept}
            disabled={!isAccepted}
            className={`flex-1 h-11 sm:h-12 rounded-xl font-semibold transition-all duration-300 ${
              isAccepted
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:scale-[1.02]'
                : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4 mr-2" />
            Продолжить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default LegalAgreementModal;
