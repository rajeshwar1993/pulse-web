import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { fetchDashboardData } from "@/lib/queries/dashboard";
import { createClient } from "@/lib/supabase/server";
import { BrowserDashboardClient } from "./page-client";

export const metadata: Metadata = {
  title: "Dashboard - Pulse",
  description: "Your daily pulse status and connections",
};

export default async function BrowserDashboard() {
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

  const data = await fetchDashboardData(supabase, user.id, profile);

  return (
    <BrowserDashboardClient
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
  );
}
