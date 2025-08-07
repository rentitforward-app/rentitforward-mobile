// Temporarily simplified for quick deployment
import React from 'react';
import { View, Text } from 'react-native';

interface ReviewCardProps {
  review: any;
  onPress?: () => void;
}

export default function ReviewCard({ review, onPress }: ReviewCardProps) {
  return (
    <View style={{ 
      backgroundColor: 'white', 
      padding: 16, 
      marginVertical: 8,
      marginHorizontal: 16,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3
    }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
        Review Feature Coming Soon
      </Text>
      <Text style={{ fontSize: 14, color: '#666' }}>
        Advanced review system with ratings and feedback is being developed.
      </Text>
    </View>
  );
}