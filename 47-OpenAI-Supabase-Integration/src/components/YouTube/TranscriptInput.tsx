/**
 * YouTube URL input component
 */

import { useState, KeyboardEvent } from 'react';
import { Youtube, Loader } from 'lucide-react';

interface TranscriptInputProps {
  onFetchTranscript: (url: string) => void;
  isLoading: boolean;
}

export const TranscriptInput = ({ onFetchTranscript, isLoading }: TranscriptInputProps) => {
  const [url, setUrl] = useState('');

  const handleSubmit = () => {
    if (url.trim() && !isLoading) {
      onFetchTranscript(url);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="w-full">
      <label htmlFor="youtube-url" className="block text-sm font-medium text-slate-700 mb-2">
        YouTube Video URL
      </label>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Youtube className="h-5 w-5 text-red-600" />
          </div>
          <input
            id="youtube-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            placeholder="https://www.youtube.com/watch?v=..."
            className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={isLoading || !url.trim()}
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
        >
          {isLoading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Fetching...
            </>
          ) : (
            'Get Transcript'
          )}
        </button>
      </div>
      <p className="text-xs text-slate-500 mt-2">
        Enter a YouTube video URL to extract its transcript
      </p>
    </div>
  );
};
