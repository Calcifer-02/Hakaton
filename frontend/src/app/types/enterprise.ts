// Типы данных для предприятий Москвы
export interface Enterprise {
  id: string;
  name: string;
  industry: string; // отрасль
  region: string; // регион Москвы
  employees: number; // количество сотрудников
  revenue: number; // выручка
  taxesPaid: number; // уплаченные налоги
  registrationDate: Date;
  lastUpdated: Date;
  status: 'active' | 'inactive' | 'suspended';
  contactInfo: {
    address: string;
    phone?: string;
    email?: string;
  };
}

// Типы для аналитики
export interface IndustryStats {
  industry: string;
  count: number;
  totalRevenue: number;
  averageEmployees: number;
}

export interface RegionStats {
  region: string;
  count: number;
  totalRevenue: number;
  averageEmployees: number;
}

export interface DataQuality {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  validationErrors: string[];
}

// Типы для фильтрации
export interface AnalyticsFilters {
  dateRange: {
    from: Date;
    to: Date;
  };
  industries: string[];
  regions: string[];
  employeeRange: {
    min: number;
    max: number;
  };
  revenueRange: {
    min: number;
    max: number;
  };
}

// Типы для загрузки данных
export interface UploadResult {
  success: boolean;
  message: string;
  processedCount: number;
  errorCount: number;
  errors: string[];
  data?: Enterprise[];
}
