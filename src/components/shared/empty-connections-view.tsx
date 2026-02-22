"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { IconBadge } from "@/components/ui/icon-badge";

interface EmptyConnectionsViewProps {
  /** When provided, renders an active "Add Connection" button. When omitted, renders a disabled placeholder. */
  onAddConnection?: () => void;
}

/**
 * Shared EmptyConnectionsView Component
 *
 * Used by both dashboard and connections pages.
 * - Dashboard: no onAddConnection → disabled "coming soon" button
 * - Connections: onAddConnection provided → active invite button
 */
export function EmptyConnectionsView({
  onAddConnection,
}: EmptyConnectionsViewProps) {
  const t = useTranslations("emptyConnections");

  const icon = (
    <IconBadge color="teal" size="lg">
      <svg
        className="w-12 h-12 text-[var(--teal)]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    </IconBadge>
  );

  const action = onAddConnection ? (
    <Button onClick={onAddConnection} className="gap-2">
      <svg
        className="w-5 h-5"
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
      {t("addButton")}
    </Button>
  ) : (
    <>
      <Button disabled className="gap-2" title={t("comingSoonNote")}>
        <svg
          className="w-5 h-5"
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
        {t("addButton")}
      </Button>
      <p className="text-[var(--slate-400)] text-xs mt-3">
        {t("comingSoonNote")}
      </p>
    </>
  );

  return (
    <EmptyState
      icon={icon}
      title={t("title")}
      message={t("message")}
      action={action}
    />
  );
}
