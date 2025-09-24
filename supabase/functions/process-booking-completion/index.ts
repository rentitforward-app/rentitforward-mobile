import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BookingCompletionData {
  bookingId: string
  ownerId: string
  totalAmount: number
  depositAmount: number
  platformCommissionRate: number
  hasIssues?: boolean
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Processing booking completion')

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // Initialize Supabase client with service role
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SERVICE_ROLE_KEY') ?? '',
      {
        auth: { persistSession: false },
      }
    )

    const { bookingId, ownerId, totalAmount, depositAmount, platformCommissionRate, hasIssues } = 
      await req.json() as BookingCompletionData

    console.log('Processing completion for booking:', bookingId)

    // Get booking and owner details
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .select(`
        id,
        stripe_payment_intent_id,
        stripe_transfer_id,
        total_amount,
        deposit_amount,
        platform_fee,
        owner_commission_rate,
        owner_net_earnings,
        status
      `)
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      console.error('Booking not found:', bookingError)
      return new Response('Booking not found', { status: 404 })
    }

    const { data: owner, error: ownerError } = await supabaseClient
      .from('profiles')
      .select('stripe_account_id, stripe_onboarding_completed')
      .eq('id', ownerId)
      .single()

    if (ownerError || !owner || !owner.stripe_account_id) {
      console.error('Owner or Stripe account not found:', ownerError)
      return new Response('Owner Stripe account not found', { status: 400 })
    }

    if (!owner.stripe_onboarding_completed) {
      console.error('Owner onboarding not completed')
      return new Response('Owner onboarding not completed', { status: 400 })
    }

    // Calculate transfer amounts
    const subtotal = parseFloat(booking.total_amount) - parseFloat(booking.deposit_amount || '0')
    const platformCommission = subtotal * (booking.owner_commission_rate || 0.20)
    const ownerEarnings = subtotal - platformCommission

    console.log('Transfer calculation:', {
      subtotal,
      platformCommission,
      ownerEarnings,
      depositAmount: parseFloat(booking.deposit_amount || '0')
    })

    let transferId = booking.stripe_transfer_id

    // Create transfer to owner if not already done
    if (!transferId && ownerEarnings > 0) {
      try {
        const transfer = await stripe.transfers.create({
          amount: Math.round(ownerEarnings * 100), // Convert to cents
          currency: 'aud',
          destination: owner.stripe_account_id,
          metadata: {
            bookingId: booking.id,
            type: 'rental_earnings',
          },
        })

        transferId = transfer.id
        console.log('Transfer created:', transferId)

        // Update booking with transfer ID
        const { error: updateError } = await supabaseClient
          .from('bookings')
          .update({
            stripe_transfer_id: transferId,
            owner_net_earnings: ownerEarnings,
            platform_total_revenue: platformCommission,
          })
          .eq('id', bookingId)

        if (updateError) {
          console.error('Error updating booking with transfer ID:', updateError)
        }

      } catch (transferError) {
        console.error('Error creating transfer:', transferError)
        return new Response('Transfer failed', { status: 500 })
      }
    }

    // Handle deposit refund if no issues
    if (!hasIssues && parseFloat(booking.deposit_amount || '0') > 0) {
      try {
        // Create refund for the deposit
        const refund = await stripe.refunds.create({
          payment_intent: booking.stripe_payment_intent_id,
          amount: Math.round(parseFloat(booking.deposit_amount) * 100), // Convert to cents
          metadata: {
            bookingId: booking.id,
            type: 'deposit_refund',
          },
        })

        console.log('Deposit refund created:', refund.id)

        // Update booking with refund status
        const { error: updateError } = await supabaseClient
          .from('bookings')
          .update({
            deposit_status: 'refunded',
          })
          .eq('id', bookingId)

        if (updateError) {
          console.error('Error updating deposit status:', updateError)
        }

      } catch (refundError) {
        console.error('Error creating deposit refund:', refundError)
        // Don't fail the entire process if refund fails
      }
    }

    // Trigger automatic payout for the connected account (if enabled)
    try {
      // Check if account has automatic payouts enabled
      const account = await stripe.accounts.retrieve(owner.stripe_account_id)
      
      if (account.settings?.payouts?.schedule?.interval === 'manual') {
        // Create manual payout
        const balance = await stripe.balance.retrieve({
          stripeAccount: owner.stripe_account_id,
        })

        const availableAmount = balance.available.find(b => b.currency === 'aud')?.amount || 0

        if (availableAmount > 0) {
          const payout = await stripe.payouts.create({
            amount: availableAmount,
            currency: 'aud',
            metadata: {
              bookingId: booking.id,
              type: 'rental_payout',
            },
          }, {
            stripeAccount: owner.stripe_account_id,
          })

          console.log('Manual payout created:', payout.id)
        }
      }
    } catch (payoutError) {
      console.error('Error with payout:', payoutError)
      // Don't fail the process if payout fails
    }

    return new Response(JSON.stringify({ 
      success: true, 
      transferId,
      message: 'Booking completion processed successfully' 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Booking completion processing error:', error)
    return new Response(
      JSON.stringify({ error: 'Booking completion processing failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
