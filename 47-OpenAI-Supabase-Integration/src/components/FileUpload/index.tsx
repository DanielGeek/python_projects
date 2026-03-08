/**
 * Main FileUploader component - refactored with modular architecture
 * Following React and clean code best practices
 */

import { useRef } from 'react';
import { Cloud } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { Navbar } from '@/components/Navbar';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Navbar */}
      <Navbar />

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 mb-4">
              <Cloud className="w-7 h-7 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">File Upload</h1>
            <p className="text-lg text-slate-600">
              Upload your TXT, PDF, or CSV files securely
            </p>
          </div>

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
    </div>
  );
};

export default FileUploader;
