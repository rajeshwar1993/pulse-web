"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Modal } from "@/components/ui/modal";
import { SeatService } from "@/lib/services/seat-service";
import type { DashboardSeat } from "@/lib/types/seat";

interface CancelInviteModalProps {
  seat: DashboardSeat;
  onClose: () => void;
  onCancelled: () => void;
}

export function CancelInviteModal({
  seat,
  onClose,
  onCancelled,
}: CancelInviteModalProps) {
  const t = useTranslations("seats");
  const tCommon = useTranslations("common");
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    setLoading(true);
    try {
      await SeatService.cancelSeatInvite(seat.id);
      onCancelled();
    } catch {
      // Error is handled by caller via refresh
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={true} onClose={onClose} maxWidth="sm">
      <Heading as="h2" size="md" className="mb-3">
        {t("cancelTitle")}
      </Heading>
      <p className="text-sm text-[var(--slate-600)] mb-6">
        {t("cancelDescription")}
      </p>
      <div className="flex gap-3">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={onClose}
        >
          {tCommon("cancel")}
        </Button>
        <Button
          variant="danger"
          size="sm"
          className="flex-1"
          onClick={handleCancel}
          loading={loading}
        >
          {t("cancelInviteButton")}
        </Button>
      </div>
    </Modal>
  );
}
