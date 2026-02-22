"use client";

import { useEffect } from "react";

export type ToastVariant = "success" | "error" | "info";

interface ToastProps {
  message: string;
  variant: ToastVariant;
  onDismiss: () => void;
  duration?: number;
}

const variantStyles: Record<ToastVariant, string> = {
  success: "bg-[var(--success)] text-white",
  error: "bg-[var(--error)] text-white",
  info: "bg-[var(--slate-800)] text-white",
};

export function Toast({
  message,
  variant,
  onDismiss,
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [onDismiss, duration]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`
        fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]
        px-6 py-3 rounded-lg shadow-lg
        text-sm font-medium
        animate-[slideUp_0.3s_ease-out]
        ${variantStyles[variant]}
      `}
    >
      {message}
    </div>
  );
}
