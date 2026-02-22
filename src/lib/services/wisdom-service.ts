/**
 * Wisdom Service
 *
 * Service for retrieving random wisdom phrase indices with smart logic
 * to prevent consecutive repetitions.
 *
 * Phrases are stored in the i18n system (next-intl) under "wisdom.phrases".
 * This service deals only with numeric indices, not phrase strings.
 */

import { WISDOM_MAX_ATTEMPTS, WISDOM_SESSION_KEY } from "@/lib/constants";
import { logger } from "@/lib/utils/logger";

const LAST_WISDOM_KEY = WISDOM_SESSION_KEY;

/**
 * The total number of wisdom phrases available in the i18n system.
 * Must match the "wisdom.count" value in the messages JSON.
 */
export const WISDOM_PHRASE_COUNT = 60;

/**
 * Get a random wisdom phrase index, ensuring it's different from the last one shown
 *
 * This function:
 * 1. Retrieves the last shown wisdom index from sessionStorage
 * 2. Selects a random index from the available range
 * 3. Ensures the new index is different from the last one
 * 4. Stores the new index in sessionStorage for next time
 *
 * @param count - The total number of phrases available (defaults to WISDOM_PHRASE_COUNT)
 * @returns A random wisdom phrase index (0 to count-1)
 */
export function getRandomWisdomIndex(
  count: number = WISDOM_PHRASE_COUNT,
): number {
  // Get the last shown wisdom index from session storage
  const lastIndex = getLastWisdomIndex();

  let selectedIndex: number;
  let attempts = 0;
  const maxAttempts = WISDOM_MAX_ATTEMPTS; // Prevent infinite loop

  do {
    // Select a random index
    selectedIndex = Math.floor(Math.random() * count);
    attempts++;

    // Break if we've tried too many times (edge case: count is 1)
    if (attempts >= maxAttempts) {
      break;
    }
  } while (selectedIndex === lastIndex && count > 1);

  // Store the selected index for next time
  setLastWisdomIndex(selectedIndex);

  return selectedIndex;
}

/**
 * Get the last shown wisdom index from sessionStorage
 *
 * @returns The last wisdom phrase index or null if none exists
 */
function getLastWisdomIndex(): number | null {
  if (typeof window === "undefined") {
    return null; // Server-side rendering
  }

  try {
    const stored = sessionStorage.getItem(LAST_WISDOM_KEY);
    if (stored === null) {
      return null;
    }
    const parsed = Number.parseInt(stored, 10);
    return Number.isNaN(parsed) ? null : parsed;
  } catch (error) {
    // Handle sessionStorage errors gracefully (e.g., in private browsing mode)
    logger.warn("Failed to read from sessionStorage", error);
    return null;
  }
}

/**
 * Store the last shown wisdom index in sessionStorage
 *
 * @param index The wisdom phrase index to store
 */
function setLastWisdomIndex(index: number): void {
  if (typeof window === "undefined") {
    return; // Server-side rendering
  }

  try {
    sessionStorage.setItem(LAST_WISDOM_KEY, String(index));
  } catch (error) {
    // Handle sessionStorage errors gracefully
    logger.warn("Failed to write to sessionStorage", error);
  }
}

/**
 * Clear the last wisdom index from sessionStorage (useful for testing)
 */
export function clearLastWisdom(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.removeItem(LAST_WISDOM_KEY);
  } catch (error) {
    logger.warn("Failed to clear sessionStorage", error);
  }
}

/**
 * Get multiple random wisdom phrase indices (for pre-loading or variety)
 *
 * @param requestedCount Number of wisdom phrase indices to retrieve
 * @param totalCount The total number of phrases available (defaults to WISDOM_PHRASE_COUNT)
 * @returns Array of unique wisdom phrase indices
 */
export function getMultipleWisdomIndices(
  requestedCount: number,
  totalCount: number = WISDOM_PHRASE_COUNT,
): number[] {
  // Create an array of all indices and shuffle
  const allIndices = Array.from({ length: totalCount }, (_, i) => i);
  const shuffled = allIndices.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(requestedCount, totalCount));
}
