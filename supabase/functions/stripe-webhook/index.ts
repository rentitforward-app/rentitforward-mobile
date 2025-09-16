import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Stripe webhook received')

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // Get the webhook signature
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      console.error('No Stripe signature found')
      return new Response('No signature', { status: 400 })
    }

    // Get the raw body
    const body = await req.text()
    
    // Verify the webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return new Response('Invalid signature', { status: 400 })
    }

    console.log('Webhook event type:', event.type)

    // Initialize Supabase client with service role
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SERVICE_ROLE_KEY') ?? '',
      {
        auth: { persistSession: false },
      }
    )

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log('Checkout session completed:', session.id)

        // Get booking ID from metadata
        const bookingId = session.metadata?.bookingId
        if (!bookingId) {
          console.error('No booking ID found in session metadata')
          return new Response('No booking ID', { status: 400 })
        }

        console.log('Updating booking status for booking:', bookingId)

        // Update booking status to confirmed and add payment info
        const { error: updateError } = await supabaseClient
          .from('bookings')
          .update({
            status: 'confirmed',
            payment_status: 'succeeded',
            stripe_session_id: session.id,
            stripe_payment_intent_id: session.payment_intent as string,
            paid_at: new Date().toISOString(),
          })
          .eq('id', bookingId)

        if (updateError) {
          console.error('Error updating booking:', updateError)
          return new Response('Database error', { status: 500 })
        }

        console.log('Booking status updated successfully')
        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log('Checkout session expired:', session.id)

        // Get booking ID from metadata
        const bookingId = session.metadata?.bookingId
        if (!bookingId) {
          console.error('No booking ID found in session metadata')
          return new Response('No booking ID', { status: 400 })
        }

        console.log('Deleting expired booking:', bookingId)

        // Delete the expired booking
        const { error: deleteError } = await supabaseClient
          .from('bookings')
          .delete()
          .eq('id', bookingId)

        if (deleteError) {
          console.error('Error deleting expired booking:', deleteError)
          return new Response('Database error', { status: 500 })
        }

        console.log('Expired booking deleted successfully')
        break
      }

      default:
        console.log('Unhandled event type:', event.type)
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: 'Webhook handler failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
