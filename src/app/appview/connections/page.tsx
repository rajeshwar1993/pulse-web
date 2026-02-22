"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { ConnectionGrid } from "@/components/connections/connection-grid";
import { InviteModal } from "@/components/connections/invite-modal";
import { useToast } from "@/components/providers/toast-provider";
import { EmptyConnectionsView } from "@/components/shared/empty-connections-view";
import { ConnectionService } from "@/lib/services/connection-service";
import type { ConnectionWithProfile } from "@/lib/types/connection";
import { logger } from "@/lib/utils/logger";

export default function ConnectionsPage() {
  const t = useTranslations("connections");
  const tCommon = useTranslations("common");
  const [connections, setConnections] = useState<ConnectionWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const { showToast } = useToast();
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: loadConnections is stable and only needed on mount
  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    setIsLoading(true);
    try {
      const data = await ConnectionService.getActiveConnections();
      setConnections(data);
    } catch (error) {
      logger.error("Failed to load connections", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveConnection = (connectionId: string) => {
    setConfirmRemoveId(connectionId);
  };

  const confirmRemove = async () => {
    if (!confirmRemoveId) return;
    try {
      await ConnectionService.removeConnection(confirmRemoveId);
      await loadConnections();
    } catch (error) {
      logger.error("Failed to remove connection", error);
      showToast(t("removeError"), "error");
    } finally {
      setConfirmRemoveId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-offWhite flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-300"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offWhite p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-teal-300 mb-2">
              {t("title")}
            </h1>
            <p className="text-slate-600">
              {t("connectionCount", { count: connections.length })}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowInviteModal(true)}
            className="bg-teal-300 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-400 transition-colors"
          >
            {t("addConnection")}
          </button>
        </div>

        {/* Content */}
        {connections.length === 0 ? (
          <EmptyConnectionsView
            onAddConnection={() => setShowInviteModal(true)}
          />
        ) : (
          <ConnectionGrid
            connections={connections}
            onRemoveConnection={handleRemoveConnection}
          />
        )}

        {/* Remove Confirmation */}
        {confirmRemoveId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
              <p className="text-[var(--slate-900)] font-medium mb-4">
                {t("removeConfirm")}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmRemoveId(null)}
                  className="flex-1 px-4 py-2 rounded-lg border border-[var(--slate-300)] text-[var(--slate-700)] font-medium"
                >
                  {tCommon("cancel")}
                </button>
                <button
                  type="button"
                  onClick={confirmRemove}
                  className="flex-1 px-4 py-2 rounded-lg bg-[var(--error)] text-white font-medium"
                >
                  {t("removeConnection")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Invite Modal */}
        {showInviteModal && (
          <InviteModal onClose={() => setShowInviteModal(false)} />
        )}
      </div>
    </div>
  );
}
