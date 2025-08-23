import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator, TextInput, Modal, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { colors, spacing, typography } from '../../src/lib/design-system';
import { useAuth } from '../../src/components/AuthProvider';
import { supabase } from '../../src/lib/supabase';
import { Calendar, DateData } from 'react-native-calendars';
import { useQuery } from '@tanstack/react-query';

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

  useEffect(() => {
    fetchListingDetails();
  }, [listingId]);

  // Fetch booking availability for the listing
  const { data: unavailableDates = [] } = useQuery({
    queryKey: ['listing-availability', listingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('start_date, end_date')
        .eq('listing_id', listingId)
        .in('status', ['confirmed', 'active', 'pending'])
        .gte('end_date', new Date().toISOString().split('T')[0]);

      if (error) throw error;
      
      // Generate array of unavailable dates
      const unavailable: string[] = [];
      data.forEach(booking => {
        const start = new Date(booking.start_date);
        const end = new Date(booking.end_date);
        
        for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
          unavailable.push(d.toISOString().split('T')[0]);
        }
      });
      
      return unavailable;
    },
    enabled: !!listingId,
  });

  // Calculate marked dates for calendar
  const markedDates = useMemo(() => {
    const marked: any = {}; // Changed from MarkedDates to any

    // Mark unavailable dates
    unavailableDates.forEach(date => {
      marked[date] = {
        disabled: true,
        disableTouchEvent: true,
        color: colors.gray[200],
        textColor: colors.text.secondary,
      };
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
      };

      // Mark days in between
      const current = new Date(start);
      current.setDate(current.getDate() + 1);
      
      while (current < end) {
        const dateString = current.toISOString().split('T')[0];
        if (!unavailableDates.includes(dateString)) {
          marked[dateString] = {
            selected: true,
            color: colors.primary.main + '40', // Semi-transparent
            textColor: colors.primary.main,
            disabled: false,
            disableTouchEvent: false,
          };
        }
        current.setDate(current.getDate() + 1);
      }
    }

    return marked;
  }, [unavailableDates, selectedDates.startDate, selectedDates.endDate]);

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
    
    // Check if date is unavailable
    if (unavailableDates.includes(dateString)) {
      Alert.alert('Date Unavailable', 'This date is already booked.');
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

    if (!selectedDates.startDate || (selectedDates.startDate && selectedDates.endDate)) {
      // Start new selection
      setSelectedDates({
        startDate: dateString,
        endDate: null,
      });
    } else if (selectedDates.startDate && !selectedDates.endDate) {
      const startDate = new Date(selectedDates.startDate);
      const endDate = new Date(dateString);

      if (endDate < startDate) {
        // Selected end date is before start date, swap them
        setSelectedDates({
          startDate: dateString,
          endDate: selectedDates.startDate,
        });
      } else if (endDate.getTime() === startDate.getTime()) {
        // Same date selected, clear selection
        setSelectedDates({
          startDate: null,
          endDate: null,
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

        const hasUnavailableDates = datesInBetween.some(date => 
          unavailableDates.includes(date)
        );

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
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculatePricing = () => {
    if (!listing || !selectedDates.startDate || !selectedDates.endDate) {
      return {
        rentalFee: 0,
        serviceFee: 0,
        damageProtection: 0,
        deliveryFee: deliveryMethod === 'delivery' ? 20 : 0,
        total: 0,
      };
    }

    const duration = calculateDuration();
    const rentalFee = listing.price_per_day * duration;
    const serviceFee = rentalFee * 0.15; // 15% service fee
    const damageProtection = rentalFee * 0.10; // 10% damage protection
    const deliveryFee = deliveryMethod === 'delivery' ? 20 : 0;
    const total = rentalFee + serviceFee + damageProtection + deliveryFee;

    return {
      rentalFee,
      serviceFee,
      damageProtection,
      deliveryFee,
      total,
    };
  };

  const handleCreateBooking = async () => {
    if (!user || !listing || !selectedDates.startDate || !selectedDates.endDate) {
      Alert.alert('Error', 'Please select dates and ensure you are logged in.');
      return;
    }

    setBookingLoading(true);
    try {
      const pricing = calculatePricing();
      
      const { data: booking, error } = await supabase
        .from('bookings')
        .insert({
          listing_id: listing.id,
          renter_id: user.id,
          owner_id: listing.profiles.id,
          start_date: selectedDates.startDate,
          end_date: selectedDates.endDate,
          total_amount: pricing.total,
          rental_fee: pricing.rentalFee,
          platform_fee: pricing.serviceFee,
          delivery_method: deliveryMethod,
          delivery_address: deliveryMethod === 'delivery' ? deliveryAddress.trim() : null,
          pickup_location: deliveryMethod === 'pickup' ? `${listing?.address || ''}, ${listing?.city || ''}, ${listing?.state || ''} ${listing?.postal_code || ''}`.trim() : null,
          special_instructions: specialInstructions || null,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      Alert.alert(
        'Booking Request Sent!',
        `Your booking request has been sent to ${listing?.profiles?.full_name || 'the owner'}. You'll receive a notification when they respond.`,
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/bookings');
            }
          }
        ]
      );
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
                      backgroundColor: colors.gray[300]
                    }} />
                    <Text style={{
                      fontSize: typography.sizes.xs,
                      color: colors.text.secondary
                    }}>
                      Booked
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
                  style={{
                    flex: 1,
                    backgroundColor: colors.gray[100],
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
                    Refresh
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
                    ${pricing.rentalFee.toFixed(2)}
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

                <View style={{
                  backgroundColor: colors.gray[50],
                  borderRadius: 8,
                  padding: spacing.sm
                }}>
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
                        Protection fee
                      </Text>
                      <Text style={{
                        fontSize: typography.sizes.sm,
                        color: colors.text.secondary
                      }}>
                        10% of rental fee
                      </Text>
                    </View>
                    <Text style={{
                      fontSize: typography.sizes.base,
                      fontWeight: typography.weights.medium,
                      color: colors.text.primary
                    }}>
                      ${pricing.damageProtection.toFixed(2)}
                    </Text>
                  </View>
                </View>

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
                  Book Now
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
} 