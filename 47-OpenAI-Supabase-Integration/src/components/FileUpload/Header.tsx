/**
 * Header component with user info and logout
 */

import { Cloud, LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) {
      navigate('/login');
    }
  };

  return (
    <div className="mb-8">
      {/* User info bar */}
      {user && (
        <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">
                {user.user_metadata?.full_name || user.email}
              </p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}

      {/* Title */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 mb-4">
          <Cloud className="w-7 h-7 text-blue-600" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">File Upload</h1>
        <p className="text-lg text-slate-600">
          Upload your TXT, PDF, or CSV files securely
        </p>
      </div>
    </div>
  );
};
