import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/components/AuthProvider';
import { colors, spacing, typography } from '../../src/lib/design-system';
import { Header } from '../../src/components/Header';

interface Booking {
  id: string;
  status: string;
  start_date: string;
  end_date: string;
  total_amount?: number;
  subtotal?: number;
  total_price?: number; // Keep for backward compatibility
  renter_id: string;
  owner_id: string;
  listing: {
    id: string;
  title: string;
    images: string[];
    price_per_day: number;
    category: string;
  };
  otherUser: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
  userRole: 'owner' | 'renter';
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  avatar_url?: string;
}

const statusColors = {
  pending: { bg: '#fef3c7', text: '#d97706' },
  confirmed: { bg: '#d1fae5', text: '#065f46' },
  active: { bg: '#dbeafe', text: '#1e40af' },
  completed: { bg: '#e0e7ff', text: '#4338ca' },
  cancelled: { bg: '#fee2e2', text: '#dc2626' },
  payment_required: { bg: '#fef3c7', text: '#d97706' },
};

export default function BookingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Clean console log without infinite loop
  console.log('BOOKINGS - User:', user ? user.email : 'No user');

  // Fetch bookings with simplified, working query
  const { data: allBookings = [], isLoading, refetch, error } = useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('BOOKINGS - No user ID, returning empty array');
        return [];
      }

      console.log('BOOKINGS - Fetching for user:', user.id);

      // Fetch all bookings for this user
      const { data: allUserBookings, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            *,
          listings (
            id,
            title,
            images,
            price_per_day,
            category,
            owner_id
          )
        `)
        .or(`renter_id.eq.${user.id},owner_id.eq.${user.id}`)
        .neq('status', 'expired')
        .order('created_at', { ascending: false });

      if (bookingsError) {
        console.error('BOOKINGS - Error fetching bookings:', bookingsError);
        throw bookingsError;
      }

      console.log('BOOKINGS - Raw bookings:', allUserBookings?.length || 0);

      if (!allUserBookings || allUserBookings.length === 0) {
        return [];
      }

      // Get all unique user IDs
      const userIds = new Set<string>();
      allUserBookings.forEach(booking => {
        if (booking.owner_id) userIds.add(booking.owner_id);
        if (booking.renter_id) userIds.add(booking.renter_id);
        if (booking.listings?.owner_id) userIds.add(booking.listings.owner_id);
      });

      // Fetch profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone_number, avatar_url')
        .in('id', Array.from(userIds));

      console.log('BOOKINGS - Profiles fetched:', profiles?.length || 0);

      // Create profiles map
      const profilesMap: { [key: string]: Profile } = {};
      profiles?.forEach(profile => {
        profilesMap[profile.id] = profile;
      });

      // Transform bookings
      const transformedBookings = allUserBookings
        .filter(booking => booking.listings !== null)
        .map(booking => {
          const isOwnerBooking = booking.owner_id === user.id;
          const otherUserId = isOwnerBooking ? booking.renter_id : booking.owner_id;
          const otherUser = profilesMap[otherUserId] || profilesMap[booking.listings?.owner_id] || {
            id: otherUserId,
            full_name: 'Unknown User',
            email: 'unknown@example.com'
          };

          return {
          ...booking,
            userRole: isOwnerBooking ? 'owner' : 'renter',
            listing: {
              id: booking.listings.id,
              title: booking.listings.title,
              images: booking.listings.images || [],
              price_per_day: booking.listings.price_per_day,
              category: booking.listings.category,
            },
            otherUser,
          };
        });

      console.log('BOOKINGS - Transformed bookings:', transformedBookings.length);
      return transformedBookings;
    },
    enabled: !!user?.id,
    staleTime: 30000, // 30 seconds
  });

  // Filter bookings based on active tab
  const filteredBookings = useMemo(() => {
    if (activeTab === 'all') return allBookings;
    if (activeTab === 'renter') return allBookings.filter(booking => booking.userRole === 'renter');
    if (activeTab === 'owner') return allBookings.filter(booking => booking.userRole === 'owner');
    return allBookings;
  }, [allBookings, activeTab]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = allBookings.length;
    const asRenter = allBookings.filter(booking => booking.userRole === 'renter').length;
    const asOwner = allBookings.filter(booking => booking.userRole === 'owner').length;
    const active = allBookings.filter(booking => ['confirmed', 'active'].includes(booking.status)).length;
    
    return { total, asRenter, asOwner, active };
  }, [allBookings]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const renderStatCard = (title: string, value: number, isActive: boolean = false, filterType?: 'all' | 'renter' | 'owner') => (
    <TouchableOpacity 
      style={[styles.statCard, isActive && styles.activeStatCard]} 
      onPress={() => filterType && setActiveTab(filterType)}
      activeOpacity={0.7}
    >
      <Text style={[styles.statValue, isActive && styles.activeStatValue]}>{value}</Text>
      <Text style={[styles.statLabel, isActive && styles.activeStatLabel]}>{title}</Text>
    </TouchableOpacity>
  );


  const renderBookingCard = ({ item: booking }: { item: Booking }) => {
    const statusColor = statusColors[booking.status as keyof typeof statusColors] || statusColors.pending;
    const imageUri = booking.listing.images?.[0] || 'https://via.placeholder.com/100';
    
    // Debug price data
    console.log('BOOKING PRICE DEBUG:', {
      id: booking.id,
      total_amount: booking.total_amount,
      subtotal: booking.subtotal,
      total_price: booking.total_price,
      price_per_day: booking.listing.price_per_day
    });

    return (
      <TouchableOpacity
        style={styles.bookingCard}
        onPress={() => router.push(`/bookings/${booking.id}`)}
      >
        <Image source={{ uri: imageUri }} style={styles.bookingImage} />
        
        <View style={styles.bookingContent}>
          <View style={styles.bookingHeader}>
            <Text style={styles.bookingTitle} numberOfLines={1}>
              {booking.listing.title}
              </Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
              <Text style={[styles.statusText, { color: statusColor.text }]}>
                {booking.status.toUpperCase()}
              </Text>
          </View>
        </View>

          <Text style={styles.bookingRole}>
            {booking.userRole === 'owner' ? 'Renting to' : 'Renting from'}: {booking.otherUser.full_name}
            </Text>

          <Text style={styles.bookingDates}>
            {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
          </Text>

          <Text style={styles.bookingPrice}>
            ${booking.total_amount?.toFixed(2) || booking.subtotal?.toFixed(2) || '0.00'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Header 
          title="My Bookings" 
          showBackButton={false}
          showNotificationIcon={true}
        />
        <View style={styles.centerContent}>
          <Text style={styles.notLoggedInText}>Please log in to view your bookings</Text>
        </View>
      </View>
    );
  }

  if (isLoading && !refreshing) {
    return (
      <View style={styles.container}>
        <Header 
          title="My Bookings" 
          showBackButton={false}
          showNotificationIcon={true}
        />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary?.main || '#44d62c'} />
          <Text style={styles.loadingText}>Loading bookings...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Header 
          title="My Bookings" 
          showBackButton={false}
          showNotificationIcon={true}
        />
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Error loading bookings</Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header 
        title="My Bookings" 
        showBackButton={false}
        showNotificationIcon={true}
      />

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsContent}>
          {renderStatCard('Total', stats.total, activeTab === 'all', 'all')}
          {renderStatCard('As Renter', stats.asRenter, activeTab === 'renter', 'renter')}
          {renderStatCard('As Owner', stats.asOwner, activeTab === 'owner', 'owner')}
          {renderStatCard('Active', stats.active, false)}
        </ScrollView>
      </View>


      {/* Bookings List */}
      <View style={styles.listWrapper}>
        {filteredBookings.length === 0 ? (
          <View style={styles.centerContent}>
            <Text style={styles.emptyText}>
              {activeTab === 'all' ? 'No bookings found' : 
               activeTab === 'renter' ? 'No bookings as renter' : 
               'No bookings as owner'}
            </Text>
        </View>
        ) : (
      <FlatList
            data={filteredBookings}
        renderItem={renderBookingCard}
        keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
        refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[colors.primary?.main || '#44d62c']}
              />
            }
        showsVerticalScrollIndicator={false}
            style={styles.flatList}
      />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors?.gray?.[50] || '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing?.lg || 24,
    paddingVertical: spacing?.md || 16,
    backgroundColor: colors?.white || 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors?.gray?.[200] || '#e2e8f0',
  },
  headerTitle: {
    fontSize: typography?.sizes?.xl || 20,
    fontWeight: typography?.weights?.bold || '700',
    color: colors?.gray?.[900] || '#1a202c',
  },
  statsContainer: {
    backgroundColor: colors?.white || 'white',
    paddingVertical: spacing?.sm || 8,
    borderBottomWidth: 1,
    borderBottomColor: colors?.gray?.[200] || '#e2e8f0',
  },
  statsContent: {
    paddingHorizontal: spacing?.md || 16,
    gap: spacing?.sm || 8,
  },
  statCard: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: spacing?.md || 16,
    paddingVertical: spacing?.sm || 8,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 80,
  },
  activeStatCard: {
    backgroundColor: colors?.primary?.main || '#44d62c',
  },
  statValue: {
    fontSize: typography?.sizes?.lg || 18,
    fontWeight: typography?.weights?.bold || '700',
    color: colors?.text?.primary || '#1a202c',
  },
  activeStatValue: {
    color: 'white',
  },
  statLabel: {
    fontSize: typography?.sizes?.xs || 12,
    color: colors?.text?.secondary || '#64748b',
    marginTop: 2,
  },
  activeStatLabel: {
    color: 'white',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing?.md || 16,
    minHeight: 200,
  },
  notLoggedInText: {
    fontSize: typography?.sizes?.lg || 18,
    color: colors?.text?.secondary || '#64748b',
    textAlign: 'center',
  },
  loadingText: {
    marginTop: spacing?.sm || 8,
    fontSize: typography?.sizes?.base || 16,
    color: colors?.text?.secondary || '#64748b',
  },
  errorText: {
    fontSize: typography?.sizes?.lg || 18,
    color: colors?.semantic?.error || '#ef4444',
    textAlign: 'center',
    marginBottom: spacing?.md || 16,
  },
  retryButton: {
    backgroundColor: colors?.primary?.main || '#44d62c',
    paddingHorizontal: spacing?.md || 16,
    paddingVertical: spacing?.sm || 8,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontSize: typography?.sizes?.base || 16,
    fontWeight: typography?.weights?.semibold || '600',
  },
  emptyText: {
    fontSize: typography?.sizes?.lg || 18,
    color: colors?.text?.secondary || '#64748b',
    textAlign: 'center',
  },
  listWrapper: {
    flex: 1,
  },
  flatList: {
    flex: 1,
  },
  listContainer: {
    padding: spacing?.md || 16,
  },
  bookingCard: {
    backgroundColor: colors?.white || 'white',
    borderRadius: 12,
    marginBottom: spacing?.md || 16,
    padding: spacing?.md || 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: spacing?.md || 16,
  },
  bookingContent: {
    flex: 1,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing?.xs || 4,
  },
  bookingTitle: {
    fontSize: typography?.sizes?.lg || 18,
    fontWeight: typography?.weights?.semibold || '600',
    color: colors?.text?.primary || '#1a202c',
    flex: 1,
    marginRight: spacing?.sm || 8,
  },
  statusBadge: {
    paddingHorizontal: spacing?.sm || 8,
    paddingVertical: spacing?.xs || 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: typography?.weights?.bold || '700',
    textTransform: 'uppercase',
  },
  bookingRole: {
    fontSize: typography?.sizes?.sm || 14,
    color: colors?.text?.secondary || '#64748b',
    marginBottom: spacing?.xs || 4,
  },
  bookingDates: {
    fontSize: typography?.sizes?.sm || 14,
    color: colors?.text?.secondary || '#64748b',
    marginBottom: spacing?.xs || 4,
  },
  bookingPrice: {
    fontSize: typography?.sizes?.lg || 18,
    fontWeight: typography?.weights?.bold || '700',
    color: colors?.primary?.main || '#44d62c',
  },
}); 