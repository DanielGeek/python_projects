/**
 * Custom hook for file upload functionality
 */

import { useState, useCallback } from 'react';
import { validateFile, generateFileId } from '@/utils/file.utils';
import { uploadFileToWebhook } from '@/services/upload.service';
import { useAuth } from '@/hooks/useAuth';
import { useUserLimits } from '@/hooks/useUserLimits';
import type { UploadedFile } from '@/types/file.types';

export const useFileUpload = () => {
  const { user } = useAuth();
  const { limits, incrementUsage, canPerformAction } = useUserLimits();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  /**
   * Processes and validates files from FileList
   */
  const processFiles = useCallback((fileList: FileList) => {
    const newFiles: UploadedFile[] = [];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const validation = validateFile(file);
      
      newFiles.push({
        file,
        id: generateFileId(i),
        status: validation.isValid ? 'idle' : 'error',
        error: validation.error,
      });
    }
    
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  /**
   * Uploads a single file
   */
  const uploadFile = useCallback(async (uploadedFile: UploadedFile) => {
    if (!user?.id) {
      console.error('No user ID available for upload');
      return;
    }

    setFiles((prev) =>
      prev.map((f) =>
        f.id === uploadedFile.id ? { ...f, status: 'uploading' } : f
      )
    );

    const result = await uploadFileToWebhook(uploadedFile.file, user.id);

    setFiles((prev) =>
      prev.map((f) =>
        f.id === uploadedFile.id
          ? {
              ...f,
              status: result.success ? 'success' : 'error',
              error: result.success ? undefined : result.message,
            }
          : f
      )
    );

    // Increment usage counter if upload was successful
    if (result.success) {
      await incrementUsage('documents');
    }
  }, [user, incrementUsage]);

  /**
   * Uploads all valid files
   */
  const uploadAllFiles = useCallback(async () => {
    const validFiles = files.filter((f) => f.status === 'idle' && !f.error);
    if (validFiles.length === 0) return;

    setIsUploading(true);
    
    for (const file of validFiles) {
      await uploadFile(file);
    }
    
    setIsUploading(false);
  }, [files, uploadFile]);

  /**
   * Removes a file from the list
   */
  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  /**
   * Clears all files
   */
  const clearAllFiles = useCallback(() => {
    setFiles([]);
  }, []);

  /**
   * Computed values
   */
  const hasValidFiles = files.some((f) => f.status === 'idle' && !f.error);
  const hasUploadedFiles = files.some((f) => f.status === 'success');

  return {
    files,
    isUploading,
    hasValidFiles,
    hasUploadedFiles,
    processFiles,
    uploadFile,
    uploadAllFiles,
    removeFile,
    clearAllFiles,
    limits,
    canPerformAction,
  };
};
