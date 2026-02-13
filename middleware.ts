import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
    // A list of all locales that are supported
    locales: ['en', 'ta', 'te', 'ml', 'hi'],

    // Used when no locale matches
    defaultLocale: 'en'
});

export const config = {
    // Match only internationalized pathnames
    // Matcher excluding internal paths, static files, and api/auth routes
    matcher: ['/((?!api|_next|.*\\..*|auth).*)']
};
