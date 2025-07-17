import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../src/stores/auth';
import { supabase } from '../../src/lib/supabase';
import type { Booking } from '@shared/types/booking';
import { colors, spacing, typography, componentStyles } from '../../src/lib/design-system';

type BookingStatus = 'active' | 'pending' | 'past' | 'cancelled';

interface BookingTabData {
  key: BookingStatus;
  title: string;
  count: number;
}

export default function BookingsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<BookingStatus>('active');
  const [refreshing, setRefreshing] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Fetch user bookings
  const { data: allBookings = [], isLoading, refetch } = useQuery({
    queryKey: ['user-bookings', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          listing:listings(*),
          owner:profiles!bookings_owner_id_fkey(*),
          renter:profiles!bookings_renter_id_fkey(*)
        `)
        .or(`owner_id.eq.${user.id},renter_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Booking[];
    },
    enabled: !!user?.id,
  });

  // Categorize bookings by status
  const categorizeBookings = (bookings: Booking[]) => {
    const now = new Date();
    const categories = {
      active: [] as Booking[],
      pending: [] as Booking[],
      past: [] as Booking[],
      cancelled: [] as Booking[],
    };

    bookings.forEach(booking => {
      const endDate = new Date(booking.endDate);
      
      if (booking.status === 'cancelled') {
        categories.cancelled.push(booking);
      } else if (booking.status === 'pending') {
        categories.pending.push(booking);
      } else if (booking.status === 'confirmed' && endDate >= now) {
        categories.active.push(booking);
      } else {
        categories.past.push(booking);
      }
    });

    return categories;
  };

  const categorizedBookings = categorizeBookings(allBookings);

  // Tab configuration
  const tabs: BookingTabData[] = [
    { key: 'active', title: 'Active', count: categorizedBookings.active.length },
    { key: 'pending', title: 'Pending', count: categorizedBookings.pending.length },
    { key: 'past', title: 'Past', count: categorizedBookings.past.length },
    { key: 'cancelled', title: 'Cancelled', count: categorizedBookings.cancelled.length },
  ];

  // Get bookings for active tab
  const currentBookings = categorizedBookings[activeTab];

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get status badge props
  const getStatusBadge = (booking: Booking) => {
    const now = new Date();
    const startDate = new Date(booking.startDate);
    const endDate = new Date(booking.endDate);

    switch (booking.status) {
      case 'pending':
        return { color: '#f59e0b', backgroundColor: '#fef3c7', text: 'Pending' };
      case 'confirmed':
        if (startDate > now) {
          return { color: '#3b82f6', backgroundColor: '#dbeafe', text: 'Confirmed' };
        } else if (endDate >= now) {
          return { color: '#10b981', backgroundColor: '#d1fae5', text: 'Active' };
        } else {
          return { color: '#6b7280', backgroundColor: '#f3f4f6', text: 'Completed' };
        }
      case 'cancelled':
        return { color: '#ef4444', backgroundColor: '#fee2e2', text: 'Cancelled' };
      default:
        return { color: '#6b7280', backgroundColor: '#f3f4f6', text: 'Unknown' };
    }
  };

  // Render booking card
  const renderBookingCard = ({ item: booking }: { item: Booking }) => {
    const statusBadge = getStatusBadge(booking);
    const isRenter = booking.renterId === user?.id;
    // Note: For now we'll show placeholder user data since the booking type doesn't include populated user objects
    const otherUser = { first_name: 'Owner/Renter', last_name: '' };

    return (
      <TouchableOpacity
        style={styles.bookingCard}
        onPress={() => router.push(`/bookings/${booking.id}`)}
      >
        {/* Header with title and status */}
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              Rental Item #{booking.listingId.substring(0, 8)}
            </Text>
            <Text style={styles.cardRole}>
              {isRenter ? 'Renting' : 'Lending'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusBadge.backgroundColor }]}>
            <Text style={[styles.statusText, { color: statusBadge.color }]}>
              {statusBadge.text}
            </Text>
          </View>
        </View>

        {/* Dates and duration */}
        <View style={styles.cardDates}>
          <Text style={styles.dateText}>
            {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
          </Text>
          <Text style={styles.durationText}>
            {booking.durationDays} days
          </Text>
        </View>

        {/* Other user info */}
        <View style={styles.cardUser}>
          <Text style={styles.userLabel}>
            {isRenter ? 'Owner:' : 'Renter:'}
          </Text>
          <Text style={styles.userName}>
            {otherUser?.first_name} {otherUser?.last_name}
          </Text>
        </View>

        {/* Amount and delivery info */}
        <View style={styles.cardFooter}>
          <View style={styles.cardAmount}>
            <Text style={styles.amountLabel}>Total:</Text>
            <Text style={styles.amountValue}>${booking.pricing?.total || 0}</Text>
          </View>
          <Text style={styles.deliveryInfo}>
            {booking.delivery?.method === 'pickup' ? 'Pickup' : 'Delivery'}
          </Text>
        </View>

        {/* Quick actions for pending bookings */}
        {booking.status === 'pending' && !isRenter && (
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.acceptButton}>
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.declineButton}>
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Render empty state
  const renderEmptyState = () => {
    const emptyMessages = {
      active: {
        title: 'No active bookings',
        description: 'Your confirmed and ongoing rentals will appear here',
        action: 'Browse Items',
        onPress: () => router.push('/(tabs)/browse'),
      },
      pending: {
        title: 'No pending bookings',
        description: 'Booking requests awaiting confirmation will appear here',
        action: 'Browse Items',
        onPress: () => router.push('/(tabs)/browse'),
      },
      past: {
        title: 'No past bookings',
        description: 'Your completed rental history will appear here',
        action: 'Browse Items',
        onPress: () => router.push('/(tabs)/browse'),
      },
      cancelled: {
        title: 'No cancelled bookings',
        description: 'Cancelled bookings will appear here',
        action: 'Browse Items',
        onPress: () => router.push('/(tabs)/browse'),
      },
    };

    const message = emptyMessages[activeTab];

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>{message.title}</Text>
        <Text style={styles.emptyDescription}>{message.description}</Text>
        <TouchableOpacity style={styles.emptyAction} onPress={message.onPress}>
          <Text style={styles.emptyActionText}>{message.action}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your bookings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
      </View>

      {/* Tabs */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabContainer}
        contentContainerStyle={styles.tabContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.activeTab,
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab.key && styles.activeTabText,
            ]}>
              {tab.title}
            </Text>
            {tab.count > 0 && (
              <View style={[
                styles.tabBadge,
                activeTab === tab.key && styles.activeTabBadge,
              ]}>
                <Text style={[
                  styles.tabBadgeText,
                  activeTab === tab.key && styles.activeTabBadgeText,
                ]}>
                  {tab.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Booking List */}
      <FlatList
        data={currentBookings}
        renderItem={renderBookingCard}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={[
          styles.listContainer,
          currentBookings.length === 0 && styles.emptyListContainer,
        ]}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.lightGray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
  },
  header: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.mediumGray,
  },
  headerTitle: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  tabContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.mediumGray,
  },
  tabContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    marginRight: spacing.sm,
    backgroundColor: colors.neutral.lightGray,
  },
  activeTab: {
    backgroundColor: colors.primary.main,
  },
  tabText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  activeTabText: {
    color: colors.white,
  },
  tabBadge: {
    marginLeft: spacing.xs,
    backgroundColor: colors.neutral.mediumGray,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  activeTabBadge: {
    backgroundColor: colors.white,
  },
  tabBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
  },
  activeTabBadgeText: {
    color: colors.primary.main,
  },
  listContainer: {
    padding: spacing.md,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  bookingCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral.mediumGray,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  cardTitleContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  cardTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs / 2,
  },
  cardRole: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    fontWeight: typography.weights.medium,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardDates: {
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  durationText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  cardUser: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  userLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 8,
  },
  userName: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardAmount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 8,
  },
  amountValue: {
    fontSize: 16,
    color: '#44d62c',
    fontWeight: '600',
  },
  deliveryInfo: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#44d62c',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  declineButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  declineButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyAction: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  emptyActionText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.white,
  },
}); 