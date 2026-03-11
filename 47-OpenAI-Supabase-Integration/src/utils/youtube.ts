/**
 * YouTube utility functions for extracting video information
 */

/**
 * Extracts YouTube video ID from various URL formats
 * Supports: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
 */
export const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&]+)/,
    /(?:youtu\.be\/)([^?]+)/,
    /(?:youtube\.com\/embed\/)([^?]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

/**
 * Generates YouTube thumbnail URL from video URL
 * Returns maxresdefault quality thumbnail
 */
export const getYouTubeThumbnail = (videoUrl: string): string => {
  const videoId = getYouTubeVideoId(videoUrl);
  
  if (!videoId) {
    return 'https://via.placeholder.com/640x360?text=Video+Thumbnail';
  }

  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

/**
 * Formats date string to readable format
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  });
};
