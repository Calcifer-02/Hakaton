import { NextResponse, type NextRequest } from 'next/server';

// Публичные пути, доступные без авторизации
const PUBLIC_PATHS = ['/login', '/auth/callback', '/api/public'];

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
  '/window.svg',
];

const API_BASE_URL = process.env.API_BASE_URL || 'http://backend:4000';
const AUTH_LOGIN_URL = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:5000';
const REQUIRE_AUTH = process.env.REQUIRE_AUTH !== 'false';

function isPublicPath(pathname: string): boolean {
  // Проверяем статические ресурсы
  if (ASSET_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return true;
  }
  // Проверяем публичные пути
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return true;
  }
  return false;
}

export async function middleware(request: NextRequest) {
  // Если авторизация отключена (для разработки)
  if (!REQUIRE_AUTH) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Пропускаем публичные пути и статику
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Проверяем наличие токена в куках
  const authToken = request.cookies.get('token') || request.cookies.get('auth_token');

  if (!authToken) {
    // Редирект на страницу авторизации
    const loginUrl = new URL(AUTH_LOGIN_URL);
    loginUrl.searchParams.set('returnTo', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Опционально: валидация токена на бэкенде
  try {
    const validateUrl = `${API_BASE_URL}/api/auth/validate`;
    const response = await fetch(validateUrl, {
      method: 'GET',
      headers: {
        Cookie: request.headers.get('cookie') || '',
        Authorization: `Bearer ${authToken.value}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      // Токен невалиден - редирект на логин
      const loginUrl = new URL(AUTH_LOGIN_URL);
      loginUrl.searchParams.set('returnTo', request.url);

      const redirectResponse = NextResponse.redirect(loginUrl);
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

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Применяем middleware ко всем путям, кроме:
     * - _next/static (статические файлы)
     * - _next/image (оптимизация изображений)
     * - favicon.ico, другие файлы в public
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg).*)',
  ],
};

