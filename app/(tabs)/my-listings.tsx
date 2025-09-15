import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../src/lib/design-system';
import { useAuth } from '../../src/components/AuthProvider';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { Header } from '../../src/components/Header';

interface Listing {
  id: string;
  title: string;
  description: string;
  price_per_day: number;
  category: string;
  images: string[];
  status: 'active' | 'paused' | 'draft' | 'pending_approval' | 'rejected' | 'rented';
  created_at: string;
  view_count: number;
  total_bookings: number;
  total_earnings: number;
  availability: boolean;
  rating: number;
  review_count: number;
}

interface ItemBooking {
  id: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'disputed' | 'payment_required' | 'return_pending';
  created_at: string;
  listing_id: string;
  listing_title: string;
  renter: {
    id: string;
    full_name: string;
    avatar_url?: string;
    email: string;
    phone?: string;
  };
}

export default function MyListingsScreen() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [itemBookings, setItemBookings] = useState<ItemBooking[]>([]);
  const [activeTab, setActiveTab] = useState<'items' | 'bookings' | 'earnings'>('items');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingListings, setUpdatingListings] = useState<Set<string>>(new Set());
  
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      
      // Fetch user listings
      const { data: listingsData, error: listingsError } = await supabase
        .from('listings')
        .select(`
          id,
          title,
          description,
          price_per_day,
          category,
          images,
          is_active,
          approval_status,
          created_at,
          view_count,
          booking_count,
          available_from,
          available_to,
          rating,
          review_count
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (listingsError) {
        console.error('Error fetching listings:', listingsError);
        return;
      }

      // Fetch bookings for the user's listings
      const listingIds = listingsData?.map(listing => listing.id) || [];
      let itemBookingsData: any[] = [];
      
      if (listingIds.length > 0) {
        const { data: bookingsRaw, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            id,
            start_date,
            end_date,
            total_amount,
            status,
            created_at,
            listing_id,
            listings!inner(
              id,
              title
            ),
            profiles!bookings_renter_id_fkey(
              id,
              full_name,
              avatar_url,
              email,
              phone_number
            )
          `)
          .in('listing_id', listingIds)
          .order('created_at', { ascending: false });

        if (bookingsError) {
          console.error('Error fetching bookings:', bookingsError);
        } else {
          itemBookingsData = bookingsRaw || [];
        }
      }

      // Transform listings data
      const transformedListings: Listing[] = (listingsData || []).map(listing => {
        // Calculate earnings for this listing
        const listingBookings = itemBookingsData.filter(booking => booking.listing_id === listing.id);
        const completedBookings = listingBookings.filter(booking => booking.status === 'completed');
        const totalEarnings = completedBookings.reduce((sum, booking) => sum + (booking.total_amount || 0), 0);

        // Check if listing is currently rented
        const currentDate = new Date();
        const activeBookings = listingBookings.filter(booking => {
          if (booking.listing_id !== listing.id) return false;
          if (booking.status !== 'in_progress' && booking.status !== 'confirmed') return false;
          
          const startDate = new Date(booking.start_date);
          const endDate = new Date(booking.end_date);
          return currentDate >= startDate && currentDate <= endDate;
        });

        // Determine status
        let status: 'active' | 'paused' | 'draft' | 'pending_approval' | 'rejected' | 'rented';
        if (listing.approval_status === 'pending') {
          status = 'pending_approval';
        } else if (listing.approval_status === 'rejected') {
          status = 'rejected';
        } else if (activeBookings.length > 0) {
          status = 'rented';
        } else if (listing.approval_status === 'approved') {
          status = listing.is_active ? 'active' : 'paused';
        } else {
          status = 'draft';
        }

        // Determine availability
        const now = new Date();
        const availableFrom = listing.available_from ? new Date(listing.available_from) : null;
        const availableTo = listing.available_to ? new Date(listing.available_to) : null;
        const availability = (!availableFrom || availableFrom <= now) && (!availableTo || availableTo >= now);

        return {
          id: listing.id,
          title: listing.title,
          description: listing.description,
          price_per_day: Number(listing.price_per_day),
          category: listing.category,
          images: listing.images || [],
          status,
          created_at: listing.created_at,
          view_count: listing.view_count || 0,
          total_bookings: listing.booking_count || 0,
          total_earnings: totalEarnings,
          availability,
          rating: Number(listing.rating) || 0,
          review_count: listing.review_count || 0
        };
      });

      // Transform bookings data
      const transformedBookings: ItemBooking[] = (itemBookingsData || []).map(booking => ({
        id: booking.id,
        start_date: booking.start_date,
        end_date: booking.end_date,
        total_amount: Number(booking.total_amount),
        status: booking.status as any,
        created_at: booking.created_at,
        listing_id: booking.listing_id,
        listing_title: booking.listings?.title || 'Unknown Item',
        renter: {
          id: booking.profiles?.id || '',
          full_name: booking.profiles?.full_name || 'Unknown User',
          avatar_url: booking.profiles?.avatar_url,
          email: booking.profiles?.email || '',
          phone: booking.profiles?.phone_number
        }
      }));

      setListings(transformedListings);
      setItemBookings(transformedBookings);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load listings data');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return colors.semantic.success;
      case 'paused': return colors.semantic.warning;
      case 'draft': return colors.gray[500];
      case 'pending_approval': return colors.semantic.warning;
      case 'rejected': return colors.semantic.error;
      case 'rented': return colors.primary.main;
      default: return colors.gray[500];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return 'checkmark-circle';
      case 'pending_approval': return 'time';
      case 'paused': return 'pause-circle';
      case 'rented': return 'people';
      case 'rejected': return 'close-circle';
      default: return 'alert-circle';
    }
  };

  const toggleListingStatus = async (listingId: string, currentStatus: string) => {
    if (currentStatus === 'pending_approval' || currentStatus === 'rejected' || currentStatus === 'rented') {
      Alert.alert(
        'Cannot Change Status',
        currentStatus === 'rented' 
          ? 'Cannot change status while item is currently being rented'
          : 'Cannot change status while listing is pending approval or rejected'
      );
      return;
    }

    setUpdatingListings(prev => new Set(prev).add(listingId));
    
    try {
      const newIsActive = currentStatus !== 'active';
      
      const { error } = await supabase
        .from('listings')
        .update({ is_active: newIsActive })
        .eq('id', listingId);

      if (error) {
        console.error('Error updating listing status:', error);
        Alert.alert('Error', 'Failed to update listing status');
        return;
      }

      // Update local state
      setListings(prev => prev.map(listing => 
        listing.id === listingId 
          ? { ...listing, status: newIsActive ? 'active' : 'paused' as any }
          : listing
      ));

      Alert.alert('Success', newIsActive ? 'Listing activated' : 'Listing paused');
    } catch (error) {
      console.error('Error updating listing status:', error);
      Alert.alert('Error', 'Failed to update listing status');
    } finally {
      setUpdatingListings(prev => {
        const newSet = new Set(prev);
        newSet.delete(listingId);
        return newSet;
      });
    }
  };

  const deleteListing = async (listingId: string, listingTitle: string) => {
    Alert.alert(
      'Delete Listing',
      `Are you sure you want to delete "${listingTitle}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setUpdatingListings(prev => new Set(prev).add(listingId));
            
            try {
              const { error } = await supabase
                .from('listings')
                .delete()
                .eq('id', listingId);

              if (error) {
                console.error('Error deleting listing:', error);
                Alert.alert('Error', 'Failed to delete listing');
                return;
              }

              setListings(prev => prev.filter(listing => listing.id !== listingId));
              Alert.alert('Success', 'Listing deleted successfully');
            } catch (error) {
              console.error('Error deleting listing:', error);
              Alert.alert('Error', 'Failed to delete listing');
            } finally {
              setUpdatingListings(prev => {
                const newSet = new Set(prev);
                newSet.delete(listingId);
                return newSet;
              });
            }
          }
        }
      ]
    );
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      setItemBookings(prev => prev.map(booking => 
        booking.id === bookingId ? { ...booking, status: newStatus as any } : booking
      ));

      Alert.alert('Success', `Booking ${newStatus === 'payment_required' ? 'accepted' : newStatus}!`);
    } catch (error) {
      console.error('Failed to update booking status:', error);
      Alert.alert('Error', 'Failed to update booking status');
    }
  };

  const totalEarnings = listings.reduce((sum, listing) => sum + listing.total_earnings, 0);
  const totalBookings = listings.reduce((sum, listing) => sum + listing.total_bookings, 0);
  
  const ratingsWithReviews = listings.filter(listing => listing.review_count > 0);
  const averageRating = ratingsWithReviews.length > 0 
    ? ratingsWithReviews.reduce((sum, listing) => sum + listing.rating, 0) / ratingsWithReviews.length
    : 0;

  const renderTabButton = (tab: 'items' | 'bookings' | 'earnings', label: string, count?: number) => (
    <TouchableOpacity
      onPress={() => setActiveTab(tab)}
      style={{
        flex: 1,
        paddingVertical: spacing.sm,
        borderBottomWidth: 2,
        borderBottomColor: activeTab === tab ? colors.primary.main : 'transparent',
        alignItems: 'center',
      }}
    >
      <Text style={{
        fontSize: typography.sizes.sm,
        fontWeight: activeTab === tab ? typography.weights.semibold : typography.weights.medium,
        color: activeTab === tab ? colors.primary.main : colors.text.secondary,
      }}>
        {label}
        {count !== undefined && (
          <Text style={{ color: colors.text.secondary }}> ({count})</Text>
        )}
      </Text>
    </TouchableOpacity>
  );

  const renderListingCard = ({ item }: { item: Listing }) => (
    <View style={{
      backgroundColor: colors.white,
      borderRadius: 12,
      padding: spacing.md,
      marginBottom: spacing.md,
      shadowColor: colors.black,
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    }}>
      <View style={{ flexDirection: 'row', marginBottom: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: typography.sizes.lg,
            fontWeight: typography.weights.semibold,
            color: colors.text.primary,
            marginBottom: spacing.xs,
          }} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={{
            fontSize: typography.sizes.base,
            color: colors.text.secondary,
            marginBottom: spacing.sm,
          }} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{
            fontSize: typography.sizes.lg,
            fontWeight: typography.weights.bold,
            color: colors.primary.main,
          }}>
            {formatPrice(item.price_per_day)}/day
          </Text>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: spacing.xs,
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs / 2,
            backgroundColor: getStatusColor(item.status) + '20',
            borderRadius: 12,
          }}>
            <Ionicons 
              name={getStatusIcon(item.status) as any} 
              size={12} 
              color={getStatusColor(item.status)} 
            />
            <Text style={{
              fontSize: typography.sizes.xs,
              color: getStatusColor(item.status),
              marginLeft: spacing.xs / 2,
              fontWeight: typography.weights.medium,
            }}>
              {item.status === 'pending_approval' ? 'Pending Approval' : 
               item.status === 'rented' ? 'Currently Rented' : 
               item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: 'row', marginBottom: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: typography.sizes.sm, color: colors.text.secondary }}>
            {item.view_count} views • {item.total_bookings} bookings
          </Text>
          <Text style={{ fontSize: typography.sizes.sm, color: colors.text.secondary }}>
            {formatPrice(item.total_earnings)} earned
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        <TouchableOpacity
          onPress={() => router.push(`/listing/${item.id}`)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            backgroundColor: colors.gray[100],
            borderRadius: 8,
          }}
        >
          <Ionicons name="eye-outline" size={16} color={colors.text.secondary} />
          <Text style={{ fontSize: typography.sizes.sm, color: colors.text.secondary, marginLeft: spacing.xs / 2 }}>
            View
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push(`/listing/create?edit=${item.id}`)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            backgroundColor: colors.gray[100],
            borderRadius: 8,
          }}
        >
          <Ionicons name="create-outline" size={16} color={colors.text.secondary} />
          <Text style={{ fontSize: typography.sizes.sm, color: colors.text.secondary, marginLeft: spacing.xs / 2 }}>
            Edit
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => toggleListingStatus(item.id, item.status)}
          disabled={updatingListings.has(item.id) || item.status === 'pending_approval' || item.status === 'rejected' || item.status === 'rented'}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            backgroundColor: updatingListings.has(item.id) ? colors.gray[200] : colors.gray[100],
            borderRadius: 8,
            opacity: (item.status === 'pending_approval' || item.status === 'rejected' || item.status === 'rented') ? 0.5 : 1,
          }}
        >
          <Ionicons 
            name={item.status === 'active' ? 'pause-outline' : 'play-outline'} 
            size={16} 
            color={colors.text.secondary} 
          />
          <Text style={{ fontSize: typography.sizes.sm, color: colors.text.secondary, marginLeft: spacing.xs / 2 }}>
            {item.status === 'active' ? 'Pause' : 'Activate'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => deleteListing(item.id, item.title)}
          disabled={updatingListings.has(item.id)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            backgroundColor: updatingListings.has(item.id) ? colors.gray[200] : colors.semantic.error + '20',
            borderRadius: 8,
          }}
        >
          <Ionicons name="trash-outline" size={16} color={colors.semantic.error} />
          <Text style={{ fontSize: typography.sizes.sm, color: colors.semantic.error, marginLeft: spacing.xs / 2 }}>
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderBookingCard = ({ item }: { item: ItemBooking }) => (
    <View style={{
      backgroundColor: colors.white,
      borderRadius: 12,
      padding: spacing.md,
      marginBottom: spacing.md,
      shadowColor: colors.black,
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    }}>
      <View style={{ flexDirection: 'row', marginBottom: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: typography.sizes.lg,
            fontWeight: typography.weights.semibold,
            color: colors.text.primary,
            marginBottom: spacing.xs,
          }}>
            {item.listing_title}
          </Text>
          <Text style={{
            fontSize: typography.sizes.sm,
            color: colors.text.secondary,
            marginBottom: spacing.xs,
          }}>
            From: {item.renter.full_name}
          </Text>
          <Text style={{
            fontSize: typography.sizes.sm,
            color: colors.text.secondary,
          }}>
            {formatDate(item.start_date)} - {formatDate(item.end_date)}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{
            fontSize: typography.sizes.lg,
            fontWeight: typography.weights.bold,
            color: colors.primary.main,
          }}>
            {formatPrice(item.total_amount)}
          </Text>
          <View style={{
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs / 2,
            backgroundColor: colors.gray[100],
            borderRadius: 12,
            marginTop: spacing.xs,
          }}>
            <Text style={{
              fontSize: typography.sizes.xs,
              color: colors.text.secondary,
              fontWeight: typography.weights.medium,
            }}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('_', ' ')}
            </Text>
          </View>
        </View>
      </View>

      {item.status === 'pending' && (
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <TouchableOpacity
            onPress={() => updateBookingStatus(item.id, 'payment_required')}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: spacing.sm,
              backgroundColor: colors.semantic.success,
              borderRadius: 8,
            }}
          >
            <Ionicons name="checkmark-circle" size={16} color={colors.white} />
            <Text style={{ fontSize: typography.sizes.sm, color: colors.white, marginLeft: spacing.xs / 2, fontWeight: typography.weights.semibold }}>
              Accept
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => updateBookingStatus(item.id, 'cancelled')}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: spacing.sm,
              backgroundColor: colors.semantic.error,
              borderRadius: 8,
            }}
          >
            <Ionicons name="close-circle" size={16} color={colors.white} />
            <Text style={{ fontSize: typography.sizes.sm, color: colors.white, marginLeft: spacing.xs / 2, fontWeight: typography.weights.semibold }}>
              Decline
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderStatsCard = (title: string, value: string | number, icon: string, color: string) => (
    <View style={{
      backgroundColor: colors.white,
      borderRadius: 16,
      padding: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: colors.black,
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
      marginBottom: spacing.sm,
    }}>
      <View style={{
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: color + '15',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
      }}>
        <Ionicons name={icon as any} size={28} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: typography.sizes['3xl'],
          fontWeight: typography.weights.bold,
          color: colors.text.primary,
          marginBottom: spacing.xs / 2,
        }}>
          {value}
        </Text>
        <Text style={{
          fontSize: typography.sizes.base,
          color: colors.text.secondary,
          fontWeight: typography.weights.medium,
        }}>
          {title}
        </Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.neutral.lightGray }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={{ marginTop: spacing.md, color: colors.text.secondary }}>
            Loading your listings...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.neutral.lightGray }}>
      <Header 
        title="My Listings" 
        showBackButton={false}
        showNotificationIcon={true}
      />
      
      {/* Add Item Button */}
      <View style={{
        backgroundColor: colors.white,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[200],
      }}>
        <TouchableOpacity
          onPress={() => router.push('/listing/create')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            backgroundColor: colors.primary.main,
            borderRadius: 8,
          }}
        >
          <Ionicons name="add" size={20} color={colors.white} />
          <Text style={{
            fontSize: typography.sizes.sm,
            color: colors.white,
            marginLeft: spacing.xs / 2,
            fontWeight: typography.weights.semibold,
          }}>
            Add Item
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={{
        backgroundColor: colors.white,
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[200],
      }}>
        {renderTabButton('items', 'My Items', listings.length)}
        {renderTabButton('bookings', 'Bookings', itemBookings.length)}
        {renderTabButton('earnings', 'Earnings')}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'items' && (
          <View style={{ padding: spacing.md }}>
            {listings.length === 0 ? (
              <View style={{
                backgroundColor: colors.white,
                borderRadius: 12,
                padding: spacing['2xl'],
                alignItems: 'center',
                marginTop: spacing.xl,
              }}>
                <Ionicons name="cube-outline" size={48} color={colors.gray[400]} />
                <Text style={{
                  fontSize: typography.sizes.lg,
                  fontWeight: typography.weights.semibold,
                  color: colors.text.primary,
                  marginTop: spacing.md,
                  marginBottom: spacing.sm,
                }}>
                  No listings yet
                </Text>
                <Text style={{
                  fontSize: typography.sizes.sm,
                  color: colors.text.secondary,
                  textAlign: 'center',
                  marginBottom: spacing.lg,
                }}>
                  Start earning by listing your first item!
                </Text>
                <TouchableOpacity
                  onPress={() => router.push('/listing/create')}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: spacing.lg,
                    paddingVertical: spacing.md,
                    backgroundColor: colors.primary.main,
                    borderRadius: 8,
                  }}
                >
                  <Ionicons name="add" size={20} color={colors.white} />
                  <Text style={{
                    fontSize: typography.sizes.base,
                    color: colors.white,
                    marginLeft: spacing.sm,
                    fontWeight: typography.weights.semibold,
                  }}>
                    List Your First Item
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={listings}
                keyExtractor={(item) => item.id}
                renderItem={renderListingCard}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
              />
            )}
          </View>
        )}

        {activeTab === 'bookings' && (
          <View style={{ padding: spacing.md }}>
            {itemBookings.length === 0 ? (
              <View style={{
                backgroundColor: colors.white,
                borderRadius: 12,
                padding: spacing['2xl'],
                alignItems: 'center',
                marginTop: spacing.xl,
              }}>
                <Ionicons name="calendar-outline" size={48} color={colors.gray[400]} />
                <Text style={{
                  fontSize: typography.sizes.lg,
                  fontWeight: typography.weights.semibold,
                  color: colors.text.primary,
                  marginTop: spacing.md,
                  marginBottom: spacing.sm,
                }}>
                  No bookings yet
                </Text>
                <Text style={{
                  fontSize: typography.sizes.sm,
                  color: colors.text.secondary,
                  textAlign: 'center',
                }}>
                  Bookings for your items will appear here.
                </Text>
              </View>
            ) : (
              <FlatList
                data={itemBookings}
                keyExtractor={(item) => item.id}
                renderItem={renderBookingCard}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
              />
            )}
          </View>
        )}

        {activeTab === 'earnings' && (
          <View style={{ padding: spacing.md }}>
            {/* Stats Cards - Single Column Layout */}
            <View style={{
              gap: spacing.sm,
              marginBottom: spacing.xl,
            }}>
              {renderStatsCard('Total Items', listings.length, 'cube-outline', colors.primary.main)}
              {renderStatsCard('Total Bookings', totalBookings, 'calendar-outline', colors.semantic.success)}
              {renderStatsCard('Total Earnings', formatPrice(totalEarnings), 'cash-outline', colors.semantic.warning)}
              {renderStatsCard('Avg Rating', averageRating > 0 ? averageRating.toFixed(1) : 'N/A', 'star-outline', colors.semantic.info)}
            </View>

            {/* Top Performing Items */}
            <View style={{
              backgroundColor: colors.white,
              borderRadius: 16,
              padding: spacing.lg,
              shadowColor: colors.black,
              shadowOpacity: 0.08,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
              elevation: 3,
            }}>
              <Text style={{
                fontSize: typography.sizes.xl,
                fontWeight: typography.weights.semibold,
                color: colors.text.primary,
                marginBottom: spacing.lg,
              }}>
                Top Performing Items
              </Text>
              {listings.length === 0 ? (
                <View style={{ 
                  alignItems: 'center', 
                  paddingVertical: spacing.xl,
                  paddingHorizontal: spacing.md,
                }}>
                  <View style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: colors.gray[100],
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: spacing.md,
                  }}>
                    <Ionicons name="cube-outline" size={32} color={colors.gray[400]} />
                  </View>
                  <Text style={{
                    fontSize: typography.sizes.lg,
                    fontWeight: typography.weights.semibold,
                    color: colors.text.primary,
                    marginBottom: spacing.sm,
                    textAlign: 'center',
                  }}>
                    No items yet
                  </Text>
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    color: colors.text.secondary,
                    textAlign: 'center',
                    lineHeight: typography.lineHeights.relaxed * typography.sizes.sm,
                  }}>
                    Start earning by listing your first item!
                  </Text>
                </View>
              ) : (
                <View>
                  {listings
                    .sort((a, b) => b.total_earnings - a.total_earnings)
                    .slice(0, 3)
                    .map((listing, index) => (
                      <View key={listing.id} style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingVertical: spacing.md,
                        borderBottomWidth: index < 2 ? 1 : 0,
                        borderBottomColor: colors.gray[100],
                      }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                          <View style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            backgroundColor: colors.primary.main,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: spacing.md,
                          }}>
                            <Text style={{
                              fontSize: typography.sizes.base,
                              fontWeight: typography.weights.bold,
                              color: colors.white,
                            }}>
                              {index + 1}
                            </Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{
                              fontSize: typography.sizes.base,
                              fontWeight: typography.weights.semibold,
                              color: colors.text.primary,
                              marginBottom: spacing.xs / 2,
                            }} numberOfLines={1}>
                              {listing.title}
                            </Text>
                            <Text style={{
                              fontSize: typography.sizes.sm,
                              color: colors.text.secondary,
                            }}>
                              {listing.total_bookings} bookings
                            </Text>
                          </View>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={{
                            fontSize: typography.sizes.base,
                            fontWeight: typography.weights.bold,
                            color: colors.text.primary,
                            marginBottom: spacing.xs / 2,
                          }}>
                            {formatPrice(listing.total_earnings)}
                          </Text>
                          <Text style={{
                            fontSize: typography.sizes.sm,
                            color: colors.text.secondary,
                          }}>
                            {formatPrice(listing.price_per_day)}/day
                          </Text>
                        </View>
                      </View>
                    ))}
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
