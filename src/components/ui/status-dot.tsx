type StatusDotVariant = "active" | "inactive";

const variantStyles: Record<StatusDotVariant, string> = {
  active: "bg-[var(--green)]",
  inactive: "bg-[var(--slate-300)]",
};

/** Props for the {@link StatusDot} component. */
interface StatusDotProps {
  /** Visual state of the dot. */
  status: StatusDotVariant;
  /** When true, adds a pulsing animation ring around an active dot. @default false */
  ping?: boolean;
  /** Additional CSS classes to apply. */
  className?: string;
}

/** Colored dot indicating active or inactive status, with an optional ping animation. */
export function StatusDot({
  status,
  ping = false,
  className = "",
}: StatusDotProps) {
  return (
    <span className={`relative inline-flex ${className}`}>
      {ping && status === "active" && (
        <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--green)]/20 animate-ping" />
      )}
      <span
        className={`relative inline-flex w-10 h-10 rounded-full items-center justify-center ${variantStyles[status]}`}
      />
    </span>
  );
}
