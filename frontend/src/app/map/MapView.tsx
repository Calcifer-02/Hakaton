'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Enterprise } from '../types/enterprise';

// Фикс для иконок Leaflet в Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Цвета для разных отраслей
const getIndustryColor = (industry: string): string => {
  const colors: Record<string, string> = {
    'Машиностроение': '#3B82F6',
    'Пищевая промышленность': '#10B981',
    'Химическая промышленность': '#F59E0B',
    'Текстильная промышленность': '#EC4899',
    'Металлургия': '#6B7280',
    'Электроника': '#8B5CF6',
    'Строительные материалы': '#EF4444',
    'Фармацевтика': '#14B8A6',
    'Автомобилестроение': '#F97316',
    'Полиграфия': '#06B6D4',
    'Другое': '#9CA3AF'
  };

  return colors[industry] || '#9CA3AF';
};

// Функция для расчета прибыльности предприятия
const calculateProfitability = (enterprise: Enterprise): number => {
  // Проверяем на деление на ноль или некорректные данные
  if (!enterprise.revenue || enterprise.revenue <= 0 || !enterprise.taxesPaid || enterprise.taxesPaid < 0) {
    return 0;
  }

  // Доля налогов от выручки
  const taxRate = enterprise.taxesPaid / enterprise.revenue;

  // Предполагаемый диапазон налоговой нагрузки от 5% до 25%
  const minTaxRate = 0.05;
  const maxTaxRate = 0.25;

  // Нормализуем в диапазон [0, 1]
  const normalizedTaxRate = Math.max(0, Math.min(1, (taxRate - minTaxRate) / (maxTaxRate - minTaxRate)));

  // Инверсия: больше налогов = меньше рентабельность
  // Базовая рентабельность от 5% до 30%
  const baseRentability = (1 - normalizedTaxRate) * 0.25 + 0.05;

  // Добавляем детерминированную вариацию на основе характеристик предприятия
  // Используем хеш от ID для стабильного "рандома"
  const hash = enterprise.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const pseudoRandom = (hash % 100) / 100; // 0-1

  // Размер предприятия влияет на эффективность (логарифмически)
  const sizeFactor = Math.log(enterprise.employees + 1) / Math.log(1000); // 0-1 для 1-1000 сотрудников

  // Отраслевой модификатор
  const industryModifiers: Record<string, number> = {
    'Информационные технологии': 0.15,
    'Фармацевтика': 0.12,
    'Электроника': 0.08,
    'Машиностроение': 0.05,
    'Химическая промышленность': 0.03,
    'Автомобилестроение': 0.02,
    'Металлургия': 0.0,
    'Строительные материалы': -0.02,
    'Пищевая промышленность': -0.03,
    'Текстильная промышленность': -0.05,
    'Полиграфия': -0.08,
    'Сельское хозяйство': -0.10
  };

  const industryBonus = industryModifiers[enterprise.industry] || 0;

  // Итоговая рентабельность с учетом всех факторов
  let finalRentability = baseRentability
    + (pseudoRandom - 0.5) * 0.1  // ±5% случайная вариация
    + sizeFactor * 0.05           // до +5% за размер
    + industryBonus;              // отраслевой модификатор

  // Ограничиваем разумными пределами (0-40%)
  finalRentability = Math.max(0.01, Math.min(0.40, finalRentability));

  // Отладочная информация (редко)
  if (Math.random() < 0.03) {
    console.log('Рентабельность для:', enterprise.name, {
      taxRate: (taxRate * 100).toFixed(1) + '%',
      baseRentability: (baseRentability * 100).toFixed(1) + '%',
      pseudoRandom: pseudoRandom.toFixed(2),
      sizeFactor: sizeFactor.toFixed(2),
      industryBonus: (industryBonus * 100).toFixed(1) + '%',
      final: (finalRentability * 100).toFixed(1) + '%'
    });
  }

  return finalRentability;
};

// Функция для преобразования HEX в RGB
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

// Функция для создания градиентного цвета на основе прибыльности
const getProfitabilityColor = (
  enterprise: Enterprise,
  baseColor: string,
  minProfitability: number,
  maxProfitability: number
): string => {
  const profitability = calculateProfitability(enterprise);

  // Нормализуем прибыльность в диапазон [0, 1]
  const normalizedProfitability = maxProfitability > minProfitability
    ? (profitability - minProfitability) / (maxProfitability - minProfitability)
    : 0.5;

  const baseRgb = hexToRgb(baseColor);

  // Создаем градиент от светло-серого (низкая прибыльность) до яркого цвета отрасли (высокая прибыльность)
  const lowProfitColor = { r: 200, g: 200, b: 200 }; // Светло-серый

  const r = Math.round(lowProfitColor.r + (baseRgb.r - lowProfitColor.r) * normalizedProfitability);
  const g = Math.round(lowProfitColor.g + (baseRgb.g - lowProfitColor.g) * normalizedProfitability);
  const b = Math.round(lowProfitColor.b + (baseRgb.b - lowProfitColor.b) * normalizedProfitability);

  return `rgb(${r}, ${g}, ${b})`;
};

// Создание кастомной иконки для маркера
const createCustomIcon = (
  enterprise: Enterprise,
  selectedIndustries: string[] = [],
  allEnterprises: Enterprise[] = []
) => {
  const baseColor = getIndustryColor(enterprise.industry);
  let markerColor = baseColor;

  // Если выбрана только одна отрасль и предприятие относится к ней, используем градиент
  if (selectedIndustries.length === 1 && selectedIndustries.includes(enterprise.industry)) {
    const industryEnterprises = allEnterprises.filter(e => e.industry === enterprise.industry);

    if (industryEnterprises.length > 1) {
      const profitabilities = industryEnterprises.map(calculateProfitability);
      const minProfitability = Math.min(...profitabilities);
      const maxProfitability = Math.max(...profitabilities);

      markerColor = getProfitabilityColor(enterprise, baseColor, minProfitability, maxProfitability);
    }
  }

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${markerColor};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

// Компонент для автоматического подстраивания границ карты
function MapBoundsUpdater({ enterprises }: { enterprises: Enterprise[] }) {
  const map = useMap();

  useEffect(() => {
    if (enterprises.length > 0) {
      const bounds = enterprises
        .filter(e => e.latitude && e.longitude)
        .map(e => [e.latitude!, e.longitude!] as [number, number]);

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [enterprises, map]);

  return null;
}

// Компонент легенды для градиентной раскраски
function ProfitabilityLegend({ selectedIndustries, enterprises }: {
  selectedIndustries: string[];
  enterprises: Enterprise[]
}) {
  // Показываем легенду только когда выбрана одна отрасль
  if (selectedIndustries.length !== 1) return null;

  const selectedIndustry = selectedIndustries[0];
  const industryEnterprises = enterprises.filter(e => e.industry === selectedIndustry);

  if (industryEnterprises.length <= 1) return null;

  const profitabilities = industryEnterprises.map(calculateProfitability);
  const minProfitability = Math.min(...profitabilities);
  const maxProfitability = Math.max(...profitabilities);
  const baseColor = getIndustryColor(selectedIndustry);

  const legendSteps = 5;
  const stepSize = (maxProfitability - minProfitability) / (legendSteps - 1);

  return (
    <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 z-10">
      <h4 className="text-sm font-semibold text-gray-900 mb-2">
        Рентабельность в отрасли `{selectedIndustry}`
      </h4>
      <div className="space-y-1">
        {Array.from({ length: legendSteps }, (_, i) => {
          const profitability = minProfitability + (stepSize * i);
          const normalizedProfitability = (profitability - minProfitability) / (maxProfitability - minProfitability);
          const baseRgb = hexToRgb(baseColor);
          const lowProfitColor = { r: 200, g: 200, b: 200 };

          const r = Math.round(lowProfitColor.r + (baseRgb.r - lowProfitColor.r) * normalizedProfitability);
          const g = Math.round(lowProfitColor.g + (baseRgb.g - lowProfitColor.g) * normalizedProfitability);
          const b = Math.round(lowProfitColor.b + (baseRgb.b - lowProfitColor.b) * normalizedProfitability);

          const color = `rgb(${r}, ${g}, ${b})`;

          return (
            <div key={i} className="flex items-center space-x-2 text-xs">
              <div
                className="w-4 h-4 rounded-full border border-white shadow-sm"
                style={{ backgroundColor: color }}
              />
              <span className="text-gray-600">
                {(profitability * 100).toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
        Выберите одну отрасль для<br/>градиентной раскраски
      </div>
    </div>
  );
}

interface MapViewProps {
  enterprises: Enterprise[];
  onMarkerClick: (enterprise: Enterprise) => void;
  selectedIndustries?: string[];
}

export default function MapView({ enterprises, onMarkerClick, selectedIndustries = [] }: MapViewProps) {
  // Центр Москвы (Кремль)
  const moscowCenter: [number, number] = [55.7558, 37.6173];

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={moscowCenter}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBoundsUpdater enterprises={enterprises} />

        {enterprises.map((enterprise) => {
          if (!enterprise.latitude || !enterprise.longitude ||
              isNaN(enterprise.latitude) || isNaN(enterprise.longitude)) {
            return null;
          }

          // Создаем уникальный ключ, который изменяется при смене режима градиента
          const isGradientMode = selectedIndustries.length === 1 && selectedIndustries.includes(enterprise.industry);
          const markerKey = `${enterprise.id}-${isGradientMode ? 'gradient' : 'normal'}-${selectedIndustries.join(',')}`;

          return (
            <Marker
              key={markerKey}
              position={[enterprise.latitude, enterprise.longitude]}
              icon={createCustomIcon(enterprise, selectedIndustries, enterprises)}
              eventHandlers={{
                click: () => onMarkerClick(enterprise)
              }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <h3 className="font-bold text-gray-900 mb-2">{enterprise.name}</h3>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-600">
                      <span className="font-medium">Отрасль:</span> {enterprise.industry}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Регион:</span> {enterprise.region}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Адрес:</span> {enterprise.contactInfo.address}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Сотрудники:</span> {enterprise.employees.toLocaleString('ru-RU')}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Выручка:</span> {enterprise.revenue.toLocaleString('ru-RU')} ₽
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Рентабельность:</span> {(calculateProfitability(enterprise) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <button
                    onClick={() => onMarkerClick(enterprise)}
                    className="mt-3 w-full bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Подробнее
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Легенда для градиентной раскраски */}
      <ProfitabilityLegend
        selectedIndustries={selectedIndustries}
        enterprises={enterprises}
      />
    </div>
  );
}
