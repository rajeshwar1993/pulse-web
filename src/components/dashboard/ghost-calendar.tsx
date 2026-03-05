"use client";

import type React from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { getTodayPulseDay } from "@/lib/utils/streak";

interface GhostCalendarProps {
  pulsedDates: string[];
  memberSince: string;
  todayPulseDay?: string;
  children?: React.ReactNode;
}

const COLUMNS = 7;

type DayStatus = "pulsed" | "missed" | "today" | "future" | "pre-join";

function getDayStatus(
  date: string,
  todayPulseDay: string,
  memberSinceDate: string,
  pulsedSet: Set<string>,
): DayStatus {
  if (pulsedSet.has(date)) return "pulsed";
  if (date > todayPulseDay) return "future";
  if (date < memberSinceDate) return "pre-join";
  if (date === todayPulseDay) return "today";
  return "missed";
}

function getDotClasses(status: DayStatus): string {
  switch (status) {
    case "pulsed":
      return "bg-teal-300";
    case "missed":
      return "border-2 border-rose-300 bg-rose-50";
    case "today":
      return "border-2 border-[var(--slate-400)]";
    case "future":
      return "bg-[var(--slate-100)]";
    case "pre-join":
      return "bg-[var(--slate-100)]";
  }
}

function getTestId(status: DayStatus): string {
  switch (status) {
    case "pulsed":
      return "dot-filled";
    case "missed":
      return "dot-missed";
    case "today":
      return "dot-today";
    case "future":
      return "dot-future";
    case "pre-join":
      return "dot-pre-join";
  }
}

/** Find runs of 7+ consecutive pulsed days and return a Set of dates in those runs. */
function findStreakDates(dates: string[], pulsedSet: Set<string>): Set<string> {
  const streakDates = new Set<string>();
  let runStart = -1;

  for (let i = 0; i <= dates.length; i++) {
    const isPulsed = i < dates.length && pulsedSet.has(dates[i]);

    if (isPulsed) {
      if (runStart === -1) runStart = i;
    } else {
      if (runStart !== -1) {
        const runLength = i - runStart;
        if (runLength >= 7) {
          for (let j = runStart; j < i; j++) {
            streakDates.add(dates[j]);
          }
        }
        runStart = -1;
      }
    }
  }

  return streakDates;
}

/** Format YYYY-MM-DD to extract just the date portion for memberSince comparison. */
function toDateOnly(isoTimestamp: string): string {
  return isoTimestamp.slice(0, 10);
}

export function GhostCalendar({
  pulsedDates,
  memberSince,
  todayPulseDay: todayPulseDayProp,
  children,
}: GhostCalendarProps) {
  const t = useTranslations("activity");
  const today = todayPulseDayProp ?? getTodayPulseDay();
  const pulsedSet = new Set(pulsedDates);
  const memberSinceDate = toDateOnly(memberSince);

  // Derive year/month from todayPulseDay
  const [yearStr, monthStr] = today.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr) - 1; // 0-indexed

  // Calendar computations
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Sunday

  // Generate date strings for each day of the month
  const dates: string[] = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    return `${yearStr}-${monthStr}-${String(day).padStart(2, "0")}`;
  });

  // Find streak dates (runs of 7+ consecutive pulsed days)
  const streakDates = findStreakDates(dates, pulsedSet);

  // Month title
  const monthName = new Intl.DateTimeFormat("en", { month: "long" }).format(
    new Date(year, month, 1),
  );

  // Weekday labels
  const weekdays = [
    t("weekdays.sun"),
    t("weekdays.mon"),
    t("weekdays.tue"),
    t("weekdays.wed"),
    t("weekdays.thu"),
    t("weekdays.fri"),
    t("weekdays.sat"),
  ];

  return (
    <Card padding="md">
      {/* Month title */}
      <h3
        data-testid="month-title"
        className="text-sm font-semibold text-[var(--slate-600)] mb-3 text-center"
      >
        {monthName}
      </h3>

      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${COLUMNS}, 1fr)` }}
      >
        {/* Weekday header row */}
        {weekdays.map((label, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: static weekday headers never reorder
            key={`wh-${i}`}
            data-testid="weekday-header"
            className="flex items-center justify-center h-6 text-xs font-medium text-[var(--slate-400)]"
          >
            {label}
          </div>
        ))}

        {/* Padding cells for days before the 1st */}
        {Array.from({ length: firstDayOfWeek }, (_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static padding cells never reorder
          <div key={`pad-${i}`} data-testid="padding-cell" />
        ))}

        {/* Day dots */}
        {dates.map((date, i) => {
          const status = getDayStatus(date, today, memberSinceDate, pulsedSet);
          const isInStreak = streakDates.has(date);

          // Column position for streak rounding (accounting for padding)
          const gridIndex = firstDayOfWeek + i;
          const col = gridIndex % COLUMNS;
          const dayIndex = dates.indexOf(date);
          const isStreakStart =
            isInStreak &&
            (dayIndex === 0 || !streakDates.has(dates[dayIndex - 1]));
          const isStreakEnd =
            isInStreak &&
            (dayIndex === dates.length - 1 ||
              !streakDates.has(dates[dayIndex + 1]));

          const roundLeft = isInStreak && (isStreakStart || col === 0);
          const roundRight = isInStreak && (isStreakEnd || col === 6);

          const streakClasses = [
            "bg-teal-50",
            roundLeft ? "rounded-l-full" : "",
            roundRight ? "rounded-r-full" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <div
              key={date}
              className="flex items-center justify-center relative h-8"
            >
              {isInStreak && (
                <div
                  data-testid="streak-bg"
                  className={`absolute inset-y-1 inset-x-0 ${streakClasses}`}
                />
              )}
              <div
                data-testid={getTestId(status)}
                className={`relative z-10 w-6 h-6 rounded-full transition-colors ${getDotClasses(status)}`}
              />
            </div>
          );
        })}
      </div>
      {children}
    </Card>
  );
}
