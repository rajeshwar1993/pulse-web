import { PulseLogo } from '@/components/ui/pulse-logo';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function Home() {
  const supabase = await createClient();

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // User is authenticated, check if they have a profile
    const { data: profile } = await supabase
      .from('profiles')
      .select()
      .eq('id', user.id)
      .single();

    if (profile) {
      // Has profile, redirect to dashboard
      redirect('/appview/dashboard');
    } else {
      // No profile, redirect to profile setup
      redirect('/appview/profile-setup');
    }
  }

  // Not authenticated, show landing page
  const tCommon = await getTranslations('common');
  const tAuth = await getTranslations('auth');

  return (
    <main className="min-h-screen bg-[var(--off-white)] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <PulseLogo className="w-32 h-32 mx-auto mb-6" />
        <h1 className="text-5xl font-bold text-[var(--teal)] mb-4">{tCommon('appName')}</h1>
        <p className="text-xl text-[var(--slate-600)] mb-8">
          {tCommon('tagline')}
        </p>

        <div className="space-y-4">
          <p className="text-[var(--slate-500)]">
            {tAuth('signInPrompt')}
          </p>

          {/* Note: Auth buttons would go here */}
          {/* For now, users can use the mobile app to authenticate */}
          <p className="text-sm text-[var(--slate-400)]">
            {tAuth('mobileSignInNote')}
          </p>
        </div>
      </div>
    </main>
  );
}
