"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { CancelInviteModal } from "@/components/seats/cancel-invite-modal";
import { InviteModal } from "@/components/connections/invite-modal";
import { RenewSeatModal } from "@/components/seats/renew-seat-modal";
import { SeatGrid } from "@/components/seats/seat-grid";
import { Heading } from "@/components/ui/heading";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { FLUTTER_READY_SIGNAL_DELAY_MS } from "@/lib/constants";
import { useSeenReceipts } from "@/hooks/use-seen-receipts";
import { ConnectionService } from "@/lib/services/connection-service";
import { useToast } from "@/components/providers/toast-provider";
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
import { WisdomCard } from "./wisdom-card";

interface DashboardContentProps {
  displayName: string;
  isActive: boolean;
  pulseTime?: Date | null;
  seats: DashboardSeat[];
  /** Derived from occupied seats for useSeenReceipts */
  connections: DashboardConnection[];
  showWisdom?: boolean;
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
 * - Interactive components (WisdomCard)
 * - Dynamic greeting based on time of day
 */
export function DashboardContent({
  displayName,
  isActive,
  pulseTime,
  seats,
  connections,
  showWisdom = true,
  onPulse,
  missedPulseDate,
  pendingRequests,
  currentStreak,
  pulsedDates,
  totalDays,
  todayPulseDay,
}: DashboardContentProps) {
  const t = useTranslations("dashboard");
  const tConn = useTranslations("connections");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { showToast } = useToast();
  useSeenReceipts(connections);
  const [showWisdomCard, setShowWisdomCard] = useState(showWisdom);
  const [showMissedPulseSurvey, setShowMissedPulseSurvey] = useState(
    !!missedPulseDate,
  );

  // Seat interaction state
  const [inviteSeat, setInviteSeat] = useState<DashboardSeat | null>(null);
  const [cancelSeat, setCancelSeat] = useState<DashboardSeat | null>(null);
  const [renewSeat, setRenewSeat] = useState<DashboardSeat | null>(null);
  const [removeSeat, setRemoveSeat] = useState<DashboardSeat | null>(null);

  const handleRefresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const handleRemoveConnection = async () => {
    if (!removeSeat?.connection) return;
    try {
      await ConnectionService.removeConnection(removeSeat.connection.id);
      setRemoveSeat(null);
      handleRefresh();
    } catch (error) {
      logger.error("Failed to remove connection", error);
      showToast(tConn("removeError"), "error");
    }
  };

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

      {/* Wisdom Card (conditional) */}
      {showWisdomCard && (
        <WisdomCard
          autoDismiss={true}
          dismissDelay={3000}
          onDismiss={() => setShowWisdomCard(false)}
        />
      )}

      {/* Pulse Button (browser only, when not pulsed) */}
      {!isActive && onPulse && <PulseButton onPulse={onPulse} />}

      {/* Status Card */}
      <StatusCard isActive={isActive} pulseTime={pulseTime} />

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
        onOccupiedClick={(seat) => setRemoveSeat(seat)}
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

      {/* Remove Connection Confirmation */}
      <Modal
        open={!!removeSeat}
        onClose={() => setRemoveSeat(null)}
        maxWidth="sm"
      >
        <p className="text-[var(--slate-900)] font-medium mb-4">
          {tConn("removeConfirm")}
        </p>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={() => setRemoveSeat(null)}
          >
            {tCommon("cancel")}
          </Button>
          <Button
            variant="danger"
            size="sm"
            className="flex-1"
            onClick={handleRemoveConnection}
          >
            {tConn("removeConnection")}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
