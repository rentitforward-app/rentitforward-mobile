import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface BookingRealtimeOptions {
  bookingId?: string;
  userId?: string;
  enabled?: boolean;
}

/**
 * Custom hook for real-time booking updates
 * Subscribes to booking changes and automatically updates React Query cache
 */
export function useBookingRealtime({ bookingId, userId, enabled = true }: BookingRealtimeOptions) {
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled || !userId) {
      return;
    }

    console.log('🔄 Setting up booking real-time subscription', { bookingId, userId });

    // Create channel name based on whether we're watching a specific booking or all user bookings
    const channelName = bookingId 
      ? `booking:${bookingId}` 
      : `user_bookings:${userId}`;

    // Clean up existing channel
    if (channelRef.current) {
      console.log('🧹 Cleaning up existing real-time channel');
      supabase.removeChannel(channelRef.current);
    }

    // Create new channel
    let filter: string;
    if (bookingId) {
      filter = `id=eq.${bookingId}`;
    } else if (userId) {
      filter = `or(renter_id.eq.${userId},owner_id.eq.${userId})`;
    } else {
      console.error('❌ No bookingId or userId provided for real-time subscription');
      return;
    }

    console.log(`🔗 Setting up real-time subscription with filter: ${filter}`);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'bookings',
          filter: filter,
        },
        (payload) => {
          try {
            console.log('📡 Booking real-time update received:', {
              eventType: payload.eventType,
              bookingId: payload.new?.id || payload.old?.id,
              status: payload.new?.status,
              timestamp: new Date().toISOString(),
            });

            const updatedBookingId = payload.new?.id || payload.old?.id;

            // Invalidate specific booking queries more aggressively
            if (updatedBookingId) {
              console.log('🔄 Real-time: Invalidating cache for booking:', updatedBookingId);
              
              // Remove from cache completely to force fresh fetch
              queryClient.removeQueries({ 
                queryKey: ['booking-details', updatedBookingId] 
              });
              
              // Also invalidate any related queries
              queryClient.invalidateQueries({ 
                queryKey: ['booking-status', updatedBookingId] 
              });
            }

            // Invalidate user's bookings list
            queryClient.invalidateQueries({ 
              queryKey: ['bookings'] 
            });

            // For specific status changes, show user-friendly notifications
            if (payload.eventType === 'UPDATE' && payload.new) {
              handleStatusChange(payload.new, payload.old);
            }
          } catch (error) {
            console.error('❌ Error processing real-time update:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Booking real-time subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to booking updates');
        } else if (status === 'CHANNEL_ERROR') {
          console.warn('⚠️ Real-time subscription failed - using pull-to-refresh as fallback');
        } else if (status === 'TIMED_OUT') {
          console.warn('⏰ Real-time subscription timed out - using pull-to-refresh as fallback');
        } else if (status === 'CLOSED') {
          console.log('🔒 Real-time subscription closed');
        }
      });

    channelRef.current = channel;

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up booking real-time subscription');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [bookingId, userId, enabled, queryClient]);

  // Handle specific status changes for user notifications
  const handleStatusChange = (newBooking: any, oldBooking: any) => {
    const oldStatus = oldBooking?.status;
    const newStatus = newBooking?.status;

    if (oldStatus === newStatus) return;

    console.log('📊 Booking status changed:', { 
      bookingId: newBooking.id, 
      from: oldStatus, 
      to: newStatus 
    });

    // You can add toast notifications or other UI feedback here
    // For now, we'll just log the changes
    switch (newStatus) {
      case 'confirmed':
        console.log('🎉 Booking confirmed!');
        break;
      case 'in_progress':
        console.log('🚀 Booking started - pickup confirmed by both parties');
        break;
      case 'return_pending':
        console.log('📦 Return verification needed');
        break;
      case 'disputed':
        console.log('⚠️ Booking disputed - damage reports need resolution');
        break;
      case 'completed':
        console.log('✅ Booking completed - payment processed');
        break;
      case 'cancelled':
        console.log('❌ Booking cancelled');
        break;
      default:
        console.log(`📝 Booking status updated to: ${newStatus}`);
    }

    // Check for specific field changes
    if (oldBooking?.pickup_confirmed_by_renter !== newBooking?.pickup_confirmed_by_renter) {
      console.log('📸 Renter pickup confirmation updated');
    }
    
    if (oldBooking?.pickup_confirmed_by_owner !== newBooking?.pickup_confirmed_by_owner) {
      console.log('📸 Owner pickup confirmation updated');
    }
    
    if (oldBooking?.return_confirmed_by_renter !== newBooking?.return_confirmed_by_renter) {
      console.log('📦 Renter return confirmation updated');
    }
    
    if (oldBooking?.return_confirmed_by_owner !== newBooking?.return_confirmed_by_owner) {
      console.log('📦 Owner return confirmation updated');
    }

    if (oldBooking?.damage_report !== newBooking?.damage_report) {
      console.log('⚠️ Damage report added/updated');
    }

    if (oldBooking?.owner_notes !== newBooking?.owner_notes) {
      console.log('📝 Owner notes added/updated');
    }
  };

  return {
    isConnected: channelRef.current?.state === 'joined',
    channel: channelRef.current,
  };
}
