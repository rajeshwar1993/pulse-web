"use client";

import { useTranslations } from "next-intl";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/providers/toast-provider";
import { INVITE_DEEP_LINK_PREFIX } from "@/lib/constants";
import { ConnectionService } from "@/lib/services/connection-service";
import type { InviteCode } from "@/lib/types/connection";
import { logger } from "@/lib/utils/logger";

interface InviteModalProps {
  onClose: () => void;
}

export function InviteModal({ onClose }: InviteModalProps) {
  const t = useTranslations("connections.invite");
  const [inviteCode, setInviteCode] = useState<InviteCode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();
  const modalRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: generateCode is stable and only needed on mount
  useEffect(() => {
    generateCode();
  }, []);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: focus trap re-binds when loading state changes
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements =
      modal.querySelectorAll<HTMLElement>(focusableSelector);
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

    modal.addEventListener("keydown", handleTab);
    return () => modal.removeEventListener("keydown", handleTab);
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
    // biome-ignore lint/a11y/noStaticElementInteractions: backdrop overlay with click-to-close
    // biome-ignore lint/a11y/useKeyWithClickEvents: Escape key handled via separate useEffect
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-modal-title"
        className="bg-white rounded-2xl p-8 max-w-md w-full"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2
            id="invite-modal-title"
            className="text-2xl font-bold text-slate-900"
          >
            {t("title")}
          </h2>
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-300"></div>
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
            <button
              type="button"
              onClick={shareInvite}
              className="w-full bg-teal-300 text-white py-4 rounded-lg font-semibold hover:bg-teal-400 transition-colors"
            >
              {t("shareButton")}
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
