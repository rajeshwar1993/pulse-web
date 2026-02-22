"use client";

import { useTranslations } from "next-intl";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { INVITE_DEEP_LINK_PREFIX } from "@/lib/constants";
import { ConnectionService } from "@/lib/services/connection-service";
import type { InviteCode } from "@/lib/types/connection";
import { logger } from "@/lib/utils/logger";

/**
 * Props for the InviteModal component.
 */
interface InviteModalProps {
  /** Callback invoked when the modal is closed. */
  onClose: () => void;
}

/**
 * InviteModal Component
 *
 * Generates a single-use invite code and presents it in a modal with:
 * - QR code for scanning
 * - Copyable code field
 * - Native share integration (falls back to clipboard copy)
 */
export function InviteModal({ onClose }: InviteModalProps) {
  const t = useTranslations("connections.invite");
  const [inviteCode, setInviteCode] = useState<InviteCode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();
  const contentRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: generateCode is stable and only needed on mount
  useEffect(() => {
    generateCode();
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: focus trap re-binds when loading state changes
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
  }, [isLoading]);

  const generateCode = async () => {
    setIsLoading(true);
    try {
      const code = await ConnectionService.generateInviteCode();
      setInviteCode(code);
    } catch (error) {
      logger.error("Failed to generate invite code", error);
      showToast(t("generateError"), "error");
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!inviteCode) return;

    const inviteUrl = `${INVITE_DEEP_LINK_PREFIX}${inviteCode.code}`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      logger.warn("Clipboard write failed", error);
    }
  };

  const shareInvite = async () => {
    if (!inviteCode) return;

    const inviteUrl = `${INVITE_DEEP_LINK_PREFIX}${inviteCode.code}`;
    const shareText = t("shareText", { code: inviteCode.code, url: inviteUrl });

    if (navigator.share) {
      try {
        await navigator.share({
          title: t("shareTitle"),
          text: shareText,
        });
      } catch (error) {
        // User cancelled or error occurred
        logger.debug("Share cancelled or failed", { error });
      }
    } else {
      // Fallback to copy
      await copyToClipboard();
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

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : inviteCode ? (
          <>
            {/* QR Code */}
            <div className="bg-slate-50 rounded-lg p-8 mb-6 flex justify-center">
              <QRCodeSVG
                value={`${INVITE_DEEP_LINK_PREFIX}${inviteCode.code}`}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>

            {/* Invite Code */}
            <div className="mb-6">
              <label
                htmlFor="invite-code-input"
                className="block text-sm text-slate-600 mb-2"
              >
                {t("codeLabel")}
              </label>
              <div className="flex gap-2">
                <input
                  id="invite-code-input"
                  type="text"
                  value={inviteCode.code}
                  readOnly
                  className="flex-1 px-4 py-3 bg-slate-50 rounded-lg font-mono text-lg text-center tracking-wider"
                />
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="px-4 py-3 bg-slate-200 hover:bg-slate-300 rounded-lg"
                  title="Copy code"
                >
                  {copied ? "\u2713" : "\uD83D\uDCCB"}
                </button>
              </div>
            </div>

            {/* Expiry Info */}
            <p className="text-sm text-slate-500 text-center mb-6">
              {t("expiryInfo")}
            </p>

            {/* Share Button */}
            <Button onClick={shareInvite} size="lg">
              {t("shareButton")}
            </Button>
          </>
        ) : null}
      </div>
    </Modal>
  );
}
