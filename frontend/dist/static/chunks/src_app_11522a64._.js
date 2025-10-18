(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/app/lib/data-utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/xlsx/xlsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$papaparse$2f$papaparse$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/papaparse/papaparse.min.js [app-client] (ecmascript)");
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
    if (!(contactInfo === null || contactInfo === void 0 ? void 0 : contactInfo.address)) {
        errors.push('Отсутствует адрес');
    }
    return {
        isValid: errors.length === 0,
        errors
    };
};
const parseCSV = (file)=>{
    return new Promise((resolve)=>{
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$papaparse$2f$papaparse$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].parse(file, {
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
                        errors.push("Строка ".concat(index + 1, ": ").concat(validation.errors.join(', ')));
                    }
                });
                resolve({
                    success: true,
                    message: "Обработано ".concat(enterprises.length, " записей из ").concat(results.data.length),
                    processedCount: enterprises.length,
                    errorCount,
                    errors,
                    data: enterprises
                });
            },
            error: (error)=>{
                resolve({
                    success: false,
                    message: "Ошибка парсинга CSV: ".concat(error.message),
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
                var _e_target;
                const data = (_e_target = e.target) === null || _e_target === void 0 ? void 0 : _e_target.result;
                const workbook = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["read"](data, {
                    type: 'binary'
                });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["utils"].sheet_to_json(worksheet);
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
                        errors.push("Строка ".concat(index + 1, ": ").concat(validation.errors.join(', ')));
                    }
                });
                resolve({
                    success: true,
                    message: "Обработано ".concat(enterprises.length, " записей из ").concat(jsonData.length),
                    processedCount: enterprises.length,
                    errorCount,
                    errors,
                    data: enterprises
                });
            } catch (error) {
                resolve({
                    success: false,
                    message: "Ошибка парсинга Excel: ".concat(error.message),
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
        return "".concat((amount / 1_000_000_000).toFixed(1), "млрд₽");
    } else if (amount >= 1_000_000) {
        return "".concat((amount / 1_000_000).toFixed(1), "млн₽");
    } else if (amount >= 1_000) {
        return "".concat((amount / 1_000).toFixed(0), "тыс₽");
    }
    return "".concat(amount, "₽");
};
const generateSampleData = function() {
    let count = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 100;
    const sampleData = [];
    for(let i = 0; i < count; i++){
        const enterprise = {
            id: crypto.randomUUID(),
            name: "Предприятие ".concat(i + 1),
            industry: INDUSTRIES[Math.floor(Math.random() * INDUSTRIES.length)],
            region: MOSCOW_REGIONS[Math.floor(Math.random() * MOSCOW_REGIONS.length)],
            employees: Math.floor(Math.random() * 1000) + 10,
            revenue: Math.floor(Math.random() * 100000000) + 1000000,
            taxesPaid: Math.floor(Math.random() * 10000000) + 100000,
            registrationDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 5),
            lastUpdated: new Date(),
            status: Math.random() > 0.1 ? 'active' : Math.random() > 0.5 ? 'inactive' : 'suspended',
            contactInfo: {
                address: "Москва, улица ".concat(i + 1, ", дом ").concat(Math.floor(Math.random() * 100) + 1),
                phone: "+7-495-".concat(Math.floor(Math.random() * 900) + 100, "-").concat(Math.floor(Math.random() * 90) + 10, "-").concat(Math.floor(Math.random() * 90) + 10),
                email: "contact".concat(i + 1, "@enterprise.ru")
            }
        };
        sampleData.push(enterprise);
    }
    return sampleData;
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/lib/analytics.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
    return Array.from(industryMap.entries()).map((param)=>{
        let [industry, stats] = param;
        return {
            industry,
            count: stats.count,
            totalRevenue: stats.totalRevenue,
            averageEmployees: Math.round(stats.totalEmployees / stats.count)
        };
    });
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
    return Array.from(regionMap.entries()).map((param)=>{
        let [region, stats] = param;
        return {
            region,
            count: stats.count,
            totalRevenue: stats.totalRevenue,
            averageEmployees: Math.round(stats.totalEmployees / stats.count)
        };
    });
};
const calculateDataQuality = (enterprises)=>{
    let validRecords = 0;
    const validationErrors = [];
    enterprises.forEach((enterprise, index)=>{
        var _enterprise_contactInfo;
        let isValid = true;
        const errors = [];
        if (!enterprise.name || enterprise.name.trim().length === 0) {
            errors.push('Отсутствует название');
            isValid = false;
        }
        if (!((_enterprise_contactInfo = enterprise.contactInfo) === null || _enterprise_contactInfo === void 0 ? void 0 : _enterprise_contactInfo.address) || enterprise.contactInfo.address.trim().length === 0) {
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
            validationErrors.push("Запись ".concat(index + 1, ": ").concat(errors.join(', ')));
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
        const monthKey = "".concat(date.getFullYear(), "-").concat(String(date.getMonth() + 1).padStart(2, '0'));
        const existing = monthlyData.get(monthKey) || {
            count: 0,
            revenue: 0
        };
        monthlyData.set(monthKey, {
            count: existing.count + 1,
            revenue: existing.revenue + enterprise.revenue
        });
    });
    return Array.from(monthlyData.entries()).sort((param, param1)=>{
        let [a] = param, [b] = param1;
        return a.localeCompare(b);
    }).map((param)=>{
        let [month, data] = param;
        return {
            month,
            count: data.count,
            revenue: data.revenue
        };
    });
};
const getTopEnterprisesByRevenue = function(enterprises) {
    let limit = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 10;
    return enterprises.sort((a, b)=>b.revenue - a.revenue).slice(0, limit);
};
const getTopEnterprisesByEmployees = function(enterprises) {
    let limit = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 10;
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/lib/api-client.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
const API_BASE_URL = ("TURBOPACK compile-time value", "http://localhost:4000/api") || 'http://localhost:4000/api';
console.log('🔧 API_BASE_URL:', API_BASE_URL); // Для отладки
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
        headers['Authorization'] = "Bearer ".concat(token);
    }
    return headers;
}
const uploadFile = async (file)=>{
    const formData = new FormData();
    formData.append('file', file);
    const token = getAuthToken();
    const headers = {};
    if (token) {
        headers['Authorization'] = "Bearer ".concat(token);
    }
    const response = await fetch("".concat(API_BASE_URL, "/upload"), {
        method: 'POST',
        body: formData,
        headers,
        credentials: 'include'
    });
    if (!response.ok) {
        throw new Error("Ошибка загрузки: ".concat(response.statusText));
    }
    return response.json();
};
const getEnterprises = async (filters)=>{
    const params = new URLSearchParams();
    if (filters === null || filters === void 0 ? void 0 : filters.industries) {
        filters.industries.forEach((industry)=>params.append('industries', industry));
    }
    if (filters === null || filters === void 0 ? void 0 : filters.regions) {
        filters.regions.forEach((region)=>params.append('regions', region));
    }
    if (filters === null || filters === void 0 ? void 0 : filters.status) {
        params.append('status', filters.status);
    }
    if ((filters === null || filters === void 0 ? void 0 : filters.minEmployees) !== undefined) {
        params.append('minEmployees', filters.minEmployees.toString());
    }
    if ((filters === null || filters === void 0 ? void 0 : filters.maxEmployees) !== undefined) {
        params.append('maxEmployees', filters.maxEmployees.toString());
    }
    if ((filters === null || filters === void 0 ? void 0 : filters.minRevenue) !== undefined) {
        params.append('minRevenue', filters.minRevenue.toString());
    }
    if ((filters === null || filters === void 0 ? void 0 : filters.maxRevenue) !== undefined) {
        params.append('maxRevenue', filters.maxRevenue.toString());
    }
    const url = "".concat(API_BASE_URL, "/enterprises").concat(params.toString() ? '?' + params.toString() : '');
    console.log('🔍 Requesting URL:', url); // Отладка
    const response = await fetch(url, {
        headers: getHeaders(),
        credentials: 'include'
    });
    console.log('📡 Response status:', response.status, response.statusText); // Отладка
    if (!response.ok) {
        throw new Error("Ошибка получения данных: ".concat(response.statusText));
    }
    return response.json();
};
const getEnterpriseById = async (id)=>{
    const response = await fetch("".concat(API_BASE_URL, "/enterprises/").concat(id), {
        headers: getHeaders(),
        credentials: 'include'
    });
    if (!response.ok) {
        throw new Error("Ошибка получения данных: ".concat(response.statusText));
    }
    return response.json();
};
const getStatistics = async ()=>{
    const response = await fetch("".concat(API_BASE_URL, "/statistics"), {
        headers: getHeaders(),
        credentials: 'include'
    });
    if (!response.ok) {
        throw new Error("Ошибка получения статистики: ".concat(response.statusText));
    }
    return response.json();
};
const clearAllData = async ()=>{
    const response = await fetch("".concat(API_BASE_URL, "/enterprises"), {
        method: 'DELETE'
    });
    if (!response.ok) {
        throw new Error("Ошибка очистки данных: ".concat(response.statusText));
    }
    return response.json();
};
const checkHealth = async ()=>{
    try {
        const response = await fetch("".concat(API_BASE_URL, "/health"));
        return response.ok;
    } catch (e) {
        return false;
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/lib/report-generator.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateExcelReport",
    ()=>generateExcelReport,
    "generatePDFReport",
    ()=>generatePDFReport
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/xlsx/xlsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$es$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jspdf/dist/jspdf.es.min.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jspdf-autotable/dist/jspdf.plugin.autotable.mjs [app-client] (ecmascript)");
;
;
;
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
    const workbook = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["utils"].book_new();
    // Лист 1: Общая информация
    const summaryData = [
        [
            'Отчёт по предприятиям Москвы'
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
            "".concat(reportData.period.from, " - ").concat(reportData.period.to)
        ],
        [],
        [
            'Общая статистика'
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
    const summarySheet = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["utils"].aoa_to_sheet(summaryData);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["utils"].book_append_sheet(workbook, summarySheet, 'Общая информация');
    // Лист 2: Предприятия
    if (reportData.enterprises.length > 0) {
        const enterprisesData = reportData.enterprises.map((e)=>({
                'Название': e.name,
                'Отрасль': e.industry,
                'Регион': e.region,
                'Сотрудники': e.employees,
                'Выручка (руб.)': e.revenue,
                'Налоги (руб.)': e.taxesPaid,
                'Статус': e.status === 'active' ? 'Активно' : e.status === 'inactive' ? 'Неактивно' : 'Приостановлено',
                'Адрес': e.contactInfo.address,
                'Телефон': e.contactInfo.phone || '-',
                'Email': e.contactInfo.email || '-'
            }));
        const enterprisesSheet = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["utils"].json_to_sheet(enterprisesData);
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["utils"].book_append_sheet(workbook, enterprisesSheet, 'Предприятия');
    }
    // Лист 3: Статистика по отраслям
    if (reportData.industryStats && reportData.industryStats.length > 0) {
        const industryData = reportData.industryStats.map((i)=>({
                'Отрасль': i.industry,
                'Количество предприятий': i.count,
                'Общая выручка (руб.)': i.totalRevenue,
                'Средняя численность': i.averageEmployees
            }));
        const industrySheet = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["utils"].json_to_sheet(industryData);
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["utils"].book_append_sheet(workbook, industrySheet, 'По отраслям');
    }
    // Лист 4: Статистика по регионам
    if (reportData.regionStats && reportData.regionStats.length > 0) {
        const regionData = reportData.regionStats.map((r)=>({
                'Регион': r.region,
                'Количество предприятий': r.count,
                'Общая выручка (руб.)': r.totalRevenue,
                'Средняя численность': r.averageEmployees
            }));
        const regionSheet = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["utils"].json_to_sheet(regionData);
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["utils"].book_append_sheet(workbook, regionSheet, 'По регионам');
    }
    // Сохранение файла
    const fileName = "report_".concat(Date.now(), ".xlsx");
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["writeFile"](workbook, fileName);
};
const generatePDFReport = (reportData)=>{
    const doc = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$es$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]();
    // Используем базовый шрифт с поддержкой юникода
    doc.setFont('helvetica');
    // Заголовок
    doc.setFontSize(18);
    doc.text('Отчёт по предприятиям Москвы', 14, 15);
    doc.setFontSize(12);
    doc.text("Название: ".concat(reportData.title), 14, 25);
    doc.text("Дата создания: ".concat(new Date().toLocaleDateString('ru-RU')), 14, 32);
    doc.text("Период: ".concat(reportData.period.from, " - ").concat(reportData.period.to), 14, 39);
    // Общая статистика
    doc.setFontSize(14);
    doc.text('Общая статистика', 14, 50);
    doc.setFontSize(11);
    doc.text("Всего предприятий: ".concat(reportData.stats.totalEnterprises), 14, 58);
    doc.text("Общая выручка: ".concat(formatCurrencyForExport(reportData.stats.totalRevenue)), 14, 65);
    doc.text("Всего сотрудников: ".concat(formatNumberForExport(reportData.stats.totalEmployees)), 14, 72);
    doc.text("Средняя выручка: ".concat(formatCurrencyForExport(reportData.stats.averageRevenue)), 14, 79);
    doc.text("Средняя численность: ".concat(formatNumberForExport(Math.round(reportData.stats.averageEmployees))), 14, 86);
    let yPos = 95;
    // Статистика по отраслям
    if (reportData.industryStats && reportData.industryStats.length > 0) {
        doc.setFontSize(14);
        doc.text('Статистика по отраслям', 14, yPos);
        yPos += 10;
        const industryTableData = reportData.industryStats.map((i)=>[
                i.industry,
                i.count.toString(),
                formatCurrencyForExport(i.totalRevenue),
                i.averageEmployees.toString()
            ]);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(doc, {
            startY: yPos,
            head: [
                [
                    'Отрасль',
                    'Кол-во',
                    'Выручка',
                    'Сред. численность'
                ]
            ],
            body: industryTableData,
            theme: 'grid',
            styles: {
                fontSize: 9,
                font: 'helvetica'
            },
            headStyles: {
                fillColor: [
                    59,
                    130,
                    246
                ],
                font: 'helvetica',
                fontStyle: 'bold'
            }
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        yPos = doc.lastAutoTable.finalY + 10;
    }
    // Статистика по регионам
    if (reportData.regionStats && reportData.regionStats.length > 0) {
        if (yPos > 250) {
            doc.addPage();
            yPos = 15;
        }
        doc.setFontSize(14);
        doc.text('Статистика по регионам', 14, yPos);
        yPos += 10;
        const regionTableData = reportData.regionStats.map((r)=>[
                r.region,
                r.count.toString(),
                formatCurrencyForExport(r.totalRevenue),
                r.averageEmployees.toString()
            ]);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(doc, {
            startY: yPos,
            head: [
                [
                    'Регион',
                    'Кол-во',
                    'Выручка',
                    'Сред. численность'
                ]
            ],
            body: regionTableData,
            theme: 'grid',
            styles: {
                fontSize: 9,
                font: 'helvetica'
            },
            headStyles: {
                fillColor: [
                    16,
                    185,
                    129
                ],
                font: 'helvetica',
                fontStyle: 'bold'
            }
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        yPos = doc.lastAutoTable.finalY + 10;
    }
    // Топ 10 предприятий
    if (reportData.enterprises.length > 0) {
        if (yPos > 220) {
            doc.addPage();
            yPos = 15;
        }
        doc.setFontSize(14);
        doc.text('Топ 10 предприятий по выручке', 14, yPos);
        yPos += 10;
        const topEnterprises = [
            ...reportData.enterprises
        ].sort((a, b)=>b.revenue - a.revenue).slice(0, 10);
        const enterprisesTableData = topEnterprises.map((e)=>[
                e.name,
                e.industry,
                e.employees.toString(),
                formatCurrencyForExport(e.revenue)
            ]);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(doc, {
            startY: yPos,
            head: [
                [
                    'Название',
                    'Отрасль',
                    'Сотрудники',
                    'Выручка'
                ]
            ],
            body: enterprisesTableData,
            theme: 'grid',
            styles: {
                fontSize: 8,
                font: 'helvetica'
            },
            headStyles: {
                fillColor: [
                    139,
                    92,
                    246
                ],
                font: 'helvetica',
                fontStyle: 'bold'
            }
        });
    }
    // Сохранение файла
    const fileName = "otchet_".concat(Date.now(), ".pdf");
    doc.save(fileName);
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/reports/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ReportsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/download.js [app-client] (ecmascript) <export default as Download>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.js [app-client] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/building-2.js [app-client] (ecmascript) <export default as Building2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trending-up.js [app-client] (ecmascript) <export default as TrendingUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-client] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.js [app-client] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/upload.js [app-client] (ecmascript) <export default as Upload>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$data$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/lib/data-utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$analytics$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/lib/analytics.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/lib/api-client.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$report$2d$generator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/lib/report-generator.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
function ReportsPage() {
    _s();
    const [enterprises, setEnterprises] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [generatingReport, setGeneratingReport] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [reportConfig, setReportConfig] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ReportsPage.useEffect": ()=>{
            // Загружаем данные из бэкенда
            const loadData = {
                "ReportsPage.useEffect.loadData": async ()=>{
                    try {
                        setLoading(true);
                        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEnterprises"])();
                        if (response.success && response.data) {
                            setEnterprises(response.data);
                        } else {
                            setError('Не удалось загрузить данные');
                        }
                    } catch (err) {
                        setError("Ошибка загрузки: ".concat(err.message));
                        console.error('Ошибка загрузки данных:', err);
                    } finally{
                        setLoading(false);
                    }
                }
            }["ReportsPage.useEffect.loadData"];
            loadData();
        }
    }["ReportsPage.useEffect"], []);
    const filteredEnterprises = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$analytics$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["filterEnterprises"])(enterprises, {
        dateRange: reportConfig.dateRange,
        industries: reportConfig.includeIndustries.length > 0 ? reportConfig.includeIndustries : undefined,
        regions: reportConfig.includeRegions.length > 0 ? reportConfig.includeRegions : undefined
    });
    const overallStats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$analytics$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateOverallStats"])(filteredEnterprises);
    const industryStats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$analytics$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateIndustryStats"])(filteredEnterprises);
    const regionStats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$analytics$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateRegionStats"])(filteredEnterprises);
    const handleGenerateReport = async (format)=>{
        setGeneratingReport(true);
        try {
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
            // Генерируем отчет в нужном формате
            if (format === 'excel') {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$report$2d$generator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateExcelReport"])(reportData);
            } else {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$report$2d$generator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generatePDFReport"])(reportData);
            }
            // Показываем уведомление об успехе (можно добавить toast notification)
            console.log("Отчет в формате ".concat(format.toUpperCase(), " успешно сгенерирован"));
        } catch (error) {
            console.error('Ошибка генерации отчета:', error);
            alert("Ошибка при генерации отчета: ".concat(error.message));
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
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center h-64",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"
                    }, void 0, false, {
                        fileName: "[project]/src/app/reports/page.tsx",
                        lineNumber: 144,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-lg text-gray-600 mt-4",
                        children: "Загрузка данных..."
                    }, void 0, false, {
                        fileName: "[project]/src/app/reports/page.tsx",
                        lineNumber: 145,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/reports/page.tsx",
                lineNumber: 143,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/reports/page.tsx",
            lineNumber: 142,
            columnNumber: 7
        }, this);
    }
    if (error) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center h-64",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                        className: "w-12 h-12 text-red-500 mx-auto mb-4"
                    }, void 0, false, {
                        fileName: "[project]/src/app/reports/page.tsx",
                        lineNumber: 155,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-lg text-red-600",
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/src/app/reports/page.tsx",
                        lineNumber: 156,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-600 mt-2",
                        children: "Проверьте, что бэкенд запущен на порту 4000"
                    }, void 0, false, {
                        fileName: "[project]/src/app/reports/page.tsx",
                        lineNumber: 157,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/reports/page.tsx",
                lineNumber: 154,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/reports/page.tsx",
            lineNumber: 153,
            columnNumber: 7
        }, this);
    }
    if (enterprises.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center h-64",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__["Upload"], {
                        className: "w-12 h-12 text-gray-400 mx-auto mb-4"
                    }, void 0, false, {
                        fileName: "[project]/src/app/reports/page.tsx",
                        lineNumber: 167,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-lg text-gray-600",
                        children: "Нет данных для отчетов"
                    }, void 0, false, {
                        fileName: "[project]/src/app/reports/page.tsx",
                        lineNumber: 168,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-500 mt-2",
                        children: "Загрузите файл с данными предприятий"
                    }, void 0, false, {
                        fileName: "[project]/src/app/reports/page.tsx",
                        lineNumber: 169,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: "/upload",
                        className: "mt-4 inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__["Upload"], {
                                className: "w-5 h-5 mr-2"
                            }, void 0, false, {
                                fileName: "[project]/src/app/reports/page.tsx",
                                lineNumber: 174,
                                columnNumber: 13
                            }, this),
                            "Загрузить данные"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/reports/page.tsx",
                        lineNumber: 170,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/reports/page.tsx",
                lineNumber: 166,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/reports/page.tsx",
            lineNumber: 165,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "max-w-6xl mx-auto space-y-8",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-3xl font-bold text-gray-900",
                        children: "Генерация отчётов"
                    }, void 0, false, {
                        fileName: "[project]/src/app/reports/page.tsx",
                        lineNumber: 186,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-600 mt-2",
                        children: "Создайте детальные отчёты по предприятиям Москвы в различных форматах"
                    }, void 0, false, {
                        fileName: "[project]/src/app/reports/page.tsx",
                        lineNumber: 187,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/reports/page.tsx",
                lineNumber: 185,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 lg:grid-cols-3 gap-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "lg:col-span-2 space-y-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-white p-6 rounded-lg shadow-sm border",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-lg font-semibold text-gray-900 mb-4",
                                        children: "Основные настройки"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/reports/page.tsx",
                                        lineNumber: 197,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "block text-sm font-medium text-gray-700 mb-2",
                                                        children: "Название отчёта"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 201,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        value: reportConfig.title,
                                                        onChange: (e)=>updateReportConfig('title', e.target.value),
                                                        className: "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 204,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/reports/page.tsx",
                                                lineNumber: 200,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                className: "block text-sm font-medium text-gray-700 mb-2",
                                                                children: "Дата начала"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/reports/page.tsx",
                                                                lineNumber: 214,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "date",
                                                                value: reportConfig.dateRange.from.toISOString().split('T')[0],
                                                                onChange: (e)=>updateReportConfig('dateRange', {
                                                                        ...reportConfig.dateRange,
                                                                        from: new Date(e.target.value)
                                                                    }),
                                                                className: "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/reports/page.tsx",
                                                                lineNumber: 217,
                                                                columnNumber: 19
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 213,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                className: "block text-sm font-medium text-gray-700 mb-2",
                                                                children: "Дата окончания"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/reports/page.tsx",
                                                                lineNumber: 228,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "date",
                                                                value: reportConfig.dateRange.to.toISOString().split('T')[0],
                                                                onChange: (e)=>updateReportConfig('dateRange', {
                                                                        ...reportConfig.dateRange,
                                                                        to: new Date(e.target.value)
                                                                    }),
                                                                className: "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/reports/page.tsx",
                                                                lineNumber: 231,
                                                                columnNumber: 19
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 227,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/reports/page.tsx",
                                                lineNumber: 212,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/reports/page.tsx",
                                        lineNumber: 199,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/reports/page.tsx",
                                lineNumber: 196,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-white p-6 rounded-lg shadow-sm border",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-lg font-semibold text-gray-900 mb-4",
                                        children: "Фильтры данных"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/reports/page.tsx",
                                        lineNumber: 247,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "block text-sm font-medium text-gray-700 mb-2",
                                                        children: "Отрасли (оставьте пустым для всех)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 251,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                        multiple: true,
                                                        value: reportConfig.includeIndustries,
                                                        onChange: (e)=>{
                                                            const selected = Array.from(e.target.selectedOptions, (option)=>option.value);
                                                            updateReportConfig('includeIndustries', selected);
                                                        },
                                                        className: "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                                                        size: 6,
                                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$data$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["INDUSTRIES"].map((industry)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: industry,
                                                                children: industry
                                                            }, industry, false, {
                                                                fileName: "[project]/src/app/reports/page.tsx",
                                                                lineNumber: 265,
                                                                columnNumber: 21
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 254,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/reports/page.tsx",
                                                lineNumber: 250,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "block text-sm font-medium text-gray-700 mb-2",
                                                        children: "Регионы (оставьте пустым для всех)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 271,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                        multiple: true,
                                                        value: reportConfig.includeRegions,
                                                        onChange: (e)=>{
                                                            const selected = Array.from(e.target.selectedOptions, (option)=>option.value);
                                                            updateReportConfig('includeRegions', selected);
                                                        },
                                                        className: "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                                                        size: 6,
                                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$data$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MOSCOW_REGIONS"].map((region)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: region,
                                                                children: region
                                                            }, region, false, {
                                                                fileName: "[project]/src/app/reports/page.tsx",
                                                                lineNumber: 285,
                                                                columnNumber: 21
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 274,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/reports/page.tsx",
                                                lineNumber: 270,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/reports/page.tsx",
                                        lineNumber: 249,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/reports/page.tsx",
                                lineNumber: 246,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-white p-6 rounded-lg shadow-sm border",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-lg font-semibold text-gray-900 mb-4",
                                        children: "Разделы отчёта"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/reports/page.tsx",
                                        lineNumber: 294,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-3",
                                        children: Object.entries(reportConfig.sections).map((param)=>{
                                            let [key, value] = param;
                                            const sectionNames = {
                                                overview: 'Общая статистика',
                                                industries: 'Анализ по отраслям',
                                                regions: 'Анализ по регионам',
                                                topEnterprises: 'Топ предприятия',
                                                trends: 'Тренды и динамика'
                                            };
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "flex items-center space-x-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "checkbox",
                                                        checked: value,
                                                        onChange: (e)=>updateSection(key, e.target.checked),
                                                        className: "w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 308,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-gray-700",
                                                        children: sectionNames[key]
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 314,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, key, true, {
                                                fileName: "[project]/src/app/reports/page.tsx",
                                                lineNumber: 307,
                                                columnNumber: 19
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/reports/page.tsx",
                                        lineNumber: 296,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/reports/page.tsx",
                                lineNumber: 293,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/reports/page.tsx",
                        lineNumber: 194,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-white p-6 rounded-lg shadow-sm border",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-lg font-semibold text-gray-900 mb-4",
                                        children: "Превью данных"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/reports/page.tsx",
                                        lineNumber: 326,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between p-3 bg-blue-50 rounded-lg",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center space-x-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__["Building2"], {
                                                                className: "w-5 h-5 text-blue-600"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/reports/page.tsx",
                                                                lineNumber: 331,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-sm font-medium text-blue-900",
                                                                children: "Предприятий"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/reports/page.tsx",
                                                                lineNumber: 332,
                                                                columnNumber: 19
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 330,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-blue-900 font-bold",
                                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$data$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatNumber"])(filteredEnterprises.length)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 334,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/reports/page.tsx",
                                                lineNumber: 329,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between p-3 bg-green-50 rounded-lg",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center space-x-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"], {
                                                                className: "w-5 h-5 text-green-600"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/reports/page.tsx",
                                                                lineNumber: 339,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-sm font-medium text-green-900",
                                                                children: "Общая выручка"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/reports/page.tsx",
                                                                lineNumber: 340,
                                                                columnNumber: 19
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 338,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-green-900 font-bold text-sm",
                                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$data$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(overallStats.totalRevenue)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 342,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/reports/page.tsx",
                                                lineNumber: 337,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between p-3 bg-purple-50 rounded-lg",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center space-x-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                                                className: "w-5 h-5 text-purple-600"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/reports/page.tsx",
                                                                lineNumber: 349,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-sm font-medium text-purple-900",
                                                                children: "Сотрудников"
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
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-purple-900 font-bold",
                                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$data$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatNumber"])(overallStats.totalEmployees)
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
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "pt-3 border-t border-gray-200",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-gray-500",
                                                        children: [
                                                            "Период: ",
                                                            reportConfig.dateRange.from.toLocaleDateString('ru-RU'),
                                                            " - ",
                                                            reportConfig.dateRange.to.toLocaleDateString('ru-RU')
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 356,
                                                        columnNumber: 17
                                                    }, this),
                                                    reportConfig.includeIndustries.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-gray-500 mt-1",
                                                        children: [
                                                            "Отрасли: ",
                                                            reportConfig.includeIndustries.length
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 360,
                                                        columnNumber: 19
                                                    }, this),
                                                    reportConfig.includeRegions.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-gray-500 mt-1",
                                                        children: [
                                                            "Регионы: ",
                                                            reportConfig.includeRegions.length
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 365,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/reports/page.tsx",
                                                lineNumber: 355,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/reports/page.tsx",
                                        lineNumber: 328,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/reports/page.tsx",
                                lineNumber: 325,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-white p-6 rounded-lg shadow-sm border",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-lg font-semibold text-gray-900 mb-4",
                                        children: "Генерация отчёта"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/reports/page.tsx",
                                        lineNumber: 375,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>handleGenerateReport('pdf'),
                                                disabled: generatingReport,
                                                className: "w-full flex items-center justify-center space-x-2 p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors",
                                                children: [
                                                    generatingReport ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "animate-spin rounded-full h-5 w-5 border-b-2 border-white"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 384,
                                                        columnNumber: 19
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                                                        className: "w-5 h-5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 386,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "Скачать PDF"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 388,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/reports/page.tsx",
                                                lineNumber: 378,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>handleGenerateReport('excel'),
                                                disabled: generatingReport,
                                                className: "w-full flex items-center justify-center space-x-2 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors",
                                                children: [
                                                    generatingReport ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "animate-spin rounded-full h-5 w-5 border-b-2 border-white"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 397,
                                                        columnNumber: 19
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__["Download"], {
                                                        className: "w-5 h-5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 399,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "Скачать Excel"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/reports/page.tsx",
                                                        lineNumber: 401,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/reports/page.tsx",
                                                lineNumber: 391,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/reports/page.tsx",
                                        lineNumber: 377,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-yellow-800",
                                            children: "💡 Отчёты генерируются на основе текущих фильтров и выбранных разделов"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/reports/page.tsx",
                                            lineNumber: 406,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/reports/page.tsx",
                                        lineNumber: 405,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/reports/page.tsx",
                                lineNumber: 374,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-white p-6 rounded-lg shadow-sm border",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-lg font-semibold text-gray-900 mb-4",
                                        children: "Быстрые шаблоны"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/reports/page.tsx",
                                        lineNumber: 414,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                                                lineNumber: 417,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                                                lineNumber: 436,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                                                lineNumber: 453,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/reports/page.tsx",
                                        lineNumber: 416,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/reports/page.tsx",
                                lineNumber: 413,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/reports/page.tsx",
                        lineNumber: 323,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/reports/page.tsx",
                lineNumber: 192,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/reports/page.tsx",
        lineNumber: 183,
        columnNumber: 5
    }, this);
}
_s(ReportsPage, "vnblBNinwmUb/6utrTQVihy8wiw=");
_c = ReportsPage;
var _c;
__turbopack_context__.k.register(_c, "ReportsPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_app_11522a64._.js.map