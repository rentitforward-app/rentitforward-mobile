import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as TrackingTransparency from 'expo-tracking-transparency';

export interface TrackingPermissionState {
  status: TrackingTransparency.TrackingStatus;
  canTrack: boolean;
  isLoading: boolean;
}

export function useTrackingPermission() {
  const [permissionState, setPermissionState] = useState<TrackingPermissionState>({
    status: TrackingTransparency.TrackingStatus.denied,
    canTrack: false,
    isLoading: true,
  });

  useEffect(() => {
    checkTrackingPermission();
  }, []);

  const checkTrackingPermission = async () => {
    if (Platform.OS !== 'ios') {
      setPermissionState({
        status: TrackingTransparency.TrackingStatus.authorized,
        canTrack: true,
        isLoading: false,
      });
      return;
    }

    try {
      const { status } = await TrackingTransparency.getTrackingPermissionsAsync();
      setPermissionState({
        status,
        canTrack: status === TrackingTransparency.TrackingStatus.authorized,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error checking tracking permission:', error);
      setPermissionState({
        status: TrackingTransparency.TrackingStatus.denied,
        canTrack: false,
        isLoading: false,
      });
    }
  };

  const requestTrackingPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'ios') {
      return true;
    }

    try {
      const { status } = await TrackingTransparency.requestTrackingPermissionsAsync();
      const canTrack = status === TrackingTransparency.TrackingStatus.authorized;
      
      setPermissionState({
        status,
        canTrack,
        isLoading: false,
      });

      return canTrack;
    } catch (error) {
      console.error('Error requesting tracking permission:', error);
      setPermissionState({
        status: TrackingTransparency.TrackingStatus.denied,
        canTrack: false,
        isLoading: false,
      });
      return false;
    }
  };

  return {
    ...permissionState,
    requestTrackingPermission,
    checkTrackingPermission,
  };
}
