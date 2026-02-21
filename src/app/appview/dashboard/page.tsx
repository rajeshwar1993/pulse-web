import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardContent } from '@/components/dashboard/dashboard-content';
import type { Connection } from '@/components/dashboard/connection-grid';

/**
 * Get the start of the current Pulse Day (4:00 AM local time)
 */
function getStartOfPulseDay(): Date {
  const now = new Date();
  const today4AM = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 4, 0, 0);

  if (now < today4AM) {
    // Before 4 AM, Pulse Day started yesterday at 4 AM
    return new Date(today4AM.getTime() - 24 * 60 * 60 * 1000);
  } else {
    // After 4 AM, Pulse Day started today at 4 AM
    return today4AM;
  }
}

/**
 * Generate mock connection data for testing
 */
function getMockConnections(): Connection[] {
  const now = new Date();
  return [
    {
      id: '1',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mom',
      name: 'Mom',
      status: 'active' as const,
      pulseTime: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: '2',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dad',
      name: 'Dad',
      status: 'active' as const,
      pulseTime: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
    },
    {
      id: '3',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sister',
      name: 'Sarah',
      status: 'waiting' as const,
      pulseTime: null,
    },
  ];
}

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ mock?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select()
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/appview/profile-setup');
  }

  // Check if user has pulsed today
  const pulseDayStart = getStartOfPulseDay();
  const { data: todayPulse } = await supabase
    .from('daily_pulses')
    .select('created_at')
    .eq('user_id', user.id)
    .gte('created_at', pulseDayStart.toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const isActive = todayPulse !== null;
  const pulseTime = todayPulse?.created_at ? new Date(todayPulse.created_at) : null;

  // Get connections (mock data for now, real connections in Unit 3)
  const useMockData = params.mock === 'true';
  const connections: Connection[] = useMockData ? getMockConnections() : [];

  return (
    <div className="min-h-screen bg-[var(--off-white)] p-6">
      <div className="max-w-4xl mx-auto">
        <DashboardContent
          displayName={profile.display_name}
          isActive={isActive}
          pulseTime={pulseTime}
          connections={connections}
          showWisdom={isActive}
        />
      </div>
    </div>
  );
}
