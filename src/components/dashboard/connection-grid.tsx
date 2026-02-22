"use client";

import { useTranslations } from "next-intl";
import type { DashboardConnection } from "@/lib/types/connection";
import { ConnectionCard } from "./connection-card";

export type { DashboardConnection as Connection } from "@/lib/types/connection";

interface ConnectionGridProps {
  /**
   * Array of connections to display
   */
  connections: DashboardConnection[];
}

/**
 * ConnectionGrid Component
 *
 * Displays a responsive grid of connection cards.
 * Layout:
 * - Mobile: 1 column
 * - Tablet: 2 columns
 * - Desktop: 2-3 columns
 */
export function ConnectionGrid({ connections }: ConnectionGridProps) {
  const t = useTranslations("dashboard.connectionGrid");

  if (connections.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-[var(--slate-900)]">
        {t("title", { count: connections.length })}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {connections.map((connection) => (
          <ConnectionCard
            key={connection.id}
            avatar={connection.avatar}
            name={connection.name}
            status={connection.status}
            pulseTime={connection.pulseTime}
          />
        ))}
      </div>
    </div>
  );
}
