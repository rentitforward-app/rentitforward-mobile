import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../src/stores/auth';
import { supabase } from '../../src/lib/supabase';
import type { Listing } from '@shared/types/listing';
import type { CreateBooking } from '@shared/types/booking';

interface BookingDraft {
  listingId: string;
  startDate: Date | null;
  endDate: Date | null;
  deliveryOption: 'pickup' | 'delivery';
  deliveryAddress: string;
  includeInsurance: boolean;
  specialRequests: string;
  totalDays: number;
  subtotal: number;
  insuranceFee: number;
  deliveryFee: number;
  totalAmount: number;
}

export default function BookingScreen() {
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const [bookingDraft, setBookingDraft] = useState<BookingDraft>({
    listingId: listingId || '',
    startDate: null,
    endDate: null,
    deliveryOption: 'pickup',
    deliveryAddress: '',
    includeInsurance: false,
    specialRequests: '',
    totalDays: 0,
    subtotal: 0,
    insuranceFee: 0,
    deliveryFee: 0,
    totalAmount: 0,
  });

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

  // Calculate pricing when dates change
  useEffect(() => {
    if (bookingDraft.startDate && bookingDraft.endDate && listing) {
      const days = Math.ceil(
        (bookingDraft.endDate.getTime() - bookingDraft.startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const subtotal = days * listing.daily_rate;
      const insuranceFee = bookingDraft.includeInsurance ? subtotal * 0.1 : 0; // 10% insurance
      const deliveryFee = bookingDraft.deliveryOption === 'delivery' ? 25 : 0; // $25 delivery fee
      const totalAmount = subtotal + insuranceFee + deliveryFee;

      setBookingDraft(prev => ({
        ...prev,
        totalDays: days,
        subtotal,
        insuranceFee,
        deliveryFee,
        totalAmount,
      }));
    }
  }, [bookingDraft.startDate, bookingDraft.endDate, bookingDraft.includeInsurance, bookingDraft.deliveryOption, listing]);

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: CreateBooking) => {
      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
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

  const handleDateSelection = () => {
    router.push({
      pathname: '/booking/calendar',
      params: { 
        listingId,
        startDate: bookingDraft.startDate?.toISOString(),
        endDate: bookingDraft.endDate?.toISOString(),
      },
    });
  };

  const handleProceedToSummary = () => {
    if (!bookingDraft.startDate || !bookingDraft.endDate) {
      Alert.alert('Missing Dates', 'Please select your rental dates.');
      return;
    }

    router.push({
      pathname: '/booking/summary',
      params: {
        listingId,
        startDate: bookingDraft.startDate.toISOString(),
        endDate: bookingDraft.endDate.toISOString(),
        deliveryOption: bookingDraft.deliveryOption,
        deliveryAddress: bookingDraft.deliveryAddress,
        includeInsurance: bookingDraft.includeInsurance.toString(),
        specialRequests: bookingDraft.specialRequests,
        totalAmount: bookingDraft.totalAmount.toString(),
      },
    });
  };

  if (listingLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading listing details...</Text>
      </View>
    );
  }

  if (!listing) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Listing not found</Text>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
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
        <Text style={styles.headerTitle}>Book {listing.title}</Text>
      </View>

      {/* Listing Summary */}
      <View style={styles.listingSummary}>
        <Text style={styles.listingTitle}>{listing.title}</Text>
        <Text style={styles.listingLocation}>{listing.location}</Text>
        <Text style={styles.listingPrice}>${listing.daily_rate}/day</Text>
      </View>

      {/* Date Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Dates</Text>
        <TouchableOpacity style={styles.dateSelector} onPress={handleDateSelection}>
          <Text style={styles.dateSelectorText}>
            {bookingDraft.startDate && bookingDraft.endDate
              ? `${bookingDraft.startDate.toLocaleDateString()} - ${bookingDraft.endDate.toLocaleDateString()}`
              : 'Choose your dates'
            }
          </Text>
        </TouchableOpacity>
        {bookingDraft.totalDays > 0 && (
          <Text style={styles.daysText}>{bookingDraft.totalDays} days</Text>
        )}
      </View>

      {/* Delivery Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Options</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={[
              styles.radioOption,
              bookingDraft.deliveryOption === 'pickup' && styles.radioOptionSelected
            ]}
            onPress={() => setBookingDraft(prev => ({ ...prev, deliveryOption: 'pickup' }))}
          >
            <Text style={styles.radioText}>Pickup (Free)</Text>
            <Text style={styles.radioSubtext}>Pick up from owner's location</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.radioOption,
              bookingDraft.deliveryOption === 'delivery' && styles.radioOptionSelected
            ]}
            onPress={() => setBookingDraft(prev => ({ ...prev, deliveryOption: 'delivery' }))}
          >
            <Text style={styles.radioText}>Delivery (+$25)</Text>
            <Text style={styles.radioSubtext}>Delivered to your location</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Insurance Option */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Protection</Text>
        <TouchableOpacity
          style={[
            styles.insuranceOption,
            bookingDraft.includeInsurance && styles.insuranceOptionSelected
          ]}
          onPress={() => setBookingDraft(prev => ({ 
            ...prev, 
            includeInsurance: !prev.includeInsurance 
          }))}
        >
          <Text style={styles.insuranceText}>
            Include Damage Protection (+10%)
          </Text>
          <Text style={styles.insuranceSubtext}>
            Covers accidental damage up to item value
          </Text>
        </TouchableOpacity>
      </View>

      {/* Price Breakdown */}
      {bookingDraft.totalDays > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Breakdown</Text>
          <View style={styles.priceBreakdown}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                ${listing.daily_rate}/day × {bookingDraft.totalDays} days
              </Text>
              <Text style={styles.priceValue}>${bookingDraft.subtotal.toFixed(2)}</Text>
            </View>
            
            {bookingDraft.deliveryFee > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Delivery fee</Text>
                <Text style={styles.priceValue}>${bookingDraft.deliveryFee.toFixed(2)}</Text>
              </View>
            )}
            
            {bookingDraft.insuranceFee > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Damage protection</Text>
                <Text style={styles.priceValue}>${bookingDraft.insuranceFee.toFixed(2)}</Text>
              </View>
            )}
            
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${bookingDraft.totalAmount.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Continue Button */}
      <TouchableOpacity
        style={[
          styles.continueButton,
          (!bookingDraft.startDate || !bookingDraft.endDate) && styles.continueButtonDisabled
        ]}
        onPress={handleProceedToSummary}
        disabled={!bookingDraft.startDate || !bookingDraft.endDate}
      >
        <Text style={styles.continueButtonText}>Continue to Summary</Text>
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
  listingSummary: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  listingLocation: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  listingPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#44d62c',
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
  dateSelector: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  dateSelectorText: {
    fontSize: 16,
    color: '#374151',
  },
  daysText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  radioGroup: {
    gap: 12,
  },
  radioOption: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  radioOptionSelected: {
    borderColor: '#44d62c',
    backgroundColor: '#f0fdf4',
  },
  radioText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  radioSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  insuranceOption: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  insuranceOptionSelected: {
    borderColor: '#44d62c',
    backgroundColor: '#f0fdf4',
  },
  insuranceText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  insuranceSubtext: {
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
  continueButton: {
    backgroundColor: '#44d62c',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
}); 