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
    console.log('Edge Function called - creating checkout session')

    // Parse request body
    const { bookingId } = await req.json()
    console.log('Booking ID:', bookingId)

    if (!bookingId) {
      return new Response(
        JSON.stringify({ error: 'Booking ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user token from Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client with user's session (respects RLS)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: { persistSession: false },
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    )

    // Get booking details with renter profile for email
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .select(`
        *,
        profiles!renter_id (
          email
        )
      `)
      .eq('id', bookingId)
      .single()

    console.log('Booking query result:', { booking: !!booking, error: bookingError?.message })

    if (bookingError || !booking) {
      return new Response(
        JSON.stringify({ error: 'Booking not found or not eligible for payment' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate booking status
    if (booking.status !== 'payment_required') {
      return new Response(
        JSON.stringify({ error: 'Booking not found or not eligible for payment' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    console.log('Creating Stripe Checkout session for booking:', booking.id)

    // Create Stripe Checkout Session (using HTTPS URLs - Stripe requires HTTPS)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `https://rentitforward.com.au/payments/success?booking_id=${booking.id}&session_id={CHECKOUT_SESSION_ID}&source=mobile`,
      cancel_url: `https://rentitforward.com.au/payments/cancel?booking_id=${booking.id}&source=mobile`,
      line_items: [
        {
          price_data: {
            currency: 'aud',
            product_data: {
              name: 'Rental booking',
              description: `${booking.start_date} to ${booking.end_date}`,
            },
            unit_amount: Math.round(booking.total_amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId: booking.id,
        renterId: booking.renter_id,
        listingId: booking.listing_id,
      },
      customer_email: booking.profiles?.email || undefined,
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes from now
    })

    console.log('Stripe session created successfully:', session.id)

    // Return the checkout session URL
    return new Response(
      JSON.stringify({ 
        url: session.url,
        sessionId: session.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error creating checkout session:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})