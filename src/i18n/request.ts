import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { defaultLocale, supportedLocales } from './config';
import type { SupportedLocale } from './config';

export default getRequestConfig(async () => {
  let locale: SupportedLocale = defaultLocale;

  try {
    const cookieStore = await cookies();
    const stored = cookieStore.get('pulse-locale')?.value;
    if (stored && supportedLocales.includes(stored as SupportedLocale)) {
      locale = stored as SupportedLocale;
    }
  } catch {
    // cookies() may fail in some contexts, fallback to default
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
