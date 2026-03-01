import { redirect } from "next/navigation";
import { ConnectionDetailContent } from "@/components/connections/connection-detail-content";
import { fetchConnectionStats } from "@/lib/queries/connection-detail";
import { createClient } from "@/lib/supabase/server";

export default async function AppviewConnectionDetailPage({
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
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select()
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/appview/profile-setup");
  }

  const stats = await fetchConnectionStats(supabase, id);

  if (!stats) {
    redirect("/appview/dashboard");
  }

  return (
    <div className="min-h-screen bg-[var(--off-white)] p-6">
      <div className="max-w-4xl mx-auto">
        <ConnectionDetailContent
          stats={stats}
          connectionId={id}
          routePrefix="/appview"
        />
      </div>
    </div>
  );
}
