import { Enterprise, IndustryStats, RegionStats, DataQuality, AnalyticsFilters } from '../types/enterprise';

// Аналитика по отраслям
export const calculateIndustryStats = (enterprises: Enterprise[]): IndustryStats[] => {
  const industryMap = new Map<string, { count: number; totalRevenue: number; totalEmployees: number }>();

  enterprises.forEach(enterprise => {
    const existing = industryMap.get(enterprise.industry) || { count: 0, totalRevenue: 0, totalEmployees: 0 };
    industryMap.set(enterprise.industry, {
      count: existing.count + 1,
      totalRevenue: existing.totalRevenue + enterprise.revenue,
      totalEmployees: existing.totalEmployees + enterprise.employees
    });
  });

  return Array.from(industryMap.entries()).map(([industry, stats]) => ({
    industry,
    count: stats.count,
    totalRevenue: stats.totalRevenue,
    averageEmployees: Math.round(stats.totalEmployees / stats.count)
  }));
};

// Аналитика по регионам
export const calculateRegionStats = (enterprises: Enterprise[]): RegionStats[] => {
  const regionMap = new Map<string, { count: number; totalRevenue: number; totalEmployees: number }>();

  enterprises.forEach(enterprise => {
    const existing = regionMap.get(enterprise.region) || { count: 0, totalRevenue: 0, totalEmployees: 0 };
    regionMap.set(enterprise.region, {
      count: existing.count + 1,
      totalRevenue: existing.totalRevenue + enterprise.revenue,
      totalEmployees: existing.totalEmployees + enterprise.employees
    });
  });

  return Array.from(regionMap.entries()).map(([region, stats]) => ({
    region,
    count: stats.count,
    totalRevenue: stats.totalRevenue,
    averageEmployees: Math.round(stats.totalEmployees / stats.count)
  }));
};

// Оценка качества данных
export const calculateDataQuality = (enterprises: Enterprise[]): DataQuality => {
  let validRecords = 0;
  const validationErrors: string[] = [];

  enterprises.forEach((enterprise, index) => {
    let isValid = true;
    const errors: string[] = [];

    if (!enterprise.name || enterprise.name.trim().length === 0) {
      errors.push('Отсутствует название');
      isValid = false;
    }

    if (!enterprise.contactInfo?.address || enterprise.contactInfo.address.trim().length === 0) {
      errors.push('Отсутствует адрес');
      isValid = false;
    }

    if (enterprise.employees < 0) {
      errors.push('Некорректное количество сотрудников');
      isValid = false;
    }

    if (enterprise.revenue < 0) {
      errors.push('Некорректная выручка');
      isValid = false;
    }

    if (isValid) {
      validRecords++;
    } else {
      validationErrors.push(`Запись ${index + 1}: ${errors.join(', ')}`);
    }
  });

  return {
    totalRecords: enterprises.length,
    validRecords,
    invalidRecords: enterprises.length - validRecords,
    validationErrors
  };
};

// Фильтрация данных
export const filterEnterprises = (enterprises: Enterprise[], filters: Partial<AnalyticsFilters>): Enterprise[] => {
  return enterprises.filter(enterprise => {
    // Фильтр по дате
    if (filters.dateRange) {
      const enterpriseDate = new Date(enterprise.registrationDate);
      if (enterpriseDate < filters.dateRange.from || enterpriseDate > filters.dateRange.to) {
        return false;
      }
    }

    // Фильтр по отраслям
    if (filters.industries && filters.industries.length > 0) {
      if (!filters.industries.includes(enterprise.industry)) {
        return false;
      }
    }

    // Фильтр по регионам
    if (filters.regions && filters.regions.length > 0) {
      if (!filters.regions.includes(enterprise.region)) {
        return false;
      }
    }

    // Фильтр по количеству сотрудников
    if (filters.employeeRange) {
      if (enterprise.employees < filters.employeeRange.min || enterprise.employees > filters.employeeRange.max) {
        return false;
      }
    }

    // Фильтр по выручке
    if (filters.revenueRange) {
      if (enterprise.revenue < filters.revenueRange.min || enterprise.revenue > filters.revenueRange.max) {
        return false;
      }
    }

    return true;
  });
};

// Расчет трендов по месяцам
export const calculateMonthlyTrends = (enterprises: Enterprise[]) => {
  const monthlyData = new Map<string, { count: number; revenue: number }>();

  enterprises.forEach(enterprise => {
    const date = new Date(enterprise.registrationDate);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    const existing = monthlyData.get(monthKey) || { count: 0, revenue: 0 };
    monthlyData.set(monthKey, {
      count: existing.count + 1,
      revenue: existing.revenue + enterprise.revenue
    });
  });

  return Array.from(monthlyData.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      count: data.count,
      revenue: data.revenue
    }));
};

// Топ предприятий по выручке
export const getTopEnterprisesByRevenue = (enterprises: Enterprise[], limit: number = 10): Enterprise[] => {
  return enterprises
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
};

// Топ предприятий по количеству сотрудников
export const getTopEnterprisesByEmployees = (enterprises: Enterprise[], limit: number = 10): Enterprise[] => {
  return enterprises
    .sort((a, b) => b.employees - a.employees)
    .slice(0, limit);
};

// Общая статистика
export const calculateOverallStats = (enterprises: Enterprise[]) => {
  const totalRevenue = enterprises.reduce((sum, e) => sum + e.revenue, 0);
  const totalEmployees = enterprises.reduce((sum, e) => sum + e.employees, 0);
  const totalTaxes = enterprises.reduce((sum, e) => sum + e.taxesPaid, 0);

  const activeCount = enterprises.filter(e => e.status === 'active').length;
  const inactiveCount = enterprises.filter(e => e.status === 'inactive').length;
  const suspendedCount = enterprises.filter(e => e.status === 'suspended').length;

  return {
    totalEnterprises: enterprises.length,
    totalRevenue,
    totalEmployees,
    totalTaxes,
    averageRevenue: enterprises.length > 0 ? totalRevenue / enterprises.length : 0,
    averageEmployees: enterprises.length > 0 ? totalEmployees / enterprises.length : 0,
    statusDistribution: {
      active: activeCount,
      inactive: inactiveCount,
      suspended: suspendedCount
    }
  };
};
