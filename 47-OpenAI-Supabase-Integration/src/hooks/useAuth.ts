/**
 * Custom hook for authentication state and actions
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { signIn, signUp, signOut } from '@/services/auth.service';
import type { AuthUser, AuthSession, SignInCredentials, SignUpCredentials, AuthError } from '@/types/auth.types';

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  /**
   * Initialize auth state
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (err) {
        setError({
          message: err instanceof Error ? err.message : 'Failed to initialize auth',
        });
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Sign up a new user
   */
  const handleSignUp = useCallback(async (credentials: SignUpCredentials) => {
    setLoading(true);
    setError(null);

    const result = await signUp(credentials);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return { success: false, error: result.error };
    }

    setLoading(false);
    return { success: true, data: result.data };
  }, []);

  /**
   * Sign in an existing user
   */
  const handleSignIn = useCallback(async (credentials: SignInCredentials) => {
    setLoading(true);
    setError(null);

    const result = await signIn(credentials);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return { success: false, error: result.error };
    }

    setLoading(false);
    return { success: true, data: result.data };
  }, []);

  /**
   * Sign out the current user
   */
  const handleSignOut = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await signOut();

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return { success: false, error: result.error };
    }

    setUser(null);
    setSession(null);
    setLoading(false);
    return { success: true };
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    session,
    loading,
    error,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    clearError,
    isAuthenticated: !!user,
  };
};
