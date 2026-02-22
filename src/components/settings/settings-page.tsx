"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import type { SupportedLocale } from "@/i18n/config";
import { LocaleService } from "@/lib/services/locale-service";
import { LanguageSelector } from "./language-selector";

interface SettingsPageProps {
  currentLocale: string;
  dashboardHref?: string;
}

export function SettingsPage({
  currentLocale,
  dashboardHref = "/appview/dashboard",
}: SettingsPageProps) {
  const t = useTranslations("settings");
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
          href={dashboardHref}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-[var(--slate-100)] transition-colors"
          aria-label={t("backToDashboard")}
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
            aria-hidden="true"
          >
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
        </Link>
        <Heading as="h1" size="md">
          {t("title")}
        </Heading>
      </div>

      {/* Language Section */}
      <Card className="rounded-2xl">
        <Heading as="h2" size="sm" className="text-[var(--slate-800)] mb-4">
          {t("language")}
        </Heading>
        <LanguageSelector
          currentLocale={activeLocale}
          onLocaleChange={handleLocaleChange}
        />
      </Card>
    </div>
  );
}
