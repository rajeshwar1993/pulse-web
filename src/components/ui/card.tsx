import type React from "react";

type CardPadding = "sm" | "md" | "lg";

const paddingStyles: Record<CardPadding, string> = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding;
  hover?: boolean;
}

export function Card({
  padding = "md",
  hover = false,
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-[var(--slate-200)] ${paddingStyles[padding]} ${hover ? "hover:shadow-md transition-shadow" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
