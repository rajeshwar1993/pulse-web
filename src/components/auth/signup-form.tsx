"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { type FormEvent, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import { supabase } from "@/lib/supabase/client";

interface SignupFormProps {
  /** Route prefix: "" for browser, "/appview" for WebView */
  routePrefix?: string;
}

export function SignupForm({ routePrefix = "" }: SignupFormProps) {
  const t = useTranslations("auth.signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError(t("passwordHint"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    setLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}${routePrefix}/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setVerificationSent(true);
    setLoading(false);
  };

  if (verificationSent) {
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
          {t("verificationSent")}
        </p>
        <p className="text-sm text-[var(--slate-500)]">
          {t("hasAccount")}{" "}
          <Link
            href={`${routePrefix}/auth/login`}
            className="text-[var(--teal)] hover:text-[var(--teal-400)] font-medium transition-colors"
          >
            {t("logInLink")}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert variant="error">{error}</Alert>}

      <FormInput
        label={t("emailLabel")}
        htmlFor="signup-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
        disabled={loading}
        autoComplete="email"
      />

      <div>
        <FormInput
          label={t("passwordLabel")}
          htmlFor="signup-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          autoComplete="new-password"
        />
        <p className="text-xs text-[var(--slate-400)] mt-1">
          {t("passwordHint")}
        </p>
      </div>

      <FormInput
        label={t("confirmPasswordLabel")}
        htmlFor="signup-confirm-password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        disabled={loading}
        autoComplete="new-password"
      />

      <Button type="submit" size="lg" loading={loading}>
        {t("submitButton")}
      </Button>

      <p className="text-center text-sm text-[var(--slate-500)]">
        {t("hasAccount")}{" "}
        <Link
          href="/auth/login"
          className="text-[var(--teal)] hover:text-[var(--teal-400)] font-medium transition-colors"
        >
          {t("logInLink")}
        </Link>
      </p>
    </form>
  );
}
