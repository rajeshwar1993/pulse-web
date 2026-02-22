"use client";

import type React from "react";
import { useEffect, useRef } from "react";

type ModalMaxWidth = "sm" | "md";
type ModalPadding = "md" | "lg";

const maxWidthStyles: Record<ModalMaxWidth, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
};

const paddingStyles: Record<ModalPadding, string> = {
  md: "p-6",
  lg: "p-8",
};

/** Props for the {@link Modal} component. */
interface ModalProps {
  /** Whether the modal is currently visible. */
  open: boolean;
  /** Callback fired when the backdrop is clicked or Escape is pressed. */
  onClose: () => void;
  /** Maximum width constraint of the modal panel. @default "md" */
  maxWidth?: ModalMaxWidth;
  /** Inner padding of the modal panel. @default "md" */
  padding?: ModalPadding;
  /** ID of the element that labels the modal for accessibility. */
  ariaLabelledBy?: string;
  /** Content rendered inside the modal panel. */
  children: React.ReactNode;
}

/** Centered dialog overlay that closes on backdrop click or Escape key. */
export function Modal({
  open,
  onClose,
  maxWidth = "md",
  padding = "md",
  ariaLabelledBy,
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Escape key handler
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: backdrop overlay with click-to-close
    // biome-ignore lint/a11y/useKeyWithClickEvents: Escape key handled via useEffect
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        className={`bg-white rounded-2xl ${paddingStyles[padding]} ${maxWidthStyles[maxWidth]} w-full`}
      >
        {children}
      </div>
    </div>
  );
}
