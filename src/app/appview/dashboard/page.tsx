import { redirect } from "next/navigation";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { fetchDashboardData } from "@/lib/queries/dashboard";
import { createClient } from "@/lib/supabase/server";

export default async function Dashboard() {
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

  const data = await fetchDashboardData(supabase, user.id, profile);

  return (
    <div className="min-h-screen bg-[var(--off-white)] p-6">
      <div className="max-w-4xl mx-auto">
        <DashboardContent
          displayName={data.displayName}
          isActive={data.isActive}
          pulseTime={data.pulseTime}
          seats={data.seats}
          connections={data.connections}
          missedPulseDate={data.missedPulseDate}
          pendingRequests={data.pendingRequests}
          currentStreak={data.currentStreak}
          pulsedDates={data.pulsedDates}
          totalDays={data.totalDays}
          todayPulseDay={data.todayPulseDay}
        />
      </div>
    </div>
  );
}
