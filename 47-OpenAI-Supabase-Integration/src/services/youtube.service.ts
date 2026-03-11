/**
 * Service layer for YouTube transcript operations
 */

import { API } from '@/config/constants';
import type { YouTubeTranscriptRequest, YouTubeTranscriptResponse } from '@/types/youtube.types';

/**
 * Fetches YouTube video transcript from n8n webhook
 */
export const fetchYouTubeTranscript = async (
  request: YouTubeTranscriptRequest
): Promise<YouTubeTranscriptResponse> => {
  try {
    const response = await fetch(API.N8N_YOUTUBE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: request.userId,
        videoUrl: request.videoUrl,
      }),
    });

    // Parse response regardless of status code
    let data;
    const contentType = response.headers.get('content-type');
    
    try {
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Invalid response from server. Please try again.');
    }

    // Handle error responses from n8n (even with 200 status)
    if (!response.ok) {
      const errorMsg = data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMsg);
    }

    // Handle array responses with error
    if (Array.isArray(data) && data.length > 0 && data[0].success === false) {
      const errorMsg = data[0].error?.trim() || 'Failed to fetch transcript';
      throw new Error(errorMsg);
    }

    // Handle object responses with error
    if (data.success === false) {
      const errorMsg = (data.error || data.message || 'Failed to fetch transcript').trim();
      throw new Error(errorMsg);
    }

    // Handle success responses
    if (data.success === true && data.transcript) {
      return {
        success: true,
        transcript: data.transcript,
        videoTitle: data.videoTitle || data.title || undefined,
      };
    }

    let transcriptText = '';
    let videoTitle = '';

    if (Array.isArray(data) && data.length > 0) {
      transcriptText = data[0].transcript || data[0].output || '';
      videoTitle = data[0].title || data[0].videoTitle || '';
    } else if (data.transcript) {
      transcriptText = data.transcript;
      videoTitle = data.title || data.videoTitle || '';
    } else if (data.output) {
      transcriptText = data.output;
      videoTitle = data.title || data.videoTitle || '';
    }

    if (!transcriptText) {
      throw new Error('No transcript found in response');
    }

    return {
      success: true,
      transcript: transcriptText,
      videoTitle: videoTitle || undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch transcript',
    };
  }
};
