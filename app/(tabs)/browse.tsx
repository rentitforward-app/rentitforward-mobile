import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  FlatList,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../src/lib/supabase';
import Sentry from '../../src/lib/sentry';
import { colors, spacing, typography, componentStyles } from '../../src/lib/design-system';

// Categories
const CATEGORIES = [
  { id: 'all', name: 'All', icon: '🔍' },
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

export default function BrowseScreen() {
  const [listings, setListings] = useState<any[]>([]);
  const [filteredListings, setFilteredListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadListings();
  }, []);

  useEffect(() => {
    filterListings();
  }, [listings, searchQuery, selectedCategory]);

  const loadListings = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          profiles:owner_id (
            full_name,
            avatar_url,
            rating
          ),
          listing_photos (
            url,
            order_index
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setListings(data || []);
    } catch (error) {
      console.error('Error loading listings:', error);
      Alert.alert('Error', 'Failed to load listings');
    } finally {
      setIsLoading(false);
    }
  };

  const filterListings = () => {
    let filtered = [...listings];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((listing: any) => 
        listing.title?.toLowerCase().includes(query) ||
        listing.description?.toLowerCase().includes(query) ||
        listing.category?.toLowerCase().includes(query) ||
        listing.brand?.toLowerCase().includes(query) ||
        listing.model?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((listing: any) => listing.category === selectedCategory);
    }

    // Sort by newest
    filtered.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setFilteredListings(filtered);
  };

  const getMainImage = (listing: any) => {
    if (listing.listing_photos && listing.listing_photos.length > 0) {
      const sortedPhotos = listing.listing_photos.sort((a: any, b: any) => a.order_index - b.order_index);
      return sortedPhotos[0].url;
    }
    return null;
  };

  const renderListingCard = ({ item }: { item: any }) => {
    const mainImage = getMainImage(item);
    
    return (
      <TouchableOpacity style={styles.listingCard} activeOpacity={0.8}>
        <View style={styles.imageContainer}>
          {mainImage ? (
            <Image source={{ uri: mainImage }} style={styles.listingImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="image" size={32} color="#6B7280" />
            </View>
          )}
          
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>
              ${Math.floor(parseFloat(item.price_per_day || 0))}/day
            </Text>
          </View>
        </View>

        <View style={styles.listingInfo}>
          <Text style={styles.listingTitle} numberOfLines={2}>
            {item.title || 'Untitled'}
          </Text>
          
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryText}>
              {CATEGORIES.find(c => c.id === item.category)?.icon || '📦'} {' '}
              {CATEGORIES.find(c => c.id === item.category)?.name || item.category}
            </Text>
          </View>

          <View style={styles.locationContainer}>
            <Ionicons name="location" size={14} color="#6B7280" />
            <Text style={styles.locationText}>
              {item.city}, {item.state}
            </Text>
          </View>

          <View style={styles.ownerContainer}>
            <View style={styles.ownerInfo}>
              {item.profiles?.avatar_url ? (
                <Image source={{ uri: item.profiles.avatar_url }} style={styles.ownerAvatar} />
              ) : (
                <View style={styles.ownerAvatarPlaceholder}>
                  <Ionicons name="person" size={16} color="#6B7280" />
                </View>
              )}
              <Text style={styles.ownerName}>
                {item.profiles?.full_name || 'Unknown'}
              </Text>
            </View>
            
            {item.profiles?.rating && item.profiles.rating > 0 && (
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.ratingText}>
                  {parseFloat(item.profiles.rating).toFixed(1)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategoryFilter = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
      {CATEGORIES.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryChip,
            selectedCategory === category.id && styles.categoryChipActive
          ]}
          onPress={() => setSelectedCategory(category.id)}
        >
          <Text style={styles.categoryChipIcon}>{category.icon}</Text>
          <Text style={[
            styles.categoryChipText,
            selectedCategory === category.id && styles.categoryChipTextActive
          ]}>
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // Add this test function (remove after testing)
  const testSentryError = () => {
    Sentry.captureException(new Error("Test Sentry error from mobile app - Rent It Forward"));
    console.log("Test error sent to Sentry!");
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading listings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Browse Items</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {__DEV__ && (
            <TouchableOpacity 
              style={[styles.refreshButton, { backgroundColor: '#FF6B6B' }]} 
              onPress={testSentryError}
            >
              <Text style={{ color: 'white', fontSize: 12 }}>Test</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.refreshButton} onPress={loadListings}>
            <Ionicons name="refresh" size={24} color={colors.primary.main} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search for items..."
            placeholderTextColor="#6B7280"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filter */}
      {renderCategoryFilter()}

      {/* Results Summary */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredListings.length} {filteredListings.length === 1 ? 'item' : 'items'} found
        </Text>
      </View>

      {/* Listings Grid */}
      {filteredListings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={48} color="#E5E5E5" />
          <Text style={styles.emptyTitle}>No items found</Text>
          <Text style={styles.emptyText}>
            {searchQuery ? `No results for "${searchQuery}"` : 'No listings available yet'}
          </Text>
          <TouchableOpacity style={styles.createButton} onPress={loadListings}>
            <Text style={styles.createButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredListings}
          renderItem={renderListingCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          onRefresh={loadListings}
          refreshing={isLoading}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.lightGray,
  },
  headerTitle: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  refreshButton: {
    padding: spacing.xs,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.lightGray,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.base,
    marginLeft: spacing.sm,
    color: colors.text.primary,
  },
  categoryScroll: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.lightGray,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral.mediumGray,
  },
  categoryChipActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  categoryChipIcon: {
    fontSize: typography.sizes.base,
    marginRight: 6,
  },
  categoryChipText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  categoryChipTextActive: {
    color: colors.white,
  },
  resultsContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  resultsText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  listContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  row: {
    justifyContent: 'space-between',
  },
  listingCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: spacing.md,
    width: '48%',
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    position: 'relative',
  },
  listingImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: 120,
    backgroundColor: colors.neutral.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  priceBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.primary.main,
    borderRadius: 6,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs / 2,
  },
  priceText: {
    color: colors.white,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  listingInfo: {
    padding: spacing.sm,
  },
  listingTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  categoryContainer: {
    marginBottom: spacing.xs,
  },
  categoryText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  locationText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginLeft: spacing.xs / 2,
  },
  ownerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ownerAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  ownerAvatarPlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.neutral.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  ownerName: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginLeft: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  createButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  createButtonText: {
    color: colors.white,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
}); 