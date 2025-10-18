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

// Создание кастомной иконки для маркера
const createCustomIcon = (industry: string) => {
  const color = getIndustryColor(industry);

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
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

interface MapViewProps {
  enterprises: Enterprise[];
  onMarkerClick: (enterprise: Enterprise) => void;
}

export default function MapView({ enterprises, onMarkerClick }: MapViewProps) {
  // Центр Москвы (Кремль)
  const moscowCenter: [number, number] = [55.7558, 37.6173];

  return (
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

        return (
          <Marker
            key={enterprise.id}
            position={[enterprise.latitude, enterprise.longitude]}
            icon={createCustomIcon(enterprise.industry)}
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
  );
}
