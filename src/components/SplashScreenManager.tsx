import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { SplashScreen } from 'expo-router';

interface SplashScreenManagerProps {
  isReady: boolean;
  children: React.ReactNode;
}

export function SplashScreenManager({ isReady, children }: SplashScreenManagerProps) {
  const [appIsReady, setAppIsReady] = useState(false);
  const [splashHidden, setSplashHidden] = useState(false);

  useEffect(() => {
    if (isReady && !appIsReady) {
      setAppIsReady(true);
      
      // Hide splash screen with proper error handling
      const hideSplash = async () => {
        try {
          // Add delay for iOS production builds
          const delay = __DEV__ ? 100 : 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          
          await SplashScreen.hideAsync();
          setSplashHidden(true);
        } catch (error) {
          console.warn('Failed to hide splash screen:', error);
          // Force hide after timeout
          setTimeout(() => setSplashHidden(true), 2000);
        }
      };

      hideSplash();
    }
  }, [isReady, appIsReady]);

  // Show loading screen until splash is properly hidden
  if (!appIsReady || !splashHidden) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#44D62C" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
});
