import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { colors, spacing, typography } from '../../src/lib/design-system';
import { useAuth } from '../../src/components/AuthProvider';
import { supabase } from '../../src/lib/supabase';
import DateTimePicker from '@react-native-community/datetimepicker';

interface ListingData {
  id: string;
  title: string;
  description: string;
  price_per_day: number;
  location: string;
  is_active: boolean;
  created_at: string;
  owner_id: string;
  category: string;
  condition: string;
  delivery_available: boolean;
  pickup_available: boolean;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  profiles: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    rating: string | null;
  } | null;
  listing_photos: Array<{
    id: string;
    url: string;
    order_index: number;
  }>;
}

export default function BookingScreen() {
  const { listingId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [listing, setListing] = useState<ListingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  
  // Booking form state
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState('');
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  useEffect(() => {
    fetchListingDetails();
  }, [listingId]);

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
        listing_photos (
          id,
          url,
          order_index
        ),
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

  // Set default delivery method to pickup when listing loads
  useEffect(() => {
    if (listing && !deliveryMethod) {
      if (listing.pickup_available) {
        setDeliveryMethod('pickup');
      } else if (listing.delivery_available) {
        setDeliveryMethod('delivery');
      }
    }
  }, [listing, deliveryMethod]);

  const calculateDuration = (): number => {
    if (!startDate || !endDate) return 0;
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculatePricing = () => {
    if (!listing) {
      return {
        duration: 0,
        basePrice: 0,
        platformFee: 0,
        total: 0
      };
    }
    
    const duration = calculateDuration();
    const basePrice = listing.price_per_day * duration;
    const platformFee = basePrice * 0.03; // 3% platform fee
    const total = basePrice + platformFee;

    return {
      duration,
      basePrice,
      platformFee,
      total
    };
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return 'dd/mm/yyyy';
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      // If end date is before or same as new start date, clear it
      if (endDate && endDate <= selectedDate) {
        setEndDate(null);
      }
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate && startDate && selectedDate > startDate) {
      setEndDate(selectedDate);
    } else if (selectedDate && selectedDate <= (startDate || new Date())) {
      Alert.alert('Invalid Date', 'End date must be after start date');
    }
  };

  const getMinimumDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  };

  const getMinimumEndDate = () => {
    if (!startDate) return getMinimumDate();
    const dayAfterStart = new Date(startDate);
    dayAfterStart.setDate(dayAfterStart.getDate() + 1);
    return dayAfterStart;
  };

  const getDeliveryOptions = () => {
    const options = [];
    
    if (listing?.pickup_available) {
      options.push({ label: 'Pickup', value: 'pickup' });
    }
    if (listing?.delivery_available) {
      options.push({ label: 'Delivery', value: 'delivery' });
    }
    
    return options;
  };

  const getDeliveryMethodDisplayName = (value: string) => {
    const options = getDeliveryOptions();
    const option = options.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  const getMaskedPickupLocation = (listing: ListingData | null): string => {
    if (!listing) return 'Pickup location not specified';
    
    // Show only city and state, hide street address and postal code for security
    const city = listing.city?.trim();
    const state = listing.state?.trim();
    
    if (city && state) {
      return `${city}, ${state}`;
    } else if (city) {
      return city;
    } else if (state) {
      return state;
    }
    
    return 'Pickup location available';
  };

  const handleBooking = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to book this item');
      return;
    }

    if (!startDate || !endDate) {
      Alert.alert('Missing Dates', 'Please select both start and end dates');
      return;
    }

    if (!deliveryMethod) {
      Alert.alert('Missing Delivery Method', 'Please select a delivery method');
      return;
    }

    if (deliveryMethod === 'delivery' && !deliveryAddress.trim()) {
      Alert.alert('Missing Delivery Address', 'Please enter a delivery address');
      return;
    }

    // Pickup validation no longer needed as location comes from listing

    setBookingLoading(true);

    try {
      const pricing = calculatePricing();
      
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          listing_id: listing?.id,
          renter_id: user.id,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          total_price: pricing.total,
          platform_fee: pricing.platformFee,
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
  const deliveryOptions = getDeliveryOptions();

  // Get main image
  let mainImage = null;
  if (listing.listing_photos && listing.listing_photos.length > 0) {
    const sortedPhotos = listing.listing_photos.sort((a, b) => a.order_index - b.order_index);
    mainImage = sortedPhotos[0].url;
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
              alignItems: 'center'
            }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.primary.main} />
            <Text style={{
              marginLeft: spacing.xs,
              fontSize: typography.sizes.base,
              color: colors.primary.main,
              fontWeight: typography.weights.medium
            }}>
              Back to Browse
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* Listing Summary */}
          <View style={{
            flexDirection: 'row',
            padding: spacing.md,
            backgroundColor: colors.white,
            borderBottomWidth: 1,
            borderBottomColor: colors.gray[100]
          }}>
            {mainImage ? (
              <Image
                source={{ uri: mainImage }}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 8,
                  marginRight: spacing.md
                }}
              />
            ) : (
              <View style={{
                width: 100,
                height: 100,
                backgroundColor: colors.gray[100],
                borderRadius: 8,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: spacing.md
              }}>
                <Ionicons name="image" size={32} color={colors.gray[400]} />
              </View>
            )}
            
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: typography.sizes.lg,
                fontWeight: typography.weights.bold,
                color: colors.text.primary,
                marginBottom: spacing.xs
              }}>
                {listing.title}
              </Text>
              
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: spacing.xs
              }}>
                <Text style={{
                  fontSize: typography.sizes['2xl'],
                  fontWeight: typography.weights.bold,
                  color: colors.primary.main
                }}>
                  ${listing.price_per_day}
                </Text>
                <Text style={{
                  fontSize: typography.sizes.sm,
                  color: colors.text.secondary,
                  marginLeft: spacing.xs
                }}>
                  per day
                </Text>
              </View>
              
              <Text style={{
                fontSize: typography.sizes.sm,
                color: colors.text.secondary
              }}>
                by {listing.profiles?.full_name || 'Unknown Owner'}
              </Text>
            </View>
          </View>

          {/* Booking Form */}
          <View style={{ padding: spacing.md }}>
            {/* Date Selection */}
            <View style={{ marginBottom: spacing.lg }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: spacing.md
              }}>
                {/* Start Date */}
                <View style={{ flex: 1, marginRight: spacing.sm }}>
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    fontWeight: typography.weights.medium,
                    color: colors.text.primary,
                    marginBottom: spacing.xs
                  }}>
                    Start Date
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowStartDatePicker(true)}
                    style={{
                      borderWidth: 1,
                      borderColor: colors.gray[300],
                      borderRadius: 8,
                      paddingHorizontal: spacing.sm,
                      paddingVertical: spacing.md,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Text style={{
                      fontSize: typography.sizes.base,
                      color: startDate ? colors.text.primary : colors.text.secondary
                    }}>
                      {formatDate(startDate)}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color={colors.gray[400]} />
                  </TouchableOpacity>
                </View>

                {/* End Date */}
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    fontWeight: typography.weights.medium,
                    color: colors.text.primary,
                    marginBottom: spacing.xs
                  }}>
                    End Date
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowEndDatePicker(true)}
                    style={{
                      borderWidth: 1,
                      borderColor: colors.gray[300],
                      borderRadius: 8,
                      paddingHorizontal: spacing.sm,
                      paddingVertical: spacing.md,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Text style={{
                      fontSize: typography.sizes.base,
                      color: endDate ? colors.text.primary : colors.text.secondary
                    }}>
                      {formatDate(endDate)}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color={colors.gray[400]} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Delivery Method */}
            <View style={{ marginBottom: spacing.lg }}>
              <Text style={{
                fontSize: typography.sizes.sm,
                fontWeight: typography.weights.medium,
                color: colors.text.primary,
                marginBottom: spacing.xs
              }}>
                Delivery Method
              </Text>
              <TouchableOpacity
                onPress={() => {
                  const options = getDeliveryOptions();
                  if (options.length === 0) {
                    Alert.alert(
                      'No Delivery Options',
                      'This listing does not have pickup or delivery options available. Please contact the owner for more information.',
                      [{ text: 'OK' }]
                    );
                  } else {
                    setShowDeliveryModal(true);
                  }
                }}
                style={{
                  borderWidth: 1,
                  borderColor: colors.gray[300],
                  borderRadius: 8,
                  paddingHorizontal: spacing.sm,
                  paddingVertical: spacing.md,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Text style={{
                  fontSize: typography.sizes.base,
                  color: deliveryMethod ? colors.text.primary : colors.text.secondary
                }}>
                  {deliveryMethod 
                    ? (deliveryMethod === 'pickup' ? 'Pickup' : 'Delivery')
                    : (getDeliveryOptions().length > 0 ? 'Select delivery method' : 'No delivery options available')
                  }
                </Text>
                <Ionicons name="chevron-down" size={20} color={colors.gray[400]} />
              </TouchableOpacity>
              
              {/* Delivery Address - only show when delivery is selected */}
              {deliveryMethod === 'delivery' && (
                <View style={{ marginTop: spacing.md }}>
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    fontWeight: typography.weights.medium,
                    color: colors.text.primary,
                    marginBottom: spacing.xs
                  }}>
                    Delivery Address
                  </Text>
                  <TextInput
                    value={deliveryAddress}
                    onChangeText={setDeliveryAddress}
                    placeholder="Enter your delivery address..."
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    style={{
                      borderWidth: 1,
                      borderColor: colors.gray[300],
                      borderRadius: 8,
                      paddingHorizontal: spacing.sm,
                      paddingVertical: spacing.sm,
                      fontSize: typography.sizes.base,
                      color: colors.text.primary,
                      backgroundColor: colors.white,
                      minHeight: 80
                    }}
                  />
                </View>
              )}
              
              {/* Pickup Location - only show when pickup is selected */}
              {deliveryMethod === 'pickup' && (
                <View style={{ marginTop: spacing.md }}>
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    fontWeight: typography.weights.medium,
                    color: colors.text.primary,
                    marginBottom: spacing.xs
                  }}>
                    Pickup Location
                  </Text>
                  <View style={{
                    borderWidth: 1,
                    borderColor: colors.gray[300],
                    borderRadius: 8,
                    paddingHorizontal: spacing.sm,
                    paddingVertical: spacing.md,
                    backgroundColor: colors.gray[50]
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="location-outline" size={18} color={colors.primary.main} style={{ marginRight: spacing.xs }} />
                      <Text style={{
                        fontSize: typography.sizes.base,
                        color: colors.text.primary,
                        fontWeight: typography.weights.medium
                      }}>
                        {getMaskedPickupLocation(listing)}
                      </Text>
                    </View>
                  </View>
                  <View style={{
                    backgroundColor: colors.gray[50],
                    borderRadius: 8,
                    padding: spacing.sm,
                    marginTop: spacing.xs,
                    flexDirection: 'row',
                    alignItems: 'flex-start'
                  }}>
                    <Ionicons name="shield-checkmark-outline" size={16} color={colors.primary.main} style={{ marginRight: spacing.xs, marginTop: 2 }} />
                    <Text style={{
                      fontSize: typography.sizes.xs,
                      color: colors.gray[600],
                      flex: 1,
                      lineHeight: 16
                    }}>
                      The exact pickup address will be provided by the owner once your booking is confirmed.
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Special Instructions */}
            <View style={{ marginBottom: spacing.lg }}>
              <Text style={{
                fontSize: typography.sizes.sm,
                fontWeight: typography.weights.medium,
                color: colors.text.primary,
                marginBottom: spacing.xs
              }}>
                Special Instructions (Optional)
              </Text>
              <TextInput
                value={specialInstructions}
                onChangeText={setSpecialInstructions}
                placeholder="Any special requests or instructions..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={{
                  borderWidth: 1,
                  borderColor: colors.gray[300],
                  borderRadius: 8,
                  paddingHorizontal: spacing.sm,
                  paddingVertical: spacing.sm,
                  fontSize: typography.sizes.base,
                  color: colors.text.primary,
                  backgroundColor: colors.white,
                  minHeight: 80
                }}
              />
            </View>

            {/* Price Breakdown */}
            {pricing.duration > 0 && (
              <View style={{
                backgroundColor: colors.gray[50],
                borderRadius: 12,
                padding: spacing.md,
                marginBottom: spacing.lg
              }}>
                <Text style={{
                  fontSize: typography.sizes.base,
                  fontWeight: typography.weights.semibold,
                  color: colors.text.primary,
                  marginBottom: spacing.md
                }}>
                  Price Breakdown
                </Text>
                
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: spacing.sm
                }}>
                  <Text style={{ color: colors.text.secondary }}>
                    ${listing.price_per_day} × {pricing.duration} day{pricing.duration > 1 ? 's' : ''}
                  </Text>
                  <Text style={{ color: colors.text.primary }}>
                    {formatCurrency(pricing.basePrice)}
                  </Text>
                </View>
                
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: spacing.sm
                }}>
                  <Text style={{ color: colors.text.secondary }}>Platform fee (3%)</Text>
                  <Text style={{ color: colors.text.primary }}>
                    {formatCurrency(pricing.platformFee)}
                  </Text>
                </View>
                
                <View style={{
                  borderTopWidth: 1,
                  borderTopColor: colors.gray[200],
                  paddingTop: spacing.sm,
                  flexDirection: 'row',
                  justifyContent: 'space-between'
                }}>
                  <Text style={{
                    fontSize: typography.sizes.base,
                    fontWeight: typography.weights.semibold,
                    color: colors.text.primary
                  }}>
                    Total
                  </Text>
                  <Text style={{
                    fontSize: typography.sizes.base,
                    fontWeight: typography.weights.semibold,
                    color: colors.text.primary
                  }}>
                    {formatCurrency(pricing.total)}
                  </Text>
                </View>
              </View>
            )}

            {/* Security Notice */}
            <View style={{
              backgroundColor: colors.gray[50],
              borderRadius: 12,
              padding: spacing.md,
              marginBottom: spacing.lg
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Ionicons name="shield-checkmark" size={20} color={colors.primary.main} style={{ marginRight: spacing.sm, marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    color: colors.text.primary,
                    lineHeight: 20
                  }}>
                    <Text style={{ fontWeight: typography.weights.semibold }}>Secure payments & deposit protection</Text>
                    {'\n\n'}
                    You won't be charged yet. This sends a booking request to the owner.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Action */}
        <SafeAreaView edges={['bottom']} style={{ backgroundColor: colors.white }}>
          <View style={{
            padding: spacing.md,
            backgroundColor: colors.white,
            borderTopWidth: 1,
            borderTopColor: colors.gray[200]
          }}>
            <TouchableOpacity
              onPress={handleBooking}
              disabled={bookingLoading || !startDate || !endDate || !deliveryMethod || (deliveryMethod === 'delivery' && !deliveryAddress.trim())}
              style={{
                backgroundColor: (!startDate || !endDate || !deliveryMethod || (deliveryMethod === 'delivery' && !deliveryAddress.trim())) ? colors.gray[400] : colors.primary.main,
                borderRadius: 12,
                paddingVertical: spacing.md,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row'
              }}
            >
              {bookingLoading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={{
                  fontSize: typography.sizes.base,
                  fontWeight: typography.weights.semibold,
                  color: colors.white
                }}>
                  Request to Book
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Date Pickers */}
        {/* Delivery Method Modal */}
        <Modal
          visible={showDeliveryModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDeliveryModal(false)}
        >
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end'
          }}>
            <View style={{
              backgroundColor: colors.white,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingHorizontal: spacing.md,
              paddingTop: spacing.lg,
              paddingBottom: spacing.xl
            }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: spacing.lg
              }}>
                <Text style={{
                  fontSize: typography.sizes.lg,
                  fontWeight: typography.weights.semibold,
                  color: colors.text.primary
                }}>
                  Select Delivery Method
                </Text>
                <TouchableOpacity onPress={() => setShowDeliveryModal(false)}>
                  <Ionicons name="close" size={24} color={colors.gray[400]} />
                </TouchableOpacity>
              </View>
              
              {getDeliveryOptions().map((option, index) => (
                <TouchableOpacity
                  key={`${option.value}-${index}`}
                  onPress={() => {
                    setDeliveryMethod(option.value);
                    setShowDeliveryModal(false);
                    // Clear delivery address if switching away from delivery
                    if (option.value !== 'delivery') {
                      setDeliveryAddress('');
                    }
                  }}
                  style={{
                    paddingVertical: spacing.md,
                    paddingHorizontal: spacing.sm,
                    borderRadius: 8,
                    backgroundColor: deliveryMethod === option.value ? colors.primary.main + '20' : 'transparent',
                    marginBottom: spacing.sm,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <Text style={{
                    fontSize: typography.sizes.base,
                    color: deliveryMethod === option.value ? colors.primary.main : colors.text.primary,
                    fontWeight: deliveryMethod === option.value ? typography.weights.semibold : typography.weights.normal
                  }}>
                    {option.label}
                  </Text>
                  {deliveryMethod === option.value && (
                    <Ionicons name="checkmark" size={20} color={colors.primary.main} />
                  )}
                </TouchableOpacity>
              ))}
              
              {getDeliveryOptions().length === 0 && (
                <View style={{
                  paddingVertical: spacing.lg,
                  alignItems: 'center'
                }}>
                  <Text style={{
                    fontSize: typography.sizes.base,
                    color: colors.text.secondary,
                    textAlign: 'center'
                  }}>
                    No delivery options available for this listing.
                    Please contact the owner for more information.
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Modal>

        {/* Date Pickers */}
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate || getMinimumDate()}
            mode="date"
            display="default"
            minimumDate={getMinimumDate()}
            onChange={handleStartDateChange}
          />
        )}

        {showEndDatePicker && (
          <DateTimePicker
            value={endDate || getMinimumEndDate()}
            mode="date"
            display="default"
            minimumDate={getMinimumEndDate()}
            onChange={handleEndDateChange}
          />
        )}
      </SafeAreaView>
    </>
  );
} 