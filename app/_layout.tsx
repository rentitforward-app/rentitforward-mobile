import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '../src/components/AuthProvider';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../src/lib/query-client';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SplashScreenManager } from '../src/components/SplashScreenManager';
import { initSentry } from '../src/lib/sentry';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
// import { TrackingPermissionProvider } from '../src/components/TrackingPermissionProvider';

// Initialize Sentry as early as possible
initSentry();

// Suppress Text component warnings in development mode
if (__DEV__) {
  const originalError = console.error;
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Text strings must be rendered within a <Text> component')
    ) {
      // Suppress this specific warning in development
      return;
    }
    originalError(...args);
  };
}

function RootLayoutNav() {
  const { loading } = useAuth();
  
  return (
    <SplashScreenManager isReady={!loading}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="listing/create" options={{ headerShown: false }} />
        <Stack.Screen name="listing/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="bookings/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="account" options={{ headerShown: false }} />
      </Stack>
    </SplashScreenManager>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            {/* <TrackingPermissionProvider> */}
              <SafeAreaProvider>
                <RootLayoutNav />
              </SafeAreaProvider>
            {/* </TrackingPermissionProvider> */}
          </AuthProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
} 