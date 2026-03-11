/**
 * Transcript display component
 */

import { FileText, Copy, Download, Check } from 'lucide-react';
import { useState } from 'react';

interface TranscriptDisplayProps {
  transcript: string;
  videoTitle?: string | null;
  onClear: () => void;
}

export const TranscriptDisplay = ({ transcript, videoTitle, onClear }: TranscriptDisplayProps) => {
  const [copied, setCopied] = useState(false);
  const [showFullTranscript, setShowFullTranscript] = useState(false);

  const MAX_PREVIEW_LENGTH = 1000;
  const isTruncated = transcript.length > MAX_PREVIEW_LENGTH;
  const displayText = showFullTranscript || !isTruncated 
    ? transcript 
    : transcript.substring(0, MAX_PREVIEW_LENGTH);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${videoTitle || 'transcript'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
                {videoTitle || 'Video Transcript'}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {transcript.length.toLocaleString()} characters
              </p>
            </div>
          </div>
        
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-green-600 dark:text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={onClear}
              className="px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Transcript Content */}
      <div className="p-6">
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 max-h-[500px] overflow-y-auto">
          <pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
            {displayText}
          </pre>
          
          {isTruncated && !showFullTranscript && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 italic mb-3">
                ... (Text truncated - {transcript.length.toLocaleString()} total characters)
              </p>
              <button
                onClick={() => setShowFullTranscript(true)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                Show full transcript
              </button>
            </div>
          )}
          
          {isTruncated && showFullTranscript && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setShowFullTranscript(false)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                Show less
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
