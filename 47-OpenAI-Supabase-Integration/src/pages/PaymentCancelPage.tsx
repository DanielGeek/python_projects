/**
 * Payment Cancel Page
 * Displayed when user cancels Stripe payment
 */

import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';
import { MainLayout } from '@/components/Layout';

export const PaymentCancelPage = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto w-full py-12">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 text-center">
          {/* Cancel Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
              <XCircle className="w-12 h-12 text-slate-400 dark:text-slate-500" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
            Payment Cancelled
          </h1>

          {/* Description */}
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
            Your payment was cancelled. No charges were made to your account.
          </p>

          {/* Info Box */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-6 mb-6">
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              You can still use the free tier with:
            </p>
            <ul className="text-left space-y-2 max-w-md mx-auto">
              <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>3 document uploads</span>
              </li>
              <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>3 transcript extractions</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/upload')}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Continue with Free Tier</span>
            </button>
          </div>

          {/* Upgrade later message */}
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-6">
            You can upgrade to Pro anytime from your account settings.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};
