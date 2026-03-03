"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, useTransition } from "react";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { PulseOverlay } from "@/components/dashboard/pulse-overlay";
import { useToast } from "@/components/providers/toast-provider";
import { sendPulse } from "@/lib/services/pulse-service";
import type {
  ConnectionRequestWithProfile,
  DashboardConnection,
} from "@/lib/types/connection";
import type { DashboardSeat } from "@/lib/types/seat";

interface AppViewDashboardClientProps {
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
  wisdomPhrases: string[];
}

export function AppViewDashboardClient({
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
  wisdomPhrases,
}: AppViewDashboardClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const t = useTranslations("pulse");
  const [showPulseOverlay, setShowPulseOverlay] = useState(false);
  const [pulseResultPromise, setPulseResultPromise] =
    useState<Promise<boolean> | null>(null);
  const [isPending, startTransition] = useTransition();
  const [refreshStarted, setRefreshStarted] = useState(false);
  const autoPulseFired = useRef(false);

  // Auto-pulse on mount when user hasn't pulsed today
  useEffect(() => {
    if (isActive || autoPulseFired.current) return;
    autoPulseFired.current = true;
    const promise = sendPulse();
    setPulseResultPromise(promise);
    setShowPulseOverlay(true);
  }, [isActive]);

  // Trigger router.refresh() as soon as pulse resolves (while overlay is still visible)
  useEffect(() => {
    if (!pulseResultPromise) return;
    let cancelled = false;
    pulseResultPromise.then((success) => {
      if (cancelled) return;
      setRefreshStarted(true);
      if (success) {
        startTransition(() => {
          router.refresh();
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [pulseResultPromise, router, startTransition]);

  const dashboardReady = refreshStarted && !isPending;

  const handleOverlayComplete = (success: boolean) => {
    setShowPulseOverlay(false);
    setPulseResultPromise(null);
    setRefreshStarted(false);
    if (success) {
      showToast(t("sent"), "success");
    } else {
      showToast(t("alreadySent"), "info");
    }
  };

  return (
    <>
      <PulseOverlay
        isOpen={showPulseOverlay}
        onComplete={handleOverlayComplete}
        pulseResult={pulseResultPromise}
        dashboardReady={dashboardReady}
        wisdomPhrases={wisdomPhrases}
      />
      <DashboardContent
        displayName={displayName}
        isActive={isActive}
        pulseTime={pulseTime}
        seats={seats}
        connections={connections}
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
