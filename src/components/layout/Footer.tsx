'use client';

import Link from 'next/link';
import { useState } from 'react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  const legalLinks = [
    { href: '/legal/terms', label: 'Соглашение' },
    { href: '/legal/privacy', label: 'Конфиденциальность' },
    { href: '/legal/moderation', label: 'Модерация' },
  ];

  return (
    <footer className="relative bg-zinc-950/95 backdrop-blur-xl text-zinc-400 overflow-hidden">
      {/* Анимированные декоративные частицы */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-2 left-[15%] w-1 h-1 bg-amber-400/20 rounded-full animate-twinkle" />
        <div className="absolute top-3 right-[25%] w-0.5 h-0.5 bg-orange-400/20 rounded-full animate-twinkle-delay-1" />
      </div>

      {/* Верхняя декоративная линия */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-3">

          {/* Логотип и копирайт */}
          <div className="flex items-center gap-3 group">
            {/* Анимированный логотип */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg blur-md group-hover:blur-lg transition-all duration-300 opacity-75" />
              <div className="relative w-8 h-8 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform duration-300">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium bg-gradient-to-r from-amber-200 to-orange-200 bg-clip-text text-transparent">
                История моей жизни
              </span>
              <span className="text-zinc-600">·</span>
              <span className="text-xs text-zinc-500">© {currentYear}</span>
            </div>

            {/* Сердечко */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-600 ml-2">
              <span>с</span>
              <div className="relative">
                <svg className="w-3 h-3 text-red-500 animate-heartbeat" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Навигация */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {legalLinks.map((link, index) => (
              <div key={link.href} className="flex items-center">
                <Link
                  href={link.href}
                  className="group/item relative px-2.5 py-1.5 rounded-lg overflow-hidden"
                  onMouseEnter={() => setHoveredLink(link.href)}
                  onMouseLeave={() => setHoveredLink(null)}
                >
                  {/* Фон при ховере */}
                  <div className={`
                    absolute inset-0 rounded-lg transition-all duration-200
                    ${hoveredLink === link.href
                      ? 'bg-zinc-800/80'
                      : 'bg-transparent'
                    }
                  `} />

                  {/* Нижняя линия */}
                  <div className={`
                    absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 rounded-full
                    bg-gradient-to-r from-amber-400 to-orange-400
                    transition-all duration-200
                    ${hoveredLink === link.href ? 'w-2/3 opacity-100' : 'w-0 opacity-0'}
                  `} />

                  <span className={`
                    relative text-xs font-medium transition-colors duration-200
                    ${hoveredLink === link.href ? 'text-amber-200' : 'text-zinc-500'}
                  `}>
                    {link.label}
                  </span>
                </Link>

                {index < legalLinks.length - 1 && (
                  <span className="text-zinc-700 mx-0.5">·</span>
                )}
              </div>
            ))}

            {/* Статус онлайн */}
            <div className="hidden sm:flex items-center gap-1.5 ml-3 px-2.5 py-1 bg-zinc-900/80 rounded-full border border-zinc-800/50">
              <div className="relative">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <div className="absolute inset-0 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping opacity-75" />
              </div>
              <span className="text-[10px] text-zinc-500">online</span>
            </div>
          </nav>
        </div>
      </div>

      {/* Нижний градиент */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
    </footer>
  );
}

export default Footer;
