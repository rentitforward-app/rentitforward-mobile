import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Platform } from 'react-native';
import { SplashScreen } from 'expo-router';

interface SplashScreenManagerProps {
  isReady: boolean;
  children: React.ReactNode;
}

export function SplashScreenManager({ isReady, children }: SplashScreenManagerProps) {
  const [appIsReady, setAppIsReady] = useState(false);
  const [splashHidden, setSplashHidden] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (isReady && !appIsReady) {
      setAppIsReady(true);
      
      // Hide splash screen with proper error handling and minimum duration
      const hideSplash = async () => {
        try {
          // Calculate minimum splash duration based on platform and build type
          const minDuration = __DEV__ ? 500 : Platform.OS === 'ios' ? 2000 : 1500;
          const elapsed = Date.now() - startTime;
          const remainingDelay = Math.max(0, minDuration - elapsed);
          
          console.log(`Splash screen timing: elapsed=${elapsed}ms, remaining=${remainingDelay}ms`);
          
          // Wait for minimum duration
          if (remainingDelay > 0) {
            await new Promise(resolve => setTimeout(resolve, remainingDelay));
          }
          
          await SplashScreen.hideAsync();
          setSplashHidden(true);
          
          console.log('Splash screen hidden successfully');
        } catch (error) {
          console.warn('Failed to hide splash screen:', error);
          // Force hide after timeout
          setTimeout(() => setSplashHidden(true), 2000);
        }
      };

      hideSplash();
    }
  }, [isReady, appIsReady, startTime]);

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
