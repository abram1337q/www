'use client';

// Модальное окно принятия юридических документов
// Отображается перед переходом к оплате

import { useState } from 'react';
import Link from 'next/link';
import { FileText, ExternalLink, Check } from 'lucide-react';
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
    },
    {
      title: 'Политика конфиденциальности',
      href: '/legal/privacy',
      description: 'Обработка персональных данных',
    },
    {
      title: 'Правила модерации',
      href: '/legal/moderation',
      description: 'Требования к публикуемому контенту',
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
      <DialogContent className="max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-zinc-900 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Юридические документы
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <p className="text-zinc-600">
            Перед публикацией истории ознакомьтесь с документами и примите условия:
          </p>

          {/* Список документов */}
          <div className="space-y-3">
            {documents.map((doc) => (
              <Link
                key={doc.href}
                href={doc.href}
                target="_blank"
                className="flex items-center justify-between p-4 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-colors group"
              >
                <div>
                  <div className="font-medium text-zinc-900 group-hover:text-zinc-700">
                    {doc.title}
                  </div>
                  <div className="text-sm text-zinc-500">
                    {doc.description}
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600" />
              </Link>
            ))}
          </div>

          {/* Чекбокс принятия условий */}
          <div className="flex items-start gap-3 p-4 bg-zinc-50 rounded-lg">
            <Checkbox
              id="accept-terms"
              checked={isAccepted}
              onCheckedChange={(checked) => setIsAccepted(checked === true)}
              className="mt-0.5"
            />
            <label
              htmlFor="accept-terms"
              className="text-sm text-zinc-700 cursor-pointer leading-relaxed"
            >
              Я ознакомился(-ась) с документами и принимаю условия пользовательского
              соглашения, политики конфиденциальности и правил модерации
            </label>
          </div>

          {/* Информация о стоимости */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 text-amber-800 font-medium mb-1">
              Стоимость публикации: 990 ₽
            </div>
            <p className="text-sm text-amber-700">
              После нажатия кнопки вы будете перенаправлены на страницу оплаты ЮKassa
            </p>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1"
          >
            Отмена
          </Button>
          <Button
            onClick={handleAccept}
            disabled={!isAccepted}
            className="flex-1"
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
