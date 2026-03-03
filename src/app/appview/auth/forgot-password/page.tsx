"use client";

import { useTranslations } from "next-intl";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { Heading } from "@/components/ui/heading";
import { useFlutterReadySignal } from "@/hooks/use-flutter-ready-signal";

export default function AppViewForgotPasswordPage() {
  useFlutterReadySignal();
  const t = useTranslations("auth.forgotPassword");

  return (
    <AuthLayout>
      <Heading as="h1" size="lg" className="text-center mb-2">
        {t("title")}
      </Heading>
      <p className="text-center text-[var(--slate-500)] mb-6">
        {t("subtitle")}
      </p>
      <ForgotPasswordForm routePrefix="/appview" />
    </AuthLayout>
  );
}
