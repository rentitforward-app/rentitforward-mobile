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
  price_weekly: number | null;
  price_hourly: number | null;
  deposit: number;
  images: string[];
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  condition: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  features: string[];
  rules: string[];
  view_count: number;
  favorite_count: number;
  rating: number | null;
  review_count: number | null;
  delivery_available: boolean;
  pickup_available: boolean;
  is_active: boolean;
  approval_status: string;
  created_at: string;
  profiles: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    postal_code: string | null;
    created_at: string;
  };
}

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [listing, setListing] = useState<ListingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    fetchListingDetails();
  }, [id]);

  useEffect(() => {
    if (listing?.id) {
      fetchOwnerReviews();
    }
  }, [listing]);

  useEffect(() => {
    if (user && listing) {
      checkFavoriteStatus();
    }
  }, [user, listing]);

  const fetchListingDetails = async () => {
    if (!id || typeof id !== 'string') {
      Alert.alert('Error', 'Invalid listing ID');
      router.back();
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          profiles:owner_id (
            id,
            full_name,
            avatar_url,
            address,
            city,
            state,
            postal_code,
            created_at
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching listing:', error);
        Alert.alert('Error', 'Failed to load listing details');
        router.back();
        return;
      }

      setListing(data);
    } catch (error) {
      console.error('Error fetching listing:', error);
      Alert.alert('Error', 'Failed to load listing details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    if (!user || !listing) return;

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('listing_id', listing.id)
        .single();

      setIsFavorite(!!data);
    } catch (error) {
      // No favorite found, which is fine
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to save favorites');
      return;
    }

    try {
      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listing!.id);

        setIsFavorite(false);
        Alert.alert('Success', 'Removed from favorites');
      } else {
        await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            listing_id: listing!.id
          });

        setIsFavorite(true);
        Alert.alert('Success', 'Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  const handleBookNow = () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to book this item', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/sign-in') }
      ]);
      return;
    }

    if (listing?.profiles.id === user.id) {
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
    router.push(`/conversations/new?ownerId=${listing?.profiles.id}&listingId=${listing?.id}`);
  };

  const handleViewProfile = () => {
    router.push(`/profile/${listing?.profiles.id}`);
  };

  const handleShare = async () => {
    Alert.alert('Share', 'Sharing functionality would be implemented here');
  };

  const formatPrice = (price: number | null | undefined) => {
    if (!price || price === 0) {
      return 'Contact for price';
    }
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getDisplayImage = (images: string[], index: number = 0) => {
    if (!images || images.length === 0) {
      return null; // Will show placeholder
    }
    return images[index] || null;
  };

  const fetchOwnerReviews = async () => {
    if (!listing?.id) return;

    try {
      console.log('Fetching reviews for listing:', listing.id);
      
      // Use a direct approach with a custom database function to bypass RLS issues
      const { data, error } = await supabase.rpc('get_listing_reviews_public', {
        p_listing_id: listing.id
      });

      if (error) {
        console.log('RPC not available, trying fallback approach...');
        
        // Fallback: Try to get reviews through the reviewee (owner) and filter by context
        if (listing?.profiles?.id) {
          const { data: reviewData, error: reviewError } = await supabase
            .from('reviews')
            .select(`
              id,
              rating,
              comment,
              created_at,
              reviewer_id,
              type,
              booking_id,
              profiles:reviewer_id (
                full_name,
                avatar_url
              )
            `)
            .eq('reviewee_id', listing.profiles.id) // Reviews about this owner
            .eq('type', 'renter_to_owner') // Only renter reviews
            .order('created_at', { ascending: false });

          if (reviewError) {
            console.error('Error fetching fallback reviews:', reviewError);
            return;
          }

          // For now, show the most recent reviews (we'll improve this later)
          console.log('Reviews found via fallback:', reviewData?.length || 0);
          setReviews((reviewData || []).slice(0, 3)); // Limit to 3
        }
        return;
      }

      console.log('Reviews found for this listing:', data?.length || 0);
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching listing reviews:', error);
    }
  };

  const renderImageCarousel = () => {
    const displayImages = listing?.images && listing.images.length > 0 ? listing.images : [];
    
    if (displayImages.length === 0) {
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
          {displayImages.map((image, photoIndex) => (
            <Image
              key={photoIndex}
              source={{ uri: image }}
              style={{
                width: screenWidth,
                height: 300,
                resizeMode: 'cover'
              }}
            />
          ))}
        </ScrollView>
        
        {displayImages.length > 1 && (
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            position: 'absolute',
            bottom: spacing.md,
            left: 0,
            right: 0
          }}>
            {displayImages.map((_, index) => (
              <View
                key={index}
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
              onPress={toggleFavorite}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.gray[100],
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={24} 
                color={isFavorite ? colors.semantic.error : colors.text.primary} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {renderImageCarousel()}

          <View style={{ padding: spacing.md }}>
            {/* Title and Price */}
            <View style={{ marginBottom: spacing.lg }}>
              <Text style={{
                fontSize: typography.sizes['2xl'],
                fontWeight: typography.weights.bold,
                color: colors.text.primary,
                marginBottom: spacing.xs
              }}>
                {listing.title}
              </Text>
              
              {/* Rating Display */}
              {listing.rating && listing.review_count && listing.review_count > 0 && (
                <View style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  marginBottom: spacing.sm 
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= Math.round(Number(listing.rating)) ? 'star' : 'star-outline'}
                        size={16}
                        color={star <= Math.round(Number(listing.rating)) ? colors.semantic.warning : colors.gray[300]}
                        style={{ marginRight: 2 }}
                      />
                    ))}
                    <Text style={{
                      fontSize: typography.sizes.sm,
                      fontWeight: typography.weights.semibold,
                      color: colors.text.primary,
                      marginLeft: spacing.xs
                    }}>
                      {Number(listing.rating) % 1 === 0 ? Number(listing.rating).toFixed(0) : Number(listing.rating).toFixed(1)}
                    </Text>
                    <Text style={{
                      fontSize: typography.sizes.sm,
                      color: colors.text.secondary,
                      marginLeft: 4
                    }}>
                      ({listing.review_count} review{listing.review_count !== 1 ? 's' : ''})
                    </Text>
                  </View>
                </View>
              )}
              
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm }}>
                <Text style={{
                  fontSize: typography.sizes.xl,
                  fontWeight: typography.weights.bold,
                  color: colors.primary.main
                }}>
                  {formatPrice(listing.price_per_day)}/day
                </Text>
                
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="location-outline" size={16} color={colors.text.secondary} />
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    color: colors.text.secondary,
                    marginLeft: 4
                  }}>
                    {listing.city}, {listing.state}
                  </Text>
                </View>
              </View>

              {/* Additional Pricing */}
              <View style={{ flexDirection: 'row', gap: spacing.md }}>
                {listing.price_weekly && listing.price_weekly > 0 && (
                  <Text style={{ fontSize: typography.sizes.sm, color: colors.text.secondary }}>
                    {formatPrice(listing.price_weekly)}/week
                  </Text>
                )}
                {listing.price_hourly && listing.price_hourly > 0 && (
                  <Text style={{ fontSize: typography.sizes.sm, color: colors.text.secondary }}>
                    {formatPrice(listing.price_hourly)}/hour
                  </Text>
                )}
              </View>
            </View>

            {/* Owner Profile */}
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
                
                <Text style={{
                  fontSize: typography.sizes.sm,
                  color: colors.text.secondary,
                  marginTop: 2
                }}>
                  {listing.profiles.city && listing.profiles.state 
                    ? `${listing.profiles.city}, ${listing.profiles.state}`
                    : 'Location not specified'
                  }
                </Text>
              </View>
              
              <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
            </TouchableOpacity>

            {/* Description */}
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

            {/* Features */}
            {listing.features && listing.features.length > 0 && (
              <View style={{ marginBottom: spacing.lg }}>
                <Text style={{
                  fontSize: typography.sizes.lg,
                  fontWeight: typography.weights.semibold,
                  color: colors.text.primary,
                  marginBottom: spacing.md
                }}>
                  Features
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                  {(showAllFeatures ? listing.features : listing.features.slice(0, 6)).map((feature, index) => (
                    <View key={index} style={{ flexDirection: 'row', alignItems: 'center', width: '48%' }}>
                      <View style={{ width: 6, height: 6, backgroundColor: colors.primary.main, borderRadius: 3, marginRight: spacing.sm }} />
                      <Text style={{ fontSize: typography.sizes.sm, color: colors.text.secondary, flex: 1 }}>
                        {feature}
                      </Text>
                    </View>
                  ))}
                </View>
                {listing.features.length > 6 && (
                  <TouchableOpacity
                    onPress={() => setShowAllFeatures(!showAllFeatures)}
                    style={{ marginTop: spacing.sm }}
                  >
                    <Text style={{ color: colors.primary.main, fontWeight: typography.weights.medium }}>
                      {showAllFeatures ? 'Show less' : `Show ${listing.features.length - 6} more features`}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Delivery Methods */}
            <View style={{ marginBottom: spacing.lg }}>
              <Text style={{
                fontSize: typography.sizes.lg,
                fontWeight: typography.weights.semibold,
                color: colors.text.primary,
                marginBottom: spacing.md
              }}>
                Delivery Options
              </Text>
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                {listing.pickup_available && (
                  <View style={{
                    backgroundColor: colors.primary.main + '20',
                    paddingHorizontal: spacing.sm,
                    paddingVertical: spacing.xs,
                    borderRadius: 8
                  }}>
                    <Text style={{ fontSize: typography.sizes.sm, color: colors.primary.main, fontWeight: typography.weights.medium }}>
                      Pickup
                    </Text>
                  </View>
                )}
                {listing.delivery_available && (
                  <View style={{
                    backgroundColor: colors.semantic.success + '20',
                    paddingHorizontal: spacing.sm,
                    paddingVertical: spacing.xs,
                    borderRadius: 8
                  }}>
                    <Text style={{ fontSize: typography.sizes.sm, color: colors.semantic.success, fontWeight: typography.weights.medium }}>
                      Delivery
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Rules */}
            {listing.rules && listing.rules.length > 0 && (
              <View style={{ marginBottom: spacing.lg }}>
                <Text style={{
                  fontSize: typography.sizes.lg,
                  fontWeight: typography.weights.semibold,
                  color: colors.text.primary,
                  marginBottom: spacing.md
                }}>
                  Rental Rules
                </Text>
                <View style={{ gap: spacing.sm }}>
                  {listing.rules.map((rule, index) => (
                    <View key={index} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                      <Ionicons name="information-circle" size={16} color={colors.primary.main} style={{ marginRight: spacing.sm, marginTop: 2 }} />
                      <Text style={{ fontSize: typography.sizes.sm, color: colors.text.secondary, flex: 1 }}>
                        {rule}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Details */}
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
                
                {listing.brand && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm }}>
                    <Text style={{ color: colors.text.secondary }}>Brand</Text>
                    <Text style={{ color: colors.text.primary, fontWeight: typography.weights.medium }}>
                      {listing.brand}
                    </Text>
                  </View>
                )}
                
                {listing.model && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm }}>
                    <Text style={{ color: colors.text.secondary }}>Model</Text>
                    <Text style={{ color: colors.text.primary, fontWeight: typography.weights.medium }}>
                      {listing.model}
                    </Text>
                  </View>
                )}
                
                {listing.year && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm }}>
                    <Text style={{ color: colors.text.secondary }}>Year</Text>
                    <Text style={{ color: colors.text.primary, fontWeight: typography.weights.medium }}>
                      {listing.year}
                    </Text>
                  </View>
                )}
                
                {listing.deposit > 0 && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: colors.text.secondary }}>Deposit</Text>
                    <Text style={{ color: colors.text.primary, fontWeight: typography.weights.medium }}>
                      {formatPrice(listing.deposit)}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Reviews Section */}
            {reviews.length > 0 && (
              <View style={{ marginBottom: spacing.lg }}>
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: spacing.md 
                }}>
                  <Text style={{
                    fontSize: typography.sizes.lg,
                    fontWeight: typography.weights.semibold,
                    color: colors.text.primary
                  }}>
                    Reviews
                  </Text>
                </View>

                {/* Review Cards */}
                <View style={{ gap: spacing.md }}>
                  {reviews.map((review) => (
                    <View 
                      key={review.id}
                      style={{
                        backgroundColor: colors.gray[50],
                        borderRadius: 12,
                        padding: spacing.md
                      }}
                    >
                      {/* Reviewer Header */}
                      <View style={{ 
                        flexDirection: 'row', 
                        alignItems: 'flex-start',
                        marginBottom: spacing.sm 
                      }}>
                        {/* Profile Image */}
                        {review.profiles?.avatar_url ? (
                          <Image
                            source={{ uri: review.profiles.avatar_url }}
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 20,
                              marginRight: spacing.sm
                            }}
                          />
                        ) : (
                          <View style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: colors.gray[100],
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: spacing.sm
                          }}>
                            <Ionicons name="person" size={20} color={colors.gray[600]} />
                          </View>
                        )}
                        
                        <View style={{ flex: 1 }}>
                          {/* Reviewer Name */}
                          <Text style={{
                            fontSize: typography.sizes.base,
                            fontWeight: typography.weights.semibold,
                            color: colors.text.primary,
                            marginBottom: 4
                          }}>
                            {review.profiles?.full_name || review.full_name || 'Anonymous'}
                          </Text>
                          
                          {/* Rating Stars */}
                          <View style={{ 
                            flexDirection: 'row', 
                            alignItems: 'center',
                            marginBottom: 4
                          }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Ionicons
                                key={star}
                                name={star <= review.rating ? 'star' : 'star-outline'}
                                size={14}
                                color={star <= review.rating ? colors.semantic.warning : colors.gray[300]}
                                style={{ marginRight: 2 }}
                              />
                            ))}
                            <Text style={{
                              fontSize: typography.sizes.sm,
                              fontWeight: typography.weights.medium,
                              color: colors.text.primary,
                              marginLeft: spacing.xs
                            }}>
                              {review.rating}/5
                            </Text>
                          </View>
                          
                          {/* Review Date */}
                          <Text style={{
                            fontSize: typography.sizes.xs,
                            color: colors.text.secondary
                          }}>
                            {new Date(review.created_at).toLocaleDateString('en-AU', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </Text>
                        </View>
                      </View>

                      {/* Review Comment */}
                      {review.comment && (
                        <Text style={{
                          fontSize: typography.sizes.sm,
                          color: colors.text.primary,
                          lineHeight: 20
                        }}>
                          {review.comment}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>

              </View>
            )}
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