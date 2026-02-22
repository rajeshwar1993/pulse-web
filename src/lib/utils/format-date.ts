import type { Locale } from "date-fns";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";

const localeMap: Record<string, Locale> = {
  en: enUS,
};

export function formatRelativeTime(date: Date, locale: string = "en"): string {
  return formatDistanceToNow(date, {
    addSuffix: true,
    locale: localeMap[locale] || enUS,
  });
}
