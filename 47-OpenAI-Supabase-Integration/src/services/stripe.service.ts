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
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return { url: null, error: 'User not authenticated' };
      }

      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error creating checkout session:', error);
        return { url: null, error: error.message };
      }

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
