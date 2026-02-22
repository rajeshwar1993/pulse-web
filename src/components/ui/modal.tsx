"use client";

import type React from "react";
import { useEffect, useRef } from "react";

type ModalMaxWidth = "sm" | "md";

const maxWidthStyles: Record<ModalMaxWidth, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
};

interface ModalProps {
  open: boolean;
  onClose: () => void;
  maxWidth?: ModalMaxWidth;
  children: React.ReactNode;
}

export function Modal({
  open,
  onClose,
  maxWidth = "md",
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
        className={`bg-white rounded-2xl p-6 ${maxWidthStyles[maxWidth]} w-full`}
      >
        {children}
      </div>
    </div>
  );
}
