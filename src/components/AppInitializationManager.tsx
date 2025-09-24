import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { FCMProvider } from './FCMProvider';
import { AuthProvider } from './AuthProvider';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/query-client';
import { initSentry } from '../lib/sentry';

interface InitializationState {
  authReady: boolean;
  fcmReady: boolean;
  sentryReady: boolean;
  queryClientReady: boolean;
  minDurationElapsed: boolean;
}

interface AppInitializationContextType {
  isAppReady: boolean;
  initializationState: InitializationState;
}

const AppInitializationContext = createContext<AppInitializationContextType | undefined>(undefined);

export function useAppInitialization() {
  const context = useContext(AppInitializationContext);
  if (context === undefined) {
    throw new Error('useAppInitialization must be used within an AppInitializationProvider');
  }
  return context;
}

interface AppInitializationProviderProps {
  children: React.ReactNode;
}

export function AppInitializationProvider({ children }: AppInitializationProviderProps) {
  const [initializationState, setInitializationState] = useState<InitializationState>({
    authReady: false,
    fcmReady: false,
    sentryReady: false,
    queryClientReady: false,
    minDurationElapsed: false,
  });

  // Initialize Sentry early
  useEffect(() => {
    try {
      initSentry();
      setInitializationState(prev => ({ ...prev, sentryReady: true }));
      console.log('Sentry initialized');
    } catch (error) {
      console.warn('Failed to initialize Sentry:', error);
      // Don't block app initialization if Sentry fails
      setInitializationState(prev => ({ ...prev, sentryReady: true }));
    }
  }, []);

  // Mark query client as ready immediately (it's synchronous)
  useEffect(() => {
    setInitializationState(prev => ({ ...prev, queryClientReady: true }));
  }, []);

  // Set minimum duration timer
  useEffect(() => {
    const minDuration = __DEV__ ? 1000 : Platform.OS === 'ios' ? 2500 : 2000;
    
    const timer = setTimeout(() => {
      setInitializationState(prev => ({ ...prev, minDurationElapsed: true }));
      console.log('Minimum initialization duration elapsed');
    }, minDuration);

    return () => clearTimeout(timer);
  }, []);

  // Callback to mark auth as ready
  const onAuthReady = () => {
    setInitializationState(prev => ({ ...prev, authReady: true }));
    console.log('Auth initialization complete');
  };

  // Callback to mark FCM as ready
  const onFCMReady = () => {
    setInitializationState(prev => ({ ...prev, fcmReady: true }));
    console.log('FCM initialization complete');
  };

  // Calculate if app is ready
  const isAppReady = initializationState.authReady && 
                    initializationState.fcmReady && 
                    initializationState.sentryReady && 
                    initializationState.queryClientReady && 
                    initializationState.minDurationElapsed;

  console.log('App initialization state:', {
    ...initializationState,
    isAppReady,
    platform: Platform.OS,
    isDev: __DEV__,
  });

  const contextValue: AppInitializationContextType = {
    isAppReady,
    initializationState,
  };

  return (
    <AppInitializationContext.Provider value={contextValue}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider onReady={onAuthReady}>
          <FCMProvider onReady={onFCMReady}>
            {children}
          </FCMProvider>
        </AuthProvider>
      </QueryClientProvider>
    </AppInitializationContext.Provider>
  );
}
