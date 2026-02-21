import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Get the authenticated user
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Check if profile exists
        const { data: profile } = await supabase
          .from('profiles')
          .select()
          .eq('id', user.id)
          .single();

        if (profile) {
          // Profile exists, redirect to dashboard
          return NextResponse.redirect(`${origin}/appview/dashboard`);
        } else {
          // No profile, redirect to profile setup
          return NextResponse.redirect(`${origin}/appview/profile-setup`);
        }
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/appview/auth/error`);
}
