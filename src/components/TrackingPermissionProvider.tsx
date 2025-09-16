import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useTrackingPermission } from '../hooks/useTrackingPermission';

interface TrackingPermissionContextType {
  canTrack: boolean;
  isLoading: boolean;
  requestPermission: () => Promise<boolean>;
}

const TrackingPermissionContext = createContext<TrackingPermissionContextType | undefined>(undefined);

export function useTrackingPermissionContext() {
  const context = useContext(TrackingPermissionContext);
  if (!context) {
    throw new Error('useTrackingPermissionContext must be used within TrackingPermissionProvider');
  }
  return context;
}

interface TrackingPermissionProviderProps {
  children: React.ReactNode;
}

export function TrackingPermissionProvider({ children }: TrackingPermissionProviderProps) {
  const { canTrack, isLoading, requestTrackingPermission } = useTrackingPermission();
  const [hasRequestedPermission, setHasRequestedPermission] = useState(false);

  useEffect(() => {
    // Only request permission on iOS and if we haven't requested it yet
    if (Platform.OS === 'ios' && !hasRequestedPermission && !isLoading) {
      // Request permission after a short delay to ensure app is fully loaded
      const timer = setTimeout(() => {
        requestTrackingPermission().then(() => {
          setHasRequestedPermission(true);
        });
      }, 2000); // 2 second delay

      return () => clearTimeout(timer);
    }
  }, [isLoading, hasRequestedPermission, requestTrackingPermission]);

  const requestPermission = async (): Promise<boolean> => {
    const result = await requestTrackingPermission();
    setHasRequestedPermission(true);
    return result;
  };

  return (
    <TrackingPermissionContext.Provider
      value={{
        canTrack,
        isLoading,
        requestPermission,
      }}
    >
      {children}
    </TrackingPermissionContext.Provider>
  );
}
