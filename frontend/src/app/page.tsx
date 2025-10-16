'use client';

import { useEffect, useState } from 'react';
import { Building2, Users, TrendingUp, AlertCircle, Upload, BarChart } from 'lucide-react';
import Link from 'next/link';
import { Enterprise } from './types/enterprise';
import { generateSampleData, formatNumber, formatCurrency } from './lib/data-utils';
import { calculateOverallStats, calculateIndustryStats, calculateRegionStats, calculateDataQuality } from './lib/analytics';

export default function Dashboard() {
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Загружаем демонстрационные данные
    const sampleData = generateSampleData(500);
    setEnterprises(sampleData);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Загрузка данных...</div>
      </div>
    );
  }

  const overallStats = calculateOverallStats(enterprises);
  const industryStats = calculateIndustryStats(enterprises);
  const regionStats = calculateRegionStats(enterprises);
  const dataQuality = calculateDataQuality(enterprises);

  const validDataPercentage = Math.round((dataQuality.validRecords / dataQuality.totalRecords) * 100);

  const topIndustries = industryStats
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const topRegions = regionStats
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Система анализа данных предприятий Москвы
          </h1>
          <p className="text-gray-600 mt-2">
            Обзор промышленных предприятий и ключевые показатели
          </p>
        </div>
        <Link
          href="/upload"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Upload className="w-5 h-5" />
          <span>Загрузить данные</span>
        </Link>
      </div>

      {/* Ключевые метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Всего предприятий</p>
              <p className="text-3xl font-bold text-gray-900">{formatNumber(overallStats.totalEnterprises)}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-green-600 text-sm font-medium">
              {overallStats.statusDistribution.active} активных
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Общая выручка</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(overallStats.totalRevenue)}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-gray-600 text-sm">
              Ср: {formatCurrency(overallStats.averageRevenue)}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Всего сотрудников</p>
              <p className="text-3xl font-bold text-gray-900">{formatNumber(overallStats.totalEmployees)}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-gray-600 text-sm">
              Ср: {formatNumber(Math.round(overallStats.averageEmployees))}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Качество данных</p>
              <p className="text-3xl font-bold text-gray-900">{validDataPercentage}%</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-gray-600 text-sm">
              {dataQuality.validRecords} из {dataQuality.totalRecords}
            </span>
          </div>
        </div>
      </div>

      {/* Графики и аналитика */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Топ отрасли */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Топ отрасли</h3>
            <Link href="/analytics" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Подробнее
            </Link>
          </div>
          <div className="space-y-4">
            {topIndustries.map((industry, index) => (
              <div key={industry.industry} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{industry.industry}</p>
                    <p className="text-sm text-gray-500">{industry.count} предприятий</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(industry.totalRevenue)}</p>
                  <p className="text-sm text-gray-500">Ср: {industry.averageEmployees} сотр.</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Топ регионы */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Топ регионы</h3>
            <Link href="/analytics" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Подробнее
            </Link>
          </div>
          <div className="space-y-4">
            {topRegions.map((region, index) => (
              <div key={region.region} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{region.region}</p>
                    <p className="text-sm text-gray-500">{region.count} предприятий</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(region.totalRevenue)}</p>
                  <p className="text-sm text-gray-500">Ср: {region.averageEmployees} сотр.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Быстрые действия */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Быстрые действия</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/upload"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <Upload className="w-8 h-8 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Загрузить данные</p>
              <p className="text-sm text-gray-500">Добавить новые данные предприятий</p>
            </div>
          </Link>

          <Link
            href="/analytics"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
          >
            <BarChart className="w-8 h-8 text-green-600" />
            <div>
              <p className="font-medium text-gray-900">Аналитика</p>
              <p className="text-sm text-gray-500">Подробный анализ данных</p>
            </div>
          </Link>

          <Link
            href="/reports"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
          >
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <div>
              <p className="font-medium text-gray-900">Отчёты</p>
              <p className="text-sm text-gray-500">Сгенерировать отчёт</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
