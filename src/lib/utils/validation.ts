/** Maximum allowed length for display names */
export const DISPLAY_NAME_MAX_LENGTH = 50;

/** Minimum allowed length for display names */
export const DISPLAY_NAME_MIN_LENGTH = 2;

/**
 * Sanitizes a display name by trimming whitespace and collapsing
 * consecutive whitespace characters into a single space.
 */
export function sanitizeDisplayName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

/**
 * Validates a display name and returns an error message if invalid, or null if valid.
 */
export function validateDisplayName(name: string): string | null {
  const sanitized = sanitizeDisplayName(name);

  if (sanitized.length < DISPLAY_NAME_MIN_LENGTH) {
    return `Display name must be at least ${DISPLAY_NAME_MIN_LENGTH} characters`;
  }

  if (sanitized.length > DISPLAY_NAME_MAX_LENGTH) {
    return `Display name must be at most ${DISPLAY_NAME_MAX_LENGTH} characters`;
  }

  return null;
}
