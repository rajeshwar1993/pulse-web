/**
 * Playwright global setup — runs once before ALL tests.
 *
 * 1. Wipes all data (all tables + all auth users)
 * 2. Creates seed users A and B (auth + profiles)
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { TEST_USER_A, TEST_USER_B } from "./config";
import { ensureAuthUser } from "./admin/auth";
import { ensureProfile } from "./admin/profiles";
import { wipeAllData } from "./admin/wipe";

/**
 * Load env vars from .env.local for the global-setup process.
 * Playwright's globalSetup runs in a separate worker, so env vars
 * are not automatically available.
 */
function loadEnvFile(filePath: string): void {
  try {
    const content = readFileSync(filePath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIndex = trimmed.indexOf("=");
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

async function setupUser(user: {
  email: string;
  password: string;
  displayName: string;
}) {
  const userId = await ensureAuthUser(
    user.email,
    user.password,
    user.displayName,
  );
  await ensureProfile(userId, user.email, user.displayName);
  console.log(`[global-setup] Created seed user: ${user.email} (${userId})`);
  return userId;
}

export default async function globalSetup() {
  // Load env vars (globalSetup runs in a separate worker)
  loadEnvFile(path.resolve(__dirname, "../.env.local"));

  console.log("[global-setup] Starting nuclear wipe...");
  await wipeAllData();

  console.log("[global-setup] Creating seed users...");
  await setupUser(TEST_USER_A);
  await setupUser(TEST_USER_B);

  console.log("[global-setup] Done.");
}
