import React, { useEffect, useRef, createContext, useContext } from 'react';
import { useAuthStore } from '../stores/auth';
import { getMobileOneSignalService, MobileOneSignalService } from '../lib/onesignal';

interface OneSignalContextType {
  service: MobileOneSignalService;
  requestPermission: () => Promise<boolean>;
  isSubscribed: () => Promise<boolean>;
  optIn: () => Promise<void>;
  optOut: () => Promise<void>;
  clearNotifications: () => Promise<void>;
  setNotificationPreferences: (preferences: {
    booking_notifications?: boolean;
    message_notifications?: boolean;
    payment_notifications?: boolean;
    review_notifications?: boolean;
    system_notifications?: boolean;
    marketing_notifications?: boolean;
  }) => Promise<void>;
}

const OneSignalContext = createContext<OneSignalContextType | null>(null);

interface OneSignalProviderProps {
  children: React.ReactNode;
}

export function OneSignalProvider({ children }: OneSignalProviderProps) {
  const { user } = useAuthStore();
  const hasInitialized = useRef(false);
  const oneSignalService = getMobileOneSignalService();

  useEffect(() => {
    // Only initialize once when the component mounts
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // Initialize OneSignal service
    oneSignalService.initialize().catch((error) => {
      console.error('Failed to initialize OneSignal:', error);
    });
  }, [oneSignalService]);

  useEffect(() => {
    // Set external user ID when user logs in
    if (user?.id) {
      oneSignalService.setExternalUserId(user.id).catch((error) => {
        console.error('Failed to set OneSignal external user ID:', error);
      });

      // Set user tags for segmentation
      oneSignalService.setTags({
        user_type: 'mobile_user',
        user_id: user.id,
        email: user.email || '',
        platform: 'mobile',
      }).catch((error) => {
        console.error('Failed to set OneSignal tags:', error);
      });
    } else {
      // Remove external user ID when user logs out
      oneSignalService.removeExternalUserId().catch((error) => {
        console.error('Failed to remove OneSignal external user ID:', error);
      });
    }
  }, [user, oneSignalService]);

  const contextValue: OneSignalContextType = {
    service: oneSignalService,
    requestPermission: () => oneSignalService.requestPermission(),
    isSubscribed: () => oneSignalService.isSubscribed(),
    optIn: () => oneSignalService.optIn(),
    optOut: () => oneSignalService.optOut(),
    clearNotifications: () => oneSignalService.clearNotifications(),
    setNotificationPreferences: (preferences) => 
      oneSignalService.setNotificationCategories(preferences),
  };

  return (
    <OneSignalContext.Provider value={contextValue}>
      {children}
    </OneSignalContext.Provider>
  );
}

// Hook for accessing OneSignal functionality
export function useOneSignal(): OneSignalContextType {
  const context = useContext(OneSignalContext);
  if (!context) {
    throw new Error('useOneSignal must be used within a OneSignalProvider');
  }
  return context;
}

// Custom hook for notification permission management
export function useNotificationPermission() {
  const { requestPermission, isSubscribed, optIn, optOut } = useOneSignal();
  const [permission, setPermission] = React.useState<boolean>(false);
  const [subscribed, setSubscribed] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);

  // Check initial permission and subscription status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        setLoading(true);
        const [hasPermission, isOptedIn] = await Promise.all([
          requestPermission(), // This also checks current permission
          isSubscribed(),
        ]);
        
        setPermission(hasPermission);
        setSubscribed(isOptedIn);
      } catch (error) {
        console.error('Failed to check notification status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [requestPermission, isSubscribed]);

  const enableNotifications = async (): Promise<boolean> => {
    try {
      setLoading(true);
      
      // First request permission if not already granted
      if (!permission) {
        const granted = await requestPermission();
        setPermission(granted);
        
        if (!granted) {
          return false;
        }
      }
      
      // Then opt in to notifications
      await optIn();
      setSubscribed(true);
      return true;
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const disableNotifications = async (): Promise<void> => {
    try {
      setLoading(true);
      await optOut();
      setSubscribed(false);
    } catch (error) {
      console.error('Failed to disable notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    permission,
    subscribed,
    loading,
    enableNotifications,
    disableNotifications,
  };
} 