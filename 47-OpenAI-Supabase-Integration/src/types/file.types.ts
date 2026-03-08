/**
 * Type definitions for file upload functionality
 */

export type FileStatus = 'idle' | 'uploading' | 'success' | 'error';

export interface UploadedFile {
  file: File;
  id: string;
  status: FileStatus;
  error?: string;
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export interface UploadPayload {
  data: File;
  filename: string;
  fileType: string;
  fileSize: string;
  timestamp: string;
  userId: string;
}

export interface UploadResponse {
  success: boolean;
  message?: string;
  data?: unknown;
}
