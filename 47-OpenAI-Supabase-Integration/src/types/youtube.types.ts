/**
 * Type definitions for YouTube transcript functionality
 */

export interface YouTubeTranscriptRequest {
  userId: string;
  videoUrl: string;
}

export interface YouTubeTranscriptResponse {
  success: boolean;
  transcript?: string;
  videoTitle?: string;
  error?: string;
}

export interface TranscriptState {
  transcript: string | null;
  videoTitle: string | null;
  isLoading: boolean;
  error: string | null;
}
