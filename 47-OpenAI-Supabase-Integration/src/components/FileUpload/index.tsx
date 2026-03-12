/**
 * Main FileUploader component - refactored with modular architecture
 * Following React and clean code best practices
 */

import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { MainLayout } from '@/components/Layout';
import { DropZone } from './DropZone';
import { FileList } from './FileList';
import { UploadButton } from './UploadButton';
import { SuccessMessage } from './SuccessMessage';
import { LimitReached } from '@/components/Limits';
import { UpgradeModal } from '@/components/Modals';

export const FileUploader = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const {
    files,
    isUploading,
    hasValidFiles,
    hasUploadedFiles,
    processFiles,
    uploadAllFiles,
    removeFile,
    clearAllFiles,
    limits,
    canPerformAction,
  } = useFileUpload();

  const handleFilesWithLimitCheck = (files: FileList) => {
    // Check if user has reached limit before processing files
    if (limits?.documents.hasReachedLimit) {
      setShowUpgradeModal(true);
      return;
    }
    processFiles(files);
  };

  const { isDragging, handleDragOver, handleDragLeave, handleDrop } =
    useDragAndDrop(handleFilesWithLimitCheck);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFilesWithLimitCheck(e.target.files);
    }
  };

  const handleBrowseClick = () => {
    // Check limit before opening file picker
    if (limits?.documents.hasReachedLimit) {
      setShowUpgradeModal(true);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleRemoveFile = (id: string) => {
    removeFile(id);
    
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
    <MainLayout>
      <div className="max-w-3xl mx-auto w-full">
        {/* Page Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 mb-4 shadow-lg shadow-blue-500/30">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
            Upload Documents
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Upload your TXT, PDF, or CSV files to analyze with AI
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

        {/* Show limit reached message if user has reached document limit */}
        {limits?.documents.hasReachedLimit ? (
          <LimitReached
            type="documents"
            used={limits.documents.used}
            limit={limits.documents.limit}
            onUpgradeClick={() => setShowUpgradeModal(true)}
          />
        ) : (
          <>
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
          </>
        )}

        {/* Upgrade Modal */}
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          featureType="documents"
        />
      </div>
    </MainLayout>
  );
};

export default FileUploader;
