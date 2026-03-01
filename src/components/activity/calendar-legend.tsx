"use client";

import { useTranslations } from "next-intl";

const legendItems = [
  { key: "pulsed", dotClass: "bg-teal-300" },
  { key: "missed", dotClass: "border-2 border-rose-300 bg-rose-50" },
  { key: "today", dotClass: "border-2 border-[var(--slate-400)]" },
  { key: "streak", dotClass: "bg-teal-50 border border-teal-200" },
] as const;

export function CalendarLegend() {
  const t = useTranslations("activity.legend");

  return (
    <div
      data-testid="calendar-legend"
      className="flex flex-wrap gap-x-4 gap-y-2 border-t border-[var(--slate-100)] pt-3 mt-3"
    >
      {legendItems.map(({ key, dotClass }) => (
        <div key={key} className="flex items-center gap-1.5">
          <div className={`w-3 h-3 rounded-full ${dotClass}`} />
          <span className="text-xs text-[var(--slate-400)]">{t(key)}</span>
        </div>
      ))}
    </div>
  );
}
