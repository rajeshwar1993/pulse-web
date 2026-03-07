"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Modal } from "@/components/ui/modal";
import { getInviteUrl } from "@/lib/constants";
import { SeatService } from "@/lib/services/seat-service";
import type { DashboardSeat } from "@/lib/types/seat";
import { logger } from "@/lib/utils/logger";

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
  const tInvite = useTranslations("connections.invite");
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const { showToast } = useToast();

  const isInviteCode = seat.pendingInfo?.type === "invite_code";

  const handleShare = async () => {
    if (!seat.pendingInfo?.label) return;
    setSharing(true);
    try {
      const code = seat.pendingInfo.label;
      const inviteUrl = getInviteUrl(code);
      const shareText = tInvite("shareText", {
        code,
        url: inviteUrl,
      });

      if (navigator.share) {
        try {
          await navigator.share({
            title: tInvite("shareTitle"),
            text: shareText,
          });
        } catch {
          // User cancelled share — not an error
        }
      } else {
        try {
          await navigator.clipboard.writeText(inviteUrl);
          showToast(tInvite("linkCopied"), "success");
        } catch {
          logger.warn("Clipboard write failed");
        }
      }
    } catch (error) {
      logger.error("Failed to share invite", error);
    } finally {
      setSharing(false);
    }
  };

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
      <div className="flex flex-col gap-3">
        {isInviteCode && (
          <Button
            variant="primary"
            size="sm"
            className="w-full"
            onClick={handleShare}
            loading={sharing}
          >
            {t("shareInvite")}
          </Button>
        )}
        <Button
          variant="danger"
          size="sm"
          className="w-full"
          onClick={handleCancel}
          loading={loading}
        >
          {t("cancelInviteButton")}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          onClick={onClose}
        >
          {t("close")}
        </Button>
      </div>
    </Modal>
  );
}
