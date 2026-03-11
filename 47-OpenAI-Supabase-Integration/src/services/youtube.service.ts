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

    // Handle success responses with explicit success field
    if (data.success === true && data.transcript) {
      return {
        success: true,
        transcript: data.transcript,
        videoTitle: data.videoTitle || data.title || undefined,
      };
    }

    // Handle Supabase Vector Store response (array with pageContent)
    if (Array.isArray(data) && data.length > 0 && data[0].pageContent !== undefined) {
      const transcriptFragments = data
        .filter(item => 
          item.pageContent && 
          item.pageContent.length > 50 && 
          !item.pageContent.includes('http') &&
          !item.pageContent.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) &&
          !item.pageContent.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
        )
        .map(item => item.pageContent);

      if (transcriptFragments.length > 0) {
        const fullTranscript = transcriptFragments.join(' ');
        
        return {
          success: true,
          transcript: fullTranscript,
          videoTitle: undefined,
        };
      }
    }

    // Handle array responses with transcript field
    if (Array.isArray(data) && data.length > 0) {
      const transcriptText = data[0].transcript || data[0].output || '';
      const videoTitle = data[0].title || data[0].videoTitle || '';
      
      if (transcriptText) {
        return {
          success: true,
          transcript: transcriptText,
          videoTitle: videoTitle || undefined,
        };
      }
    }

    // Handle object responses with transcript field
    if (data.transcript) {
      return {
        success: true,
        transcript: data.transcript,
        videoTitle: data.title || data.videoTitle || undefined,
      };
    }

    throw new Error('No transcript found in response');
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch transcript',
    };
  }
};
