/**
 * History page component - displays user's saved video transcripts
 * Fetches data from Supabase transcripts table
 */

import { History as HistoryIcon, ExternalLink, Trash2, Calendar, Loader2 } from 'lucide-react';
import { MainLayout } from '@/components/Layout';
import { useTranscripts } from '@/hooks/useTranscripts';
import { getYouTubeThumbnail, formatDate } from '@/utils/youtube';
import { useState } from 'react';

export const HistoryPage = () => {
  const { transcripts, loading, error, deleteTranscript } = useTranscripts();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const hasTranscripts = transcripts.length > 0;

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transcript?')) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteTranscript(id);
    } catch (err) {
      console.error('Failed to delete transcript:', err);
      alert('Failed to delete transcript. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">Loading transcripts...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <p className="text-red-600 dark:text-red-400 font-medium mb-2">Error loading transcripts</p>
            <p className="text-red-500 dark:text-red-300 text-sm">{error}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto w-full">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2 break-words">
            Your Saved Transcripts
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 break-words">
            Access and manage all your YouTube video transcriptions
          </p>
        </div>

        {hasTranscripts ? (
          /* Transcript Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {transcripts.map((transcript) => {
              const thumbnailUrl = transcript.thumbnail_url || getYouTubeThumbnail(transcript.video_url);
              
              return (
                <div
                  key={transcript.id}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-slate-200 dark:border-slate-700"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-slate-200 dark:bg-slate-700">
                    <img
                      src={thumbnailUrl}
                      alt={transcript.video_title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/640x360?text=Video+Thumbnail';
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-3 line-clamp-2 min-h-[3rem]">
                      {transcript.video_title}
                    </h3>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <a
                        href={transcript.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Watch Video
                      </a>
                      <button
                        onClick={() => handleDelete(transcript.id)}
                        disabled={deletingId === transcript.id}
                        className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Delete transcript"
                      >
                        {deletingId === transcript.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Saved on {formatDate(transcript.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 sm:p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <HistoryIcon className="w-10 h-10 text-slate-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                No transcripts yet
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Start transcribing YouTube videos to see your history here
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="/chat"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Start Chat
                </a>
                <a
                  href="/transcript"
                  className="px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium"
                >
                  Transcribe Video
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};
