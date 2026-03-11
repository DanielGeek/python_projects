/**
 * Utility functions for YouTube transcript functionality
 */

/**
 * Extracts video ID from various YouTube URL formats
 */
export const extractVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
};

/**
 * Validates if a URL is a valid YouTube URL
 */
export const isValidYouTubeUrl = (url: string): boolean => {
  return extractVideoId(url) !== null;
};

/**
 * Formats transcript text for better readability
 */
export const formatTranscript = (transcript: string): string => {
  return transcript
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n\n');
};
