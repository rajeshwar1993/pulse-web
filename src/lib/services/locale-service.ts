import { supabase } from '@/lib/supabase/client';
import { defaultLocale, supportedLocales } from '@/i18n/config';
import type { SupportedLocale } from '@/i18n/config';

const LOCALE_STORAGE_KEY = 'pulse-locale';

export const LocaleService = {
  getStoredLocale(): SupportedLocale {
    if (typeof window === 'undefined') return defaultLocale;
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && supportedLocales.includes(stored as SupportedLocale)) {
      return stored as SupportedLocale;
    }
    return defaultLocale;
  },

  setStoredLocale(locale: SupportedLocale): void {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    // Also set as cookie for SSR access
    document.cookie = `pulse-locale=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
  },

  async syncToProfile(locale: SupportedLocale): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('profiles').update({ language_preference: locale }).eq('id', user.id);
    } catch (e) {
      console.error('Error syncing locale to profile:', e);
    }
  },

  async getProfileLocale(): Promise<SupportedLocale | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from('profiles')
        .select('language_preference')
        .eq('id', user.id)
        .single();
      const lang = data?.language_preference;
      if (lang && supportedLocales.includes(lang as SupportedLocale)) {
        return lang as SupportedLocale;
      }
      return null;
    } catch (e) {
      console.error('Error fetching profile locale:', e);
      return null;
    }
  },

  notifyFlutterBridge(locale: SupportedLocale): void {
    if (typeof window !== 'undefined' && (window as any).FlutterBridge) {
      (window as any).FlutterBridge.postMessage(
        JSON.stringify({ type: 'LOCALE_CHANGED', payload: { locale } }),
      );
    }
  },
};
