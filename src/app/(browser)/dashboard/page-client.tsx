"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback } from "react";
import type { Connection } from "@/components/dashboard/connection-grid";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { useToast } from "@/components/providers/toast-provider";
import { sendPulse } from "@/lib/services/pulse-service";

interface BrowserDashboardClientProps {
  displayName: string;
  isActive: boolean;
  pulseTime?: Date | null;
  connections: Connection[];
  pulsedDates?: string[];
  missedPulseDate?: string | null;
}

export function BrowserDashboardClient({
  displayName,
  isActive,
  pulseTime,
  connections,
  pulsedDates = [],
  missedPulseDate,
}: BrowserDashboardClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const t = useTranslations("pulse");

  const handlePulse = useCallback(async () => {
    const success = await sendPulse();
    if (success) {
      showToast(t("sent"), "success");
      router.refresh();
    } else {
      showToast(t("alreadySent"), "info");
    }
  }, [showToast, t, router]);

  return (
    <DashboardContent
      displayName={displayName}
      isActive={isActive}
      pulseTime={pulseTime}
      connections={connections}
      showWisdom={isActive}
      settingsHref="/settings"
      onPulse={handlePulse}
      pulsedDates={pulsedDates}
      missedPulseDate={missedPulseDate}
    />
  );
}
