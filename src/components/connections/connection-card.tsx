"use client";

import { useTranslations } from "next-intl";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import type { ConnectionWithProfile } from "@/lib/types/connection";

interface ConnectionCardProps {
  connection: ConnectionWithProfile;
  onRemove: (id: string) => void;
}

export function ConnectionCard({ connection, onRemove }: ConnectionCardProps) {
  const t = useTranslations("connections");
  const statusLabel =
    connection.status === "active" ? t("activeToday") : t("waiting");

  return (
    <Card padding="sm" hover>
      {/* Avatar and Status */}
      <div className="flex items-center gap-3 mb-3">
        <Avatar
          src={connection.avatar_url}
          alt={connection.display_name}
          size="lg"
          status={connection.status === "active" ? "active" : "inactive"}
        />
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900">
            {connection.display_name}
          </h3>
          <div className="flex items-center gap-2">
            <p className="text-sm text-slate-500">{statusLabel}</p>
            {connection.current_streak > 0 && (
              <span className="text-xs font-semibold text-orange-500 flex items-center gap-0.5">
                🔥 {connection.current_streak}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <button
        type="button"
        onClick={() => onRemove(connection.id)}
        className="w-full text-sm text-red-600 hover:text-red-700 py-2"
      >
        {t("removeConnection")}
      </button>
    </Card>
  );
}
