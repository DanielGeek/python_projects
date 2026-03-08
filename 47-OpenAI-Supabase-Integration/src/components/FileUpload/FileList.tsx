/**
 * File list component displaying uploaded files
 */

import { File, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { formatFileSize } from '@/utils/file.utils';
import type { UploadedFile } from '@/types/file.types';

interface FileListProps {
  files: UploadedFile[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

export const FileList = ({ files, onRemove, onClearAll }: FileListProps) => {
  if (files.length === 0) return null;

  return (
    <div className="space-y-4 mb-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-900">
          Files ({files.length})
        </h3>
        <button
          onClick={onClearAll}
          className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-2">
        {files.map((uploadedFile) => (
          <FileItem
            key={uploadedFile.id}
            file={uploadedFile}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
};

interface FileItemProps {
  file: UploadedFile;
  onRemove: (id: string) => void;
}

const FileItem = ({ file, onRemove }: FileItemProps) => {
  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
      <File className="w-5 h-5 text-slate-400 flex-shrink-0" />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 truncate">
          {file.file.name}
        </p>
        <p className="text-xs text-slate-500">
          {formatFileSize(file.file.size)}
        </p>
        {file.error && (
          <p className="text-xs text-red-600 mt-1">{file.error}</p>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <FileStatusIcon status={file.status} />
        {file.status !== 'uploading' && (
          <button
            onClick={() => onRemove(file.id)}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Remove file"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

const FileStatusIcon = ({ status }: { status: UploadedFile['status'] }) => {
  switch (status) {
    case 'uploading':
      return <Loader className="w-5 h-5 text-blue-600 animate-spin" />;
    case 'success':
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case 'error':
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    default:
      return null;
  }
};
