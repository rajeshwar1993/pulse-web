"use client";

import { useTranslations } from "next-intl";
import type { DashboardSeat } from "@/lib/types/seat";

interface PendingSeatCardProps {
  seat: DashboardSeat;
  onClick: () => void;
}

export function PendingSeatCard({ seat, onClick }: PendingSeatCardProps) {
  const t = useTranslations("seats");
  const tCommon = useTranslations("common");

  const isInviteCode = seat.pendingInfo?.type === "invite_code";
  const label = isInviteCode ? t("inviteCodeShared") : t("requestSent");

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border border-[var(--pulse-purple)]/20 bg-[var(--pulse-purple)]/[0.03] p-4 text-left shadow-sm hover:shadow-md hover:border-[var(--pulse-purple)]/40 transition-all cursor-pointer min-h-[120px] flex flex-col justify-between"
    >
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-[var(--pulse-purple)]/10 flex items-center justify-center flex-shrink-0">
          {isInviteCode ? (
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
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
          ) : (
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--pulse-purple)]">
            {label}
          </p>
          {seat.pendingInfo && (
            isInviteCode ? (
              <>
                <span className="inline-block mt-1 bg-[var(--pulse-purple)]/10 rounded-md px-3 py-1 font-mono text-base font-bold text-[var(--pulse-purple)]">
                  {seat.pendingInfo.label}
                </span>
                <p className="text-xs text-[var(--slate-400)] mt-1">{t("clickToCopyCode")}</p>
              </>
            ) : (
              <p className="text-sm text-[var(--slate-500)] truncate mt-0.5">
                {seat.pendingInfo.label}
              </p>
            )
          )}
        </div>
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--pulse-purple)] animate-pulse-dot" />
          <span className="text-xs text-[var(--slate-400)]">
            {t("waitingForResponse")}
          </span>
        </div>
        <span className="text-xs text-[var(--error)] font-medium">
          {tCommon("cancel")}
        </span>
      </div>
    </button>
  );
}
