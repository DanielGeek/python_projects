/**
 * Utility functions for file operations
 */

import { FILE_UPLOAD, ERROR_MESSAGES } from '@/config/constants';
import type { FileValidationResult } from '@/types/file.types';

/**
 * Validates a file based on type and size constraints
 */
export const validateFile = (file: File): FileValidationResult => {
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  
  if (!FILE_UPLOAD.ALLOWED_TYPES.includes(extension as any)) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.INVALID_FILE_TYPE(FILE_UPLOAD.ALLOWED_TYPES),
    };
  }
  
  if (file.size > FILE_UPLOAD.MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.FILE_SIZE_EXCEEDED(FILE_UPLOAD.MAX_FILE_SIZE_MB),
    };
  }
  
  return { isValid: true };
};

/**
 * Generates a unique alphanumeric user ID
 */
export const generateUserId = (): string => {
  return 'USR' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

/**
 * Formats file size from bytes to human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Generates a unique file ID based on timestamp and index
 */
export const generateFileId = (index: number): string => {
  return `${Date.now()}-${index}`;
};
