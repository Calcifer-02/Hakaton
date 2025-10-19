'use client';

import { useEffect, useState } from 'react';
import { Download, FileText, Building2, TrendingUp, Users, AlertCircle, Upload as UploadIcon, Globe } from 'lucide-react';
import Link from 'next/link';
import { Enterprise } from '../types/enterprise';
import { formatNumber, formatCurrency, INDUSTRIES, MOSCOW_REGIONS } from '../lib/data-utils';
import { calculateOverallStats, calculateIndustryStats, calculateRegionStats, filterEnterprises } from '../lib/analytics';
import { getEnterprises } from '../lib/api-client';
import { generateExcelReport, generatePDFReport, generateHTMLReport } from '../lib/report-generator';

interface ReportConfig {
  title: string;
  dateRange: {
    from: Date;
    to: Date;
  };
  includeIndustries: string[];
  includeRegions: string[];
  sections: {
    overview: boolean;
    industries: boolean;
    regions: boolean;
    topEnterprises: boolean;
    trends: boolean;
  };
}

export default function ReportsPage() {
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    title: 'Отчёт по предприятиям Москвы',
    dateRange: {
      from: new Date(2015, 0, 1), // С 2015 года, чтобы охватить все данные
      to: new Date()
    },
    includeIndustries: [],
    includeRegions: [],
    sections: {
      overview: true,
      industries: true,
      regions: true,
      topEnterprises: true,
      trends: true
    }
  });

  useEffect(() => {
    // Загружаем данные из бэкенда
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await getEnterprises();
        if (response.success && response.data) {
          setEnterprises(response.data);
        } else {
          setError('Не удалось загрузить данные');
        }
      } catch (err) {
        setError(`Ошибка загрузки: ${(err as Error).message}`);
        console.error('Ошибка загрузки данных:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredEnterprises = filterEnterprises(enterprises, {
    dateRange: reportConfig.dateRange,
    industries: reportConfig.includeIndustries.length > 0 ? reportConfig.includeIndustries : undefined,
    regions: reportConfig.includeRegions.length > 0 ? reportConfig.includeRegions : undefined
  });

  const overallStats = calculateOverallStats(filteredEnterprises);
  const industryStats = calculateIndustryStats(filteredEnterprises);
  const regionStats = calculateRegionStats(filteredEnterprises);

  const handleGenerateReport = async (format: 'pdf' | 'excel' | 'html') => {
    setGeneratingReport(true);

    try {
      console.log(`Начинаем генерацию отчета в формате ${format.toUpperCase()}...`);

      // Подготавливаем данные для отчета
      const reportData = {
        title: reportConfig.title,
        period: {
          from: reportConfig.dateRange.from.toLocaleDateString('ru-RU'),
          to: reportConfig.dateRange.to.toLocaleDateString('ru-RU')
        },
        enterprises: filteredEnterprises,
        stats: {
          totalEnterprises: overallStats.totalEnterprises,
          totalRevenue: overallStats.totalRevenue,
          totalEmployees: overallStats.totalEmployees,
          averageRevenue: overallStats.averageRevenue,
          averageEmployees: overallStats.averageEmployees,
        },
        industryStats: reportConfig.sections.industries ? industryStats : undefined,
        regionStats: reportConfig.sections.regions ? regionStats : undefined,
      };

      // Генерируем отчет в нужном фор��ате
      if (format === 'excel') {
        console.log('Генерируем Excel отчет...');
        generateExcelReport(reportData);
        console.log('Excel отчет успешно создан');
      } else if (format === 'html') {
        console.log('Генерируем HTML отчет...');
        generateHTMLReport(reportData);
        console.log('HTML отчет успешно ��оздан');
      } else {
        console.log('Генерируем PDF отчет...');
        await generatePDFReport(reportData); // Теперь ждем завершения асинхронной функции
        console.log('PDF отчет успеш��о создан');
      }

      // Показываем уведомление об успехе
      alert(`Отчет в формате ${format.toUpperCase()} успешно сгенерирован и загружен!`);
    } catch (error) {
      console.error('Ошибка генерации отчета:', error);
      alert(`Ошибка при генерации отчета: ${(error as Error).message}`);
    } finally {
      setGeneratingReport(false);
    }
  };

  const updateReportConfig = (key: keyof ReportConfig, value: unknown) => {
    setReportConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateSection = (section: keyof ReportConfig['sections'], value: boolean) => {
    setReportConfig(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div className="text-lg text-gray-600 mt-4">Загрузка данных...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <div className="text-lg text-red-600">{error}</div>
          <p className="text-gray-600 mt-2">Проверьте, что бэкенд запущен на порту 4000</p>
        </div>
      </div>
    );
  }

  if (enterprises.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <UploadIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <div className="text-lg text-gray-600">Нет данных для отчетов</div>
          <p className="text-gray-500 mt-2">Загрузите файл с данными предприятий</p>
          <Link
            href="/upload"
            className="mt-4 inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UploadIcon className="w-5 h-5 mr-2" />
            Загрузить данные
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Заголовок */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Генерация отчётов</h1>
        <p className="text-gray-600 mt-2">
          Создайте детальные отчёты по предприятиям Москвы в различных форматах
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Конфигурация отчёта */}
        <div className="lg:col-span-2 space-y-6">
          {/* Основные настройки */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Основные настройки</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Название отчёта
                </label>
                <input
                  type="text"
                  value={reportConfig.title}
                  onChange={(e) => updateReportConfig('title', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Дата начала
                  </label>
                  <input
                    type="date"
                    value={reportConfig.dateRange.from.toISOString().split('T')[0]}
                    onChange={(e) => updateReportConfig('dateRange', {
                      ...reportConfig.dateRange,
                      from: new Date(e.target.value)
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Дата окончания
                  </label>
                  <input
                    type="date"
                    value={reportConfig.dateRange.to.toISOString().split('T')[0]}
                    onChange={(e) => updateReportConfig('dateRange', {
                      ...reportConfig.dateRange,
                      to: new Date(e.target.value)
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Фильтры */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Фильтры данных</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Отрасли (оставьте пустым для всех)
                </label>
                <select
                  multiple
                  value={reportConfig.includeIndustries}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    updateReportConfig('includeIndustries', selected);
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  size={6}
                >
                  {INDUSTRIES.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Регионы (оставьте пустым для всех)
                </label>
                <select
                  multiple
                  value={reportConfig.includeRegions}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    updateReportConfig('includeRegions', selected);
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  size={6}
                >
                  {MOSCOW_REGIONS.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Разделы отчёта */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Разделы отчёта</h3>

            <div className="space-y-3">
              {Object.entries(reportConfig.sections).map(([key, value]) => {
                const sectionNames = {
                  overview: 'Общая статистика',
                  industries: 'Анализ по отраслям',
                  regions: 'Анализ по регионам',
                  topEnterprises: 'Топ предприятия',
                  trends: 'Тренды и динамика'
                };

                return (
                  <label key={key} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => updateSection(key as keyof ReportConfig['sections'], e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-700">{sectionNames[key as keyof typeof sectionNames]}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Превью и генерация */}
        <div className="space-y-6">
          {/* Превью данных */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Превью данных</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Предприятий</span>
                </div>
                <span className="text-blue-900 font-bold">{formatNumber(filteredEnterprises.length)}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Общая выручка</span>
                </div>
                <span className="text-green-900 font-bold text-sm">
                  {formatCurrency(overallStats.totalRevenue)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">Сотрудников</span>
                </div>
                <span className="text-purple-900 font-bold">{formatNumber(overallStats.totalEmployees)}</span>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Период: {reportConfig.dateRange.from.toLocaleDateString('ru-RU')} - {reportConfig.dateRange.to.toLocaleDateString('ru-RU')}
                </p>
                {reportConfig.includeIndustries.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Отрасли: {reportConfig.includeIndustries.length}
                  </p>
                )}
                {reportConfig.includeRegions.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Регионы: {reportConfig.includeRegions.length}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Генерация отчёта */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Генерация отчёта</h3>

            <div className="space-y-3">
              <button
                onClick={() => handleGenerateReport('pdf')}
                disabled={generatingReport}
                className="w-full flex items-center justify-center space-x-2 p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {generatingReport ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <FileText className="w-5 h-5" />
                )}
                <span>Скачать PDF</span>
              </button>

              <button
                onClick={() => handleGenerateReport('excel')}
                disabled={generatingReport}
                className="w-full flex items-center justify-center space-x-2 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {generatingReport ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Download className="w-5 h-5" />
                )}
                <span>Скачать Excel</span>
              </button>

              <button
                onClick={() => handleGenerateReport('html')}
                disabled={generatingReport}
                className="w-full flex items-center justify-center space-x-2 p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {generatingReport ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Globe className="w-5 h-5" />
                )}
                <span>Скачать HTML</span>
              </button>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                💡 Отчёты генерируются на основе текущих фильтров и выбранных разделов
              </p>
            </div>
          </div>

          {/* Шаблоны отчётов */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Быстрые шаблоны</h3>

            <div className="space-y-2">
              <button
                onClick={() => setReportConfig({
                  ...reportConfig,
                  title: 'Отчёт по всем предприятиям',
                  includeIndustries: [],
                  includeRegions: [],
                  sections: {
                    overview: true,
                    industries: true,
                    regions: true,
                    topEnterprises: true,
                    trends: true
                  }
                })}
                className="w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
              >
                📊 Полный отчёт
              </button>

              <button
                onClick={() => setReportConfig({
                  ...reportConfig,
                  title: 'Краткая сводка',
                  sections: {
                    overview: true,
                    industries: false,
                    regions: false,
                    topEnterprises: true,
                    trends: false
                  }
                })}
                className="w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
              >
                📋 Краткая сводка
              </button>

              <button
                onClick={() => setReportConfig({
                  ...reportConfig,
                  title: 'Анализ по отраслям',
                  sections: {
                    overview: true,
                    industries: true,
                    regions: false,
                    topEnterprises: false,
                    trends: true
                  }
                })}
                className="w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
              >
                🏭 Отраслевой анализ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
