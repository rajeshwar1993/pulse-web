'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { LanguageSelector } from './language-selector';
import { LocaleService } from '@/lib/services/locale-service';
import type { SupportedLocale } from '@/i18n/config';

interface SettingsPageProps {
  currentLocale: string;
}

export function SettingsPage({ currentLocale }: SettingsPageProps) {
  const t = useTranslations('settings');
  const router = useRouter();
  const [activeLocale, setActiveLocale] = useState(currentLocale);

  const handleLocaleChange = (locale: SupportedLocale) => {
    setActiveLocale(locale);

    // Persist to localStorage and cookie immediately
    LocaleService.setStoredLocale(locale);

    // Sync to Supabase profile (fire-and-forget)
    LocaleService.syncToProfile(locale);

    // Notify Flutter if running in WebView
    LocaleService.notifyFlutterBridge(locale);

    // Refresh the page to re-render with new locale from cookie
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-[var(--slate-100)] transition-colors"
          aria-label={t('backToDashboard')}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[var(--slate-700)]"
          >
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-[var(--slate-900)]">
          {t('title')}
        </h1>
      </div>

      {/* Language Section */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-[var(--slate-200)]">
        <h2 className="text-lg font-semibold text-[var(--slate-800)] mb-4">
          {t('language')}
        </h2>
        <LanguageSelector
          currentLocale={activeLocale}
          onLocaleChange={handleLocaleChange}
        />
      </section>
    </div>
  );
}
