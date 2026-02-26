"use client";

import { useTranslations } from "next-intl";
import type { DashboardSeat } from "@/lib/types/seat";

interface ExpiredSeatCardProps {
  seat: DashboardSeat;
  onClick: () => void;
}

export function ExpiredSeatCard({ seat, onClick }: ExpiredSeatCardProps) {
  const t = useTranslations("seats");

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border border-[var(--slate-200)] bg-[var(--slate-50)] p-4 text-left hover:border-[var(--slate-300)] transition-colors cursor-pointer min-h-[120px] opacity-60"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[var(--slate-200)] flex items-center justify-center flex-shrink-0">
          <svg
            className="w-5 h-5 text-[var(--slate-400)]"
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
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-[var(--slate-600)]">
              {t("seatLabel", { number: seat.seatNumber })}
            </p>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--slate-200)] text-[var(--slate-500)]">
              {t("expired")}
            </span>
          </div>
          {seat.connection && (
            <p className="text-xs text-[var(--slate-400)] truncate mt-0.5">
              {seat.connection.name}
            </p>
          )}
        </div>
      </div>
      <p className="text-xs text-[var(--teal)] font-medium mt-2">
        {t("tapToRenew")}
      </p>
    </button>
  );
}
