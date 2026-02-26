"use client";

import type { DashboardSeat } from "@/lib/types/seat";
import { EmptySeatCard } from "./empty-seat-card";
import { ExpiredSeatCard } from "./expired-seat-card";
import { OccupiedSeatCard } from "./occupied-seat-card";
import { PendingSeatCard } from "./pending-seat-card";

interface SeatCardProps {
  seat: DashboardSeat;
  onEmptyClick: () => void;
  onPendingClick: () => void;
  onOccupiedClick: () => void;
  onExpiredClick: () => void;
}

export function SeatCard({
  seat,
  onEmptyClick,
  onPendingClick,
  onOccupiedClick,
  onExpiredClick,
}: SeatCardProps) {
  switch (seat.state) {
    case "empty":
      return <EmptySeatCard onClick={onEmptyClick} />;
    case "pending":
      return <PendingSeatCard seat={seat} onClick={onPendingClick} />;
    case "occupied":
      return <OccupiedSeatCard seat={seat} onClick={onOccupiedClick} />;
    case "expired":
      return <ExpiredSeatCard seat={seat} onClick={onExpiredClick} />;
  }
}
