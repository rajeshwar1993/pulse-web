/**
 * Wisdom Service
 *
 * Service for retrieving random wisdom phrases with smart logic
 * to prevent consecutive repetitions.
 */

import { wisdomPhrases, type WisdomPhrase } from '../data/wisdom-library';

const LAST_WISDOM_KEY = 'pulse_last_wisdom';

/**
 * Get a random wisdom phrase, ensuring it's different from the last one shown
 *
 * This function:
 * 1. Retrieves the last shown wisdom from sessionStorage
 * 2. Selects a random phrase from the wisdom library
 * 3. Ensures the new phrase is different from the last one
 * 4. Stores the new phrase in sessionStorage for next time
 *
 * @returns A random wisdom phrase string
 */
export function getRandomWisdom(): WisdomPhrase {
  // Get the last shown wisdom from session storage
  const lastWisdom = getLastWisdom();

  let selectedWisdom: WisdomPhrase;
  let attempts = 0;
  const maxAttempts = 10; // Prevent infinite loop

  do {
    // Select a random index
    const randomIndex = Math.floor(Math.random() * wisdomPhrases.length);
    selectedWisdom = wisdomPhrases[randomIndex];
    attempts++;

    // Break if we've tried too many times (edge case: library has only 1 phrase)
    if (attempts >= maxAttempts) {
      break;
    }
  } while (selectedWisdom === lastWisdom && wisdomPhrases.length > 1);

  // Store the selected wisdom for next time
  setLastWisdom(selectedWisdom);

  return selectedWisdom;
}

/**
 * Get the last shown wisdom from sessionStorage
 *
 * @returns The last wisdom phrase or null if none exists
 */
function getLastWisdom(): WisdomPhrase | null {
  if (typeof window === 'undefined') {
    return null; // Server-side rendering
  }

  try {
    const stored = sessionStorage.getItem(LAST_WISDOM_KEY);
    return stored as WisdomPhrase | null;
  } catch (error) {
    // Handle sessionStorage errors gracefully (e.g., in private browsing mode)
    console.warn('Failed to read from sessionStorage:', error);
    return null;
  }
}

/**
 * Store the last shown wisdom in sessionStorage
 *
 * @param wisdom The wisdom phrase to store
 */
function setLastWisdom(wisdom: WisdomPhrase): void {
  if (typeof window === 'undefined') {
    return; // Server-side rendering
  }

  try {
    sessionStorage.setItem(LAST_WISDOM_KEY, wisdom);
  } catch (error) {
    // Handle sessionStorage errors gracefully
    console.warn('Failed to write to sessionStorage:', error);
  }
}

/**
 * Clear the last wisdom from sessionStorage (useful for testing)
 */
export function clearLastWisdom(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    sessionStorage.removeItem(LAST_WISDOM_KEY);
  } catch (error) {
    console.warn('Failed to clear sessionStorage:', error);
  }
}

/**
 * Get multiple random wisdom phrases (for pre-loading or variety)
 *
 * @param count Number of wisdom phrases to retrieve
 * @returns Array of unique wisdom phrases
 */
export function getMultipleWisdom(count: number): WisdomPhrase[] {
  const shuffled = [...wisdomPhrases].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, wisdomPhrases.length));
}
