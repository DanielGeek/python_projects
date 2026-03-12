/**
 * Custom hook for YouTube transcript functionality
 */

import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserLimits } from '@/hooks/useUserLimits';
import { fetchYouTubeTranscript } from '@/services/youtube.service';
import { isValidYouTubeUrl } from '@/utils/youtube.utils';

export const useYouTubeTranscript = () => {
  const { user } = useAuth();
  const { limits, incrementUsage, canPerformAction } = useUserLimits();
  const [transcript, setTranscript] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches transcript for a YouTube video URL
   */
  const getTranscript = useCallback(async (videoUrl: string) => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    if (!videoUrl.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    if (!isValidYouTubeUrl(videoUrl)) {
      setError('Invalid YouTube URL. Please enter a valid YouTube video link.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setTranscript(null);
    setVideoTitle(null);

    const result = await fetchYouTubeTranscript({
      userId: user.id,
      videoUrl: videoUrl.trim(),
    });

    setIsLoading(false);

    if (result.success && result.transcript) {
      setTranscript(result.transcript);
      setVideoTitle(result.videoTitle || null);
      
      // Increment usage counter after successful transcript extraction
      await incrementUsage('transcripts');
    } else {
      setError(result.error || 'Failed to fetch transcript');
    }
  }, [user, incrementUsage]);

  /**
   * Clears transcript and error state
   */
  const clearTranscript = useCallback(() => {
    setTranscript(null);
    setVideoTitle(null);
    setError(null);
  }, []);

  /**
   * Clears error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    transcript,
    videoTitle,
    isLoading,
    error,
    getTranscript,
    clearTranscript,
    clearError,
    limits,
    canPerformAction,
  };
};
