/**
 * Upload button component
 */

import { Cloud, Loader } from 'lucide-react';
import { UI } from '@/config/constants';

interface UploadButtonProps {
  isUploading: boolean;
  onClick: () => void;
}

export const UploadButton = ({ isUploading, onClick }: UploadButtonProps) => {
  return (
    <div className="flex gap-3 justify-center">
      <button
        onClick={onClick}
        disabled={isUploading}
        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-slate-400 transition-colors duration-200 flex items-center justify-center gap-2"
      >
        {isUploading ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            {UI.UPLOADING_TEXT}
          </>
        ) : (
          <>
            <Cloud className="w-5 h-5" />
            {UI.UPLOAD_BUTTON_TEXT}
          </>
        )}
      </button>
    </div>
  );
};
