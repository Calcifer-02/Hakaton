'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Upload,
  FileText,
  Settings,
  Building2,
  TrendingUp,
  Database
} from 'lucide-react';

const navigationItems = [
  {
    name: 'Главная',
    href: '/',
    icon: BarChart3,
    description: 'Обзор и ключевые метрики'
  },
  {
    name: 'Загрузка данных',
    href: '/upload',
    icon: Upload,
    description: 'Загрузка файлов с данными предприятий'
  },
  {
    name: 'Аналитика',
    href: '/analytics',
    icon: TrendingUp,
    description: 'Подробная аналитика и графики'
  },
  {
    name: 'Отчёты',
    href: '/reports',
    icon: FileText,
    description: 'Генерация отчётов'
  },
  {
    name: 'Настройки',
    href: '/settings',
    icon: Settings,
    description: 'Настройки системы'
  }
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg border-r border-gray-200 z-10">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              Анализ предприятий
            </h1>
            <p className="text-xs text-gray-500">Москва</p>
          </div>
        </div>

        <div className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{item.name}</div>
                  <div className="text-xs text-gray-500 truncate">
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-3 px-4 py-2">
            <Database className="w-5 h-5 text-gray-400" />
            <div className="text-sm text-gray-600">
              <div className="font-medium">Статус системы</div>
              <div className="text-xs">Все системы работают</div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
