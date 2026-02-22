"use client";

import { useEffect } from "react";

export type ToastVariant = "success" | "error" | "info";

/** Props for the {@link Toast} component. */
interface ToastProps {
  /** Text content displayed inside the toast. */
  message: string;
  /** Color scheme indicating the type of notification. */
  variant: ToastVariant;
  /** Callback fired when the toast auto-dismisses or is manually closed. */
  onDismiss: () => void;
  /** Time in milliseconds before the toast auto-dismisses. @default 3000 */
  duration?: number;
}

const variantStyles: Record<ToastVariant, string> = {
  success: "bg-[var(--success)] text-white",
  error: "bg-[var(--error)] text-white",
  info: "bg-[var(--slate-800)] text-white",
};

/** Fixed-position notification banner that auto-dismisses after a configurable duration. */
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
