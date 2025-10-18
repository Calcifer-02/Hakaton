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
        currency: 'RUB'
    }).format(amount);
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
"[project]/src/app/reports/page.tsx [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/src/app/reports/page.tsx'\n\nUnexpected eof");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
]);

//# sourceMappingURL=src_app_4ce1a307._.js.map