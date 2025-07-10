import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../src/stores/auth';
import { supabase } from '../../src/lib/supabase';
import type { Booking, BookingStatus } from '@shared/types/booking';

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch booking details
  const { data: booking, isLoading, error } = useQuery({
    queryKey: ['booking', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          listing:listings(*),
          owner:profiles!bookings_owner_id_fkey(*),
          renter:profiles!bookings_renter_id_fkey(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Booking;
    },
    enabled: !!id,
  });

  // Update booking status mutation
  const updateBookingMutation = useMutation({
    mutationFn: async ({ status, note }: { status: BookingStatus; note?: string }) => {
      const updateData: any = { 
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'confirmed') {
        updateData.confirmed_at = new Date().toISOString();
      } else if (status === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString();
        updateData.cancellation_reason = 'user_requested';
        if (note) updateData.cancellation_note = note;
      } else if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
      setActionLoading(null);
    },
    onError: (error) => {
      console.error('Booking update error:', error);
      setActionLoading(null);
      Alert.alert('Error', 'Failed to update booking status. Please try again.');
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading booking details...</Text>
      </View>
    );
  }

  if (error || !booking) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Booking not found</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isOwner = booking.ownerId === user?.id;
  const isRenter = booking.renterId === user?.id;
  const otherUser = isRenter ? booking.owner : booking.renter;

  // Format dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-AU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Status badge helper
  const getStatusBadge = () => {
    const now = new Date();
    const startDate = new Date(booking.startDate);
    const endDate = new Date(booking.endDate);

    switch (booking.status) {
      case 'pending':
        return { color: '#f59e0b', backgroundColor: '#fef3c7', text: 'Pending Approval' };
      case 'confirmed':
        if (startDate > now) {
          return { color: '#3b82f6', backgroundColor: '#dbeafe', text: 'Confirmed' };
        } else if (endDate >= now) {
          return { color: '#10b981', backgroundColor: '#d1fae5', text: 'Active' };
        } else {
          return { color: '#6b7280', backgroundColor: '#f3f4f6', text: 'Ready to Complete' };
        }
      case 'completed':
        return { color: '#10b981', backgroundColor: '#d1fae5', text: 'Completed' };
      case 'cancelled':
        return { color: '#ef4444', backgroundColor: '#fee2e2', text: 'Cancelled' };
      default:
        return { color: '#6b7280', backgroundColor: '#f3f4f6', text: 'Unknown' };
    }
  };

  const statusBadge = getStatusBadge();

  // Action handlers
  const handleApprove = () => {
    setActionLoading('approve');
    updateBookingMutation.mutate({ status: 'confirmed' });
  };

  const handleReject = () => {
    Alert.prompt(
      'Reject Booking',
      'Please provide a reason for rejecting this booking:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: (reason) => {
            setActionLoading('reject');
            updateBookingMutation.mutate({ 
              status: 'cancelled', 
              note: reason || 'Rejected by owner' 
            });
          },
        },
      ],
      'plain-text'
    );
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            setActionLoading('cancel');
            updateBookingMutation.mutate({ status: 'cancelled' });
          },
        },
      ]
    );
  };

  const handleComplete = () => {
    Alert.alert(
      'Complete Booking',
      'Mark this booking as completed?',
      [
        { text: 'Not Yet', style: 'cancel' },
        {
          text: 'Complete',
          onPress: () => {
            setActionLoading('complete');
            updateBookingMutation.mutate({ status: 'completed' });
          },
        },
      ]
    );
  };

  const handleContact = () => {
    if (otherUser?.phone) {
      Linking.openURL(`tel:${otherUser.phone}`);
    } else {
      Alert.alert('Contact Info', 'No phone number available for this user.');
    }
  };

  const handleMessage = () => {
    router.push(`/conversations/${booking.id}`);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Booking Details\n\nItem: Rental #${booking.listingId.substring(0, 8)}\nDates: ${formatDate(booking.startDate)} - ${formatDate(booking.endDate)}\nTotal: $${booking.pricing?.total}\nStatus: ${statusBadge.text}`,
        title: 'Booking Information',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Status Section */}
      <View style={styles.section}>
        <View style={styles.statusHeader}>
          <Text style={styles.sectionTitle}>Booking Status</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusBadge.backgroundColor }]}>
            <Text style={[styles.statusText, { color: statusBadge.color }]}>
              {statusBadge.text}
            </Text>
          </View>
        </View>
        <Text style={styles.bookingId}>Booking ID: {booking.id}</Text>
      </View>

      {/* Item Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Item Details</Text>
        <View style={styles.itemCard}>
          <Text style={styles.itemTitle}>Rental Item #{booking.listingId.substring(0, 8)}</Text>
          <Text style={styles.itemNote}>Full item details available in listing</Text>
        </View>
      </View>

      {/* Rental Period */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rental Period</Text>
        <View style={styles.datesContainer}>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Start Date</Text>
            <Text style={styles.dateValue}>{formatDate(booking.startDate)}</Text>
            {booking.delivery?.pickupTime && (
              <Text style={styles.timeValue}>
                Pickup: {formatTime(booking.delivery.pickupTime)}
              </Text>
            )}
          </View>
          
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>End Date</Text>
            <Text style={styles.dateValue}>{formatDate(booking.endDate)}</Text>
            {booking.delivery?.returnTime && (
              <Text style={styles.timeValue}>
                Return: {formatTime(booking.delivery.returnTime)}
              </Text>
            )}
          </View>
          
          <View style={styles.durationCard}>
            <Text style={styles.durationLabel}>Total Duration</Text>
            <Text style={styles.durationValue}>{booking.durationDays} day{booking.durationDays === 1 ? '' : 's'}</Text>
          </View>
        </View>
      </View>

      {/* Delivery Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pickup & Delivery</Text>
        <View style={styles.deliveryCard}>
          <Text style={styles.deliveryMethod}>
            Method: {booking.delivery?.method === 'pickup' ? 'Pickup from owner' : 
                     booking.delivery?.method === 'delivery' ? 'Delivery to renter' : 'Meetup location'}
          </Text>
          
          {booking.delivery?.pickupAddress && (
            <View style={styles.addressItem}>
              <Text style={styles.addressLabel}>Pickup Address:</Text>
              <Text style={styles.addressValue}>{booking.delivery.pickupAddress}</Text>
            </View>
          )}
          
          {booking.delivery?.deliveryAddress && (
            <View style={styles.addressItem}>
              <Text style={styles.addressLabel}>Delivery Address:</Text>
              <Text style={styles.addressValue}>{booking.delivery.deliveryAddress}</Text>
            </View>
          )}
          
          {booking.delivery?.meetupLocation && (
            <View style={styles.addressItem}>
              <Text style={styles.addressLabel}>Meetup Location:</Text>
              <Text style={styles.addressValue}>{booking.delivery.meetupLocation}</Text>
            </View>
          )}
          
          {booking.delivery?.notes && (
            <View style={styles.addressItem}>
              <Text style={styles.addressLabel}>Delivery Notes:</Text>
              <Text style={styles.addressValue}>{booking.delivery.notes}</Text>
            </View>
          )}
        </View>
      </View>

      {/* User Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {isRenter ? 'Owner Information' : 'Renter Information'}
        </Text>
        <View style={styles.userCard}>
          <Text style={styles.userName}>
            {otherUser?.first_name} {otherUser?.last_name}
          </Text>
          <Text style={styles.userEmail}>{otherUser?.email}</Text>
          {otherUser?.phone && (
            <Text style={styles.userPhone}>Phone: {otherUser.phone}</Text>
          )}
          {otherUser?.verification_status === 'verified' && (
            <Text style={styles.verifiedBadge}>✓ Verified User</Text>
          )}
        </View>
      </View>

      {/* Price Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Price Breakdown</Text>
        <View style={styles.priceCard}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Base Price ({booking.durationDays} days)</Text>
            <Text style={styles.priceValue}>${booking.pricing?.basePrice || 0}</Text>
          </View>
          
          {booking.pricing?.deliveryFee && booking.pricing.deliveryFee > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Delivery Fee</Text>
              <Text style={styles.priceValue}>${booking.pricing.deliveryFee}</Text>
            </View>
          )}
          
          {booking.pricing?.cleaningFee && booking.pricing.cleaningFee > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Cleaning Fee</Text>
              <Text style={styles.priceValue}>${booking.pricing.cleaningFee}</Text>
            </View>
          )}
          
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Service Fee</Text>
            <Text style={styles.priceValue}>${booking.pricing?.serviceFee || 0}</Text>
          </View>
          
          {booking.pricing?.tax && booking.pricing.tax > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tax</Text>
              <Text style={styles.priceValue}>${booking.pricing.tax}</Text>
            </View>
          )}
          
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>${booking.pricing?.total || 0}</Text>
          </View>
        </View>
      </View>

      {/* Special Requests */}
      {booking.specialRequests && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Requests</Text>
          <Text style={styles.requestsText}>{booking.specialRequests}</Text>
        </View>
      )}

      {/* Notes */}
      {(booking.renterNotes || booking.ownerNotes) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          {booking.renterNotes && (
            <View style={styles.noteItem}>
              <Text style={styles.noteLabel}>Renter Notes:</Text>
              <Text style={styles.noteValue}>{booking.renterNotes}</Text>
            </View>
          )}
          {booking.ownerNotes && (
            <View style={styles.noteItem}>
              <Text style={styles.noteLabel}>Owner Notes:</Text>
              <Text style={styles.noteValue}>{booking.ownerNotes}</Text>
            </View>
          )}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {/* Communication buttons */}
        <View style={styles.communicationButtons}>
          <TouchableOpacity style={styles.messageButton} onPress={handleMessage}>
            <Text style={styles.messageButtonText}>Message</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.callButton} onPress={handleContact}>
            <Text style={styles.callButtonText}>Call</Text>
          </TouchableOpacity>
        </View>

        {/* Status-specific action buttons */}
        {booking.status === 'pending' && isOwner && (
          <View style={styles.approvalButtons}>
            <TouchableOpacity 
              style={[styles.rejectButton, actionLoading === 'reject' && styles.buttonDisabled]}
              onPress={handleReject}
              disabled={actionLoading === 'reject'}
            >
              <Text style={styles.rejectButtonText}>
                {actionLoading === 'reject' ? 'Rejecting...' : 'Reject'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.approveButton, actionLoading === 'approve' && styles.buttonDisabled]}
              onPress={handleApprove}
              disabled={actionLoading === 'approve'}
            >
              <Text style={styles.approveButtonText}>
                {actionLoading === 'approve' ? 'Approving...' : 'Approve'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {booking.status === 'confirmed' && (
          <View style={styles.activeButtons}>
            <TouchableOpacity 
              style={[styles.cancelButton, actionLoading === 'cancel' && styles.buttonDisabled]}
              onPress={handleCancel}
              disabled={actionLoading === 'cancel'}
            >
              <Text style={styles.cancelButtonText}>
                {actionLoading === 'cancel' ? 'Cancelling...' : 'Cancel Booking'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.completeButton, actionLoading === 'complete' && styles.buttonDisabled]}
              onPress={handleComplete}
              disabled={actionLoading === 'complete'}
            >
              <Text style={styles.completeButtonText}>
                {actionLoading === 'complete' ? 'Completing...' : 'Mark Complete'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
  header: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#44d62c',
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
  },
  shareButton: {
    padding: 8,
  },
  shareButtonText: {
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
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bookingId: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  itemCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  itemNote: {
    fontSize: 14,
    color: '#6b7280',
  },
  datesContainer: {
    gap: 16,
  },
  dateItem: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dateLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  timeValue: {
    fontSize: 14,
    color: '#44d62c',
    marginTop: 2,
  },
  durationCard: {
    backgroundColor: '#44d62c',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  durationLabel: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 4,
  },
  durationValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  deliveryCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  deliveryMethod: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  addressItem: {
    gap: 4,
  },
  addressLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  addressValue: {
    fontSize: 14,
    color: '#111827',
  },
  userCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  verifiedBadge: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
  },
  priceCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#44d62c',
  },
  requestsText: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
  },
  noteItem: {
    marginBottom: 12,
  },
  noteLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 4,
  },
  noteValue: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
  },
  actionsContainer: {
    padding: 16,
    gap: 16,
  },
  communicationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  messageButton: {
    flex: 1,
    backgroundColor: '#44d62c',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  messageButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  callButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  callButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  approvalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  activeButtons: {
    gap: 12,
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  completeButton: {
    backgroundColor: '#44d62c',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  buttonDisabled: {
    opacity: 0.6,
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