/**
 * Authentication service layer for Supabase
 */

import { supabase } from '@/lib/supabase';
import type { SignUpCredentials, SignInCredentials, AuthError } from '@/types/auth.types';

/**
 * Sign up a new user with email and password
 */
export const signUp = async (credentials: SignUpCredentials) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          full_name: credentials.fullName,
        },
      },
    });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    const authError: AuthError = {
      message: error instanceof Error ? error.message : 'Failed to sign up',
    };
    return { data: null, error: authError };
  }
};

/**
 * Sign in an existing user
 */
export const signIn = async (credentials: SignInCredentials) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    const authError: AuthError = {
      message: error instanceof Error ? error.message : 'Failed to sign in',
    };
    return { data: null, error: authError };
  }
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    return { error: null };
  } catch (error) {
    const authError: AuthError = {
      message: error instanceof Error ? error.message : 'Failed to sign out',
    };
    return { error: authError };
  }
};

/**
 * Get the current session
 */
export const getSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    return { data: data.session, error: null };
  } catch (error) {
    const authError: AuthError = {
      message: error instanceof Error ? error.message : 'Failed to get session',
    };
    return { data: null, error: authError };
  }
};

/**
 * Get the current user
 */
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      throw error;
    }

    return { data: data.user, error: null };
  } catch (error) {
    const authError: AuthError = {
      message: error instanceof Error ? error.message : 'Failed to get user',
    };
    return { data: null, error: authError };
  }
};

/**
 * Reset password for a user
 */
export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      throw error;
    }

    return { error: null };
  } catch (error) {
    const authError: AuthError = {
      message: error instanceof Error ? error.message : 'Failed to reset password',
    };
    return { error: authError };
  }
};
