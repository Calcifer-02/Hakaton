// Файл для работы с данными о координатах предприятий для отображения на карте

import { Enterprise } from './src/app/types/enterprise';

/**
 * Интерфейс для данных маркера на карте
 */
export interface MapMarker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  industry: string;
  region: string;
  employees: number;
  revenue: number;
  address: string;
}

/**
 * Интерфейс для границ карты
 */
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

/**
 * Преобразует массив предприятий в массив маркеров для карты
 * Фильтрует предприятия без координат
 */
export function enterprisesToMapMarkers(enterprises: Enterprise[]): MapMarker[] {
  return enterprises
    .filter(enterprise =>
      enterprise.latitude !== null &&
      enterprise.latitude !== undefined &&
      enterprise.longitude !== null &&
      enterprise.longitude !== undefined
    )
    .map(enterprise => ({
      id: enterprise.id,
      name: enterprise.name,
      latitude: enterprise.latitude as number,
      longitude: enterprise.longitude as number,
      industry: enterprise.industry,
      region: enterprise.region,
      employees: enterprise.employees,
      revenue: enterprise.revenue,
      address: enterprise.contactInfo.address
    }));
}

/**
 * Вычисляет границы карты на основе массива маркеров
 */
export function calculateMapBounds(markers: MapMarker[]): MapBounds | null {
  if (markers.length === 0) {
    return null;
  }

  const latitudes = markers.map(m => m.latitude);
  const longitudes = markers.map(m => m.longitude);

  return {
    north: Math.max(...latitudes),
    south: Math.min(...latitudes),
    east: Math.max(...longitudes),
    west: Math.min(...longitudes)
  };
}

/**
 * Центр Москвы (координаты Кремля)
 */
export const MOSCOW_CENTER = {
  latitude: 55.7558,
  longitude: 37.6173
};

/**
 * Стандартные границы Москвы
 */
export const MOSCOW_BOUNDS: MapBounds = {
  north: 56.0214,
  south: 55.4922,
  east: 37.9671,
  west: 37.2674
};

/**
 * Группирует маркеры по регионам
 */
export function groupMarkersByRegion(markers: MapMarker[]): Record<string, MapMarker[]> {
  return markers.reduce((acc, marker) => {
    if (!acc[marker.region]) {
      acc[marker.region] = [];
    }
    acc[marker.region].push(marker);
    return acc;
  }, {} as Record<string, MapMarker[]>);
}

/**
 * Группирует маркеры по отраслям
 */
export function groupMarkersByIndustry(markers: MapMarker[]): Record<string, MapMarker[]> {
  return markers.reduce((acc, marker) => {
    if (!acc[marker.industry]) {
      acc[marker.industry] = [];
    }
    acc[marker.industry].push(marker);
    return acc;
  }, {} as Record<string, MapMarker[]>);
}

/**
 * Фильтрует маркеры по региону
 */
export function filterMarkersByRegion(markers: MapMarker[], regions: string[]): MapMarker[] {
  if (regions.length === 0) {
    return markers;
  }
  return markers.filter(marker => regions.includes(marker.region));
}

/**
 * Фильтрует маркеры по отрасли
 */
export function filterMarkersByIndustry(markers: MapMarker[], industries: string[]): MapMarker[] {
  if (industries.length === 0) {
    return markers;
  }
  return markers.filter(marker => industries.includes(marker.industry));
}

/**
 * Находит ближайшее предприятие к заданной точке
 */
export function findNearestMarker(
  latitude: number,
  longitude: number,
  markers: MapMarker[]
): MapMarker | null {
  if (markers.length === 0) {
    return null;
  }

  let nearest = markers[0];
  let minDistance = calculateDistance(latitude, longitude, nearest.latitude, nearest.longitude);

  for (const marker of markers) {
    const distance = calculateDistance(latitude, longitude, marker.latitude, marker.longitude);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = marker;
    }
  }

  return nearest;
}

/**
 * Вычисляет расстояние между двумя точками в километрах (формула гаверсинуса)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Радиус Земли в км
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Конвертирует градусы в радианы
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Получает цвет маркера в зависимости от отрасли
 */
export function getIndustryColor(industry: string): string {
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
}

/**
 * Статистика по маркерам
 */
export interface MapStatistics {
  totalMarkers: number;
  totalEnterprises: number;
  enterprisesWithCoordinates: number;
  enterprisesWithoutCoordinates: number;
  coveragePercentage: number;
  byRegion: Record<string, number>;
  byIndustry: Record<string, number>;
}

/**
 * Вычисляет статистику по картографическим данным
 */
export function calculateMapStatistics(
  allEnterprises: Enterprise[],
  markers: MapMarker[]
): MapStatistics {
  const byRegion = markers.reduce((acc, marker) => {
    acc[marker.region] = (acc[marker.region] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byIndustry = markers.reduce((acc, marker) => {
    acc[marker.industry] = (acc[marker.industry] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalEnterprises = allEnterprises.length;
  const enterprisesWithCoordinates = markers.length;
  const enterprisesWithoutCoordinates = totalEnterprises - enterprisesWithCoordinates;

  return {
    totalMarkers: markers.length,
    totalEnterprises,
    enterprisesWithCoordinates,
    enterprisesWithoutCoordinates,
    coveragePercentage: totalEnterprises > 0
      ? (enterprisesWithCoordinates / totalEnterprises) * 100
      : 0,
    byRegion,
    byIndustry
  };
}

/**
 * Экспортирует данные маркеров в формат GeoJSON
 */
export function exportToGeoJSON(markers: MapMarker[]): object {
  return {
    type: 'FeatureCollection',
    features: markers.map(marker => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [marker.longitude, marker.latitude]
      },
      properties: {
        id: marker.id,
        name: marker.name,
        industry: marker.industry,
        region: marker.region,
        employees: marker.employees,
        revenue: marker.revenue,
        address: marker.address
      }
    }))
  };
}

