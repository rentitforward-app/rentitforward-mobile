import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../src/components/AuthProvider';

const INTRO_SEEN_KEY = '@intro_seen';

export default function IndexScreen() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [introSeen, setIntroSeen] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user has seen intro before
    const checkIntroStatus = async () => {
      try {
        // DEVELOPMENT: Uncomment the line below to reset intro for testing
        // await AsyncStorage.removeItem(INTRO_SEEN_KEY);
        
        // Add timeout for AsyncStorage operations in production
        const storagePromise = AsyncStorage.getItem(INTRO_SEEN_KEY);
        const timeoutPromise = new Promise<string | null>((resolve) => 
          setTimeout(() => resolve(null), 3000)
        );
        
        const seen = await Promise.race([storagePromise, timeoutPromise]);
        setIntroSeen(seen === 'true');
        console.log('Intro seen status:', seen);
      } catch (error) {
        console.error('Error checking intro status:', error);
        setIntroSeen(false); // Default to not seen
      }
    };

    checkIntroStatus();
  }, []);

  useEffect(() => {
    if (loading || introSeen === null) return; // Wait for auth and intro check to complete

    console.log('Routing decision - introSeen:', introSeen, 'user:', !!user, 'profile complete:', !!(profile?.phone_number && profile?.city));

    // User is not authenticated
    if (!user) {
      if (introSeen) {
        // Returning user who has seen intro before - go directly to welcome
        console.log('Returning user signed out - showing welcome screen');
        router.replace('/(auth)/welcome');
      } else {
        // First-time user - show intro slides
        console.log('First-time user - showing intro screen');
        router.replace('/(auth)/intro');
      }
      return;
    }

    // User is authenticated - check profile completion
    if (!profile?.phone_number || !profile?.city) {
      // User authenticated but profile incomplete, redirect to onboarding
      console.log('Navigating to onboarding screen');
      router.replace('/(auth)/onboarding');
    } else {
      // User authenticated and profile complete, redirect to main app
      console.log('Navigating to main tabs');
      router.replace('/(tabs)');
    }
  }, [user, profile, loading, introSeen, router]);

  // Show loading spinner while determining auth state and intro status
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#44D62C" />
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