"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { IconBadge } from "@/components/ui/icon-badge";

interface MilestoneBadgesProps {
  totalPulses: number;
  longestStreak: number;
}

const pulseMilestones = [
  { threshold: 7, emoji: "🌱" },
  { threshold: 30, emoji: "🌿" },
  { threshold: 50, emoji: "🌳" },
  { threshold: 100, emoji: "💎" },
  { threshold: 200, emoji: "🏆" },
  { threshold: 365, emoji: "👑" },
] as const;

const streakMilestones = [
  { threshold: 7, emoji: "🔥" },
  { threshold: 14, emoji: "⚡" },
  { threshold: 30, emoji: "🌟" },
  { threshold: 60, emoji: "💫" },
  { threshold: 100, emoji: "🏅" },
] as const;

export function MilestoneBadges({
  totalPulses,
  longestStreak,
}: MilestoneBadgesProps) {
  const t = useTranslations("activity.milestones");

  return (
    <Card padding="md" data-testid="milestone-badges">
      <h3 className="text-sm font-semibold text-[var(--slate-600)] mb-4">
        {t("title")}
      </h3>

      {/* Pulse milestones */}
      <p className="text-xs text-[var(--slate-400)] uppercase tracking-wide font-medium mb-2">
        {t("pulseLabel")}
      </p>
      <div className="flex flex-wrap gap-3 mb-4">
        {pulseMilestones.map(({ threshold, emoji }) => {
          const earned = totalPulses >= threshold;
          return (
            <div
              key={`pulse-${threshold}`}
              className="flex flex-col items-center gap-1"
              data-testid={`pulse-milestone-${threshold}`}
            >
              <IconBadge
                size="sm"
                color={earned ? "teal" : "slate"}
                className={earned ? "" : "opacity-40"}
              >
                <span className="text-lg">{emoji}</span>
              </IconBadge>
              <span
                className={`text-xs font-medium ${earned ? "text-[var(--slate-700)]" : "text-[var(--slate-300)]"}`}
              >
                {threshold}
              </span>
            </div>
          );
        })}
      </div>

      {/* Streak milestones */}
      <p className="text-xs text-[var(--slate-400)] uppercase tracking-wide font-medium mb-2">
        {t("streakLabel")}
      </p>
      <div className="flex flex-wrap gap-3">
        {streakMilestones.map(({ threshold, emoji }) => {
          const earned = longestStreak >= threshold;
          return (
            <div
              key={`streak-${threshold}`}
              className="flex flex-col items-center gap-1"
              data-testid={`streak-milestone-${threshold}`}
            >
              <IconBadge
                size="sm"
                color={earned ? "teal" : "slate"}
                className={earned ? "" : "opacity-40"}
              >
                <span className="text-lg">{emoji}</span>
              </IconBadge>
              <span
                className={`text-xs font-medium ${earned ? "text-[var(--slate-700)]" : "text-[var(--slate-300)]"}`}
              >
                {threshold}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
