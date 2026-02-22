import type React from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--teal)] text-white hover:bg-[var(--teal-400)] transition-colors",
  secondary:
    "border border-[var(--slate-300)] text-[var(--slate-700)] hover:border-[var(--slate-400)] transition-colors",
  danger: "bg-[var(--error)] text-white hover:opacity-90 transition-opacity",
  ghost:
    "text-[var(--slate-600)] hover:bg-[var(--slate-100)] transition-colors",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm rounded-lg",
  md: "px-6 py-3 rounded-lg",
  lg: "w-full py-4 rounded-lg",
};

/**
 * Returns the combined className string for a button variant + size.
 * Use this to style non-button elements (e.g. Next.js Link) as buttons.
 */
export function buttonVariants({
  variant = "primary",
  size = "md",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
} = {}): string {
  return `inline-flex items-center justify-center font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]}`;
}

/** Props for the {@link Button} component. */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant of the button. @default "primary" */
  variant?: ButtonVariant;
  /** Size preset controlling padding and font size. @default "md" */
  size?: ButtonSize;
  /** When true, shows a spinner and disables the button. @default false */
  loading?: boolean;
}

/** Interactive button with variant styles, size presets, and a loading state. */
export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`${buttonVariants({ variant, size })} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="animate-spin h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
