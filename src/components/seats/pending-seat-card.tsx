"use client";

import { useTranslations } from "next-intl";
import type { DashboardSeat } from "@/lib/types/seat";

interface PendingSeatCardProps {
  seat: DashboardSeat;
  onClick: () => void;
}

export function PendingSeatCard({ seat, onClick }: PendingSeatCardProps) {
  const t = useTranslations("seats");

  const isInviteCode = seat.pendingInfo?.type === "invite_code";
  const label = isInviteCode ? t("inviteCodeShared") : t("requestSent");

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border border-[var(--pulse-purple)]/30 bg-[var(--pulse-purple)]/5 p-4 text-left shadow-sm hover:shadow-md hover:border-[var(--pulse-purple)]/50 transition-all cursor-pointer min-h-[120px]"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[var(--pulse-purple)]/10 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-5 h-5 text-[var(--pulse-purple)]"
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
          <p className="text-sm font-medium text-[var(--pulse-purple)]">
            {label}
          </p>
          {seat.pendingInfo && (
            <p className="text-xs text-[var(--slate-500)] truncate mt-0.5">
              {seat.pendingInfo.label}
            </p>
          )}
        </div>
      </div>
      <p className="text-xs text-[var(--slate-400)] mt-2">{t("tapToCancel")}</p>
    </button>
  );
}
