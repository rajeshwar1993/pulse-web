"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { ConnectionRequestService } from "@/lib/services/connection-request-service";
import type { ConnectionRequestWithProfile } from "@/lib/types/connection";
import { logger } from "@/lib/utils/logger";

interface PendingRequestsBannerProps {
  pendingRequests: ConnectionRequestWithProfile[];
}

export function PendingRequestsBanner({
  pendingRequests: initialRequests,
}: PendingRequestsBannerProps) {
  const t = useTranslations("connections.requests");
  const { showToast } = useToast();
  const router = useRouter();
  const [requests, setRequests] =
    useState<ConnectionRequestWithProfile[]>(initialRequests);
  const [processingId, setProcessingId] = useState<string | null>(null);

  if (requests.length === 0) return null;

  const handleAccept = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      await ConnectionRequestService.acceptRequest(requestId);
      showToast(t("accepted"), "success");
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      router.refresh();
    } catch (error) {
      logger.error("Failed to accept connection request", error);
      showToast(t("accepted"), "error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      await ConnectionRequestService.declineRequest(requestId);
      showToast(t("declined"), "info");
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (error) {
      logger.error("Failed to decline connection request", error);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-3">
      <Heading as="h2" size="sm">
        {t("pendingTitle")}
      </Heading>
      {requests.map((request) => (
        <div
          key={request.id}
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm"
        >
          {/* Avatar */}
          <img
            src={request.from_profile.avatar_url}
            alt={request.from_profile.display_name}
            className="w-10 h-10 rounded-full object-cover"
          />

          {/* Name + message */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-[var(--dark-gray)] truncate">
              {request.from_profile.display_name}
            </p>
            <p className="text-sm text-[var(--slate-600)]">
              {t("wantsToConnect")}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleDecline(request.id)}
              loading={processingId === request.id}
            >
              {t("decline")}
            </Button>
            <Button
              size="sm"
              onClick={() => handleAccept(request.id)}
              loading={processingId === request.id}
            >
              {t("accept")}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
