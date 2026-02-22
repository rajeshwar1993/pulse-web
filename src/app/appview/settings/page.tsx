import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { SettingsPage } from "@/components/settings/settings-page";
import { createClient } from "@/lib/supabase/server";

export default async function Settings() {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Fetch profile and locale in parallel
  const [locale, { data: profile }] = await Promise.all([
    getLocale(),
    supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", user.id)
      .single(),
  ]);

  return (
    <div className="min-h-screen bg-[var(--off-white)] p-6">
      <div className="max-w-4xl mx-auto">
        <SettingsPage currentLocale={locale} profile={profile ?? undefined} />
      </div>
    </div>
  );
}
