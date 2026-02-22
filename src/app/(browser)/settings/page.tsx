import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { SettingsPage } from "@/components/settings/settings-page";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Settings - Pulse",
  description: "Customize your Pulse preferences",
};

export default async function BrowserSettings() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [locale, { data: profile }] = await Promise.all([
    getLocale(),
    supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", user.id)
      .single(),
  ]);

  return (
    <SettingsPage
      currentLocale={locale}
      dashboardHref="/dashboard"
      profile={profile ?? undefined}
      profileSetupHref="/profile-setup?mode=edit"
    />
  );
}
