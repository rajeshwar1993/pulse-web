import type React from "react";
import { Card } from "./card";

/** Props for the {@link EmptyState} component. */
interface EmptyStateProps {
  /** Optional icon displayed above the title. */
  icon?: React.ReactNode;
  /** Primary heading text. */
  title: string;
  /** Descriptive body text shown below the title. */
  message: string;
  /** Optional call-to-action element (e.g. a button) rendered below the message. */
  action?: React.ReactNode;
  /** Additional CSS classes to apply to the outer card. */
  className?: string;
}

/** Centered card for empty or zero-data states with icon, message, and optional action. */
export function EmptyState({
  icon,
  title,
  message,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <Card padding="lg" className={className}>
      <div className="text-center max-w-md mx-auto">
        {icon && <div className="mb-6 flex justify-center">{icon}</div>}
        <h3 className="text-xl font-semibold text-[var(--slate-900)] mb-2">
          {title}
        </h3>
        <p className="text-[var(--slate-600)] mb-6">{message}</p>
        {action && <div>{action}</div>}
      </div>
    </Card>
  );
}
