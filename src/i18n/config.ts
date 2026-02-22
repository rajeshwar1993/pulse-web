export const defaultLocale = "en";
export const supportedLocales = ["en"] as const;
export type SupportedLocale = (typeof supportedLocales)[number];

export const localeNames: Record<SupportedLocale, string> = {
  en: "English",
  // Future: hi: 'हिन्दी', ja: '日本語'
};
