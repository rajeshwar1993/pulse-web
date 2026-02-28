/**
 * Reusable DB verification assertions for E2E tests.
 *
 * Each function queries the database via the admin client and
 * throws a descriptive error if the assertion fails.
 */
import { expect } from '@playwright/test';
import { getTodayPulses } from './pulses';
import { getActiveConnections } from './connections';
import { getProfile } from './profiles';
import { getInviteCodes } from './invites';
import { getPendingRequests } from './connection-requests';

/**
 * Verify that a pulse exists for the user today.
 */
export async function verifyPulseExists(userId: string): Promise<void> {
  const pulses = await getTodayPulses(userId);
  expect(pulses.length, `Expected at least 1 pulse for user ${userId}`).toBeGreaterThan(0);
}

/**
 * Verify that NO pulse exists for the user today.
 */
export async function verifyNoPulseToday(userId: string): Promise<void> {
  const pulses = await getTodayPulses(userId);
  expect(pulses.length, `Expected 0 pulses for user ${userId}`).toBe(0);
}

/**
 * Verify the number of active connections for a user.
 */
export async function verifyConnectionCount(
  userId: string,
  expectedCount: number,
): Promise<void> {
  const connections = await getActiveConnections(userId);
  expect(
    connections.length,
    `Expected ${expectedCount} connections for user ${userId}`,
  ).toBe(expectedCount);
}

/**
 * Verify a specific field on a user's profile.
 */
export async function verifyProfileField(
  userId: string,
  field: string,
  expectedValue: unknown,
): Promise<void> {
  const profile = await getProfile(userId);
  expect(
    (profile as Record<string, unknown>)[field],
    `Expected profile.${field} = ${expectedValue}`,
  ).toBe(expectedValue);
}

/**
 * Verify the number of invite codes for a user.
 */
export async function verifyInviteCodeCount(
  userId: string,
  expectedCount: number,
): Promise<void> {
  const codes = await getInviteCodes(userId);
  expect(
    codes.length,
    `Expected ${expectedCount} invite codes for user ${userId}`,
  ).toBe(expectedCount);
}

/**
 * Verify the number of pending connection requests for a user.
 */
export async function verifyPendingRequestCount(
  userId: string,
  expectedCount: number,
): Promise<void> {
  const requests = await getPendingRequests(userId);
  expect(
    requests.length,
    `Expected ${expectedCount} pending requests for user ${userId}`,
  ).toBe(expectedCount);
}
