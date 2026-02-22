import type React from "react";

type AlertVariant = "error" | "warning" | "info";

const variantStyles: Record<
  AlertVariant,
  { container: string; icon: string; text: string }
> = {
  error: {
    container: "bg-red-50 border-red-200",
    icon: "text-red-600",
    text: "text-red-800",
  },
  warning: {
    container: "bg-yellow-50 border-yellow-200",
    icon: "text-yellow-600",
    text: "text-yellow-800",
  },
  info: {
    container: "bg-blue-50 border-blue-200",
    icon: "text-blue-600",
    text: "text-blue-800",
  },
};

/** Props for the {@link Alert} component. */
interface AlertProps {
  /** Severity level controlling colors and icon styling. @default "error" */
  variant?: AlertVariant;
  /** Alert message content. */
  children: React.ReactNode;
  /** Additional CSS classes to apply. */
  className?: string;
}

/** Inline alert banner with an icon, colored by severity variant. */
export function Alert({
  variant = "error",
  className = "",
  children,
}: AlertProps) {
  const styles = variantStyles[variant];

  return (
    <div
      role="alert"
      className={`p-4 border rounded-lg flex items-start gap-3 ${styles.container} ${className}`}
    >
      <svg
        className={`w-5 h-5 mt-0.5 flex-shrink-0 ${styles.icon}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <div className={styles.text}>{children}</div>
    </div>
  );
}
