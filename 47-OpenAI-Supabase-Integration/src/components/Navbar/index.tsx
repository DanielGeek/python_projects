/**
 * Modern responsive navbar component with mobile menu
 */

import { LogOut, User, MessageSquare, Upload, Video, Menu, X, Sparkles, History, Sun, Moon, Infinity, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { useUserLimits } from '@/hooks/useUserLimits';

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { limits } = useUserLimits();

  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) {
      navigate('/login');
    }
    setMobileMenuOpen(false);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { path: '/chat', icon: MessageSquare, label: 'Chat' },
    { path: '/transcript', icon: Video, label: 'Transcripts' },
    { path: '/upload', icon: Upload, label: 'Upload' },
    { path: '/history', icon: History, label: 'History' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50 shadow-sm overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 w-full">
          {/* Logo and Brand */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                DocuChat AI
              </h1>
            </div>
          </div>

          {/* Usage Counters - Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <Upload className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Documents</span>
              <div className="flex items-center gap-0.5">
                <span className={`text-xs font-bold ${limits?.documents.hasReachedLimit ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                  {limits?.documents.used ?? 0}
                </span>
                <span className="text-slate-400 dark:text-slate-500 text-xs">/</span>
                {limits?.isPro || limits?.documents.limit === -1 ? (
                  <Infinity className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                ) : (
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{limits?.documents.limit ?? 3}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <Video className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Transcripts</span>
              <div className="flex items-center gap-0.5">
                <span className={`text-xs font-bold ${limits?.transcripts.hasReachedLimit ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                  {limits?.transcripts.used ?? 0}
                </span>
                <span className="text-slate-400 dark:text-slate-500 text-xs">/</span>
                {limits?.isPro || limits?.transcripts.limit === -1 ? (
                  <Infinity className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                ) : (
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{limits?.transcripts.limit ?? 3}</span>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2 flex-1 justify-center mr-6 ml-2">
            {navItems.map(({ path, icon: Icon, label }) => (
              <button
                key={path}
                onClick={() => handleNavigate(path)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  location.pathname === path
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* User Menu & Mobile Toggle */}
          <div className="flex items-center gap-3">
            {/* Pro Badge - Desktop */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg shadow-lg shadow-amber-500/30">
              <Zap className="w-4 h-4 text-white" />
              <span className="text-sm font-bold text-white">Pro</span>
            </div>

            {/* Dark Mode Toggle - Desktop */}
            <button
              onClick={toggleDarkMode}
              className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              )}
            </button>

            {/* User Avatar - Desktop */}
            <div className="hidden md:flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-slate-900 dark:text-white max-w-[150px] truncate">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[150px] truncate">{user?.email}</p>
              </div>
            </div>

            {/* Logout - Desktop */}
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div className="px-4 py-3 space-y-1">
            {/* User Info - Mobile */}
            <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-lg bg-slate-50 dark:bg-slate-800">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
              </div>
              {/* Pro Badge - Mobile */}
              <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-md shadow-lg shadow-amber-500/30">
                <Zap className="w-3 h-3 text-white" />
                <span className="text-xs font-bold text-white">Pro</span>
              </div>
            </div>

            {/* Usage Counters - Mobile */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="flex flex-col gap-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-1">
                  <Upload className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Documents</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-sm font-bold ${limits?.documents.hasReachedLimit ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                    {limits?.documents.used ?? 0}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 text-xs">/</span>
                  {limits?.isPro || limits?.documents.limit === -1 ? (
                    <Infinity className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                  ) : (
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{limits?.documents.limit ?? 3}</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-1">
                  <Video className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Transcripts</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-sm font-bold ${limits?.transcripts.hasReachedLimit ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                    {limits?.transcripts.used ?? 0}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 text-xs">/</span>
                  {limits?.isPro || limits?.transcripts.limit === -1 ? (
                    <Infinity className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                  ) : (
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{limits?.transcripts.limit ?? 3}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Dark Mode Toggle - Mobile */}
            <button
              onClick={toggleDarkMode}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-200 mb-2"
            >
              <div className="flex items-center gap-3">
                {isDarkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
                <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </div>
            </button>

            {/* Navigation Items - Mobile */}
            {navItems.map(({ path, icon: Icon, label }) => (
              <button
                key={path}
                onClick={() => handleNavigate(path)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  location.pathname === path
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}

            {/* Logout - Mobile */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 mt-2"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
