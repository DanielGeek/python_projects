/**
 * Signup page component
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { SignupForm } from '@/components/Auth/SignupForm';
import type { SignUpCredentials } from '@/types/auth.types';

export const SignupPage = () => {
  const navigate = useNavigate();
  const { signUp, loading, error, clearError } = useAuth();
  const [success, setSuccess] = useState(false);

  const handleSignup = async (credentials: SignUpCredentials) => {
    const result = await signUp(credentials);
    
    if (result.success) {
      setSuccess(true);
    }
  };

  const handleSwitchToLogin = () => {
    clearError();
    setSuccess(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 mb-4">
              <UserPlus className="w-7 h-7 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Create Account
            </h1>
            <p className="text-slate-600">
              Sign up to get started with file uploads
            </p>
          </div>

          {/* Signup Form */}
          <SignupForm
            onSubmit={handleSignup}
            onSwitchToLogin={handleSwitchToLogin}
            loading={loading}
            error={error?.message || null}
            success={success}
          />
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-600 mt-6">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};
