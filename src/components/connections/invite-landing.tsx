"use client";

import { useTranslations } from "next-intl";

const APP_STORE_URL = ""; // TODO: add real App Store URL
const PLAY_STORE_URL = ""; // TODO: add real Play Store URL

interface InviteLandingProps {
  code: string;
}

/**
 * Landing page shown when an unauthenticated mobile user opens an invite link.
 * Displays app store download links and a login fallback.
 */
export function InviteLanding({ code }: InviteLandingProps) {
  const t = useTranslations("inviteLanding");

  return (
    <div className="max-w-md mx-auto py-16 px-6 text-center">
      {/* Branded header */}
      <div className="mb-8">
        <div className="w-16 h-16 bg-[var(--pulse-purple)] rounded-2xl mx-auto mb-4 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[var(--dark-gray)] mb-2">
          {t("title")}
        </h1>
        <p className="text-[var(--slate-600)]">{t("subtitle")}</p>
      </div>

      {/* App Store links */}
      <div className="space-y-3 mb-8">
        {APP_STORE_URL && (
          <a
            href={APP_STORE_URL}
            className="block w-full py-3 px-6 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            {t("appStoreButton")}
          </a>
        )}
        {PLAY_STORE_URL && (
          <a
            href={PLAY_STORE_URL}
            className="block w-full py-3 px-6 bg-[var(--pulse-purple)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            {t("playStoreButton")}
          </a>
        )}
        {!APP_STORE_URL && !PLAY_STORE_URL && (
          <p className="text-sm text-[var(--slate-600)]">
            {t("appComingSoon")}
          </p>
        )}
      </div>

      {/* Login fallback */}
      <p className="text-sm text-[var(--slate-600)]">
        {t("alreadyHaveAccount")}{" "}
        <a
          href={`/auth/login?next=/invite?code=${code}`}
          className="text-[var(--pulse-purple)] font-medium hover:underline"
        >
          {t("logIn")}
        </a>
      </p>
    </div>
  );
}
