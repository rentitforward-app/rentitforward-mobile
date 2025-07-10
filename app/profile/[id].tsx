import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../src/stores/auth';
import { supabase } from '../../src/lib/supabase';

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
  verification_status: 'unverified' | 'pending' | 'verified';
  location?: string;
  member_since: string;
  response_rate?: number;
  response_time_hours?: number;
  total_bookings: number;
  successful_bookings: number;
  rating_as_renter: number;
  rating_as_owner: number;
  reviews_count: number;
}

interface UserListing {
  id: string;
  title: string;
  daily_rate: number;
  location: string;
  status: string;
  created_at: string;
}

interface UserReview {
  id: string;
  reviewer_id: string;
  rating: number;
  comment: string;
  review_type: 'renter' | 'owner';
  created_at: string;
  booking_id: string;
  reviewer: {
    first_name: string;
    last_name: string;
  };
}

export default function UserProfileScreen() {
  const { id: userId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews'>('listings');

  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;

      // Add calculated fields (in a real app, these would be computed in the database)
      const profileData: UserProfile = {
        ...data,
        total_bookings: Math.floor(Math.random() * 50) + 5,
        successful_bookings: Math.floor(Math.random() * 45) + 3,
        rating_as_renter: Math.random() * 1.5 + 3.5,
        rating_as_owner: Math.random() * 1.5 + 3.5,
        reviews_count: Math.floor(Math.random() * 30) + 3,
        response_rate: Math.random() * 20 + 80,
        response_time_hours: Math.floor(Math.random() * 12) + 1,
      };

      return profileData;
    },
    enabled: !!userId,
  });

  // Fetch user listings
  const { data: listings = [], isLoading: listingsLoading } = useQuery({
    queryKey: ['user-listings', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('id, title, daily_rate, location, status, created_at')
        .eq('owner_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as UserListing[];
    },
    enabled: !!userId,
  });

  // Fetch user reviews (simulated)
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['user-reviews', userId],
    queryFn: async () => {
      // In a real app, you'd have a reviews table
      // For now, return simulated reviews
      const simulatedReviews: UserReview[] = [
        {
          id: '1',
          reviewer_id: 'reviewer-1',
          rating: 5,
          comment: 'Excellent communication and the item was exactly as described. Highly recommended!',
          review_type: 'owner',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          booking_id: 'booking-1',
          reviewer: { first_name: 'Sarah', last_name: 'Johnson' },
        },
        {
          id: '2',
          reviewer_id: 'reviewer-2',
          rating: 4,
          comment: 'Great renter, took good care of my equipment and returned it on time.',
          review_type: 'renter',
          created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          booking_id: 'booking-2',
          reviewer: { first_name: 'Michael', last_name: 'Chen' },
        },
        {
          id: '3',
          reviewer_id: 'reviewer-3',
          rating: 5,
          comment: 'Very responsive and helpful throughout the rental process.',
          review_type: 'owner',
          created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
          booking_id: 'booking-3',
          reviewer: { first_name: 'Emma', last_name: 'Wilson' },
        },
      ];

      return simulatedReviews;
    },
    enabled: !!userId && activeTab === 'reviews',
  });

  if (profileLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Profile not found</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isOwnProfile = currentUser?.id === userId;

  // Format member since date
  const formatMemberSince = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      month: 'long',
      year: 'numeric',
    });
  };

  // Get verification badge
  const getVerificationBadge = () => {
    switch (profile.verification_status) {
      case 'verified':
        return { text: '✓ Verified', color: '#10b981', backgroundColor: '#d1fae5' };
      case 'pending':
        return { text: '⏳ Pending', color: '#f59e0b', backgroundColor: '#fef3c7' };
      default:
        return { text: '❌ Unverified', color: '#ef4444', backgroundColor: '#fee2e2' };
    }
  };

  const verificationBadge = getVerificationBadge();

  // Handle contact
  const handleContact = () => {
    if (profile.phone) {
      Linking.openURL(`tel:${profile.phone}`);
    } else {
      Alert.alert('Contact Info', 'No phone number available for this user.');
    }
  };

  // Handle message
  const handleMessage = () => {
    Alert.alert('Message User', 'Messaging is available during booking conversations.');
  };

  // Handle share profile
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${profile.first_name} ${profile.last_name}'s profile on Rent It Forward!`,
        title: 'User Profile',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  // Handle report user
  const handleReport = () => {
    Alert.alert(
      'Report User',
      'Are you sure you want to report this user for inappropriate behavior?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Report', style: 'destructive', onPress: () => {
          Alert.alert('Reported', 'Thank you for your report. We will review it shortly.');
        }},
      ]
    );
  };

  // Render star rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Text key={i} style={styles.star}>★</Text>);
    }
    
    if (hasHalfStar) {
      stars.push(<Text key="half" style={styles.star}>☆</Text>);
    }
    
    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Text key={`empty-${i}`} style={styles.emptyStar}>☆</Text>);
    }

    return <View style={styles.starsContainer}>{stars}</View>;
  };

  // Render listing item
  const renderListing = (listing: UserListing) => (
    <TouchableOpacity
      key={listing.id}
      style={styles.listingCard}
      onPress={() => router.push(`/listing/${listing.id}`)}
    >
      <Text style={styles.listingTitle} numberOfLines={2}>{listing.title}</Text>
      <Text style={styles.listingLocation}>{listing.location}</Text>
      <Text style={styles.listingPrice}>${listing.daily_rate}/day</Text>
    </TouchableOpacity>
  );

  // Render review item
  const renderReview = (review: UserReview) => (
    <View key={review.id} style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewerName}>
          {review.reviewer.first_name} {review.reviewer.last_name}
        </Text>
        <View style={styles.reviewMeta}>
          {renderStars(review.rating)}
          <Text style={styles.reviewDate}>
            {new Date(review.created_at).toLocaleDateString('en-AU')}
          </Text>
        </View>
      </View>
      <Text style={styles.reviewType}>
        {review.review_type === 'owner' ? 'As Owner' : 'As Renter'}
      </Text>
      <Text style={styles.reviewComment}>{review.comment}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>
          
          {!isOwnProfile && (
            <TouchableOpacity style={styles.reportButton} onPress={handleReport}>
              <Text style={styles.reportButtonText}>Report</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile.first_name.charAt(0).toUpperCase()}{profile.last_name.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Basic Info */}
        <View style={styles.basicInfo}>
          <Text style={styles.userName}>
            {profile.first_name} {profile.last_name}
          </Text>
          
          <View style={[styles.verificationBadge, { backgroundColor: verificationBadge.backgroundColor }]}>
            <Text style={[styles.verificationText, { color: verificationBadge.color }]}>
              {verificationBadge.text}
            </Text>
          </View>

          {profile.location && (
            <Text style={styles.userLocation}>📍 {profile.location}</Text>
          )}

          <Text style={styles.memberSince}>
            Member since {formatMemberSince(profile.member_since)}
          </Text>
        </View>

        {/* Bio */}
        {profile.bio && (
          <View style={styles.bioSection}>
            <Text style={styles.bioText}>{profile.bio}</Text>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.total_bookings}</Text>
            <Text style={styles.statLabel}>Total Bookings</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.rating_as_owner.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Owner Rating</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.rating_as_renter.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Renter Rating</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.reviews_count}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
        </View>

        {/* Additional Stats */}
        <View style={styles.additionalStats}>
          <View style={styles.additionalStatItem}>
            <Text style={styles.additionalStatLabel}>Response Rate:</Text>
            <Text style={styles.additionalStatValue}>{profile.response_rate?.toFixed(0)}%</Text>
          </View>
          
          <View style={styles.additionalStatItem}>
            <Text style={styles.additionalStatLabel}>Response Time:</Text>
            <Text style={styles.additionalStatValue}>
              {profile.response_time_hours} hour{profile.response_time_hours === 1 ? '' : 's'}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        {!isOwnProfile && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.messageButton} onPress={handleMessage}>
              <Text style={styles.messageButtonText}>Message</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.callButton} onPress={handleContact}>
              <Text style={styles.callButtonText}>Call</Text>
            </TouchableOpacity>
          </View>
        )}

        {isOwnProfile && (
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => router.push('/profile/edit')}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'listings' && styles.activeTab]}
          onPress={() => setActiveTab('listings')}
        >
          <Text style={[styles.tabText, activeTab === 'listings' && styles.activeTabText]}>
            Listings ({listings.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
          onPress={() => setActiveTab('reviews')}
        >
          <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
            Reviews ({reviews.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === 'listings' && (
          <View style={styles.listingsGrid}>
            {listingsLoading ? (
              <Text style={styles.loadingText}>Loading listings...</Text>
            ) : listings.length > 0 ? (
              listings.map(renderListing)
            ) : (
              <Text style={styles.emptyText}>No active listings</Text>
            )}
          </View>
        )}

        {activeTab === 'reviews' && (
          <View style={styles.reviewsList}>
            {reviewsLoading ? (
              <Text style={styles.loadingText}>Loading reviews...</Text>
            ) : reviews.length > 0 ? (
              reviews.map(renderReview)
            ) : (
              <Text style={styles.emptyText}>No reviews yet</Text>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    marginBottom: 20,
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#44d62c',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  shareButton: {
    padding: 8,
  },
  shareButtonText: {
    fontSize: 16,
    color: '#44d62c',
    fontWeight: '500',
  },
  reportButton: {
    padding: 8,
  },
  reportButtonText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '500',
  },
  profileSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#44d62c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
  },
  basicInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  verificationBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 8,
  },
  verificationText: {
    fontSize: 14,
    fontWeight: '600',
  },
  userLocation: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 14,
    color: '#6b7280',
  },
  bioSection: {
    width: '100%',
    marginBottom: 20,
  },
  bioText: {
    fontSize: 16,
    color: '#111827',
    lineHeight: 24,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#44d62c',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
  additionalStats: {
    width: '100%',
    marginBottom: 20,
  },
  additionalStatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  additionalStatLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  additionalStatValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  messageButton: {
    flex: 1,
    backgroundColor: '#44d62c',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  messageButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  callButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  callButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  editButton: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  tabsContainer: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#44d62c',
  },
  tabText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#44d62c',
    fontWeight: '600',
  },
  tabContent: {
    backgroundColor: '#ffffff',
    minHeight: 200,
  },
  listingsGrid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  listingCard: {
    width: '48%',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  listingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  listingLocation: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  listingPrice: {
    fontSize: 14,
    color: '#44d62c',
    fontWeight: '600',
  },
  reviewsList: {
    padding: 16,
  },
  reviewCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  reviewMeta: {
    alignItems: 'flex-end',
  },
  reviewDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  reviewType: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  reviewComment: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 16,
    color: '#fbbf24',
  },
  emptyStar: {
    fontSize: 16,
    color: '#d1d5db',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    padding: 40,
  },
  button: {
    backgroundColor: '#44d62c',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
}); 