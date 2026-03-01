"use client";

import { useLocale, useTranslations } from "next-intl";
import { formatRelativeTime } from "@/lib/utils/format-date";

interface StatusCardProps {
  /**
   * Whether the user is active today (has pulsed)
   */
  isActive: boolean;
  /**
   * The timestamp when the user pulsed (if active)
   */
  pulseTime?: Date | null;
}

/**
 * StatusCard Component
 *
 * Displays the user's pulse status for the current day.
 * Shows either:
 * - Active state: Teal gradient with white checkmark indicator
 * - Inactive state: Slate gradient with translucent clock indicator
 */
export function StatusCard({ isActive, pulseTime }: StatusCardProps) {
  const t = useTranslations("dashboard.status");
  const locale = useLocale();

  const formattedTime = pulseTime
    ? formatRelativeTime(pulseTime, locale)
    : null;

  return (
    <div
      data-testid="status-card"
      className={`rounded-xl p-6 shadow-sm bg-gradient-to-r ${
        isActive ? "from-teal-400 to-teal-200" : "from-slate-400 to-slate-300"
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Status indicator */}
        <div className="relative flex items-center justify-center">
          {isActive ? (
            <>
              <div className="absolute w-16 h-16 rounded-full bg-white/20 animate-ping" />
              <div
                data-testid="status-indicator"
                className="relative w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md"
              >
                <svg
                  className="w-7 h-7 text-teal-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </>
          ) : (
            <div
              data-testid="status-indicator"
              className="w-14 h-14 rounded-full bg-white/30 flex items-center justify-center"
            >
              <svg
                className="w-7 h-7 text-white/70"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Status text */}
        <div>
          {isActive ? (
            <>
              <p className="text-white font-semibold text-lg">{t("active")}</p>
              {formattedTime && (
                <p className="text-white/80 text-sm">
                  {t("pulsedTime", { time: formattedTime })}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-white font-semibold text-lg">
                {t("notPulsedYet")}
              </p>
              <p className="text-white/70 text-sm">{t("autoPulseSent")}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
