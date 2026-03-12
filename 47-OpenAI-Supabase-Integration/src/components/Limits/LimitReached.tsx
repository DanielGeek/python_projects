/**
 * Component to display when user has reached their usage limit
 */

import { AlertCircle, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LimitReachedProps {
  type: 'documents' | 'transcripts';
  used: number;
  limit: number;
}

export const LimitReached = ({ type, used, limit }: LimitReachedProps) => {
  const navigate = useNavigate();

  const messages = {
    documents: {
      title: 'Document Upload Limit Reached',
      description: `You've used all ${limit} of your free document uploads.`,
    },
    transcripts: {
      title: 'Transcript Extraction Limit Reached',
      description: `You've used all ${limit} of your free transcript extractions.`,
    },
  };

  const message = messages[type];

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-700 rounded-2xl p-6 sm:p-8">
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/40 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
        </div>
        
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
          {message.title}
        </h3>
        
        <p className="text-slate-600 dark:text-slate-400 mb-1">
          {message.description}
        </p>
        
        <div className="flex items-center gap-2 mb-6">
          <div className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/40 rounded-full">
            <span className="text-sm font-bold text-yellow-700 dark:text-yellow-300">
              {used} / {limit} used
            </span>
          </div>
        </div>

        <div className="w-full max-w-md space-y-3">
          <button
            onClick={() => navigate('/pricing')}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg font-semibold shadow-lg shadow-yellow-500/30 transition-all duration-200"
          >
            <Zap className="w-5 h-5" />
            Upgrade to Pro for Unlimited Access
          </button>
          
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pro plan includes unlimited uploads, transcripts, and priority support
          </p>
        </div>
      </div>
    </div>
  );
};
