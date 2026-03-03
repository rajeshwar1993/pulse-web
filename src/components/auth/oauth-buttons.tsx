"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";

interface OAuthButtonsProps {
  redirectTo?: string;
}

export function OAuthButtons({
  redirectTo = "/auth/callback",
}: OAuthButtonsProps) {
  const t = useTranslations("auth.login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isInWebView = typeof window !== "undefined" && !!window.FlutterBridge;

  // Listen for Flutter OAuth result events (only in WebView)
  useEffect(() => {
    if (!isInWebView) return;

    const handleSuccess = (e: Event) => {
      setLoading(false);
      const detail = (e as CustomEvent<{ redirectTo?: string }>).detail;
      if (detail?.redirectTo) {
        window.location.href = detail.redirectTo;
      }
    };

    const handleError = (e: Event) => {
      setLoading(false);
      const detail = (e as CustomEvent<{ error?: string }>).detail;
      setError(detail?.error ?? "Google sign-in failed");
    };

    window.addEventListener("flutter-google-auth-success", handleSuccess);
    window.addEventListener("flutter-google-auth-error", handleError);

    return () => {
      window.removeEventListener("flutter-google-auth-success", handleSuccess);
      window.removeEventListener("flutter-google-auth-error", handleError);
    };
  }, [isInWebView]);

  const handleGoogleLogin = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (isInWebView) {
      // Delegate to Flutter native for Google OAuth (WebViews are blocked by Google)
      window.FlutterBridge?.postMessage(
        JSON.stringify({ type: "GOOGLE_SIGN_IN_REQUESTED" }),
      );
      return;
    }

    // Browser: use standard Supabase OAuth flow
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}${redirectTo}`,
      },
    });
    if (oauthError) {
      setLoading(false);
      setError(oauthError.message);
    }
  }, [redirectTo, isInWebView]);

  return (
    <div className="space-y-2">
      {error && <Alert variant="error">{error}</Alert>}
      <Button
        variant="secondary"
        size="lg"
        loading={loading}
        onClick={handleGoogleLogin}
        className="gap-3"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path
            d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
            fill="#4285F4"
          />
          <path
            d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
            fill="#34A853"
          />
          <path
            d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
            fill="#FBBC05"
          />
          <path
            d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
            fill="#EA4335"
          />
        </svg>
        {t("googleButton")}
      </Button>
    </div>
  );
}
