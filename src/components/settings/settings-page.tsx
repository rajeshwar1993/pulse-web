"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import type { SupportedLocale } from "@/i18n/config";
import { LocaleService } from "@/lib/services/locale-service";
import { LanguageSelector } from "./language-selector";

interface SettingsPageProps {
  currentLocale: string;
  dashboardHref?: string;
  profile?: { display_name: string; avatar_url: string };
  profileSetupHref?: string;
}

export function SettingsPage({
  currentLocale,
  dashboardHref,
  profile,
  profileSetupHref = "/appview/profile-setup?mode=edit",
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
      {dashboardHref ? (
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
      ) : (
        <Heading as="h1" size="lg" className="text-black">
          {t("title")}
        </Heading>
      )}

      {/* Profile Section */}
      {profile && (
        <Card className="rounded-2xl">
          <Heading as="h2" size="sm" className="text-[var(--slate-800)] mb-4">
            {t("profile")}
          </Heading>
          <div className="flex items-center gap-4">
            <Avatar
              src={profile.avatar_url}
              alt={profile.display_name}
              size="lg"
            />
            <div className="flex-1 min-w-0">
              <p className="text-lg font-semibold text-[var(--slate-800)] truncate">
                {profile.display_name}
              </p>
            </div>
            <Link
              href={profileSetupHref}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-[var(--slate-100)] transition-colors"
              aria-label={t("editProfile")}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[var(--slate-600)]"
                aria-hidden="true"
              >
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
            </Link>
          </div>
        </Card>
      )}

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
