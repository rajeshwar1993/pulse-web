type SpinnerSize = "sm" | "md" | "lg";

const sizeStyles: Record<SpinnerSize, string> = {
  sm: "h-5 w-5 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-2",
};

/** Props for the {@link Spinner} component. */
interface SpinnerProps {
  /** Diameter of the spinner. @default "md" */
  size?: SpinnerSize;
  /** Additional CSS classes to apply. */
  className?: string;
}

/** Animated circular spinner used as a loading indicator. */
export function Spinner({ size = "md", className = "" }: SpinnerProps) {
  return (
    <output
      className={`block animate-spin rounded-full border-b-[var(--teal)] border-[var(--slate-200)] ${sizeStyles[size]} ${className}`}
      aria-label="Loading"
    />
  );
}
