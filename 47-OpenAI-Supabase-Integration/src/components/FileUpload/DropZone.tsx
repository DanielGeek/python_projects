/**
 * Drop zone component for file upload
 */

import { Cloud } from 'lucide-react';
import { UI, FILE_UPLOAD } from '@/config/constants';

interface DropZoneProps {
  isDragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onBrowseClick: () => void;
}

export const DropZone = ({
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onBrowseClick,
}: DropZoneProps) => {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`relative border-2 border-dashed rounded-2xl p-8 mb-8 transition-all duration-300 ${
        isDragging
          ? 'border-blue-500 bg-blue-50'
          : 'border-slate-300 bg-white hover:border-slate-400'
      }`}
    >
      <div className="text-center">
        <Cloud className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-900 mb-2">
          {UI.DRAG_DROP_TEXT}
        </h2>
        <p className="text-slate-600 mb-4">or</p>
        <button
          onClick={onBrowseClick}
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
        >
          {UI.BROWSE_FILES_TEXT}
        </button>
        <p className="text-sm text-slate-500 mt-4">
          Supported formats: {FILE_UPLOAD.ALLOWED_TYPES.join(', ')} (Max{' '}
          {FILE_UPLOAD.MAX_FILE_SIZE_MB}MB per file)
        </p>
      </div>
    </div>
  );
};
