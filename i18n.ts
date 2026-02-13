import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

const locales = ['en', 'ta', 'te', 'ml', 'hi'];

export default getRequestConfig(async ({ requestLocale }) => {
    let locale = await requestLocale;

    if (!locale || !locales.includes(locale as any)) {
        locale = 'en';
    }

    return {
        messages: (await import(`./messages/${locale}.json`)).default,
        locale: locale
    };
});
