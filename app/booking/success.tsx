import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../src/lib/supabase';
import * as Calendar from 'expo-calendar';
import type { Booking } from '@shared/types/booking';

export default function BookingSuccessScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const router = useRouter();

  // Fetch booking details
  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          listing:listings(*),
          owner:profiles!bookings_owner_id_fkey(*),
          renter:profiles!bookings_renter_id_fkey(*)
        `)
        .eq('id', bookingId)
        .single();
      
      if (error) throw error;
      return data as Booking;
    },
    enabled: !!bookingId,
  });

  // Add to calendar function
  const addToCalendar = async () => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Calendar access is required to add events.');
        return;
      }

      if (!booking) return;

      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = calendars.find(cal => cal.isPrimary) || calendars[0];

      if (!defaultCalendar) {
        Alert.alert('Error', 'No calendar found on your device.');
        return;
      }

          const startDate = new Date(booking.startDate);
    const endDate = new Date(booking.endDate);
      
      // Add one day to end date since it's typically the return date
      endDate.setDate(endDate.getDate() + 1);

      await Calendar.createEventAsync(defaultCalendar.id, {
        title: `Rental: ${booking.listingId}`,
        startDate,
        endDate,
        allDay: true,
        notes: `Rental booking\n\nPickup/Delivery: ${booking.delivery?.method || 'pickup'}\n\nBooking ID: ${booking.id}`,
        location: booking.delivery?.method === 'pickup' ? 'Pickup location' : booking.delivery?.deliveryAddress,
      });

      Alert.alert('Success', 'Rental dates added to your calendar!');
    } catch (error) {
      console.error('Calendar error:', error);
      Alert.alert('Error', 'Failed to add to calendar. Please try again.');
    }
  };

  // Share booking function
  const shareBooking = async () => {
    if (!booking) return;

    try {
      const message = `I just booked item ${booking.listingId} for ${formatDateRange(booking.startDate, booking.endDate)}!\n\nBooking ID: ${booking.id}`;

      await Share.share({
        message,
        title: 'Rental Booking Confirmation',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  // Format date range
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const startStr = start.toLocaleDateString('en-AU', {
      month: 'short',
      day: 'numeric',
    });
    
    const endStr = end.toLocaleDateString('en-AU', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return `${startStr} - ${endStr}`;
  };

  // Calculate days
  const getTotalDays = () => {
    if (!booking) return 0;
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    // Inclusive duration for display
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading booking details...</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Booking not found</Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => router.push('/(tabs)/bookings')}
        >
          <Text style={styles.buttonText}>View All Bookings</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Success Header */}
      <View style={styles.successHeader}>
        <View style={styles.checkmarkContainer}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
        <Text style={styles.successTitle}>Booking Confirmed!</Text>
        <Text style={styles.successSubtitle}>
          Your rental request has been sent to the owner
        </Text>
      </View>

      {/* Booking Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Booking Details</Text>
        <View style={styles.bookingCard}>
          <Text style={styles.itemTitle}>{booking.listingId}</Text>
          <Text style={styles.itemLocation}>{'Location TBD'}</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Booking ID:</Text>
            <Text style={styles.detailValue}>{booking.id}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Dates:</Text>
            <Text style={styles.detailValue}>
              {formatDateRange(booking.startDate, booking.endDate)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Duration:</Text>
            <Text style={styles.detailValue}>{getTotalDays()} day{getTotalDays() === 1 ? '' : 's'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Amount:</Text>
            <Text style={styles.totalAmount}>
              ${(booking.total_amount || (booking.subtotal + (booking.service_fee || 0) + (booking.insurance_fee || 0) + (booking.delivery_fee || 0) + (booking.deposit_amount || 0))).toFixed(2)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Pickup/Delivery:</Text>
            <Text style={styles.detailValue}>
              {booking.delivery?.method === 'pickup' ? 'Pickup from owner' : 'Delivery to you'}
            </Text>
          </View>
        </View>
      </View>

      {/* Owner Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Owner Contact</Text>
        <View style={styles.ownerCard}>
          <Text style={styles.ownerName}>
            {booking.ownerId} {''}
          </Text>
          <Text style={styles.ownerContact}>Owner ID: {booking.ownerId}</Text>
        </View>
      </View>

      {/* Next Steps */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What's Next?</Text>
        <View style={styles.stepsContainer}>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Host Notification</Text>
              <Text style={styles.stepDescription}>
                The host will be notified of your booking
              </Text>
            </View>
          </View>
          
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Payment Protection</Text>
              <Text style={styles.stepDescription}>
                Your payment is held securely until it's returned
              </Text>
            </View>
          </View>
          
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Organise Pickup & Drop-off</Text>
              <Text style={styles.stepDescription}>
                Message each other to organise pickup and drop-off
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Important Notes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Important Notes</Text>
        <View style={styles.notesContainer}>
          <Text style={styles.note}>• Payment will be processed once the owner confirms your booking</Text>
          <Text style={styles.note}>• You can cancel free of charge before confirmation</Text>
          <Text style={styles.note}>• Please inspect the item carefully before accepting it</Text>
          <Text style={styles.note}>• Report any issues immediately through the app</Text>
          {false && (
            <Text style={styles.note}>• Your booking includes damage protection coverage</Text>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.secondaryButton} onPress={addToCalendar}>
          <Text style={styles.secondaryButtonText}>Add to Calendar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryButton} onPress={shareBooking}>
          <Text style={styles.secondaryButtonText}>Share Booking</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={() => router.push(`/bookings/${booking.id}`)}
        >
          <Text style={styles.primaryButtonText}>View Booking Details</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.outlineButton} 
          onPress={() => router.push('/(tabs)/bookings')}
        >
          <Text style={styles.outlineButtonText}>View All Bookings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.outlineButton} 
          onPress={() => router.push('/(tabs)/')}
        >
          <Text style={styles.outlineButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
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
  successHeader: {
    backgroundColor: '#ffffff',
    padding: 32,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  checkmarkContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkmark: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
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
  bookingCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  itemLocation: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 16,
    color: '#44d62c',
    fontWeight: '600',
  },
  ownerCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  ownerContact: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  verifiedBadge: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
    marginTop: 8,
  },
  stepsContainer: {
    gap: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#44d62c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  notesContainer: {
    gap: 8,
  },
  note: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  actionsContainer: {
    padding: 16,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#44d62c',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  outlineButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
  button: {
    backgroundColor: '#44d62c',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
}); 