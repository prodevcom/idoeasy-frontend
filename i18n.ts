import { getRequestConfig } from 'next-intl/server';

// Supported locales
export const locales = ['en', 'pt-BR'] as const;
export const defaultLocale = 'pt-BR' as const;

export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale as Locale)) {
    // Use default locale instead of notFound()
    locale = defaultLocale;
  }

  try {
    const messages = (await import(`./messages/${locale}.json`)).default;
    return {
      locale,
      messages,
    };
  } catch (error) {
    console.error(`Error loading messages for locale ${locale}:`, error);
    // Return empty messages as fallback
    return {
      locale,
      messages: {},
    };
  }
});
