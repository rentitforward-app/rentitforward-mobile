// Temporarily simplified for quick deployment
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface ReviewFormProps {
  listingId?: string;
  onSubmit?: (review: any) => void;
  onCancel?: () => void;
}

export default function ReviewForm({ listingId, onSubmit, onCancel }: ReviewFormProps) {
  return (
    <View style={{ 
      backgroundColor: 'white', 
      padding: 20, 
      margin: 16,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3
    }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>
        📝 Review System
      </Text>
      <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 }}>
        Our comprehensive review and rating system is coming soon!
      </Text>
      {onCancel && (
        <TouchableOpacity 
          onPress={onCancel}
          style={{ 
            backgroundColor: '#e5e7eb', 
            padding: 12, 
            borderRadius: 6,
            alignItems: 'center'
          }}
        >
          <Text style={{ color: '#374151', fontWeight: '600' }}>Close</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}