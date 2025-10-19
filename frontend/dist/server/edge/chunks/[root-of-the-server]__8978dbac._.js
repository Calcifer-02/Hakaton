(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__8978dbac._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/src/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/web/exports/index.js [middleware-edge] (ecmascript)");
;
// Публичные пути, доступные без авторизации
const PUBLIC_PATHS = [
    '/login',
    '/auth/callback',
    '/api/public'
];
// Префиксы для статических ресурсов
const ASSET_PREFIXES = [
    '/_next',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '/file.svg',
    '/globe.svg',
    '/next.svg',
    '/vercel.svg',
    '/window.svg'
];
const API_BASE_URL = process.env.API_BASE_URL || 'http://backend:4000';
const AUTH_LOGIN_URL = ("TURBOPACK compile-time value", "/login") || 'http://localhost:5000';
const REQUIRE_AUTH = process.env.REQUIRE_AUTH !== 'false';
function isPublicPath(pathname) {
    // Проверяем статические ресурсы
    if (ASSET_PREFIXES.some((prefix)=>pathname.startsWith(prefix))) {
        return true;
    }
    // Проверяем публичные пути
    if (PUBLIC_PATHS.some((path)=>pathname.startsWith(path))) {
        return true;
    }
    return false;
}
async function middleware(request) {
    // Если авторизация отключена (для разработки)
    if (!REQUIRE_AUTH) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    }
    const { pathname } = request.nextUrl;
    // Пропускаем публичные пути и статику
    if (isPublicPath(pathname)) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    }
    // Проверяем наличие токена в куках
    const authToken = request.cookies.get('token') || request.cookies.get('auth_token');
    if (!authToken) {
        // Редирект на страницу авторизации
        const loginUrl = new URL(AUTH_LOGIN_URL);
        loginUrl.searchParams.set('returnTo', request.url);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(loginUrl);
    }
    // Опционально: валидация токена на бэкенде
    try {
        const validateUrl = `${API_BASE_URL}/api/auth/validate`;
        const response = await fetch(validateUrl, {
            method: 'GET',
            headers: {
                Cookie: request.headers.get('cookie') || '',
                Authorization: `Bearer ${authToken.value}`
            },
            cache: 'no-store'
        });
        if (!response.ok) {
            // Токен невалиден - редирект на логин
            const loginUrl = new URL(AUTH_LOGIN_URL);
            loginUrl.searchParams.set('returnTo', request.url);
            const redirectResponse = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(loginUrl);
            // Удаляем невалидный токен
            redirectResponse.cookies.delete('token');
            redirectResponse.cookies.delete('auth_token');
            return redirectResponse;
        }
    } catch (error) {
        console.error('Auth validation error:', error);
    // В случае ошибки валидации - пропускаем (чтобы не блокировать при недоступности auth)
    // Либо можно вернуть редирект, если хотите строгую проверку
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
}
const config = {
    matcher: [
        /*
     * Применяем middleware ко всем путям, кроме:
     * - _next/static (статические файлы)
     * - _next/image (оптимизация изображений)
     * - favicon.ico, другие файлы в public
     */ '/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg).*)'
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__8978dbac._.js.map