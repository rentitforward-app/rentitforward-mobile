import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../lib/design-system';

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    type: 'renter_to_owner' | 'owner_to_renter';
    profiles: {
      full_name: string;
      avatar_url: string | null;
    };
  };
  onPress?: () => void;
}

export default function ReviewCard({ review, onPress }: ReviewCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const renderStars = (rating: number) => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={16}
            color={star <= rating ? colors.semantic.warning : colors.gray[300]}
            style={{ marginRight: 2 }}
          />
        ))}
        <Text style={{
          fontSize: typography.sizes.sm,
          color: colors.text.secondary,
          marginLeft: spacing.xs
        }}>
          {rating}/5
        </Text>
      </View>
    );
  };

  return (
    <TouchableOpacity 
      onPress={onPress}
      style={{ 
        backgroundColor: 'white', 
        padding: spacing.md, 
        marginVertical: spacing.xs,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2
      }}
    >
      {/* Header with reviewer info and rating */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: spacing.sm 
      }}>
        <Image
          source={{ 
            uri: review.profiles.avatar_url || 'https://via.placeholder.com/40x40.png?text=👤' 
          }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            marginRight: spacing.sm
          }}
        />
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: typography.sizes.base,
            fontWeight: typography.weights.semibold,
            color: colors.text.primary
          }}>
            {review.profiles.full_name}
          </Text>
          <Text style={{
            fontSize: typography.sizes.xs,
            color: colors.text.secondary
          }}>
            {formatDate(review.created_at)}
          </Text>
        </View>
        {renderStars(review.rating)}
      </View>

      {/* Review comment */}
      {review.comment && (
        <Text style={{
          fontSize: typography.sizes.base,
          color: colors.text.primary,
          lineHeight: 22
        }}>
          {review.comment}
        </Text>
      )}
    </TouchableOpacity>
  );
}