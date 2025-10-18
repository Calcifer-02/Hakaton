// API клиент для работы с бэкендом

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

console.log('🔧 API_BASE_URL:', API_BASE_URL); // Для отладки

// Функция для получения токена из куки
function getAuthToken(): string | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'token' || name === 'auth_token') {
      return value;
    }
  }
  return null;
}

// Функция для создания headers с авторизацией
function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  processedCount: number;
  errorCount: number;
  errors: string[];
}

// Загрузка файла
export const uploadFile = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const token = getAuthToken();
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Ошибка загрузки: ${response.statusText}`);
  }

  return response.json();
};

// Получение всех предприятий с фильтрами
export const getEnterprises = async (filters?: {
  industries?: string[];
  regions?: string[];
  status?: string;
  minEmployees?: number;
  maxEmployees?: number;
  minRevenue?: number;
  maxRevenue?: number;
}) => {
  const params = new URLSearchParams();

  if (filters?.industries) {
    filters.industries.forEach(industry => params.append('industries', industry));
  }
  if (filters?.regions) {
    filters.regions.forEach(region => params.append('regions', region));
  }
  if (filters?.status) {
    params.append('status', filters.status);
  }
  if (filters?.minEmployees !== undefined) {
    params.append('minEmployees', filters.minEmployees.toString());
  }
  if (filters?.maxEmployees !== undefined) {
    params.append('maxEmployees', filters.maxEmployees.toString());
  }
  if (filters?.minRevenue !== undefined) {
    params.append('minRevenue', filters.minRevenue.toString());
  }
  if (filters?.maxRevenue !== undefined) {
    params.append('maxRevenue', filters.maxRevenue.toString());
  }

  const url = `${API_BASE_URL}/enterprises${params.toString() ? '?' + params.toString() : ''}`;
  console.log('🔍 Requesting URL:', url); // Отладка
  const response = await fetch(url, {
    headers: getHeaders(),
    credentials: 'include',
  });

  console.log('📡 Response status:', response.status, response.statusText); // Отладка

  if (!response.ok) {
    throw new Error(`Ошибка получения данных: ${response.statusText}`);
  }

  return response.json();
};

// Получение предприятия по ID
export const getEnterpriseById = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/enterprises/${id}`, {
    headers: getHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Ошибка получения данных: ${response.statusText}`);
  }

  return response.json();
};

// Получение статистики
export const getStatistics = async () => {
  const response = await fetch(`${API_BASE_URL}/statistics`, {
    headers: getHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Ошибка получения статистики: ${response.statusText}`);
  }

  return response.json();
};

// Очистка всех данных
export const clearAllData = async () => {
  const response = await fetch(`${API_BASE_URL}/enterprises`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Ошибка очистки данных: ${response.statusText}`);
  }

  return response.json();
};

// Проверка здоровья API
export const checkHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
};
