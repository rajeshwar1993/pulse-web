import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const supabase = await createClient();
  
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
    redirect('/profile-setup');
  }

  return (
    <div className="min-h-screen bg-[var(--off-white)] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <img
              src={profile.avatar_url}
              alt={profile.display_name}
              className="w-20 h-20 rounded-full border-4 border-[var(--teal)]"
            />
            <div>
              <h1 className="text-3xl font-bold text-[var(--slate-900)]">
                Welcome, {profile.display_name}!
              </h1>
              <p className="text-[var(--slate-600)]">{profile.email}</p>
            </div>
          </div>

          <div className="border-t border-[var(--slate-200)] pt-6">
            <h2 className="text-xl font-semibold text-[var(--slate-900)] mb-4">
              Dashboard - Coming Soon
            </h2>
            <p className="text-[var(--slate-600)]">
              This is where you'll manage your connections, send pulses, and view your dashboard.
            </p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-[var(--slate-500)] text-sm">
            🎉 Unit 1: Identity Core - Complete!
          </p>
        </div>
      </div>
    </div>
  );
}
