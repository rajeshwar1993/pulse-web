interface SkeletonProps {
  className?: string;
  rounded?: "sm" | "md" | "full";
}

const roundedStyles = {
  sm: "rounded",
  md: "rounded-lg",
  full: "rounded-full",
};

export function Skeleton({ className = "", rounded = "md" }: SkeletonProps) {
  return (
    <div
      className={`bg-[var(--slate-200)] animate-pulse ${roundedStyles[rounded]} ${className}`}
    />
  );
}
