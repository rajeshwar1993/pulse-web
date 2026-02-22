"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";

interface StreakBadgeProps {
  currentStreak: number;
  longestStreak: number;
}

/**
 * StreakBadge Component
 *
 * Displays the user's pulse streak with a flame icon and visual flair.
 * Shows current streak prominently and longest streak as secondary info.
 */
export function StreakBadge({
  currentStreak,
  longestStreak,
}: StreakBadgeProps) {
  const t = useTranslations("dashboard.streak");

  const hasStreak = currentStreak > 0;

  return (
    <Card padding="md">
      <div className="flex items-center justify-between">
        {/* Left: flame icon + current streak */}
        <div className="flex items-center gap-3">
          <div
            className={`
              w-12 h-12 rounded-full flex items-center justify-center text-2xl
              ${hasStreak ? "bg-gradient-to-br from-orange-400 to-red-500 shadow-lg shadow-orange-200" : "bg-[var(--slate-200)]"}
            `}
          >
            {hasStreak ? (
              <span role="img" aria-hidden="true">
                🔥
              </span>
            ) : (
              <svg
                className="w-6 h-6 text-[var(--slate-400)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
                />
              </svg>
            )}
          </div>

          <div>
            <p className="text-[var(--slate-900)] font-bold text-xl leading-tight">
              {currentStreak}{" "}
              <span className="text-base font-semibold text-[var(--slate-600)]">
                {t("days", { count: currentStreak })}
              </span>
            </p>
            <p className="text-[var(--slate-500)] text-sm">
              {hasStreak ? t("keepGoing") : t("startStreak")}
            </p>
          </div>
        </div>

        {/* Right: longest streak */}
        {longestStreak > 0 && (
          <div className="text-right">
            <p className="text-xs text-[var(--slate-400)] uppercase tracking-wide font-medium">
              {t("best")}
            </p>
            <p className="text-lg font-bold text-[var(--slate-700)]">
              {longestStreak}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
