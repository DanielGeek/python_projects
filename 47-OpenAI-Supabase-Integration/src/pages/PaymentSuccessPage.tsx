/**
 * Payment Success Page
 * Displayed after successful Stripe payment
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Zap } from 'lucide-react';
import { MainLayout } from '@/components/Layout';

export const PaymentSuccessPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Refresh the page after 3 seconds to update limits
    const timer = setTimeout(() => {
      window.location.reload();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto w-full py-12">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
            Welcome to Pro! 🎉
          </h1>

          {/* Description */}
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
            Your payment was successful. You now have unlimited access to all features!
          </p>

          {/* Features */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Zap className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Pro Features Unlocked
              </h2>
            </div>
            <ul className="text-left space-y-2 max-w-md mx-auto">
              <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Unlimited document uploads</span>
              </li>
              <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Unlimited transcript extractions</span>
              </li>
              <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Priority processing</span>
              </li>
              <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Advanced AI features</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/upload')}
              className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
            >
              Upload Documents
            </button>
            <button
              onClick={() => navigate('/transcript')}
              className="px-6 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-lg transition-colors"
            >
              Extract Transcripts
            </button>
          </div>

          {/* Auto-redirect message */}
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-6">
            Refreshing page to update your limits...
          </p>
        </div>
      </div>
    </MainLayout>
  );
};
