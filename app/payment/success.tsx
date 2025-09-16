import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { colors, spacing, typography, componentStyles } from '../../src/lib/design-system';
import { supabase } from '../../src/lib/supabase';

interface BookingDetails {
  id: string;
  listing_title: string;
  listing_description: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  rental_fee: number;
  service_fee: number;
  insurance_fee: number;
  delivery_fee: number;
  status: string;
  owner_name: string;
  owner_avatar: string;
  listing_images: string[];
  delivery_address: string;
}

export default function PaymentSuccessScreen() {
  const { booking_id, session_id } = useLocalSearchParams();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookingDetails();
  }, [booking_id]);

  const fetchBookingDetails = async () => {
    if (!booking_id) {
      console.log('No booking ID provided');
      setLoading(false);
      return;
    }

    console.log('Fetching booking details for ID:', booking_id);

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          start_date,
          end_date,
          total_amount,
          status,
          delivery_address,
          listings!listing_id (
            title,
            description,
            images,
            owner_id
          )
        `)
        .eq('id', booking_id)
        .single();

      // Get owner profile separately to avoid join issues
      let ownerProfile = null;
      if (data?.listings?.owner_id) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', data.listings.owner_id)
          .single();
        
        if (profileError) {
          console.error('Error fetching owner profile:', profileError);
        } else {
          ownerProfile = profile;
          console.log('Owner profile fetched:', profile);
        }
      }

      if (error) {
        console.error('Error fetching booking details:', error);
        // Don't redirect immediately - show success message anyway
        // User can still navigate to bookings manually
      } else {
        console.log('Booking details fetched successfully:', data);
        setBooking({
          id: data.id,
          listing_title: data.listings?.title || 'Unknown Item',
          listing_description: data.listings?.description || '',
          start_date: data.start_date,
          end_date: data.end_date,
          total_amount: data.total_amount,
          rental_fee: data.total_amount || 0,
          service_fee: 0,
          insurance_fee: 0,
          delivery_fee: 0,
          status: data.status,
              owner_name: ownerProfile?.full_name || 'Unknown Owner',
          owner_avatar: ownerProfile?.avatar_url || '',
          listing_images: data.listings?.images || [],
          delivery_address: data.delivery_address || '',
        });
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
      // Even if there's an error, show success message
      // The payment was successful, just the details couldn't be loaded
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(amount);
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }} edges={['top', 'left', 'right']}>
      <ScrollView 
        style={{ flex: 1, backgroundColor: colors.neutral.lightGray }} 
        contentContainerStyle={{ flexGrow: 1, paddingBottom: spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Header */}
        <View style={{
          backgroundColor: colors.white,
          paddingTop: spacing.xl,
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.lg,
          alignItems: 'center',
        }}>
          {/* Success Icon */}
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: colors.semantic.success,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: spacing.md,
          }}>
            <Ionicons name="checkmark" size={40} color={colors.white} />
          </View>
          
          <Text style={{
            fontSize: typography.sizes['2xl'],
            fontWeight: typography.weights.bold,
            color: colors.text.primary,
            textAlign: 'center',
            marginBottom: spacing.sm,
          }}>
            Payment Successful!
          </Text>
          
          <Text style={{
            fontSize: 16,
            color: '#1F2937',
            textAlign: 'center',
            lineHeight: 24,
            fontWeight: '500',
            fontFamily: 'System',
          }}>
            Your booking has been confirmed.{'\n'}You will receive a confirmation email shortly.
          </Text>
        </View>

        {/* Loading state for booking details */}
        {loading && (
          <View style={{
            backgroundColor: colors.white,
            marginHorizontal: spacing.lg,
            marginTop: spacing.md,
            borderRadius: 12,
            padding: spacing.xl,
            alignItems: 'center',
          }}>
            <ActivityIndicator size="large" color={colors.primary.main} />
            <Text style={{ 
              marginTop: spacing.md,
              fontSize: typography.sizes.base,
              color: colors.text.secondary 
            }}>
              Loading booking details...
            </Text>
          </View>
        )}

        {/* Booking Details Card */}
        {booking && (
          <View style={{
            backgroundColor: colors.white,
            marginHorizontal: spacing.lg,
            marginTop: spacing.md,
            borderRadius: 12,
            padding: spacing.lg,
            ...componentStyles.card.base,
          }}>
            <Text style={{
              fontSize: typography.sizes.lg,
              fontWeight: typography.weights.semibold,
              color: colors.text.primary,
              marginBottom: spacing.md,
            }}>
              Booking Confirmation
            </Text>

            {/* Item Details */}
            <View style={{ marginBottom: spacing.md }}>
              <Text style={{
                fontSize: typography.sizes.sm,
                color: colors.text.secondary,
                marginBottom: spacing.xs,
              }}>
                Item
              </Text>
              <Text style={{
                fontSize: typography.sizes.base,
                fontWeight: typography.weights.medium,
                color: colors.text.primary,
                marginBottom: spacing.xs,
              }}>
                {booking.listing_title}
              </Text>
              {booking.listing_description && (
                <Text style={{
                  fontSize: 14,
                  color: '#6B7280',
                  lineHeight: 20,
                  marginTop: 4,
                  fontFamily: 'System',
                }}>
                  {booking.listing_description}
                </Text>
              )}
            </View>

            {/* Owner Information */}
            <View style={{ marginBottom: spacing.md }}>
              <Text style={{
                fontSize: typography.sizes.sm,
                color: colors.text.secondary,
                marginBottom: spacing.xs,
              }}>
                Renting from
              </Text>
              <Text style={{
                fontSize: 16,
                fontWeight: '500',
                color: '#1F2937',
                fontFamily: 'System',
              }}>
                {booking.owner_name}
              </Text>
            </View>

            {/* Pickup/Delivery Information */}
            <View style={{ marginBottom: spacing.md }}>
              <Text style={{
                fontSize: typography.sizes.sm,
                color: colors.text.secondary,
                marginBottom: spacing.xs,
              }}>
                Collection/Delivery
              </Text>
              {booking.delivery_address ? (
                <Text style={{
                  fontSize: typography.sizes.base,
                  fontWeight: typography.weights.medium,
                  color: colors.text.primary,
                }}>
                  Delivery to: {booking.delivery_address}
                </Text>
              ) : (
                <Text style={{
                  fontSize: typography.sizes.base,
                  fontWeight: typography.weights.medium,
                  color: colors.text.primary,
                }}>
                  Pickup from owner location
                </Text>
              )}
            </View>

            {/* Rental Period */}
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between',
              marginBottom: spacing.md,
            }}>
              <View style={{ flex: 1, marginRight: spacing.sm }}>
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    color: colors.text.secondary,
                    marginBottom: spacing.xs,
                  }}>
                    Start Date
                  </Text>
                  <Text style={{
                    fontSize: typography.sizes.base,
                    fontWeight: typography.weights.medium,
                    color: colors.text.primary,
                  }}>
                    {formatDate(booking.start_date)}
                  </Text>
              </View>

              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <Text style={{
                  fontSize: typography.sizes.sm,
                  color: colors.text.secondary,
                  marginBottom: spacing.xs,
                }}>
                  End Date
                </Text>
                <Text style={{
                  fontSize: typography.sizes.base,
                  fontWeight: typography.weights.medium,
                  color: colors.text.primary,
                }}>
                  {formatDate(booking.end_date)}
                </Text>
              </View>
            </View>



            {/* Price Breakdown */}
            <View style={{
              paddingTop: spacing.md,
              borderTopWidth: 1,
              borderTopColor: colors.gray[200],
              marginBottom: spacing.md,
            }}>
              <Text style={{
                fontSize: typography.sizes.sm,
                fontWeight: typography.weights.semibold,
                color: colors.text.primary,
                marginBottom: spacing.sm,
              }}>
                Price Breakdown
              </Text>

              {booking.rental_fee > 0 && (
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: spacing.xs,
                }}>
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    color: colors.text.secondary,
                  }}>
                    Total Amount
                  </Text>
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    fontWeight: typography.weights.medium,
                    color: colors.text.primary,
                  }}>
                    {formatPrice(booking.rental_fee)}
                  </Text>
                </View>
              )}

              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: spacing.sm,
                borderTopWidth: 1,
                borderTopColor: colors.gray[200],
                marginTop: spacing.sm,
              }}>
                <Text style={{
                  fontSize: typography.sizes.base,
                  fontWeight: typography.weights.semibold,
                  color: colors.text.primary,
                }}>
                  Total Paid
                </Text>
                <Text style={{
                  fontSize: typography.sizes.lg,
                  fontWeight: typography.weights.bold,
                  color: colors.primary.main,
                }}>
                  {formatPrice(booking.total_amount)}
                </Text>
              </View>
            </View>

            {/* Booking ID */}
            <View style={{
              paddingTop: spacing.md,
              borderTopWidth: 1,
              borderTopColor: colors.gray[200],
            }}>
              <Text style={{
                fontSize: typography.sizes.sm,
                color: colors.text.secondary,
                marginBottom: spacing.xs,
              }}>
                Booking ID
              </Text>
              <Text style={{
                fontSize: typography.sizes.sm,
                fontWeight: typography.weights.medium,
                color: colors.text.primary,
                fontFamily: 'monospace',
              }}>
                {booking.id}
              </Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={{ 
          marginHorizontal: spacing.lg,
          marginTop: spacing.lg,
          gap: spacing.md,
        }}>
          <TouchableOpacity
            onPress={() => router.push('/bookings')}
            style={{
              ...componentStyles.button.primary,
              paddingVertical: spacing.md,
              alignItems: 'center',
            }}
          >
            <Text style={{
              fontSize: typography.sizes.base,
              fontWeight: typography.weights.semibold,
              color: colors.white,
            }}>
              View My Bookings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(tabs)')}
            style={{
              ...componentStyles.button.secondary,
              paddingVertical: spacing.md,
              alignItems: 'center',
            }}
          >
            <Text style={{
              fontSize: typography.sizes.base,
              fontWeight: typography.weights.medium,
              color: colors.text.primary,
            }}>
              Continue Browsing
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
