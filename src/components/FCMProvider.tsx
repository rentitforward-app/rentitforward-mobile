import React, { useEffect, useRef, createContext, useContext, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuth } from './AuthProvider';
import { getFCMService, FCMService } from '../lib/fcm';

interface FCMContextType {
  service: FCMService;
  isInitialized: boolean;
  hasPermission: boolean;
  isEnabled: boolean;
  badgeCount: number;
  requestPermission: () => Promise<boolean>;
  enableNotifications: () => Promise<boolean>;
  disableNotifications: () => Promise<void>;
  clearNotifications: () => Promise<void>;
  setBadgeCount: (count: number) => Promise<void>;
  setNotificationPreferences: (preferences: {
    booking_notifications?: boolean;
    message_notifications?: boolean;
    payment_notifications?: boolean;
    review_notifications?: boolean;
    system_notifications?: boolean;
    marketing_notifications?: boolean;
  }) => Promise<void>;
  getNotificationPreferences: () => Promise<{
    booking_notifications: boolean;
    message_notifications: boolean;
    payment_notifications: boolean;
    review_notifications: boolean;
    system_notifications: boolean;
    marketing_notifications: boolean;
  }>;
}

const FCMContext = createContext<FCMContextType | null>(null);

interface FCMProviderProps {
  children: React.ReactNode;
  onReady?: () => void;
}

export function FCMProvider({ children, onReady }: FCMProviderProps) {
  const { user } = useAuth();
  const hasInitialized = useRef(false);
  const fcmService = getFCMService();
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [badgeCount, setBadgeCountState] = useState(0);

  // Initialize FCM service
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initializeFCM = async () => {
      try {
        await fcmService.initialize();
        setIsInitialized(true);
        
        // Check initial permission and enabled status
        const [permission, enabled, count] = await Promise.all([
          fcmService.getPermission(),
          fcmService.isEnabled(),
          fcmService.getBadgeCount(),
        ]);
        
        setHasPermission(permission);
        setIsEnabled(enabled);
        setBadgeCountState(count);
        
        console.log('FCM initialized:', { permission, enabled, count });
        
        // Notify that FCM is ready
        onReady?.();
      } catch (error) {
        console.error('Failed to initialize FCM:', error);
        // Notify that FCM is ready even on error (don't block app initialization)
        onReady?.();
      }
    };

    initializeFCM();
  }, [fcmService]);

  // Handle user authentication changes
  useEffect(() => {
    if (!isInitialized) return;

    const handleUserChange = async () => {
      if (user?.id) {
        try {
          // Set external user ID when user logs in
          await fcmService.setExternalUserId(user.id);
          console.log('FCM user ID set:', user.id);
        } catch (error) {
          console.error('Failed to set FCM external user ID:', error);
        }
      } else {
        try {
          // Remove external user ID when user logs out
          await fcmService.removeExternalUserId();
          console.log('FCM user ID removed');
        } catch (error) {
          console.error('Failed to remove FCM external user ID:', error);
        }
      }
    };

    handleUserChange();
  }, [user, isInitialized, fcmService]);

  // Handle app state changes to update badge count
  useEffect(() => {
    if (!isInitialized) return;

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // Update badge count when app becomes active
        try {
          const count = await fcmService.getBadgeCount();
          setBadgeCountState(count);
        } catch (error) {
          console.error('Failed to update badge count:', error);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [isInitialized, fcmService]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      fcmService.cleanup();
    };
  }, [fcmService]);

  const requestPermission = async (): Promise<boolean> => {
    try {
      const granted = await fcmService.requestPermission();
      setHasPermission(granted);
      
      if (granted) {
        const enabled = await fcmService.isEnabled();
        setIsEnabled(enabled);
      }
      
      return granted;
    } catch (error) {
      console.error('Failed to request FCM permission:', error);
      return false;
    }
  };

  const enableNotifications = async (): Promise<boolean> => {
    try {
      // First request permission if not already granted
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          return false;
        }
      }
      
      // Check if already enabled
      const enabled = await fcmService.isEnabled();
      setIsEnabled(enabled);
      
      return enabled;
    } catch (error) {
      console.error('Failed to enable FCM notifications:', error);
      return false;
    }
  };

  const disableNotifications = async (): Promise<void> => {
    try {
      // Clear all notifications and reset badge
      await fcmService.clearNotifications();
      setBadgeCountState(0);
      
      // Note: We can't actually disable FCM tokens, but we can clear local state
      // The backend should handle not sending notifications based on user preferences
      setIsEnabled(false);
    } catch (error) {
      console.error('Failed to disable FCM notifications:', error);
    }
  };

  const clearNotifications = async (): Promise<void> => {
    try {
      await fcmService.clearNotifications();
      setBadgeCountState(0);
    } catch (error) {
      console.error('Failed to clear FCM notifications:', error);
    }
  };

  const setBadgeCount = async (count: number): Promise<void> => {
    try {
      await fcmService.setBadgeCount(count);
      setBadgeCountState(count);
    } catch (error) {
      console.error('Failed to set FCM badge count:', error);
    }
  };

  const setNotificationPreferences = async (preferences: {
    booking_notifications?: boolean;
    message_notifications?: boolean;
    payment_notifications?: boolean;
    review_notifications?: boolean;
    system_notifications?: boolean;
    marketing_notifications?: boolean;
  }): Promise<void> => {
    try {
      await fcmService.setNotificationPreferences(preferences);
    } catch (error) {
      console.error('Failed to set FCM notification preferences:', error);
      throw error;
    }
  };

  const getNotificationPreferences = async () => {
    try {
      return await fcmService.getNotificationPreferences();
    } catch (error) {
      console.error('Failed to get FCM notification preferences:', error);
      // Return default preferences on error
      return {
        booking_notifications: true,
        message_notifications: true,
        payment_notifications: true,
        review_notifications: true,
        system_notifications: true,
        marketing_notifications: false,
      };
    }
  };

  const contextValue: FCMContextType = {
    service: fcmService,
    isInitialized,
    hasPermission,
    isEnabled,
    badgeCount,
    requestPermission,
    enableNotifications,
    disableNotifications,
    clearNotifications,
    setBadgeCount,
    setNotificationPreferences,
    getNotificationPreferences,
  };

  return (
    <FCMContext.Provider value={contextValue}>
      {children}
    </FCMContext.Provider>
  );
}

// Hook for accessing FCM functionality
export function useFCM(): FCMContextType {
  const context = useContext(FCMContext);
  if (!context) {
    throw new Error('useFCM must be used within a FCMProvider');
  }
  return context;
}

// Custom hook for notification permission management
export function useNotificationPermission() {
  const { 
    hasPermission, 
    isEnabled, 
    isInitialized,
    enableNotifications, 
    disableNotifications 
  } = useFCM();
  
  const [loading, setLoading] = useState(false);

  const enable = async (): Promise<boolean> => {
    try {
      setLoading(true);
      const success = await enableNotifications();
      return success;
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const disable = async (): Promise<void> => {
    try {
      setLoading(true);
      await disableNotifications();
    } catch (error) {
      console.error('Failed to disable notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    permission: hasPermission,
    enabled: isEnabled,
    loading: loading || !isInitialized,
    enable,
    disable,
  };
}

// Custom hook for badge management
export function useNotificationBadge() {
  const { badgeCount, setBadgeCount, clearNotifications } = useFCM();

  const increment = async (count: number = 1): Promise<void> => {
    await setBadgeCount(badgeCount + count);
  };

  const decrement = async (count: number = 1): Promise<void> => {
    const newCount = Math.max(0, badgeCount - count);
    await setBadgeCount(newCount);
  };

  const clear = async (): Promise<void> => {
    await clearNotifications();
  };

  return {
    count: badgeCount,
    increment,
    decrement,
    clear,
    setBadgeCount,
  };
}

// Custom hook for notification preferences
export function useNotificationPreferences() {
  const { setNotificationPreferences, getNotificationPreferences } = useFCM();
  const [preferences, setPreferencesState] = useState({
    booking_notifications: true,
    message_notifications: true,
    payment_notifications: true,
    review_notifications: true,
    system_notifications: true,
    marketing_notifications: false,
  });
  const [loading, setLoading] = useState(true);

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const prefs = await getNotificationPreferences();
        setPreferencesState(prefs);
      } catch (error) {
        console.error('Failed to load notification preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [getNotificationPreferences]);

  const updatePreferences = async (
    newPreferences: Partial<typeof preferences>
  ): Promise<void> => {
    try {
      setLoading(true);
      
      const updatedPreferences = { ...preferences, ...newPreferences };
      await setNotificationPreferences(updatedPreferences);
      setPreferencesState(updatedPreferences);
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (
    key: keyof typeof preferences,
    value: boolean
  ): Promise<void> => {
    await updatePreferences({ [key]: value });
  };

  return {
    preferences,
    loading,
    updatePreferences,
    updatePreference,
  };
}
