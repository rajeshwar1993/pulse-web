"use client";

import { useTranslations } from "next-intl";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Heading } from "@/components/ui/heading";
import { useFlutterReadySignal } from "@/hooks/use-flutter-ready-signal";

export default function AppViewResetPasswordPage() {
  useFlutterReadySignal();
  const t = useTranslations("auth.resetPassword");

  return (
    <AuthLayout>
      <Heading as="h1" size="lg" className="text-center mb-2">
        {t("title")}
      </Heading>
      <ResetPasswordForm routePrefix="/appview" />
    </AuthLayout>
  );
}
