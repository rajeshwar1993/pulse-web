/**
 * Wisdom Library
 *
 * A collection of motivational and uplifting phrases shown to users
 * after they complete their daily pulse. Each wisdom is designed to
 * reinforce the value of staying connected with loved ones.
 */

export const wisdomPhrases = [
  // Core connection messages
  "A simple pulse is the highlight of a parent's morning.",
  "Small gestures, big impact.",
  "You just made someone's day a little brighter.",
  "Connection doesn't require words, just presence.",
  "Your check-in is their peace of mind.",
  "Consistency builds trust, one pulse at a time.",
  "You're building a habit of care.",
  "Distance doesn't matter when hearts stay connected.",
  "Your loved ones are smiling right now.",
  "This small act speaks volumes.",

  // Relationship strengthening
  "Every pulse strengthens the bond.",
  "You're weaving a safety net of connection.",
  "Regular check-ins create lasting relationships.",
  "Your presence matters more than you know.",
  "Family feels closer when you stay in touch.",
  "A moment of connection can change someone's entire day.",
  "You're nurturing relationships that matter.",
  "Love grows with consistent care.",
  "Your attention is a gift they treasure.",
  "Building bridges, one pulse at a time.",

  // Positive reinforcement
  "Well done! Your consistency is remarkable.",
  "You're doing great at staying connected.",
  "Another day of being there for the ones who matter.",
  "Your dedication to connection is inspiring.",
  "Keep going - you're making a real difference.",
  "This is what showing up looks like.",
  "You're creating a legacy of care.",
  "Your commitment to family is beautiful.",
  "Every pulse counts, and you're counting on yourself.",
  "You're proving that distance is just a number.",

  // Emotional impact
  "Someone is grateful you exist right now.",
  "Your pulse just brought warmth to someone's heart.",
  "Peace of mind delivered in an instant.",
  "You're their reminder that they're not alone.",
  "Anxiety replaced with assurance - that's your gift.",
  "You turned someone's worry into relief.",
  "Your check-in is their comfort.",
  "Love isn't always loud - sometimes it's just a pulse.",
  "You're the reason someone feels secure today.",
  "Connection is the antidote to loneliness, and you just shared it.",

  // Habit and routine
  "Habits like these shape who we become.",
  "One more day of showing up. That's powerful.",
  "Routines of care create extraordinary relationships.",
  "You're building a streak of kindness.",
  "Daily actions compound into lifelong bonds.",
  "Small habits, profound impact.",
  "Consistency is the secret ingredient of love.",
  "You're making caring a daily practice.",
  "This routine is your relationship superpower.",
  "Building connection, one day at a time.",

  // Perspective and wisdom
  "The best investments are in people you love.",
  "Time spent connecting is never wasted.",
  "In a busy world, your pause to connect matters.",
  "Technology brings us together when we choose to use it well.",
  "Modern problems, timeless solutions: just stay in touch.",
  "You're using tech to strengthen what matters most - relationships.",
  "The future is built on connections we nurture today.",
  "Your pulse is proof that you care.",
  "Distance is temporary, connection is forever.",
  "You're redefining what it means to be present.",
] as const;

export type WisdomPhrase = typeof wisdomPhrases[number];

/**
 * Get the total count of available wisdom phrases
 */
export function getWisdomCount(): number {
  return wisdomPhrases.length;
}

/**
 * Validate that we have at least 50 unique wisdom phrases
 */
export function validateWisdomLibrary(): boolean {
  const uniquePhrases = new Set(wisdomPhrases);
  return uniquePhrases.size >= 50 && uniquePhrases.size === wisdomPhrases.length;
}
