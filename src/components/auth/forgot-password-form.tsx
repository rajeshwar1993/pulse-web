"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { type FormEvent, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import { supabase } from "@/lib/supabase/client";

interface ForgotPasswordFormProps {
  /** Route prefix: "" for browser, "/appview" for WebView */
  routePrefix?: string;
}

export function ForgotPasswordForm({
  routePrefix = "",
}: ForgotPasswordFormProps) {
  const t = useTranslations("auth.forgotPassword");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}${routePrefix}/auth/reset-password`,
      },
    );

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-[var(--teal-50)] flex items-center justify-center">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--teal)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        </div>
        <p className="text-[var(--slate-700)] font-medium">
          {t("successMessage")}
        </p>
        <Link
          href={`${routePrefix}/auth/login`}
          className="inline-block text-sm text-[var(--teal)] hover:text-[var(--teal-400)] font-medium transition-colors"
        >
          {t("backToLogin")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert variant="error">{error}</Alert>}

      <FormInput
        label="Email"
        htmlFor="forgot-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
        disabled={loading}
        autoComplete="email"
      />

      <Button type="submit" size="lg" loading={loading}>
        {t("submitButton")}
      </Button>

      <p className="text-center">
        <Link
          href={`${routePrefix}/auth/login`}
          className="text-sm text-[var(--teal)] hover:text-[var(--teal-400)] font-medium transition-colors"
        >
          {t("backToLogin")}
        </Link>
      </p>
    </form>
  );
}
