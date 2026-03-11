/**
 * Custom hook for fetching and managing video transcripts from Supabase
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export interface Transcript {
  id: string;
  user_id: string;
  video_url: string;
  video_title: string;
  thumbnail_url: string;
  transcript_text: string;
  created_at: string;
  updated_at: string;
}

interface UseTranscriptsReturn {
  transcripts: Transcript[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  deleteTranscript: (id: string) => Promise<void>;
}

export const useTranscripts = (): UseTranscriptsReturn => {
  const { user } = useAuth();
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTranscripts = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('transcripts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setTranscripts(data || []);
    } catch (err) {
      console.error('Error fetching transcripts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch transcripts');
    } finally {
      setLoading(false);
    }
  };

  const deleteTranscript = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('transcripts')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (deleteError) throw deleteError;

      // Update local state
      setTranscripts((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Error deleting transcript:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchTranscripts();
  }, [user?.id]);

  return {
    transcripts,
    loading,
    error,
    refetch: fetchTranscripts,
    deleteTranscript,
  };
};
