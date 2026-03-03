"use client";

import { useTranslations } from "next-intl";
import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/auth/login-form";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { Heading } from "@/components/ui/heading";
import { useFlutterReadySignal } from "@/hooks/use-flutter-ready-signal";

export default function AppViewLoginPage() {
  useFlutterReadySignal();
  const t = useTranslations("auth.login");

  return (
    <AuthLayout>
      <Heading as="h1" size="lg" className="text-center mb-2">
        {t("title")}
      </Heading>
      <p className="text-center text-[var(--slate-500)] mb-6">
        {t("subtitle")}
      </p>

      <LoginForm routePrefix="/appview" />

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--slate-200)]" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-[var(--slate-400)]">
            {t("orContinueWith")}
          </span>
        </div>
      </div>

      <OAuthButtons redirectTo="/appview/auth/callback" />
    </AuthLayout>
  );
}
