import type React from "react";

type HeadingLevel = "h1" | "h2" | "h3";
type HeadingSize = "xl" | "lg" | "md" | "sm";

const sizeStyles: Record<HeadingSize, string> = {
  xl: "text-5xl font-bold",
  lg: "text-3xl font-bold",
  md: "text-2xl font-bold",
  sm: "text-lg font-semibold",
};

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: HeadingLevel;
  size?: HeadingSize;
}

export function Heading({
  as: Tag = "h2",
  size = "md",
  className = "",
  children,
  ...props
}: HeadingProps) {
  return (
    <Tag
      className={`${sizeStyles[size]} text-[var(--slate-900)] ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
