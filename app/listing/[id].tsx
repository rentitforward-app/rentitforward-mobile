import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator, Dimensions, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { colors, spacing, typography } from '../../src/lib/design-system';
import { useAuth } from '../../src/components/AuthProvider';
import { supabase } from '../../src/lib/supabase';
import { Header, HeaderPresets } from '../../src/components/Header';

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
  category: string;
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
    verified: boolean;
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
            created_at,
            verified
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

    if (!listing?.profiles.id) {
      Alert.alert('Error', 'Unable to contact owner');
      return;
    }

    // Prevent owners from contacting themselves
    if (listing.profiles.id === user.id) {
      Alert.alert('Cannot Contact Yourself', 'You cannot contact yourself about your own listing');
      return;
    }

    // Navigate to message screen
    router.push(`/message/${listing.id}`);
  };

  const handleSendMessage = async (message: string) => {
    if (!user || !listing?.profiles.id) {
      throw new Error('Missing user or listing information');
    }

    try {
      // Check if conversation already exists for this listing between these users
      const { data: existingConversation, error: checkError } = await supabase
        .from('conversations')
        .select('id')
        .eq('listing_id', listing.id)
        .is('booking_id', null) // Only inquiry conversations (no booking)
        .contains('participants', [user.id])
        .contains('participants', [listing.profiles.id])
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing conversation:', checkError);
      }

      let conversationId: string;

      // If no conversation exists, create one
      if (!existingConversation) {
        const { data: newConversation, error: createError } = await supabase
          .from('conversations')
          .insert({
            booking_id: null, // NULL for inquiry conversations
            listing_id: listing.id,
            participants: [listing.profiles.id, user.id],
            last_message: message,
            last_message_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (createError || !newConversation) {
          console.error('Error creating conversation:', createError);
          throw new Error('Failed to create conversation');
        }

        conversationId = newConversation.id;
      } else {
        conversationId = existingConversation.id;
      }

      // Send the actual message
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          receiver_id: listing.profiles.id,
          content: message,
          message_type: 'text',
        });

      if (messageError) {
        console.error('Error sending message:', messageError);
        throw new Error('Failed to send message');
      }

      // Update conversation with latest message
      await supabase
        .from('conversations')
        .update({
          last_message: message,
          last_message_at: new Date().toISOString(),
        })
        .eq('id', conversationId);

      // Navigate to the conversation
      router.push(`/conversations/${conversationId}`);
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      throw error; // Re-throw so modal can handle it
    }
  };

  const handleViewProfile = () => {
    router.push(`/profile/${listing?.profiles.id}`);
  };

  const handleShare = async () => {
    if (!listing) return;

    try {
      const shareUrl = `https://rentitforward.com.au/listings/${listing.id}`;
      const shareMessage = `Check out this ${listing.title} for rent on Rent It Forward!\n\n${formatPrice(listing.price_per_day)}/day in ${listing.city}, ${listing.state}\n\n${shareUrl}`;

      const result = await Share.share({
        message: shareMessage,
        url: shareUrl, // iOS will use this for sharing
        title: `${listing.title} - Rent It Forward`,
      });

      if (result.action === Share.sharedAction) {
        // Successfully shared
        console.log('Listing shared successfully');
      }
    } catch (error) {
      console.error('Error sharing listing:', error);
      Alert.alert('Error', 'Failed to share listing. Please try again.');
    }
  };

  const handleToggleListingStatus = async () => {
    if (!listing || !user) return;

    if (listing.approval_status === 'pending' || listing.approval_status === 'rejected') {
      Alert.alert(
        'Cannot Change Status',
        listing.approval_status === 'pending' 
          ? 'Cannot change status while listing is pending approval'
          : 'Cannot change status while listing is rejected'
      );
      return;
    }

    try {
      const newIsActive = !listing.is_active;
      
      const { error } = await supabase
        .from('listings')
        .update({ is_active: newIsActive })
        .eq('id', listing.id);

      if (error) {
        console.error('Error updating listing status:', error);
        Alert.alert('Error', 'Failed to update listing status');
        return;
      }

      // Update local state
      setListing(prev => prev ? { ...prev, is_active: newIsActive } : null);
      Alert.alert('Success', newIsActive ? 'Listing activated' : 'Listing paused');
    } catch (error) {
      console.error('Error updating listing status:', error);
      Alert.alert('Error', 'Failed to update listing status');
    }
  };

  const handleDeleteListing = async () => {
    if (!listing || !user) return;

    Alert.alert(
      'Delete Listing',
      `Are you sure you want to delete "${listing.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('listings')
                .delete()
                .eq('id', listing.id);

              if (error) {
                console.error('Error deleting listing:', error);
                Alert.alert('Error', 'Failed to delete listing');
                return;
              }

              Alert.alert('Success', 'Listing deleted successfully', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch (error) {
              console.error('Error deleting listing:', error);
              Alert.alert('Error', 'Failed to delete listing');
            }
          }
        }
      ]
    );
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
          justifyContent: 'center',
          position: 'relative'
        }}>
          <Ionicons name="image" size={64} color={colors.gray[400]} />
          <Text style={{ color: colors.gray[500], marginTop: spacing.sm }}>No images available</Text>
          
          {/* Floating Action Buttons - Airbnb Style */}
          <View style={{
            position: 'absolute',
            top: spacing.md,
            right: spacing.md,
            flexDirection: 'row',
            gap: spacing.xs
          }}>
            <TouchableOpacity
              onPress={handleShare}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: colors.black,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3
              }}
            >
              <Ionicons name="share-outline" size={16} color={colors.text.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={toggleFavorite}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: colors.black,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3
              }}
            >
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={16} 
                color={isFavorite ? colors.semantic.error : colors.text.primary} 
              />
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={{ position: 'relative' }}>
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
        
        {/* Floating Action Buttons - Airbnb Style */}
        <View style={{
          position: 'absolute',
          top: spacing.md,
          right: spacing.md,
          flexDirection: 'row',
          gap: spacing.xs
        }}>
          <TouchableOpacity
            onPress={handleShare}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: colors.black,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3
            }}
          >
            <Ionicons name="share-outline" size={16} color={colors.text.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={toggleFavorite}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: colors.black,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3
            }}
          >
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={16} 
              color={isFavorite ? colors.semantic.error : colors.text.primary} 
            />
          </TouchableOpacity>
        </View>
        
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
        <View style={{ flex: 1, backgroundColor: colors.white }}>
          <Header {...HeaderPresets.detail("Loading...")} />
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary.main} />
            <Text style={{ marginTop: spacing.md, color: colors.text.secondary }}>Loading listing...</Text>
          </View>
        </View>
      </>
    );
  }

  if (!listing) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ flex: 1, backgroundColor: colors.white }}>
          <Header {...HeaderPresets.detail("Listing Not Found")} />
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
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, backgroundColor: colors.white }}>
        <Header {...HeaderPresets.detail(listing?.title || "Listing Details")} />

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
                marginBottom: spacing.md
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

            {/* Message Owner Button - Only show if not owner */}
            {listing.profiles.id !== user?.id && (
              <TouchableOpacity
                onPress={handleContactOwner}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: colors.white,
                  borderWidth: 1,
                  borderColor: colors.gray[300],
                  borderRadius: 12,
                  paddingVertical: spacing.md,
                  paddingHorizontal: spacing.lg,
                  marginBottom: spacing.lg
                }}
              >
                <Ionicons name="chatbubble-outline" size={20} color={colors.gray[900]} style={{ marginRight: spacing.sm }} />
                <Text style={{
                  fontSize: typography.sizes.base,
                  fontWeight: typography.weights.semibold,
                  color: colors.gray[900]
                }}>
                  Message
                </Text>
              </TouchableOpacity>
            )}

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
            flexDirection: 'column',
            padding: spacing.md,
            backgroundColor: colors.white,
            borderTopWidth: 1,
            borderTopColor: colors.gray[200],
            gap: spacing.sm
          }}>
            {listing.profiles.id === user?.id ? (
              // Show owner action buttons
              <View style={{ gap: spacing.sm }}>
                <View style={{
                  backgroundColor: colors.primary.main + '10',
                  borderRadius: 12,
                  paddingVertical: spacing.md,
                  paddingHorizontal: spacing.md,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: colors.primary.main + '30',
                  marginBottom: spacing.sm
                }}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.primary.main} style={{ marginBottom: spacing.xs / 2 }} />
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    fontWeight: typography.weights.semibold,
                    color: colors.primary.main,
                    textAlign: 'center'
                  }}>
                    This is Your Listing
                  </Text>
                </View>

                {/* Owner Action Buttons */}
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <TouchableOpacity
                    onPress={() => router.push(`/listing/create?edit=${listing.id}`)}
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: spacing.md,
                      backgroundColor: colors.gray[100],
                      borderRadius: 12,
                    }}
                  >
                    <Ionicons name="create-outline" size={20} color={colors.text.primary} style={{ marginRight: spacing.xs }} />
                    <Text style={{
                      fontSize: typography.sizes.base,
                      fontWeight: typography.weights.semibold,
                      color: colors.text.primary
                    }}>
                      Edit
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleToggleListingStatus()}
                    disabled={listing.approval_status === 'pending' || listing.approval_status === 'rejected'}
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: spacing.md,
                      backgroundColor: listing.is_active ? colors.semantic.warning + '20' : colors.semantic.success + '20',
                      borderRadius: 12,
                      opacity: (listing.approval_status === 'pending' || listing.approval_status === 'rejected') ? 0.5 : 1,
                    }}
                  >
                    <Ionicons 
                      name={listing.is_active ? 'pause-outline' : 'play-outline'} 
                      size={20} 
                      color={listing.is_active ? colors.semantic.warning : colors.semantic.success} 
                      style={{ marginRight: spacing.xs }} 
                    />
                    <Text style={{
                      fontSize: typography.sizes.base,
                      fontWeight: typography.weights.semibold,
                      color: listing.is_active ? colors.semantic.warning : colors.semantic.success
                    }}>
                      {listing.is_active ? 'Pause' : 'Activate'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={() => handleDeleteListing()}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: spacing.md,
                    backgroundColor: colors.semantic.error + '20',
                    borderRadius: 12,
                  }}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.semantic.error} style={{ marginRight: spacing.xs }} />
                  <Text style={{
                    fontSize: typography.sizes.base,
                    fontWeight: typography.weights.semibold,
                    color: colors.semantic.error
                  }}>
                    Delete Listing
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Show Book Now button for other users
              <TouchableOpacity
                onPress={handleBookNow}
                disabled={bookingLoading || !listing.is_active}
                style={{
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
            )}
          </View>
        </SafeAreaView>
      </View>

    </>
  );
} 