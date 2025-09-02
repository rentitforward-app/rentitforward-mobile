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
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../src/stores/auth';
import { supabase } from '../../src/lib/supabase';
import type { Booking } from '@shared/types/booking';
import { colors, spacing, typography } from '../../src/lib/design-system';

type UserRole = 'renter' | 'owner';
type BookingStatus = 'pending' | 'pending_payment' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'rejected' | 'disputed' | 'refunded';

interface BookingTabData {
  key: UserRole;
  title: string;
  count: number;
}

interface StatsData {
  total: number;
  pending: number;
  active: number;
  completed: number;
  cancelled: number;
}

export default function BookingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<UserRole>('renter');
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateSort, setDateSort] = useState<'newest' | 'oldest'>('newest');
  const scrollViewRef = useRef<ScrollView>(null);

  // Fetch user bookings
  const { data: allBookings = [], isLoading, refetch } = useQuery({
    queryKey: ['user-bookings', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const [renterBookingsResult, ownerBookingsResult] = await Promise.all([
        // Bookings where user is the renter
        supabase
          .from('bookings')
          .select(`
            *,
            listing:listings(*),
            owner:profiles!bookings_owner_id_fkey(*)
          `)
          .eq('renter_id', user.id)
          .order('created_at', { ascending: false }),
        
        // Bookings where user is the owner
        supabase
          .from('bookings')
          .select(`
            *,
            listing:listings(*),
            renter:profiles!bookings_renter_id_fkey(*)
          `)
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })
      ]);

      const renterBookings = renterBookingsResult.data || [];
      const ownerBookings = ownerBookingsResult.data || [];
      
      if (renterBookingsResult.error || ownerBookingsResult.error) {
        throw renterBookingsResult.error || ownerBookingsResult.error;
      }

      // Transform and combine bookings
      const transformedBookings = [
        ...renterBookings.map(booking => ({
          ...booking,
          userRole: 'renter' as const,
          otherUser: booking.owner,
        })),
        ...ownerBookings.map(booking => ({
          ...booking,
          userRole: 'owner' as const,
          otherUser: booking.renter,
        }))
      ];

      return transformedBookings;
    },
    enabled: !!user?.id,
  });

  // Filter bookings by active tab and search
  const filteredBookings = allBookings.filter(booking => {
    // Filter by user role
    if (booking.userRole !== activeTab) return false;
    
    // Filter by status
    if (statusFilter !== 'all' && booking.status !== statusFilter) return false;
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const listingTitle = booking.listing?.title?.toLowerCase() || '';
      const otherUserName = booking.otherUser?.full_name?.toLowerCase() || '';
      return listingTitle.includes(searchLower) || otherUserName.includes(searchLower);
    }
    
    return true;
  });

  // Sort bookings
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return dateSort === 'newest' ? dateB - dateA : dateA - dateB;
  });

  // Calculate stats for active tab
  const calculateStats = (): StatsData => {
    const tabBookings = allBookings.filter(booking => booking.userRole === activeTab);
    return {
      total: tabBookings.length,
      pending: tabBookings.filter(b => b.status === 'pending').length,
      active: tabBookings.filter(b => b.status === 'confirmed' || b.status === 'active').length,
      completed: tabBookings.filter(b => b.status === 'completed').length,
      cancelled: tabBookings.filter(b => b.status === 'cancelled' || b.status === 'rejected').length,
    };
  };

  const stats = calculateStats();

  // Tab configuration
  const tabs: BookingTabData[] = [
    { key: 'renter', title: "I'm Renting", count: allBookings.filter(b => b.userRole === 'renter').length },
    { key: 'owner', title: 'My Items', count: allBookings.filter(b => b.userRole === 'owner').length },
  ];

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

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(price);
  };

  // Get status badge props
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return { color: '#f59e0b', backgroundColor: '#fef3c7', text: 'Pending' };
      case 'pending_payment':
        return { color: '#8b5cf6', backgroundColor: '#f3e8ff', text: 'Payment Required' };
      case 'confirmed':
        return { color: '#3b82f6', backgroundColor: '#dbeafe', text: 'Confirmed' };
      case 'active':
        return { color: '#10b981', backgroundColor: '#d1fae5', text: 'Active' };
      case 'completed':
        return { color: '#6b7280', backgroundColor: '#f3f4f6', text: 'Completed' };
      case 'cancelled':
      case 'rejected':
        return { color: '#ef4444', backgroundColor: '#fee2e2', text: 'Cancelled' };
      case 'disputed':
        return { color: '#f97316', backgroundColor: '#fed7aa', text: 'Disputed' };
      default:
        return { color: '#6b7280', backgroundColor: '#f3f4f6', text: 'Unknown' };
    }
  };

  // Update booking status
  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) throw error;

      await refetch();
      Alert.alert('Success', `Booking ${newStatus === 'confirmed' ? 'accepted' : 'declined'} successfully!`);
    } catch (error) {
      console.error('Failed to update booking status:', error);
      Alert.alert('Error', 'Failed to update booking status. Please try again.');
    }
  };

  // Render booking card
  const renderBookingCard = ({ item: booking }: { item: any }) => {
    const statusBadge = getStatusBadge(booking.status);
    const isRenter = booking.userRole === 'renter';
    const otherUser = booking.otherUser || { full_name: 'Unknown User' };

    return (
      <TouchableOpacity
        style={styles.bookingCard}
        onPress={() => router.push(`/bookings/${booking.id}`)}
      >
        {/* Header with image and basic info */}
        <View style={styles.cardHeader}>
          <View style={styles.cardImageContainer}>
            <View style={styles.cardImage}>
              <Text style={styles.cardImageText}>📦</Text>
            </View>
          </View>
          
          <View style={styles.cardHeaderContent}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {booking.listing?.title || 'Unknown Item'}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: statusBadge.backgroundColor }]}>
                <Text style={[styles.statusText, { color: statusBadge.color }]}>
                  {statusBadge.text}
                </Text>
              </View>
            </View>
            
            <View style={styles.cardMeta}>
              <Text style={styles.cardMetaText}>
                {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
              </Text>
              <Text style={styles.cardMetaText}>
                {formatPrice(booking.total_amount || 0)}
              </Text>
            </View>
          </View>
        </View>

        {/* Other user info */}
        <View style={styles.cardUser}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {otherUser.full_name?.charAt(0) || 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>
            {isRenter ? 'Owner' : 'Renter'}: {otherUser.full_name || 'Unknown User'}
          </Text>
        </View>

        {/* Role badge */}
        <View style={styles.cardRole}>
          <Text style={styles.cardRoleText}>
            {isRenter ? '📦 I\'m Renting' : '🏠 My Item'}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.cardActions}>
          {/* Owner actions for pending bookings */}
          {booking.userRole === 'owner' && booking.status === 'pending' && (
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.acceptButton}
                onPress={() => updateBookingStatus(booking.id, 'confirmed')}
              >
                <Text style={styles.acceptButtonText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.declineButton}
                onPress={() => updateBookingStatus(booking.id, 'rejected')}
              >
                <Text style={styles.declineButtonText}>Decline</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Renter cancel option for pending bookings */}
          {booking.userRole === 'renter' && booking.status === 'pending' && (
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => {
                Alert.alert(
                  'Cancel Booking',
                  'Are you sure you want to cancel this booking request?',
                  [
                    { text: 'No', style: 'cancel' },
                    { text: 'Yes', onPress: () => updateBookingStatus(booking.id, 'cancelled') }
                  ]
                );
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel Request</Text>
            </TouchableOpacity>
          )}

          {/* Common actions */}
          <View style={styles.commonActions}>
            <TouchableOpacity 
              style={styles.messageButton}
              onPress={() => router.push(`/conversations/${booking.otherUser?.id}`)}
            >
              <Text style={styles.messageButtonText}>💬 Message</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.detailsButton}
              onPress={() => router.push(`/bookings/${booking.id}`)}
            >
              <Text style={styles.detailsButtonText}>👁️ Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Render empty state
  const renderEmptyState = () => {
    const emptyMessages = {
      renter: {
        title: 'No bookings found',
        description: "You haven't made any bookings yet. Start exploring items to rent!",
        action: 'Browse Items',
        onPress: () => router.push('/(tabs)/browse'),
      },
      owner: {
        title: 'No booking requests',
        description: 'Booking requests for your items will appear here',
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
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your bookings...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <Text style={styles.headerSubtitle}>Track items you're renting and booking requests for your items</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
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
      </View>

      {/* Stats Cards */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.statsContainer}
        contentContainerStyle={styles.statsContent}
      >
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.active}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.cancelled}</Text>
          <Text style={styles.statLabel}>Cancelled</Text>
        </View>
      </ScrollView>

      {/* Search and Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search bookings..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
        
        <View style={styles.filterRow}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.statusFilterContainer}
          >
            <TouchableOpacity
              style={[
                styles.statusFilter,
                statusFilter === 'all' && styles.activeStatusFilter,
              ]}
              onPress={() => setStatusFilter('all')}
            >
              <Text style={[
                styles.statusFilterText,
                statusFilter === 'all' && styles.activeStatusFilterText,
              ]}>
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.statusFilter,
                statusFilter === 'pending' && styles.activeStatusFilter,
              ]}
              onPress={() => setStatusFilter('pending')}
            >
              <Text style={[
                styles.statusFilterText,
                statusFilter === 'pending' && styles.activeStatusFilterText,
              ]}>
                Pending
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.statusFilter,
                statusFilter === 'confirmed' && styles.activeStatusFilter,
              ]}
              onPress={() => setStatusFilter('confirmed')}
            >
              <Text style={[
                styles.statusFilterText,
                statusFilter === 'confirmed' && styles.activeStatusFilterText,
              ]}>
                Confirmed
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.statusFilter,
                statusFilter === 'active' && styles.activeStatusFilter,
              ]}
              onPress={() => setStatusFilter('active')}
            >
              <Text style={[
                styles.statusFilterText,
                statusFilter === 'active' && styles.activeStatusFilterText,
              ]}>
                Active
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.statusFilter,
                statusFilter === 'completed' && styles.activeStatusFilter,
              ]}
              onPress={() => setStatusFilter('completed')}
            >
              <Text style={[
                styles.statusFilterText,
                statusFilter === 'completed' && styles.activeStatusFilterText,
              ]}>
                Completed
              </Text>
            </TouchableOpacity>
          </ScrollView>
          
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setDateSort(dateSort === 'newest' ? 'oldest' : 'newest')}
          >
            <Text style={styles.sortButtonText}>
              {dateSort === 'newest' ? 'Newest' : 'Oldest'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Results Summary */}
      {sortedBookings.length > 0 && (
        <View style={styles.resultsSummary}>
          <Text style={styles.resultsText}>
            Showing {sortedBookings.length} booking{sortedBookings.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* Booking List */}
      <FlatList
        data={sortedBookings}
        renderItem={renderBookingCard}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={[
          styles.listContainer,
          sortedBookings.length === 0 && styles.emptyListContainer,
        ]}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
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
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  tabContainer: {
    backgroundColor: colors.white,
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.mediumGray,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.xs,
    borderRadius: 8,
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
  statsContainer: {
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
  },
  statsContent: {
    paddingHorizontal: spacing.md,
  },
  statCard: {
    backgroundColor: colors.neutral.lightGray,
    padding: spacing.md,
    borderRadius: 12,
    marginRight: spacing.sm,
    minWidth: 80,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  filtersContainer: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.mediumGray,
  },
  searchContainer: {
    marginBottom: spacing.sm,
  },
  searchInput: {
    backgroundColor: colors.neutral.lightGray,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusFilterContainer: {
    flex: 1,
  },
  statusFilter: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    marginRight: spacing.xs,
    backgroundColor: colors.neutral.lightGray,
  },
  activeStatusFilter: {
    backgroundColor: colors.primary.main,
  },
  statusFilterText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  activeStatusFilterText: {
    color: colors.white,
  },
  sortButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    backgroundColor: colors.neutral.lightGray,
  },
  sortButtonText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  resultsSummary: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.mediumGray,
  },
  resultsText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
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
    marginBottom: spacing.sm,
  },
  cardImageContainer: {
    marginRight: spacing.sm,
  },
  cardImage: {
    width: 60,
    height: 60,
    backgroundColor: colors.neutral.lightGray,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImageText: {
    fontSize: 24,
  },
  cardHeaderContent: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  cardTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing.sm,
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
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardMetaText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  cardUser: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.neutral.lightGray,
    borderRadius: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  userAvatarText: {
    color: colors.white,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  userName: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
  },
  cardRole: {
    marginBottom: spacing.sm,
  },
  cardRoleText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  cardActions: {
    borderTopWidth: 1,
    borderTopColor: colors.neutral.mediumGray,
    paddingTop: spacing.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: colors.primary.main,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.white,
  },
  declineButton: {
    flex: 1,
    backgroundColor: colors.neutral.lightGray,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  declineButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
  },
  cancelButton: {
    backgroundColor: colors.neutral.lightGray,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cancelButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
  },
  commonActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  messageButton: {
    flex: 1,
    backgroundColor: colors.neutral.lightGray,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  messageButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  detailsButton: {
    flex: 1,
    backgroundColor: colors.neutral.lightGray,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  detailsButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.text.secondary,
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