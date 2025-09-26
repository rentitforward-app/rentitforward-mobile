import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { SplashScreen } from 'expo-router';

interface SplashScreenManagerProps {
  isReady: boolean;
  children: React.ReactNode;
}

export function SplashScreenManager({ isReady, children }: SplashScreenManagerProps) {
  const [splashHidden, setSplashHidden] = useState(false);

  useEffect(() => {
    if (isReady) {
      // Hide splash screen with a small delay for iOS to prevent loading bar
      const hideSplash = async () => {
        try {
          // Small delay only for iOS production builds to prevent loading bar flash
          const delay = Platform.OS === 'ios' && !__DEV__ ? 800 : 100;
          
          await new Promise(resolve => setTimeout(resolve, delay));
          await SplashScreen.hideAsync();
          setSplashHidden(true);
        } catch (error) {
          console.warn('Failed to hide splash screen:', error);
          // Force hide after timeout
          setTimeout(() => setSplashHidden(true), 1000);
        }
      };

      hideSplash();
    }
  }, [isReady]);

  // Show splash until it's properly hidden
  if (!splashHidden) {
    return null; // Let the native splash screen handle the display
  }

  return <>{children}</>;
}
