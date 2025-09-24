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

    // Get booking details with renter and owner profiles
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .select(`
        *,
        renter:profiles!renter_id (
          email
        ),
        owner:profiles!owner_id (
          stripe_account_id,
          stripe_onboarding_completed
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

    // Validate owner has completed Stripe onboarding
    if (!booking.owner?.stripe_account_id || !booking.owner?.stripe_onboarding_completed) {
      return new Response(
        JSON.stringify({ error: 'Owner has not completed payment setup. Please contact the owner.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    console.log('Creating Stripe Checkout session for booking:', booking.id)
    console.log('Booking amounts:', {
      subtotal: booking.subtotal,
      service_fee: booking.service_fee,
      insurance_fee: booking.insurance_fee,
      delivery_fee: booking.delivery_fee,
      deposit_amount: booking.deposit_amount,
      total_amount: booking.total_amount
    })

    // Create Stripe Checkout Session (using HTTPS URLs - Stripe requires HTTPS)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `https://rentitforward.com.au/payments/success?booking_id=${booking.id}&session_id={CHECKOUT_SESSION_ID}&source=mobile`,
      cancel_url: `https://rentitforward.com.au/payments/cancel?booking_id=${booking.id}&source=mobile`,
      line_items: [
        // Base rental fee
        {
          price_data: {
            currency: 'aud',
            product_data: {
              name: 'Rental Fee',
              description: `${booking.start_date} to ${booking.end_date}`,
            },
            unit_amount: Math.round(booking.subtotal * 100), // Convert to cents
          },
          quantity: 1,
        },
        // Service fee
        {
          price_data: {
            currency: 'aud',
            product_data: {
              name: 'Service Fee',
              description: 'Platform service fee (15%)',
            },
            unit_amount: Math.round(booking.service_fee * 100), // Convert to cents
          },
          quantity: 1,
        },
        // Insurance fee (if applicable)
        ...(booking.insurance_fee > 0 ? [{
          price_data: {
            currency: 'aud',
            product_data: {
              name: 'Damage Protection',
              description: 'Optional damage protection coverage (10%)',
            },
            unit_amount: Math.round(booking.insurance_fee * 100), // Convert to cents
          },
          quantity: 1,
        }] : []),
        // Delivery fee (if applicable)
        ...(booking.delivery_fee > 0 ? [{
          price_data: {
            currency: 'aud',
            product_data: {
              name: 'Delivery Fee',
              description: 'Delivery service fee',
            },
            unit_amount: Math.round(booking.delivery_fee * 100), // Convert to cents
          },
          quantity: 1,
        }] : []),
        // Security deposit (if applicable)
        ...(booking.deposit_amount > 0 ? [{
          price_data: {
            currency: 'aud',
            product_data: {
              name: 'Security Deposit',
              description: 'Refundable security deposit (held until return)',
            },
            unit_amount: Math.round(booking.deposit_amount * 100), // Convert to cents
          },
          quantity: 1,
        }] : []),
      ],
      metadata: {
        bookingId: booking.id,
        renterId: booking.renter_id,
        ownerId: booking.owner_id,
        listingId: booking.listing_id,
        ownerStripeAccount: booking.owner?.stripe_account_id || '',
      },
      customer_email: booking.renter?.email || undefined,
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes from now
    })

        console.log('Stripe session created successfully:', session.id)

        // Store the Stripe session ID in the booking record
        const { error: updateError } = await supabaseClient
          .from('bookings')
          .update({
            stripe_session_id: session.id
          })
          .eq('id', booking.id)

        if (updateError) {
          console.error('Error updating booking with session ID:', updateError)
          // Don't fail the request, just log the error
        }

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