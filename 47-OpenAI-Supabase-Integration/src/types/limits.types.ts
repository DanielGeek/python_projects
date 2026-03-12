/**
 * Types for user usage limits system
 */

export interface UserLimits {
  user_id: string;
  documents_used: number;
  transcripts_used: number;
  documents_limit: number;
  transcripts_limit: number;
  is_pro: boolean;
  created_at: string;
  updated_at: string;
}

export interface UsageLimits {
  documents: {
    used: number;
    limit: number;
    remaining: number;
    hasReachedLimit: boolean;
  };
  transcripts: {
    used: number;
    limit: number;
    remaining: number;
    hasReachedLimit: boolean;
  };
  isPro: boolean;
}

export type LimitType = 'documents' | 'transcripts';
