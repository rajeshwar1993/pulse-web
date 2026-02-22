"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/providers/toast-provider";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Spinner } from "@/components/ui/spinner";
import { ConnectionService } from "@/lib/services/connection-service";
import { supabase } from "@/lib/supabase/client";
import { logger } from "@/lib/utils/logger";

function InviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  const t = useTranslations("connections.invite");
  const tErrors = useTranslations("errors");
  const code = searchParams.get("code");
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/login?next=/invite?code=${code}`);
        return;
      }
      setIsAuthenticated(true);
      setLoading(false);
    };
    checkAuth();
  }, [code, router]);

  const handleAccept = useCallback(async () => {
    if (!code) return;
    setAccepting(true);
    setError(null);

    try {
      await ConnectionService.acceptInviteCode(code);
      showToast("Connection added!", "success");
      router.push("/connections");
    } catch (err) {
      logger.error("Failed to accept invite", err);
      setError(tErrors("generic"));
      setAccepting(false);
    }
  }, [code, router, showToast, tErrors]);

  if (!code) {
    return (
      <div className="max-w-md mx-auto py-12">
        <Alert variant="error">{tErrors("generic")}</Alert>
      </div>
    );
  }

  if (loading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <Card className="rounded-2xl text-center">
        <Heading as="h1" size="md" className="mb-4">
          {t("title")}
        </Heading>
        <p className="text-[var(--slate-600)] mb-2">{t("codeLabel")}</p>
        <p className="text-2xl font-mono font-bold text-[var(--teal)] mb-6">
          {code}
        </p>

        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => router.push("/dashboard")}
          >
            Decline
          </Button>
          <Button className="flex-1" loading={accepting} onClick={handleAccept}>
            Accept
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <Spinner size="lg" />
        </div>
      }
    >
      <InviteContent />
    </Suspense>
  );
}
