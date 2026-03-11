/**
 * Reusable Navbar component for protected pages
 */

import { LogOut, User, MessageSquare, Upload, Video } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) {
      navigate('/login');
    }
  };

  return (
    <div className="w-full bg-white border-b border-slate-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* User info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">
              {user?.user_metadata?.full_name || user?.email || 'User'}
            </p>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/chat')}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
              location.pathname === '/chat'
                ? 'bg-blue-100 text-blue-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Chat
          </button>
          <button
            onClick={() => navigate('/transcript')}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
              location.pathname === '/transcript'
                ? 'bg-blue-100 text-blue-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Video className="w-4 h-4" />
            Transcript
          </button>
          <button
            onClick={() => navigate('/upload')}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
              location.pathname === '/upload'
                ? 'bg-blue-100 text-blue-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};
