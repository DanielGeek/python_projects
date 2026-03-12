/**
 * Stripe Service
 * Handles Stripe payment integration
 */

import { supabase } from '@/lib/supabase';

export const stripeService = {
  /**
   * Create a Stripe Checkout session and redirect to payment page
   */
  async createCheckoutSession(): Promise<{ url: string | null; error: string | null }> {
    try {
      // Refresh session to ensure we have a valid token
      const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();
      
      if (sessionError || !session) {
        console.error('Session error:', sessionError);
        return { url: null, error: 'User not authenticated. Please log in again.' };
      }

      console.log('Session obtained, user:', session.user.email);

      // Get Supabase URL from environment
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const functionUrl = `${supabaseUrl}/functions/v1/create-checkout-session`;

      console.log('Calling Edge Function:', functionUrl);

      // Call the Edge Function with fetch to ensure proper headers
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Error creating checkout session:', errorData);
        return { url: null, error: errorData.message || `HTTP ${response.status}` };
      }

      const data = await response.json();

      if (!data?.url) {
        return { url: null, error: 'No checkout URL returned' };
      }

      return { url: data.url, error: null };
    } catch (err) {
      console.error('Unexpected error:', err);
      return { 
        url: null, 
        error: err instanceof Error ? err.message : 'Failed to create checkout session' 
      };
    }
  },

  /**
   * Redirect user to Stripe Checkout
   */
  async redirectToCheckout(): Promise<void> {
    const { url, error } = await this.createCheckoutSession();

    if (error) {
      throw new Error(error);
    }

    if (url) {
      // Redirect to Stripe Checkout
      window.location.href = url;
    }
  },
};
