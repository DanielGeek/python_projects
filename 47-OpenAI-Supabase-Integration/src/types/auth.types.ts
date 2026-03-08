/**
 * Type definitions for authentication
 */

import type { User, Session } from '@supabase/supabase-js';

export interface AuthUser extends User {}

export interface AuthSession extends Session {}

export interface SignUpCredentials {
  email: string;
  password: string;
  fullName?: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface AuthError {
  message: string;
  status?: number;
}

export interface AuthState {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  error: AuthError | null;
}
