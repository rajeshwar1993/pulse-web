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

  // Show occupied seats first, then the rest — preserve original order within each group
  const sortedSeats = [...seats].sort((a, b) => {
    const aOccupied = a.state === "occupied" ? 0 : 1;
    const bOccupied = b.state === "occupied" ? 0 : 1;
    return aOccupied - bOccupied;
  });

  return (
    <div className="space-y-3">
      <Heading as="h2" size="sm">
        {t("gridTitle", { count: occupiedCount })}
      </Heading>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {sortedSeats.map((seat) => (
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
