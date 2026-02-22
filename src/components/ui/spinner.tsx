type SpinnerSize = "sm" | "md" | "lg";

const sizeStyles: Record<SpinnerSize, string> = {
  sm: "h-5 w-5 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-2",
};

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

export function Spinner({ size = "md", className = "" }: SpinnerProps) {
  return (
    <output
      className={`block animate-spin rounded-full border-b-[var(--teal)] border-[var(--slate-200)] ${sizeStyles[size]} ${className}`}
      aria-label="Loading"
    />
  );
}
