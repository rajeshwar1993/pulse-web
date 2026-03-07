"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useToast } from "@/components/providers/toast-provider";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Modal } from "@/components/ui/modal";
import { usePartnerTime } from "@/hooks/use-partner-time";
import { ConnectionService } from "@/lib/services/connection-service";
import type { ConnectionStats } from "@/lib/types/connection-detail";
import { logger } from "@/lib/utils/logger";
import { getEffectiveStreak } from "@/lib/utils/streak";

interface ConnectionDetailContentProps {
  stats: ConnectionStats;
  connectionId: string;
  routePrefix: string;
  showBackButton?: boolean;
}

export function ConnectionDetailContent({
  stats,
  connectionId,
  routePrefix,
  showBackButton = false,
}: ConnectionDetailContentProps) {
  const t = useTranslations("connectionDetail");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const { showToast } = useToast();
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [removing, setRemoving] = useState(false);

  const partnerTime = usePartnerTime(stats.otherTimezone, locale);

  const connectedDate = new Date(stats.connectionCreatedAt).toLocaleDateString(
    locale,
    { year: "numeric", month: "long", day: "numeric" },
  );

  const effectiveStreak = getEffectiveStreak(
    stats.otherCurrentStreak,
    stats.otherLastPulseDate,
  );

  const handleRemoveConnection = async () => {
    setRemoving(true);
    try {
      await ConnectionService.removeConnection(connectionId);
      router.push(`${routePrefix}/dashboard`);
    } catch (error) {
      logger.error("Failed to remove connection", error);
      showToast(t("removeError"), "error");
      setRemoving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back link (browser only) */}
      {showBackButton && (
        <button
          type="button"
          onClick={() => router.push(`${routePrefix}/dashboard`)}
          className="flex items-center gap-1 text-[var(--slate-600)] hover:text-[var(--slate-900)] transition-colors text-sm font-medium"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="flex-shrink-0"
            aria-hidden="true"
          >
            <path
              d="M10 12L6 8L10 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {t("back")}
        </button>
      )}

      {/* Profile header */}
      <div className="flex items-center gap-4">
        <Avatar
          src={stats.otherAvatarUrl}
          alt={stats.otherDisplayName}
          size="lg"
          status="none"
        />
        <div>
          <Heading as="h1" size="md">
            {stats.otherDisplayName}
          </Heading>
          <p className="text-[var(--slate-500)] text-sm mt-0.5">
            {partnerTime}
          </p>
        </div>
      </div>

      {/* Connected since */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[var(--slate-100)]">
        <p className="text-[var(--slate-500)] text-sm">
          {t("connectedSince", { date: connectedDate })}
        </p>
        <p className="text-[var(--slate-900)] text-2xl font-bold mt-1">
          {t("daysConnected", { count: stats.totalDaysConnected })}
        </p>
      </div>

      {/* Shared streak */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[var(--slate-100)]">
        <Heading as="h2" size="sm" className="mb-4">
          {t("sharedStreak")}
        </Heading>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[var(--slate-500)] text-xs uppercase tracking-wide">
              {t("current")}
            </p>
            <p className="text-[var(--slate-900)] text-2xl font-bold mt-1">
              {stats.sharedStreakCurrent > 0 && (
                <span className="mr-1" aria-hidden="true">
                  🔥
                </span>
              )}
              {stats.sharedStreakCurrent}
            </p>
          </div>
          <div>
            <p className="text-[var(--slate-500)] text-xs uppercase tracking-wide">
              {t("longest")}
            </p>
            <p className="text-[var(--slate-900)] text-2xl font-bold mt-1">
              {stats.sharedStreakLongest}
            </p>
          </div>
        </div>
      </div>

      {/* Sync rate */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[var(--slate-100)]">
        <Heading as="h2" size="sm" className="mb-2">
          {t("syncRate")}
        </Heading>
        <p className="text-[var(--teal)] text-4xl font-bold">
          {stats.syncRate}%
        </p>
        <p className="text-[var(--slate-500)] text-sm mt-1">
          {t("syncRateDescription", {
            synced: stats.daysBothPulsed,
            total: stats.totalDaysConnected,
          })}
        </p>
      </div>

      {/* Partner's streak */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[var(--slate-100)]">
        <Heading as="h2" size="sm" className="mb-4">
          {t("partnerStreak", { name: stats.otherDisplayName })}
        </Heading>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[var(--slate-500)] text-xs uppercase tracking-wide">
              {t("current")}
            </p>
            <p className="text-[var(--slate-900)] text-2xl font-bold mt-1">
              {effectiveStreak > 0 && (
                <span className="mr-1" aria-hidden="true">
                  🔥
                </span>
              )}
              {effectiveStreak}
            </p>
          </div>
          <div>
            <p className="text-[var(--slate-500)] text-xs uppercase tracking-wide">
              {t("longest")}
            </p>
            <p className="text-[var(--slate-900)] text-2xl font-bold mt-1">
              {stats.otherLongestStreak}
            </p>
          </div>
        </div>
      </div>

      {/* Remove connection */}
      <div className="pt-4">
        <Button
          variant="ghost"
          size="md"
          className="w-full text-[var(--error)]"
          onClick={() => setShowRemoveModal(true)}
        >
          {t("removeConnection")}
        </Button>
      </div>

      {/* Remove confirmation modal */}
      <Modal
        open={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        maxWidth="sm"
      >
        <p className="text-[var(--slate-900)] font-medium mb-4">
          {t("removeConfirm", { name: stats.otherDisplayName })}
        </p>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={() => setShowRemoveModal(false)}
          >
            {tCommon("cancel")}
          </Button>
          <Button
            variant="danger"
            size="sm"
            className="flex-1"
            loading={removing}
            onClick={handleRemoveConnection}
          >
            {t("removeConnection")}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
