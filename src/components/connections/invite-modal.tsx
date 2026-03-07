"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Modal } from "@/components/ui/modal";
import { getInviteUrl } from "@/lib/constants";
import { ConnectionRequestService } from "@/lib/services/connection-request-service";
import { ConnectionService } from "@/lib/services/connection-service";
import { SeatService } from "@/lib/services/seat-service";
import type { InviteCode } from "@/lib/types/connection";
import { logger } from "@/lib/utils/logger";

/** Map known RPC error messages to user-facing translation keys. */
function mapRpcError(msg: string, t: (key: string) => string): string {
  if (msg.includes("Already connected")) return t("alreadyConnected");
  if (msg.includes("request to yourself")) return t("selfEmailError");
  if (msg.includes("pending connection request")) return t("alreadyPending");
  if (msg.includes("Seat not available")) return t("seatUnavailable");
  return t("sendError");
}

interface InviteModalProps {
  onClose: () => void;
  /** When provided, routes invite operations through the seat system */
  seatId?: string;
}

/**
 * InviteModal Component
 *
 * Two-section layout:
 * 1. Send via Email — targeted connection request
 * 2. Share using other apps — generates invite code + native share sheet
 */
export function InviteModal({ onClose, seatId }: InviteModalProps) {
  const t = useTranslations("connections.invite");
  const { showToast } = useToast();
  const contentRef = useRef<HTMLDivElement>(null);

  // Email invite state
  const [email, setEmail] = useState("");
  const [emailSending, setEmailSending] = useState(false);

  // Share state
  const [sharing, setSharing] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: focus trap re-binds when content changes
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements =
      container.querySelectorAll<HTMLElement>(focusableSelector);
    if (focusableElements.length === 0) return;

    const firstEl = focusableElements[0];
    const lastEl = focusableElements[focusableElements.length - 1];
    firstEl.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    container.addEventListener("keydown", handleTab);
    return () => container.removeEventListener("keydown", handleTab);
  }, []);

  const isValidEmail = (value: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSendEmail = async () => {
    if (!email.trim() || !isValidEmail(email)) {
      showToast(t("invalidEmail"), "error");
      return;
    }

    setEmailSending(true);
    try {
      if (seatId) {
        await SeatService.sendRequestForSeat(seatId, email.trim());
      } else {
        await ConnectionRequestService.sendRequest(email.trim());
      }
      // Always show success toast regardless of whether user was found (privacy)
      showToast(t("inviteSent"), "success");
      setEmail("");
    } catch (error: unknown) {
      const raw =
        error instanceof Error
          ? error.message
          : typeof error === "object" && error !== null && "message" in error
            ? String((error as { message: unknown }).message)
            : "";
      const message = mapRpcError(raw, t);
      showToast(message, "error");
      logger.error("Failed to send connection request", error);
    } finally {
      setEmailSending(false);
    }
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      const inviteCode: InviteCode = seatId
        ? await SeatService.generateInviteForSeat(seatId)
        : await ConnectionService.generateInviteCode();
      const inviteUrl = getInviteUrl(inviteCode.code);
      const shareText = t("shareText", {
        code: inviteCode.code,
        url: inviteUrl,
      });

      if (navigator.share) {
        try {
          await navigator.share({
            title: t("shareTitle"),
            text: shareText,
          });
        } catch {
          // User cancelled share — not an error
        }
      } else {
        // Fallback: copy to clipboard
        try {
          await navigator.clipboard.writeText(inviteUrl);
          showToast(t("linkCopied"), "success");
        } catch {
          logger.warn("Clipboard write failed");
        }
      }
    } catch (error) {
      logger.error("Failed to generate invite code for share", error);
      showToast(t("generateError"), "error");
    } finally {
      setSharing(false);
    }
  };

  return (
    <Modal
      open={true}
      onClose={onClose}
      padding="lg"
      ariaLabelledBy="invite-modal-title"
    >
      <div ref={contentRef}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Heading as="h2" size="md" id="invite-modal-title">
            {t("title")}
          </Heading>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
            aria-label={t("close")}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Section 1: Send via Email */}
        <div className="mb-6">
          <label
            htmlFor="invite-email-input"
            className="block text-sm font-medium text-[var(--dark-gray)] mb-2"
          >
            {t("emailLabel")}
          </label>
          <div className="flex gap-2">
            <input
              id="invite-email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("emailPlaceholder")}
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--pulse-purple)] focus:border-transparent"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendEmail();
              }}
            />
            <Button onClick={handleSendEmail} loading={emailSending} size="md">
              {t("sendRequest")}
            </Button>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-sm text-slate-400">or</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Section 2: Share using other apps */}
        <div>
          <Button
            onClick={handleShare}
            loading={sharing}
            variant="secondary"
            size="lg"
          >
            {t("shareButton")}
          </Button>
          <p className="text-sm text-slate-500 text-center mt-2">
            {t("shareSubtext")}
          </p>
        </div>
      </div>
    </Modal>
  );
}
