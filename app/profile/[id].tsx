import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { colors, spacing, typography } from '../../src/lib/design-system';
import { useAuth } from '../../src/components/AuthProvider';
import { supabase } from '../../src/lib/supabase';

const { width: screenWidth } = Dimensions.get('window');

interface HostProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  verified: boolean;
  created_at: string;
}

interface HostListing {
  id: string;
  title: string;
  price_per_day: number;
  images: string[];
  city: string;
  state: string;
  condition: string;
  category: string;
  created_at: string;
  is_active: boolean;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer_id: string;
  tags: string[] | null;
  profiles: {
    full_name: string;
    avatar_url: string | null;
  };
  bookings?: {
    listing_id: string;
    listings: {
      title: string;
      owner_id: string;
    };
  };
}

export default function OwnerProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [host, setHost] = useState<HostProfile | null>(null);
  const [listings, setListings] = useState<HostListing[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews'>('listings');

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchHostProfile();
      fetchHostListings();
      fetchHostReviews();
    }
  }, [id]);

  const fetchHostProfile = async () => {
    if (!id || typeof id !== 'string') {
      Alert.alert('Error', 'Invalid host ID');
      router.back();
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching host profile:', error);
        Alert.alert('Error', 'Host profile not found');
        router.back();
        return;
      }

      setHost(data);
    } catch (error) {
      console.error('Error fetching host profile:', error);
      Alert.alert('Error', 'Failed to load host profile');
      router.back();
    }
  };

  const fetchHostListings = async () => {
    if (!id || typeof id !== 'string') return;

    try {
      const { data, error } = await supabase
        .from('listings')
        .select('id, title, price_per_day, images, city, state, condition, category, created_at, is_active')
        .eq('owner_id', id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching host listings:', error);
        return;
      }

      setListings(data || []);
    } catch (error) {
      console.error('Error fetching host listings:', error);
    }
  };

  const fetchHostReviews = async () => {
    if (!id || typeof id !== 'string') return;

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          reviewer_id,
          tags,
          profiles:reviewer_id (
            full_name,
            avatar_url
          ),
          bookings!inner (
            listing_id,
            listings!inner (
              title,
              owner_id
            )
          )
        `)
        .eq('bookings.listings.owner_id', id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching host reviews:', error);
        return;
      }

      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching host reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getDisplayImage = (images: string[]) => {
    if (!images || images.length === 0) {
      return null;
    }
    return images[0] || null;
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length);
  };

  const handleMessageHost = () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to send a message');
      return;
    }
    
    if (host) {
      router.push(`/conversations/new?ownerId=${host.id}`);
    }
  };

  const handleListingPress = (listingId: string) => {
    router.push(`/listing/${listingId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary.main} />
            <Text style={{ marginTop: spacing.md, color: colors.text.secondary }}>Loading profile...</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  if (!host) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: typography.sizes.lg, color: colors.text.primary }}>Host not found</Text>
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

  const averageRating = calculateAverageRating();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }} edges={['top', 'left', 'right']}>
        {/* Header */}
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
          
          <Text style={{
            fontSize: typography.sizes.lg,
            fontWeight: typography.weights.semibold,
            color: colors.text.primary
          }}>
            Host Profile
          </Text>
          
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* Host Profile Header */}
          <View style={{
            backgroundColor: colors.white,
            padding: spacing.lg,
            marginBottom: spacing.md
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.lg }}>
              {host.avatar_url ? (
                <Image
                  source={{ uri: host.avatar_url }}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    marginRight: spacing.md
                  }}
                />
              ) : (
                <View style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: colors.gray[200],
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: spacing.md
                }}>
                  <Ionicons name="person" size={32} color={colors.gray[500]} />
                </View>
              )}
              
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: typography.sizes['2xl'],
                  fontWeight: typography.weights.bold,
                  color: colors.text.primary,
                  marginBottom: spacing.xs
                }}>
                  {host.full_name}
                </Text>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                  {host.city && host.state && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: spacing.md }}>
                      <Ionicons name="location-outline" size={16} color={colors.text.secondary} />
                      <Text style={{
                        fontSize: typography.sizes.sm,
                        color: colors.text.secondary,
                        marginLeft: 4
                      }}>
                        {host.city}, {host.state}
                      </Text>
                    </View>
                  )}
                  
                  {host.verified && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="checkmark-circle" size={16} color={colors.primary.main} />
                      <Text style={{
                        fontSize: typography.sizes.sm,
                        color: colors.primary.main,
                        marginLeft: 4
                      }}>
                        Verified
                      </Text>
                    </View>
                  )}
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    color: colors.text.secondary,
                    marginRight: spacing.md
                  }}>
                    Host since {formatDate(host.created_at)}
                  </Text>
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    color: colors.text.secondary,
                    marginRight: spacing.md
                  }}>
                    {listings.length} active listings
                  </Text>
                  {reviews.length > 0 && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="star" size={14} color={colors.semantic.warning} />
                      <Text style={{
                        fontSize: typography.sizes.sm,
                        color: colors.text.secondary,
                        marginLeft: 4
                      }}>
                        {averageRating.toFixed(1)} ({reviews.length})
                      </Text>
                    </View>
                  )}
                </View>
                
                {host.bio && (
                  <Text style={{
                    fontSize: typography.sizes.base,
                    color: colors.text.secondary,
                    lineHeight: 20
                  }}>
                    {host.bio}
                  </Text>
                )}
              </View>
            </View>
            
            {user?.id !== host.id && (
              <TouchableOpacity
                onPress={handleMessageHost}
                style={{
                  backgroundColor: colors.gray[100],
                  borderRadius: 12,
                  paddingVertical: spacing.md,
                  paddingHorizontal: spacing.lg,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center'
                }}
              >
                <Ionicons name="chatbubble-outline" size={20} color={colors.text.primary} style={{ marginRight: spacing.sm }} />
                <Text style={{
                  fontSize: typography.sizes.base,
                  fontWeight: typography.weights.semibold,
                  color: colors.text.primary
                }}>
                  Message Host
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Tabs */}
          <View style={{
            backgroundColor: colors.white,
            marginBottom: spacing.md
          }}>
            <View style={{
              flexDirection: 'row',
              borderBottomWidth: 1,
              borderBottomColor: colors.gray[200]
            }}>
              <TouchableOpacity
                onPress={() => setActiveTab('listings')}
                style={{
                  flex: 1,
                  paddingVertical: spacing.md,
                  paddingHorizontal: spacing.lg,
                  borderBottomWidth: 2,
                  borderBottomColor: activeTab === 'listings' ? colors.primary.main : 'transparent',
                  alignItems: 'center'
                }}
              >
                <Text style={{
                  fontSize: typography.sizes.base,
                  fontWeight: typography.weights.semibold,
                  color: activeTab === 'listings' ? colors.primary.main : colors.text.secondary
                }}>
                  Listings ({listings.length})
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setActiveTab('reviews')}
                style={{
                  flex: 1,
                  paddingVertical: spacing.md,
                  paddingHorizontal: spacing.lg,
                  borderBottomWidth: 2,
                  borderBottomColor: activeTab === 'reviews' ? colors.primary.main : 'transparent',
                  alignItems: 'center'
                }}
              >
                <Text style={{
                  fontSize: typography.sizes.base,
                  fontWeight: typography.weights.semibold,
                  color: activeTab === 'reviews' ? colors.primary.main : colors.text.secondary
                }}>
                  Reviews ({reviews.length})
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ padding: spacing.lg }}>
              {activeTab === 'listings' && (
                <View>
                  {listings.length > 0 ? (
                    <View style={{ gap: spacing.md }}>
                      {listings.map((listing) => (
                        <TouchableOpacity
                          key={listing.id}
                          onPress={() => handleListingPress(listing.id)}
                          style={{
                            backgroundColor: colors.gray[50],
                            borderRadius: 12,
                            overflow: 'hidden'
                          }}
                        >
                          <View style={{ height: 200, backgroundColor: colors.gray[100] }}>
                            {getDisplayImage(listing.images) ? (
                              <Image
                                source={{ uri: getDisplayImage(listing.images)! }}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  resizeMode: 'cover'
                                }}
                              />
                            ) : (
                              <View style={{
                                flex: 1,
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <Ionicons name="image" size={48} color={colors.gray[400]} />
                                <Text style={{ color: colors.gray[500], marginTop: spacing.sm }}>No image</Text>
                              </View>
                            )}
                          </View>
                          
                          <View style={{ padding: spacing.md }}>
                            <Text style={{
                              fontSize: typography.sizes.base,
                              fontWeight: typography.weights.semibold,
                              color: colors.text.primary,
                              marginBottom: spacing.xs
                            }}>
                              {listing.title}
                            </Text>
                            
                            <Text style={{
                              fontSize: typography.sizes.sm,
                              color: colors.text.secondary,
                              marginBottom: spacing.sm
                            }}>
                              {listing.city}, {listing.state}
                            </Text>
                            
                            <View style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <Text style={{
                                fontSize: typography.sizes.base,
                                fontWeight: typography.weights.bold,
                                color: colors.primary.main
                              }}>
                                {formatPrice(listing.price_per_day)}/day
                              </Text>
                              
                              <Text style={{
                                fontSize: typography.sizes.sm,
                                color: colors.text.secondary,
                                textTransform: 'capitalize'
                              }}>
                                {listing.condition}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : (
                    <View style={{ alignItems: 'center', paddingVertical: spacing['2xl'] }}>
                      <Ionicons name="list" size={48} color={colors.gray[400]} />
                      <Text style={{
                        fontSize: typography.sizes.base,
                        color: colors.text.secondary,
                        marginTop: spacing.md
                      }}>
                        This host doesn't have any active listings yet.
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {activeTab === 'reviews' && (
                <View>
                  {reviews.length > 0 ? (
                    <View style={{ gap: spacing.lg }}>
                      {/* Review Statistics */}
                      <View style={{
                        backgroundColor: colors.gray[50],
                        borderRadius: 12,
                        padding: spacing.md
                      }}>
                        <View style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: spacing.sm
                        }}>
                          <Ionicons name="star" size={24} color={colors.semantic.warning} />
                          <Text style={{
                            fontSize: typography.sizes['2xl'],
                            fontWeight: typography.weights.bold,
                            color: colors.text.primary,
                            marginLeft: spacing.sm
                          }}>
                            {averageRating.toFixed(1)}
                          </Text>
                        </View>
                        <Text style={{
                          fontSize: typography.sizes.sm,
                          color: colors.text.secondary,
                          textAlign: 'center'
                        }}>
                          Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                        </Text>
                      </View>
                      
                      {/* Review List */}
                      {reviews.map((review) => (
                        <View key={review.id} style={{
                          backgroundColor: colors.gray[50],
                          borderRadius: 12,
                          padding: spacing.md
                        }}>
                          <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: spacing.sm
                          }}>
                            {review.profiles.avatar_url ? (
                              <Image
                                source={{ uri: review.profiles.avatar_url }}
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 16,
                                  marginRight: spacing.sm
                                }}
                              />
                            ) : (
                              <View style={{
                                width: 32,
                                height: 32,
                                borderRadius: 16,
                                backgroundColor: colors.gray[200],
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: spacing.sm
                              }}>
                                <Ionicons name="person" size={16} color={colors.gray[500]} />
                              </View>
                            )}
                            
                            <View style={{ flex: 1 }}>
                              <Text style={{
                                fontSize: typography.sizes.sm,
                                fontWeight: typography.weights.semibold,
                                color: colors.text.primary
                              }}>
                                {review.profiles.full_name}
                              </Text>
                              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                {[...Array(5)].map((_, i) => (
                                  <Ionicons
                                    key={i}
                                    name="star"
                                    size={12}
                                    color={i < review.rating ? colors.semantic.warning : colors.gray[300]}
                                    style={{ marginRight: 2 }}
                                  />
                                ))}
                              </View>
                            </View>
                            
                            <Text style={{
                              fontSize: typography.sizes.xs,
                              color: colors.text.secondary
                            }}>
                              {formatDate(review.created_at)}
                            </Text>
                          </View>
                          
                          <Text style={{
                            fontSize: typography.sizes.sm,
                            color: colors.text.secondary,
                            lineHeight: 20
                          }}>
                            {review.comment}
                          </Text>
                          
                          {review.tags && review.tags.length > 0 && (
                            <View style={{
                              flexDirection: 'row',
                              flexWrap: 'wrap',
                              marginTop: spacing.sm,
                              gap: spacing.xs
                            }}>
                              {review.tags.map((tag, index) => (
                                <View key={index} style={{
                                  backgroundColor: colors.primary.main + '20',
                                  paddingHorizontal: spacing.sm,
                                  paddingVertical: 2,
                                  borderRadius: 4
                                }}>
                                  <Text style={{
                                    fontSize: typography.sizes.xs,
                                    color: colors.primary.main,
                                    fontWeight: typography.weights.medium
                                  }}>
                                    {tag}
                                  </Text>
                                </View>
                              ))}
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={{ alignItems: 'center', paddingVertical: spacing['2xl'] }}>
                      <Ionicons name="star-outline" size={48} color={colors.gray[400]} />
                      <Text style={{
                        fontSize: typography.sizes.lg,
                        fontWeight: typography.weights.semibold,
                        color: colors.text.primary,
                        marginTop: spacing.md,
                        marginBottom: spacing.sm
                      }}>
                        No reviews yet
                      </Text>
                      <Text style={{
                        fontSize: typography.sizes.base,
                        color: colors.text.secondary,
                        textAlign: 'center'
                      }}>
                        This host hasn't received any reviews yet.
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}


