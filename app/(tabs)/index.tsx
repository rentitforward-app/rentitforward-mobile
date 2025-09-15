import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, ScrollView, FlatList, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../src/lib/design-system';
import { RealAPIPredictiveSearchInput } from '../../src/components/search/RealAPIPredictiveSearchInput';
import { useUIStore } from '../../src/stores/ui';
import { useAuth } from '../../src/components/AuthProvider';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';

const logo = require('../../assets/images/RentitForwardMainLogo.png');

// Categories (updated to match web version with all 12 categories)
const CATEGORIES = [
  { id: 'tools_diy_equipment', name: 'Tools & DIY Equipment', icon: '🔧' },
  { id: 'cameras_photography_gear', name: 'Cameras & Photography Gear', icon: '📷' },
  { id: 'event_party_equipment', name: 'Event & Party Equipment', icon: '🎉' },
  { id: 'camping_outdoor_gear', name: 'Camping & Outdoor Gear', icon: '🏕️' },
  { id: 'tech_electronics', name: 'Tech & Electronics', icon: '📱' },
  { id: 'vehicles_transport', name: 'Vehicles & Transport', icon: '🚗' },
  { id: 'home_garden_appliances', name: 'Home & Garden Appliances', icon: '🏡' },
  { id: 'sports_fitness_equipment', name: 'Sports & Fitness Equipment', icon: '🏃' },
  { id: 'musical_instruments_gear', name: 'Musical Instruments & Gear', icon: '🎸' },
  { id: 'costumes_props', name: 'Costumes & Props', icon: '🎭' },
  { id: 'maker_craft_supplies', name: 'Maker & Craft Supplies', icon: '✂️' },
  { id: 'clothing_shoes_accessories', name: 'Clothing, Shoes and Accessories', icon: '👕' },
];

export default function HomeScreen() {
  const [search, setSearch] = useState('');
  const notifications = useUIStore(state => state.notifications);
  const notificationCount = notifications.length;
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  // Top rentals state
  const [topRentals, setTopRentals] = useState<any[]>([]);
  const [loadingRentals, setLoadingRentals] = useState(true);

  useEffect(() => {
    const fetchTopRentals = async () => {
      setLoadingRentals(true);
      try {
        const { data, error } = await supabase
          .from('listings')
          .select(`
            id,
            title,
            price_per_day,
            price_weekly,
            price_hourly,
            category,
            city,
            state,
            delivery_available,
            pickup_available,
            is_active,
            approval_status,
            created_at,
            images,
            profiles:owner_id (
              id,
              full_name,
              avatar_url,
              rating
            )
          `)
          .eq('is_active', true)
          .eq('approval_status', 'approved')
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          console.error('Error fetching top rentals:', error);
          return;
        }

        // Transform the data to match our component structure
        const transformedData = data?.map((listing: any) => ({
          id: listing.id,
          title: listing.title,
          price_per_day: listing.price_per_day,
          price_weekly: listing.price_weekly,
          price_hourly: listing.price_hourly,
          category: listing.category,
          city: listing.city,
          state: listing.state,
          delivery_available: listing.delivery_available || false,
          pickup_available: listing.pickup_available || false,
          created_at: listing.created_at,
          images: listing.images || [],
          owner: {
            name: listing.profiles?.full_name || 'Unknown Owner',
            avatar: listing.profiles?.avatar_url,
            rating: listing.profiles?.rating
          },
        })) || [];

        setTopRentals(transformedData);
      } catch (error) {
        console.error('Error fetching top rentals:', error);
      } finally {
        setLoadingRentals(false);
      }
    };

    fetchTopRentals();
  }, []);

  // Greeting logic
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  // Handlers
  const handleNotificationPress = () => {
    router.push('/notifications');
  };
  const handleMenuPress = () => {
    // If you implement a drawer, replace this with openDrawer()
    router.push('/profile');
  };
  const handleCategoryPress = (categoryId: string) => {
    router.push(`/browse?category=${categoryId}`);
  };
  const handleRentalPress = (listingId: string) => {
    router.push(`/listing/${listingId}`);
  };

  // Mobile Listing Card Component
  const ListingCard = ({ item }: { item: any }) => {
    const mainImage = item.images && item.images.length > 0 ? item.images[0] : null;
    const rating = item.owner?.rating ? parseFloat(item.owner.rating) : 0;
    
    return (
      <TouchableOpacity 
        onPress={() => handleRentalPress(item.id)} 
        style={{ 
          width: 200, 
          marginRight: spacing.md, 
          backgroundColor: colors.white, 
          borderRadius: 12, 
          overflow: 'hidden', 
          shadowColor: colors.black, 
          shadowOpacity: 0.08, 
          shadowRadius: 8, 
          elevation: 3 
        }}
      >
        {/* Image Container */}
        <View style={{ position: 'relative', width: '100%', height: 150 }}>
          {mainImage ? (
            <Image 
              source={{ uri: mainImage }} 
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <View style={{ 
              width: '100%', 
              height: '100%', 
              backgroundColor: colors.gray[200], 
              justifyContent: 'center', 
              alignItems: 'center' 
            }}>
              <Ionicons name="image-outline" size={32} color={colors.gray[400]} />
            </View>
          )}
          
          {/* Price Badge */}
          <View style={{ 
            position: 'absolute', 
            top: 8, 
            right: 8, 
            backgroundColor: colors.primary.main, 
            paddingHorizontal: 8, 
            paddingVertical: 4, 
            borderRadius: 12 
          }}>
            <Text style={{ color: colors.white, fontSize: 12, fontWeight: '600' }}>
              ${item.price_per_day}/day
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={{ padding: spacing.sm }}>
          {/* Title */}
          <Text style={{ 
            fontSize: 14, 
            fontWeight: '600', 
            color: colors.text.primary, 
            marginBottom: 4,
            lineHeight: 18
          }} numberOfLines={2}>
            {item.title}
          </Text>

          {/* Rating and Location */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            {/* Rating Stars */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8 }}>
              <Ionicons name="star" size={12} color={colors.semantic.warning} />
              <Text style={{ fontSize: 12, color: colors.text.secondary, marginLeft: 2 }}>
                {rating > 0 ? rating.toFixed(1) : 'New'}
              </Text>
            </View>
            
            {/* Location */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="location-outline" size={12} color={colors.text.secondary} />
              <Text style={{ fontSize: 12, color: colors.text.secondary, marginLeft: 2 }}>
                {item.city}, {item.state}
              </Text>
            </View>
          </View>

          {/* Delivery Methods */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            {item.delivery_available && (
              <View style={{ 
                backgroundColor: colors.semantic.success + '20', 
                paddingHorizontal: 6, 
                paddingVertical: 2, 
                borderRadius: 8, 
                marginRight: 4 
              }}>
                <Text style={{ fontSize: 10, color: colors.semantic.success, fontWeight: '500' }}>
                  Delivery
                </Text>
              </View>
            )}
            {item.pickup_available && (
              <View style={{ 
                backgroundColor: colors.primary.main + '20', 
                paddingHorizontal: 6, 
                paddingVertical: 2, 
                borderRadius: 8 
              }}>
                <Text style={{ fontSize: 10, color: colors.primary.main, fontWeight: '500' }}>
                  Pickup
                </Text>
              </View>
            )}
          </View>

          {/* Owner Info */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {item.owner?.avatar ? (
              <Image 
                source={{ uri: item.owner.avatar }} 
                style={{ width: 16, height: 16, borderRadius: 8, marginRight: 6 }}
              />
            ) : (
              <View style={{ 
                width: 16, 
                height: 16, 
                borderRadius: 8, 
                backgroundColor: colors.gray[300], 
                marginRight: 6,
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Ionicons name="person" size={10} color={colors.gray[500]} />
              </View>
            )}
            <Text style={{ fontSize: 11, color: colors.text.secondary }}>
              {item.owner?.name || 'Unknown Owner'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.neutral.lightGray }} edges={['top']}>
      <View style={{ backgroundColor: colors.white }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: spacing.xs, // Reduced left padding for logo
            paddingRight: spacing.md, // Keep right padding for notification
            paddingTop: spacing.md,
            paddingBottom: spacing.md,
            backgroundColor: colors.white,
          }}
        >
          {/* Logo - left aligned */}
          <Image 
            source={logo} 
            style={{ 
              width: 170, 
              height: 44, 
              resizeMode: 'contain',
            }} 
          />
          
          {/* Notification Icon */}
          <TouchableOpacity
            onPress={handleNotificationPress}
            style={{ 
              width: 44,
              height: 44,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 22,
            }}
            accessibilityLabel="Notifications"
            accessibilityRole="button"
          >
            <Ionicons name="notifications-outline" size={24} color={colors.text.primary} />
            {notificationCount > 0 && (
              <View 
                style={{ 
                  position: 'absolute', 
                  top: 8, 
                  right: 8, 
                  backgroundColor: colors.semantic.error, 
                  borderRadius: 8, 
                  width: 16, 
                  height: 16, 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}
              >
                <Text 
                  style={{ 
                    color: colors.white, 
                    fontSize: 10, 
                    fontWeight: typography.weights.bold 
                  }}
                >
                  {notificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Top Banner with Search */}
        <View
          style={{
            backgroundColor: colors.primary.main,
            paddingHorizontal: spacing.md,
            paddingTop: spacing.xl,
            paddingBottom: spacing['2xl'],
            // Remove border radius for flat bottom
          }}
        >
          <Text
            style={{
              fontSize: typography.sizes.base,
              color: colors.white,
              opacity: 0.95,
              marginBottom: spacing.xs,
              fontWeight: typography.weights.medium,
            }}
          >
            Good afternoon, {displayName}
          </Text>
          <Text
            style={{
              fontSize: typography.sizes['2xl'],
              fontWeight: typography.weights.bold,
              color: colors.white,
              marginBottom: spacing.lg,
            }}
          >
            Share More, Buy Less
          </Text>
          <RealAPIPredictiveSearchInput
            placeholder="Search for items, e.g. camera, drill..."
            value={search}
            onChangeText={setSearch}
            onSearch={(query) => {
              setSearch(query);
              router.push(`/(tabs)/browse?search=${encodeURIComponent(query)}`);
            }}
            useRealAPI={true}
            style={{
              shadowColor: colors.black,
              shadowOpacity: 0.06,
              shadowRadius: 4,
              elevation: 2,
            }}
          />
        </View>

        {/* Top Rental Items Section */}
        <View style={{ marginTop: spacing.xl }}>
          <Text style={{ fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.text.primary, marginLeft: spacing.md, marginBottom: spacing.md }}>
            Top Rental Items
          </Text>
          {loadingRentals ? (
            <ActivityIndicator size="small" color={colors.primary.main} style={{ marginLeft: spacing.md }} />
          ) : (
            <FlatList
              data={topRentals}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: spacing.md }}
              renderItem={({ item }) => (
                <ListingCard item={item} />
              )}
            />
          )}
        </View>

        {/* Browse Categories Section - Updated to match web version */}
        <View style={{ 
          marginTop: spacing.xl, 
          marginBottom: spacing.xl, 
          paddingHorizontal: spacing.md 
        }}>
          <Text style={{ 
            fontSize: typography.sizes.lg, 
            fontWeight: typography.weights.semibold, 
            color: colors.text.primary, 
            marginBottom: spacing.md
          }}>
            Browse Categories
          </Text>
          
          {/* Categories Grid - 2 columns with proper spacing */}
          <View style={{ 
            flexDirection: 'row', 
            flexWrap: 'wrap', 
            justifyContent: 'space-between'
          }}>
            {CATEGORIES.map(category => (
              <TouchableOpacity 
                key={category.id} 
                onPress={() => handleCategoryPress(category.id)} 
                style={{ 
                  width: '48%', 
                  backgroundColor: colors.white, 
                  borderRadius: 12, 
                  alignItems: 'center', 
                  paddingVertical: spacing.lg, 
                  marginBottom: spacing.md,
                  shadowColor: colors.black, 
                  shadowOpacity: 0.03, 
                  shadowRadius: 2, 
                  elevation: 1
                }}
                activeOpacity={0.7}
              >
                <Text style={{ 
                  fontSize: 32, 
                  marginBottom: spacing.sm,
                  textAlign: 'center'
                }}>
                  {category.icon}
                </Text>
                <Text style={{ 
                  fontSize: typography.sizes.sm, 
                  fontWeight: typography.weights.medium, 
                  color: colors.text.primary, 
                  textAlign: 'center'
                }}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 