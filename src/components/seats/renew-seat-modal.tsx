"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Modal } from "@/components/ui/modal";
import { SeatService } from "@/lib/services/seat-service";
import type { DashboardSeat } from "@/lib/types/seat";

interface RenewSeatModalProps {
  seat: DashboardSeat;
  onClose: () => void;
  onRenewed: () => void;
}

export function RenewSeatModal({
  seat,
  onClose,
  onRenewed,
}: RenewSeatModalProps) {
  const t = useTranslations("seats");
  const tCommon = useTranslations("common");
  const [loading, setLoading] = useState(false);

  const handleRenew = async () => {
    setLoading(true);
    try {
      await SeatService.renewSeat(seat.id);
      onRenewed();
    } catch {
      // Error is handled by caller via refresh
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={true} onClose={onClose} maxWidth="sm">
      <Heading as="h2" size="md" className="mb-3">
        {t("renewTitle")}
      </Heading>
      <p className="text-sm text-[var(--slate-600)] mb-6">
        {seat.connection
          ? t("renewDescriptionWithConnection", { name: seat.connection.name })
          : t("renewDescription")}
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
          size="sm"
          className="flex-1"
          onClick={handleRenew}
          loading={loading}
        >
          {t("renewButton")}
        </Button>
      </div>
    </Modal>
  );
}
