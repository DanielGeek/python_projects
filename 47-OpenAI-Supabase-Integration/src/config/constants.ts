/**
 * Application constants and configuration
 */

export const FILE_UPLOAD = {
  ALLOWED_TYPES: ['.txt', '.pdf', '.csv'] as const,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB in bytes
  MAX_FILE_SIZE_MB: 10,
} as const;

export const API = {
  N8N_WEBHOOK_URL: import.meta.env.VITE_N8N_WEBHOOK_URL || '',
  APP_URL: import.meta.env.VITE_APP_URL || 'http://localhost:3000',
} as const;

export const UI = {
  UPLOAD_BUTTON_TEXT: 'Upload Files',
  UPLOADING_TEXT: 'Uploading...',
  BROWSE_FILES_TEXT: 'Browse Files',
  DRAG_DROP_TEXT: 'Drag and drop your files here',
  SUCCESS_MESSAGE: 'Upload successful!',
  SUCCESS_DESCRIPTION: 'Your files have been sent to n8n for processing.',
} as const;

export const ERROR_MESSAGES = {
  INVALID_FILE_TYPE: (allowedTypes: readonly string[]) =>
    `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
  FILE_SIZE_EXCEEDED: (maxSize: number) =>
    `File size exceeds ${maxSize}MB limit`,
  UPLOAD_FAILED: (status: number, statusText: string) =>
    `Upload failed (${status} ${statusText})`,
  UNKNOWN_ERROR: 'Unknown error occurred',
} as const;
