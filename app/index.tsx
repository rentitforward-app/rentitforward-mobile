import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/components/AuthProvider';

export default function IndexScreen() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return; // Wait for auth to load

    if (!user) {
      // User not authenticated, redirect to welcome
      router.replace('/(auth)/welcome');
    } else if (!profile?.phone_number || !profile?.city) {
      // User authenticated but profile incomplete, redirect to onboarding
      router.replace('/(auth)/onboarding');
    } else {
      // User authenticated and profile complete, redirect to main app
      router.replace('/(tabs)');
    }
  }, [user, profile, loading, router]);

  // Show loading spinner while determining auth state
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#16A34A" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
}); 