import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator, TextInput, Modal, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { colors, spacing, typography } from '../../src/lib/design-system';
import { useAuth } from '../../src/components/AuthProvider';
import { supabase } from '../../src/lib/supabase';
import { Calendar, DateData } from 'react-native-calendars';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { availabilityAPI } from '../../src/lib/api/availability';
import { CalendarAvailability } from '../../shared-dist/utils/calendar';
import { format, addDays, startOfDay } from 'date-fns';
import { PaymentWebView } from '../../src/components/PaymentWebView';

const { width: screenWidth } = Dimensions.get('window');

interface ListingData {
  id: string;
  title: string;
  description: string;
  price_per_day: number;
  price_weekly: number | null;
  price_hourly: number | null;
  deposit_amount: number | null;
  category: string;
  city: string;
  state: string;
  postal_code: string;
  address: string;
  delivery_available: boolean;
  pickup_available: boolean;
  images: string[];
  features: string[];
  created_at: string;
  profiles: {
    id: string;
    full_name: string;
    avatar_url: string;
    rating: number;
  };
}

export default function BookingScreen() {
  const { listingId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [listing, setListing] = useState<ListingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  
  // Calendar state
  const [selectedDates, setSelectedDates] = useState<{
    startDate: string | null;
    endDate: string | null;
  }>({
    startDate: null,
    endDate: null,
  });
  const [showCalendar, setShowCalendar] = useState(false);
  
  // Booking form state
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  
  // Payment WebView state
  const [showPaymentWebView, setShowPaymentWebView] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [includeInsurance, setIncludeInsurance] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);

  useEffect(() => {
    fetchListingDetails();
  }, [listingId]);

  // Fetch booking availability for the listing using the proper API
  const { data: availability = [], isLoading: availabilityLoading } = useQuery({
    queryKey: ['listing-availability', listingId],
    queryFn: async () => {
      const today = format(startOfDay(new Date()), 'yyyy-MM-dd');
      const maxDate = format(addDays(new Date(), 365), 'yyyy-MM-dd');
      
      return await availabilityAPI.getAvailabilitySafe(listingId, today, maxDate);
    },
    enabled: !!listingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });

  // Calculate marked dates for calendar
  const markedDates = useMemo(() => {
    const marked: any = {};

    // Mark availability status for each date
    availability.forEach((dateAvailability: CalendarAvailability) => {
      const { date, status } = dateAvailability;
      
      if (status !== 'available') {
        marked[date] = {
          ...marked[date],
          disabled: status === 'booked' || status === 'blocked',
          disableTouchEvent: status === 'booked' || status === 'blocked',
          color: status === 'booked' ? colors.semantic.error + '20' : colors.gray[200],
          textColor: status === 'booked' ? colors.semantic.error : colors.text.secondary,
          // Add dot for booked dates
          marked: status === 'booked' || status === 'blocked',
          dotColor: status === 'booked' ? colors.semantic.error : colors.gray[500],
        };
      }
    });

    // Mark today and past dates as disabled
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    for (let i = 0; i < 365; i++) {
      const date = new Date(yesterday);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      if (!marked[dateString]) {
        marked[dateString] = {
          disabled: true,
          disableTouchEvent: true,
          color: colors.gray[100],
          textColor: colors.text.secondary,
        };
      }
    }

    // Mark selected date range
    if (selectedDates.startDate && selectedDates.endDate) {
      const start = new Date(selectedDates.startDate);
      const end = new Date(selectedDates.endDate);

      // Mark start date
      marked[selectedDates.startDate] = {
        ...marked[selectedDates.startDate],
        selected: true,
        startingDay: true,
        color: colors.primary.main,
        textColor: colors.white,
        disabled: false,
        disableTouchEvent: false,
        marked: false, // Clear dot when selected
      };

      // Mark end date
      marked[selectedDates.endDate] = {
        ...marked[selectedDates.endDate],
        selected: true,
        endingDay: true,
        color: colors.primary.main,
        textColor: colors.white,
        disabled: false,
        disableTouchEvent: false,
        marked: false, // Clear dot when selected
      };

      // Mark days in between
      const current = new Date(start);
      current.setDate(current.getDate() + 1);
      
      while (current < end) {
        const dateString = current.toISOString().split('T')[0];
        const dateAvailability = availability.find(a => a.date === dateString);
        
        // Always mark the range, but respect availability status
        marked[dateString] = {
          ...marked[dateString], // Preserve existing availability status
          selected: true,
          color: colors.primary.main + '40', // Semi-transparent green for range
          textColor: colors.primary.main,
          disabled: dateAvailability?.status === 'booked' || dateAvailability?.status === 'blocked',
          disableTouchEvent: dateAvailability?.status === 'booked' || dateAvailability?.status === 'blocked',
          marked: false, // Clear dot when selected
        };
        current.setDate(current.getDate() + 1);
      }
    } else if (selectedDates.startDate) {
      // Mark only start date
      marked[selectedDates.startDate] = {
        ...marked[selectedDates.startDate],
        selected: true,
        color: colors.primary.main,
        textColor: colors.white,
        disabled: false,
        disableTouchEvent: false,
        marked: false, // Clear dot when selected
      };
    }

    return marked;
  }, [availability, selectedDates.startDate, selectedDates.endDate]);

  const fetchListingDetails = async () => {
    if (!listingId || typeof listingId !== 'string') {
      Alert.alert('Error', 'Invalid listing ID');
      router.back();
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        profiles:owner_id (
          id,
          full_name,
          avatar_url,
          rating
        ),
        images,
        address,
        city,
        state,
        postal_code
      `)
      .eq('id', listingId)
      .single();

    if (error) {
      console.error('Error fetching listing:', error);
      Alert.alert('Error', 'Failed to load listing details');
      router.back();
    } else {
      setListing(data);
    }
    setLoading(false);
  };

  const handleDayPress = (day: DateData) => {
    const dateString = day.dateString;
    
    // Check if date is unavailable using availability data
    const dateAvailability = availability.find(a => a.date === dateString);
    if (dateAvailability && dateAvailability.status !== 'available') {
      const statusMessage = dateAvailability.status === 'booked' 
        ? 'This date is already booked.' 
        : 'This date is not available.';
      Alert.alert('Date Unavailable', statusMessage);
      return;
    }

    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(dateString);
    
    if (selectedDate < today) {
      Alert.alert('Invalid Date', 'Cannot select dates in the past.');
      return;
    }

    if (!selectedDates.startDate) {
      // Start new selection - immediately set as single day booking
      setSelectedDates({
        startDate: dateString,
        endDate: dateString,
      });
    } else {
      // Handle range selection - both startDate and endDate exist, so start new selection
      const startDate = new Date(selectedDates.startDate);
      const endDate = new Date(dateString);

      if (endDate < startDate) {
        // Selected end date is before start date, swap them
        setSelectedDates({
          startDate: dateString,
          endDate: selectedDates.startDate,
        });
      } else if (endDate.getTime() === startDate.getTime()) {
        // Same date selected, keep as single day booking
        setSelectedDates({
          startDate: dateString,
          endDate: dateString,
        });
      } else {
        // Check if any dates in between are unavailable
        const datesInBetween: string[] = [];
        const current = new Date(startDate);
        current.setDate(current.getDate() + 1);
        
        while (current < endDate) {
          datesInBetween.push(current.toISOString().split('T')[0]);
          current.setDate(current.getDate() + 1);
        }

        const hasUnavailableDates = datesInBetween.some(date => {
          const dateAvailability = availability.find(a => a.date === date);
          return dateAvailability && dateAvailability.status !== 'available';
        });

        if (hasUnavailableDates) {
          Alert.alert(
            'Date Range Unavailable', 
            'Some dates in this range are already booked. Please select a different range.'
          );
          return;
        }

        // Valid range
        setSelectedDates({
          startDate: selectedDates.startDate,
          endDate: dateString,
        });
      }
    }
  };

  const handleClearDates = () => {
    setSelectedDates({ startDate: null, endDate: null });
  };

  const calculateDuration = () => {
    if (!selectedDates.startDate || !selectedDates.endDate) return 0;
    const start = new Date(selectedDates.startDate);
    const end = new Date(selectedDates.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const calculatePricing = () => {
    if (!listing || !selectedDates.startDate || !selectedDates.endDate) {
      return {
        subtotal: 0,
        serviceFee: 0,
        insuranceFee: 0,
        deliveryFee: deliveryMethod === 'delivery' ? 20 : 0,
        total: 0,
      };
    }

    const duration = calculateDuration();
    const subtotal = listing.price_per_day * duration;
    const serviceFee = subtotal * 0.15; // 15% service fee
    const insuranceFee = includeInsurance ? subtotal * 0.10 : 0; // 10% insurance (optional)
    const deliveryFee = deliveryMethod === 'delivery' ? 20 : 0;
    const total = subtotal + serviceFee + insuranceFee + deliveryFee;

    return {
      subtotal,
      serviceFee,
      insuranceFee,
      deliveryFee,
      total,
    };
  };

  const handleCreateBooking = async () => {
    if (!user || !listing || !selectedDates.startDate || !selectedDates.endDate) {
      Alert.alert('Error', 'Please select dates and ensure you are logged in.');
      return;
    }

    // Check if user is trying to book their own listing
    if (user.id === listing.profiles.id) {
      Alert.alert('Error', 'You cannot book your own listing');
      return;
    }

    setBookingLoading(true);
    try {
      const pricing = calculatePricing();

      // Convert dates to local timezone strings to avoid UTC conversion issues
      const startDateStr = selectedDates.startDate;
      const endDateStr = selectedDates.endDate;

      // Check for booking conflicts using RPC function
      const { data: conflictCheck, error: conflictError } = await supabase
        .rpc('check_booking_conflicts', {
          p_listing_id: listing.id,
          p_start_date: startDateStr,
          p_end_date: endDateStr,
          p_exclude_booking_id: null,
        });

      if (conflictError) {
        console.error('Conflict check error:', conflictError);
        Alert.alert('Error', 'Failed to check availability. Please try again.');
        return;
      }

      if (conflictCheck) {
        Alert.alert('Dates Unavailable', 'Sorry, these dates are no longer available. Please select different dates and try again.');
        return;
      }

      // Create booking with expiration for payment
      const expirationTime = new Date();
      expirationTime.setMinutes(expirationTime.getMinutes() + 30); // 30 minutes from now

      const { data: booking, error } = await supabase
        .from('bookings')
        .insert({
          listing_id: listing.id,
          renter_id: user.id,
          owner_id: listing.profiles.id,
          start_date: startDateStr,
          end_date: endDateStr,
          price_per_day: listing.price_per_day,
          subtotal: pricing.subtotal,
          service_fee: pricing.serviceFee,
          insurance_fee: pricing.insuranceFee,
          delivery_fee: pricing.deliveryFee,
          deposit_amount: 0, // Security deposit (can be configured later)
          total_amount: pricing.total,
          delivery_method: deliveryMethod,
          delivery_address: deliveryMethod === 'delivery' ? deliveryAddress.trim() : null,
          renter_message: specialInstructions || null,
          status: 'payment_required',
          expires_at: expirationTime.toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Booking creation error:', error);
        Alert.alert('Booking Failed', `Failed to create booking: ${error.message || 'Please try again.'}`);
        return;
      }

      console.log('Booking created successfully:', booking.id);
      
      // Store booking ID for potential cancellation
      setCurrentBookingId(booking.id);

      // Small delay to ensure booking is committed to database (handle replica lag)
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Create Stripe Checkout session via secure backend API
      console.log('Creating Stripe Checkout session via backend API...');

      try {
        // Get fresh session and refresh if needed
        let { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session?.access_token) {
          console.log('Session error or no access token, trying to refresh...');

          // Try to refresh the session
          const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();

          if (refreshError || !refreshedSession?.access_token) {
            console.error('Session refresh failed:', refreshError);
            Alert.alert(
              'Authentication Required', 
              'Your session has expired. Please sign in again to continue with payment.',
              [
                {
                  text: 'Sign In',
                  onPress: () => router.replace('/auth/sign-in')
                }
              ]
            );
            return;
          }

          // Use refreshed session
          session = refreshedSession;
          console.log('Session refreshed successfully');
        }

        console.log('Using session token for Edge Function call');

        // Call Supabase Edge Function to create Stripe Checkout session
        let checkoutData, checkoutError;
        
        try {
          console.log('Calling create-checkout-session Edge Function...');
          console.log('Booking ID:', booking.id);
          
          // Use direct fetch to avoid supabase.functions.invoke issues
          const fnUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/create-checkout-session`;
          const res = await fetch(fnUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
              'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string,
            },
            body: JSON.stringify({ bookingId: booking.id }),
          });

          const text = await res.text();
          console.log('Edge Function response status:', res.status);
          console.log('Edge Function response body:', text);

          if (!res.ok) {
            checkoutError = new Error(`HTTP ${res.status}: ${text}`);
          } else {
            try {
              checkoutData = JSON.parse(text);
              checkoutError = null;
              console.log('Parsed checkout data:', checkoutData);
            } catch (parseErr) {
              console.error('JSON parse error:', parseErr);
              checkoutError = new Error('Invalid JSON from Edge Function');
            }
          }
        } catch (edgeFunctionError) {
          console.error('Edge Function call failed:', edgeFunctionError);
          checkoutError = edgeFunctionError;
        }

        if (checkoutError) {
          console.error('Checkout session creation error:', checkoutError);
          
          // Check if it's a configuration error (missing Stripe key)
          if (checkoutError.message?.includes('Stripe configuration missing') || 
              checkoutError.message?.includes('STRIPE_SECRET_KEY')) {
            Alert.alert(
              'Payment Setup Required',
              'Payment processing is not fully configured yet. For now, your booking has been created and the owner will be notified.',
              [
                {
                  text: 'View Bookings',
                  onPress: () => router.replace('/bookings')
                }
              ]
            );
            return;
          }
          
          Alert.alert('Payment Error', `Failed to create payment session: ${checkoutError.message}`);
          return;
        }

        if (checkoutData?.url) {
          console.log('Stripe Checkout session created successfully');
          console.log('Opening Stripe Checkout URL:', checkoutData.url);
          
          // Open Stripe Checkout in WebView
          setPaymentUrl(checkoutData.url);
          setShowPaymentWebView(true);
        } else {
          Alert.alert('Payment Error', 'Failed to get payment URL. Please try again.');
        }
        
      } catch (error) {
        console.error('Payment session error:', error);
        Alert.alert('Payment Error', 'Failed to create payment session. Please try again.');
      }
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert('Booking Failed', 'Failed to create booking. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary.main} />
            <Text style={{ marginTop: spacing.md, color: colors.text.secondary }}>Loading booking details...</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  if (!listing) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: typography.sizes.lg, color: colors.text.primary }}>Listing not found</Text>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                marginTop: spacing.md,
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.sm,
                backgroundColor: colors.primary.main,
                borderRadius: 8
              }}
            >
              <Text style={{ color: colors.white, fontWeight: typography.weights.semibold }}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </>
    );
  }

  const pricing = calculatePricing();

  // Payment WebView callback functions
  const handlePaymentSuccess = () => {
    setShowPaymentWebView(false);
    
    // Clear booking ID since payment was successful
    setCurrentBookingId(null);
    
    Alert.alert(
      'Payment Successful!',
      'Your booking has been confirmed. You will receive a confirmation email shortly.',
      [
        {
          text: 'View My Bookings',
          onPress: () => router.replace('/bookings')
        },
        {
          text: 'OK',
          style: 'default'
        }
      ]
    );
  };

  const handlePaymentCancel = async () => {
    setShowPaymentWebView(false);
    
    // Delete the booking since payment was cancelled
    if (currentBookingId) {
      try {
        console.log('Deleting cancelled booking:', currentBookingId);
        
        const { error } = await supabase
          .from('bookings')
          .delete()
          .eq('id', currentBookingId);
          
        if (error) {
          console.error('Error deleting cancelled booking:', error);
        } else {
          console.log('Cancelled booking deleted successfully');
          
          // Invalidate availability cache to refresh blocked dates
          const listingIdStr = Array.isArray(listingId) ? listingId[0] : listingId;
          queryClient.invalidateQueries({ queryKey: ['listing-availability', listingIdStr] });
          console.log('Availability cache invalidated for listing:', listingIdStr);
        }
      } catch (error) {
        console.error('Failed to delete cancelled booking:', error);
      }
    }
    
    Alert.alert(
      'Payment Cancelled',
      'Your booking has been cancelled. The dates are now available for other users.',
      [
        {
          text: 'Try Again',
          onPress: () => {
            // Reset the booking ID so user can create a new booking
            setCurrentBookingId(null);
          },
          style: 'default'
        },
        {
          text: 'Go Back',
          onPress: () => router.back()
        }
      ]
    );
  };

  const handlePaymentError = async (error: string) => {
    setShowPaymentWebView(false);
    
    // Delete the booking since payment failed
    if (currentBookingId) {
      try {
        console.log('Deleting failed payment booking:', currentBookingId);
        
        const { error: deleteError } = await supabase
          .from('bookings')
          .delete()
          .eq('id', currentBookingId);
          
        if (deleteError) {
          console.error('Error deleting failed payment booking:', deleteError);
        } else {
          console.log('Failed payment booking deleted successfully');
          
          // Invalidate availability cache to refresh blocked dates
          const listingIdStr = Array.isArray(listingId) ? listingId[0] : listingId;
          queryClient.invalidateQueries({ queryKey: ['listing-availability', listingIdStr] });
          console.log('Availability cache invalidated for listing:', listingIdStr);
        }
      } catch (deleteError) {
        console.error('Failed to delete failed payment booking:', deleteError);
      }
    }
    
    Alert.alert(
      'Payment Error',
      `Payment failed: ${error}. Your booking has been cancelled and the dates are now available.`,
      [
        {
          text: 'Try Again',
          onPress: () => {
            // Reset the booking ID so user can create a new booking
            setCurrentBookingId(null);
          },
          style: 'default'
        },
        {
          text: 'Go Back',
          onPress: () => router.back()
        }
      ]
    );
  };

  // Get main image
  let mainImage = null;
  if (listing.images && listing.images.length > 0) {
    mainImage = listing.images[0];
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          backgroundColor: colors.white,
          borderBottomWidth: 1,
          borderBottomColor: colors.gray[200]
        }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.xs
            }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
            <Text style={{
              fontSize: typography.sizes.base,
              fontWeight: typography.weights.medium,
              color: colors.text.primary
            }}>
              Back
            </Text>
          </TouchableOpacity>
          
          <Text style={{
            fontSize: typography.sizes.lg,
            fontWeight: typography.weights.semibold,
            color: colors.text.primary
          }}>
            Book {listing.title}
          </Text>
          
          <View style={{ width: 80 }} />
        </View>

        {/* Main Content */}
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* Single Column Layout for Mobile */}
          <View style={{ padding: spacing.md }}>
            {/* Calendar Section */}
            <View style={{
              backgroundColor: colors.white,
              borderRadius: 12,
              padding: spacing.md,
              marginBottom: spacing.lg,
              shadowColor: colors.black,
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2
            }}>
              <Text style={{
                fontSize: typography.sizes.lg,
                fontWeight: typography.weights.semibold,
                color: colors.text.primary,
                marginBottom: spacing.md
              }}>
                Select Dates
              </Text>

              {/* Current Selection */}
              {(selectedDates.startDate || selectedDates.endDate) && (
                <View style={{
                  backgroundColor: colors.gray[50],
                  borderRadius: 8,
                  padding: spacing.sm,
                  marginBottom: spacing.md,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <Text style={{
                    fontSize: typography.sizes.base,
                    color: colors.text.primary
                  }}>
                    {selectedDates.startDate ? new Date(selectedDates.startDate).toLocaleDateString() : 'Not selected'} 
                    {selectedDates.endDate ? ` - ${new Date(selectedDates.endDate).toLocaleDateString()}` : ''}
                  </Text>
                  <View style={{
                    backgroundColor: colors.primary.main,
                    paddingHorizontal: spacing.sm,
                    paddingVertical: spacing.xs,
                    borderRadius: 12
                  }}>
                    <Text style={{
                      fontSize: typography.sizes.sm,
                      color: colors.white,
                      fontWeight: typography.weights.medium
                    }}>
                      {calculateDuration()} day{calculateDuration() === 1 ? '' : 's'}
                    </Text>
                  </View>
                </View>
              )}

              {/* Calendar */}
              <Calendar
                onDayPress={handleDayPress}
                markedDates={markedDates}
                markingType="period"
                theme={{
                  backgroundColor: colors.white,
                  calendarBackground: colors.white,
                  textSectionTitleColor: colors.text.primary,
                  selectedDayBackgroundColor: colors.primary.main,
                  selectedDayTextColor: colors.white,
                  todayTextColor: colors.primary.main,
                  dayTextColor: colors.text.primary,
                  textDisabledColor: colors.text.secondary,
                  dotColor: colors.primary.main,
                  selectedDotColor: colors.white,
                  arrowColor: colors.primary.main,
                  disabledArrowColor: colors.gray[300],
                  monthTextColor: colors.text.primary,
                  indicatorColor: colors.primary.main,
                  textDayFontFamily: 'System',
                  textMonthFontFamily: 'System',
                  textDayHeaderFontFamily: 'System',
                  textDayFontSize: 14,
                  textMonthFontSize: 16,
                  textDayHeaderFontSize: 12,
                }}
                minDate={new Date().toISOString().split('T')[0]}
                maxDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              />

              {/* Legend */}
              <View style={{
                backgroundColor: colors.gray[50],
                borderRadius: 8,
                padding: spacing.sm,
                marginTop: spacing.md
              }}>
                <Text style={{
                  fontSize: typography.sizes.sm,
                  fontWeight: typography.weights.medium,
                  color: colors.text.primary,
                  marginBottom: spacing.xs
                }}>
                  Legend
                </Text>
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  flexWrap: 'wrap',
                  gap: spacing.xs
                }}>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.xs
                  }}>
                    <View style={{
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: colors.primary.main
                    }} />
                    <Text style={{
                      fontSize: typography.sizes.xs,
                      color: colors.text.secondary
                    }}>
                      Selected
                    </Text>
                  </View>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.xs
                  }}>
                    <View style={{
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: colors.primary.main + '40'
                    }} />
                    <Text style={{
                      fontSize: typography.sizes.xs,
                      color: colors.text.secondary
                    }}>
                      Range
                    </Text>
                  </View>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.xs
                  }}>
                    <View style={{
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: colors.semantic.error
                    }} />
                    <Text style={{
                      fontSize: typography.sizes.xs,
                      color: colors.text.secondary
                    }}>
                      Booked
                    </Text>
                  </View>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.xs
                  }}>
                    <View style={{
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: colors.gray[500]
                    }} />
                    <Text style={{
                      fontSize: typography.sizes.xs,
                      color: colors.text.secondary
                    }}>
                      Blocked
                    </Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={{
                flexDirection: 'row',
                gap: spacing.sm,
                marginTop: spacing.md
              }}>
                {(selectedDates.startDate || selectedDates.endDate) && (
                  <TouchableOpacity
                    onPress={handleClearDates}
                    style={{
                      flex: 1,
                      backgroundColor: colors.white,
                      borderWidth: 1,
                      borderColor: colors.gray[300],
                      padding: spacing.sm,
                      borderRadius: 8,
                      alignItems: 'center'
                    }}
                  >
                    <Text style={{
                      fontSize: typography.sizes.sm,
                      fontWeight: typography.weights.medium,
                      color: colors.text.secondary
                    }}>
                      Clear Selection
                    </Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  onPress={() => {
                    // Refetch availability data
                    if (availabilityLoading) return;
                    queryClient.invalidateQueries({ queryKey: ['listing-availability', listingId] });
                  }}
                  disabled={availabilityLoading}
                  style={{
                    flex: 1,
                    backgroundColor: availabilityLoading ? colors.gray[200] : colors.gray[100],
                    padding: spacing.sm,
                    borderRadius: 8,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: spacing.xs
                  }}
                >
                  {availabilityLoading && (
                    <ActivityIndicator size="small" color={colors.text.secondary} />
                  )}
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    fontWeight: typography.weights.medium,
                    color: colors.text.secondary
                  }}>
                    {availabilityLoading ? 'Loading...' : 'Refresh'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Price Breakdown Section */}
            <View style={{
              backgroundColor: colors.white,
              borderRadius: 12,
              padding: spacing.md,
              marginBottom: spacing.lg,
              shadowColor: colors.black,
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2
            }}>
              <Text style={{
                fontSize: typography.sizes.lg,
                fontWeight: typography.weights.semibold,
                color: colors.text.primary,
                marginBottom: spacing.md
              }}>
                Price Breakdown
              </Text>

              <View style={{ gap: spacing.sm }}>
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <View>
                    <Text style={{
                      fontSize: typography.sizes.base,
                      color: colors.text.primary
                    }}>
                      Rental fee
                    </Text>
                    <Text style={{
                      fontSize: typography.sizes.sm,
                      color: colors.text.secondary
                    }}>
                      {calculateDuration()} day{calculateDuration() === 1 ? '' : 's'} × ${listing.price_per_day}
                    </Text>
                  </View>
                  <Text style={{
                    fontSize: typography.sizes.base,
                    fontWeight: typography.weights.medium,
                    color: colors.text.primary
                  }}>
                    ${pricing.subtotal.toFixed(2)}
                  </Text>
                </View>

                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <View>
                    <Text style={{
                      fontSize: typography.sizes.base,
                      color: colors.text.primary
                    }}>
                      Service fee
                    </Text>
                    <Text style={{
                      fontSize: typography.sizes.sm,
                      color: colors.text.secondary
                    }}>
                      15% of rental fee
                    </Text>
                  </View>
                  <Text style={{
                    fontSize: typography.sizes.base,
                    fontWeight: typography.weights.medium,
                    color: colors.text.primary
                  }}>
                    ${pricing.serviceFee.toFixed(2)}
                  </Text>
                </View>

                {/* Insurance Toggle */}
                <TouchableOpacity
                  onPress={() => setIncludeInsurance(!includeInsurance)}
                  style={{
                    backgroundColor: includeInsurance ? colors.primary.main + '10' : colors.gray[50],
                    borderRadius: 8,
                    padding: spacing.sm,
                    borderWidth: 1,
                    borderColor: includeInsurance ? colors.primary.main : colors.gray[200]
                  }}
                >
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <View style={{ flex: 1 }}>
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: spacing.xs
                      }}>
                        <View style={{
                          width: 20,
                          height: 20,
                          borderRadius: 4,
                          borderWidth: 2,
                          borderColor: includeInsurance ? colors.primary.main : colors.gray[400],
                          backgroundColor: includeInsurance ? colors.primary.main : colors.white,
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {includeInsurance && (
                            <Ionicons name="checkmark" size={12} color={colors.white} />
                          )}
                        </View>
                        <Text style={{
                          fontSize: typography.sizes.base,
                          color: colors.text.primary,
                          fontWeight: typography.weights.medium
                        }}>
                          Damage Protection
                        </Text>
                      </View>
                      <Text style={{
                        fontSize: typography.sizes.sm,
                        color: colors.text.secondary,
                        marginTop: spacing.xs,
                        marginLeft: 28
                      }}>
                        10% of rental fee - Optional coverage
                      </Text>
                    </View>
                    <Text style={{
                      fontSize: typography.sizes.base,
                      fontWeight: typography.weights.medium,
                      color: includeInsurance ? colors.primary.main : colors.text.secondary
                    }}>
                      ${pricing.insuranceFee.toFixed(2)}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Delivery Fee */}
                {deliveryMethod === 'delivery' && (
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <View>
                      <Text style={{
                        fontSize: typography.sizes.base,
                        color: colors.text.primary
                      }}>
                        Delivery fee
                      </Text>
                      <Text style={{
                        fontSize: typography.sizes.sm,
                        color: colors.text.secondary
                      }}>
                        Delivery service
                      </Text>
                    </View>
                    <Text style={{
                      fontSize: typography.sizes.base,
                      fontWeight: typography.weights.medium,
                      color: colors.text.primary
                    }}>
                      ${pricing.deliveryFee.toFixed(2)}
                    </Text>
                  </View>
                )}

                <View style={{
                  borderTopWidth: 1,
                  borderTopColor: colors.gray[200],
                  paddingTop: spacing.sm,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Text style={{
                    fontSize: typography.sizes.lg,
                    fontWeight: typography.weights.semibold,
                    color: colors.text.primary
                  }}>
                    Total
                  </Text>
                  <Text style={{
                    fontSize: typography.sizes.lg,
                    fontWeight: typography.weights.semibold,
                    color: colors.text.primary
                  }}>
                    ${pricing.total.toFixed(2)}
                  </Text>
                </View>
              </View>

              <View style={{
                backgroundColor: colors.gray[50],
                borderRadius: 8,
                padding: spacing.sm,
                marginTop: spacing.md
              }}>
                <Text style={{
                  fontSize: typography.sizes.xs,
                  color: colors.text.secondary,
                  lineHeight: 16
                }}>
                  • Service fee helps us run a safe and reliable platform{'\n'}
                  {includeInsurance ? '• Insurance fee provides damage protection coverage\n' : ''}
                  {deliveryMethod === 'delivery' ? '• Delivery fee covers transportation to your location\n' : ''}
                  • All prices are in AUD and include GST where applicable
                </Text>
              </View>
            </View>

            {/* Booking Details Section */}
            <View style={{
              backgroundColor: colors.white,
              borderRadius: 12,
              padding: spacing.md,
              marginBottom: spacing.lg,
              shadowColor: colors.black,
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2
            }}>
              <Text style={{
                fontSize: typography.sizes.lg,
                fontWeight: typography.weights.semibold,
                color: colors.text.primary,
                marginBottom: spacing.md
              }}>
                Booking Details
              </Text>

              {/* Delivery Method */}
              <View style={{ marginBottom: spacing.md }}>
                <Text style={{
                  fontSize: typography.sizes.base,
                  fontWeight: typography.weights.medium,
                  color: colors.text.primary,
                  marginBottom: spacing.sm
                }}>
                  Delivery Method
                </Text>
                
                <View style={{ gap: spacing.sm }}>
                  <TouchableOpacity
                    onPress={() => setDeliveryMethod('pickup')}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.sm,
                      padding: spacing.sm,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: deliveryMethod === 'pickup' ? colors.primary.main : colors.gray[300],
                      backgroundColor: deliveryMethod === 'pickup' ? colors.primary.main + '10' : colors.white
                    }}
                  >
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: deliveryMethod === 'pickup' ? colors.primary.main : colors.gray[400],
                      backgroundColor: deliveryMethod === 'pickup' ? colors.primary.main : colors.white,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {deliveryMethod === 'pickup' && (
                        <View style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: colors.white
                        }} />
                      )}
                    </View>
                    <Text style={{
                      fontSize: typography.sizes.base,
                      color: colors.text.primary
                    }}>
                      Pickup
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setDeliveryMethod('delivery')}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.sm,
                      padding: spacing.sm,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: deliveryMethod === 'delivery' ? colors.primary.main : colors.gray[300],
                      backgroundColor: deliveryMethod === 'delivery' ? colors.primary.main + '10' : colors.white
                    }}
                  >
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: deliveryMethod === 'delivery' ? colors.primary.main : colors.gray[400],
                      backgroundColor: deliveryMethod === 'delivery' ? colors.primary.main : colors.white,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {deliveryMethod === 'delivery' && (
                        <View style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: colors.white
                        }} />
                      )}
                    </View>
                    <Text style={{
                      fontSize: typography.sizes.base,
                      color: colors.text.primary
                    }}>
                      Delivery (+$20)
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Delivery Address (if delivery selected) */}
              {deliveryMethod === 'delivery' && (
                <View style={{ marginBottom: spacing.md }}>
                  <Text style={{
                    fontSize: typography.sizes.base,
                    fontWeight: typography.weights.medium,
                    color: colors.text.primary,
                    marginBottom: spacing.sm
                  }}>
                    Delivery Address
                  </Text>
                  <TextInput
                    value={deliveryAddress}
                    onChangeText={setDeliveryAddress}
                    placeholder="Enter your delivery address..."
                    multiline
                    numberOfLines={2}
                    style={{
                      borderWidth: 1,
                      borderColor: colors.gray[300],
                      borderRadius: 8,
                      padding: spacing.sm,
                      fontSize: typography.sizes.base,
                      color: colors.text.primary,
                      textAlignVertical: 'top'
                    }}
                  />
                </View>
              )}

              {/* Notes */}
              <View>
                <Text style={{
                  fontSize: typography.sizes.base,
                  fontWeight: typography.weights.medium,
                  color: colors.text.primary,
                  marginBottom: spacing.sm
                }}>
                  Notes for Host (Optional)
                </Text>
                <TextInput
                  value={specialInstructions}
                  onChangeText={setSpecialInstructions}
                  placeholder="Any special requests or information..."
                  multiline
                  numberOfLines={3}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.gray[300],
                    borderRadius: 8,
                    padding: spacing.sm,
                    fontSize: typography.sizes.base,
                    color: colors.text.primary,
                    textAlignVertical: 'top'
                  }}
                />
              </View>
            </View>

            {/* Book Now Button */}
            <TouchableOpacity
              onPress={handleCreateBooking}
              disabled={!selectedDates.startDate || !selectedDates.endDate || bookingLoading}
              style={{
                backgroundColor: (!selectedDates.startDate || !selectedDates.endDate) ? colors.gray[300] : colors.primary.main,
                padding: spacing.lg,
                borderRadius: 12,
                alignItems: 'center',
                marginBottom: spacing.xl,
                shadowColor: colors.black,
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4
              }}
            >
              {bookingLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={{
                  fontSize: typography.sizes.xl,
                  fontWeight: typography.weights.semibold,
                  color: colors.white
                }}>
                  Book & Pay Now - ${pricing.total.toFixed(2)}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Payment WebView Modal */}
      <PaymentWebView
        isVisible={showPaymentWebView}
        paymentUrl={paymentUrl}
        onSuccess={handlePaymentSuccess}
        onCancel={handlePaymentCancel}
        onError={handlePaymentError}
      />
    </>
  );
} 