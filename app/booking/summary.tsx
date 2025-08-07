import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
  Switch,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../src/stores/auth';
import { supabase } from '../../src/lib/supabase';
import type { Listing } from '@shared/types/listing';
import type { CreateBooking, DeliveryMethod } from '@shared/types/booking';

interface BookingSummaryData {
  listingId: string;
  startDate: string;
  endDate: string;
  deliveryOption: 'pickup' | 'delivery';
  deliveryAddress: string;
  includeInsurance: boolean;
  specialRequests: string;
  totalAmount: number;
}

export default function BookingSummaryScreen() {
  const {
    listingId,
    startDate,
    endDate,
    deliveryOption,
    deliveryAddress,
    includeInsurance,
    specialRequests,
    totalAmount,
  } = useLocalSearchParams();

  const router = useRouter();
  const { user } = useAuthStore();

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [additionalRequests, setAdditionalRequests] = useState(specialRequests || '');
  const [contactInfo, setContactInfo] = useState({
    phone: user?.phone || '',
    email: user?.email || '',
  });

  // Parse booking data
  const bookingData = {
    listingId,
    startDate: startDate ? new Date(Array.isArray(startDate) ? startDate[0] : startDate) : null,
    endDate: endDate ? new Date(Array.isArray(endDate) ? endDate[0] : endDate) : null,
    deliveryOption: (deliveryOption as 'pickup' | 'delivery') || 'pickup',
    deliveryAddress: deliveryAddress || '',
    includeInsurance: includeInsurance === 'true',
    specialRequests: additionalRequests,
    totalAmount: totalAmount ? parseFloat(Array.isArray(totalAmount) ? totalAmount[0] : totalAmount) : 0,
  };

  // Calculate derived values
  const totalDays = bookingData.startDate && bookingData.endDate
    ? Math.ceil((bookingData.endDate.getTime() - bookingData.startDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Fetch listing details
  const { data: listing, isLoading: listingLoading } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          owner:profiles!listings_owner_id_fkey(*)
        `)
        .eq('id', listingId)
        .single();
      
      if (error) throw error;
      return data as Listing;
    },
    enabled: !!listingId,
  });

  // Recalculate pricing
  const pricingBreakdown = listing ? {
    dailyRate: listing.pricing?.basePrice || 0,
    subtotal: totalDays * (listing.pricing?.basePrice || 0),
    insuranceFee: bookingData.includeInsurance ? (totalDays * (listing.pricing?.basePrice || 0)) * 0.1 : 0,
    deliveryFee: bookingData.deliveryOption === 'delivery' ? 25 : 0,
    serviceFee: (totalDays * (listing.pricing?.basePrice || 0)) * 0.05, // 5% service fee
    total: 0,
  } : null;

  if (pricingBreakdown) {
    pricingBreakdown.total = pricingBreakdown.subtotal + 
                             pricingBreakdown.insuranceFee + 
                             pricingBreakdown.deliveryFee + 
                             pricingBreakdown.serviceFee;
  }

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: CreateBooking) => {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          listing_id: bookingData.listingId,
          renter_id: user?.id,
          owner_id: listing?.ownerId,
          start_date: bookingData.startDate,
          end_date: bookingData.endDate,
          total_amount: pricingBreakdown?.total || 0,
          delivery_option: bookingData.delivery?.method || 'pickup',
          delivery_address: bookingData.delivery?.deliveryAddress,
          include_insurance: includeInsurance === 'true',
          special_requests: bookingData.specialRequests,
          status: 'pending',
          contact_phone: contactInfo.phone,
          contact_email: contactInfo.email,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (booking) => {
      router.push(`/booking/success?bookingId=${booking.id}`);
    },
    onError: (error) => {
      Alert.alert('Booking Error', 'Failed to create booking. Please try again.');
      console.error('Booking creation error:', error);
    },
  });

  const handleConfirmBooking = () => {
    if (!acceptedTerms) {
      Alert.alert('Terms Required', 'Please accept the terms and conditions to continue.');
      return;
    }

    if (!contactInfo.phone.trim()) {
      Alert.alert('Contact Required', 'Please provide a phone number for the owner to contact you.');
      return;
    }

    if (!user) {
      Alert.alert('Authentication Required', 'Please sign in to create a booking.');
      return;
    }

    Alert.alert(
      'Confirm Booking',
      `Create booking for $${pricingBreakdown?.total.toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            createBookingMutation.mutate({
              listingId: Array.isArray(listingId) ? listingId[0] : listingId,
              startDate: bookingData.startDate?.toISOString() || '',
              endDate: bookingData.endDate?.toISOString() || '',
              delivery: {
                method: (bookingData.deliveryOption || 'pickup') as DeliveryMethod,
                deliveryAddress: Array.isArray(deliveryAddress) ? deliveryAddress[0] : deliveryAddress,
              },

              specialRequests: Array.isArray(additionalRequests) ? additionalRequests[0] : additionalRequests,
            });
          },
        },
      ]
    );
  };

  if (listingLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading booking details...</Text>
      </View>
    );
  }

  if (!listing || !pricingBreakdown) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Unable to load booking details</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Summary</Text>
      </View>

      {/* Listing Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Item Details</Text>
        <View style={styles.listingSummary}>
          <Text style={styles.listingTitle}>{listing.title}</Text>
          <Text style={styles.listingLocation}>
            {listing.location?.address ? `${listing.location.address}, ${listing.location.city}` : 'Location not specified'}
          </Text>
          <Text style={styles.listingOwner}>Owner ID: {listing.ownerId}</Text>
        </View>
      </View>

      {/* Rental Period */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rental Period</Text>
        <View style={styles.dateInfo}>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Start Date:</Text>
            <Text style={styles.dateValue}>
              {bookingData.startDate?.toLocaleDateString('en-AU', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>End Date:</Text>
            <Text style={styles.dateValue}>
              {bookingData.endDate?.toLocaleDateString('en-AU', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Duration:</Text>
            <Text style={styles.dateValue}>{totalDays} day{totalDays === 1 ? '' : 's'}</Text>
          </View>
        </View>
      </View>

      {/* Delivery Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery & Pickup</Text>
        <View style={styles.deliveryInfo}>
          <Text style={styles.deliveryOption}>
            {bookingData.deliveryOption === 'pickup' ? 'Pickup from owner' : 'Delivery to you'}
          </Text>
          {bookingData.deliveryOption === 'delivery' && bookingData.deliveryAddress && (
            <Text style={styles.deliveryAddress}>{bookingData.deliveryAddress}</Text>
          )}
        </View>
      </View>

      {/* Price Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Price Breakdown</Text>
        <View style={styles.priceBreakdown}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              ${pricingBreakdown.dailyRate}/day × {totalDays} day{totalDays === 1 ? '' : 's'}
            </Text>
            <Text style={styles.priceValue}>${pricingBreakdown.subtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Service fee (5%)</Text>
            <Text style={styles.priceValue}>${pricingBreakdown.serviceFee.toFixed(2)}</Text>
          </View>

          {pricingBreakdown.deliveryFee > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Delivery fee</Text>
              <Text style={styles.priceValue}>${pricingBreakdown.deliveryFee.toFixed(2)}</Text>
            </View>
          )}

          {pricingBreakdown.insuranceFee > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Damage protection (10%)</Text>
              <Text style={styles.priceValue}>${pricingBreakdown.insuranceFee.toFixed(2)}</Text>
            </View>
          )}

          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${pricingBreakdown.total.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Contact Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.contactForm}>
          <Text style={styles.inputLabel}>Phone Number *</Text>
          <TextInput
            style={styles.textInput}
            value={contactInfo.phone}
            onChangeText={(text) => setContactInfo(prev => ({ ...prev, phone: text }))}
            placeholder="Your phone number"
            keyboardType="phone-pad"
          />
          
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={[styles.textInput, styles.disabledInput]}
            value={contactInfo.email}
            editable={false}
            placeholder="Your email address"
            keyboardType="email-address"
          />
          <Text style={styles.inputNote}>Email cannot be changed</Text>
        </View>
      </View>

      {/* Special Requests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Special Requests (Optional)</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={additionalRequests}
          onChangeText={setAdditionalRequests}
          placeholder="Any special instructions or questions for the owner..."
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Terms and Conditions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Terms & Conditions</Text>
        <View style={styles.termsContainer}>
          <View style={styles.termsCheckbox}>
            <Switch
              value={acceptedTerms}
              onValueChange={setAcceptedTerms}
              trackColor={{ false: '#d1d5db', true: '#44d62c' }}
              thumbColor={acceptedTerms ? '#ffffff' : '#f3f4f6'}
            />
            <Text style={styles.termsText}>
              I agree to the 
              <Text style={styles.termsLink}>Terms of Service</Text>
 and 
              <Text style={styles.termsLink}>Rental Agreement</Text>
            </Text>
          </View>
          
          <View style={styles.termsPoints}>
            <Text style={styles.termsPoint}>• You are responsible for the item during the rental period</Text>
            <Text style={styles.termsPoint}>• Damage protection covers accidental damage up to item value</Text>
            <Text style={styles.termsPoint}>• Return the item in the same condition as received</Text>
            <Text style={styles.termsPoint}>• Late returns may incur additional fees</Text>
          </View>
        </View>
      </View>

      {/* Confirm Button */}
      <TouchableOpacity
        style={[
          styles.confirmButton,
          (!acceptedTerms || createBookingMutation.isPending) && styles.confirmButtonDisabled
        ]}
        onPress={handleConfirmBooking}
        disabled={!acceptedTerms || createBookingMutation.isPending}
      >
        <Text style={styles.confirmButtonText}>
          {createBookingMutation.isPending ? 'Creating Booking...' : `Confirm Booking - $${pricingBreakdown.total.toFixed(2)}`}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    marginBottom: 20,
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 8,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#44d62c',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#ffffff',
    marginTop: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  listingSummary: {
    gap: 4,
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  listingLocation: {
    fontSize: 14,
    color: '#6b7280',
  },
  listingOwner: {
    fontSize: 14,
    color: '#6b7280',
  },
  dateInfo: {
    gap: 8,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  dateValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  deliveryInfo: {
    gap: 4,
  },
  deliveryOption: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  deliveryAddress: {
    fontSize: 14,
    color: '#6b7280',
  },
  priceBreakdown: {
    gap: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  priceValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
    marginTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  contactForm: {
    gap: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  disabledInput: {
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
  },
  inputNote: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: -8,
  },
  termsContainer: {
    gap: 12,
  },
  termsCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  termsText: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
  },
  termsLink: {
    color: '#44d62c',
    fontWeight: '500',
  },
  termsPoints: {
    gap: 8,
    paddingLeft: 16,
  },
  termsPoint: {
    fontSize: 14,
    color: '#6b7280',
  },
  confirmButton: {
    backgroundColor: '#44d62c',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
}); 