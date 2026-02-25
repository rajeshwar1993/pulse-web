"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { EmptyConnectionsView } from "@/components/shared/empty-connections-view";
import { Heading } from "@/components/ui/heading";
import { FLUTTER_READY_SIGNAL_DELAY_MS } from "@/lib/constants";
import { useSeenReceipts } from "@/hooks/use-seen-receipts";
import type { ConnectionRequestWithProfile } from "@/lib/types/connection";
import { logger } from "@/lib/utils/logger";
import { type Connection, ConnectionGrid } from "./connection-grid";
import { GhostCalendar } from "./ghost-calendar";
import { MissedPulseSurveyModal } from "./missed-pulse-survey-modal";
import { PendingRequestsBanner } from "./pending-requests-banner";
import { PulseButton } from "./pulse-button";
import { StatusCard } from "./status-card";
import { StreakBadge } from "./streak-badge";
import { WisdomCard } from "./wisdom-card";

interface DashboardContentProps {
  displayName: string;
  isActive: boolean;
  pulseTime?: Date | null;
  connections: Connection[];
  showWisdom?: boolean;
  onPulse?: () => Promise<void>;
  currentStreak?: number;
  longestStreak?: number;
  pulsedDates?: string[];
  missedPulseDate?: string | null;
  pendingRequests?: ConnectionRequestWithProfile[];
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
  connections,
  showWisdom = true,
  onPulse,
  currentStreak = 0,
  longestStreak = 0,
  pulsedDates = [],
  missedPulseDate,
  pendingRequests,
}: DashboardContentProps) {
  const t = useTranslations("dashboard");
  useSeenReceipts(connections);
  const [showWisdomCard, setShowWisdomCard] = useState(showWisdom);
  const [showMissedPulseSurvey, setShowMissedPulseSurvey] = useState(
    !!missedPulseDate,
  );

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

      {/* Streak Badge */}
      <StreakBadge
        currentStreak={currentStreak}
        longestStreak={longestStreak}
      />

      {/* Ghost Calendar */}
      <GhostCalendar pulsedDates={pulsedDates} />

      {/* Connections Section */}
      <div>
        {connections.length > 0 ? (
          <ConnectionGrid connections={connections} />
        ) : (
          <EmptyConnectionsView />
        )}
      </div>
    </div>
  );
}
