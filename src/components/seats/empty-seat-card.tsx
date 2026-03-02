"use client";

import { useTranslations } from "next-intl";

interface EmptySeatCardProps {
  onClick: () => void;
}

export function EmptySeatCard({ onClick }: EmptySeatCardProps) {
  const t = useTranslations("seats");

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border-2 border-dashed border-[var(--slate-300)] p-4 flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow-md hover:border-[var(--teal)] hover:bg-[var(--teal)]/5 transition-all cursor-pointer min-h-[120px]"
    >
      <svg
        className="w-8 h-8 text-[var(--slate-400)]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
        />
      </svg>
      <span className="text-sm font-medium text-[var(--slate-500)]">
        {t("addConnection")}
      </span>
    </button>
  );
}
