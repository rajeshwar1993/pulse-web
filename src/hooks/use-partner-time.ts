"use client";

import { useEffect, useState } from "react";
import { formatTimeInTimezone } from "@/lib/utils/timezone";

/**
 * Hook that returns a live-updating formatted time string for a partner's timezone.
 * Updates every 60 seconds to keep the displayed time current.
 */
export function usePartnerTime(timezone: string, locale: string): string {
  const [time, setTime] = useState(() =>
    formatTimeInTimezone(timezone, locale),
  );

  useEffect(() => {
    setTime(formatTimeInTimezone(timezone, locale));

    const interval = setInterval(() => {
      setTime(formatTimeInTimezone(timezone, locale));
    }, 60_000);

    return () => clearInterval(interval);
  }, [timezone, locale]);

  return time;
}
