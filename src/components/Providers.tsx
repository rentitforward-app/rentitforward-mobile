import React, { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { View } from 'react-native';
import { queryClient } from '@/lib/query-client';
import { useAuthStore } from '@/stores/auth';

interface ProvidersProps {
  children: React.ReactNode;
}

// Auth initializer component
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { initialize, isInitialized } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Don't render children until auth is initialized
  if (!isInitialized) {
    return null; // Or a loading screen
  }

  return <>{children}</>;
};

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthInitializer>
          <BottomSheetModalProvider>
            <View style={{ flex: 1 }}>
              {children}
            </View>
          </BottomSheetModalProvider>
        </AuthInitializer>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}; 