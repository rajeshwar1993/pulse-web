import { type BrowserContext } from '@playwright/test';

/**
 * Mock Supabase auth session data for testing.
 * In a real scenario, you would generate actual tokens from a test Supabase instance.
 */
const MOCK_SESSION = {
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token',
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  expires_in: 3600,
  token_type: 'bearer',
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    aud: 'authenticated',
    role: 'authenticated',
  },
};

/**
 * Set up authenticated state by injecting Supabase session cookies/localStorage.
 *
 * Usage with Playwright storageState:
 * ```ts
 * test.use({ storageState: 'e2e/.auth/user.json' });
 * ```
 *
 * Or call directly in a test:
 * ```ts
 * await setupAuthState(page.context());
 * ```
 */
export async function setupAuthState(context: BrowserContext): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
  const projectRef = new URL(supabaseUrl).hostname.split('.')[0];

  // Add Supabase auth cookies
  const baseUrl = 'http://localhost:3000';
  await context.addCookies([
    {
      name: `sb-${projectRef}-auth-token`,
      value: JSON.stringify(MOCK_SESSION),
      domain: 'localhost',
      path: '/',
    },
    {
      name: 'sb-access-token',
      value: MOCK_SESSION.access_token,
      domain: 'localhost',
      path: '/',
    },
    {
      name: 'sb-refresh-token',
      value: MOCK_SESSION.refresh_token,
      domain: 'localhost',
      path: '/',
    },
  ]);
}

/**
 * Generate a storage state file for authenticated tests.
 * This can be used with `test.use({ storageState: path })`.
 */
export function getMockStorageState() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
  const projectRef = new URL(supabaseUrl).hostname.split('.')[0];

  return {
    cookies: [
      {
        name: `sb-${projectRef}-auth-token`,
        value: JSON.stringify(MOCK_SESSION),
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'Lax' as const,
        expires: -1,
      },
    ],
    origins: [
      {
        origin: 'http://localhost:3000',
        localStorage: [
          {
            name: `sb-${projectRef}-auth-token`,
            value: JSON.stringify(MOCK_SESSION),
          },
        ],
      },
    ],
  };
}
