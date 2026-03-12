/**
 * User Limits Context - Global state for usage limits
 * Shares limits state across all components to ensure UI updates everywhere
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { USAGE_LIMITS } from '@/config/limits';
import type { UserLimits, UsageLimits, LimitType } from '@/types/limits.types';

interface UserLimitsContextType {
  limits: UsageLimits | null;
  isLoading: boolean;
  error: string | null;
  incrementUsage: (type: LimitType) => Promise<boolean>;
  canPerformAction: (type: LimitType) => boolean;
  refreshLimits: () => void;
  resetUsage: () => Promise<void>;
}

const UserLimitsContext = createContext<UserLimitsContextType | undefined>(undefined);

export const UserLimitsProvider = ({ children }: { children: ReactNode }) => {
  const [limits, setLimits] = useState<UsageLimits | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  /**
   * Transform database limits to UsageLimits format
   */
  const transformLimitsData = (data: UserLimits): UsageLimits => {
    const documentsLimit = data.is_pro ? USAGE_LIMITS.PRO_TIER.DOCUMENTS : data.documents_limit;
    const transcriptsLimit = data.is_pro ? USAGE_LIMITS.PRO_TIER.TRANSCRIPTS : data.transcripts_limit;

    return {
      documents: {
        used: data.documents_used,
        limit: documentsLimit,
        remaining: documentsLimit === -1 ? -1 : Math.max(0, documentsLimit - data.documents_used),
        hasReachedLimit: documentsLimit !== -1 && data.documents_used >= documentsLimit,
      },
      transcripts: {
        used: data.transcripts_used,
        limit: transcriptsLimit,
        remaining: transcriptsLimit === -1 ? -1 : Math.max(0, transcriptsLimit - data.transcripts_used),
        hasReachedLimit: transcriptsLimit !== -1 && data.transcripts_used >= transcriptsLimit,
      },
      isPro: data.is_pro,
    };
  };

  /**
   * Fetch user limits from database
   */
  const fetchUserLimitsInternal = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('User not authenticated');
        setIsLoading(false);
        return;
      }

      const { data: existingLimits, error: fetchError } = await supabase
        .from('user_limits')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (!existingLimits) {
        const { data: newLimits, error: insertError } = await supabase
          .from('user_limits')
          .insert({
            user_id: user.id,
            documents_used: 0,
            transcripts_used: 0,
            documents_limit: USAGE_LIMITS.FREE_TIER.DOCUMENTS,
            transcripts_limit: USAGE_LIMITS.FREE_TIER.TRANSCRIPTS,
            is_pro: false,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        
        setLimits(transformLimitsData(newLimits));
      } else {
        setLimits(transformLimitsData(existingLimits));
      }
    } catch (err) {
      console.error('Error fetching user limits:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch limits');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Public refresh function
   */
  const refreshLimits = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  /**
   * Increment usage count for a specific limit type
   */
  const incrementUsage = useCallback(async (type: LimitType): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      if (limits) {
        if (type === 'documents' && limits.documents.hasReachedLimit) {
          return false;
        }
        if (type === 'transcripts' && limits.transcripts.hasReachedLimit) {
          return false;
        }
      }

      const { data: currentData, error: fetchError } = await supabase
        .from('user_limits')
        .select('documents_used, transcripts_used')
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;

      const newValue = type === 'documents' 
        ? currentData.documents_used + 1 
        : currentData.transcripts_used + 1;

      const column = type === 'documents' ? 'documents_used' : 'transcripts_used';

      const { data, error: updateError } = await supabase
        .from('user_limits')
        .update({
          [column]: newValue,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setLimits(transformLimitsData(data));
      refreshLimits();
      
      return true;
    } catch (err) {
      console.error(`Error incrementing ${type} usage:`, err);
      setError(err instanceof Error ? err.message : 'Failed to update usage');
      return false;
    }
  }, [limits, refreshLimits]);

  /**
   * Check if user can perform an action based on limits
   */
  const canPerformAction = useCallback((type: LimitType): boolean => {
    if (!limits) return false;
    
    if (limits.isPro) return true;
    
    if (type === 'documents') {
      return !limits.documents.hasReachedLimit;
    }
    
    return !limits.transcripts.hasReachedLimit;
  }, [limits]);

  /**
   * Reset usage (admin function or for testing)
   */
  const resetUsage = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error: updateError } = await supabase
        .from('user_limits')
        .update({
          documents_used: 0,
          transcripts_used: 0,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setLimits(transformLimitsData(data));
    } catch (err) {
      console.error('Error resetting usage:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset usage');
    }
  }, []);

  useEffect(() => {
    fetchUserLimitsInternal();
  }, [refreshTrigger]);

  const value = {
    limits,
    isLoading,
    error,
    incrementUsage,
    canPerformAction,
    refreshLimits,
    resetUsage,
  };

  return (
    <UserLimitsContext.Provider value={value}>
      {children}
    </UserLimitsContext.Provider>
  );
};

export const useUserLimits = () => {
  const context = useContext(UserLimitsContext);
  if (context === undefined) {
    throw new Error('useUserLimits must be used within a UserLimitsProvider');
  }
  return context;
};
