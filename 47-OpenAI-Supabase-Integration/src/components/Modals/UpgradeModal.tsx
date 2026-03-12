/**
 * Upgrade Modal Component
 * Displays when user tries to use a feature without available credits
 */

import { X, Zap, Check } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureType: 'documents' | 'transcripts';
}

export const UpgradeModal = ({ isOpen, onClose, featureType }: UpgradeModalProps) => {
  if (!isOpen) return null;

  const featureName = featureType === 'documents' ? 'Document Uploads' : 'Transcript Extractions';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-3">
            You've Reached Your Free Limit
          </h2>

          {/* Description */}
          <p className="text-center text-slate-600 dark:text-slate-400 mb-6">
            You've used all your free {featureName.toLowerCase()}. Upgrade to Pro to continue using this feature and unlock unlimited access!
          </p>

          {/* Pro Features */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-5 mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 text-center">
              DocuChat AI Pro
            </h3>
            
            {/* Pricing */}
            <div className="flex items-center justify-center gap-1 mb-4">
              <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">$9</span>
              <span className="text-slate-600 dark:text-slate-400">/month</span>
            </div>
            
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span><strong>Unlimited uploads</strong> - Upload as many documents as you need</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span><strong>Unlimited transcripts</strong> - Extract transcripts from any video</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span><strong>Priority processing</strong> - Faster response times</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span><strong>Advanced AI features</strong> - Access to premium models</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span><strong>Email support</strong> - Get help when you need it</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span><strong>Export formats</strong> - Download in multiple formats</span>
              </li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                // TODO: Navigate to upgrade page
                console.log('Upgrade button clicked');
              }}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Upgrade to Pro
            </button>
            <button
              onClick={onClose}
              className="w-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
