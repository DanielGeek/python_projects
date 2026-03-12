import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const cryptoProvider = Stripe.createSubtleCryptoProvider()

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

  if (!signature || !webhookSecret) {
    return new Response('Missing signature or webhook secret', { status: 400 })
  }

  try {
    const body = await req.text()
    
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    )

    console.log('Webhook event type:', event.type)

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.supabase_user_id
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string

        if (!userId) {
          console.error('No user ID in session metadata')
          break
        }

        // Fetch subscription details to get the end date
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const subscriptionEndDate = new Date(subscription.current_period_end * 1000).toISOString()

        const { error } = await supabaseAdmin
          .from('user_limits')
          .update({
            is_pro: true,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            subscription_status: 'active',
            subscription_end_date: subscriptionEndDate,
            documents_limit: -1,
            transcripts_limit: -1,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)

        if (error) {
          console.error('Error updating user limits:', error)
        } else {
          console.log('User upgraded to Pro:', userId)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const { data: userLimits } = await supabaseAdmin
          .from('user_limits')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!userLimits) {
          console.error('No user found for customer:', customerId)
          break
        }

        const { error } = await supabaseAdmin
          .from('user_limits')
          .update({
            subscription_status: subscription.status,
            subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
            is_pro: subscription.status === 'active',
            documents_limit: subscription.status === 'active' ? -1 : 3,
            transcripts_limit: subscription.status === 'active' ? -1 : 3,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userLimits.user_id)

        if (error) {
          console.error('Error updating subscription:', error)
        } else {
          console.log('Subscription updated:', subscription.id)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const { data: userLimits } = await supabaseAdmin
          .from('user_limits')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!userLimits) {
          console.error('No user found for customer:', customerId)
          break
        }

        const { error } = await supabaseAdmin
          .from('user_limits')
          .update({
            is_pro: false,
            subscription_status: 'canceled',
            documents_limit: 3,
            transcripts_limit: 3,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userLimits.user_id)

        if (error) {
          console.error('Error downgrading user:', error)
        } else {
          console.log('User downgraded to free tier:', userLimits.user_id)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const { data: userLimits } = await supabaseAdmin
          .from('user_limits')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!userLimits) {
          console.error('No user found for customer:', customerId)
          break
        }

        await supabaseAdmin
          .from('user_limits')
          .update({
            subscription_status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userLimits.user_id)

        console.log('Payment failed for user:', userLimits.user_id)
        break
      }

      default:
        console.log('Unhandled event type:', event.type)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Webhook error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
