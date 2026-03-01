"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { CancelInviteModal } from "@/components/seats/cancel-invite-modal";
import { InviteModal } from "@/components/connections/invite-modal";
import { RenewSeatModal } from "@/components/seats/renew-seat-modal";
import { SeatGrid } from "@/components/seats/seat-grid";
import { Heading } from "@/components/ui/heading";
import { FLUTTER_READY_SIGNAL_DELAY_MS } from "@/lib/constants";
import { useSeenReceipts } from "@/hooks/use-seen-receipts";
import type {
  ConnectionRequestWithProfile,
  DashboardConnection,
} from "@/lib/types/connection";
import type { DashboardSeat } from "@/lib/types/seat";
import { logger } from "@/lib/utils/logger";
import { MissedPulseSurveyModal } from "./missed-pulse-survey-modal";
import { PendingRequestsBanner } from "./pending-requests-banner";
import { PulseButton } from "./pulse-button";
import { StatusCard } from "./status-card";
import { StreakCard } from "./streak-card";

interface DashboardContentProps {
  displayName: string;
  isActive: boolean;
  pulseTime?: Date | null;
  seats: DashboardSeat[];
  /** Derived from occupied seats for useSeenReceipts */
  connections: DashboardConnection[];
  onPulse?: () => Promise<void>;
  missedPulseDate?: string | null;
  pendingRequests?: ConnectionRequestWithProfile[];
  currentStreak: number;
  pulsedDates: string[];
  totalDays: number;
  todayPulseDay: string;
}

/**
 * DashboardContent Component
 *
 * Client-side wrapper for the Dashboard page.
 * Handles:
 * - window.isReady signal to Flutter
 * - Dynamic greeting based on time of day
 */
export function DashboardContent({
  displayName,
  isActive,
  pulseTime,
  seats,
  connections,
  onPulse,
  missedPulseDate,
  pendingRequests,
  currentStreak,
  pulsedDates,
  totalDays,
  todayPulseDay,
}: DashboardContentProps) {
  const t = useTranslations("dashboard");
  const router = useRouter();
  const pathname = usePathname();
  useSeenReceipts(connections);
  const [showMissedPulseSurvey, setShowMissedPulseSurvey] = useState(
    !!missedPulseDate,
  );

  // Seat interaction state
  const [inviteSeat, setInviteSeat] = useState<DashboardSeat | null>(null);
  const [cancelSeat, setCancelSeat] = useState<DashboardSeat | null>(null);
  const [renewSeat, setRenewSeat] = useState<DashboardSeat | null>(null);

  const handleRefresh = useCallback(() => {
    router.refresh();
  }, [router]);

  // Send window.isReady signal to Flutter WebView
  useEffect(() => {
    // Wait for DOM to be fully ready
    const sendReadySignal = () => {
      try {
        // Check if running in Flutter WebView (FlutterBridge channel)
        if (typeof window !== "undefined" && window.FlutterBridge) {
          logger.debug("Sending ready signal to Flutter...");

          // Send JSON message
          window.FlutterBridge.postMessage(
            JSON.stringify({
              type: "ready",
              timestamp: Date.now(),
            }),
          );

          logger.debug("Ready signal sent successfully");
        } else {
          logger.debug(
            "FlutterBridge not available (probably running in browser)",
          );
        }
      } catch (error) {
        logger.error("Failed to send ready signal", error);
      }
    };

    // Send signal after a brief delay to ensure everything is loaded
    const timer = setTimeout(sendReadySignal, FLUTTER_READY_SIGNAL_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  // Get greeting based on time of day
  const getGreeting = (): string => {
    const hour = new Date().getHours();

    if (hour < 12) return t("greetingMorning");
    if (hour < 18) return t("greetingAfternoon");
    return t("greetingEvening");
  };

  return (
    <div className="space-y-6">
      {/* Missed Pulse Survey Modal */}
      {showMissedPulseSurvey && missedPulseDate && (
        <MissedPulseSurveyModal
          missedDate={missedPulseDate}
          onComplete={() => setShowMissedPulseSurvey(false)}
        />
      )}

      {/* Header with dynamic greeting */}
      <div>
        <Heading as="h1" size="lg">
          {getGreeting()}, {displayName}!
        </Heading>
        <p className="text-[var(--slate-600)] mt-1">
          {isActive ? t("activeSubtitle") : t("inactiveSubtitle")}
        </p>
      </div>

      {/* Pending Connection Requests */}
      {pendingRequests && pendingRequests.length > 0 && (
        <PendingRequestsBanner pendingRequests={pendingRequests} />
      )}

      {/* Status Card */}
      <StatusCard isActive={isActive} pulseTime={pulseTime} />

      {/* Pulse Button (browser only, when not pulsed) */}
      {!isActive && onPulse && <PulseButton onPulse={onPulse} />}

      {/* Streak Card */}
      <StreakCard
        currentStreak={currentStreak}
        isActive={isActive}
        pulsedDates={pulsedDates}
        totalDays={totalDays}
        todayPulseDay={todayPulseDay}
      />

      {/* Seats Section */}
      <SeatGrid
        seats={seats}
        onEmptyClick={(seat) => setInviteSeat(seat)}
        onPendingClick={(seat) => setCancelSeat(seat)}
        onOccupiedClick={(seat) => {
          if (seat.connection) {
            const prefix = pathname.startsWith("/appview") ? "/appview" : "";
            router.push(`${prefix}/connection/${seat.connection.id}`);
          }
        }}
        onExpiredClick={(seat) => setRenewSeat(seat)}
      />

      {/* Invite Modal */}
      {inviteSeat && (
        <InviteModal
          seatId={inviteSeat.id}
          onClose={() => {
            setInviteSeat(null);
            handleRefresh();
          }}
        />
      )}

      {/* Cancel Invite Modal */}
      {cancelSeat && (
        <CancelInviteModal
          seat={cancelSeat}
          onClose={() => setCancelSeat(null)}
          onCancelled={() => {
            setCancelSeat(null);
            handleRefresh();
          }}
        />
      )}

      {/* Renew Seat Modal */}
      {renewSeat && (
        <RenewSeatModal
          seat={renewSeat}
          onClose={() => setRenewSeat(null)}
          onRenewed={() => {
            setRenewSeat(null);
            handleRefresh();
          }}
        />
      )}

    </div>
  );
}
