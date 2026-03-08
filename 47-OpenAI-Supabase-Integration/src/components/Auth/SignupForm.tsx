/**
 * Signup form component
 */

import { useState } from 'react';
import { Mail, Lock, User, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import type { SignUpCredentials } from '@/types/auth.types';

interface SignupFormProps {
  onSubmit: (credentials: SignUpCredentials) => Promise<void>;
  onSwitchToLogin: () => void;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export const SignupForm = ({ onSubmit, onSwitchToLogin, loading, error, success }: SignupFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Validate password match
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }

    await onSubmit({ email, password, fullName });
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900">Check your email!</h3>
        <p className="text-slate-600">
          We've sent you a confirmation email. Please check your inbox and click the link to verify your account.
        </p>
        <button
          onClick={onSwitchToLogin}
          className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
        >
          Back to login
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-2">
          Full Name
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={loading}
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed transition-colors"
            placeholder="John Doe"
          />
        </div>
      </div>

      <div>
        <label htmlFor="signup-email" className="block text-sm font-medium text-slate-700 mb-2">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed transition-colors"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="signup-password" className="block text-sm font-medium text-slate-700 mb-2">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed transition-colors"
            placeholder="••••••••"
          />
        </div>
        <p className="mt-1 text-xs text-slate-500">Must be at least 6 characters</p>
      </div>

      <div>
        <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700 mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed transition-colors"
            placeholder="••••••••"
          />
        </div>
      </div>

      {(error || validationError) && (
        <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error || validationError}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            Creating account...
          </>
        ) : (
          'Create Account'
        )}
      </button>

      <div className="text-center">
        <p className="text-sm text-slate-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            disabled={loading}
            className="text-blue-600 font-medium hover:text-blue-700 disabled:text-slate-400 transition-colors"
          >
            Sign in
          </button>
        </p>
      </div>
    </form>
  );
};
