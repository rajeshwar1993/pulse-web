"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { InviteModal } from "@/components/connections/invite-modal";
import { useToast } from "@/components/providers/toast-provider";
import { CancelInviteModal } from "@/components/seats/cancel-invite-modal";
import { RenewSeatModal } from "@/components/seats/renew-seat-modal";
import { SeatGrid } from "@/components/seats/seat-grid";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { ConnectionService } from "@/lib/services/connection-service";
import { SeatService } from "@/lib/services/seat-service";
import type { DashboardSeat } from "@/lib/types/seat";
import { logger } from "@/lib/utils/logger";

export default function ConnectionsPage() {
  const t = useTranslations("connections");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { showToast } = useToast();
  const [seats, setSeats] = useState<DashboardSeat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [inviteSeat, setInviteSeat] = useState<DashboardSeat | null>(null);
  const [cancelSeat, setCancelSeat] = useState<DashboardSeat | null>(null);
  const [renewSeat, setRenewSeat] = useState<DashboardSeat | null>(null);
  const [removeSeat, setRemoveSeat] = useState<DashboardSeat | null>(null);

  const loadSeats = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await SeatService.getSeats();
      setSeats(data);
    } catch (error) {
      logger.error("Failed to load seats", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: loadSeats is stable and only needed on mount
  useEffect(() => {
    loadSeats();
  }, []);

  const handleRemoveConnection = async () => {
    if (!removeSeat?.connection) return;
    try {
      await ConnectionService.removeConnection(removeSeat.connection.id);
      setRemoveSeat(null);
      await loadSeats();
    } catch (error) {
      logger.error("Failed to remove connection", error);
      showToast(t("removeError"), "error");
    }
  };

  const hasEmptySeat = seats.some((s) => s.state === "empty");
  const occupiedCount = seats.filter((s) => s.state === "occupied").length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-offWhite flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offWhite p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Heading as="h1" size="lg" className="text-teal-300 mb-2">
              {t("title")}
            </Heading>
            <p className="text-slate-600">
              {t("connectionCount", { count: occupiedCount })}
            </p>
          </div>
          <Button
            onClick={() => {
              const emptySeat = seats.find((s) => s.state === "empty");
              if (emptySeat) setInviteSeat(emptySeat);
            }}
            disabled={!hasEmptySeat}
          >
            {t("addConnection")}
          </Button>
        </div>

        {/* Seat Grid */}
        <SeatGrid
          seats={seats}
          onEmptyClick={(seat) => setInviteSeat(seat)}
          onPendingClick={(seat) => setCancelSeat(seat)}
          onOccupiedClick={(seat) => setRemoveSeat(seat)}
          onExpiredClick={(seat) => setRenewSeat(seat)}
        />

        {/* Invite Modal */}
        {inviteSeat && (
          <InviteModal
            seatId={inviteSeat.id}
            onClose={() => {
              setInviteSeat(null);
              loadSeats();
            }}
          />
        )}

        {/* Cancel Invite Modal */}
        {cancelSeat && (
          <CancelInviteModal
            seat={cancelSeat}
            onClose={() => setCancelSeat(null)}
            onCancelled={() => {
              setCancelSeat(null);
              loadSeats();
            }}
          />
        )}

        {/* Renew Seat Modal */}
        {renewSeat && (
          <RenewSeatModal
            seat={renewSeat}
            onClose={() => setRenewSeat(null)}
            onRenewed={() => {
              setRenewSeat(null);
              loadSeats();
            }}
          />
        )}

        {/* Remove Connection Confirmation */}
        <Modal
          open={!!removeSeat}
          onClose={() => setRemoveSeat(null)}
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
              onClick={() => setRemoveSeat(null)}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              variant="danger"
              size="sm"
              className="flex-1"
              onClick={handleRemoveConnection}
            >
              {t("removeConnection")}
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
