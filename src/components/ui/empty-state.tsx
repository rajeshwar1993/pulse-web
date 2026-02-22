import type React from "react";
import { Card } from "./card";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message: string;
  action?: React.ReactNode;
  className?: string;
}

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
