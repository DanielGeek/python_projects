/**
 * Main FileUploader component - refactored with modular architecture
 * Following React and clean code best practices
 */

import { useRef } from 'react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { Header } from './Header';
import { DropZone } from './DropZone';
import { FileList } from './FileList';
import { UploadButton } from './UploadButton';
import { SuccessMessage } from './SuccessMessage';

export const FileUploader = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    files,
    isUploading,
    hasValidFiles,
    hasUploadedFiles,
    processFiles,
    uploadAllFiles,
    removeFile,
    clearAllFiles,
  } = useFileUpload();

  const { isDragging, handleDragOver, handleDragLeave, handleDrop } =
    useDragAndDrop(processFiles);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = (id: string) => {
    removeFile(id);
    
    // Reset input if no files remain
    if (files.length === 1 && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearAll = () => {
    clearAllFiles();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header with user info */}
        <Header />

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".txt,.pdf,.csv"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Drop zone */}
        <DropZone
          isDragging={isDragging}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onBrowseClick={handleBrowseClick}
        />

        {/* File list */}
        <FileList
          files={files}
          onRemove={handleRemoveFile}
          onClearAll={handleClearAll}
        />

        {/* Upload button */}
        {hasValidFiles && (
          <UploadButton isUploading={isUploading} onClick={uploadAllFiles} />
        )}

        {/* Success message */}
        {hasUploadedFiles && <SuccessMessage />}
      </div>
    </div>
  );
};

export default FileUploader;
