import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the user from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify the user is authenticated
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const userId = user.id

    // Delete all user-related data in the correct order to respect foreign key constraints
    // Using try-catch for each deletion to handle cases where tables might not exist
    
    // 1. Delete FCM subscriptions (references auth.users)
    try {
      await supabaseAdmin
        .from('fcm_subscriptions')
        .delete()
        .eq('user_id', userId)
    } catch (error) {
      console.warn('Failed to delete FCM subscriptions:', error)
    }

    // 2. Delete notification history (references auth.users)
    try {
      await supabaseAdmin
        .from('notification_history')
        .delete()
        .eq('user_id', userId)
    } catch (error) {
      console.warn('Failed to delete notification history:', error)
    }

    // 3. Delete app notifications (references auth.users)
    try {
      await supabaseAdmin
        .from('app_notifications')
        .delete()
        .eq('user_id', userId)
    } catch (error) {
      console.warn('Failed to delete app notifications:', error)
    }

    // 4. Delete notification preferences (references auth.users)
    try {
      await supabaseAdmin
        .from('notification_preferences')
        .delete()
        .eq('user_id', userId)
    } catch (error) {
      console.warn('Failed to delete notification preferences:', error)
    }

    // 5. Delete notifications (references auth.users)
    try {
      await supabaseAdmin
        .from('notifications')
        .delete()
        .eq('user_id', userId)
    } catch (error) {
      console.warn('Failed to delete notifications:', error)
    }

    // 6. Delete favorites (references auth.users)
    try {
      await supabaseAdmin
        .from('favorites')
        .delete()
        .eq('user_id', userId)
    } catch (error) {
      console.warn('Failed to delete favorites:', error)
    }

    // 7. Delete points transactions (references profiles)
    try {
      await supabaseAdmin
        .from('points_transactions')
        .delete()
        .eq('user_id', userId)
    } catch (error) {
      console.warn('Failed to delete points transactions:', error)
    }

    // 8. Delete user points (references profiles)
    try {
      await supabaseAdmin
        .from('user_points')
        .delete()
        .eq('user_id', userId)
    } catch (error) {
      console.warn('Failed to delete user points:', error)
    }

    // 9. Delete issue reports where user is the reporter (references profiles)
    try {
      await supabaseAdmin
        .from('issue_reports')
        .delete()
        .eq('reporter_id', userId)
    } catch (error) {
      console.warn('Failed to delete issue reports:', error)
    }

    // 10. Delete identity verifications (references profiles)
    try {
      await supabaseAdmin
        .from('identity_verifications')
        .delete()
        .eq('user_id', userId)
    } catch (error) {
      console.warn('Failed to delete identity verifications:', error)
    }

    // 11. Delete user notification preferences (references profiles)
    try {
      await supabaseAdmin
        .from('user_notification_preferences')
        .delete()
        .eq('user_id', userId)
    } catch (error) {
      console.warn('Failed to delete user notification preferences:', error)
    }

    // 12. Delete bookings where user is the renter
    await supabaseAdmin
      .from('bookings')
      .delete()
      .eq('renter_id', userId)

    // 13. Get user's listings to delete related bookings
    const { data: userListings } = await supabaseAdmin
      .from('listings')
      .select('id')
      .eq('owner_id', userId)

    // 14. Delete bookings for user's listings
    if (userListings && userListings.length > 0) {
      const listingIds = userListings.map(listing => listing.id)
      await supabaseAdmin
        .from('bookings')
        .delete()
        .in('listing_id', listingIds)
    }

    // 15. Delete messages
    await supabaseAdmin
      .from('messages')
      .delete()
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)

    // 16. Delete reviews
    await supabaseAdmin
      .from('reviews')
      .delete()
      .or(`reviewer_id.eq.${userId},reviewee_id.eq.${userId}`)

    // 17. Delete incentives
    await supabaseAdmin
      .from('incentives')
      .delete()
      .eq('user_id', userId)

    // 18. Delete listings
    await supabaseAdmin
      .from('listings')
      .delete()
      .eq('owner_id', userId)

    // 19. Delete profile
    await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId)

    // 20. Finally, delete the auth user
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    
    if (deleteError) {
      console.error('Error deleting user:', deleteError)
      return new Response(
        JSON.stringify({ error: 'Failed to delete user account' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Account deleted successfully' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in delete-user-account function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

