'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Filter, Download, TrendingUp, BarChart3, PieChart as PieIcon } from 'lucide-react';
import { Enterprise, AnalyticsFilters } from '../types/enterprise';
import { INDUSTRIES, MOSCOW_REGIONS, formatNumber, formatCurrency } from '../lib/data-utils';
import { calculateIndustryStats, calculateRegionStats, calculateMonthlyTrends, filterEnterprises } from '../lib/analytics';
import { getEnterprises } from '../lib/api-client';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#6366F1'];

export default function AnalyticsPage() {
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [filteredEnterprises, setFilteredEnterprises] = useState<Enterprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Partial<AnalyticsFilters>>({});

  useEffect(() => {
    // Загружаем данные из бэкенда
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await getEnterprises();
        if (response.success && response.data) {
          setEnterprises(response.data);
          setFilteredEnterprises(response.data);
        }
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    // Применяем фильтры
    const filtered = filterEnterprises(enterprises, filters);
    setFilteredEnterprises(filtered);
  }, [enterprises, filters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Загрузка данных...</div>
      </div>
    );
  }

  const industryStats = calculateIndustryStats(filteredEnterprises);
  const regionStats = calculateRegionStats(filteredEnterprises);
  const monthlyTrends = calculateMonthlyTrends(filteredEnterprises);

  const handleFilterChange = (key: string, value: unknown) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  return (
    <div className="space-y-8">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Аналитика предприятий</h1>
          <p className="text-gray-600 mt-2">
            Детальный анализ данных {filteredEnterprises.length} предприятий из {enterprises.length}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            <span>Фильтры</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="w-4 h-4" />
            <span>Экспорт</span>
          </button>
        </div>
      </div>

      {/* Фильтры */}
      {showFilters && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Фильтры</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Очистить все
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Фильтр по отраслям */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Отрасли
              </label>
              <select
                multiple
                className="w-full p-2 border border-gray-300 rounded-lg"
                value={filters.industries || []}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  handleFilterChange('industries', selected);
                }}
              >
                {INDUSTRIES.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>

            {/* Фильтр по регионам */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Регионы
              </label>
              <select
                multiple
                className="w-full p-2 border border-gray-300 rounded-lg"
                value={filters.regions || []}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  handleFilterChange('regions', selected);
                }}
              >
                {MOSCOW_REGIONS.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            {/* Фильтр по количеству сотрудников */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Сотрудники (от-до)
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="От"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  value={filters.employeeRange?.min || ''}
                  onChange={(e) => {
                    const min = parseInt(e.target.value) || 0;
                    handleFilterChange('employeeRange', {
                      ...filters.employeeRange,
                      min,
                      max: filters.employeeRange?.max || 10000
                    });
                  }}
                />
                <input
                  type="number"
                  placeholder="До"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  value={filters.employeeRange?.max || ''}
                  onChange={(e) => {
                    const max = parseInt(e.target.value) || 10000;
                    handleFilterChange('employeeRange', {
                      ...filters.employeeRange,
                      min: filters.employeeRange?.min || 0,
                      max
                    });
                  }}
                />
              </div>
            </div>

            {/* Фильтр по выручке */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Выручка (млн руб.)
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="От"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  value={filters.revenueRange?.min ? filters.revenueRange.min / 1000000 : ''}
                  onChange={(e) => {
                    const min = (parseInt(e.target.value) || 0) * 1000000;
                    handleFilterChange('revenueRange', {
                      ...filters.revenueRange,
                      min,
                      max: filters.revenueRange?.max || 1000000000
                    });
                  }}
                />
                <input
                  type="number"
                  placeholder="До"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  value={filters.revenueRange?.max ? filters.revenueRange.max / 1000000 : ''}
                  onChange={(e) => {
                    const max = (parseInt(e.target.value) || 1000) * 1000000;
                    handleFilterChange('revenueRange', {
                      ...filters.revenueRange,
                      min: filters.revenueRange?.min || 0,
                      max
                    });
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Статистические карточки */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Общая выручка</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(filteredEnterprises.reduce((sum, e) => sum + e.revenue, 0))}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Всего сотрудников</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(filteredEnterprises.reduce((sum, e) => sum + e.employees, 0))}
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Средняя выручка</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(
                  filteredEnterprises.length > 0
                    ? filteredEnterprises.reduce((sum, e) => sum + e.revenue, 0) / filteredEnterprises.length
                    : 0
                )}
              </p>
            </div>
            <PieIcon className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Графики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* График по отраслям */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Распределение по отраслям</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={industryStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="industry"
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  name === 'count' ? formatNumber(value as number) : formatCurrency(value as number),
                  name === 'count' ? 'Количество' : 'Выручка'
                ]}
              />
              <Bar dataKey="count" fill="#3B82F6" name="count" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Круговая диаграмма по регионам */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Распределение по регионам</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={regionStats.slice(0, 8).map(item => ({ ...item, name: item.region, value: item.count }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {regionStats.slice(0, 8).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [formatNumber(value as number), 'Количество']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Тренды по месяцам */}
        <div className="bg-white p-6 rounded-lg shadow-sm border lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Динамика регистрации предприятий</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  formatNumber(value as number),
                  name === 'count' ? 'Количество' : 'Выручка'
                ]}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3B82F6"
                strokeWidth={2}
                name="count"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Таблица топ предприятий */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Топ предприятий по выручке</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Название
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Отрасль
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Регион
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Сотрудники
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Выручка
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEnterprises
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 10)
                .map((enterprise) => (
                  <tr key={enterprise.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {enterprise.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {enterprise.industry}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {enterprise.region}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatNumber(enterprise.employees)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(enterprise.revenue)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
