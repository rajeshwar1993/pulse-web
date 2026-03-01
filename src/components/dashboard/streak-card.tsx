"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";

interface StreakCardProps {
  currentStreak: number;
  isActive: boolean;
  pulsedDates: string[];
  totalDays: number;
  todayPulseDay: string;
}

const DOT_COUNT = 12;

/**
 * Compute the date string (YYYY-MM-DD) for a given dot index.
 */
function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type DotState =
  | "pulsed"
  | "missed"
  | "current-pulsed"
  | "current-empty"
  | "future";

/**
 * StreakCard Component
 *
 * Displays the user's current streak with a flame icon and a 12-day dot
 * timeline showing past, current, and future days with streak grouping.
 */
export function StreakCard({
  currentStreak,
  isActive,
  pulsedDates,
  totalDays,
  todayPulseDay,
}: StreakCardProps) {
  const t = useTranslations("dashboard.streakCard");
  const hasStreak = currentStreak > 0;

  // --- Compute sliding window ---
  const currentDayIndex = totalDays < 9 ? totalDays - 1 : 8;
  const startDate =
    totalDays < 9
      ? addDays(todayPulseDay, -(totalDays - 1))
      : addDays(todayPulseDay, -8);

  const pulsedSet = new Set(pulsedDates);

  // --- Build dot data ---
  const dots: { date: string; state: DotState; opacity: number }[] = [];
  for (let i = 0; i < DOT_COUNT; i++) {
    const date = addDays(startDate, i);
    let state: DotState;
    let opacity = 1;

    if (i < currentDayIndex) {
      state = pulsedSet.has(date) ? "pulsed" : "missed";
    } else if (i === currentDayIndex) {
      state = isActive ? "current-pulsed" : "current-empty";
    } else {
      state = "future";
      const futureOffset = i - currentDayIndex;
      opacity = Math.max(1 - futureOffset * 0.1, 0.1);
    }

    dots.push({ date, state, opacity });
  }

  // --- Determine segment colors ---
  function isFilled(state: DotState): boolean {
    return state === "pulsed" || state === "current-pulsed";
  }

  return (
    <Card padding="md">
      {/* Top section: streak info */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className={`
            w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0
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

      {/* Bottom section: 12-day dot timeline */}
      <div
        className="relative flex items-center justify-between"
        data-testid="streak-timeline"
      >
        {/* Line segments (behind dots) */}
        {dots.map((dot, i) => {
          if (i === DOT_COUNT - 1) return null;
          const nextDot = dots[i + 1];
          const bothFilled = isFilled(dot.state) && isFilled(nextDot.state);
          const hasFuture =
            dot.state === "future" || nextDot.state === "future";
          const segmentOpacity = hasFuture
            ? Math.min(dot.opacity, nextDot.opacity)
            : 1;

          return (
            <div
              key={`seg-${dot.date}`}
              data-testid={`segment-${i}`}
              className={`absolute top-1/2 -translate-y-1/2 h-0.5 ${bothFilled ? "bg-[var(--teal)]" : hasFuture ? "bg-[var(--slate-300)]" : "bg-[var(--slate-200)]"}`}
              style={{
                left: `${(i / (DOT_COUNT - 1)) * 100}%`,
                width: `${(1 / (DOT_COUNT - 1)) * 100}%`,
                opacity: segmentOpacity,
              }}
            />
          );
        })}

        {/* Dots */}
        {dots.map((dot, i) => {
          const isCurrent =
            dot.state === "current-pulsed" || dot.state === "current-empty";
          const isPulsed =
            dot.state === "pulsed" || dot.state === "current-pulsed";
          const isMissed = dot.state === "missed";
          const isFuture = dot.state === "future";

          return (
            <div
              key={dot.date}
              className="relative z-10 flex items-center justify-center"
              style={{ opacity: dot.opacity }}
              data-testid={`dot-${i}`}
              data-dot-state={dot.state}
            >
              {/* Pulsing border for current day */}
              {isCurrent && (
                <div className="absolute w-4 h-4 rounded-full border-2 border-[var(--teal)] animate-ping" />
              )}

              <div
                className={`
                  w-3 h-3 rounded-full
                  ${isPulsed ? "bg-[var(--teal)]" : ""}
                  ${isMissed ? "border-2 border-[var(--error)] bg-transparent" : ""}
                  ${isFuture ? "bg-[var(--slate-300)]" : ""}
                  ${dot.state === "current-empty" ? "border-2 border-[var(--teal)] bg-transparent" : ""}
                `}
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
