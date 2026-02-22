"use client";

import { Card } from "@/components/ui/card";

interface GhostCalendarProps {
  pulsedDates: string[];
}

const TOTAL_DAYS = 30;
const COLUMNS = 7;

function generateCalendarDates(totalDays: number): string[] {
  const dates: string[] = [];
  const today = new Date();

  for (let i = totalDays - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    // Format as YYYY-MM-DD to match RPC output
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    dates.push(`${year}-${month}-${day}`);
  }

  return dates;
}

export function GhostCalendar({ pulsedDates }: GhostCalendarProps) {
  const calendarDates = generateCalendarDates(TOTAL_DAYS);
  const pulsedSet = new Set(pulsedDates);

  // Pad the start so the grid fills complete rows (today at bottom-right)
  const paddingCount = (COLUMNS - (TOTAL_DAYS % COLUMNS)) % COLUMNS;

  return (
    <Card padding="md">
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${COLUMNS}, 1fr)` }}
      >
        {/* Empty padding cells (static, never reorder) */}
        {Array.from({ length: paddingCount }, (_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static padding cells never reorder
          <div key={`pad-${i}`} />
        ))}

        {/* Calendar dots */}
        {calendarDates.map((date) => {
          const isPulsed = pulsedSet.has(date);
          const isToday = date === calendarDates[calendarDates.length - 1];

          return (
            <div key={date} className="flex items-center justify-center">
              <div
                className={`
                  w-6 h-6 rounded-full transition-colors
                  ${
                    isPulsed
                      ? "bg-teal-300"
                      : isToday
                        ? "border-2 border-[var(--slate-300)]"
                        : "border-2 border-[var(--slate-200)]"
                  }
                `}
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
