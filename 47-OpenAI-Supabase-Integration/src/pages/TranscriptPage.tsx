/**
 * YouTube Transcript page component
 */

import { Video, AlertCircle } from 'lucide-react';
import { useYouTubeTranscript } from '@/hooks/useYouTubeTranscript';
import { Navbar } from '@/components/Navbar';
import { TranscriptInput } from '@/components/YouTube/TranscriptInput';
import { TranscriptDisplay } from '@/components/YouTube/TranscriptDisplay';

export const TranscriptPage = () => {
  const {
    transcript,
    videoTitle,
    isLoading,
    error,
    getTranscript,
    clearTranscript,
    clearError,
  } = useYouTubeTranscript();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <Navbar />

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-100 mb-4">
              <Video className="w-7 h-7 text-red-600" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              YouTube Transcript Extractor
            </h1>
            <p className="text-lg text-slate-600">
              Extract transcripts from any YouTube video instantly
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800 mb-2">{error}</p>
                  
                  {/* Show helpful suggestions for transcript unavailable errors */}
                  {error.toLowerCase().includes('transcript is not available') && (
                    <div className="mt-3 p-3 bg-white rounded border border-red-100">
                      <p className="text-xs font-semibold text-slate-700 mb-2">💡 Possible reasons:</p>
                      <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                        <li>The video doesn't have captions/subtitles enabled</li>
                        <li>The video is private or age-restricted</li>
                        <li>Transcripts are disabled by the video owner</li>
                        <li>The video is too new (transcripts may take time to generate)</li>
                      </ul>
                      <p className="text-xs text-slate-700 mt-3 font-medium">
                        ✓ Try a different video with captions enabled
                      </p>
                    </div>
                  )}
                  
                  <button
                    onClick={clearError}
                    className="text-xs text-red-600 hover:text-red-700 underline mt-2"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Input Section */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
            <TranscriptInput onFetchTranscript={getTranscript} isLoading={isLoading} />
          </div>

          {/* Transcript Display */}
          {transcript && (
            <TranscriptDisplay
              transcript={transcript}
              videoTitle={videoTitle}
              onClear={clearTranscript}
            />
          )}

          {/* Empty State */}
          {!transcript && !isLoading && !error && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                <Video className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No transcript yet
              </h3>
              <p className="text-slate-600 max-w-md mx-auto">
                Enter a YouTube video URL above to extract its transcript. The transcript will
                appear here once processed.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
