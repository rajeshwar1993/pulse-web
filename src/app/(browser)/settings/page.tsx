import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SettingsPage } from "@/components/settings/settings-page";
import { fetchSettingsData } from "@/lib/queries/settings";
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

  const { locale, profile } = await fetchSettingsData(supabase, user.id);

  return (
    <SettingsPage
      currentLocale={locale}
      dashboardHref="/dashboard"
      profile={profile}
      profileSetupHref="/profile-setup?mode=edit"
    />
  );
}
