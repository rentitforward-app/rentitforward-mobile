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

// Categories
const CATEGORIES = [
  { id: 'all', name: 'All', icon: '🔍' },
  { id: 'tools_diy', name: 'Tools & DIY', icon: '🔧' },
  { id: 'electronics', name: 'Electronics', icon: '📱' },
  { id: 'cameras', name: 'Cameras', icon: '📷' },
  { id: 'sports_outdoors', name: 'Sports & Outdoors', icon: '🏃' },
  { id: 'event_party', name: 'Event & Party', icon: '🎉' },
  { id: 'instruments', name: 'Instruments', icon: '🎸' },
  { id: 'automotive', name: 'Automotive', icon: '🚗' },
  { id: 'home_garden', name: 'Home & Garden', icon: '🏡' },
  { id: 'appliances', name: 'Appliances', icon: '🏠' },
  { id: 'other', name: 'Other', icon: '📦' },
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
          <ActivityIndicator size="large" color="#44D62C" />
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
            <Ionicons name="refresh" size={24} color="#44D62C" />
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
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#343C3E',
  },
  refreshButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    color: '#343C3E',
  },
  categoryScroll: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  categoryChipActive: {
    backgroundColor: '#44D62C',
    borderColor: '#44D62C',
  },
  categoryChipIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryChipText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  resultsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  resultsText: {
    fontSize: 14,
    color: '#6B7280',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  listingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    width: '48%',
    elevation: 2,
    shadowColor: '#000',
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
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  priceBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#44D62C',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  listingInfo: {
    padding: 12,
  },
  listingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#343C3E',
    marginBottom: 8,
    lineHeight: 20,
  },
  categoryContainer: {
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#6B7280',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
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
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  ownerName: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#343C3E',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#44D62C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 