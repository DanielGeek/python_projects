/**
 * Service layer for file upload operations
 */

import { API, ERROR_MESSAGES } from '@/config/constants';
import { generateUserId } from '@/utils/file.utils';
import type { UploadResponse } from '@/types/file.types';

/**
 * Uploads a file to the n8n webhook
 */
export const uploadFileToWebhook = async (file: File): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('data', file);
    formData.append('filename', file.name);
    formData.append('fileType', file.type);
    formData.append('fileSize', file.size.toString());
    formData.append('timestamp', new Date().toISOString());
    formData.append('userId', generateUserId());

    const response = await fetch(API.N8N_WEBHOOK_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorMessage = await parseErrorResponse(response);
      throw new Error(errorMessage);
    }

    return {
      success: true,
      message: 'File uploaded successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR,
    };
  }
};

/**
 * Parses error response from the server
 */
const parseErrorResponse = async (response: Response): Promise<string> => {
  let errorMessage = ERROR_MESSAGES.UPLOAD_FAILED(response.status, response.statusText);

  try {
    const errorData = await response.json();
    if (errorData.message) {
      errorMessage = `Error ${response.status}: ${errorData.message}`;
    } else if (errorData.error) {
      errorMessage = `Error ${response.status}: ${errorData.error}`;
    }
  } catch {
    try {
      const errorText = await response.text();
      if (errorText) {
        errorMessage = `Error ${response.status}: ${errorText}`;
      }
    } catch {
      // Keep default error message
    }
  }

  return errorMessage;
};
