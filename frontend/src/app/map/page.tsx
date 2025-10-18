'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Filter, X, Loader2, Building2, Users, DollarSign } from 'lucide-react';
import { Enterprise } from '../types/enterprise';
import { getEnterprises } from '../lib/api-client';
import { INDUSTRIES, MOSCOW_REGIONS, formatNumber, formatCurrency } from '../lib/data-utils';

// Динамический импорт карты (только на клиенте)
const MapView = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  )
});

export default function MapPage() {
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [filteredEnterprises, setFilteredEnterprises] = useState<Enterprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedEnterprise, setSelectedEnterprise] = useState<Enterprise | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await getEnterprises();

        if (response.success && response.data) {
          // Преобразуем данные и нормализуем типы
          const normalizedData = response.data.map(enterprise => ({
            ...enterprise,
            // Принудительно преобразуем координаты в числа
            latitude: enterprise.latitude !== null && enterprise.latitude !== undefined
              ? Number(enterprise.latitude)
              : null,
            longitude: enterprise.longitude !== null && enterprise.longitude !== undefined
              ? Number(enterprise.longitude)
              : null,
            // Преобразуем даты из строк
            registrationDate: new Date(enterprise.registrationDate),
            lastUpdated: new Date(enterprise.lastUpdated)
          }));

          setEnterprises(normalizedData);
          setFilteredEnterprises(normalizedData);
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
    let filtered = enterprises;

    if (selectedRegions.length > 0) {
      filtered = filtered.filter(e => selectedRegions.includes(e.region));
    }

    if (selectedIndustries.length > 0) {
      filtered = filtered.filter(e => selectedIndustries.includes(e.industry));
    }

    setFilteredEnterprises(filtered);
  }, [enterprises, selectedRegions, selectedIndustries]);

  const toggleRegion = (region: string) => {
    setSelectedRegions(prev =>
      prev.includes(region)
        ? prev.filter(r => r !== region)
        : [...prev, region]
    );
  };

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries(prev =>
      prev.includes(industry)
        ? prev.filter(i => i !== industry)
        : [...prev, industry]
    );
  };

  const clearFilters = () => {
    setSelectedRegions([]);
    setSelectedIndustries([]);
  };

  const enterprisesWithCoordinates = filteredEnterprises.filter(
    e => e.latitude !== null && e.latitude !== undefined &&
         e.longitude !== null && e.longitude !== undefined
  );

  const hasActiveFilters = selectedRegions.length > 0 || selectedIndustries.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-600">Загрузка данных о предприятиях...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Заголовок */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
            <MapPin className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Карта предприятий</h1>
            <p className="text-sm text-gray-600">
              Показано {enterprisesWithCoordinates.length} из {filteredEnterprises.length} предприятий
              {enterprisesWithCoordinates.length < filteredEnterprises.length && (
                <span className="text-orange-600 ml-2">
                  ({filteredEnterprises.length - enterprisesWithCoordinates.length} без координат)
                </span>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            showFilters || hasActiveFilters
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Filter className="w-5 h-5" />
          <span>Фильтры</span>
          {hasActiveFilters && (
            <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-medium">
              {selectedRegions.length + selectedIndustries.length}
            </span>
          )}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Панель фильтров */}
        {showFilters && (
          <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Фильтры</h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Сбросить все
                  </button>
                )}
              </div>

              {/* Фильтр по регионам */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Регионы Москвы</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {MOSCOW_REGIONS.map(region => {
                    const count = enterprises.filter(e => e.region === region).length;
                    const isSelected = selectedRegions.includes(region);

                    return (
                      <label
                        key={region}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleRegion(region)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className={`text-sm ${isSelected ? 'text-blue-900 font-medium' : 'text-gray-700'}`}>
                            {region}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">{count}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Фильтр по отраслям */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Отрасли</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {INDUSTRIES.map(industry => {
                    const count = enterprises.filter(e => e.industry === industry).length;
                    const isSelected = selectedIndustries.includes(industry);

                    return (
                      <label
                        key={industry}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleIndustry(industry)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className={`text-sm ${isSelected ? 'text-blue-900 font-medium' : 'text-gray-700'}`}>
                            {industry}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">{count}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Основная область с картой */}
        <div className="flex-1 relative">
          <MapView
            enterprises={enterprisesWithCoordinates}
            onMarkerClick={setSelectedEnterprise}
          />
        </div>

        {/* Боковая панель с информацией о выбранном предприятии */}
        {selectedEnterprise && (
          <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 pr-8">
                  {selectedEnterprise.name}
                </h2>
                <button
                  onClick={() => setSelectedEnterprise(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                    <Building2 className="w-4 h-4" />
                    <span>Отрасль</span>
                  </div>
                  <p className="text-gray-900 font-medium">{selectedEnterprise.industry}</p>
                </div>

                <div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                    <MapPin className="w-4 h-4" />
                    <span>Регион</span>
                  </div>
                  <p className="text-gray-900 font-medium">{selectedEnterprise.region}</p>
                </div>

                <div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                    <MapPin className="w-4 h-4" />
                    <span>Адрес</span>
                  </div>
                  <p className="text-gray-900">{selectedEnterprise.contactInfo.address}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                      <Users className="w-4 h-4" />
                      <span>Сотрудники</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {formatNumber(selectedEnterprise.employees)}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                      <DollarSign className="w-4 h-4" />
                      <span>Выручка</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(selectedEnterprise.revenue)}
                    </p>
                  </div>
                </div>

                {selectedEnterprise.contactInfo.phone && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-500 mb-1">Телефон</p>
                    <a
                      href={`tel:${selectedEnterprise.contactInfo.phone}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {selectedEnterprise.contactInfo.phone}
                    </a>
                  </div>
                )}

                {selectedEnterprise.contactInfo.email && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <a
                      href={`mailto:${selectedEnterprise.contactInfo.email}`}
                      className="text-blue-600 hover:text-blue-700 font-medium break-all"
                    >
                      {selectedEnterprise.contactInfo.email}
                    </a>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-1">Статус</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    selectedEnterprise.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : selectedEnterprise.status === 'inactive'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedEnterprise.status === 'active' ? 'Активно' :
                     selectedEnterprise.status === 'inactive' ? 'Неактивно' : 'Приостановлено'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
