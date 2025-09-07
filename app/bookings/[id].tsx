import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  ScrollView,
  ActivityIndicator 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../src/lib/supabase';
import { useAuthStore } from '../../src/stores/auth';
import { colors, spacing, typography } from '../../src/lib/design-system';

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  // Fetch booking details
  const { data: booking, isLoading, error } = useQuery({
    queryKey: ['booking-details', id],
    queryFn: async () => {
      if (!id) throw new Error('No booking ID provided');
      
      console.log('Fetching booking details for ID:', id);
      
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
          renter:renter_id (
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

      console.log('Booking details fetched:', data);
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <View style={[screenStyles.container, { paddingTop: insets.top }]}>
        <View style={screenStyles.header}>
          <TouchableOpacity onPress={() => router.back()} style={screenStyles.backButton}>
            <Text style={screenStyles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={screenStyles.headerTitle}>Booking Details</Text>
          <View style={screenStyles.placeholder} />
        </View>
        <View style={screenStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={screenStyles.loadingText}>Loading booking details...</Text>
        </View>
      </View>
    );
  }

  if (error || !booking) {
    return (
      <View style={[screenStyles.container, { paddingTop: insets.top }]}>
        <View style={screenStyles.header}>
          <TouchableOpacity onPress={() => router.back()} style={screenStyles.backButton}>
            <Text style={screenStyles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={screenStyles.headerTitle}>Booking Details</Text>
          <View style={screenStyles.placeholder} />
        </View>
        <View style={screenStyles.errorContainer}>
          <Text style={screenStyles.errorText}>
            {error?.message || 'Booking not found'}
          </Text>
          <TouchableOpacity 
            style={screenStyles.retryButton} 
            onPress={() => router.back()}
          >
            <Text style={screenStyles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const isOwner = booking.owner_id === user?.id;
  const isRenter = booking.renter_id === user?.id;
  const otherUser = isRenter ? booking.listings?.profiles : booking.renter;

  return (
    <View style={[screenStyles.container, { paddingTop: insets.top }]}>
      <View style={screenStyles.header}>
        <TouchableOpacity onPress={() => router.back()} style={screenStyles.backButton}>
          <Text style={screenStyles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={screenStyles.headerTitle}>Booking Details</Text>
        <View style={screenStyles.placeholder} />
      </View>

      <ScrollView style={screenStyles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Status Section */}
        <View style={screenStyles.section}>
          <Text style={screenStyles.sectionTitle}>Booking Status</Text>
          <View style={screenStyles.statusContainer}>
            <Text style={screenStyles.statusText}>{booking.status}</Text>
          </View>
          <Text style={screenStyles.bookingId}>Booking ID: {booking.id}</Text>
        </View>

        {/* Item Information */}
        <View style={screenStyles.section}>
          <Text style={screenStyles.sectionTitle}>Item Details</Text>
          <View style={screenStyles.itemCard}>
            <Text style={screenStyles.itemTitle}>
              {booking.listings?.title || 'Unknown Item'}
            </Text>
            <Text style={screenStyles.itemPrice}>
              ${booking.listings?.price_per_day || 0}/day
            </Text>
          </View>
        </View>

        {/* User Information */}
        <View style={screenStyles.section}>
          <Text style={screenStyles.sectionTitle}>
            {isRenter ? 'Owner Information' : 'Renter Information'}
          </Text>
          <View style={screenStyles.userCard}>
            <Text style={screenStyles.userName}>
              {otherUser?.full_name || 'Unknown User'}
            </Text>
            <Text style={screenStyles.userEmail}>{otherUser?.email}</Text>
          </View>
        </View>

        {/* Price Information */}
        <View style={screenStyles.section}>
          <Text style={screenStyles.sectionTitle}>Price Details</Text>
          <View style={screenStyles.priceCard}>
            <View style={screenStyles.priceRow}>
              <Text style={screenStyles.priceLabel}>Total Amount</Text>
              <Text style={screenStyles.priceValue}>
                ${booking.total_amount?.toFixed(2) || booking.subtotal?.toFixed(2) || '0.00'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const screenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral?.lightGray || '#f9fafb',
  },
  header: {
    backgroundColor: colors.white || '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing?.md || 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray?.[200] || '#e5e7eb',
  },
  headerTitle: {
    fontSize: typography?.sizes?.lg || 18,
    fontWeight: typography?.weights?.semibold || '600',
    color: colors.text?.primary || '#111827',
  },
  backButton: {
    padding: spacing?.sm || 8,
  },
  backButtonText: {
    fontSize: typography?.sizes?.base || 16,
    color: colors.primary?.main || '#44d62c',
    fontWeight: typography?.weights?.medium || '500',
  },
  placeholder: {
    width: 60,
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography?.sizes?.base || 16,
    color: colors.text?.secondary || '#6b7280',
    marginTop: spacing?.md || 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing?.lg || 24,
  },
  errorText: {
    fontSize: typography?.sizes?.lg || 18,
    color: colors.semantic?.error || '#ef4444',
    marginBottom: spacing?.lg || 24,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary?.main || '#44d62c',
    paddingHorizontal: spacing?.lg || 24,
    paddingVertical: spacing?.md || 16,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white || '#ffffff',
    fontSize: typography?.sizes?.base || 16,
    fontWeight: typography?.weights?.semibold || '600',
  },
  section: {
    backgroundColor: colors.white || '#ffffff',
    marginTop: spacing?.sm || 8,
    padding: spacing?.md || 16,
  },
  sectionTitle: {
    fontSize: typography?.sizes?.lg || 18,
    fontWeight: typography?.weights?.semibold || '600',
    color: colors.text?.primary || '#111827',
    marginBottom: spacing?.sm || 8,
  },
  statusContainer: {
    backgroundColor: colors.primary?.main || '#44d62c',
    paddingHorizontal: spacing?.sm || 8,
    paddingVertical: spacing?.xs || 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: colors.white || '#ffffff',
    fontSize: typography?.sizes?.sm || 14,
    fontWeight: typography?.weights?.semibold || '600',
    textTransform: 'capitalize',
  },
  bookingId: {
    fontSize: typography?.sizes?.xs || 12,
    color: colors.text?.secondary || '#6b7280',
    marginTop: spacing?.sm || 8,
    fontFamily: 'monospace',
  },
  itemCard: {
    backgroundColor: colors.neutral?.lightGray || '#f9fafb',
    padding: spacing?.md || 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray?.[200] || '#e5e7eb',
  },
  itemTitle: {
    fontSize: typography?.sizes?.base || 16,
    fontWeight: typography?.weights?.semibold || '600',
    color: colors.text?.primary || '#111827',
    marginBottom: spacing?.xs || 4,
  },
  itemPrice: {
    fontSize: typography?.sizes?.sm || 14,
    color: colors.primary?.main || '#44d62c',
    fontWeight: typography?.weights?.semibold || '600',
  },
  userCard: {
    backgroundColor: colors.neutral?.lightGray || '#f9fafb',
    padding: spacing?.md || 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray?.[200] || '#e5e7eb',
  },
  userName: {
    fontSize: typography?.sizes?.base || 16,
    fontWeight: typography?.weights?.semibold || '600',
    color: colors.text?.primary || '#111827',
    marginBottom: spacing?.xs || 4,
  },
  userEmail: {
    fontSize: typography?.sizes?.sm || 14,
    color: colors.text?.secondary || '#6b7280',
  },
  priceCard: {
    backgroundColor: colors.neutral?.lightGray || '#f9fafb',
    padding: spacing?.md || 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray?.[200] || '#e5e7eb',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: typography?.sizes?.sm || 14,
    color: colors.text?.secondary || '#6b7280',
  },
  priceValue: {
    fontSize: typography?.sizes?.base || 16,
    color: colors.text?.primary || '#111827',
    fontWeight: typography?.weights?.semibold || '600',
  },
});