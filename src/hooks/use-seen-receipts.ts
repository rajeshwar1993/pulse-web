"use client";

import { useEffect, useRef } from "react";
import type { DashboardConnection } from "@/lib/types/connection";
import { recordSeenReceipts } from "@/lib/services/seen-receipt-service";
import { getTodayPulseDay } from "@/lib/utils/streak";

/**
 * Records seen receipts for active connections on dashboard mount.
 * Fires once per render lifecycle (ref guard prevents Strict Mode double-fire).
 */
export function useSeenReceipts(connections: DashboardConnection[]): void {
  const hasFired = useRef(false);

  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;

    const activeUserIds = connections
      .filter((c) => c.status === "active")
      .map((c) => c.userId);

    if (activeUserIds.length === 0) return;

    const pulseDate = getTodayPulseDay();
    recordSeenReceipts(activeUserIds, pulseDate);
  }, [connections]);
}
