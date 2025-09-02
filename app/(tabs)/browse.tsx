import React, { useState, useEffect, useRef } from 'react';
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
  ActivityIndicator,
  Modal,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import { supabase } from '../../src/lib/supabase';
import Sentry from '../../src/lib/sentry';
import { colors, spacing, typography, componentStyles } from '../../src/lib/design-system';
import { RealAPIPredictiveSearchInput } from '../../src/components/search/RealAPIPredictiveSearchInput';

// Categories - matching web version
const CATEGORIES = [
  { id: 'all', name: 'All', icon: '🔍', dbValue: 'all' },
  { id: 'tools_diy_equipment', name: 'Tools & DIY Equipment', icon: '🔧', dbValue: 'tools_diy_equipment' },
  { id: 'cameras_photography_gear', name: 'Cameras & Photography Gear', icon: '📷', dbValue: 'cameras_photography_gear' },
  { id: 'event_party_equipment', name: 'Event & Party Equipment', icon: '🎉', dbValue: 'event_party_equipment' },
  { id: 'camping_outdoor_gear', name: 'Camping & Outdoor Gear', icon: '🏕️', dbValue: 'camping_outdoor_gear' },
  { id: 'tech_electronics', name: 'Tech & Electronics', icon: '📱', dbValue: 'tech_electronics' },
  { id: 'vehicles_transport', name: 'Vehicles & Transport', icon: '🚗', dbValue: 'vehicles_transport' },
  { id: 'home_garden_appliances', name: 'Home & Garden Appliances', icon: '🏡', dbValue: 'home_garden_appliances' },
  { id: 'sports_fitness_equipment', name: 'Sports & Fitness Equipment', icon: '🏃', dbValue: 'sports_fitness_equipment' },
  { id: 'musical_instruments_gear', name: 'Musical Instruments & Gear', icon: '🎸', dbValue: 'musical_instruments_gear' },
  { id: 'costumes_props', name: 'Costumes & Props', icon: '🎭', dbValue: 'costumes_props' },
  { id: 'maker_craft_supplies', name: 'Maker & Craft Supplies', icon: '✂️', dbValue: 'maker_craft_supplies' },
  { id: 'clothing_shoes_accessories', name: 'Clothing, Shoes and Accessories', icon: '👕', dbValue: 'clothing_shoes_accessories' },
];

// Sort options - matching web version
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'distance', label: 'Distance' },
];

export default function BrowseScreen() {
  const { search, category } = useLocalSearchParams<{ search?: string; category?: string }>();
  const [listings, setListings] = useState<any[]>([]);
  const [filteredListings, setFilteredListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(search || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(category ? [category] : []);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  
  // Location filter states
  const [locationSearchTerm, setLocationSearchTerm] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  const [distanceLimit, setDistanceLimit] = useState(50); // Default 50km
  const locationSearchTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadListings();
  }, []);

  // Handle URL parameters
  useEffect(() => {
    if (search) {
      setSearchQuery(search);
    }
    if (category) {
      setSelectedCategories([category]);
    }
  }, [search, category]);

  useEffect(() => {
    filterListings();
  }, [listings, searchQuery, selectedCategories, priceRange, sortBy, selectedLocation]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (locationSearchTimeout.current) {
        clearTimeout(locationSearchTimeout.current);
      }
    };
  }, []);

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
    if (selectedCategories.length > 0 && !selectedCategories.includes('all')) {
      filtered = filtered.filter((listing: any) => 
        selectedCategories.some(cat => {
          const category = CATEGORIES.find(c => c.id === cat);
          return category && listing.category === category.dbValue;
        })
      );
    }

    // Filter by price range
    if (priceRange.min) {
      filtered = filtered.filter((listing: any) => 
        listing.price_per_day >= parseFloat(priceRange.min)
      );
    }

    if (priceRange.max) {
      filtered = filtered.filter((listing: any) => 
        listing.price_per_day <= parseFloat(priceRange.max)
      );
    }

    // Filter by location - use distance if coordinates available, otherwise text matching
    if (selectedLocation) {
      if (selectedLocation.lat && selectedLocation.lng) {
        // Distance-based filtering when coordinates are available
        filtered = filtered.filter((listing: any) => {
          if (listing.lat && listing.lng) {
            const distance = calculateDistance(
              selectedLocation.lat,
              selectedLocation.lng,
              listing.lat,
              listing.lng
            );
            
            // Add distance to listing for display
            listing.distanceFromSelected = distance;
            
            // Only show listings within the configured distance limit
            return distance <= distanceLimit;
          }
          
          // Fallback to text matching for listings without coordinates
          const locationQuery = selectedLocation.address.toLowerCase();
          const listingCity = listing.city?.toLowerCase() || '';
          const listingState = listing.state?.toLowerCase() || '';
          const listingAddress = listing.address?.toLowerCase() || '';
          
          // Extract just the city name from the location query (e.g., "Lambton, NSW" -> "lambton")
          const queryParts = locationQuery.split(',');
          const mainLocation = queryParts[0].trim();
          
          return listingCity.includes(mainLocation) || 
                 listingState.includes(mainLocation) ||
                 listingAddress.includes(mainLocation) ||
                 listingCity.includes(locationQuery) || 
                 listingState.includes(locationQuery) ||
                 listingAddress.includes(locationQuery);
        });
        
        // Sort by distance when location is selected and coordinates available
        if (sortBy === 'distance') {
          filtered.sort((a: any, b: any) => {
            if (a.distanceFromSelected !== undefined && b.distanceFromSelected !== undefined) {
              return a.distanceFromSelected - b.distanceFromSelected;
            }
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          });
        }
      } else {
        // Text-based filtering when no coordinates
        const locationQuery = selectedLocation.address.toLowerCase();
        filtered = filtered.filter((listing: any) => {
          const listingCity = listing.city?.toLowerCase() || '';
          const listingState = listing.state?.toLowerCase() || '';
          const listingAddress = listing.address?.toLowerCase() || '';
          
          // Extract just the city name from the location query (e.g., "Lambton, NSW" -> "lambton")
          const queryParts = locationQuery.split(',');
          const mainLocation = queryParts[0].trim();
          
          return listingCity.includes(mainLocation) || 
                 listingState.includes(mainLocation) ||
                 listingAddress.includes(mainLocation) ||
                 listingCity.includes(locationQuery) || 
                 listingState.includes(locationQuery) ||
                 listingAddress.includes(locationQuery);
        });
      }
    }

    // Apply sorting
    switch (sortBy) {
      case 'price_low':
        filtered.sort((a: any, b: any) => a.price_per_day - b.price_per_day);
        break;
      case 'price_high':
        filtered.sort((a: any, b: any) => b.price_per_day - a.price_per_day);
        break;
      case 'popular':
        // Sort by review count if available, otherwise by created date
        filtered.sort((a: any, b: any) => {
          const aRating = a.profiles?.rating || 0;
          const bRating = b.profiles?.rating || 0;
          if (aRating !== bRating) {
            return bRating - aRating;
          }
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        break;
      case 'distance':
        // Sort by distance if available, otherwise by newest
        if (selectedLocation && selectedLocation.lat && selectedLocation.lng) {
          filtered.sort((a: any, b: any) => {
            if (a.distanceFromSelected !== undefined && b.distanceFromSelected !== undefined) {
              return a.distanceFromSelected - b.distanceFromSelected;
            }
            return new Date(b.created_at).getTime() - new Date(b.created_at).getTime();
          });
        } else {
    filtered.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }
        break;
      case 'newest':
      default:
        filtered.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    setFilteredListings(filtered);
  };

  const getMainImage = (listing: any) => {
    if (listing.images && Array.isArray(listing.images) && listing.images.length > 0) {
      return listing.images[0];
    }
    return null;
  };

  const renderListingCard = ({ item }: { item: any }) => {
    if (!item) return null;
    
    const mainImage = getMainImage(item);
    const category = CATEGORIES.find(c => c.dbValue === item.category);
    const categoryIcon = category?.icon || '📦';
    const categoryName = category?.name || item.category || 'Other';
    const price = Math.floor(parseFloat(item.price_per_day || 0));
    const ownerName = item.profiles?.full_name || 'Unknown';
    const rating = item.profiles?.rating ? parseFloat(item.profiles.rating) : null;
    
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
              ${price}/day
            </Text>
          </View>
        </View>

        <View style={styles.listingInfo}>
          <Text style={styles.listingTitle} numberOfLines={2}>
            {item.title || 'Untitled'}
          </Text>
          
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryText}>
              {categoryIcon} {categoryName}
            </Text>
          </View>

          <View style={styles.locationContainer}>
            <Ionicons name="location" size={14} color="#6B7280" />
            <Text style={styles.locationText}>
              {item.city || 'Unknown'}, {item.state || 'Unknown'}
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
                {ownerName}
              </Text>
            </View>
            
            {rating && rating > 0 && (
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.ratingText}>
                  {rating.toFixed(1)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setPriceRange({ min: '', max: '' });
    setSortBy('newest');
    setLocationSearchTerm('');
    setSelectedLocation(null);
    setDistanceLimit(50); // Reset to default 50km
  };

  // Location search functions with debouncing (like web version)
  const handleLocationSearch = (text: string) => {
    setLocationSearchTerm(text);
    
    // Clear existing timeout
    if (locationSearchTimeout.current) {
      clearTimeout(locationSearchTimeout.current);
    }
    
    if (text.length > 2) {
      // Debounce the search to reduce API calls
      locationSearchTimeout.current = setTimeout(() => {
        getLocationSuggestions(text);
      }, 300); // 300ms delay like web version
    } else {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
      setIsSearchingLocation(false);
    }
  };

  const getLocationSuggestions = async (input: string) => {
    console.log('🔍 Getting location suggestions for:', input);
    setIsSearchingLocation(true);
    
    try {
      // First try Google Places API for comprehensive results
      console.log('🌐 Trying Google Places API...');
      const googleSuggestions = await getGooglePlacesSuggestions(input);
      console.log('🌐 Google Places API results:', googleSuggestions.length, 'suggestions');
      
      if (googleSuggestions.length > 0) {
        console.log('✅ Using Google Places suggestions:', googleSuggestions);
        setLocationSuggestions(googleSuggestions);
        setShowLocationSuggestions(true);
        console.log('✅ State set - showLocationSuggestions: true, suggestions count:', googleSuggestions.length);
      } else {
        // Fallback to local database if Google API fails
        console.log('📍 Falling back to local database...');
        const localSuggestions = getAustralianLocationSuggestions(input);
        console.log('📍 Local database results:', localSuggestions.length, 'suggestions');
        setLocationSuggestions(localSuggestions);
        setShowLocationSuggestions(localSuggestions.length > 0);
        console.log('📍 State set - showLocationSuggestions:', localSuggestions.length > 0, 'suggestions count:', localSuggestions.length);
      }
    } catch (error) {
      console.error('Location search failed:', error);
      // Fallback to local database on error
      console.log('📍 Error fallback to local database...');
      const localSuggestions = getAustralianLocationSuggestions(input);
      console.log('📍 Local database fallback results:', localSuggestions.length, 'suggestions');
      setLocationSuggestions(localSuggestions);
      setShowLocationSuggestions(localSuggestions.length > 0);
      console.log('📍 Error fallback state set - showLocationSuggestions:', localSuggestions.length > 0, 'suggestions count:', localSuggestions.length);
    }
    
    setIsSearchingLocation(false);
  };

  // Google Places API for comprehensive location search
  const getGooglePlacesSuggestions = async (input: string): Promise<any[]> => {
    try {
      // Use Google Places API Text Search
      const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || 
        (Platform.OS === 'ios' 
          ? process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY_IOS 
          : process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY_ANDROID);
      
      if (!GOOGLE_PLACES_API_KEY) {
        console.warn('Google Places API key not found. Using local database fallback.');
        return [];
      }
      
      console.log('🔑 Using Google Places API key:', GOOGLE_PLACES_API_KEY ? 'Key found' : 'No key');
      
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&components=country:au&types=(cities)&key=${GOOGLE_PLACES_API_KEY}`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Google Places API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('🌐 Google Places API response:', data);
      
      if (data.status === 'OK' && data.predictions && data.predictions.length > 0) {
        const suggestions = data.predictions.slice(0, 5).map((prediction: any, index: number) => ({
          place_id: prediction.place_id,
          description: prediction.description,
          // We'll need to get coordinates separately for Google Places results
          lat: null,
          lng: null,
          isGooglePlace: true,
        }));
        console.log('🌐 Google Places suggestions:', suggestions);
        return suggestions;
      }
      
      console.log('🌐 Google Places API status:', data.status, 'predictions:', data.predictions?.length || 0);
      return [];
    } catch (error) {
      console.error('Google Places API failed:', error);
      return [];
    }
  };

  // Comprehensive Australian location suggestions database
  const getAustralianLocationSuggestions = (input: string) => {
    const australianLocations = [
      // Major cities
      { name: 'Sydney, NSW', lat: -33.8688, lng: 151.2093 },
      { name: 'Melbourne, VIC', lat: -37.8136, lng: 144.9631 },
      { name: 'Brisbane, QLD', lat: -27.4698, lng: 153.0251 },
      { name: 'Perth, WA', lat: -31.9505, lng: 115.8605 },
      { name: 'Adelaide, SA', lat: -34.9285, lng: 138.6007 },
      { name: 'Gold Coast, QLD', lat: -28.0167, lng: 153.4000 },
      { name: 'Newcastle, NSW', lat: -32.9283, lng: 151.7817 },
      { name: 'Canberra, ACT', lat: -35.2809, lng: 149.1300 },
      { name: 'Maitland, NSW', lat: -32.7333, lng: 151.5500 },
      { name: 'Mackay, QLD', lat: -21.1431, lng: 149.1831 },
      { name: 'Maroochydore, QLD', lat: -26.6581, lng: 153.0931 },
      { name: 'Sunshine Coast, QLD', lat: -26.6500, lng: 153.0667 },
      { name: 'Wollongong, NSW', lat: -34.4278, lng: 150.8931 },
      { name: 'Hobart, TAS', lat: -42.8821, lng: 147.3272 },
      { name: 'Geelong, VIC', lat: -38.1499, lng: 144.3617 },
      { name: 'Townsville, QLD', lat: -19.2590, lng: 146.8169 },
      { name: 'Cairns, QLD', lat: -16.9186, lng: 145.7781 },
      { name: 'Darwin, NT', lat: -12.4634, lng: 130.8456 },
      
      // Sydney suburbs (expanded)
      { name: 'Bondi, NSW', lat: -33.8915, lng: 151.2767 },
      { name: 'Manly, NSW', lat: -33.7969, lng: 151.2840 },
      { name: 'Parramatta, NSW', lat: -33.8150, lng: 151.0000 },
      { name: 'Lambton, NSW', lat: -32.9167, lng: 151.7167 },
      { name: 'Mayfield, NSW', lat: -32.8967, lng: 151.7333 },
      { name: 'Mayfield East, NSW', lat: -32.8900, lng: 151.7400 },
      { name: 'Mayfield West, NSW', lat: -32.9000, lng: 151.7200 },
      { name: 'Chatswood, NSW', lat: -33.7969, lng: 151.1816 },
      { name: 'Bondi Junction, NSW', lat: -33.8947, lng: 151.2477 },
      { name: 'Surry Hills, NSW', lat: -33.8886, lng: 151.2094 },
      { name: 'Paddington, NSW', lat: -33.8847, lng: 151.2303 },
      { name: 'Newtown, NSW', lat: -33.8978, lng: 151.1794 },
      { name: 'Darlinghurst, NSW', lat: -33.8794, lng: 151.2178 },
      { name: 'Kings Cross, NSW', lat: -33.8737, lng: 151.2222 },
      { name: 'Double Bay, NSW', lat: -33.8774, lng: 151.2444 },
      { name: 'Mosman, NSW', lat: -33.8286, lng: 151.2442 },
      { name: 'Neutral Bay, NSW', lat: -33.8347, lng: 151.2194 },
      { name: 'North Sydney, NSW', lat: -33.8403, lng: 151.2067 },
      { name: 'Pyrmont, NSW', lat: -33.8697, lng: 151.1958 },
      { name: 'Ultimo, NSW', lat: -33.8797, lng: 151.1986 },
      { name: 'Glebe, NSW', lat: -33.8814, lng: 151.1831 },
      { name: 'Leichhardt, NSW', lat: -33.8831, lng: 151.1564 },
      { name: 'Balmain, NSW', lat: -33.8597, lng: 151.1797 },
      { name: 'Rozelle, NSW', lat: -33.8631, lng: 151.1714 },
      { name: 'Woollahra, NSW', lat: -33.8864, lng: 151.2414 },
      { name: 'Randwick, NSW', lat: -33.9147, lng: 151.2419 },
      { name: 'Coogee, NSW', lat: -33.9206, lng: 151.2544 },
      { name: 'Maroubra, NSW', lat: -33.9406, lng: 151.2439 },
      { name: 'Cronulla, NSW', lat: -34.0544, lng: 151.1544 },
      { name: 'Hurstville, NSW', lat: -33.9681, lng: 151.1031 },
      { name: 'Bankstown, NSW', lat: -33.9181, lng: 151.0331 },
      { name: 'Liverpool, NSW', lat: -33.9231, lng: 150.9231 },
      { name: 'Penrith, NSW', lat: -33.7506, lng: 150.6939 },
      { name: 'Blacktown, NSW', lat: -33.7681, lng: 150.9056 },
      { name: 'Hornsby, NSW', lat: -33.7031, lng: 151.0981 },
      { name: 'Dee Why, NSW', lat: -33.7531, lng: 151.2881 },
      { name: 'Brookvale, NSW', lat: -33.7681, lng: 151.2731 },
      { name: 'Avalon, NSW', lat: -33.6356, lng: 151.3231 },
      { name: 'Palm Beach, NSW', lat: -33.5981, lng: 151.3231 },
      
      // Melbourne suburbs (expanded)
      { name: 'St Kilda, VIC', lat: -37.8677, lng: 144.9778 },
      { name: 'Richmond, VIC', lat: -37.8197, lng: 144.9986 },
      { name: 'Fitzroy, VIC', lat: -37.7982, lng: 144.9784 },
      { name: 'South Yarra, VIC', lat: -37.8398, lng: 144.9942 },
      { name: 'Carlton, VIC', lat: -37.7987, lng: 144.9676 },
      { name: 'Prahran, VIC', lat: -37.8506, lng: 144.9956 },
      { name: 'Collingwood, VIC', lat: -37.8031, lng: 144.9881 },
      { name: 'Northcote, VIC', lat: -37.7681, lng: 144.9981 },
      { name: 'Thornbury, VIC', lat: -37.7581, lng: 145.0031 },
      { name: 'Preston, VIC', lat: -37.7431, lng: 145.0031 },
      { name: 'Brunswick, VIC', lat: -37.7681, lng: 144.9581 },
      { name: 'Coburg, VIC', lat: -37.7431, lng: 144.9631 },
      { name: 'Footscray, VIC', lat: -37.7981, lng: 144.9031 },
      { name: 'Williamstown, VIC', lat: -37.8631, lng: 144.8981 },
      { name: 'Brighton, VIC', lat: -37.9081, lng: 145.0031 },
      { name: 'Caulfield, VIC', lat: -37.8781, lng: 145.0231 },
      { name: 'Glen Waverley, VIC', lat: -37.8781, lng: 145.1631 },
      { name: 'Box Hill, VIC', lat: -37.8181, lng: 145.1231 },
      { name: 'Camberwell, VIC', lat: -37.8231, lng: 145.0581 },
      { name: 'Hawthorn, VIC', lat: -37.8181, lng: 145.0331 },
      { name: 'Kew, VIC', lat: -37.8031, lng: 145.0331 },
      { name: 'Toorak, VIC', lat: -37.8431, lng: 145.0181 },
      { name: 'Armadale, VIC', lat: -37.8531, lng: 145.0131 },
      { name: 'Malvern, VIC', lat: -37.8631, lng: 145.0281 },
      { name: 'Chapel Street, VIC', lat: -37.8531, lng: 144.9931 },
      { name: 'Doncaster, VIC', lat: -37.7881, lng: 145.1231 },
      { name: 'Ringwood, VIC', lat: -37.8131, lng: 145.2281 },
      { name: 'Frankston, VIC', lat: -38.1431, lng: 145.1231 },
      { name: 'Dandenong, VIC', lat: -37.9881, lng: 145.2131 },
      
      // Brisbane suburbs (expanded)
      { name: 'Fortitude Valley, QLD', lat: -27.4560, lng: 153.0348 },
      { name: 'South Bank, QLD', lat: -27.4748, lng: 153.0235 },
      { name: 'New Farm, QLD', lat: -27.4678, lng: 153.0515 },
      { name: 'West End, QLD', lat: -27.4848, lng: 153.0081 },
      { name: 'Paddington, QLD', lat: -27.4631, lng: 153.0131 },
      { name: 'Milton, QLD', lat: -27.4731, lng: 153.0031 },
      { name: 'Toowong, QLD', lat: -27.4831, lng: 152.9931 },
      { name: 'St Lucia, QLD', lat: -27.4981, lng: 153.0131 },
      { name: 'Indooroopilly, QLD', lat: -27.4981, lng: 152.9731 },
      { name: 'Woolloongabba, QLD', lat: -27.4881, lng: 153.0381 },
      { name: 'Kangaroo Point, QLD', lat: -27.4781, lng: 153.0381 },
      { name: 'Teneriffe, QLD', lat: -27.4631, lng: 153.0481 },
      { name: 'Bulimba, QLD', lat: -27.4581, lng: 153.0631 },
      { name: 'Hawthorne, QLD', lat: -27.4681, lng: 153.0631 },
      { name: 'Morningside, QLD', lat: -27.4681, lng: 153.0731 },
      { name: 'Camp Hill, QLD', lat: -27.4881, lng: 153.0731 },
      { name: 'Coorparoo, QLD', lat: -27.4981, lng: 153.0631 },
      { name: 'Greenslopes, QLD', lat: -27.5081, lng: 153.0531 },
      { name: 'Stones Corner, QLD', lat: -27.5081, lng: 153.0431 },
      { name: 'Annerley, QLD', lat: -27.5181, lng: 153.0331 },
      { name: 'Fairfield, QLD', lat: -27.5181, lng: 153.0131 },
      { name: 'Yeronga, QLD', lat: -27.5281, lng: 153.0131 },
      { name: 'Tarragindi, QLD', lat: -27.5381, lng: 153.0231 },
      { name: 'Holland Park, QLD', lat: -27.5181, lng: 153.0631 },
      { name: 'Mount Gravatt, QLD', lat: -27.5481, lng: 153.0831 },
      { name: 'Carindale, QLD', lat: -27.5181, lng: 153.1031 },
      { name: 'Chermside, QLD', lat: -27.3881, lng: 153.0331 },
      { name: 'Aspley, QLD', lat: -27.3681, lng: 153.0431 },
      { name: 'Sandgate, QLD', lat: -27.3181, lng: 153.0731 },
      { name: 'Redcliffe, QLD', lat: -27.2281, lng: 153.1031 },
      
      // Perth suburbs (expanded)
      { name: 'Fremantle, WA', lat: -32.0569, lng: 115.7439 },
      { name: 'Subiaco, WA', lat: -31.9474, lng: 115.8206 },
      { name: 'Cottesloe, WA', lat: -31.9959, lng: 115.7581 },
      { name: 'Leederville, WA', lat: -31.9381, lng: 115.8431 },
      { name: 'Mount Lawley, WA', lat: -31.9331, lng: 115.8731 },
      { name: 'Northbridge, WA', lat: -31.9481, lng: 115.8531 },
      { name: 'West Perth, WA', lat: -31.9531, lng: 115.8431 },
      { name: 'East Perth, WA', lat: -31.9581, lng: 115.8731 },
      { name: 'South Perth, WA', lat: -31.9731, lng: 115.8631 },
      { name: 'Victoria Park, WA', lat: -31.9731, lng: 115.8931 },
      { name: 'Belmont, WA', lat: -31.9531, lng: 115.9331 },
      { name: 'Claremont, WA', lat: -31.9831, lng: 115.7831 },
      { name: 'Nedlands, WA', lat: -31.9731, lng: 115.8031 },
      { name: 'Floreat, WA', lat: -31.9431, lng: 115.7931 },
      { name: 'Scarborough, WA', lat: -31.8931, lng: 115.7531 },
      { name: 'Hillarys, WA', lat: -31.8231, lng: 115.7431 },
      { name: 'Joondalup, WA', lat: -31.7431, lng: 115.7631 },
      { name: 'Morley, WA', lat: -31.8831, lng: 115.9031 },
      { name: 'Midland, WA', lat: -31.8931, lng: 116.0131 },
      { name: 'Armadale, WA', lat: -32.1431, lng: 116.0131 },
      { name: 'Rockingham, WA', lat: -32.2731, lng: 115.7231 },
      { name: 'Mandurah, WA', lat: -32.5231, lng: 115.7231 },
      
      // Adelaide suburbs (expanded)
      { name: 'North Adelaide, SA', lat: -34.9048, lng: 138.5947 },
      { name: 'Glenelg, SA', lat: -35.0081, lng: 138.5131 },
      { name: 'Unley, SA', lat: -34.9481, lng: 138.6031 },
      { name: 'Norwood, SA', lat: -34.9181, lng: 138.6331 },
      { name: 'Burnside, SA', lat: -34.9381, lng: 138.6431 },
      { name: 'Prospect, SA', lat: -34.8881, lng: 138.5931 },
      { name: 'Hindmarsh, SA', lat: -34.9081, lng: 138.5631 },
      { name: 'Thebarton, SA', lat: -34.9181, lng: 138.5731 },
      { name: 'West Torrens, SA', lat: -34.9281, lng: 138.5531 },
      { name: 'Marion, SA', lat: -35.0181, lng: 138.5431 },
      { name: 'Morphett Vale, SA', lat: -35.1281, lng: 138.5231 },
      { name: 'Brighton, SA', lat: -35.0181, lng: 138.5231 },
      { name: 'Henley Beach, SA', lat: -34.9181, lng: 138.4931 },
      { name: 'Port Adelaide, SA', lat: -34.8481, lng: 138.5031 },
      { name: 'Semaphore, SA', lat: -34.8381, lng: 138.4831 },
      { name: 'Modbury, SA', lat: -34.8381, lng: 138.6831 },
      { name: 'Elizabeth, SA', lat: -34.7181, lng: 138.6731 },
      { name: 'Salisbury, SA', lat: -34.7681, lng: 138.6431 },
      
      // Gold Coast suburbs
      { name: 'Surfers Paradise, QLD', lat: -28.0031, lng: 153.4281 },
      { name: 'Broadbeach, QLD', lat: -28.0331, lng: 153.4331 },
      { name: 'Main Beach, QLD', lat: -27.9731, lng: 153.4331 },
      { name: 'Southport, QLD', lat: -27.9631, lng: 153.4131 },
      { name: 'Robina, QLD', lat: -28.0731, lng: 153.3831 },
      { name: 'Burleigh Heads, QLD', lat: -28.0931, lng: 153.4531 },
      { name: 'Currumbin, QLD', lat: -28.1431, lng: 153.4831 },
      { name: 'Coolangatta, QLD', lat: -28.1681, lng: 153.5431 },
      { name: 'Tweed Heads, NSW', lat: -28.1731, lng: 153.5431 },
      
      // Sunshine Coast suburbs
      { name: 'Noosa, QLD', lat: -26.3881, lng: 153.0931 },
      { name: 'Maroochydore, QLD', lat: -26.6581, lng: 153.0931 },
      { name: 'Mooloolaba, QLD', lat: -26.6831, lng: 153.1181 },
      { name: 'Caloundra, QLD', lat: -26.7981, lng: 153.1331 },
      { name: 'Nambour, QLD', lat: -26.6281, lng: 152.9581 },
      
      // Other regional centers
      { name: 'Ballarat, VIC', lat: -37.5631, lng: 143.8431 },
      { name: 'Bendigo, VIC', lat: -36.7581, lng: 144.2831 },
      { name: 'Shepparton, VIC', lat: -36.3831, lng: 145.4031 },
      { name: 'Warrnambool, VIC', lat: -38.3831, lng: 142.4831 },
      { name: 'Toowoomba, QLD', lat: -27.5631, lng: 151.9531 },
      { name: 'Rockhampton, QLD', lat: -23.3781, lng: 150.5131 },
      { name: 'Mackay, QLD', lat: -21.1431, lng: 149.1831 },
      { name: 'Bundaberg, QLD', lat: -24.8631, lng: 152.3481 },
      { name: 'Hervey Bay, QLD', lat: -25.2881, lng: 152.8531 },
      { name: 'Maryborough, QLD', lat: -25.5431, lng: 152.7031 },
      { name: 'Gympie, QLD', lat: -26.1881, lng: 152.6631 },
      { name: 'Ipswich, QLD', lat: -27.6131, lng: 152.7631 },
      { name: 'Logan, QLD', lat: -27.6381, lng: 153.1081 },
      { name: 'Redland Bay, QLD', lat: -27.5681, lng: 153.2881 },
    ];

    const query = input.toLowerCase().trim();
    console.log('📍 Query after processing:', query);
    
    if (query.length === 0) {
      console.log('📍 Empty query, returning empty array');
      return [];
    }
    
    const filtered = australianLocations
      .filter(location => 
        location.name.toLowerCase().includes(query) ||
        location.name.toLowerCase().startsWith(query)
      );
    
    console.log('📍 Filtered locations:', filtered.length, 'matches');
    
    const sorted = filtered
      .sort((a, b) => {
        // Prioritize exact starts over contains
        const aStarts = a.name.toLowerCase().startsWith(query);
        const bStarts = b.name.toLowerCase().startsWith(query);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 5);
    
    const result = sorted.map((location, index) => ({
      place_id: `local_${index}`,
      description: location.name,
      lat: location.lat,
      lng: location.lng
    }));
    
    console.log('📍 Final local suggestions:', result);
    return result;
  };

  const selectLocationSuggestion = async (suggestion: any) => {
    setLocationSearchTerm(suggestion.description);
    setLocationSuggestions([]);
    setShowLocationSuggestions(false);
    
    try {
      let coordinates = { lat: suggestion.lat, lng: suggestion.lng };
      
      // If this is a Google Places result, we need to get coordinates
      if (suggestion.isGooglePlace && suggestion.place_id) {
        coordinates = await getPlaceCoordinates(suggestion.place_id);
      }
      
      if (coordinates && coordinates.lat && coordinates.lng) {
        setSelectedLocation({
          lat: coordinates.lat,
          lng: coordinates.lng,
          address: suggestion.description
        });
        
        // Auto-sort by distance when location is selected
        if (sortBy !== 'distance') {
          setSortBy('distance');
        }
      } else {
        // Fallback: set location without coordinates (won't affect distance sorting)
        setSelectedLocation({
          lat: 0,
          lng: 0,
          address: suggestion.description
        });
      }
    } catch (error) {
      console.error('Error getting place coordinates:', error);
      // Fallback: set location without coordinates
      setSelectedLocation({
        lat: 0,
        lng: 0,
        address: suggestion.description
      });
    }
  };

  // Get coordinates for a Google Place ID
  const getPlaceCoordinates = async (placeId: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || 
        (Platform.OS === 'ios' 
          ? process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY_IOS 
          : process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY_ANDROID);
      
      if (!GOOGLE_PLACES_API_KEY) {
        console.warn('Google Places API key not found.');
        return null;
      }
      
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${GOOGLE_PLACES_API_KEY}`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Google Places Details API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'OK' && data.result && data.result.geometry && data.result.geometry.location) {
        return {
          lat: data.result.geometry.location.lat,
          lng: data.result.geometry.location.lng
        };
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get place coordinates:', error);
      return null;
    }
  };

  const clearLocation = () => {
    setLocationSearchTerm('');
    setSelectedLocation(null);
    setLocationSuggestions([]);
    setShowLocationSuggestions(false);
  };

  // Get user's current location using Expo Location
  const getCurrentLocation = async () => {
    try {
      setIsSearchingLocation(true);

      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied', 
          'Location permission is required to use this feature. Please enable location access in your device settings.'
        );
        setIsSearchingLocation(false);
        return;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000,
      });

      const { latitude, longitude } = location.coords;
      
      // Get reverse geocoded address
      try {
        const address = await getReverseGeocodedAddress(latitude, longitude);
        const currentLocation = {
          lat: latitude,
          lng: longitude,
          address: address || `Your Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
        };
        
        setSelectedLocation(currentLocation);
        setLocationSearchTerm(currentLocation.address);
        setLocationSuggestions([]);
        setShowLocationSuggestions(false);
        
        // Auto-sort by distance when using current location
        if (sortBy !== 'distance') {
          setSortBy('distance');
        }
        
        Alert.alert('Success', 'Using your current location');
      } catch (addressError) {
        // Fallback if reverse geocoding fails
        const currentLocation = {
          lat: latitude,
          lng: longitude,
          address: `Your Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
        };
        
        setSelectedLocation(currentLocation);
        setLocationSearchTerm(currentLocation.address);
        setLocationSuggestions([]);
        setShowLocationSuggestions(false);
        
        if (sortBy !== 'distance') {
          setSortBy('distance');
        }
        
        Alert.alert('Success', 'Using your current location');
      }
      
    } catch (error) {
      console.error('Error getting location:', error);
      
      let errorMessage = 'Unable to get your location. Please try again.';
      
      if (error.code === 'E_LOCATION_SERVICES_DISABLED') {
        errorMessage = 'Location services are disabled. Please enable them in your device settings.';
      } else if (error.code === 'E_LOCATION_TIMEOUT') {
        errorMessage = 'Location request timed out. Please try again.';
      }
      
      Alert.alert('Location Error', errorMessage);
    } finally {
      setIsSearchingLocation(false);
    }
  };

  // Simple reverse geocoding using nearest city approximation
  const getReverseGeocodedAddress = async (lat: number, lng: number): Promise<string | null> => {
    try {
      // Find the nearest major Australian city
      const australianCities = [
        { name: 'Sydney, NSW', lat: -33.8688, lng: 151.2093 },
        { name: 'Melbourne, VIC', lat: -37.8136, lng: 144.9631 },
        { name: 'Brisbane, QLD', lat: -27.4698, lng: 153.0251 },
        { name: 'Perth, WA', lat: -31.9505, lng: 115.8605 },
        { name: 'Adelaide, SA', lat: -34.9285, lng: 138.6007 },
        { name: 'Gold Coast, QLD', lat: -28.0167, lng: 153.4000 },
        { name: 'Newcastle, NSW', lat: -32.9283, lng: 151.7817 },
        { name: 'Canberra, ACT', lat: -35.2809, lng: 149.1300 },
        { name: 'Sunshine Coast, QLD', lat: -26.6500, lng: 153.0667 },
        { name: 'Wollongong, NSW', lat: -34.4278, lng: 150.8931 },
        { name: 'Hobart, TAS', lat: -42.8821, lng: 147.3272 },
        { name: 'Geelong, VIC', lat: -38.1499, lng: 144.3617 },
        { name: 'Townsville, QLD', lat: -19.2590, lng: 146.8169 },
        { name: 'Cairns, QLD', lat: -16.9186, lng: 145.7781 },
        { name: 'Darwin, NT', lat: -12.4634, lng: 130.8456 },
      ];

      let nearestCity = australianCities[0];
      let minDistance = calculateDistance(lat, lng, nearestCity.lat, nearestCity.lng);

      for (const city of australianCities) {
        const distance = calculateDistance(lat, lng, city.lat, city.lng);
        if (distance < minDistance) {
          minDistance = distance;
          nearestCity = city;
        }
      }

      return `Near ${nearestCity.name}`;
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return null;
    }
  };

  // Simple distance calculation using Haversine formula
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const hasActiveFilters = () => {
    return searchQuery.trim() || 
           selectedCategories.length > 0 || 
           priceRange.min || 
           priceRange.max ||
           sortBy !== 'newest' ||
           selectedLocation !== null;
  };

  const renderFilterButton = () => (
    <TouchableOpacity
      style={[styles.filterButton, hasActiveFilters() && styles.filterButtonActive]}
      onPress={() => setShowFilters(!showFilters)}
    >
      <Ionicons name="filter" size={20} color={hasActiveFilters() ? colors.white : colors.text.primary} />
      <Text style={[styles.filterButtonText, hasActiveFilters() && styles.filterButtonTextActive]}>
        Filters
      </Text>
      {hasActiveFilters() && (
        <View style={styles.filterIndicator} />
      )}
    </TouchableOpacity>
  );

  const renderSortButton = () => (
          <TouchableOpacity
      style={styles.sortButton}
      onPress={() => setShowSortModal(true)}
    >
      <Ionicons name="swap-vertical" size={20} color={colors.text.primary} />
      <Text style={styles.sortButtonText}>
        {SORT_OPTIONS.find(option => option.value === sortBy)?.label || 'Sort'}
            </Text>
    </TouchableOpacity>
  );

  const renderCategoryButton = () => (
    <TouchableOpacity
      style={[styles.categoryButton, selectedCategories.length > 0 && styles.categoryButtonActive]}
      onPress={() => setShowCategoryModal(true)}
    >
      <Ionicons name="grid" size={20} color={selectedCategories.length > 0 ? colors.white : colors.text.primary} />
      <Text style={[styles.categoryButtonText, selectedCategories.length > 0 && styles.categoryButtonTextActive]}>
        {selectedCategories.length === 0 
          ? 'Categories' 
          : selectedCategories.length === 1 
            ? CATEGORIES.find(c => c.id === selectedCategories[0])?.name || 'Categories'
            : `${selectedCategories.length} Categories`
        }
            </Text>
          </TouchableOpacity>
  );

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
      </View>

      {/* Search Bar */}
        <View style={styles.searchContainer}>
          <RealAPIPredictiveSearchInput
            placeholder="Search for items, categories, brands..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSearch={(query) => {
              setSearchQuery(query);
            }}
            useRealAPI={true}
          />
        </View>

      {/* Filter Controls */}
      <View style={styles.filterControls}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterControlsContent}
        >
          {renderFilterButton()}
          {renderSortButton()}
          {renderCategoryButton()}
          
          {hasActiveFilters() && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearFilters}
            >
              <Ionicons name="close-circle" size={20} color={colors.semantic.error} />
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Filter Panel */}
      {showFilters && (
        <View style={styles.filterPanel}>
          {/* Location Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Location</Text>
            <View style={styles.locationInputContainer}>
              <View style={styles.locationInputWrapper}>
                <TouchableOpacity 
                  onPress={getCurrentLocation}
                  style={styles.locationButton}
                  disabled={isSearchingLocation}
                >
                  <Ionicons 
                    name="location" 
                    size={20} 
                    color={selectedLocation ? colors.primary.main : colors.text.secondary} 
                  />
                </TouchableOpacity>
                <TextInput
                  style={styles.locationInput}
                  placeholder="Search city or address..."
                  value={locationSearchTerm}
                  onChangeText={handleLocationSearch}
                />
                {locationSearchTerm.length > 0 && (
                  <TouchableOpacity onPress={clearLocation} style={styles.clearLocationButton}>
                    <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
                  </TouchableOpacity>
                )}
              </View>
              
              {/* Location Suggestions */}
              {showLocationSuggestions && locationSuggestions.length > 0 && (
                <View style={styles.locationSuggestions}>
                  {locationSuggestions.map((suggestion, index) => (
                    <TouchableOpacity
                      key={suggestion.place_id || index}
                      style={styles.locationSuggestionItem}
                      onPress={() => selectLocationSuggestion(suggestion)}
                    >
                      <Ionicons name="location" size={16} color={colors.text.secondary} />
                      <Text style={styles.locationSuggestionText} numberOfLines={1}>
                        {suggestion.description}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Distance Limit Filter */}
          {selectedLocation && (
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Search Radius</Text>
              <View style={styles.distanceLimitContainer}>
                <TouchableOpacity
                  style={[styles.distanceOption, distanceLimit === 25 && styles.distanceOptionActive]}
                  onPress={() => setDistanceLimit(25)}
                >
                  <Text style={[styles.distanceOptionText, distanceLimit === 25 && styles.distanceOptionTextActive]}>
                    25km
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.distanceOption, distanceLimit === 50 && styles.distanceOptionActive]}
                  onPress={() => setDistanceLimit(50)}
                >
                  <Text style={[styles.distanceOptionText, distanceLimit === 50 && styles.distanceOptionTextActive]}>
                    50km
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.distanceOption, distanceLimit === 100 && styles.distanceOptionActive]}
                  onPress={() => setDistanceLimit(100)}
                >
                  <Text style={[styles.distanceOptionText, distanceLimit === 100 && styles.distanceOptionTextActive]}>
                    100km
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Price Range Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Price Range (per day)</Text>
            <View style={styles.priceInputContainer}>
              <TextInput
                style={styles.priceInput}
                placeholder="Min"
                value={priceRange.min}
                onChangeText={(text) => setPriceRange(prev => ({ ...prev, min: text }))}
                keyboardType="numeric"
              />
              <Text style={styles.priceSeparator}>-</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="Max"
                value={priceRange.max}
                onChangeText={(text) => setPriceRange(prev => ({ ...prev, max: text }))}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>
      )}

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
              keyExtractor={(item, index) => item?.id || `item-${index}`}
              numColumns={2}
              columnWrapperStyle={styles.row}
              showsVerticalScrollIndicator={false}
              onRefresh={loadListings}
              refreshing={isLoading}
              removeClippedSubviews={false}
              maxToRenderPerBatch={10}
              windowSize={10}
              initialNumToRender={8}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSortModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sort By</Text>
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
          </View>
            <ScrollView style={styles.modalBody}>
              {SORT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.modalOption,
                    sortBy === option.value && styles.modalOptionActive
                  ]}
                  onPress={() => {
                    setSortBy(option.value);
                    setShowSortModal(false);
                  }}
                >
                  <Text style={[
                    styles.modalOptionText,
                    sortBy === option.value && styles.modalOptionTextActive
                  ]}>
                    {option.label}
                  </Text>
                  {sortBy === option.value && (
                    <Ionicons name="checkmark" size={20} color={colors.primary.main} />
                  )}
                </TouchableOpacity>
              ))}
      </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Category Modal */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Categories</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.modalOption,
                    selectedCategories.includes(category.id) && styles.modalOptionActive
                  ]}
                  onPress={() => {
                    if (category.id === 'all') {
                      setSelectedCategories([]);
                    } else {
                      setSelectedCategories(prev => 
                        prev.includes(category.id) 
                          ? prev.filter(c => c !== category.id)
                          : [...prev, category.id]
                      );
                    }
                  }}
                >
                  <Text style={styles.modalOptionIcon}>{category.icon}</Text>
                  <Text style={[
                    styles.modalOptionText,
                    selectedCategories.includes(category.id) && styles.modalOptionTextActive
                  ]}>
                    {category.name}
                  </Text>
                  {selectedCategories.includes(category.id) && (
                    <Ionicons name="checkmark" size={20} color={colors.primary.main} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowCategoryModal(false)}
              >
                <Text style={styles.modalButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  filterControls: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.lightGray,
  },
  filterControlsContent: {
    paddingRight: spacing.md,
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.gray[200],
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  filterButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
    marginLeft: spacing.xs,
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  filterIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.semantic.error,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  sortButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
    marginLeft: spacing.xs,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  categoryButtonActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  categoryButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
    marginLeft: spacing.xs,
  },
  categoryButtonTextActive: {
    color: colors.white,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.semantic.error,
  },
  clearButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.semantic.error,
    fontWeight: typography.weights.medium,
    marginLeft: spacing.xs,
  },
  filterPanel: {
    backgroundColor: colors.gray[50],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.lightGray,
  },
  filterSection: {
    marginBottom: spacing.md,
  },
  filterSectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInput: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes.base,
  },
  priceSeparator: {
    marginHorizontal: spacing.sm,
    color: colors.text.secondary,
    fontSize: typography.sizes.base,
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
  // Location filter styles
  locationInputContainer: {
    position: 'relative',
  },
  locationInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
  },
  locationButton: {
    padding: spacing.xs,
    marginRight: spacing.xs,
  },
  locationIcon: {
    marginRight: spacing.sm,
  },
  locationInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
  },
  clearLocationButton: {
    padding: spacing.xs,
  },
  locationSuggestions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    marginTop: spacing.xs,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  locationSuggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  locationSuggestionText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    marginLeft: spacing.xs,
  },
  selectedLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.light,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    marginTop: spacing.sm,
  },
  selectedLocationText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.primary.main,
    fontWeight: typography.weights.medium,
    marginLeft: spacing.xs,
  },

  distanceLimitContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  distanceOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[300],
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  distanceOptionActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  distanceOptionText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  distanceOptionTextActive: {
    color: colors.white,
    fontWeight: typography.weights.semibold,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.lightGray,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  modalBody: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.lightGray,
  },
  modalOptionActive: {
    backgroundColor: colors.primary.light,
  },
  modalOptionIcon: {
    fontSize: typography.sizes.lg,
    marginRight: spacing.md,
  },
  modalOptionText: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
  },
  modalOptionTextActive: {
    color: colors.primary.main,
    fontWeight: typography.weights.semibold,
  },
  modalFooter: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.lightGray,
  },
  modalButton: {
    backgroundColor: colors.primary.main,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: colors.white,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
}); 