import type { Page } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config';

/**
 * Sign in as a user via the login page UI.
 *
 * Uses the actual login form so cookies are set correctly by the app's
 * own @supabase/ssr client. Useful for multi-user scenarios where you
 * need a second user signed in on a different page/context.
 */
export async function loginViaUI(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto('/auth/login');
  await page.locator('#login-email').fill(email);
  await page.locator('#login-password').fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('**/dashboard', { timeout: 15_000 });
}

/**
 * Sign in via the Supabase API (Node.js side).
 *
 * Returns a real session object. Useful when you need session
 * tokens without a browser (e.g., for API-level testing).
 */
export async function signInViaAPI(email: string, password: string) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_ANON_KEY. ' +
        'Ensure pulse-web/.env.local is configured.',
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(`Sign-in failed for ${email}: ${error.message}`);
  }

  return data;
}
