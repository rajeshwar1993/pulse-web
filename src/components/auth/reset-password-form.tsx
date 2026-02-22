"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { type FormEvent, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import { supabase } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const t = useTranslations("auth.resetPassword");
  const tSignup = useTranslations("auth.signup");
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError(tSignup("passwordHint"));
      return;
    }

    if (password !== confirmPassword) {
      setError(tSignup("passwordMismatch"));
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.push("/login");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert variant="error">{error}</Alert>}

      <FormInput
        label={tSignup("passwordLabel")}
        htmlFor="reset-password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={loading}
        autoComplete="new-password"
      />

      <FormInput
        label={tSignup("confirmPasswordLabel")}
        htmlFor="reset-confirm-password"
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
    </form>
  );
}
