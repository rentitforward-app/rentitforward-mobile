// Temporarily simplified for quick deployment
import React from 'react';
import { View, Text } from 'react-native';

interface UserProfileProps {
  userId?: string;
  currentUser?: boolean;
}

export default function GraphQLUserProfile({ userId, currentUser }: UserProfileProps) {
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      padding: 20,
      backgroundColor: '#f9f9f9'
    }}>
      <Text style={{ 
        fontSize: 24, 
        fontWeight: 'bold', 
        textAlign: 'center', 
        color: '#333',
        marginBottom: 10
      }}>
        🚀 Profile Coming Soon
      </Text>
      <Text style={{ 
        fontSize: 16, 
        textAlign: 'center', 
        color: '#666',
        marginBottom: 20
      }}>
        We're building an amazing profile experience for you!
      </Text>
      <Text style={{ 
        fontSize: 14, 
        textAlign: 'center', 
        color: '#999'
      }}>
        {currentUser ? 'Your profile' : `User ${userId}'s profile`} will be available soon.
      </Text>
    </View>
  );
}