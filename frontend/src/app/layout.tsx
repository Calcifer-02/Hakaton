import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "./components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Система анализа данных предприятий Москвы",
  description:
    "Система сбора, консолидации, анализа и визуализации данных предприятий Москвы для совершенствования промышленной политики города",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <div className="min-h-screen flex">
          <Navigation />
          <main className="flex-1 ml-64">
            <div className="p-8">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
