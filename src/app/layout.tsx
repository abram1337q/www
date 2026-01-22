// Корневой layout приложения "След на Земле"

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import Script from "next/script";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "История моей жизни — Оставь свой след на карте России",
  description: "Интерактивная карта России с личными историями. Расскажите о своей жизни, любви, подвиге или памяти о близких. Ваша история останется на карте навсегда.",
  keywords: ["истории", "карта России", "личные истории", "мемуары", "память", "семейная история"],
  authors: [{ name: "История моей жизни" }],
  openGraph: {
    title: "История моей жизни — Оставь свой след на карте России",
    description: "Интерактивная карта России с личными историями",
    type: "website",
    locale: "ru_RU",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={inter.variable}>
      <head>
        <Script
          crossOrigin="anonymous"
          src="//unpkg.com/same-runtime/dist/index.global.js"
        />
      </head>
      <body suppressHydrationWarning className="antialiased font-sans">
        <ClientBody>{children}</ClientBody>
      </body>
    </html>
  );
}
