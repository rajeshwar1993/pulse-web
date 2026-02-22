import type React from "react";

type HeadingLevel = "h1" | "h2" | "h3";
type HeadingSize = "xl" | "lg" | "md" | "base" | "sm";

const sizeStyles: Record<HeadingSize, string> = {
  xl: "text-5xl font-bold",
  lg: "text-3xl font-bold",
  md: "text-2xl font-bold",
  base: "text-xl font-semibold",
  sm: "text-lg font-semibold",
};

/** Props for the {@link Heading} component. */
interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** The HTML heading element to render. @default "h2" */
  as?: HeadingLevel;
  /** Visual text size, independent of the heading level. @default "md" */
  size?: HeadingSize;
}

/** Semantic heading with decoupled visual size and HTML element level. */
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
