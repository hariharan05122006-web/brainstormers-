import { type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';
import createMiddleware from 'next-intl/middleware';

export async function middleware(request: NextRequest) {
    // 1. Update Supabase session (refresh auth tokens)
    const response = await updateSession(request); // This returns a response with updated cookies

    // 2. Run next-intl middleware
    const handleI18n = createMiddleware({
        locales: ['en', 'ta', 'te', 'ml', 'hi'],
        defaultLocale: 'en'
    });

    const i18nResponse = handleI18n(request);

    // 3. Merge cookies from Supabase response into next-intl response
    // ensuring both auth and locale cookies are preserved
    response.cookies.getAll().forEach((cookie) => {
        i18nResponse.cookies.set(cookie.name, cookie.value);
    });

    return i18nResponse;
}

export const config = {
    // Match only internationalized pathnames
    // Matcher excluding internal paths, static files, and api/auth routes
    matcher: ['/((?!api|_next|.*\\..*|auth).*)']
};
