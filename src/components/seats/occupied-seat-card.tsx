"use client";

import { useLocale, useTranslations } from "next-intl";
import { Avatar } from "@/components/ui/avatar";
import { IconBadge } from "@/components/ui/icon-badge";
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
        relative bg-white rounded-xl p-4 border transition-all duration-200
        ${onClick ? "cursor-pointer hover:shadow-md" : ""}
        ${isPaused
          ? "border-[var(--slate-200)] opacity-50"
          : isActive
            ? "border-[var(--teal)]/30 shadow-sm"
            : "border-[var(--slate-200)] opacity-70"
        }
      `}
    >
      <div className="flex items-center gap-3">
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
          <p
            className={`text-sm truncate ${isActive ? "text-[var(--slate-600)]" : "text-[var(--slate-500)]"}`}
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
        <div className="flex items-center gap-2 flex-shrink-0">
          {conn.currentStreak > 0 && !isPaused && (
            <span
              className="text-xs font-semibold text-orange-500 flex items-center gap-0.5"
              title={`${conn.currentStreak} day streak`}
            >
              🔥 {conn.currentStreak}
            </span>
          )}
          {isActive ? (
            <IconBadge size="xs" color="green">
              <svg
                className="w-4 h-4 text-[var(--green)]"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
            </IconBadge>
          ) : (
            <IconBadge size="xs" color="slate">
              <svg
                className="w-4 h-4 text-[var(--slate-400)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </IconBadge>
          )}
        </div>
      </div>
    </div>
  );
}
