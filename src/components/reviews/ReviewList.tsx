import React from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { colors, spacing, typography } from '../../lib/design-system';
import ReviewCard from './ReviewCard';

interface ReviewListProps {
  reviews?: any[];
  loading?: boolean;
  onLoadMore?: () => void;
}

export default function ReviewList({ reviews = [], loading, onLoadMore }: ReviewListProps) {
  const renderEmptyState = () => (
    <View style={{ 
      backgroundColor: colors.gray[50], 
      padding: spacing.xl, 
      margin: spacing.md,
      borderRadius: 12,
      alignItems: 'center'
    }}>
      <Text style={{ 
        fontSize: typography.sizes.lg, 
        fontWeight: typography.weights.semibold,
        marginBottom: spacing.sm,
        color: colors.text.primary
      }}>
        No Reviews Yet
      </Text>
      <Text style={{ 
        fontSize: typography.sizes.base, 
        color: colors.text.secondary, 
        textAlign: 'center',
        lineHeight: 22
      }}>
        This user hasn't received any reviews yet. Be the first to share your experience!
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      padding: spacing.xl
    }}>
      <ActivityIndicator size="large" color={colors.primary.main} />
      <Text style={{
        marginTop: spacing.md,
        fontSize: typography.sizes.base,
        color: colors.text.secondary
      }}>
        Loading reviews...
      </Text>
    </View>
  );

  if (loading) {
    return renderLoadingState();
  }

  if (reviews.length === 0) {
    return renderEmptyState();
  }

  return (
    <FlatList
      data={reviews}
      renderItem={({ item }) => (
        <ReviewCard 
          review={item}
          onPress={() => {
            // Optional: Handle review card press
            console.log('Review pressed:', item.id);
          }}
        />
      )}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: spacing.md }}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.1}
    />
  );
}