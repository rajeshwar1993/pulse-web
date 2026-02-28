import { readFileSync } from 'node:fs';
import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';

/**
 * Load env vars from .env.local for the Playwright process.
 * Next.js loads .env.local automatically for the dev server,
 * but Playwright's Node.js process needs them too (for e2e helpers).
 */
function loadEnvFile(filePath: string): void {
  try {
    const content = readFileSync(filePath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env.local not found — env vars must be set externally (e.g., CI)
  }
}

// Load pulse-web/.env.local (staging Supabase URL, anon key, service role key)
loadEnvFile(path.resolve(__dirname, '.env.local'));

export default defineConfig({
  testDir: './e2e/flows',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? 'github' : 'html',
  timeout: 30_000,

  globalSetup: './e2e/global-setup.ts',

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // Auth setup — runs first, authenticates User A + User B
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      testDir: './e2e',
    },

    // Desktop Chrome — browser-route flows (all except appview-only)
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user-a.json',
      },
      dependencies: ['setup'],
      testIgnore: /10-appview\.flow\.spec\.ts/,
    },

    // Mobile Chrome — appview + mixed + mobile nav flows
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 7'],
        storageState: 'e2e/.auth/user-a.json',
      },
      dependencies: ['setup'],
      testMatch: [
        /07-profile-settings\.flow\.spec\.ts/,
        /08-activity-streaks\.flow\.spec\.ts/,
        /09-navigation\.flow\.spec\.ts/,
        /10-appview\.flow\.spec\.ts/,
      ],
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
