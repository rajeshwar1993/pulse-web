import type React from "react";

type CardPadding = "sm" | "md" | "lg";

const paddingStyles: Record<CardPadding, string> = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

/** Props for the {@link Card} component. */
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Inner padding preset. @default "md" */
  padding?: CardPadding;
  /** When true, elevates the shadow on hover. @default false */
  hover?: boolean;
}

/** Rounded container with a border, shadow, and configurable padding. */
export function Card({
  padding = "md",
  hover = false,
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl shadow-md border border-[var(--slate-200)] ${paddingStyles[padding]} ${hover ? "hover:shadow-lg transition-shadow" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
