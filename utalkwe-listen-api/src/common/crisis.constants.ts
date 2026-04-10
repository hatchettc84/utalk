/**
 * Crisis safety constants — must live in code, never in DB or config.
 * Exact wording is reviewed for clinical appropriateness — do not edit without review.
 */

export const CRISIS_KEYWORDS: string[] = [
  'kill myself',
  'killing myself',
  'want to die',
  'end my life',
  'take my life',
  'suicide',
  'suicidal',
  'hurt myself',
  'self-harm',
  'not worth living',
  'no reason to live',
  'rather be dead',
  "don't want to be here",
  "don't want to live",
];

export const CRISIS_RESPONSE =
  "I hear you, and I want you to know that what you're feeling matters deeply. " +
  'Please reach out to the 988 Suicide and Crisis Lifeline right now — just call or text 988. ' +
  'They have real people available 24 hours a day, 7 days a week who are trained to help. ' +
  "You don't have to carry this alone.";

export const CRISIS_SMS =
  'You reached out today, and that took courage. ' +
  "If you're still struggling, please call or text 988 — Suicide & Crisis Lifeline — anytime. " +
  "It's free, confidential, and available 24/7. " +
  'You matter. — Haven';
