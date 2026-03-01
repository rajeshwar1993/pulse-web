"use client";

import { useTranslations } from "next-intl";
import { GhostCalendar } from "@/components/dashboard/ghost-calendar";
import { StreakBadge } from "@/components/dashboard/streak-badge";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";

interface ActivityContentProps {
  currentStreak: number;
  longestStreak: number;
  pulsedDates: string[];
  memberSince: string;
  totalPulses: number;
  todayPulseDay: string;
}

export function ActivityContent({
  currentStreak,
  longestStreak,
  pulsedDates,
  memberSince,
  totalPulses,
  todayPulseDay,
}: ActivityContentProps) {
  const t = useTranslations("activity");

  const formattedDate = new Date(memberSince).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <Heading as="h1" size="lg" className="text-teal-300">
        {t("title")}
      </Heading>

      {/* Streak Badge */}
      <StreakBadge
        currentStreak={currentStreak}
        longestStreak={longestStreak}
      />

      {/* Ghost Calendar */}
      <GhostCalendar
        pulsedDates={pulsedDates}
        memberSince={memberSince}
        todayPulseDay={todayPulseDay}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card padding="md">
          <p className="text-xs text-[var(--slate-400)] uppercase tracking-wide font-medium mb-1">
            {t("memberSince")}
          </p>
          <p className="text-base font-semibold text-[var(--slate-800)]">
            {formattedDate}
          </p>
        </Card>
        <Card padding="md">
          <p className="text-xs text-[var(--slate-400)] uppercase tracking-wide font-medium mb-1">
            {t("totalPulses")}
          </p>
          <p className="text-base font-semibold text-[var(--slate-800)]">
            {totalPulses}
          </p>
        </Card>
      </div>
    </div>
  );
}
