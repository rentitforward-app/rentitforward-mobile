import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
  Modal,
  RefreshControl
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/components/AuthProvider';
import { colors, spacing, typography } from '../../src/lib/design-system';
import { useBookingRealtime } from '../../src/hooks/useBookingRealtime';
import { Header } from '../../src/components/Header';
import { CancelBookingModal } from '../../src/components/booking/CancelBookingModal';
import { IssueReportsSection } from '../../src/components/booking/IssueReportsSection';
import { ReviewModal } from '../../src/components/ReviewModal';
import { getNotificationApiService } from '../../src/lib/notification-api';
import { isUserAdmin } from '../../src/utils/admin';

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showCancelModal, setShowCancelModal] = React.useState(false);
  const [showReviewModal, setShowReviewModal] = React.useState(false);
  const [existingReview, setExistingReview] = React.useState<any>(null);
  const [reviewCheckLoading, setReviewCheckLoading] = React.useState(true);
  const [showVerificationModal, setShowVerificationModal] = React.useState(false);
  const [showDamageReportsModal, setShowDamageReportsModal] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  // Set up real-time subscription for this booking
  const { isConnected } = useBookingRealtime({
    bookingId: id,
    userId: user?.id,
    enabled: !!id && !!user?.id,
  });

  // Pull-to-refresh function
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      console.log('🔄 Starting manual refresh for booking:', id);
      
      // First, remove the cached data completely
      queryClient.removeQueries({ queryKey: ['booking-details', id] });
      queryClient.removeQueries({ queryKey: ['booking-status', id] });
      
      // Then force a fresh fetch with staleTime: 0 to bypass cache
      await queryClient.fetchQuery({
        queryKey: ['booking-details', id],
        queryFn: async () => {
          console.log('🔄 Fetching fresh booking data from database...');
          
          const { data, error } = await supabase
            .from('bookings')
            .select(`
              *,
              listings!listing_id (
                id,
                title,
                description,
                category,
                images,
                price_per_day,
                profiles!owner_id (
                  id,
                  full_name,
                  email,
                  phone_number,
                  avatar_url
                )
              ),
              renter:profiles!renter_id (
                id,
                full_name,
                email,
                phone_number,
                avatar_url
              )
            `)
            .eq('id', id)
            .single();

          if (error) {
            console.error('❌ Error fetching fresh booking data:', error);
            throw error;
          }

          console.log('✅ Fresh booking data fetched:', {
            id: data.id,
            status: data.status,
            renterPickupConfirmed: data.pickup_confirmed_by_renter,
            ownerPickupConfirmed: data.pickup_confirmed_by_owner,
            renterReturnConfirmed: data.return_confirmed_by_renter,
            ownerReturnConfirmed: data.return_confirmed_by_owner,
          });

          return data;
        },
        staleTime: 0, // Force fresh data
        gcTime: 0,    // Don't cache this fetch
      });
      
      // Also invalidate related queries
      await queryClient.invalidateQueries({ queryKey: ['bookings', user?.id] });
      
      console.log('✅ Manual refresh completed for booking:', id);
    } catch (error) {
      console.error('❌ Error during manual refresh:', error);
    } finally {
      setRefreshing(false);
    }
  }, [id, user?.id, queryClient]);

  // Fetch booking details
  const { data: booking, isLoading, error } = useQuery({
    queryKey: ['booking-details', id],
    queryFn: async () => {
      if (!id) throw new Error('No booking ID provided');
      
      // Removed console.log to reduce spam
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          listings!listing_id (
            id,
            title,
            images,
            price_per_day,
            category,
            owner_id,
            profiles!owner_id (
              id,
              full_name,
              email,
              phone_number,
              avatar_url
            )
          ),
          renter:profiles!renter_id (
            id,
            full_name,
            email,
            phone_number,
            avatar_url
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching booking details:', error);
        throw error;
      }

      // Removed console.log to reduce spam
      return data;
    },
    enabled: !!id,
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: true, // Refetch when app comes back to foreground
    refetchOnReconnect: true, // Refetch when network reconnects
  });

  // Debug: Log when booking data changes
  React.useEffect(() => {
    if (booking) {
      console.log('📊 Booking data updated:', {
        id: booking.id,
        status: booking.status,
        renterPickupConfirmed: booking.pickup_confirmed_by_renter,
        ownerPickupConfirmed: booking.pickup_confirmed_by_owner,
        renterReturnConfirmed: booking.return_confirmed_by_renter,
        ownerReturnConfirmed: booking.return_confirmed_by_owner,
        timestamp: new Date().toISOString()
      });
    }
  }, [booking?.status, booking?.pickup_confirmed_by_renter, booking?.pickup_confirmed_by_owner, booking?.return_confirmed_by_renter, booking?.return_confirmed_by_owner]);

  // Auto-refresh when screen comes into focus (e.g., returning from verification screens)
  useFocusEffect(
    React.useCallback(() => {
      console.log('📱 Booking details screen focused - checking for updates');
      
      // Force refresh the booking data when screen comes into focus
      queryClient.invalidateQueries({ queryKey: ['booking-details', id] });
      
      // Small delay to ensure any pending database updates are processed
      setTimeout(() => {
        queryClient.refetchQueries({ 
          queryKey: ['booking-details', id],
          type: 'active'
        });
      }, 500);
    }, [id, queryClient])
  );

  // Effect to check for existing review after booking loads
  React.useEffect(() => {
    if (booking && user) {
      checkExistingReview(booking, user);
    }
  }, [booking?.id, user?.id]);

  // Function to check if user has already reviewed this booking
  const checkExistingReview = async (bookingData: any, userData: any) => {
    // Return confirmation status
    const renterConfirmedReturn = bookingData.return_confirmed_by_renter || false;
    const ownerConfirmedReturn = bookingData.return_confirmed_by_owner || false;
    const bothReturnConfirmed = renterConfirmedReturn && ownerConfirmedReturn;
    
    // Only check for reviews if booking is completed OR both parties confirmed return
    if (bookingData.status !== 'completed' && !bothReturnConfirmed) {
      setReviewCheckLoading(false);
      return;
    }

    try {
      const { data: reviewData, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          type,
          profiles:reviewer_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('booking_id', bookingData.id)
        .eq('reviewer_id', userData.id)
        .single();

      if (reviewData) {
        setExistingReview(reviewData);
      } else {
        setExistingReview(null);
      }
    } catch (error) {
      console.error('Error checking existing review:', error);
    } finally {
      setReviewCheckLoading(false);
    }
  };

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { bg: colors.semantic.success, text: colors.white };
      case 'pending':
        return { bg: colors.semantic.warning, text: colors.text.primary };
      case 'payment_required':
        return { bg: '#FFA500', text: colors.white };
      case 'cancelled':
        return { bg: colors.semantic.error, text: colors.white };
      case 'completed':
        return { bg: colors.semantic.info, text: colors.white };
      default:
        return { bg: colors.neutral.mediumGray, text: colors.text.primary };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'payment_required':
        return 'Payment Required';
      case 'cancelled':
        return 'Cancelled';
      case 'completed':
        return 'Completed';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Your booking is confirmed and ready for pickup';
      case 'pending':
        return 'Waiting for host approval';
      case 'payment_required':
        return 'Complete payment to confirm your booking';
      case 'cancelled':
        return 'This booking has been cancelled';
      case 'completed':
        return 'Rental completed successfully';
      default:
        return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'checkmark-circle';
      case 'pending':
        return 'time-outline';
      case 'payment_required':
        return 'card-outline';
      case 'cancelled':
        return 'close-circle';
      case 'completed':
        return 'checkmark-done-circle';
      default:
        return 'information-circle-outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    // Add 1 to include both start and end dates in the count
    return diffDays + 1;
  };

  // Cancel booking mutation - Call web API for email notifications
  const cancelBookingMutation = useMutation({
    mutationFn: async ({ reason, note }: { reason: string; note: string }) => {
      if (!booking || !user?.id) {
        throw new Error('Booking or user not found');
      }

      // Call web API to cancel booking (includes email notifications)
      const notificationApi = getNotificationApiService();
      const response = await notificationApi.cancelBooking(
        booking.id,
        user.id,
        reason,
        note
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to cancel booking');
      }

      return response;
    },
    onSuccess: (data) => {
      // Invalidate and refetch booking details
      queryClient.invalidateQueries({ queryKey: ['booking-details', id] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setShowCancelModal(false);
      Alert.alert('Success', 'Booking has been cancelled successfully');
    },
    onError: (error) => {
      Alert.alert('Error', error.message || 'Failed to cancel booking');
    },
  });

  // Calculate confirmation state at component level
  const isRenter = user?.id === booking?.renter_id;
  const isOwner = user?.id === booking?.owner_id;
  
  // Pickup confirmation status
  const renterConfirmedPickup = booking?.pickup_confirmed_by_renter || false;
  const ownerConfirmedPickup = booking?.pickup_confirmed_by_owner || false;
  const bothPickupConfirmed = renterConfirmedPickup && ownerConfirmedPickup;
  const currentUserPickupConfirmed = (isRenter && renterConfirmedPickup) || (isOwner && ownerConfirmedPickup);
  const otherPartyPickupConfirmed = (isRenter && ownerConfirmedPickup) || (isOwner && renterConfirmedPickup);
  
  // Return confirmation status
  const renterConfirmedReturn = booking?.return_confirmed_by_renter || false;
  const ownerConfirmedReturn = booking?.return_confirmed_by_owner || false;
  const bothReturnConfirmed = renterConfirmedReturn && ownerConfirmedReturn;
  const currentUserReturnConfirmed = (isRenter && renterConfirmedReturn) || (isOwner && ownerConfirmedReturn);
  const otherPartyReturnConfirmed = (isRenter && ownerConfirmedReturn) || (isOwner && renterConfirmedReturn);

  // Calculate pickup date info with new timing (start date 00:00 to end date 23:59)
  const pickupInfo = booking ? (() => {
    const today = new Date();
    const startDate = new Date(booking.start_date);
    const endDate = new Date(booking.end_date);
    
    // Set start date to beginning of day (00:00)
    const startOfPickupPeriod = new Date(startDate);
    startOfPickupPeriod.setHours(0, 0, 0, 0);
    
    // Set end date to end of day (23:59:59)
    const endOfPickupPeriod = new Date(endDate);
    endOfPickupPeriod.setHours(23, 59, 59, 999);
    
    const isWithinPickupPeriod = today >= startOfPickupPeriod && today <= endOfPickupPeriod;
    const isBeforePickupPeriod = today < startOfPickupPeriod;
    const isAfterPickupPeriod = today > endOfPickupPeriod;
    
    const hasBeenPickedUp = booking.status === 'active' || booking.status === 'in_progress' || booking.status === 'picked_up' || bothPickupConfirmed;
    
    // Admin override for testing - allow pickup confirmation regardless of date/state
    const canConfirmPickup = isUserAdmin(user) ? 
      (!currentUserPickupConfirmed) : 
      (isWithinPickupPeriod && booking.status === 'confirmed' && !hasBeenPickedUp && !currentUserPickupConfirmed);
    
    // Can return if both parties have confirmed pickup and we're within or after the rental period
    // Admin override: allow return testing regardless of date restrictions
    const isWithinOrAfterRentalPeriod = today >= startOfPickupPeriod;
    const canReturn = isUserAdmin(user) ? 
      (!currentUserReturnConfirmed) : 
      (bothPickupConfirmed && isWithinOrAfterRentalPeriod && booking.status !== 'completed' && !currentUserReturnConfirmed);
    
    // Show pickup/return section when booking is confirmed, payment required, or return is available
    // Admin override: always show button for testing
    const showPickupButton = isUserAdmin(user) || booking.status === 'confirmed' || booking.status === 'payment_required' || canReturn || bothPickupConfirmed || currentUserReturnConfirmed;
    
    // Generate button text
    let pickupButtonText: string;
    let pickupButtonNote: string | null = null;
    
    // Admin override for testing - provide admin-specific messaging
    // PRIORITY: Pickup first, then return (proper flow)
    if (isUserAdmin(user)) {
      if (canConfirmPickup && !currentUserPickupConfirmed) {
        pickupButtonText = 'Verify Pickup (Admin Test)';
        pickupButtonNote = 'Admin testing: Pickup verification available regardless of date/state restrictions.';
      } else if (currentUserPickupConfirmed && !otherPartyPickupConfirmed) {
        pickupButtonText = 'Waiting for other party pickup confirmation (Admin)';
        pickupButtonNote = 'Admin testing: You\'ve confirmed pickup, waiting for other party.';
      } else if (bothPickupConfirmed && canReturn && !currentUserReturnConfirmed) {
        pickupButtonText = 'Verify Return (Admin Test)';
        pickupButtonNote = 'Admin testing: Return verification available regardless of date restrictions.';
      } else if (currentUserReturnConfirmed && !otherPartyReturnConfirmed) {
        pickupButtonText = 'Waiting for other party return confirmation (Admin)';
        pickupButtonNote = 'Admin testing: You\'ve confirmed return, waiting for other party.';
      } else if (bothReturnConfirmed) {
        pickupButtonText = 'Return Completed (Admin Test)';
        pickupButtonNote = 'Admin testing: Both parties confirmed return.';
      } else if (bothPickupConfirmed) {
        pickupButtonText = 'Pickup Confirmed - Return Available (Admin Test)';
        pickupButtonNote = 'Admin testing: Both parties confirmed pickup. Return verification now available.';
      } else {
        pickupButtonText = 'Verify Pickup (Admin Test)';
        pickupButtonNote = 'Admin testing: Start with pickup verification first.';
      }
    }
    // Return confirmation states (highest priority)
    else if (currentUserReturnConfirmed && !otherPartyReturnConfirmed) {
      // Current user confirmed return, waiting for other party
      const otherPartyName = isRenter ? 'owner' : 'renter';
      pickupButtonText = `Waiting for ${otherPartyName} return confirmation`;
      pickupButtonNote = `You've confirmed the return. Waiting for the ${otherPartyName} to verify and confirm return.`;
    } else if (!currentUserReturnConfirmed && otherPartyReturnConfirmed) {
      // Other party confirmed return, current user needs to confirm
      const otherPartyName = isRenter ? 'owner' : 'renter';
      pickupButtonText = 'Verify Return';
      pickupButtonNote = `The ${otherPartyName} has confirmed return. Please verify the item and confirm.`;
    } else if (bothReturnConfirmed) {
      // Both confirmed return - booking completed
      pickupButtonText = 'Return Completed';
      pickupButtonNote = 'Both parties have confirmed return. The rental is now complete.';
    } 
    // Return available states
    else if (canReturn) {
      pickupButtonText = 'Verify Return';
      pickupButtonNote = 'The rental period is active. You can now verify and confirm the return of the item.';
    } 
    // Pickup confirmation states
    else if (bothPickupConfirmed && !canReturn) {
      // Both confirmed pickup but return not yet available
      pickupButtonText = 'Pickup Confirmed';
      pickupButtonNote = 'Both parties have confirmed pickup. Return verification will be available during the rental period.';
    } else if (currentUserPickupConfirmed && !otherPartyPickupConfirmed) {
      // Current user confirmed pickup, waiting for other party
      const otherPartyName = isRenter ? 'owner' : 'renter';
      pickupButtonText = `Waiting for ${otherPartyName} confirmation`;
      pickupButtonNote = `You've confirmed pickup. Waiting for the ${otherPartyName} to verify and confirm pickup.`;
    } else if (!currentUserPickupConfirmed && otherPartyPickupConfirmed) {
      // Other party confirmed pickup, current user needs to confirm
      const otherPartyName = isRenter ? 'owner' : 'renter';
      pickupButtonText = 'Verify Pickup';
      pickupButtonNote = `The ${otherPartyName} has confirmed pickup. Please verify the item and confirm.`;
    } 
    // Initial pickup states
    else if (isBeforePickupPeriod) {
      pickupButtonText = 'Verify Pickup (Not Available Yet)';
      const daysUntil = Math.ceil((startOfPickupPeriod.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      pickupButtonNote = `Pickup verification will be available starting ${startDate.toLocaleDateString()} at 12:00 AM (${daysUntil} day${daysUntil !== 1 ? 's' : ''} from now)`;
    } else if (isAfterPickupPeriod && !hasBeenPickedUp) {
      pickupButtonText = 'Pickup Date Passed';
      pickupButtonNote = 'Pickup date has passed. Contact support if you need assistance.';
    } else if (isWithinPickupPeriod && booking.status !== 'confirmed') {
      pickupButtonText = 'Complete Payment First';
      pickupButtonNote = 'Complete payment first to enable pickup verification.';
    } else {
      pickupButtonText = 'Verify Pickup';
    }
    
    return {
      canConfirmPickup,
      canReturn,
      hasBeenPickedUp,
      showPickupButton,
      isPickupAvailable: canConfirmPickup,
      isReturnAvailable: canReturn,
      pickupButtonText,
      pickupButtonNote,
      daysUntilPickup: isBeforePickupPeriod ? Math.ceil((startOfPickupPeriod.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null,
      daysUntilReturn: isWithinPickupPeriod ? Math.ceil((endOfPickupPeriod.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null
    };
  })() : {
    canConfirmPickup: false,
    canReturn: false,
    hasBeenPickedUp: false,
    showPickupButton: false,
    isPickupAvailable: false,
    isReturnAvailable: false,
    pickupButtonText: 'Loading...',
    pickupButtonNote: null,
    daysUntilPickup: null,
    daysUntilReturn: null
  };
  
  // Extract values for backward compatibility
  const { 
    canConfirmPickup, 
    canReturn, 
    hasBeenPickedUp, 
    showPickupButton,
    pickupButtonText: sharedPickupButtonText,
    pickupButtonNote: sharedPickupButtonNote
  } = pickupInfo;

  // Check if booking can be cancelled
  const canCancel = booking && 
    user && 
    (booking.renter_id === user.id || booking.owner_id === user.id) &&
    (booking.status === 'confirmed' || booking.status === 'pending' || booking.status === 'payment_required');


  // No API mutations needed - verification screens handle everything directly with Supabase

  const handleCancelBooking = async (reason: string, note: string) => {
    await cancelBookingMutation.mutateAsync({ reason, note });
  };

  const handleConfirmPickup = async () => {
    // Navigate to pickup verification screen
    router.push(`/bookings/${id}/pickup-verification`);
  };

  const handleConfirmReturn = async () => {
    // Navigate to return verification screen
    router.push(`/bookings/${id}/return-verification`);
  };

  // Helper functions for button text and states (using enhanced logic)
  const getPickupButtonText = () => {
    return sharedPickupButtonText;
  };

  const getPickupButtonNote = () => {
    return sharedPickupButtonNote;
  };

  const getPickupButtonAction = () => {
    // Admin users can always access verification screens for testing
    // PRIORITY: Pickup first, then return (proper flow)
    if (isUserAdmin(user)) {
      // 1. First priority: Pickup verification if not confirmed by current user
      if (canConfirmPickup && !currentUserPickupConfirmed) {
        return handleConfirmPickup;
      }
      // 2. Second priority: Return verification if pickup is done and return not confirmed
      if (bothPickupConfirmed && canReturn && !currentUserReturnConfirmed) {
        return handleConfirmReturn;
      }
      // 3. Allow re-testing return flow if already confirmed
      if (currentUserReturnConfirmed) {
        return handleConfirmReturn;
      }
      // 4. Default to pickup verification for admin testing
      return handleConfirmPickup;
    }
    
    // Return verification actions (highest priority)
    if (!currentUserReturnConfirmed && otherPartyReturnConfirmed) {
      // Other party confirmed return, current user needs to confirm
      return handleConfirmReturn;
    } else if (canReturn && !currentUserReturnConfirmed) {
      // Return is available and user hasn't confirmed yet
      return handleConfirmReturn;
    }
    
    // Pickup verification actions
    if (!currentUserPickupConfirmed && otherPartyPickupConfirmed) {
      // Other party confirmed pickup, current user needs to confirm
      return handleConfirmPickup;
    } else if (canConfirmPickup) {
      // Pickup is available and user hasn't confirmed yet
      return handleConfirmPickup;
    }
    
    // No action available
    return undefined;
  };

  const isPickupButtonDisabled = () => {
    const disabled = (() => {
      // Disable if booking is completed or disputed - no further action needed
      if (booking?.status === 'completed' || booking?.status === 'disputed') {
        return true;
      }
      
      // Admin users can access verification buttons for testing (except when completed/disputed)
      if (isUserAdmin(user)) return false;
      
      // Enable for return verification when other party confirmed or return available
      if (!currentUserReturnConfirmed && otherPartyReturnConfirmed) return false;
      if (canReturn && !currentUserReturnConfirmed) return false;
      
      // Enable for pickup verification when other party confirmed or pickup available  
      if (!currentUserPickupConfirmed && otherPartyPickupConfirmed) return false;
      if (canConfirmPickup) return false;
      
      // Disable in all other cases (waiting states, completed states, etc.)
      return true;
    })();

    console.log('🔘 Button state calculation:', {
      bookingId: booking?.id,
      status: booking?.status,
      isRenter,
      currentUserPickupConfirmed,
      otherPartyPickupConfirmed,
      currentUserReturnConfirmed,
      otherPartyReturnConfirmed,
      canConfirmPickup,
      canReturn,
      isDisabled: disabled,
      timestamp: new Date().toISOString()
    });

    return disabled;
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header 
          title="Booking Details"
          showBackButton={true}
          onBackPress={() => router.back()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading booking details...</Text>
        </View>
      </View>
    );
  }

  if (error || !booking) {
    return (
      <View style={styles.container}>
        <Header 
          title="Booking Details"
          showBackButton={true}
          onBackPress={() => router.back()}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.semantic.error} />
          <Text style={styles.errorTitle}>Error Loading Booking</Text>
          <Text style={styles.errorText}>
            {error?.message || 'Unable to load booking details. Please try again.'}
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const statusColor = getStatusColor(booking.status);
  const duration = calculateDuration(booking.start_date, booking.end_date);

  return (
    <View style={styles.container}>
      <Header 
        title="Booking Details"
        showBackButton={true}
        onBackPress={() => router.back()}
      />

      <ScrollView 
        style={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary.main]}
            tintColor={colors.primary.main}
          />
        }
      >
        {/* Top Spacing */}
        <View style={styles.topSpacing} />
        
        {/* Item Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Item Information</Text>
          <View style={styles.itemCard}>
            {booking.listings?.images?.[0] && (
              <Image 
                source={{ uri: booking.listings.images[0] }} 
                style={styles.itemImage}
                resizeMode="cover"
              />
            )}
            <View style={styles.itemDetails}>
              <Text style={styles.itemTitle}>{booking.listings?.title}</Text>
              <Text style={styles.itemCategory}>{booking.listings?.category}</Text>
              <Text style={styles.itemPrice}>
                {formatPrice(booking.price_per_day)}/day
              </Text>
              
              {/* Booking Status - Now with context */}
              <View style={styles.bookingStatusContainer}>
                <View style={styles.statusRow}>
                  <Ionicons 
                    name={getStatusIcon(booking.status)} 
                    size={20} 
                    color={statusColor.bg} 
                    style={styles.statusIcon}
                  />
                  <Text style={styles.bookingStatusLabel}>Booking Status:</Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                    <Text style={[styles.statusText, { color: statusColor.text }]}>
                      {getStatusText(booking.status)}
                    </Text>
                  </View>
                </View>
                {getStatusDescription(booking.status) && (
                  <Text style={styles.statusDescription}>
                    {getStatusDescription(booking.status)}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Rental Period */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rental Period</Text>
          <View style={styles.periodCard}>
            <View style={styles.dateRow}>
              <View style={styles.dateItem}>
                <Ionicons name="calendar-outline" size={20} color={colors.primary.main} />
                <View style={styles.dateContent}>
                  <Text style={styles.dateLabel}>Start Date</Text>
                  <Text style={styles.dateValue}>{formatDate(booking.start_date)}</Text>
                </View>
              </View>
              <View style={styles.dateItem}>
                <Ionicons name="calendar-outline" size={20} color={colors.primary.main} />
                <View style={styles.dateContent}>
                  <Text style={styles.dateLabel}>End Date</Text>
                  <Text style={styles.dateValue}>{formatDate(booking.end_date)}</Text>
                </View>
              </View>
            </View>
            <View style={styles.durationRow}>
              <Text style={styles.durationText}>
                Duration: {duration} day{duration !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Pickup/Return Confirmation */}
        {showPickupButton && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {canReturn || currentUserReturnConfirmed || otherPartyReturnConfirmed ? 'Return Confirmation' : 'Pickup Confirmation'}
            </Text>
            <View style={styles.pickupConfirmationCard}>
              <View style={styles.pickupHeader}>
                <Ionicons 
                  name={canReturn || currentUserReturnConfirmed || otherPartyReturnConfirmed ? "flag-outline" : "cube-outline"} 
                  size={24} 
                  color={colors.primary.main} 
                />
                <Text style={styles.pickupTitle}>
                  {canReturn || currentUserReturnConfirmed || otherPartyReturnConfirmed ? 'Return Confirmation' : 'Pickup Confirmation'}
                </Text>
              </View>
              
              {booking.pickup_location && (
                <View style={styles.locationSection}>
                  <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={20} color={colors.text.secondary} />
                    <Text style={styles.locationText}>{booking.pickup_location}</Text>
                  </View>
                  {booking.pickup_instructions && (
                    <Text style={styles.pickupInstructions}>{booking.pickup_instructions}</Text>
                  )}
                </View>
              )}
              
              <TouchableOpacity 
                style={[
                  styles.pickupButton, 
                  !isPickupButtonDisabled() ? styles.pickupButtonActive : styles.pickupButtonDisabled
                ]}
                disabled={isPickupButtonDisabled()}
                onPress={getPickupButtonAction()}
              >
                <Ionicons 
                  name={canReturn || currentUserReturnConfirmed || otherPartyReturnConfirmed ? "flag" : "checkmark-circle"} 
                  size={20} 
                  color={!isPickupButtonDisabled() ? colors.white : colors.gray[400]} 
                />
                <Text style={[
                  styles.pickupButtonText,
                  !isPickupButtonDisabled() ? styles.pickupButtonTextActive : styles.pickupButtonTextDisabled
                ]}>
                  {getPickupButtonText()}
                </Text>
              </TouchableOpacity>
              
              {getPickupButtonNote() && (
                <Text style={styles.pickupNote}>
                  {getPickupButtonNote()}
                </Text>
              )}
            </View>
          </View>
        )}


        {/* Your Host */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Host</Text>
          <View style={styles.hostCard}>
            <View style={styles.hostInfo}>
              {booking.listings?.profiles?.avatar_url ? (
                <Image 
                  source={{ uri: booking.listings.profiles.avatar_url }} 
                  style={styles.hostAvatar}
                />
              ) : (
                <View style={styles.hostAvatarPlaceholder}>
                  <Ionicons name="person" size={24} color={colors.gray[400]} />
                </View>
              )}
              <View style={styles.hostDetails}>
                <Text style={styles.hostName}>{booking.listings?.profiles?.full_name || 'Unknown'}</Text>
                <Text style={styles.hostRole}>Host</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.hostMessageButton]}
              onPress={() => {
                router.push(`/messages/${booking.id}`);
              }}
            >
              <Ionicons name="chatbubble-outline" size={18} color={colors.primary.main} />
              <Text style={styles.hostMessageButtonText}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.paymentSummaryCard}>
            <View style={styles.paymentHeader}>
              <Ionicons name="card-outline" size={24} color={colors.primary.main} />
              <Text style={styles.paymentTitle}>Payment Summary</Text>
            </View>
            
            <View style={styles.paymentDetails}>
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>Subtotal</Text>
                <Text style={styles.pricingValue}>{formatPrice(booking.subtotal)}</Text>
              </View>
              {booking.service_fee > 0 && (
                <View style={styles.pricingRow}>
                  <Text style={styles.pricingLabel}>Service Fee</Text>
                  <Text style={styles.pricingValue}>{formatPrice(booking.service_fee)}</Text>
                </View>
              )}
              {booking.insurance_fee > 0 && (
                <View style={styles.pricingRow}>
                  <Text style={styles.pricingLabel}>Insurance Fee</Text>
                  <Text style={styles.pricingValue}>{formatPrice(booking.insurance_fee)}</Text>
                </View>
              )}
              {booking.delivery_fee > 0 && (
                <View style={styles.pricingRow}>
                  <Text style={styles.pricingLabel}>Delivery Fee</Text>
                  <Text style={styles.pricingValue}>{formatPrice(booking.delivery_fee)}</Text>
                </View>
              )}
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>Security Deposit</Text>
                <Text style={styles.pricingValue}>{formatPrice(booking.deposit_amount || 0)}</Text>
              </View>
              
              <View style={[styles.pricingRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>
                  {formatPrice(booking.total_amount || (booking.subtotal + (booking.service_fee || 0) + (booking.insurance_fee || 0) + (booking.delivery_fee || 0) + (booking.deposit_amount || 0)))}
                </Text>
              </View>
            </View>
            
            {booking.payment_status === 'pending' && (
              <TouchableOpacity style={styles.paymentButton}>
                <Ionicons name="card" size={20} color={colors.white} />
                <Text style={styles.paymentButtonText}>Complete Payment</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <View style={styles.actionsCard}>
            {/* Cancel Booking Button */}
            {booking && user && canCancel && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.cancelBookingButton]}
                onPress={() => setShowCancelModal(true)}
              >
                <Ionicons name="close-circle" size={20} color={colors.semantic.error} />
                <Text style={styles.cancelBookingButtonText}>Cancel Booking</Text>
              </TouchableOpacity>
            )}
            
            
            {/* Show verification images if any exist */}
            {(booking?.pickup_images?.length > 0 || booking?.return_images?.length > 0 || booking?.damage_report || booking?.owner_notes) && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.verificationButton]}
                onPress={() => setShowVerificationModal(true)}
              >
                <Ionicons name="images" size={20} color={colors.primary.main} />
                <Text style={styles.verificationButtonText}>View Verification Photos & Reports</Text>
              </TouchableOpacity>
            )}
            
            {/* Show Report Issue button only if booking is not completed/disputed, or repurpose it to view damage reports */}
            {booking?.status === 'completed' || booking?.status === 'disputed' ? (
              (booking?.damage_report || booking?.owner_notes) && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.reportButton]}
                  onPress={() => setShowDamageReportsModal(true)}
                >
                  <Ionicons name="document-text" size={20} color={colors.semantic.warning} />
                  <Text style={styles.reportButtonText}>View Damage Reports</Text>
                </TouchableOpacity>
              )
            ) : (
              <TouchableOpacity 
                style={[styles.actionButton, styles.reportButton]}
                onPress={() => {
                  router.push(`/bookings/${booking.id}/report-issue`);
                }}
              >
                <Ionicons name="warning" size={20} color={colors.semantic.error} />
                <Text style={styles.reportButtonText}>Report Issue</Text>
              </TouchableOpacity>
            )}
            
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.viewButton]}
              onPress={() => {
                router.push(`/listing/${booking.listing_id}`);
              }}
            >
              <Ionicons name="document-text-outline" size={20} color={colors.text.primary} />
              <Text style={styles.viewButtonText}>View Listing</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Owner Actions (for owners only) */}
        {booking.status === 'pending' && user?.id === booking.owner_id && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Owner Actions</Text>
            <View style={styles.ownerActionsCard}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.approveButton]}
                onPress={() => {
                  Alert.alert(
                    'Approve Booking',
                    'Are you sure you want to approve this booking?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'Approve', 
                        onPress: async () => {
                          try {
                            const notificationApi = getNotificationApiService();
                            const response = await notificationApi.notifyBookingAction({
                              bookingId: booking.id,
                              action: 'approve',
                              userId: user.id
                            });
                            
                            if (response.success) {
                              queryClient.invalidateQueries({ queryKey: ['booking-details', id] });
                              queryClient.invalidateQueries({ queryKey: ['bookings'] });
                              Alert.alert('Success', 'Booking has been approved!');
                            } else {
                              Alert.alert('Error', response.error || 'Failed to approve booking');
                            }
                          } catch (error) {
                            Alert.alert('Error', 'Failed to approve booking');
                          }
                        }
                      }
                    ]
                  );
                }}
              >
                <Ionicons name="checkmark" size={20} color={colors.white} />
                <Text style={styles.approveButtonText}>Approve Booking</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.declineButton]}
                onPress={() => {
                  Alert.alert(
                    'Decline Booking',
                    'Are you sure you want to decline this booking?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'Decline', 
                        onPress: async () => {
                          try {
                            const notificationApi = getNotificationApiService();
                            const response = await notificationApi.notifyBookingAction({
                              bookingId: booking.id,
                              action: 'reject',
                              userId: user.id
                            });
                            
                            if (response.success) {
                              queryClient.invalidateQueries({ queryKey: ['booking-details', id] });
                              queryClient.invalidateQueries({ queryKey: ['bookings'] });
                              Alert.alert('Success', 'Booking has been declined.');
                            } else {
                              Alert.alert('Error', response.error || 'Failed to decline booking');
                            }
                          } catch (error) {
                            Alert.alert('Error', 'Failed to decline booking');
                          }
                        }
                      }
                    ]
                  );
                }}
              >
                <Ionicons name="close" size={20} color={colors.white} />
                <Text style={styles.declineButtonText}>Decline Booking</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Issue Reports Section */}
        <IssueReportsSection 
          bookingId={booking.id}
          onViewReports={() => {
            // TODO: Navigate to full issue reports list
            Alert.alert('Coming Soon', 'Full issue reports view will be available soon.');
          }}
        />

        {/* Additional Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Booking ID</Text>
              <Text style={styles.infoValue}>#{booking.id.slice(-8)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Created</Text>
              <Text style={styles.infoValue}>{formatDate(booking.created_at)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Payment Status</Text>
              <Text style={[styles.infoValue, { 
                color: booking.payment_status === 'paid' ? colors.semantic.success : colors.semantic.warning 
              }]}>
                {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* Review Section - Enhanced with existing review display */}
        {(() => {
          const renterConfirmedReturn = booking.return_confirmed_by_renter || false;
          const ownerConfirmedReturn = booking.return_confirmed_by_owner || false;
          const bothReturnConfirmed = renterConfirmedReturn && ownerConfirmedReturn;
          const canShowReview = (booking.status === 'completed' || bothReturnConfirmed) && booking.status !== 'disputed';
          const canLeaveReview = canShowReview && !existingReview && !reviewCheckLoading;

          if (!canShowReview) return null;

          return (
            <View style={styles.reviewCard}>
              {/* Card Header */}
              <View style={styles.reviewCardHeader}>
                <View style={styles.reviewIconContainer}>
                  <Ionicons name="star" size={20} color={colors.semantic.warning} />
                </View>
                <Text style={styles.reviewCardTitle}>Review Experience</Text>
              </View>
              
              {existingReview ? (
                /* Show existing review */
                <View style={styles.existingReviewContainer}>
                  <View style={styles.reviewHeader}>
                    {/* Profile Image */}
                    {existingReview.profiles?.avatar_url ? (
                      <Image
                        source={{ uri: existingReview.profiles.avatar_url }}
                        style={styles.reviewerAvatar}
                      />
                    ) : (
                      <View style={styles.reviewerAvatarPlaceholder}>
                        <Ionicons name="person" size={20} color={colors.gray[600]} />
                      </View>
                    )}
                    
                    <View style={styles.reviewInfo}>
                      {/* Reviewer Name and Rating */}
                      <Text style={styles.reviewerName}>Your Review</Text>
                      <View style={styles.reviewRatingContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Ionicons
                            key={star}
                            name={star <= existingReview.rating ? 'star' : 'star-outline'}
                            size={16}
                            color={star <= existingReview.rating ? colors.semantic.warning : colors.gray[300]}
                            style={{ marginRight: 2 }}
                          />
                        ))}
                        <Text style={styles.reviewRatingText}>
                          {existingReview.rating}/5
                        </Text>
                      </View>
                      {/* Review Date */}
                      <Text style={styles.reviewDate}>
                        Reviewed on {new Date(existingReview.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Review Comment */}
                  {existingReview.comment && (
                    <Text style={styles.reviewComment}>
                      {existingReview.comment}
                    </Text>
                  )}
                </View>
              ) : canLeaveReview ? (
                /* Show review button */
                <View style={styles.reviewPromptContainer}>
                  <Text style={styles.reviewPromptText}>
                    Your rental experience is complete! Share your review to help other renters.
                  </Text>
                  <TouchableOpacity
                    style={styles.reviewButton}
                    onPress={() => setShowReviewModal(true)}
                  >
                    <Ionicons name="star" size={20} color="white" />
                    <Text style={styles.reviewButtonText}>
                      Leave a Review
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                /* Loading state */
                <View style={styles.reviewLoadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary.main} />
                  <Text style={styles.reviewLoadingText}>Checking review status...</Text>
                </View>
              )}
            </View>
          );
        })()}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Cancel Booking Modal */}
      {booking && (
        <CancelBookingModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleCancelBooking}
          booking={{
            id: booking.id,
            title: booking.listings?.title || 'Unknown Item',
            start_date: booking.start_date,
            end_date: booking.end_date,
            total_amount: booking.total_amount || 0,
            owner_name: booking.listings?.profiles?.full_name || 'Unknown Owner',
            renter_name: booking.renter?.full_name || 'Unknown Renter',
          }}
          isRenter={user?.id === booking.renter_id}
        />
      )}

      {/* Review Modal */}
      {booking && (
        <ReviewModal
          visible={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          bookingId={booking.id}
          itemTitle={booking.listings?.title || 'Unknown Item'}
          recipientName={
            user?.id === booking.renter_id 
              ? booking.listings?.profiles?.full_name || 'Owner'
              : booking.renter?.full_name || 'Renter'
          }
          isRenter={user?.id === booking.renter_id}
          ownerId={booking.owner_id}
          renterId={booking.renter_id}
        />
      )}

      {/* Verification Images Modal */}
      <Modal
        visible={showVerificationModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Verification Photos & Reports</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowVerificationModal(false)}
            >
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {/* Pickup Images */}
            {booking?.pickup_images && booking.pickup_images.length > 0 && (
              <View style={styles.verificationSection}>
                <Text style={styles.verificationSectionTitle}>Pickup Verification Photos</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {booking.pickup_images.map((photo: any, index: number) => (
                    <Image
                      key={index}
                      source={{ uri: photo.url || photo.uri }}
                      style={styles.verificationImage}
                      resizeMode="cover"
                    />
                  ))}
                </ScrollView>
              </View>
            )}
            
            {/* Return Images */}
            {booking?.return_images && booking.return_images.length > 0 && (
              <View style={styles.verificationSection}>
                <Text style={styles.verificationSectionTitle}>Return Verification Photos</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {booking.return_images.map((photo: any, index: number) => (
                    <Image
                      key={index}
                      source={{ uri: photo.url || photo.uri }}
                      style={styles.verificationImage}
                      resizeMode="cover"
                    />
                  ))}
                </ScrollView>
              </View>
            )}
            
            {/* Damage Reports */}
            {(booking?.damage_report || booking?.owner_notes) && (
              <View style={styles.verificationSection}>
                <Text style={styles.verificationSectionTitle}>Damage & Issues Reports</Text>
                
                {booking.damage_report && (
                  <View style={styles.damageReportCard}>
                    <View style={styles.damageReportHeader}>
                      <Ionicons name="person" size={16} color={colors.primary.main} />
                      <Text style={styles.damageReportAuthor}>Renter's Report</Text>
                      {booking.damage_reported_at && (
                        <Text style={styles.damageReportDate}>
                          {new Date(booking.damage_reported_at).toLocaleDateString()}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.damageReportText}>{booking.damage_report}</Text>
                  </View>
                )}
                
                {booking.owner_notes && (
                  <View style={styles.damageReportCard}>
                    <View style={styles.damageReportHeader}>
                      <Ionicons name="business" size={16} color={colors.primary.main} />
                      <Text style={styles.damageReportAuthor}>Owner's Notes</Text>
                    </View>
                    <Text style={styles.damageReportText}>{booking.owner_notes}</Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Damage Reports Modal */}
      <Modal
        visible={showDamageReportsModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Damage Reports</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowDamageReportsModal(false)}
            >
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {booking?.damage_report && (
              <View style={styles.damageReportCard}>
                <View style={styles.damageReportHeader}>
                  <Ionicons name="person" size={16} color={colors.primary.main} />
                  <Text style={styles.damageReportAuthor}>Renter's Report</Text>
                  {booking.damage_reported_at && (
                    <Text style={styles.damageReportDate}>
                      {new Date(booking.damage_reported_at).toLocaleDateString()}
                    </Text>
                  )}
                </View>
                <Text style={styles.damageReportText}>{booking.damage_report}</Text>
              </View>
            )}
            
            {booking?.owner_notes && (
              <View style={styles.damageReportCard}>
                <View style={styles.damageReportHeader}>
                  <Ionicons name="business" size={16} color={colors.primary.main} />
                  <Text style={styles.damageReportAuthor}>Owner's Notes</Text>
                </View>
                <Text style={styles.damageReportText}>{booking.owner_notes}</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.lightGray,
  },
  scrollContainer: {
    flex: 1,
  },
  topSpacing: {
    height: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  statusText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  bookingStatusContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statusIcon: {
    marginRight: spacing.sm,
  },
  bookingStatusLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginRight: spacing.sm,
  },
  statusDescription: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  itemCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: 200,
  },
  itemDetails: {
    padding: spacing.md,
  },
  itemTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  itemCategory: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  itemPrice: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary.main,
  },
  periodCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    borderRadius: 12,
    padding: spacing.md,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateContent: {
    marginLeft: spacing.sm,
  },
  dateLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  dateValue: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  durationRow: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingTop: spacing.md,
  },
  durationText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    textAlign: 'center',
  },
  pickupConfirmationCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    borderRadius: 12,
    padding: spacing.md,
  },
  pickupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  pickupTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  locationSection: {
    marginBottom: spacing.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  locationText: {
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  pickupInstructions: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  pickupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  pickupButtonActive: {
    backgroundColor: colors.primary.main,
  },
  pickupButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  pickupButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    marginLeft: spacing.sm,
  },
  pickupButtonTextActive: {
    color: colors.white,
  },
  pickupButtonTextDisabled: {
    color: colors.gray[400],
  },
  pickupNote: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  userCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    borderRadius: 12,
    padding: spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDetails: {
    marginLeft: spacing.md,
    flex: 1,
  },
  userName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  userPhone: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  hostCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    borderRadius: 12,
    padding: spacing.md,
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  hostAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  hostAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  hostDetails: {
    marginLeft: spacing.md,
    flex: 1,
  },
  hostName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  hostRole: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  hostMessageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary.main,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 8,
    width: '100%',
  },
  hostMessageButtonText: {
    color: colors.primary.main,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    marginLeft: spacing.sm,
  },
  paymentSummaryCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    borderRadius: 12,
    padding: spacing.md,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  paymentTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  paymentDetails: {
    marginBottom: spacing.md,
  },
  paymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.main,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  paymentButtonText: {
    color: colors.white,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    marginLeft: spacing.sm,
  },
  pricingCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    borderRadius: 12,
    padding: spacing.md,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  pricingLabel: {
    fontSize: typography.sizes.base,
    color: colors.text.primary,
  },
  pricingValue: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    marginTop: spacing.sm,
    paddingTop: spacing.md,
  },
  totalLabel: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  totalValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary.main,
  },
  actionsCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    borderRadius: 12,
    padding: spacing.md,
  },
  ownerActionsCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    borderRadius: 12,
    padding: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  cancelBookingButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.semantic.error,
  },
  reportButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.semantic.error,
  },
  messageButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  viewButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  verificationButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  cancelBookingButtonText: {
    color: colors.semantic.error,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    marginLeft: spacing.sm,
  },
  reportButtonText: {
    color: colors.semantic.error,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    marginLeft: spacing.sm,
  },
  messageButtonText: {
    color: colors.primary.main,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    marginLeft: spacing.sm,
  },
  viewButtonText: {
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    marginLeft: spacing.sm,
  },
  verificationButtonText: {
    color: colors.primary.main,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    marginLeft: spacing.sm,
  },
  approveButton: {
    backgroundColor: colors.semantic.success,
  },
  declineButton: {
    backgroundColor: colors.semantic.error,
  },
  approveButtonText: {
    color: colors.white,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    marginLeft: spacing.sm,
  },
  declineButtonText: {
    color: colors.white,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    marginLeft: spacing.sm,
  },
  infoCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    borderRadius: 12,
    padding: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
  },
  infoValue: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
  reviewCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  reviewCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  reviewIconContainer: {
    width: 32,
    height: 32,
    backgroundColor: colors.semantic.warning + '20',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  reviewCardTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  existingReviewContainer: {
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.sm,
  },
  reviewerAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  reviewInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  reviewRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewRatingText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginLeft: spacing.xs,
  },
  reviewDate: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  reviewComment: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  reviewPromptContainer: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  reviewPromptText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  reviewButton: {
    backgroundColor: colors.primary.main,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  reviewButtonText: {
    color: colors.white,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    marginLeft: spacing.sm,
  },
  reviewLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  reviewLoadingText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  modalCloseButton: {
    padding: spacing.xs,
  },
  modalContent: {
    flex: 1,
    padding: spacing.md,
  },
  verificationSection: {
    marginBottom: spacing.lg,
  },
  verificationSectionTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  verificationImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: spacing.sm,
  },
  damageReportCard: {
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  damageReportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  damageReportAuthor: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginLeft: spacing.xs,
    flex: 1,
  },
  damageReportDate: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  damageReportText: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    lineHeight: 20,
  },
});