"use client";

import { useLocale, useTranslations } from "next-intl";
import { Avatar } from "@/components/ui/avatar";

import { usePartnerTime } from "@/hooks/use-partner-time";
import { formatRelativeTime } from "@/lib/utils/format-date";
import { getWaitingContext } from "@/lib/utils/timezone";
import type { DashboardSeat } from "@/lib/types/seat";

interface OccupiedSeatCardProps {
  seat: DashboardSeat;
  onClick?: () => void;
}

export function OccupiedSeatCard({ seat, onClick }: OccupiedSeatCardProps) {
  const t = useTranslations("dashboard.connectionCard");
  const locale = useLocale();
  const conn = seat.connection;
  if (!conn) return null;

  const isPaused = conn.status === "paused";
  const isActive = conn.pulseTime != null && !isPaused;
  const partnerTime = usePartnerTime(conn.timezone, locale);
  const waitingContext = getWaitingContext(conn.timezone);

  const formattedTime =
    conn.pulseTime && isActive
      ? formatRelativeTime(conn.pulseTime, locale)
      : null;

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: card click handled by parent
    <div
      onClick={onClick}
      className={`
        relative bg-white rounded-xl p-4 border transition-all duration-200 min-h-[120px]
        ${onClick ? "cursor-pointer hover:shadow-lg" : ""}
        ${
          isPaused
            ? "border-[var(--slate-200)] shadow-sm opacity-50"
            : isActive
              ? "border-[var(--teal)]/30 shadow-md"
              : "border-[var(--slate-200)] shadow-sm opacity-70"
        }
      `}
    >
      {/* Top row: avatar + name + icons */}
      <div className="flex items-start gap-3">
        <Avatar
          src={conn.avatar}
          alt={conn.name}
          status={isPaused ? "inactive" : isActive ? "active" : "inactive"}
        />
        <div className="flex-1 min-w-0">
          <p
            className={`font-semibold truncate ${isActive ? "text-[var(--slate-900)]" : "text-[var(--slate-600)]"}`}
            title={conn.name}
          >
            {conn.name}
          </p>
          {!isPaused && conn.currentStreak > 0 && (
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className="text-xs font-semibold text-orange-500 flex items-center gap-0.5"
                title={`${conn.currentStreak} day streak`}
              >
                🔥 {conn.currentStreak}
              </span>
            </div>
          )}
        </div>
      </div>
      {/* Status and time — full width, aligned under avatar */}
      <p
        className={`text-sm truncate mt-1 ${isActive ? "text-[var(--slate-600)]" : "text-[var(--slate-500)]"}`}
      >
        {isPaused ? (
          <span className="text-[var(--slate-400)] italic">Paused</span>
        ) : isActive ? (
          <>
            <span className="text-[var(--green)] font-medium">
              {t("active")}
            </span>
            {formattedTime && (
              <>
                {" "}
                •{" "}
                <span className="text-[var(--slate-500)]">
                  {formattedTime}
                </span>
              </>
            )}
          </>
        ) : (
          <span className="text-[var(--slate-500)]">
            {waitingContext === "morning"
              ? t("earlyMorning")
              : t("waiting")}
          </span>
        )}
      </p>
      {partnerTime && !isPaused && (
        <p className="text-xs text-[var(--slate-400)] truncate">
          {t("localTime", { time: partnerTime, name: conn.name })}
        </p>
      )}
    </div>
  );
}
