module.exports = [
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[project]/src/app/lib/data-utils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "INDUSTRIES",
    ()=>INDUSTRIES,
    "MOSCOW_REGIONS",
    ()=>MOSCOW_REGIONS,
    "formatCurrency",
    ()=>formatCurrency,
    "formatCurrencyCompact",
    ()=>formatCurrencyCompact,
    "formatNumber",
    ()=>formatNumber,
    "generateSampleData",
    ()=>generateSampleData,
    "parseCSV",
    ()=>parseCSV,
    "parseExcel",
    ()=>parseExcel,
    "validateEnterprise",
    ()=>validateEnterprise
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/xlsx/xlsx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$papaparse$2f$papaparse$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/papaparse/papaparse.js [app-ssr] (ecmascript)");
;
;
const MOSCOW_REGIONS = [
    'Центральный',
    'Северный',
    'Северо-Восточный',
    'Восточный',
    'Юго-Восточный',
    'Южный',
    'Юго-Западный',
    'Западный',
    'Северо-Западный',
    'Новомосковский',
    'Троицкий'
];
const INDUSTRIES = [
    'Машиностроение',
    'Пищевая промышленность',
    'Химическая промышленность',
    'Текстильная промышленность',
    'Металлургия',
    'Электроника',
    'Строительные материалы',
    'Фармацевтика',
    'Автомобилестроение',
    'Полиграфия',
    'Информационные технологии',
    'Сельское хозяйство',
    'Другое'
];
const validateEnterprise = (data)=>{
    const errors = [];
    if (!data.name || typeof data.name !== 'string') {
        errors.push('Некорректное название предприятия');
    }
    if (!data.industry || !INDUSTRIES.includes(data.industry)) {
        errors.push('Некорректная отрасль');
    }
    if (!data.region || !MOSCOW_REGIONS.includes(data.region)) {
        errors.push('Некорректный регион');
    }
    if (!data.employees || Number(data.employees) < 0) {
        errors.push('Некорректное количество сотрудников');
    }
    if (!data.revenue || Number(data.revenue) < 0) {
        errors.push('Некорректная выручка');
    }
    const contactInfo = data.contactInfo;
    if (!contactInfo?.address) {
        errors.push('Отсутствует адрес');
    }
    return {
        isValid: errors.length === 0,
        errors
    };
};
const parseCSV = (file)=>{
    return new Promise((resolve)=>{
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$papaparse$2f$papaparse$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].parse(file, {
            header: true,
            complete: (results)=>{
                const enterprises = [];
                const errors = [];
                let errorCount = 0;
                results.data.forEach((row, index)=>{
                    const rowData = row;
                    const validation = validateEnterprise(rowData);
                    if (validation.isValid) {
                        const enterprise = {
                            id: crypto.randomUUID(),
                            name: String(rowData.name),
                            industry: String(rowData.industry),
                            region: String(rowData.region),
                            employees: parseInt(String(rowData.employees)) || 0,
                            revenue: parseFloat(String(rowData.revenue)) || 0,
                            taxesPaid: parseFloat(String(rowData.taxesPaid)) || 0,
                            registrationDate: new Date(String(rowData.registrationDate) || Date.now()),
                            lastUpdated: new Date(),
                            status: rowData.status || 'active',
                            contactInfo: {
                                address: String(rowData.address),
                                phone: String(rowData.phone || ''),
                                email: String(rowData.email || '')
                            }
                        };
                        enterprises.push(enterprise);
                    } else {
                        errorCount++;
                        errors.push(`Строка ${index + 1}: ${validation.errors.join(', ')}`);
                    }
                });
                resolve({
                    success: true,
                    message: `Обработано ${enterprises.length} записей из ${results.data.length}`,
                    processedCount: enterprises.length,
                    errorCount,
                    errors,
                    data: enterprises
                });
            },
            error: (error)=>{
                resolve({
                    success: false,
                    message: `Ошибка парсинга CSV: ${error.message}`,
                    processedCount: 0,
                    errorCount: 1,
                    errors: [
                        error.message
                    ]
                });
            }
        });
    });
};
const parseExcel = (file)=>{
    return new Promise((resolve)=>{
        const reader = new FileReader();
        reader.onload = (e)=>{
            try {
                const data = e.target?.result;
                const workbook = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["read"](data, {
                    type: 'binary'
                });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["utils"].sheet_to_json(worksheet);
                const enterprises = [];
                const errors = [];
                let errorCount = 0;
                jsonData.forEach((row, index)=>{
                    const rowData = row;
                    const validation = validateEnterprise(rowData);
                    if (validation.isValid) {
                        const enterprise = {
                            id: crypto.randomUUID(),
                            name: String(rowData.name),
                            industry: String(rowData.industry),
                            region: String(rowData.region),
                            employees: parseInt(String(rowData.employees)) || 0,
                            revenue: parseFloat(String(rowData.revenue)) || 0,
                            taxesPaid: parseFloat(String(rowData.taxesPaid)) || 0,
                            registrationDate: new Date(String(rowData.registrationDate) || Date.now()),
                            lastUpdated: new Date(),
                            status: rowData.status || 'active',
                            contactInfo: {
                                address: String(rowData.address),
                                phone: String(rowData.phone || ''),
                                email: String(rowData.email || '')
                            }
                        };
                        enterprises.push(enterprise);
                    } else {
                        errorCount++;
                        errors.push(`Строка ${index + 1}: ${validation.errors.join(', ')}`);
                    }
                });
                resolve({
                    success: true,
                    message: `Обработано ${enterprises.length} записей из ${jsonData.length}`,
                    processedCount: enterprises.length,
                    errorCount,
                    errors,
                    data: enterprises
                });
            } catch (error) {
                resolve({
                    success: false,
                    message: `Ошибка парсинга Excel: ${error.message}`,
                    processedCount: 0,
                    errorCount: 1,
                    errors: [
                        error.message
                    ]
                });
            }
        };
        reader.readAsBinaryString(file);
    });
};
const formatNumber = (num)=>{
    return new Intl.NumberFormat('ru-RU').format(num);
};
const formatCurrency = (amount)=>{
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0,
        minimumFractionDigits: 0
    }).format(amount);
};
const formatCurrencyCompact = (amount)=>{
    if (amount >= 1_000_000_000) {
        return `${(amount / 1_000_000_000).toFixed(1)}млрд₽`;
    } else if (amount >= 1_000_000) {
        return `${(amount / 1_000_000).toFixed(1)}млн₽`;
    } else if (amount >= 1_000) {
        return `${(amount / 1_000).toFixed(0)}тыс₽`;
    }
    return `${amount}₽`;
};
const generateSampleData = (count = 100)=>{
    const sampleData = [];
    for(let i = 0; i < count; i++){
        const enterprise = {
            id: crypto.randomUUID(),
            name: `Предприятие ${i + 1}`,
            industry: INDUSTRIES[Math.floor(Math.random() * INDUSTRIES.length)],
            region: MOSCOW_REGIONS[Math.floor(Math.random() * MOSCOW_REGIONS.length)],
            employees: Math.floor(Math.random() * 1000) + 10,
            revenue: Math.floor(Math.random() * 100000000) + 1000000,
            taxesPaid: Math.floor(Math.random() * 10000000) + 100000,
            registrationDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 5),
            lastUpdated: new Date(),
            status: Math.random() > 0.1 ? 'active' : Math.random() > 0.5 ? 'inactive' : 'suspended',
            contactInfo: {
                address: `Москва, улица ${i + 1}, дом ${Math.floor(Math.random() * 100) + 1}`,
                phone: `+7-495-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 90) + 10}`,
                email: `contact${i + 1}@enterprise.ru`
            }
        };
        sampleData.push(enterprise);
    }
    return sampleData;
};
}),
"[project]/src/app/lib/analytics.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculateDataQuality",
    ()=>calculateDataQuality,
    "calculateIndustryStats",
    ()=>calculateIndustryStats,
    "calculateMonthlyTrends",
    ()=>calculateMonthlyTrends,
    "calculateOverallStats",
    ()=>calculateOverallStats,
    "calculateRegionStats",
    ()=>calculateRegionStats,
    "filterEnterprises",
    ()=>filterEnterprises,
    "getTopEnterprisesByEmployees",
    ()=>getTopEnterprisesByEmployees,
    "getTopEnterprisesByRevenue",
    ()=>getTopEnterprisesByRevenue
]);
const calculateIndustryStats = (enterprises)=>{
    const industryMap = new Map();
    enterprises.forEach((enterprise)=>{
        const existing = industryMap.get(enterprise.industry) || {
            count: 0,
            totalRevenue: 0,
            totalEmployees: 0
        };
        industryMap.set(enterprise.industry, {
            count: existing.count + 1,
            totalRevenue: existing.totalRevenue + enterprise.revenue,
            totalEmployees: existing.totalEmployees + enterprise.employees
        });
    });
    return Array.from(industryMap.entries()).map(([industry, stats])=>({
            industry,
            count: stats.count,
            totalRevenue: stats.totalRevenue,
            averageEmployees: Math.round(stats.totalEmployees / stats.count)
        }));
};
const calculateRegionStats = (enterprises)=>{
    const regionMap = new Map();
    enterprises.forEach((enterprise)=>{
        const existing = regionMap.get(enterprise.region) || {
            count: 0,
            totalRevenue: 0,
            totalEmployees: 0
        };
        regionMap.set(enterprise.region, {
            count: existing.count + 1,
            totalRevenue: existing.totalRevenue + enterprise.revenue,
            totalEmployees: existing.totalEmployees + enterprise.employees
        });
    });
    return Array.from(regionMap.entries()).map(([region, stats])=>({
            region,
            count: stats.count,
            totalRevenue: stats.totalRevenue,
            averageEmployees: Math.round(stats.totalEmployees / stats.count)
        }));
};
const calculateDataQuality = (enterprises)=>{
    let validRecords = 0;
    const validationErrors = [];
    enterprises.forEach((enterprise, index)=>{
        let isValid = true;
        const errors = [];
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
const filterEnterprises = (enterprises, filters)=>{
    return enterprises.filter((enterprise)=>{
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
const calculateMonthlyTrends = (enterprises)=>{
    const monthlyData = new Map();
    enterprises.forEach((enterprise)=>{
        const date = new Date(enterprise.registrationDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const existing = monthlyData.get(monthKey) || {
            count: 0,
            revenue: 0
        };
        monthlyData.set(monthKey, {
            count: existing.count + 1,
            revenue: existing.revenue + enterprise.revenue
        });
    });
    return Array.from(monthlyData.entries()).sort(([a], [b])=>a.localeCompare(b)).map(([month, data])=>({
            month,
            count: data.count,
            revenue: data.revenue
        }));
};
const getTopEnterprisesByRevenue = (enterprises, limit = 10)=>{
    return enterprises.sort((a, b)=>b.revenue - a.revenue).slice(0, limit);
};
const getTopEnterprisesByEmployees = (enterprises, limit = 10)=>{
    return enterprises.sort((a, b)=>b.employees - a.employees).slice(0, limit);
};
const calculateOverallStats = (enterprises)=>{
    const totalRevenue = enterprises.reduce((sum, e)=>sum + e.revenue, 0);
    const totalEmployees = enterprises.reduce((sum, e)=>sum + e.employees, 0);
    const totalTaxes = enterprises.reduce((sum, e)=>sum + e.taxesPaid, 0);
    const activeCount = enterprises.filter((e)=>e.status === 'active').length;
    const inactiveCount = enterprises.filter((e)=>e.status === 'inactive').length;
    const suspendedCount = enterprises.filter((e)=>e.status === 'suspended').length;
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
}),
"[project]/src/app/lib/api-client.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// API клиент для работы с бэкендом
__turbopack_context__.s([
    "checkHealth",
    ()=>checkHealth,
    "clearAllData",
    ()=>clearAllData,
    "getEnterpriseById",
    ()=>getEnterpriseById,
    "getEnterprises",
    ()=>getEnterprises,
    "getStatistics",
    ()=>getStatistics,
    "uploadFile",
    ()=>uploadFile
]);
const API_BASE_URL = ("TURBOPACK compile-time value", "http://localhost:4000/api") || 'http://localhost:4000/api';
// Функция для получения токена из куки
function getAuthToken() {
    if (typeof document === 'undefined') return null;
    const cookies = document.cookie.split(';');
    for (const cookie of cookies){
        const [name, value] = cookie.trim().split('=');
        if (name === 'token' || name === 'auth_token') {
            return value;
        }
    }
    return null;
}
// Функция для создания headers с авторизацией
function getHeaders() {
    const headers = {
        'Content-Type': 'application/json'
    };
    const token = getAuthToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}
const uploadFile = async (file)=>{
    const formData = new FormData();
    formData.append('file', file);
    const token = getAuthToken();
    const headers = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
        headers,
        credentials: 'include'
    });
    if (!response.ok) {
        throw new Error(`Ошибка загрузки: ${response.statusText}`);
    }
    return response.json();
};
const getEnterprises = async (filters)=>{
    const params = new URLSearchParams();
    if (filters?.industries) {
        filters.industries.forEach((industry)=>params.append('industries', industry));
    }
    if (filters?.regions) {
        filters.regions.forEach((region)=>params.append('regions', region));
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
    const response = await fetch(url, {
        headers: getHeaders(),
        credentials: 'include'
    });
    if (!response.ok) {
        throw new Error(`Ошибка получения данных: ${response.statusText}`);
    }
    return response.json();
};
const getEnterpriseById = async (id)=>{
    const response = await fetch(`${API_BASE_URL}/enterprises/${id}`, {
        headers: getHeaders(),
        credentials: 'include'
    });
    if (!response.ok) {
        throw new Error(`Ошибка получения данных: ${response.statusText}`);
    }
    return response.json();
};
const getStatistics = async ()=>{
    const response = await fetch(`${API_BASE_URL}/statistics`, {
        headers: getHeaders(),
        credentials: 'include'
    });
    if (!response.ok) {
        throw new Error(`Ошибка получения статистики: ${response.statusText}`);
    }
    return response.json();
};
const clearAllData = async ()=>{
    const response = await fetch(`${API_BASE_URL}/enterprises`, {
        method: 'DELETE'
    });
    if (!response.ok) {
        throw new Error(`Ошибка очистки данных: ${response.statusText}`);
    }
    return response.json();
};
const checkHealth = async ()=>{
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        return response.ok;
    } catch  {
        return false;
    }
};
}),
"[externals]/module [external] (module, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("module", () => require("module"));

module.exports = mod;
}),
"[project]/src/app/lib/report-generator.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateExcelReport",
    ()=>generateExcelReport,
    "generateHTMLReport",
    ()=>generateHTMLReport,
    "generatePDFReport",
    ()=>generatePDFReport,
    "generateSimplePDFReport",
    ()=>generateSimplePDFReport
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/xlsx/xlsx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$es$2e$min$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jspdf/dist/jspdf.es.min.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jspdf-autotable/dist/jspdf.plugin.autotable.mjs [app-ssr] (ecmascript)");
;
;
;
// Динамический импорт pdfMake только когда он нужен
let pdfMake = null;
// Асинхронная инициализация pdfMake с улучшенной обработкой ошибок
const initializePdfMake = async ()=>{
    if (!pdfMake) {
        try {
            const pdfMakeModule = await __turbopack_context__.A("[project]/node_modules/pdfmake/build/pdfmake.js [app-ssr] (ecmascript, async loader)");
            const pdfFontsModule = await __turbopack_context__.A("[project]/node_modules/pdfmake/build/vfs_fonts.js [app-ssr] (ecmascript, async loader)");
            pdfMake = pdfMakeModule.default || pdfMakeModule;
            // Проверяем различные способы доступа к шрифтам
            if (pdfFontsModule.default?.pdfMake?.vfs) {
                pdfMake.vfs = pdfFontsModule.default.pdfMake.vfs;
            } else if (pdfFontsModule.pdfMake?.vfs) {
                pdfMake.vfs = pdfFontsModule.pdfMake.vfs;
            } else if (pdfFontsModule.vfs) {
                pdfMake.vfs = pdfFontsModule.vfs;
            } else {
                console.warn('Не удалось найти шрифты pdfMake, используем стандартные');
                // Создаем пустой объект vfs для базовой работы
                pdfMake.vfs = {};
            }
            console.log('pdfMake успешно инициализирован');
        } catch (error) {
            console.error('Ошибка инициализации pdfMake:', error);
            pdfMake = null;
            throw error;
        }
    }
    return pdfMake;
};
// Форматирование валюты для отчетов
const formatCurrencyForExport = (value)=>{
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
};
// Форматирование чисел
const formatNumberForExport = (value)=>{
    return new Intl.NumberFormat('ru-RU').format(value);
};
const generateExcelReport = (reportData)=>{
    const workbook = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["utils"].book_new();
    // Лист 1: Общая информация
    const summaryData = [
        [
            'ОТЧЁТ ПО ПРЕДПРИЯТИЯМ МОСКВЫ'
        ],
        [
            ''
        ],
        [
            'Название отчёта:',
            reportData.title
        ],
        [
            'Дата создания:',
            new Date().toLocaleString('ru-RU')
        ],
        [
            'Период:',
            `${reportData.period.from} - ${reportData.period.to}`
        ],
        [
            ''
        ],
        [
            'ОБЩАЯ СТАТИСТИКА'
        ],
        [
            'Всего предприятий:',
            reportData.stats.totalEnterprises
        ],
        [
            'Общая выручка:',
            formatCurrencyForExport(reportData.stats.totalRevenue)
        ],
        [
            'Всего сотрудников:',
            formatNumberForExport(reportData.stats.totalEmployees)
        ],
        [
            'Средняя выручка:',
            formatCurrencyForExport(reportData.stats.averageRevenue)
        ],
        [
            'Средняя численность:',
            formatNumberForExport(Math.round(reportData.stats.averageEmployees))
        ]
    ];
    const summarySheet = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["utils"].aoa_to_sheet(summaryData);
    // Применяем стили к заголовкам
    if (!summarySheet['!merges']) summarySheet['!merges'] = [];
    summarySheet['!merges'].push({
        s: {
            r: 0,
            c: 0
        },
        e: {
            r: 0,
            c: 1
        }
    }, {
        s: {
            r: 6,
            c: 0
        },
        e: {
            r: 6,
            c: 1
        }
    } // Объединяем ячейки для "ОБЩАЯ СТАТИСТИКА"
    );
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["utils"].book_append_sheet(workbook, summarySheet, 'Общая информация');
    // Лист 2: Предприятия
    if (reportData.enterprises.length > 0) {
        const enterprisesData = reportData.enterprises.map((e)=>({
                'Название': e.name,
                'Отрасль': e.industry,
                'Регион': e.region,
                'Сотрудники': e.employees,
                'Выручка (руб.)': e.revenue,
                'Налоги (руб.)': e.taxesPaid,
                'Дата регистрации': e.registrationDate,
                'Статус': e.status === 'active' ? 'Активно' : e.status === 'inactive' ? 'Неактивно' : 'Приостановлено',
                'Адрес': e.contactInfo.address,
                'Телефон': e.contactInfo.phone || '-',
                'Email': e.contactInfo.email || '-',
                'Координаты': e.latitude && e.longitude ? `${e.latitude}, ${e.longitude}` : '-'
            }));
        const enterprisesSheet = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["utils"].json_to_sheet(enterprisesData);
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["utils"].book_append_sheet(workbook, enterprisesSheet, 'Предприятия');
    }
    // Лист 3: Статистика по отраслям
    if (reportData.industryStats && reportData.industryStats.length > 0) {
        const industryData = reportData.industryStats.map((i)=>({
                'Отрасль': i.industry,
                'Количество предприятий': i.count,
                'Общая выручка (руб.)': i.totalRevenue,
                'Средняя численность': i.averageEmployees
            }));
        const industrySheet = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["utils"].json_to_sheet(industryData);
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["utils"].book_append_sheet(workbook, industrySheet, 'По отраслям');
    }
    // Лист 4: Статистика по регионам
    if (reportData.regionStats && reportData.regionStats.length > 0) {
        const regionData = reportData.regionStats.map((r)=>({
                'Регион': r.region,
                'Количество предприятий': r.count,
                'Общая выручка (руб.)': r.totalRevenue,
                'Средняя численность': r.averageEmployees
            }));
        const regionSheet = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["utils"].json_to_sheet(regionData);
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["utils"].book_append_sheet(workbook, regionSheet, 'По регионам');
    }
    // Сохранение файла с русским названием
    const fileName = `Отчёт_предприятия_Москвы_${new Date().toISOString().split('T')[0]}.xlsx`;
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["writeFile"](workbook, fileName);
    return fileName;
};
const generatePDFReport = async (reportData)=>{
    try {
        console.log('Начинаем генерацию PDF отчета...');
        // Инициализируем pdfMake асинхронно
        const pdf = await initializePdfMake();
        if (!pdf) {
            console.log('pdfMake не доступен, переключаемся на jsPDF');
            return generateSimplePDFReport(reportData);
        }
        console.log('Создаем структуру документа...');
        // Определяем документ с поддержкой русского языка
        const docDefinition = {
            pageSize: 'A4',
            pageMargins: [
                40,
                60,
                40,
                60
            ],
            content: [
                // Заголовок
                {
                    text: 'ОТЧЁТ ПО ПРЕДПРИЯТИЯМ МОСКВЫ',
                    style: 'header',
                    alignment: 'center',
                    margin: [
                        0,
                        0,
                        0,
                        20
                    ]
                },
                // Информация о отчете
                {
                    columns: [
                        {
                            width: '50%',
                            stack: [
                                {
                                    text: `Название: ${reportData.title}`,
                                    style: 'subheader'
                                },
                                {
                                    text: `Дата создания: ${new Date().toLocaleDateString('ru-RU')}`,
                                    style: 'normal'
                                },
                                {
                                    text: `Период: ${reportData.period.from} - ${reportData.period.to}`,
                                    style: 'normal'
                                }
                            ]
                        },
                        {
                            width: '50%',
                            stack: [
                                {
                                    text: 'Общая статистика',
                                    style: 'subheader'
                                },
                                {
                                    text: `Всего предприятий: ${formatNumberForExport(reportData.stats.totalEnterprises)}`,
                                    style: 'normal'
                                },
                                {
                                    text: `Общая выручка: ${formatCurrencyForExport(reportData.stats.totalRevenue)}`,
                                    style: 'normal'
                                }
                            ]
                        }
                    ],
                    margin: [
                        0,
                        0,
                        0,
                        20
                    ]
                },
                // Дополнительная статистика
                {
                    columns: [
                        {
                            width: '50%',
                            text: `Всего сотрудников: ${formatNumberForExport(reportData.stats.totalEmployees)}`,
                            style: 'normal'
                        },
                        {
                            width: '50%',
                            text: `Средняя выручка: ${formatCurrencyForExport(reportData.stats.averageRevenue)}`,
                            style: 'normal'
                        }
                    ],
                    margin: [
                        0,
                        0,
                        0,
                        30
                    ]
                }
            ],
            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                    color: '#1f2937'
                },
                subheader: {
                    fontSize: 14,
                    bold: true,
                    color: '#3b82f6',
                    margin: [
                        0,
                        10,
                        0,
                        5
                    ]
                },
                normal: {
                    fontSize: 11,
                    margin: [
                        0,
                        2,
                        0,
                        2
                    ]
                },
                tableHeader: {
                    bold: true,
                    fontSize: 10,
                    color: 'white',
                    fillColor: '#3b82f6'
                },
                tableBody: {
                    fontSize: 9
                }
            }
        };
        // Добавляем статистику по отраслям
        if (reportData.industryStats && reportData.industryStats.length > 0) {
            docDefinition.content.push({
                text: 'Статистика по отраслям',
                style: 'subheader',
                pageBreak: 'before'
            }, {
                table: {
                    headerRows: 1,
                    widths: [
                        '30%',
                        '20%',
                        '30%',
                        '20%'
                    ],
                    body: [
                        [
                            {
                                text: 'Отрасль',
                                style: 'tableHeader'
                            },
                            {
                                text: 'Количество',
                                style: 'tableHeader'
                            },
                            {
                                text: 'Общая выручка',
                                style: 'tableHeader'
                            },
                            {
                                text: 'Средняя численность',
                                style: 'tableHeader'
                            }
                        ],
                        ...reportData.industryStats.map((industry)=>[
                                {
                                    text: industry.industry,
                                    style: 'tableBody'
                                },
                                {
                                    text: formatNumberForExport(industry.count),
                                    style: 'tableBody'
                                },
                                {
                                    text: formatCurrencyForExport(industry.totalRevenue),
                                    style: 'tableBody'
                                },
                                {
                                    text: formatNumberForExport(Math.round(industry.averageEmployees)),
                                    style: 'tableBody'
                                }
                            ])
                    ]
                },
                layout: {
                    fillColor: (rowIndex)=>rowIndex === 0 ? '#3b82f6' : rowIndex % 2 === 0 ? '#f8f9fa' : null,
                    hLineColor: '#e5e7eb',
                    vLineColor: '#e5e7eb'
                },
                margin: [
                    0,
                    10,
                    0,
                    20
                ]
            });
        }
        // Добавляем статистику по регионам
        if (reportData.regionStats && reportData.regionStats.length > 0) {
            docDefinition.content.push({
                text: 'Статистика по регионам',
                style: 'subheader'
            }, {
                table: {
                    headerRows: 1,
                    widths: [
                        '30%',
                        '20%',
                        '30%',
                        '20%'
                    ],
                    body: [
                        [
                            {
                                text: 'Регион',
                                style: 'tableHeader'
                            },
                            {
                                text: 'Количество',
                                style: 'tableHeader'
                            },
                            {
                                text: 'Общая выручка',
                                style: 'tableHeader'
                            },
                            {
                                text: 'Средняя численность',
                                style: 'tableHeader'
                            }
                        ],
                        ...reportData.regionStats.map((region)=>[
                                {
                                    text: region.region,
                                    style: 'tableBody'
                                },
                                {
                                    text: formatNumberForExport(region.count),
                                    style: 'tableBody'
                                },
                                {
                                    text: formatCurrencyForExport(region.totalRevenue),
                                    style: 'tableBody'
                                },
                                {
                                    text: formatNumberForExport(Math.round(region.averageEmployees)),
                                    style: 'tableBody'
                                }
                            ])
                    ]
                },
                layout: {
                    fillColor: (rowIndex)=>rowIndex === 0 ? '#10b981' : rowIndex % 2 === 0 ? '#f0fdf4' : null,
                    hLineColor: '#e5e7eb',
                    vLineColor: '#e5e7eb'
                },
                margin: [
                    0,
                    10,
                    0,
                    20
                ]
            });
        }
        // Добавляем топ предприятий
        if (reportData.enterprises.length > 0) {
            const topEnterprises = [
                ...reportData.enterprises
            ].sort((a, b)=>b.revenue - a.revenue).slice(0, 10);
            docDefinition.content.push({
                text: 'Топ 10 предприятий по выручке',
                style: 'subheader'
            }, {
                table: {
                    headerRows: 1,
                    widths: [
                        '35%',
                        '25%',
                        '15%',
                        '25%'
                    ],
                    body: [
                        [
                            {
                                text: 'Название',
                                style: 'tableHeader'
                            },
                            {
                                text: 'Отрасль',
                                style: 'tableHeader'
                            },
                            {
                                text: 'Сотрудники',
                                style: 'tableHeader'
                            },
                            {
                                text: 'Выручка',
                                style: 'tableHeader'
                            }
                        ],
                        ...topEnterprises.map((enterprise)=>[
                                {
                                    text: enterprise.name,
                                    style: 'tableBody'
                                },
                                {
                                    text: enterprise.industry,
                                    style: 'tableBody'
                                },
                                {
                                    text: formatNumberForExport(enterprise.employees),
                                    style: 'tableBody'
                                },
                                {
                                    text: formatCurrencyForExport(enterprise.revenue),
                                    style: 'tableBody'
                                }
                            ])
                    ]
                },
                layout: {
                    fillColor: (rowIndex)=>rowIndex === 0 ? '#8b5cf6' : rowIndex % 2 === 0 ? '#faf5ff' : null,
                    hLineColor: '#e5e7eb',
                    vLineColor: '#e5e7eb'
                },
                margin: [
                    0,
                    10,
                    0,
                    0
                ]
            });
        }
        // Создаем и скачиваем PDF
        const fileName = `Отчёт_предприятия_Москвы_${new Date().toISOString().split('T')[0]}.pdf`;
        console.log('Генерируем PDF файл...');
        pdf.createPdf(docDefinition).download(fileName);
        console.log('PDF успешно создан:', fileName);
        return fileName;
    } catch (error) {
        console.error('Ошибка генерации PDF:', error);
        console.log('Переключаемся на простой PDF через jsPDF');
        // Fallback на простой PDF через jsPDF
        return generateSimplePDFReport(reportData);
    }
};
const generateSimplePDFReport = (reportData)=>{
    try {
        console.log('Создаем упрощенный PDF отчет через jsPDF...');
        const doc = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$es$2e$min$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]();
        // Добавляем поддержку Unicode через escape последовательности
        const addUnicodeText = (text, x, y, fontSize = 12)=>{
            doc.setFontSize(fontSize);
            // Простая замена основных кириллических символов
            const cyrillicMap = {
                'А': 'A',
                'Б': 'B',
                'В': 'V',
                'Г': 'G',
                'Д': 'D',
                'Е': 'E',
                'Ё': 'Yo',
                'Ж': 'Zh',
                'З': 'Z',
                'И': 'I',
                'Й': 'Y',
                'К': 'K',
                'Л': 'L',
                'М': 'M',
                'Н': 'N',
                'О': 'O',
                'П': 'P',
                'Р': 'R',
                'С': 'S',
                'Т': 'T',
                'У': 'U',
                'Ф': 'F',
                'Х': 'Kh',
                'Ц': 'Ts',
                'Ч': 'Ch',
                'Ш': 'Sh',
                'Щ': 'Sch',
                'Ъ': '',
                'Ы': 'Y',
                'Ь': '',
                'Э': 'E',
                'Ю': 'Yu',
                'Я': 'Ya',
                'а': 'a',
                'б': 'b',
                'в': 'v',
                'г': 'g',
                'д': 'd',
                'е': 'e',
                'ё': 'yo',
                'ж': 'zh',
                'з': 'z',
                'и': 'i',
                'й': 'y',
                'к': 'k',
                'л': 'l',
                'м': 'm',
                'н': 'n',
                'о': 'o',
                'п': 'p',
                'р': 'r',
                'с': 's',
                'т': 't',
                'у': 'u',
                'ф': 'f',
                'х': 'kh',
                'ц': 'ts',
                'ч': 'ch',
                'ш': 'sh',
                'щ': 'sch',
                'ъ': '',
                'ы': 'y',
                'ь': '',
                'э': 'e',
                'ю': 'yu',
                'я': 'ya'
            };
            const transliteratedText = text.replace(/[А-Яа-яЁё]/g, (char)=>cyrillicMap[char] || char);
            doc.text(transliteratedText, x, y);
        };
        // Заголовок
        addUnicodeText('OTCHYOT PO PREDPRIYATIYAM MOSKVY', 105, 20, 18);
        doc.setFontSize(14);
        doc.text('(Report on Moscow Enterprises)', 105, 30, {
            align: 'center'
        });
        // Основная информация
        let yPosition = 50;
        addUnicodeText(`Nazvanie: ${reportData.title}`, 20, yPosition, 12);
        yPosition += 10;
        addUnicodeText(`Data sozdaniya: ${new Date().toLocaleDateString('ru-RU')}`, 20, yPosition, 12);
        yPosition += 10;
        addUnicodeText(`Period: ${reportData.period.from} - ${reportData.period.to}`, 20, yPosition, 12);
        yPosition += 20;
        // Общая статистика
        addUnicodeText('OBSHCHAYA STATISTIKA', 20, yPosition, 14);
        yPosition += 15;
        const stats = [
            [
                'Vsego predpriyatiy:',
                formatNumberForExport(reportData.stats.totalEnterprises)
            ],
            [
                'Obshchaya vyruchka:',
                formatCurrencyForExport(reportData.stats.totalRevenue)
            ],
            [
                'Vsego sotrudnikov:',
                formatNumberForExport(reportData.stats.totalEmployees)
            ],
            [
                'Srednyaya vyruchka:',
                formatCurrencyForExport(reportData.stats.averageRevenue)
            ],
            [
                'Srednyaya chislennost:',
                formatNumberForExport(Math.round(reportData.stats.averageEmployees))
            ]
        ];
        stats.forEach(([label, value])=>{
            doc.setFontSize(11);
            doc.text(label, 20, yPosition);
            doc.text(value, 120, yPosition);
            yPosition += 8;
        });
        // Таблица с топ предприятиями
        if (reportData.enterprises.length > 0) {
            const topEnterprises = [
                ...reportData.enterprises
            ].sort((a, b)=>b.revenue - a.revenue).slice(0, 10);
            yPosition += 10;
            addUnicodeText('TOP 10 PREDPRIYATIY PO VYRUCHKE', 20, yPosition, 14);
            yPosition += 10;
            const tableData = topEnterprises.map((enterprise)=>[
                    enterprise.name.replace(/[А-Яа-яЁё]/g, (char)=>{
                        const cyrillicMap = {
                            'А': 'A',
                            'Б': 'B',
                            'В': 'V',
                            'Г': 'G',
                            'Д': 'D',
                            'Е': 'E',
                            'Ё': 'Yo',
                            'Ж': 'Zh',
                            'З': 'Z',
                            'И': 'I',
                            'Й': 'Y',
                            'К': 'K',
                            'Л': 'L',
                            'М': 'M',
                            'Н': 'N',
                            'О': 'O',
                            'П': 'P',
                            'Р': 'R',
                            'С': 'S',
                            'Т': 'T',
                            'У': 'U',
                            'Ф': 'F',
                            'Х': 'Kh',
                            'Ц': 'Ts',
                            'Ч': 'Ch',
                            'Ш': 'Sh',
                            'Щ': 'Sch',
                            'Ъ': '',
                            'Ы': 'Y',
                            'Ь': '',
                            'Э': 'E',
                            'Ю': 'Yu',
                            'Я': 'Ya',
                            'а': 'a',
                            'б': 'b',
                            'в': 'v',
                            'г': 'g',
                            'д': 'd',
                            'е': 'e',
                            'ё': 'yo',
                            'ж': 'zh',
                            'з': 'z',
                            'и': 'i',
                            'й': 'y',
                            'к': 'k',
                            'л': 'l',
                            'м': 'm',
                            'н': 'n',
                            'о': 'o',
                            'п': 'p',
                            'р': 'r',
                            'с': 's',
                            'т': 't',
                            'у': 'u',
                            'ф': 'f',
                            'х': 'kh',
                            'ц': 'ts',
                            'ч': 'ch',
                            'ш': 'sh',
                            'щ': 'sch',
                            'ъ': '',
                            'ы': 'y',
                            'ь': '',
                            'э': 'e',
                            'ю': 'yu',
                            'я': 'ya'
                        };
                        return cyrillicMap[char] || char;
                    }),
                    enterprise.industry.replace(/[А-Яа-яЁё]/g, (char)=>{
                        const cyrillicMap = {
                            'А': 'A',
                            'Б': 'B',
                            'В': 'V',
                            'Г': 'G',
                            'Д': 'D',
                            'Е': 'E',
                            'Ё': 'Yo',
                            'Ж': 'Zh',
                            'З': 'Z',
                            'И': 'I',
                            'Й': 'Y',
                            'К': 'K',
                            'Л': 'L',
                            'М': 'M',
                            'Н': 'N',
                            'О': 'O',
                            'П': 'P',
                            'Р': 'R',
                            'С': 'S',
                            'Т': 'T',
                            'У': 'U',
                            'Ф': 'F',
                            'Х': 'Kh',
                            'Ц': 'Ts',
                            'Ч': 'Ch',
                            'Ш': 'Sh',
                            'Щ': 'Sch',
                            'Ъ': '',
                            'Ы': 'Y',
                            'Ь': '',
                            'Э': 'E',
                            'Ю': 'Yu',
                            'Я': 'Ya',
                            'а': 'a',
                            'б': 'b',
                            'в': 'v',
                            'г': 'g',
                            'д': 'd',
                            'е': 'e',
                            'ё': 'yo',
                            'ж': 'zh',
                            'з': 'z',
                            'и': 'i',
                            'й': 'y',
                            'к': 'k',
                            'л': 'l',
                            'м': 'm',
                            'н': 'n',
                            'о': 'o',
                            'п': 'p',
                            'р': 'r',
                            'с': 's',
                            'т': 't',
                            'у': 'u',
                            'ф': 'f',
                            'х': 'kh',
                            'ц': 'ts',
                            'ч': 'ch',
                            'ш': 'sh',
                            'щ': 'sch',
                            'ъ': '',
                            'ы': 'y',
                            'ь': '',
                            'э': 'e',
                            'ю': 'yu',
                            'я': 'ya'
                        };
                        return cyrillicMap[char] || char;
                    }),
                    formatNumberForExport(enterprise.employees),
                    formatCurrencyForExport(enterprise.revenue)
                ]);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(doc, {
                head: [
                    [
                        'Nazvanie',
                        'Otrasl',
                        'Sotrudniki',
                        'Vyruchka'
                    ]
                ],
                body: tableData,
                startY: yPosition,
                styles: {
                    fontSize: 8,
                    cellPadding: 2
                },
                headStyles: {
                    fillColor: [
                        59,
                        130,
                        246
                    ],
                    textColor: 255
                },
                alternateRowStyles: {
                    fillColor: [
                        248,
                        250,
                        252
                    ]
                }
            });
        }
        // Сохранение файла
        const fileName = `Report_Moscow_Enterprises_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        console.log('Упрощенный PDF успешно создан:', fileName);
        return fileName;
    } catch (error) {
        console.error('Ошибка создания упрощенного PDF:', error);
        throw error;
    }
};
const generateHTMLReport = (reportData)=>{
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${reportData.title}</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 20px;
                line-height: 1.6;
                color: #333;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 8px;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
            }
            .meta-info {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
            }
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin-bottom: 30px;
            }
            .stat-card {
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                border-left: 4px solid #3b82f6;
            }
            .stat-card h3 {
                margin: 0 0 10px 0;
                color: #1f2937;
                font-size: 14px;
                text-transform: uppercase;
                font-weight: 600;
            }
            .stat-card .value {
                font-size: 24px;
                font-weight: bold;
                color: #3b82f6;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
                background: white;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            th, td {
                text-align: left;
                padding: 12px;
                border-bottom: 1px solid #e5e7eb;
            }
            th {
                background: #f3f4f6;
                font-weight: 600;
                color: #374151;
            }
            tr:hover {
                background: #f9fafb;
            }
            .section-title {
                font-size: 20px;
                font-weight: bold;
                margin: 30px 0 15px 0;
                color: #1f2937;
                border-bottom: 2px solid #3b82f6;
                padding-bottom: 8px;
            }
            .print-button {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #3b82f6;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
            }
            @media print {
                .print-button { display: none; }
                body { margin: 0; padding: 15px; }
            }
        </style>
    </head>
    <body>
        <button class="print-button" onclick="window.print()">Печать отчёта</button>
        
        <div class="header">
            <h1>ОТЧЁТ ПО ПРЕДПРИЯТИЯМ МОСКВЫ</h1>
            <h2>${reportData.title}</h2>
        </div>

        <div class="meta-info">
            <strong>Дата создания:</strong> ${new Date().toLocaleString('ru-RU')}<br>
            <strong>Период:</strong> ${reportData.period.from} - ${reportData.period.to}
        </div>

        <div class="section-title">Общая статистика</div>
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Всего предприятий</h3>
                <div class="value">${formatNumberForExport(reportData.stats.totalEnterprises)}</div>
            </div>
            <div class="stat-card">
                <h3>Общая выручка</h3>
                <div class="value">${formatCurrencyForExport(reportData.stats.totalRevenue)}</div>
            </div>
            <div class="stat-card">
                <h3>Всего сотрудников</h3>
                <div class="value">${formatNumberForExport(reportData.stats.totalEmployees)}</div>
            </div>
            <div class="stat-card">
                <h3>Средняя выручка</h3>
                <div class="value">${formatCurrencyForExport(reportData.stats.averageRevenue)}</div>
            </div>
        </div>

        ${reportData.industryStats && reportData.industryStats.length > 0 ? `
        <div class="section-title">Статистика по отраслям</div>
        <table>
            <thead>
                <tr>
                    <th>Отрасль</th>
                    <th>Количество предприятий</th>
                    <th>Общая выручка</th>
                    <th>Средняя численность</th>
                </tr>
            </thead>
            <tbody>
                ${reportData.industryStats.map((i)=>`
                <tr>
                    <td>${i.industry}</td>
                    <td>${formatNumberForExport(i.count)}</td>
                    <td>${formatCurrencyForExport(i.totalRevenue)}</td>
                    <td>${formatNumberForExport(Math.round(i.averageEmployees))}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        ` : ''}

        ${reportData.regionStats && reportData.regionStats.length > 0 ? `
        <div class="section-title">Статистика по регионам</div>
        <table>
            <thead>
                <tr>
                    <th>Регион</th>
                    <th>Количество предприятий</th>
                    <th>Общая выручка</th>
                    <th>Средняя численность</th>
                </tr>
            </thead>
            <tbody>
                ${reportData.regionStats.map((r)=>`
                <tr>
                    <td>${r.region}</td>
                    <td>${formatNumberForExport(r.count)}</td>
                    <td>${formatCurrencyForExport(r.totalRevenue)}</td>
                    <td>${formatNumberForExport(Math.round(r.averageEmployees))}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        ` : ''}

        ${reportData.enterprises.length > 0 ? `
        <div class="section-title">Топ 10 предприятий по выручке</div>
        <table>
            <thead>
                <tr>
                    <th>Название</th>
                    <th>Отрасль</th>
                    <th>Регион</th>
                    <th>Сотрудники</th>
                    <th>Выручка</th>
                </tr>
            </thead>
            <tbody>
                ${reportData.enterprises.sort((a, b)=>b.revenue - a.revenue).slice(0, 10).map((e)=>`
                <tr>
                    <td>${e.name}</td>
                    <td>${e.industry}</td>
                    <td>${e.region}</td>
                    <td>${formatNumberForExport(e.employees)}</td>
                    <td>${formatCurrencyForExport(e.revenue)}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        ` : ''}
    </body>
    </html>
  `;
    // Создаем и открываем HTML файл в новом окне
    const blob = new Blob([
        htmlContent
    ], {
        type: 'text/html;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const newWindow = window.open(url, '_blank');
    if (newWindow) {
        newWindow.document.title = `Отчёт - ${reportData.title}`;
    }
    return htmlContent;
};
}),
"[project]/src/app/reports/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ReportsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/download.js [app-ssr] (ecmascript) <export default as Download>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.js [app-ssr] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/building-2.js [app-ssr] (ecmascript) <export default as Building2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trending-up.js [app-ssr] (ecmascript) <export default as TrendingUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-ssr] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.js [app-ssr] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/upload.js [app-ssr] (ecmascript) <export default as Upload>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/globe.js [app-ssr] (ecmascript) <export default as Globe>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$data$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/lib/data-utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$analytics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/lib/analytics.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/lib/api-client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$report$2d$generator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/lib/report-generator.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
;
function ReportsPage() {
    const [enterprises, setEnterprises] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [generatingReport, setGeneratingReport] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [reportConfig, setReportConfig] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        title: 'Отчёт по предприятиям Москвы',
        dateRange: {
            from: new Date(2015, 0, 1),
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Загружаем данные из бэкенда
        const loadData = async ()=>{
            try {
                setLoading(true);
                const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEnterprises"])();
                if (response.success && response.data) {
                    setEnterprises(response.data);
                } else {
                    setError('Не удалось загрузить данные');
                }
            } catch (err) {
                setError(`Ошибка загрузки: ${err.message}`);
                console.error('Ошибка загрузки данных:', err);
            } finally{
                setLoading(false);
            }
        };
        loadData();
    }, []);
    const filteredEnterprises = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$analytics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["filterEnterprises"])(enterprises, {
        dateRange: reportConfig.dateRange,
        industries: reportConfig.includeIndustries.length > 0 ? reportConfig.includeIndustries : undefined,
        regions: reportConfig.includeRegions.length > 0 ? reportConfig.includeRegions : undefined
    });
    const overallStats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$analytics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateOverallStats"])(filteredEnterprises);
    const industryStats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$analytics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateIndustryStats"])(filteredEnterprises);
    const regionStats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$analytics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateRegionStats"])(filteredEnterprises);
    const handleGenerateReport = async (format)=>{
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
                    averageEmployees: overallStats.averageEmployees
                },
                industryStats: reportConfig.sections.industries ? industryStats : undefined,
                regionStats: reportConfig.sections.regions ? regionStats : undefined
            };
            // Генерируем отчет в нужном фор��ате
            if (format === 'excel') {
                console.log('Генерируем Excel отчет...');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$report$2d$generator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateExcelReport"])(reportData);
                console.log('Excel отчет успешно создан');
            } else if (format === 'html') {
                console.log('Генерируем HTML отчет...');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$report$2d$generator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateHTMLReport"])(reportData);
                console.log('HTML отчет успешно ��оздан');
            } else {
                console.log('Генерируем PDF отчет...');
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$report$2d$generator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generatePDFReport"])(reportData); // Теперь ждем завершения асинхронной функции
                console.log('PDF отчет успеш��о создан');
            }
            // Показываем уведомление об успехе
            alert(`Отчет в формате ${format.toUpperCase()} успешно сгенерирован и загружен!`);
        } catch (error) {
            console.error('Ошибка генерации отчета:', error);
            alert(`Ошибка при генерации отчета: ${error.message}`);
        } finally{
            setGeneratingReport(false);
        }
    };
    const updateReportConfig = (key, value)=>{
        setReportConfig((prev)=>({
                ...prev,
                [key]: value
            }));
    };
    const updateSection = (section, value)=>{
        setReportConfig((prev)=>({
                ...prev,
                sections: {
                    ...prev.sections,
                    [section]: value
                }
            }));
    };
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center h-64",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"
                    }, void 0, false, {
                        fileName: "[project]/src/app/reports/page.tsx",
                        lineNumber: 154,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-lg text-gray-600 mt-4",
                        children: "Загрузка данных..."
                    }, void 0, false, {
                        fileName: "[project]/src/app/reports/page.tsx",
                        lineNumber: 155,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/reports/page.tsx",
                lineNumber: 153,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/reports/page.tsx",
            lineNumber: 152,
            columnNumber: 7
        }, this);
    }
    if (error) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center h-64",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                        className: "w-12 h-12 text-red-500 mx-auto mb-4"
                    }, void 0, false, {
                        fileName: "[project]/src/app/reports/page.tsx",
                        lineNumber: 165,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-lg text-red-600",
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/src/app/reports/page.tsx",
                        lineNumber: 166,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-600 mt-2",
                        children: "Проверьте, что бэкенд запущен на порту 4000"
                    }, void 0, false, {
                        fileName: "[project]/src/app/reports/page.tsx",
                        lineNumber: 167,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/reports/page.tsx",
                lineNumber: 164,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/reports/page.tsx",
            lineNumber: 163,
            columnNumber: 7
        }, this);
    }
    if (enterprises.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center h-64",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__["Upload"], {
                        className: "w-12 h-12 text-gray-400 mx-auto mb-4"
                    }, void 0, false, {
                        fileName: "[project]/src/app/reports/page.tsx",
                        lineNumber: 177,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-lg text-gray-600",
                        children: "Нет данных для отчетов"
                    }, void 0, false, {
                        fileName: "[project]/src/app/reports/page.tsx",
                        lineNumber: 178,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-500 mt-2",
                        children: "Загрузите файл с данными предприятий"
                    }, void 0, false, {
                        fileName: "[project]/src/app/reports/page.tsx",
                        lineNumber: 179,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: "/upload",
                        className: "mt-4 inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__["Upload"], {
                                className: "w-5 h-5 mr-2"
                            }, void 0, false, {
                                fileName: "[project]/src/app/reports/page.tsx",
                                lineNumber: 184,
                                columnNumber: 13
                            }, this),
                            "Загрузить данные"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/reports/page.tsx",
                        lineNumber: 180,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/reports/page.tsx",
                lineNumber: 176,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/reports/page.tsx",
            lineNumber: 175,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "max-w-6xl mx-auto space-y-8",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-3xl font-bold text-gray-900",
                        children: "Генерация отчётов"
                    }, void 0, false, {
                        fileName: "[project]/src/app/reports/page.tsx",
                        lineNumber: 196,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-600 mt-2",
                        children: "Создайте детальные отчёты по предприятиям Москвы в различных форматах"
                    }, void 0, false, {
                        fileName: "[project]/src/app/reports/page.tsx",
                        lineNumber: 197,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/reports/page.tsx",
                lineNumber: 195,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 lg:grid-cols-3 gap-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "lg:col-span-2 space-y-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-white p-6 rounded-lg shadow-sm border",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-lg font-semibold text-gray-900 mb-4",
                                        children: "Основные настройки"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/reports/page.tsx",
                                        lineNumber: 207,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "block text-sm font-medium text-gray-700 mb-2",
                                                        children: "Название отчёта"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 211,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        value: reportConfig.title,
                                                        onChange: (e)=>updateReportConfig('title', e.target.value),
                                                        className: "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 214,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/reports/page.tsx",
                                                lineNumber: 210,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                className: "block text-sm font-medium text-gray-700 mb-2",
                                                                children: "Дата начала"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/reports/page.tsx",
                                                                lineNumber: 224,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "date",
                                                                value: reportConfig.dateRange.from.toISOString().split('T')[0],
                                                                onChange: (e)=>updateReportConfig('dateRange', {
                                                                        ...reportConfig.dateRange,
                                                                        from: new Date(e.target.value)
                                                                    }),
                                                                className: "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/reports/page.tsx",
                                                                lineNumber: 227,
                                                                columnNumber: 19
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 223,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                className: "block text-sm font-medium text-gray-700 mb-2",
                                                                children: "Дата окончания"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/reports/page.tsx",
                                                                lineNumber: 238,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "date",
                                                                value: reportConfig.dateRange.to.toISOString().split('T')[0],
                                                                onChange: (e)=>updateReportConfig('dateRange', {
                                                                        ...reportConfig.dateRange,
                                                                        to: new Date(e.target.value)
                                                                    }),
                                                                className: "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/reports/page.tsx",
                                                                lineNumber: 241,
                                                                columnNumber: 19
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 237,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/reports/page.tsx",
                                                lineNumber: 222,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/reports/page.tsx",
                                        lineNumber: 209,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/reports/page.tsx",
                                lineNumber: 206,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-white p-6 rounded-lg shadow-sm border",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-lg font-semibold text-gray-900 mb-4",
                                        children: "Фильтры данных"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/reports/page.tsx",
                                        lineNumber: 257,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "block text-sm font-medium text-gray-700 mb-2",
                                                        children: "Отрасли (оставьте пустым для всех)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 261,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                        multiple: true,
                                                        value: reportConfig.includeIndustries,
                                                        onChange: (e)=>{
                                                            const selected = Array.from(e.target.selectedOptions, (option)=>option.value);
                                                            updateReportConfig('includeIndustries', selected);
                                                        },
                                                        className: "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                                                        size: 6,
                                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$data$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INDUSTRIES"].map((industry)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: industry,
                                                                children: industry
                                                            }, industry, false, {
                                                                fileName: "[project]/src/app/reports/page.tsx",
                                                                lineNumber: 275,
                                                                columnNumber: 21
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 264,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/reports/page.tsx",
                                                lineNumber: 260,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "block text-sm font-medium text-gray-700 mb-2",
                                                        children: "Регионы (оставьте пустым для всех)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 281,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                        multiple: true,
                                                        value: reportConfig.includeRegions,
                                                        onChange: (e)=>{
                                                            const selected = Array.from(e.target.selectedOptions, (option)=>option.value);
                                                            updateReportConfig('includeRegions', selected);
                                                        },
                                                        className: "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                                                        size: 6,
                                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$data$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MOSCOW_REGIONS"].map((region)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: region,
                                                                children: region
                                                            }, region, false, {
                                                                fileName: "[project]/src/app/reports/page.tsx",
                                                                lineNumber: 295,
                                                                columnNumber: 21
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 284,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/reports/page.tsx",
                                                lineNumber: 280,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/reports/page.tsx",
                                        lineNumber: 259,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/reports/page.tsx",
                                lineNumber: 256,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-white p-6 rounded-lg shadow-sm border",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-lg font-semibold text-gray-900 mb-4",
                                        children: "Разделы отчёта"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/reports/page.tsx",
                                        lineNumber: 304,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-3",
                                        children: Object.entries(reportConfig.sections).map(([key, value])=>{
                                            const sectionNames = {
                                                overview: 'Общая статистика',
                                                industries: 'Анализ по отраслям',
                                                regions: 'Анализ по регионам',
                                                topEnterprises: 'Топ предприятия',
                                                trends: 'Тренды и динамика'
                                            };
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "flex items-center space-x-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "checkbox",
                                                        checked: value,
                                                        onChange: (e)=>updateSection(key, e.target.checked),
                                                        className: "w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 318,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-gray-700",
                                                        children: sectionNames[key]
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 324,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, key, true, {
                                                fileName: "[project]/src/app/reports/page.tsx",
                                                lineNumber: 317,
                                                columnNumber: 19
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/reports/page.tsx",
                                        lineNumber: 306,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/reports/page.tsx",
                                lineNumber: 303,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/reports/page.tsx",
                        lineNumber: 204,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-white p-6 rounded-lg shadow-sm border",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-lg font-semibold text-gray-900 mb-4",
                                        children: "Превью данных"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/reports/page.tsx",
                                        lineNumber: 336,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between p-3 bg-blue-50 rounded-lg",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center space-x-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__["Building2"], {
                                                                className: "w-5 h-5 text-blue-600"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/reports/page.tsx",
                                                                lineNumber: 341,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-sm font-medium text-blue-900",
                                                                children: "Предприятий"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/reports/page.tsx",
                                                                lineNumber: 342,
                                                                columnNumber: 19
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 340,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-blue-900 font-bold",
                                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$data$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatNumber"])(filteredEnterprises.length)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 344,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/reports/page.tsx",
                                                lineNumber: 339,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between p-3 bg-green-50 rounded-lg",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center space-x-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"], {
                                                                className: "w-5 h-5 text-green-600"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/reports/page.tsx",
                                                                lineNumber: 349,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-sm font-medium text-green-900",
                                                                children: "Общая выручка"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/reports/page.tsx",
                                                                lineNumber: 350,
                                                                columnNumber: 19
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 348,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-green-900 font-bold text-sm",
                                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$data$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatCurrency"])(overallStats.totalRevenue)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 352,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/reports/page.tsx",
                                                lineNumber: 347,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between p-3 bg-purple-50 rounded-lg",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center space-x-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                                                className: "w-5 h-5 text-purple-600"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/reports/page.tsx",
                                                                lineNumber: 359,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-sm font-medium text-purple-900",
                                                                children: "Сотрудников"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/reports/page.tsx",
                                                                lineNumber: 360,
                                                                columnNumber: 19
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 358,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-purple-900 font-bold",
                                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$data$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatNumber"])(overallStats.totalEmployees)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 362,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/reports/page.tsx",
                                                lineNumber: 357,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "pt-3 border-t border-gray-200",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-gray-500",
                                                        children: [
                                                            "Период: ",
                                                            reportConfig.dateRange.from.toLocaleDateString('ru-RU'),
                                                            " - ",
                                                            reportConfig.dateRange.to.toLocaleDateString('ru-RU')
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 366,
                                                        columnNumber: 17
                                                    }, this),
                                                    reportConfig.includeIndustries.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-gray-500 mt-1",
                                                        children: [
                                                            "Отрасли: ",
                                                            reportConfig.includeIndustries.length
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 370,
                                                        columnNumber: 19
                                                    }, this),
                                                    reportConfig.includeRegions.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-gray-500 mt-1",
                                                        children: [
                                                            "Регионы: ",
                                                            reportConfig.includeRegions.length
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 375,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/reports/page.tsx",
                                                lineNumber: 365,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/reports/page.tsx",
                                        lineNumber: 338,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/reports/page.tsx",
                                lineNumber: 335,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-white p-6 rounded-lg shadow-sm border",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-lg font-semibold text-gray-900 mb-4",
                                        children: "Генерация отчёта"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/reports/page.tsx",
                                        lineNumber: 385,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>handleGenerateReport('pdf'),
                                                disabled: generatingReport,
                                                className: "w-full flex items-center justify-center space-x-2 p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors",
                                                children: [
                                                    generatingReport ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "animate-spin rounded-full h-5 w-5 border-b-2 border-white"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 394,
                                                        columnNumber: 19
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                                                        className: "w-5 h-5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 396,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "Скачать PDF"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 398,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/reports/page.tsx",
                                                lineNumber: 388,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>handleGenerateReport('excel'),
                                                disabled: generatingReport,
                                                className: "w-full flex items-center justify-center space-x-2 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors",
                                                children: [
                                                    generatingReport ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "animate-spin rounded-full h-5 w-5 border-b-2 border-white"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 407,
                                                        columnNumber: 19
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__["Download"], {
                                                        className: "w-5 h-5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 409,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "Скачать Excel"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 411,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/reports/page.tsx",
                                                lineNumber: 401,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>handleGenerateReport('html'),
                                                disabled: generatingReport,
                                                className: "w-full flex items-center justify-center space-x-2 p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors",
                                                children: [
                                                    generatingReport ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "animate-spin rounded-full h-5 w-5 border-b-2 border-white"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 420,
                                                        columnNumber: 19
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__["Globe"], {
                                                        className: "w-5 h-5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 422,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "Скачать HTML"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 424,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/reports/page.tsx",
                                                lineNumber: 414,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/reports/page.tsx",
                                        lineNumber: 387,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-yellow-800",
                                            children: "💡 Отчёты генерируются на основе текущих фильтров и выбранных разделов"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/reports/page.tsx",
                                            lineNumber: 429,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/reports/page.tsx",
                                        lineNumber: 428,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/reports/page.tsx",
                                lineNumber: 384,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-white p-6 rounded-lg shadow-sm border",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-lg font-semibold text-gray-900 mb-4",
                                        children: "Быстрые шаблоны"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/reports/page.tsx",
                                        lineNumber: 437,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setReportConfig({
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
                                                    }),
                                                className: "w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded",
                                                children: "📊 Полный отчёт"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/reports/page.tsx",
                                                lineNumber: 440,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setReportConfig({
                                                        ...reportConfig,
                                                        title: 'Краткая сводка',
                                                        sections: {
                                                            overview: true,
                                                            industries: false,
                                                            regions: false,
                                                            topEnterprises: true,
                                                            trends: false
                                                        }
                                                    }),
                                                className: "w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded",
                                                children: "📋 Краткая сводка"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/reports/page.tsx",
                                                lineNumber: 459,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setReportConfig({
                                                        ...reportConfig,
                                                        title: 'Анализ по отраслям',
                                                        sections: {
                                                            overview: true,
                                                            industries: true,
                                                            regions: false,
                                                            topEnterprises: false,
                                                            trends: true
                                                        }
                                                    }),
                                                className: "w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded",
                                                children: "🏭 Отраслевой анализ"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/reports/page.tsx",
                                                lineNumber: 476,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/reports/page.tsx",
                                        lineNumber: 439,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/reports/page.tsx",
                                lineNumber: 436,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/reports/page.tsx",
                        lineNumber: 333,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/reports/page.tsx",
                lineNumber: 202,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/reports/page.tsx",
        lineNumber: 193,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__5781ec38._.js.map