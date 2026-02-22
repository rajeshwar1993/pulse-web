/**
 * Wisdom Library
 *
 * Wisdom phrases are now managed through the i18n system (next-intl)
 * in src/messages/en.json under the "wisdom" key.
 *
 * This file is kept for backward compatibility and exports:
 * - WISDOM_PHRASE_COUNT: the total number of phrases
 * - validateWisdomCount: validation helper
 *
 * @deprecated Import from wisdom-service.ts instead for index-based access.
 * Phrases themselves live in the i18n message files.
 */

/** The total number of wisdom phrases in the i18n system */
export const WISDOM_PHRASE_COUNT = 60;

/**
 * Validate that we have the expected number of wisdom phrases
 *
 * @param count The count value from the i18n system
 * @returns true if the count meets the minimum threshold of 50
 */
export function validateWisdomCount(count: number): boolean {
  return count >= 50;
}
