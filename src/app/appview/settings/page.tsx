import { redirect } from "next/navigation";
import { SettingsPage } from "@/components/settings/settings-page";
import { fetchSettingsData } from "@/lib/queries/settings";
import { createClient } from "@/lib/supabase/server";

export default async function Settings() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { locale, profile } = await fetchSettingsData(supabase, user.id);

  return (
    <div className="max-w-4xl mx-auto">
      <SettingsPage currentLocale={locale} profile={profile} />
    </div>
  );
}
