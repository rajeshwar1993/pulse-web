import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ConnectionDetailContent } from "@/components/connections/connection-detail-content";
import { fetchConnectionStats } from "@/lib/queries/connection-detail";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Connection - Pulse",
  description: "View your connection details and shared stats",
};

export default async function BrowserConnectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select()
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/profile-setup");
  }

  const stats = await fetchConnectionStats(supabase, id);

  if (!stats) {
    redirect("/dashboard");
  }

  return (
    <ConnectionDetailContent
      stats={stats}
      connectionId={id}
      routePrefix=""
      showBackButton
    />
  );
}
