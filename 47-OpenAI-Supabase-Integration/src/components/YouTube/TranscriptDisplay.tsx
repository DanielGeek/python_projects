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
    <div className="w-full bg-white rounded-lg border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {videoTitle || 'Video Transcript'}
            </h3>
            <p className="text-sm text-slate-500">
              {transcript.split('\n').length} lines • {transcript.length} characters
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-green-600">Copied!</span>
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
            className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            onClick={onClear}
            className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Transcript Content */}
      <div className="p-6">
        <div className="bg-slate-50 rounded-lg p-4 max-h-[500px] overflow-y-auto">
          <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
            {transcript}
          </pre>
        </div>
      </div>
    </div>
  );
};
