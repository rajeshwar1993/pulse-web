"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useRef, useState } from "react";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { PulseOverlay } from "@/components/dashboard/pulse-overlay";
import { useToast } from "@/components/providers/toast-provider";
import { sendPulse } from "@/lib/services/pulse-service";
import type {
  ConnectionRequestWithProfile,
  DashboardConnection,
} from "@/lib/types/connection";
import type { DashboardSeat } from "@/lib/types/seat";

interface BrowserDashboardClientProps {
  displayName: string;
  isActive: boolean;
  pulseTime?: Date | null;
  seats: DashboardSeat[];
  connections: DashboardConnection[];
  missedPulseDate?: string | null;
  pendingRequests?: ConnectionRequestWithProfile[];
  currentStreak: number;
  pulsedDates: string[];
  totalDays: number;
  todayPulseDay: string;
}

export function BrowserDashboardClient({
  displayName,
  isActive,
  pulseTime,
  seats,
  connections,
  missedPulseDate,
  pendingRequests,
  currentStreak,
  pulsedDates,
  totalDays,
  todayPulseDay,
}: BrowserDashboardClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const t = useTranslations("pulse");
  const [showPulseOverlay, setShowPulseOverlay] = useState(false);
  const pulseSuccessRef = useRef(false);

  const handlePulse = useCallback(async () => {
    setShowPulseOverlay(true);
    const [success] = await Promise.all([
      sendPulse(),
      new Promise((r) => setTimeout(r, 3000)),
    ]);
    pulseSuccessRef.current = success;
    setShowPulseOverlay(false);
  }, []);

  const handleOverlayComplete = useCallback(() => {
    if (pulseSuccessRef.current) {
      showToast(t("sent"), "success");
      router.refresh();
    } else {
      showToast(t("alreadySent"), "info");
    }
  }, [showToast, t, router]);

  return (
    <>
      <PulseOverlay
        isOpen={showPulseOverlay}
        onComplete={handleOverlayComplete}
      />
      <DashboardContent
        displayName={displayName}
        isActive={isActive}
        pulseTime={pulseTime}
        seats={seats}
        connections={connections}
        showWisdom={isActive}
        onPulse={handlePulse}
        missedPulseDate={missedPulseDate}
        pendingRequests={pendingRequests}
        currentStreak={currentStreak}
        pulsedDates={pulsedDates}
        totalDays={totalDays}
        todayPulseDay={todayPulseDay}
      />
    </>
  );
}
