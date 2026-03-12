/**
 * User usage limits configuration
 */

export const USAGE_LIMITS = {
  FREE_TIER: {
    DOCUMENTS: 3,
    TRANSCRIPTS: 3,
  },
  PRO_TIER: {
    DOCUMENTS: -1, // -1 means unlimited
    TRANSCRIPTS: -1,
  },
} as const;

export const LIMIT_MESSAGES = {
  DOCUMENTS_REACHED: 'You have reached your document upload limit (3/3). Upgrade to Pro for unlimited uploads.',
  TRANSCRIPTS_REACHED: 'You have reached your transcript extraction limit (3/3). Upgrade to Pro for unlimited transcripts.',
  UPGRADE_PROMPT: 'Upgrade to Pro to continue using this feature.',
} as const;
