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
    redirect("/login");
  }

  const locale = await getLocale();

  return <SettingsPage currentLocale={locale} dashboardHref="/dashboard" />;
}
