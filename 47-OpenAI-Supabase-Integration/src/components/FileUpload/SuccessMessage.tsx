/**
 * Success message component
 */

import { CheckCircle } from 'lucide-react';
import { UI } from '@/config/constants';

export const SuccessMessage = () => {
  return (
    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex gap-2">
        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-green-900">{UI.SUCCESS_MESSAGE}</p>
          <p className="text-sm text-green-700">{UI.SUCCESS_DESCRIPTION}</p>
        </div>
      </div>
    </div>
  );
};
