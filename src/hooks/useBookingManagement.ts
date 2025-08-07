import { useQuery, useMutation, gql } from '@apollo/client';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';

// Mobile-optimized booking queries with reduced data for performance
const GET_BOOKING_MOBILE = gql`
  query GetBookingMobile($bookingId: ID!) {
    booking(id: $bookingId) {
      id
      start_date
      end_date
      status
      total_amount
      platform_fee
      security_deposit
      special_requests
      created_at
      
      # Essential listing details for mobile
      listing {
        id
        title
        price_per_day
        category
        images(limit: 3)
        location {
          city
          state
        }
        
        # Owner essentials
        owner {
          id
          full_name
          avatar_url
          verified
        }
      }
      
      # Renter essentials
      renter {
        id
        full_name
        avatar_url
        verified
      }
      
      # Recent messages only (mobile optimization)
      messages(first: 3) {
        edges {
          node {
            id
            content
            created_at
            sender {
              id
              full_name
            }
          }
        }
      }
    }
  }
`;

const GET_USER_BOOKINGS_MOBILE = gql`
  query GetUserBookingsMobile($userId: ID, $filter: BookingFilter, $first: Int = 10) {
    bookings(userId: $userId, filter: $filter, first: $first) {
      edges {
        node {
          id
          start_date
          end_date
          status
          total_amount
          created_at
          
          # Minimal listing data for list view
          listing {
            id
            title
            images(limit: 1)
            price_per_day
            location {
              city
              state
            }
            owner {
              id
              full_name
              avatar_url
            }
          }
          
          renter {
            id
            full_name
            avatar_url
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

// Mobile booking creation with offline support
const CREATE_BOOKING_MOBILE = gql`
  mutation CreateBookingMobile($input: CreateBookingInput!) {
    createBooking(input: $input) {
      success
      message
      booking {
        id
        start_date
        end_date
        status
        total_amount
        
        listing {
          id
          title
          owner {
            id
            full_name
          }
        }
      }
      payment_client_secret
    }
  }
`;

const UPDATE_BOOKING_STATUS_MOBILE = gql`
  mutation UpdateBookingStatusMobile($input: UpdateBookingStatusInput!) {
    updateBookingStatus(input: $input) {
      success
      message
      booking {
        id
        status
        updated_at
      }
    }
  }
`;

const CANCEL_BOOKING_MOBILE = gql`
  mutation CancelBookingMobile($input: CancelBookingInput!) {
    cancelBooking(input: $input) {
      success
      message
      refund_amount
      cancellation_fee
      booking {
        id
        status
        refund_amount
      }
    }
  }
`;

// Hook for getting a specific booking (mobile optimized)
export function useBooking(bookingId: string) {
  const {
    data,
    loading,
    error,
    refetch
  } = useQuery(GET_BOOKING_MOBILE, {
    variables: { bookingId },
    skip: !bookingId,
    errorPolicy: 'all',
    // Mobile optimizations
    fetchPolicy: 'cache-first', // Prefer cache for mobile
    notifyOnNetworkStatusChange: true,
  });

  return {
    booking: data?.booking,
    loading,
    error,
    refetch,
    
    // Computed values
    isOwner: data?.booking?.listing?.owner?.id === data?.booking?.renter?.id,
    canModify: ['pending', 'confirmed'].includes(data?.booking?.status),
    canCancel: ['pending', 'confirmed'].includes(data?.booking?.status),
    messageCount: data?.booking?.messages?.edges?.length || 0,
    
    // Mobile specific helpers
    isUpcoming: data?.booking ? new Date(data.booking.start_date) > new Date() : false,
    isActive: data?.booking ? 
      new Date(data.booking.start_date) <= new Date() && 
      new Date(data.booking.end_date) >= new Date() : false,
  };
}

// Hook for getting user's bookings (mobile optimized with pagination)
export function useUserBookings(userId?: string, filter?: any) {
  const {
    data,
    loading,
    error,
    fetchMore,
    refetch
  } = useQuery(GET_USER_BOOKINGS_MOBILE, {
    variables: { userId, filter, first: 10 },
    errorPolicy: 'all',
    fetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  });

  const loadMore = async () => {
    if (data?.bookings?.pageInfo?.hasNextPage) {
      try {
        await fetchMore({
          variables: {
            after: data.bookings.pageInfo.endCursor
          }
        });
      } catch (error) {
        console.error('Failed to load more bookings:', error);
      }
    }
  };

  return {
    bookings: data?.bookings?.edges?.map((edge: any) => edge.node) || [],
    loading,
    error,
    refetch,
    loadMore,
    hasMore: data?.bookings?.pageInfo?.hasNextPage || false,
    totalCount: data?.bookings?.totalCount || 0,
    
    // Mobile convenience filters
    upcomingBookings: data?.bookings?.edges?.map((edge: any) => edge.node)
      .filter((booking: any) => new Date(booking.start_date) > new Date()) || [],
    activeBookings: data?.bookings?.edges?.map((edge: any) => edge.node)
      .filter((booking: any) => 
        new Date(booking.start_date) <= new Date() && 
        new Date(booking.end_date) >= new Date()
      ) || [],
    pastBookings: data?.bookings?.edges?.map((edge: any) => edge.node)
      .filter((booking: any) => new Date(booking.end_date) < new Date()) || [],
  };
}

// Hook for creating a new booking (mobile with offline support)
export function useCreateBooking() {
  const [createBooking, { loading }] = useMutation(CREATE_BOOKING_MOBILE, {
    // Optimistic response for immediate UI feedback
    optimisticResponse: (variables) => ({
      createBooking: {
        success: true,
        message: 'Creating booking...',
        booking: {
          id: 'temp-' + Date.now(),
          start_date: variables.input.start_date,
          end_date: variables.input.end_date,
          status: 'pending',
          total_amount: variables.input.total_amount || 0,
          listing: {
            id: variables.input.listing_id,
            title: 'Loading...',
            owner: {
              id: 'unknown',
              full_name: 'Loading...',
            },
          },
        },
        payment_client_secret: null,
      },
    }),
  });
  
  const router = useRouter();
  
  const createNewBooking = async (bookingData: any) => {
    try {
      const result = await createBooking({
        variables: {
          input: bookingData
        },
        // Update cache after successful creation
        update: (cache, { data }) => {
          if (data?.createBooking?.success) {
            // Invalidate relevant queries for fresh data
            cache.evict({ fieldName: 'bookings' });
            cache.gc();
          }
        }
      });

      if (result.data?.createBooking?.success) {
        Alert.alert(
          'Booking Sent!',
          'Your booking request has been sent to the owner.',
          [
            {
              text: 'View Booking',
              onPress: () => {
                const bookingId = result.data.createBooking.booking.id;
                router.push(`/bookings/${bookingId}`);
              }
            }
          ]
        );
        
        return { 
          success: true, 
          booking: result.data.createBooking.booking,
          paymentClientSecret: result.data.createBooking.payment_client_secret
        };
      } else {
        Alert.alert('Error', result.data?.createBooking?.message || 'Failed to create booking');
        return { success: false, error: result.data?.createBooking?.message };
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create booking. Please check your connection and try again.');
      return { success: false, error };
    }
  };

  return {
    createNewBooking,
    loading
  };
}

// Hook for updating booking status (mobile optimized)
export function useUpdateBookingStatus() {
  const [updateStatus, { loading }] = useMutation(UPDATE_BOOKING_STATUS_MOBILE, {
    optimisticResponse: (variables) => ({
      updateBookingStatus: {
        success: true,
        message: 'Updating status...',
        booking: {
          id: variables.input.booking_id,
          status: variables.input.status,
          updated_at: new Date().toISOString(),
        },
      },
    }),
  });
  
  const updateBookingStatus = async (bookingId: string, status: string, note?: string) => {
    try {
      const result = await updateStatus({
        variables: {
          input: { booking_id: bookingId, status, note }
        }
      });

      if (result.data?.updateBookingStatus?.success) {
        Alert.alert('Success', `Booking ${status.toLowerCase()} successfully!`);
        return { success: true, booking: result.data.updateBookingStatus.booking };
      } else {
        Alert.alert('Error', result.data?.updateBookingStatus?.message || 'Failed to update booking');
        return { success: false };
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update booking status');
      return { success: false, error };
    }
  };

  return {
    updateBookingStatus,
    loading
  };
}

// Hook for canceling bookings (mobile optimized)
export function useCancelBooking() {
  const [cancelBooking, { loading }] = useMutation(CANCEL_BOOKING_MOBILE, {
    optimisticResponse: (variables) => ({
      cancelBooking: {
        success: true,
        message: 'Canceling booking...',
        refund_amount: 0,
        cancellation_fee: 0,
        booking: {
          id: variables.input.booking_id,
          status: 'canceled',
          refund_amount: 0,
        },
      },
    }),
  });
  
  const cancelUserBooking = async (bookingId: string, reason: string) => {
    return new Promise((resolve) => {
      Alert.alert(
        'Cancel Booking',
        'Are you sure you want to cancel this booking? This action cannot be undone.',
        [
          {
            text: 'Keep Booking',
            style: 'cancel',
            onPress: () => resolve({ success: false, cancelled: true })
          },
          {
            text: 'Cancel Booking',
            style: 'destructive',
            onPress: async () => {
              try {
                const result = await cancelBooking({
                  variables: {
                    input: { booking_id: bookingId, cancellation_reason: reason }
                  }
                });

                if (result.data?.cancelBooking?.success) {
                  const refundAmount = result.data.cancelBooking.refund_amount;
                  const cancellationFee = result.data.cancelBooking.cancellation_fee;
                  
                  Alert.alert(
                    'Booking Canceled',
                    `Your booking has been canceled. ${refundAmount > 0 ? `Refund: $${refundAmount}` : 'No refund available.'}`,
                    [{ text: 'OK' }]
                  );
                  
                  resolve({ 
                    success: true, 
                    refundAmount, 
                    cancellationFee,
                    booking: result.data.cancelBooking.booking 
                  });
                } else {
                  Alert.alert('Error', result.data?.cancelBooking?.message || 'Failed to cancel booking');
                  resolve({ success: false });
                }
              } catch (error) {
                Alert.alert('Error', 'Failed to cancel booking');
                resolve({ success: false, error });
              }
            }
          }
        ]
      );
    });
  };

  return {
    cancelUserBooking,
    loading
  };
}

// Hook for owner actions (approve/reject) with mobile UX
export function useOwnerBookingActions() {
  const [updateStatus] = useMutation(UPDATE_BOOKING_STATUS_MOBILE);
  
  const approveUserBooking = async (bookingId: string, message?: string) => {
    return new Promise((resolve) => {
      Alert.alert(
        'Approve Booking',
        'Approve this booking request? The renter will be notified immediately.',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve({ success: false }) },
          {
            text: 'Approve',
            onPress: async () => {
              try {
                const result = await updateStatus({
                  variables: {
                    input: { booking_id: bookingId, status: 'confirmed', note: message }
                  }
                });

                if (result.data?.updateBookingStatus?.success) {
                  Alert.alert('Success', 'Booking approved! The renter has been notified.');
                  resolve({ success: true, booking: result.data.updateBookingStatus.booking });
                } else {
                  Alert.alert('Error', 'Failed to approve booking');
                  resolve({ success: false });
                }
              } catch (error) {
                Alert.alert('Error', 'Failed to approve booking');
                resolve({ success: false, error });
              }
            }
          }
        ]
      );
    });
  };

  const rejectUserBooking = async (bookingId: string, reason: string) => {
    return new Promise((resolve) => {
      Alert.alert(
        'Reject Booking',
        'Reject this booking request? The renter will be notified and automatically refunded.',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve({ success: false }) },
          {
            text: 'Reject',
            style: 'destructive',
            onPress: async () => {
              try {
                const result = await updateStatus({
                  variables: {
                    input: { booking_id: bookingId, status: 'rejected', note: reason }
                  }
                });

                if (result.data?.updateBookingStatus?.success) {
                  Alert.alert('Booking Rejected', 'The booking has been rejected and the renter has been notified.');
                  resolve({ success: true, booking: result.data.updateBookingStatus.booking });
                } else {
                  Alert.alert('Error', 'Failed to reject booking');
                  resolve({ success: false });
                }
              } catch (error) {
                Alert.alert('Error', 'Failed to reject booking');
                resolve({ success: false, error });
              }
            }
          }
        ]
      );
    });
  };

  return {
    approveUserBooking,
    rejectUserBooking,
    loading: false // Since we're using the shared mutation
  };
}

// Mobile-specific utility hooks
export function useBookingNotifications() {
  // This would integrate with push notifications
  // For now, just return placeholder functions
  
  const scheduleBookingReminder = async (bookingId: string, reminderTime: Date) => {
    // Implementation would use Expo Notifications
    console.log('Scheduling reminder for booking:', bookingId, 'at', reminderTime);
  };

  const cancelBookingReminder = async (bookingId: string) => {
    // Implementation would cancel scheduled notifications
    console.log('Canceling reminder for booking:', bookingId);
  };

  return {
    scheduleBookingReminder,
    cancelBookingReminder
  };
}

// Mobile booking filters and sorting
export function useBookingFilters() {
  const getFilteredBookings = (bookings: any[], filters: {
    status?: string;
    dateRange?: 'upcoming' | 'past' | 'current';
    sortBy?: 'date' | 'amount' | 'status';
  }) => {
    let filtered = [...bookings];

    // Filter by status
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(booking => booking.status === filters.status);
    }

    // Filter by date range
    if (filters.dateRange) {
      const now = new Date();
      filtered = filtered.filter(booking => {
        const startDate = new Date(booking.start_date);
        const endDate = new Date(booking.end_date);
        
        switch (filters.dateRange) {
          case 'upcoming':
            return startDate > now;
          case 'past':
            return endDate < now;
          case 'current':
            return startDate <= now && endDate >= now;
          default:
            return true;
        }
      });
    }

    // Sort bookings
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case 'date':
            return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
          case 'amount':
            return b.total_amount - a.total_amount;
          case 'status':
            return a.status.localeCompare(b.status);
          default:
            return 0;
        }
      });
    }

    return filtered;
  };

  return { getFilteredBookings };
} 