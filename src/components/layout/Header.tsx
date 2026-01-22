'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface HeaderProps {
  transparent?: boolean;
}

export function Header({ transparent = true }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const header = document.getElementById('main-header');
      if (header) {
        const rect = header.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <header
      id="main-header"
      className={`
        fixed top-0 left-0 right-0 z-50 overflow-hidden
        transition-all duration-500 ease-out
        ${scrolled
          ? 'py-2 bg-zinc-950/80 backdrop-blur-2xl border-b border-zinc-800/50 shadow-2xl shadow-black/20'
          : 'py-3 sm:py-4 bg-gradient-to-r from-zinc-950/70 via-zinc-900/60 to-zinc-950/70 backdrop-blur-xl'
        }
      `}
    >
      {/* Анимированный градиентный фон при движении мыши */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(251, 146, 60, 0.15), transparent 40%)`,
        }}
      />

      {/* Декоративные плавающие частицы */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1 left-[10%] w-1 h-1 bg-amber-400/40 rounded-full animate-float-slow" />
        <div className="absolute top-3 left-[25%] w-0.5 h-0.5 bg-orange-400/30 rounded-full animate-float-medium" />
        <div className="absolute top-2 right-[15%] w-1.5 h-1.5 bg-amber-300/20 rounded-full animate-float-fast" />
        <div className="absolute top-4 right-[30%] w-0.5 h-0.5 bg-orange-500/40 rounded-full animate-float-slow" />
      </div>

      {/* Нижняя декоративная линия с градиентом */}
      <div className="absolute bottom-0 left-0 right-0 h-px">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
        <div
          className="absolute h-full w-32 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between">
          {/* Логотип и название */}
          <Link href="/" className="flex items-center gap-3 sm:gap-4 group">
            {/* Анимированный 3D логотип */}
            <div className="relative">
              {/* Внешнее свечение */}
              <div className="absolute -inset-2 bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-red-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />

              {/* Основной контейнер логотипа */}
              <div className="relative">
                {/* Теневой слой */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-600 to-red-600 rounded-xl sm:rounded-2xl blur-sm opacity-50 translate-y-1" />

                {/* Основной логотип */}
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 overflow-hidden">
                  {/* Внутреннее свечение */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white/0 via-white/20 to-white/40" />

                  {/* Анимированный блик */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />

                  {/* Иконка */}
                  <svg className="relative w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>

              {/* Орбитальные частицы */}
              <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-3.5 sm:h-3.5">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full border-2 border-white/80 shadow-lg animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full animate-ping opacity-50" />
              </div>

              {/* Маленькая декоративная точка */}
              <div className="absolute -bottom-0.5 -left-0.5 w-2 h-2 bg-gradient-to-br from-amber-300 to-orange-400 rounded-full opacity-60 animate-bounce-slow hidden sm:block" />
            </div>

            {/* Название с эффектами */}
            <div className="min-w-0">
              <div className="relative">
                {/* Фоновое свечение для текста */}
                <div className="absolute -inset-x-2 -inset-y-1 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <h1 className="relative text-lg sm:text-xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-amber-200 via-orange-200 to-amber-200 bg-clip-text text-transparent group-hover:from-amber-100 group-hover:via-orange-100 group-hover:to-amber-100 transition-all duration-300">
                    История моей жизни
                  </span>
                </h1>
              </div>

              <p className="text-[11px] sm:text-xs text-zinc-400 hidden sm:flex items-center gap-1.5 mt-0.5 group-hover:text-zinc-300 transition-colors duration-300">
                <span className="inline-block w-1 h-1 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full" />
                Оставь свой след на карте России
                <span className="inline-block w-1 h-1 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full" />
              </p>
            </div>
          </Link>

          {/* Навигация */}
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/legal/terms"
              className="group/link relative px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl overflow-hidden"
            >
              {/* Фон кнопки */}
              <div className="absolute inset-0 bg-zinc-800/50 border border-zinc-700/50 rounded-xl transition-all duration-300 group-hover/link:bg-zinc-700/50 group-hover/link:border-zinc-600/50" />

              {/* Свечение при ховере */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0 opacity-0 group-hover/link:opacity-100 transition-opacity duration-300" />

              {/* Нижняя линия */}
              <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-400 group-hover/link:w-4/5 group-hover/link:left-[10%] transition-all duration-300 rounded-full" />

              <span className="relative text-xs sm:text-sm font-medium text-zinc-300 group-hover/link:text-white transition-colors duration-300 flex items-center gap-2">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-60 group-hover/link:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden sm:inline">О проекте</span>
                <span className="sm:hidden">Инфо</span>
              </span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
