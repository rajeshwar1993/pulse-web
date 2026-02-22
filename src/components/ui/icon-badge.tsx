import type React from "react";

type IconBadgeSize = "xs" | "sm" | "md" | "lg";
type IconBadgeColor = "teal" | "rose" | "green" | "slate";

const sizeStyles: Record<IconBadgeSize, string> = {
  xs: "w-6 h-6",
  sm: "w-10 h-10",
  md: "w-16 h-16",
  lg: "w-24 h-24",
};

const colorStyles: Record<IconBadgeColor, string> = {
  teal: "bg-[var(--teal)]/10",
  rose: "bg-[var(--rose-100)]",
  green: "bg-[var(--green)]/10",
  slate: "bg-[var(--slate-200)]",
};

interface IconBadgeProps {
  size?: IconBadgeSize;
  color?: IconBadgeColor;
  children: React.ReactNode;
  className?: string;
}

export function IconBadge({
  size = "md",
  color = "teal",
  className = "",
  children,
}: IconBadgeProps) {
  return (
    <div
      className={`rounded-full flex items-center justify-center ${sizeStyles[size]} ${colorStyles[color]} ${className}`}
    >
      {children}
    </div>
  );
}
