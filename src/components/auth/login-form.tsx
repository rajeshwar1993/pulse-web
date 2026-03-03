"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { type FormEvent, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import { supabase } from "@/lib/supabase/client";

interface LoginFormProps {
  /** Route prefix: "" for browser, "/appview" for WebView */
  routePrefix?: string;
}

export function LoginForm({ routePrefix = "" }: LoginFormProps) {
  const t = useTranslations("auth.login");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError, data } = await supabase.auth.signInWithPassword(
      {
        email,
        password,
      },
    );

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    // In appview, notify Flutter of the new session
    if (routePrefix === "/appview" && data.session) {
      window.FlutterBridge?.postMessage(
        JSON.stringify({
          type: "AUTH_COMPLETED",
          payload: {
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
            expiresAt: data.session.expires_at,
          },
        }),
      );
    }

    // Check if profile exists
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      router.push(
        profile ? `${routePrefix}/dashboard` : `${routePrefix}/profile-setup`,
      );
    } else {
      router.push(`${routePrefix}/dashboard`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert variant="error">{error}</Alert>}

      <FormInput
        label={t("emailLabel")}
        htmlFor="login-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("emailPlaceholder")}
        required
        disabled={loading}
        autoComplete="email"
      />

      <FormInput
        label={t("passwordLabel")}
        htmlFor="login-password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={loading}
        autoComplete="current-password"
      />

      <div className="text-right">
        <Link
          href={`${routePrefix}/auth/forgot-password`}
          className="text-sm text-[var(--teal)] hover:text-[var(--teal-400)] transition-colors"
        >
          {t("forgotPassword")}
        </Link>
      </div>

      <Button type="submit" size="lg" loading={loading}>
        {t("submitButton")}
      </Button>

      <p className="text-center text-sm text-[var(--slate-500)]">
        {t("noAccount")}{" "}
        <Link
          href={`${routePrefix}/auth/signup`}
          className="text-[var(--teal)] hover:text-[var(--teal-400)] font-medium transition-colors"
        >
          {t("signUpLink")}
        </Link>
      </p>
    </form>
  );
}
