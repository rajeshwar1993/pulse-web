import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { LOCALE_COOKIE_NAME } from "@/lib/constants";
import type { SupportedLocale } from "./config";
import { defaultLocale, supportedLocales } from "./config";

export default getRequestConfig(async () => {
  let locale: SupportedLocale = defaultLocale;

  try {
    const cookieStore = await cookies();
    const stored = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
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
