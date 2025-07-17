import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { colors, spacing, typography } from '../../src/lib/design-system';
import { useAuth } from '../../src/components/AuthProvider';
import { supabase } from '../../src/lib/supabase';

const { width: screenWidth } = Dimensions.get('window');

interface ListingData {
  id: string;
  title: string;
  description: string;
  price_per_day: number;
  location: string;
  is_active: boolean;
  created_at: string;
  owner_id: string;
  category: string;
  condition: string;
  delivery_available: boolean;
  pickup_available: boolean;
  profiles: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    rating: string | null;
  };
  listing_photos: Array<{
    id: string;
    url: string;
    order_index: number;
  }>;
}

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [listing, setListing] = useState<ListingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchListingDetails();
  }, [id]);

  const fetchListingDetails = async () => {
    if (!id || typeof id !== 'string') {
      Alert.alert('Error', 'Invalid listing ID');
      router.back();
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        profiles:owner_id (
          id,
          full_name,
          avatar_url,
          rating
        ),
        listing_photos (
          id,
          url,
          order_index
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching listing:', error);
      Alert.alert('Error', 'Failed to load listing details');
      router.back();
    } else {
      setListing(data);
    }
    setLoading(false);
  };

  const handleBookNow = () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to book this item', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/sign-in') }
      ]);
      return;
    }

    if (listing?.owner_id === user.id) {
      Alert.alert('Cannot Book', 'You cannot book your own listing');
      return;
    }

    router.push(`/booking/${listing?.id}`);
  };

  const handleContactOwner = () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to contact the owner');
      return;
    }
    router.push(`/conversations/new?ownerId=${listing?.owner_id}&listingId=${listing?.id}`);
  };

  const handleViewProfile = () => {
    router.push(`/profile/${listing?.owner_id}`);
  };

  const handleShare = async () => {
    Alert.alert('Share', 'Sharing functionality would be implemented here');
  };

  const renderImageCarousel = () => {
    if (!listing?.listing_photos || listing.listing_photos.length === 0) {
      return (
        <View style={{
          width: screenWidth,
          height: 300,
          backgroundColor: colors.gray[100],
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Ionicons name="image" size={64} color={colors.gray[400]} />
          <Text style={{ color: colors.gray[500], marginTop: spacing.sm }}>No images available</Text>
        </View>
      );
    }

    const sortedPhotos = listing.listing_photos.sort((a, b) => a.order_index - b.order_index);

    return (
      <View>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const newIndex = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
            setCurrentImageIndex(newIndex);
          }}
        >
          {sortedPhotos.map((photo, photoIndex) => (
            <Image
              source={{ uri: photo.url }}
              style={{
                width: screenWidth,
                height: 300,
                resizeMode: 'cover'
              }}
            />
          ))}
        </ScrollView>
        
        {sortedPhotos.length > 1 && (
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            position: 'absolute',
            bottom: spacing.md,
            left: 0,
            right: 0
          }}>
            {sortedPhotos.map((_, index) => (
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: index === currentImageIndex ? colors.white : 'rgba(255, 255, 255, 0.5)',
                  marginHorizontal: 2
                }}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary.main} />
            <Text style={{ marginTop: spacing.md, color: colors.text.secondary }}>Loading listing...</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  if (!listing) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: typography.sizes.lg, color: colors.text.primary }}>Listing not found</Text>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                marginTop: spacing.md,
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.sm,
                backgroundColor: colors.primary.main,
                borderRadius: 8
              }}
            >
              <Text style={{ color: colors.white, fontWeight: typography.weights.semibold }}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }} edges={['top', 'left', 'right']}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          backgroundColor: colors.white,
          borderBottomWidth: 1,
          borderBottomColor: colors.gray[200]
        }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.gray[100],
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <TouchableOpacity
              onPress={handleShare}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.gray[100],
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Ionicons name="share-outline" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.gray[100],
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Ionicons name="heart-outline" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {renderImageCarousel()}

          <View style={{ padding: spacing.md }}>
            <View style={{ marginBottom: spacing.lg }}>
              <Text style={{
                fontSize: typography.sizes['2xl'],
                fontWeight: typography.weights.bold,
                color: colors.text.primary,
                marginBottom: spacing.xs
              }}>
                {listing.title}
              </Text>
              
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{
                  fontSize: typography.sizes.xl,
                  fontWeight: typography.weights.bold,
                  color: colors.primary.main
                }}>
                  ${listing.price_per_day}/day
                </Text>
                
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="location-outline" size={16} color={colors.text.secondary} />
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    color: colors.text.secondary,
                    marginLeft: 4
                  }}>
                    {listing.location}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleViewProfile}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.gray[50],
                borderRadius: 12,
                padding: spacing.md,
                marginBottom: spacing.lg
              }}
            >
              {listing.profiles.avatar_url ? (
                <Image
                  source={{ uri: listing.profiles.avatar_url }}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    marginRight: spacing.md
                  }}
                />
              ) : (
                <View style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: colors.gray[200],
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: spacing.md
                }}>
                  <Ionicons name="person" size={24} color={colors.gray[500]} />
                </View>
              )}
              
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: typography.sizes.base,
                  fontWeight: typography.weights.semibold,
                  color: colors.text.primary
                }}>
                  {listing.profiles.full_name}
                </Text>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                  <Ionicons name="star" size={14} color={colors.semantic.warning} />
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    color: colors.text.secondary,
                    marginLeft: 4
                  }}>
                    {listing.profiles.rating ? parseFloat(listing.profiles.rating).toFixed(1) : 'New'}
                  </Text>
                </View>
              </View>
              
              <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
            </TouchableOpacity>

            <View style={{ marginBottom: spacing.lg }}>
              <Text style={{
                fontSize: typography.sizes.lg,
                fontWeight: typography.weights.semibold,
                color: colors.text.primary,
                marginBottom: spacing.md
              }}>
                Description
              </Text>
              <Text style={{
                fontSize: typography.sizes.base,
                color: colors.text.secondary,
                lineHeight: 24
              }}>
                {listing.description}
              </Text>
            </View>

            <View style={{ marginBottom: spacing.lg }}>
              <Text style={{
                fontSize: typography.sizes.lg,
                fontWeight: typography.weights.semibold,
                color: colors.text.primary,
                marginBottom: spacing.md
              }}>
                Details
              </Text>
              
              <View style={{ backgroundColor: colors.gray[50], borderRadius: 12, padding: spacing.md }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm }}>
                  <Text style={{ color: colors.text.secondary }}>Category</Text>
                  <Text style={{ color: colors.text.primary, fontWeight: typography.weights.medium }}>
                    {listing.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Text>
                </View>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm }}>
                  <Text style={{ color: colors.text.secondary }}>Condition</Text>
                  <Text style={{ color: colors.text.primary, fontWeight: typography.weights.medium }}>
                    {listing.condition.replace(/\b\w/g, l => l.toUpperCase())}
                  </Text>
                </View>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm }}>
                  <Text style={{ color: colors.text.secondary }}>Delivery Available</Text>
                  <Text style={{ color: colors.text.primary, fontWeight: typography.weights.medium }}>
                    {listing.delivery_available ? 'Yes' : 'No'}
                  </Text>
                </View>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: colors.text.secondary }}>Pickup Available</Text>
                  <Text style={{ color: colors.text.primary, fontWeight: typography.weights.medium }}>
                    {listing.pickup_available ? 'Yes' : 'No'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        <SafeAreaView edges={['bottom']} style={{ backgroundColor: colors.white }}>
          <View style={{
            flexDirection: 'row',
            padding: spacing.md,
            backgroundColor: colors.white,
            borderTopWidth: 1,
            borderTopColor: colors.gray[200],
            gap: spacing.md
          }}>
            <TouchableOpacity
              onPress={handleContactOwner}
              style={{
                flex: 1,
                backgroundColor: colors.gray[100],
                borderRadius: 12,
                paddingVertical: spacing.md,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Text style={{
                fontSize: typography.sizes.base,
                fontWeight: typography.weights.semibold,
                color: colors.text.primary
              }}>
                Contact Owner
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleBookNow}
              disabled={bookingLoading || !listing.is_active}
              style={{
                flex: 2,
                backgroundColor: listing.is_active ? colors.primary.main : colors.gray[400],
                borderRadius: 12,
                paddingVertical: spacing.md,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row'
              }}
            >
              {bookingLoading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <Ionicons name="calendar-outline" size={20} color={colors.white} style={{ marginRight: spacing.xs }} />
                  <Text style={{
                    fontSize: typography.sizes.base,
                    fontWeight: typography.weights.semibold,
                    color: colors.white
                  }}>
                    {listing.is_active ? 'Book Now' : 'Not Available'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </SafeAreaView>
    </>
  );
} 