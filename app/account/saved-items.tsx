import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../src/components/AuthProvider';
import { supabase } from '../../src/lib/supabase';
import { colors, spacing, typography } from '../../src/lib/design-system';
import { Header } from '../../src/components/Header';

interface SavedItem {
  listing_id: string;
  user_id: string;
  created_at: string;
  listings: {
    id: string;
    title: string;
    description: string;
    price_per_day: number;
    images: string[];
    category: string;
    is_active: boolean;
    owner_id: string;
    city: string;
    state: string;
    profiles: {
      full_name: string;
      avatar_url: string | null;
    };
  };
}

export default function SavedItemsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch saved items
  const { data: savedItems, isLoading } = useQuery({
    queryKey: ['savedItems', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('favorites')
        .select(`
          listing_id,
          user_id,
          created_at,
          listings (
            id,
            title,
            description,
            price_per_day,
            images,
            category,
            is_active,
            owner_id,
            city,
            state,
            profiles!listings_owner_id_fkey (
              full_name,
              avatar_url
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Filter out inactive listings and extract the listings data
      const activeListings = (data || [])
        .filter(fav => fav.listings && fav.listings.is_active)
        .map(fav => ({
          ...fav,
          listings: {
            ...fav.listings,
            profiles: Array.isArray(fav.listings.profiles) ? fav.listings.profiles[0] : fav.listings.profiles
          }
        }));
      
      return activeListings as SavedItem[];
    },
    enabled: !!user?.id,
  });

  // Remove saved item mutation
  const removeSavedItemMutation = useMutation({
    mutationFn: async (listingId: string) => {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user?.id)
        .eq('listing_id', listingId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedItems', user?.id] });
      Alert.alert('Success', 'Item removed from saved items');
    },
    onError: (error) => {
      console.error('Error removing saved item:', error);
      Alert.alert('Error', 'Failed to remove item from saved items');
    },
  });

  const handleRemoveSavedItem = (listingId: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your saved items?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => removeSavedItemMutation.mutate(listingId)
        },
      ]
    );
  };

  const handleItemPress = (listingId: string) => {
    router.push(`/listing/${listingId}`);
  };

  const renderSavedItem = ({ item }: { item: SavedItem }) => (
    <TouchableOpacity
      onPress={() => handleItemPress(item.listings.id)}
      style={{
        backgroundColor: colors.white,
        borderRadius: 12,
        marginBottom: spacing.md,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
      }}
    >
      <View style={{ flexDirection: 'row' }}>
        {/* Image */}
        <View style={{ width: 120, height: 120 }}>
          {item.listings.images && item.listings.images.length > 0 ? (
            <Image
              source={{ uri: item.listings.images[0] }}
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: colors.gray[200],
              }}
              resizeMode="cover"
            />
          ) : (
            <View style={{
              width: '100%',
              height: '100%',
              backgroundColor: colors.gray[200],
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Ionicons name="image-outline" size={32} color={colors.gray[400]} />
            </View>
          )}
        </View>

        {/* Content */}
        <View style={{ flex: 1, padding: spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1, marginRight: spacing.sm }}>
              <Text style={{
                fontSize: typography.sizes.base,
                fontWeight: typography.weights.semibold,
                color: colors.gray[900],
                marginBottom: spacing.xs / 2,
              }} numberOfLines={2}>
                {item.listings.title}
              </Text>
              
              <Text style={{
                fontSize: typography.sizes.sm,
                color: colors.gray[600],
                marginBottom: spacing.xs,
              }} numberOfLines={2}>
                {item.listings.description}
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
                <Ionicons name="location-outline" size={14} color={colors.gray[500]} />
                <Text style={{
                  fontSize: typography.sizes.xs,
                  color: colors.gray[500],
                  marginLeft: spacing.xs / 2,
                }}>
                  {item.listings.city}, {item.listings.state}
                </Text>
              </View>

              <Text style={{
                fontSize: typography.sizes.lg,
                fontWeight: typography.weights.bold,
                color: colors.primary.main,
              }}>
                ${item.listings.price_per_day}/day
              </Text>
            </View>

            {/* Remove button */}
            <TouchableOpacity
              onPress={() => handleRemoveSavedItem(item.listings.id)}
              style={{
                padding: spacing.sm,
                borderRadius: 20,
                backgroundColor: colors.gray[100],
              }}
            >
              <Ionicons name="heart" size={20} color={colors.primary.main} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
    }}>
      <Ionicons name="heart-outline" size={64} color={colors.gray[300]} />
      <Text style={{
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.semibold,
        color: colors.gray[600],
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
        textAlign: 'center',
      }}>
        No Saved Items Yet
      </Text>
      <Text style={{
        fontSize: typography.sizes.base,
        color: colors.gray[500],
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: spacing.xl,
      }}>
        Start exploring and save items you love by tapping the heart icon on any listing.
      </Text>
      <TouchableOpacity
        onPress={() => router.push('/(tabs)/browse')}
        style={{
          backgroundColor: colors.primary.main,
          paddingHorizontal: spacing.xl,
          paddingVertical: spacing.md,
          borderRadius: 8,
        }}
      >
        <Text style={{
          color: colors.white,
          fontSize: typography.sizes.base,
          fontWeight: typography.weights.semibold,
        }}>
          Browse Items
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[{ flex: 1, backgroundColor: colors.gray[50] }, { paddingTop: insets.top }]}>
      <Header 
        title="Saved Items" 
        showBackButton 
        onBackPress={() => router.back()} 
      />

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: typography.sizes.base, color: colors.gray[600] }}>
            Loading saved items...
          </Text>
        </View>
      ) : savedItems && savedItems.length > 0 ? (
        <FlatList
          data={savedItems}
          renderItem={renderSavedItem}
          keyExtractor={(item) => item.listing_id}
          contentContainerStyle={{ padding: spacing.lg }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        renderEmptyState()
      )}
    </View>
  );
}
