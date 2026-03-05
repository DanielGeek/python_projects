import { useState, useRef } from 'react';
import { Cloud, CheckCircle, AlertCircle, File, Loader } from 'lucide-react';

interface UploadedFile {
  file: File;
  id: string;
  status: 'idle' | 'uploading' | 'success' | 'error';
  error?: string;
}

export default function FileUploader() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const ALLOWED_TYPES = ['.txt', '.pdf', '.csv'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

  const validateFile = (file: File): string | null => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_TYPES.includes(extension)) {
      return `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(', ')}`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds 10MB limit`;
    }
    return null;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFiles = (fileList: FileList) => {
    const newFiles: UploadedFile[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const error = validateFile(file);
      newFiles.push({
        file,
        id: `${Date.now()}-${i}`,
        status: error ? 'error' : 'idle',
        error: error ?? undefined,
      });
    }
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const uploadFile = async (uploadedFile: UploadedFile) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === uploadedFile.id ? { ...f, status: 'uploading' } : f
      )
    );

    try {
      const formData = new FormData();
      formData.append('data', uploadedFile.file);
      formData.append('filename', uploadedFile.file.name);
      formData.append('fileType', uploadedFile.file.type);
      formData.append('fileSize', uploadedFile.file.size.toString());
      formData.append('timestamp', new Date().toISOString());
      formData.append('userId', 'USR' + Math.random().toString(36).substr(2, 9).toUpperCase());

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        // Try to parse error response as JSON
        let errorMessage = `Upload failed (${response.status} ${response.statusText})`;
        
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = `Error ${response.status}: ${errorData.message}`;
          } else if (errorData.error) {
            errorMessage = `Error ${response.status}: ${errorData.error}`;
          }
        } catch {
          // If JSON parsing fails, try to get text
          try {
            const errorText = await response.text();
            if (errorText) {
              errorMessage = `Error ${response.status}: ${errorText}`;
            }
          } catch {
            // Keep default error message
          }
        }
        
        throw new Error(errorMessage);
      }

      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadedFile.id ? { ...f, status: 'success' } : f
        )
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadedFile.id
            ? { ...f, status: 'error', error: errorMessage }
            : f
        )
      );
    }
  };

  const handleUploadAll = async () => {
    const validFiles = files.filter((f) => f.status === 'idle' && !f.error);
    if (validFiles.length === 0) return;

    setIsUploading(true);
    for (const file of validFiles) {
      await uploadFile(file);
    }
    setIsUploading(false);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const newFiles = prev.filter((f) => f.id !== id);
      // Reset file input when removing the last file
      if (newFiles.length === 0 && fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return newFiles;
    });
  };

  const clearAll = () => {
    setFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const hasValidFiles = files.some((f) => f.status === 'idle' && !f.error);
  const hasUploadedFiles = files.some((f) => f.status === 'success');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 mb-4">
            <Cloud className="w-7 h-7 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">File Upload</h1>
          <p className="text-lg text-slate-600">Upload your TXT, PDF, or CSV files securely</p>
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-8 mb-8 transition-all duration-300 ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-slate-300 bg-white hover:border-slate-400'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".txt,.pdf,.csv"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="text-center">
            <Cloud className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Drag and drop your files here
            </h2>
            <p className="text-slate-600 mb-4">or</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
            >
              Browse Files
            </button>
            <p className="text-sm text-slate-500 mt-4">
              Supported formats: TXT, PDF, CSV (Max 10MB per file)
            </p>
          </div>
        </div>

        {files.length > 0 && (
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-900">
                Files ({files.length})
              </h3>
              {files.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="space-y-2">
              {files.map((uploadedFile) => (
                <div
                  key={uploadedFile.id}
                  className="flex items-center gap-3 p-4 bg-white rounded-lg border border-slate-200 hover:shadow-md transition-shadow"
                >
                  <File className="w-5 h-5 text-slate-400 flex-shrink-0" />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {uploadedFile.file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(uploadedFile.file.size / 1024).toFixed(2)} KB
                    </p>
                    {uploadedFile.error && (
                      <p className="text-xs text-red-600 mt-1">{uploadedFile.error}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {uploadedFile.status === 'uploading' && (
                      <Loader className="w-5 h-5 text-blue-600 animate-spin" />
                    )}
                    {uploadedFile.status === 'success' && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                    {uploadedFile.status === 'error' && (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}

                    {uploadedFile.status !== 'uploading' && (
                      <button
                        onClick={() => removeFile(uploadedFile.id)}
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
              ))}
            </div>
          </div>
        )}

        {hasValidFiles && (
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleUploadAll}
              disabled={isUploading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-slate-400 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Cloud className="w-5 h-5" />
                  Upload Files
                </>
              )}
            </button>
          </div>
        )}

        {hasUploadedFiles && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">Upload successful!</p>
                <p className="text-sm text-green-700">
                  Your files have been sent to n8n for processing.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
