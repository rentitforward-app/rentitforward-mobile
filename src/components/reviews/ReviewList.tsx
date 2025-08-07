// Temporarily simplified for quick deployment
import React from 'react';
import { View, Text, FlatList } from 'react-native';

interface ReviewListProps {
  reviews?: any[];
  loading?: boolean;
  onLoadMore?: () => void;
}

export default function ReviewList({ reviews = [], loading, onLoadMore }: ReviewListProps) {
  const renderPlaceholder = () => (
    <View style={{ 
      backgroundColor: 'white', 
      padding: 24, 
      margin: 16,
      borderRadius: 8,
      alignItems: 'center'
    }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
        ⭐ Reviews Coming Soon
      </Text>
      <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
        We're building a comprehensive review system with ratings, photos, and detailed feedback.
      </Text>
    </View>
  );

  if (reviews.length === 0) {
    return renderPlaceholder();
  }

  return (
    <FlatList
      data={reviews}
      renderItem={() => renderPlaceholder()}
      keyExtractor={(item, index) => index.toString()}
    />
  );
}