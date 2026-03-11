/**
 * Login page component
 */

import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from '@/components/Auth/LoginForm';
import type { SignInCredentials } from '@/types/auth.types';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn, loading, error, clearError } = useAuth();

  const handleLogin = async (credentials: SignInCredentials) => {
    const result = await signIn(credentials);
    
    if (result.success) {
      navigate('/chat');
    }
  };

  const handleSwitchToSignup = () => {
    clearError();
    navigate('/signup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 mb-4">
              <LogIn className="w-7 h-7 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-slate-600">
              Sign in to your account to continue
            </p>
          </div>

          {/* Login Form */}
          <LoginForm
            onSubmit={handleLogin}
            onSwitchToSignup={handleSwitchToSignup}
            loading={loading}
            error={error?.message || null}
          />
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-600 mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};
