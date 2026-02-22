import Image from "next/image";

type AvatarSize = "sm" | "md" | "lg";
type AvatarStatus = "active" | "inactive" | "none";

const sizeStyles: Record<
  AvatarSize,
  { container: string; image: number; dot: string }
> = {
  sm: { container: "w-10 h-10", image: 40, dot: "w-3 h-3" },
  md: { container: "w-12 h-12", image: 48, dot: "w-4 h-4" },
  lg: { container: "w-16 h-16", image: 64, dot: "w-4 h-4" },
};

const ringStyles: Record<AvatarStatus, string> = {
  active: "ring-2 ring-[var(--teal)]",
  inactive: "ring-2 ring-[var(--slate-300)] grayscale-[30%]",
  none: "",
};

const dotStyles: Record<Exclude<AvatarStatus, "none">, string> = {
  active: "bg-[var(--green)]",
  inactive: "bg-[var(--slate-400)]",
};

/** Props for the {@link Avatar} component. */
interface AvatarProps {
  /** URL of the avatar image. */
  src: string;
  /** Accessible alt text for the image. */
  alt: string;
  /** Rendered dimensions of the avatar. @default "md" */
  size?: AvatarSize;
  /** Activity status; shows a colored ring and status dot when not "none". @default "none" */
  status?: AvatarStatus;
  /** Additional CSS classes to apply. */
  className?: string;
}

/** Circular user avatar with optional activity status ring and dot indicator. */
export function Avatar({
  src,
  alt,
  size = "md",
  status = "none",
  className = "",
}: AvatarProps) {
  const s = sizeStyles[size];

  return (
    <div className={`relative flex-shrink-0 ${s.container} ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={s.image}
        height={s.image}
        className={`${s.container} rounded-full object-cover ${ringStyles[status]}`}
      />
      {status !== "none" && (
        <div
          className={`absolute -bottom-0.5 -right-0.5 ${s.dot} rounded-full border-2 border-white ${dotStyles[status]}`}
        />
      )}
    </div>
  );
}
