"use client";

import { useLocale, useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
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
 * - Active state: Green indicator with pulse time
 * - Inactive state: Grey indicator with "not pulsed yet" message
 */
export function StatusCard({ isActive, pulseTime }: StatusCardProps) {
  const t = useTranslations("dashboard.status");
  const locale = useLocale();

  // Format the pulse time for display
  const formattedTime = pulseTime
    ? formatRelativeTime(pulseTime, locale)
    : null;

  return (
    <Card>
      <Heading as="h2" size="sm" className="mb-4">
        {t("title")}
      </Heading>

      <div className="flex items-center gap-3">
        {/* Status indicator */}
        <div className="relative flex items-center justify-center">
          {isActive ? (
            // Active indicator with pulse animation
            <>
              <div className="absolute w-12 h-12 rounded-full bg-[var(--green)]/20 animate-ping" />
              <div className="relative w-10 h-10 rounded-full bg-[var(--green)] flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
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
            // Inactive indicator
            <div className="w-10 h-10 rounded-full bg-[var(--slate-300)] flex items-center justify-center">
              <svg
                className="w-5 h-5 text-[var(--slate-500)]"
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
              <p className="text-[var(--slate-900)] font-semibold">
                {t("active")}
              </p>
              {formattedTime && (
                <p className="text-[var(--slate-600)] text-sm">
                  {t("pulsedTime", { time: formattedTime })}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-[var(--slate-700)] font-semibold">
                {t("notPulsedYet")}
              </p>
              <p className="text-[var(--slate-500)] text-sm">
                {t("autoPulseSent")}
              </p>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
