"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { ConnectionGrid } from "@/components/connections/connection-grid";
import { InviteModal } from "@/components/connections/invite-modal";
import { useToast } from "@/components/providers/toast-provider";
import { EmptyConnectionsView } from "@/components/shared/empty-connections-view";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { ConnectionService } from "@/lib/services/connection-service";
import type { ConnectionWithProfile } from "@/lib/types/connection";
import { logger } from "@/lib/utils/logger";

export default function BrowserConnectionsPage() {
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
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <Heading as="h1" size="lg" className="text-teal-300 mb-2">
            {t("title")}
          </Heading>
          <p className="text-slate-600">
            {t("connectionCount", { count: connections.length })}
          </p>
        </div>
        <Button onClick={() => setShowInviteModal(true)}>
          {t("addConnection")}
        </Button>
      </div>

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

      <Modal
        open={!!confirmRemoveId}
        onClose={() => setConfirmRemoveId(null)}
        maxWidth="sm"
      >
        <p className="text-[var(--slate-900)] font-medium mb-4">
          {t("removeConfirm")}
        </p>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={() => setConfirmRemoveId(null)}
          >
            {tCommon("cancel")}
          </Button>
          <Button
            variant="danger"
            size="sm"
            className="flex-1"
            onClick={confirmRemove}
          >
            {t("removeConnection")}
          </Button>
        </div>
      </Modal>

      {showInviteModal && (
        <InviteModal onClose={() => setShowInviteModal(false)} />
      )}
    </div>
  );
}
