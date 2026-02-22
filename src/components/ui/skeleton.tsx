/** Props for the {@link Skeleton} component. */
interface SkeletonProps {
  /** CSS classes to control width, height, and other styles. */
  className?: string;
  /** Border-radius preset. @default "md" */
  rounded?: "sm" | "md" | "full";
}

const roundedStyles = {
  sm: "rounded",
  md: "rounded-lg",
  full: "rounded-full",
};

/** Pulsing placeholder block used as a content loading indicator. */
export function Skeleton({ className = "", rounded = "md" }: SkeletonProps) {
  return (
    <div
      className={`bg-[var(--slate-200)] animate-pulse ${roundedStyles[rounded]} ${className}`}
    />
  );
}
