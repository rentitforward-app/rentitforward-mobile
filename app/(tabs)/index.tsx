import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, ScrollView, FlatList, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../src/lib/design-system';
import { useUIStore } from '../../src/stores/ui';
import { useAuth } from '../../src/components/AuthProvider';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';

const logo = require('../../assets/images/RentitForwardMainLogo.png');

// Categories (updated to match new category structure)
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
      const { data, error } = await supabase
        .from('listings')
        .select(`*, profiles:owner_id (full_name, avatar_url, rating), listing_photos (url, order_index)`)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5);
      if (!error && data) {
        setTopRentals(data);
      }
      setLoadingRentals(false);
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
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.white,
              borderRadius: 999,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              shadowColor: colors.black,
              shadowOpacity: 0.06,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Ionicons name="search" size={22} color={colors.gray[400]} style={{ marginRight: spacing.sm }} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search for items, e.g. camera, drill..."
              placeholderTextColor={colors.gray[400]}
              style={{
                flex: 1,
                fontSize: typography.sizes.base,
                color: colors.text.primary,
                paddingVertical: 0,
              }}
              returnKeyType="search"
            />
          </View>
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
              renderItem={({ item }) => {
                // Get main image
                let mainImage = null;
                if (item.listing_photos && item.listing_photos.length > 0) {
                  const sortedPhotos = item.listing_photos.sort((a: any, b: any) => a.order_index - b.order_index);
                  mainImage = sortedPhotos[0].url;
                }
                return (
                  <TouchableOpacity onPress={() => handleRentalPress(item.id)} style={{ width: 180, marginRight: spacing.md, backgroundColor: colors.white, borderRadius: 12, overflow: 'hidden', shadowColor: colors.black, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}>
                    {mainImage ? (
                      <Image source={{ uri: mainImage }} style={{ width: '100%', height: 110, resizeMode: 'cover' }} />
                    ) : (
                      <View style={{ width: '100%', height: 110, backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="image" size={32} color={colors.gray[400]} />
                      </View>
                    )}
                    <View style={{ padding: spacing.sm }}>
                      <Text style={{ fontSize: typography.sizes.base, fontWeight: typography.weights.semibold, color: colors.text.primary }} numberOfLines={1}>{item.title || 'Untitled'}</Text>
                      <Text style={{ fontSize: typography.sizes.sm, color: colors.text.secondary, marginTop: 2 }}>${item.price_per_day}/day</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <Ionicons name="star" size={14} color={colors.semantic.warning} />
                        <Text style={{ fontSize: typography.sizes.sm, color: colors.text.secondary, marginLeft: 4 }}>{item.profiles?.rating ? parseFloat(item.profiles.rating).toFixed(1) : '—'}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>

        {/* Categories Section */}
        <View style={{ marginTop: spacing.xl, marginBottom: spacing.md, paddingHorizontal: spacing.md }}>
          <Text style={{ fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.text.primary, marginBottom: spacing.md }}>
            Browse Categories
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {CATEGORIES.slice(0, 8).map(category => (
              <TouchableOpacity key={category.id} onPress={() => handleCategoryPress(category.id)} style={{ width: '48%', backgroundColor: colors.white, borderRadius: 12, alignItems: 'center', paddingVertical: spacing.lg, marginBottom: spacing.md, shadowColor: colors.black, shadowOpacity: 0.03, shadowRadius: 2, elevation: 1 }}>
                <Text style={{ fontSize: 32, marginBottom: spacing.sm }}>{category.icon}</Text>
                <Text style={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, color: colors.text.primary, textAlign: 'center' }}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 