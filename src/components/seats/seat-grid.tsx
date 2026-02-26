"use client";

import { useTranslations } from "next-intl";
import { Heading } from "@/components/ui/heading";
import type { DashboardSeat } from "@/lib/types/seat";
import { SeatCard } from "./seat-card";

interface SeatGridProps {
  seats: DashboardSeat[];
  onEmptyClick: (seat: DashboardSeat) => void;
  onPendingClick: (seat: DashboardSeat) => void;
  onOccupiedClick: (seat: DashboardSeat) => void;
  onExpiredClick: (seat: DashboardSeat) => void;
}

export function SeatGrid({
  seats,
  onEmptyClick,
  onPendingClick,
  onOccupiedClick,
  onExpiredClick,
}: SeatGridProps) {
  const t = useTranslations("seats");

  const occupiedCount = seats.filter((s) => s.state === "occupied").length;

  return (
    <div className="space-y-3">
      <Heading as="h2" size="sm">
        {t("gridTitle", { count: occupiedCount })}
      </Heading>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {seats.map((seat) => (
          <SeatCard
            key={seat.id}
            seat={seat}
            onEmptyClick={() => onEmptyClick(seat)}
            onPendingClick={() => onPendingClick(seat)}
            onOccupiedClick={() => onOccupiedClick(seat)}
            onExpiredClick={() => onExpiredClick(seat)}
          />
        ))}
      </div>
    </div>
  );
}
