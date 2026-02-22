"use client";

import { useLocale, useTranslations } from "next-intl";
import { Avatar } from "@/components/ui/avatar";
import { IconBadge } from "@/components/ui/icon-badge";
import { usePartnerTime } from "@/hooks/use-partner-time";
import { formatRelativeTime } from "@/lib/utils/format-date";
import { getWaitingContext } from "@/lib/utils/timezone";

interface ConnectionCardProps {
  /**
   * Avatar URL for the connection
   */
  avatar: string;
  /**
   * Display name of the connection
   */
  name: string;
  /**
   * IANA timezone string for the connection (e.g., "America/New_York")
   */
  timezone: string;
  /**
   * Status of the connection (active = pulsed today, waiting = hasn't pulsed yet)
   */
  status: "active" | "waiting";
  /**
   * The timestamp when the connection pulsed (if active)
   */
  pulseTime?: Date | null;
  /**
   * Current consecutive pulse-day streak
   */
  currentStreak?: number;
}

/**
 * ConnectionCard Component
 *
 * Displays a single connection with their pulse status.
 * Variants:
 * - Active: Full opacity, colored ring, shows pulse time
 * - Waiting: Lower opacity, desaturated, shows "Waiting..." message
 */
export function ConnectionCard({
  avatar,
  name,
  timezone,
  status,
  pulseTime,
  currentStreak = 0,
}: ConnectionCardProps) {
  const t = useTranslations("dashboard.connectionCard");
  const locale = useLocale();
  const isActive = status === "active";
  const partnerTime = usePartnerTime(timezone, locale);
  const waitingContext = getWaitingContext(timezone);

  // Format the pulse time for display
  const formattedTime =
    pulseTime && isActive ? formatRelativeTime(pulseTime, locale) : null;

  return (
    <div
      className={`
        relative bg-white rounded-xl p-4 border
        transition-all duration-200 hover:shadow-md
        ${
          isActive
            ? "border-[var(--teal)]/30 shadow-sm"
            : "border-[var(--slate-200)] opacity-70"
        }
      `}
    >
      <div className="flex items-center gap-3">
        {/* Avatar with status ring */}
        <Avatar
          src={avatar}
          alt={name}
          status={isActive ? "active" : "inactive"}
        />

        {/* Connection info */}
        <div className="flex-1 min-w-0">
          <p
            className={`
              font-semibold truncate
              ${isActive ? "text-[var(--slate-900)]" : "text-[var(--slate-600)]"}
            `}
            title={name}
          >
            {name}
          </p>
          <p
            className={`
              text-sm truncate
              ${isActive ? "text-[var(--slate-600)]" : "text-[var(--slate-500)]"}
            `}
          >
            {isActive ? (
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
          {partnerTime && (
            <p className="text-xs text-[var(--slate-400)] truncate">
              {t("localTime", { time: partnerTime, name })}
            </p>
          )}
        </div>

        {/* Streak + Status icon */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {currentStreak > 0 && (
            <span
              className="text-xs font-semibold text-orange-500 flex items-center gap-0.5"
              title={`${currentStreak} day streak`}
            >
              🔥 {currentStreak}
            </span>
          )}
          {isActive ? (
            <IconBadge size="xs" color="green">
              <svg
                className="w-4 h-4 text-[var(--green)]"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
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
            </IconBadge>
          )}
        </div>
      </div>
    </div>
  );
}
