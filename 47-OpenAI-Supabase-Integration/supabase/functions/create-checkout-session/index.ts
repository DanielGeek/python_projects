import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    const userEmail = user.email

    const { data: userLimits } = await supabaseClient
      .from('user_limits')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    let customerId = userLimits?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          supabase_user_id: user.id,
        },
      })
      customerId = customer.id

      await supabaseClient
        .from('user_limits')
        .upsert({
          user_id: user.id,
          stripe_customer_id: customerId,
          documents_used: 0,
          transcripts_used: 0,
          documents_limit: 3,
          transcripts_limit: 3,
          is_pro: false,
        })
    }

    const origin = req.headers.get('origin') || 'http://localhost:5173'

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: 'price_1T9xv8IYCNHVwUcqFTvkSOvR',
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment-cancel`,
      metadata: {
        supabase_user_id: user.id,
      },
    })

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
