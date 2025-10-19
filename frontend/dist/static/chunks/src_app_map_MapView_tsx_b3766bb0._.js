(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/app/map/MapView.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MapView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$MapContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/MapContainer.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$TileLayer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/TileLayer.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Marker$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/Marker.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Popup$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/Popup.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$hooks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/hooks.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/leaflet/dist/leaflet-src.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
// Фикс для иконок Leaflet в Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].Icon.Default.prototype._getIconUrl;
__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});
// Цвета для разных отраслей
const getIndustryColor = (industry)=>{
    const colors = {
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
const calculateProfitability = (enterprise)=>{
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
    const hash = enterprise.id.split('').reduce((acc, char)=>acc + char.charCodeAt(0), 0);
    const pseudoRandom = hash % 100 / 100; // 0-1
    // Размер предприятия влияет на эффективность (логарифмически)
    const sizeFactor = Math.log(enterprise.employees + 1) / Math.log(1000); // 0-1 для 1-1000 сотрудников
    // Отраслевой модификатор
    const industryModifiers = {
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
    let finalRentability = baseRentability + (pseudoRandom - 0.5) * 0.1 // ±5% случайная вариация
     + sizeFactor * 0.05 // до +5% за размер
     + industryBonus; // отраслевой модификатор
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
const hexToRgb = (hex)=>{
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : {
        r: 0,
        g: 0,
        b: 0
    };
};
// Функция для создания градиентного цвета на основе прибыльности
const getProfitabilityColor = (enterprise, baseColor, minProfitability, maxProfitability)=>{
    const profitability = calculateProfitability(enterprise);
    // Нормализуем прибыльность в диапазон [0, 1]
    const normalizedProfitability = maxProfitability > minProfitability ? (profitability - minProfitability) / (maxProfitability - minProfitability) : 0.5;
    const baseRgb = hexToRgb(baseColor);
    // Создаем градиент от светло-серого (низкая прибыльность) до яркого цвета отрасли (высокая прибыльность)
    const lowProfitColor = {
        r: 200,
        g: 200,
        b: 200
    }; // Светло-серый
    const r = Math.round(lowProfitColor.r + (baseRgb.r - lowProfitColor.r) * normalizedProfitability);
    const g = Math.round(lowProfitColor.g + (baseRgb.g - lowProfitColor.g) * normalizedProfitability);
    const b = Math.round(lowProfitColor.b + (baseRgb.b - lowProfitColor.b) * normalizedProfitability);
    return "rgb(".concat(r, ", ").concat(g, ", ").concat(b, ")");
};
// Создание кастомной иконки для маркера
const createCustomIcon = function(enterprise) {
    let selectedIndustries = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : [], allEnterprises = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : [];
    const baseColor = getIndustryColor(enterprise.industry);
    let markerColor = baseColor;
    // Если выбрана только одна отрасль и предприятие относится к ней, используем градиент
    if (selectedIndustries.length === 1 && selectedIndustries.includes(enterprise.industry)) {
        const industryEnterprises = allEnterprises.filter((e)=>e.industry === enterprise.industry);
        if (industryEnterprises.length > 1) {
            const profitabilities = industryEnterprises.map(calculateProfitability);
            const minProfitability = Math.min(...profitabilities);
            const maxProfitability = Math.max(...profitabilities);
            markerColor = getProfitabilityColor(enterprise, baseColor, minProfitability, maxProfitability);
        }
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].divIcon({
        className: 'custom-marker',
        html: '\n      <div style="\n        background-color: '.concat(markerColor, ';\n        width: 30px;\n        height: 30px;\n        border-radius: 50% 50% 50% 0;\n        transform: rotate(-45deg);\n        border: 3px solid white;\n        box-shadow: 0 2px 8px rgba(0,0,0,0.3);\n        display: flex;\n        align-items: center;\n        justify-content: center;\n      ">\n        <div style="\n          width: 8px;\n          height: 8px;\n          background-color: white;\n          border-radius: 50%;\n          transform: rotate(45deg);\n        "></div>\n      </div>\n    '),
        iconSize: [
            30,
            30
        ],
        iconAnchor: [
            15,
            30
        ],
        popupAnchor: [
            0,
            -30
        ]
    });
};
// Компонент для автоматического подстраивания границ карты
function MapBoundsUpdater(param) {
    let { enterprises } = param;
    _s();
    const map = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$hooks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMap"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MapBoundsUpdater.useEffect": ()=>{
            if (enterprises.length > 0) {
                const bounds = enterprises.filter({
                    "MapBoundsUpdater.useEffect.bounds": (e)=>e.latitude && e.longitude
                }["MapBoundsUpdater.useEffect.bounds"]).map({
                    "MapBoundsUpdater.useEffect.bounds": (e)=>[
                            e.latitude,
                            e.longitude
                        ]
                }["MapBoundsUpdater.useEffect.bounds"]);
                if (bounds.length > 0) {
                    map.fitBounds(bounds, {
                        padding: [
                            50,
                            50
                        ]
                    });
                }
            }
        }
    }["MapBoundsUpdater.useEffect"], [
        enterprises,
        map
    ]);
    return null;
}
_s(MapBoundsUpdater, "IoceErwr5KVGS9kN4RQ1bOkYMAg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$hooks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMap"]
    ];
});
_c = MapBoundsUpdater;
// Компонент легенды для градиентной раскраски
function ProfitabilityLegend(param) {
    let { selectedIndustries, enterprises } = param;
    // Показываем легенду только когда выбрана одна отрасль
    if (selectedIndustries.length !== 1) return null;
    const selectedIndustry = selectedIndustries[0];
    const industryEnterprises = enterprises.filter((e)=>e.industry === selectedIndustry);
    if (industryEnterprises.length <= 1) return null;
    const profitabilities = industryEnterprises.map(calculateProfitability);
    const minProfitability = Math.min(...profitabilities);
    const maxProfitability = Math.max(...profitabilities);
    const baseColor = getIndustryColor(selectedIndustry);
    const legendSteps = 5;
    const stepSize = (maxProfitability - minProfitability) / (legendSteps - 1);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 z-10",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                className: "text-sm font-semibold text-gray-900 mb-2",
                children: [
                    "Рентабельность в отрасли `",
                    selectedIndustry,
                    "`"
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/map/MapView.tsx",
                lineNumber: 238,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-1",
                children: Array.from({
                    length: legendSteps
                }, (_, i)=>{
                    const profitability = minProfitability + stepSize * i;
                    const normalizedProfitability = (profitability - minProfitability) / (maxProfitability - minProfitability);
                    const baseRgb = hexToRgb(baseColor);
                    const lowProfitColor = {
                        r: 200,
                        g: 200,
                        b: 200
                    };
                    const r = Math.round(lowProfitColor.r + (baseRgb.r - lowProfitColor.r) * normalizedProfitability);
                    const g = Math.round(lowProfitColor.g + (baseRgb.g - lowProfitColor.g) * normalizedProfitability);
                    const b = Math.round(lowProfitColor.b + (baseRgb.b - lowProfitColor.b) * normalizedProfitability);
                    const color = "rgb(".concat(r, ", ").concat(g, ", ").concat(b, ")");
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center space-x-2 text-xs",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-4 h-4 rounded-full border border-white shadow-sm",
                                style: {
                                    backgroundColor: color
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/app/map/MapView.tsx",
                                lineNumber: 256,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-gray-600",
                                children: [
                                    (profitability * 100).toFixed(1),
                                    "%"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/map/MapView.tsx",
                                lineNumber: 260,
                                columnNumber: 15
                            }, this)
                        ]
                    }, i, true, {
                        fileName: "[project]/src/app/map/MapView.tsx",
                        lineNumber: 255,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/app/map/MapView.tsx",
                lineNumber: 241,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500",
                children: [
                    "Выберите одну отрасль для",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                        fileName: "[project]/src/app/map/MapView.tsx",
                        lineNumber: 268,
                        columnNumber: 34
                    }, this),
                    "градиентной раскраски"
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/map/MapView.tsx",
                lineNumber: 267,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/map/MapView.tsx",
        lineNumber: 237,
        columnNumber: 5
    }, this);
}
_c1 = ProfitabilityLegend;
function MapView(param) {
    let { enterprises, onMarkerClick, selectedIndustries = [] } = param;
    // Центр Москвы (Кремль)
    const moscowCenter = [
        55.7558,
        37.6173
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative h-full w-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$MapContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MapContainer"], {
                center: moscowCenter,
                zoom: 10,
                style: {
                    height: '100%',
                    width: '100%'
                },
                className: "z-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$TileLayer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TileLayer"], {
                        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    }, void 0, false, {
                        fileName: "[project]/src/app/map/MapView.tsx",
                        lineNumber: 292,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MapBoundsUpdater, {
                        enterprises: enterprises
                    }, void 0, false, {
                        fileName: "[project]/src/app/map/MapView.tsx",
                        lineNumber: 297,
                        columnNumber: 9
                    }, this),
                    enterprises.map((enterprise)=>{
                        if (!enterprise.latitude || !enterprise.longitude || isNaN(enterprise.latitude) || isNaN(enterprise.longitude)) {
                            return null;
                        }
                        // Создаем уникальный ключ, который изменяется при смене режима градиента
                        const isGradientMode = selectedIndustries.length === 1 && selectedIndustries.includes(enterprise.industry);
                        const markerKey = "".concat(enterprise.id, "-").concat(isGradientMode ? 'gradient' : 'normal', "-").concat(selectedIndustries.join(','));
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Marker$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Marker"], {
                            position: [
                                enterprise.latitude,
                                enterprise.longitude
                            ],
                            icon: createCustomIcon(enterprise, selectedIndustries, enterprises),
                            eventHandlers: {
                                click: ()=>onMarkerClick(enterprise)
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Popup$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Popup"], {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "min-w-[200px]",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "font-bold text-gray-900 mb-2",
                                            children: enterprise.name
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/map/MapView.tsx",
                                            lineNumber: 320,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-1 text-sm",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-gray-600",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "font-medium",
                                                            children: "Отрасль:"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/map/MapView.tsx",
                                                            lineNumber: 323,
                                                            columnNumber: 23
                                                        }, this),
                                                        " ",
                                                        enterprise.industry
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/map/MapView.tsx",
                                                    lineNumber: 322,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-gray-600",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "font-medium",
                                                            children: "Регион:"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/map/MapView.tsx",
                                                            lineNumber: 326,
                                                            columnNumber: 23
                                                        }, this),
                                                        " ",
                                                        enterprise.region
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/map/MapView.tsx",
                                                    lineNumber: 325,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-gray-600",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "font-medium",
                                                            children: "Адрес:"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/map/MapView.tsx",
                                                            lineNumber: 329,
                                                            columnNumber: 23
                                                        }, this),
                                                        " ",
                                                        enterprise.contactInfo.address
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/map/MapView.tsx",
                                                    lineNumber: 328,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-gray-600",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "font-medium",
                                                            children: "Сотрудники:"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/map/MapView.tsx",
                                                            lineNumber: 332,
                                                            columnNumber: 23
                                                        }, this),
                                                        " ",
                                                        enterprise.employees.toLocaleString('ru-RU')
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/map/MapView.tsx",
                                                    lineNumber: 331,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-gray-600",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "font-medium",
                                                            children: "Выручка:"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/map/MapView.tsx",
                                                            lineNumber: 335,
                                                            columnNumber: 23
                                                        }, this),
                                                        " ",
                                                        enterprise.revenue.toLocaleString('ru-RU'),
                                                        " ₽"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/map/MapView.tsx",
                                                    lineNumber: 334,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-gray-600",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "font-medium",
                                                            children: "Рентабельность:"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/map/MapView.tsx",
                                                            lineNumber: 338,
                                                            columnNumber: 23
                                                        }, this),
                                                        " ",
                                                        (calculateProfitability(enterprise) * 100).toFixed(1),
                                                        "%"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/map/MapView.tsx",
                                                    lineNumber: 337,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/map/MapView.tsx",
                                            lineNumber: 321,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>onMarkerClick(enterprise),
                                            className: "mt-3 w-full bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-700 transition-colors",
                                            children: "Подробнее"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/map/MapView.tsx",
                                            lineNumber: 341,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/map/MapView.tsx",
                                    lineNumber: 319,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/map/MapView.tsx",
                                lineNumber: 318,
                                columnNumber: 15
                            }, this)
                        }, markerKey, false, {
                            fileName: "[project]/src/app/map/MapView.tsx",
                            lineNumber: 310,
                            columnNumber: 13
                        }, this);
                    })
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/map/MapView.tsx",
                lineNumber: 286,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ProfitabilityLegend, {
                selectedIndustries: selectedIndustries,
                enterprises: enterprises
            }, void 0, false, {
                fileName: "[project]/src/app/map/MapView.tsx",
                lineNumber: 355,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/map/MapView.tsx",
        lineNumber: 285,
        columnNumber: 5
    }, this);
}
_c2 = MapView;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "MapBoundsUpdater");
__turbopack_context__.k.register(_c1, "ProfitabilityLegend");
__turbopack_context__.k.register(_c2, "MapView");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/map/MapView.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/map/MapView.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=src_app_map_MapView_tsx_b3766bb0._.js.map