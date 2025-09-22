/**
 * Notification Badge Hook
 * 
 * Manages notification badge count based on last viewed timestamp
 * Syncs with web backend notification system
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mobileNotificationApi } from '../lib/notification-api';
import { getFCMService } from '../lib/fcm';

export interface NotificationBadgeState {
  count: number;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export interface NotificationBadgeActions {
  refreshCount: () => Promise<void>;
  markAsViewed: () => Promise<void>;
  clearBadge: () => Promise<void>;
  incrementCount: () => void;
  setCount: (count: number) => void;
}

export interface UseNotificationBadgeOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  syncWithFCM?: boolean;
}

export function useNotificationBadge(options: UseNotificationBadgeOptions = {}) {
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    syncWithFCM = true,
  } = options;

  const [state, setState] = useState<NotificationBadgeState>({
    count: 0,
    isLoading: false,
    error: null,
    lastUpdated: null,
  });

  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const fcmService = getFCMService();

  /**
   * Update state helper
   */
  const updateState = useCallback((updates: Partial<NotificationBadgeState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Fetch unread count from backend
   */
  const fetchUnreadCount = useCallback(async (): Promise<number> => {
    try {
      const result = await mobileNotificationApi.getUnreadNotificationCount();
      
      if (result.success) {
        return result.unreadCount || 0;
      } else {
        console.warn('Failed to fetch unread count:', result.error);
        return 0;
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }, []);

  /**
   * Refresh notification count
   */
  const refreshCount = useCallback(async () => {
    updateState({ isLoading: true, error: null });

    try {
      const count = await fetchUnreadCount();
      
      updateState({
        count,
        isLoading: false,
        lastUpdated: new Date(),
      });

      // Sync with FCM badge if enabled
      if (syncWithFCM) {
        await fcmService.setBadgeCount(count);
      }

      // Store locally for offline access
      await AsyncStorage.setItem('notification_badge_count', count.toString());
      await AsyncStorage.setItem('notification_badge_last_updated', new Date().toISOString());

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to refresh notification count:', error);
      
      updateState({
        isLoading: false,
        error: errorMessage,
      });

      // Try to load from local storage as fallback
      try {
        const storedCount = await AsyncStorage.getItem('notification_badge_count');
        if (storedCount) {
          updateState({ count: parseInt(storedCount, 10) });
        }
      } catch (storageError) {
        console.error('Failed to load count from storage:', storageError);
      }
    }
  }, [fetchUnreadCount, syncWithFCM, fcmService, updateState]);

  /**
   * Mark notifications as viewed and reset count
   */
  const markAsViewed = useCallback(async () => {
    try {
      updateState({ isLoading: true });

      // Call backend API to update last viewed timestamp
      const result = await mobileNotificationApi.markNotificationsAsViewed();
      
      if (result.success) {
        updateState({
          count: 0,
          isLoading: false,
          lastUpdated: new Date(),
        });

        // Sync with FCM badge
        if (syncWithFCM) {
          await fcmService.setBadgeCount(0);
        }

        // Update local storage
        await AsyncStorage.setItem('notification_badge_count', '0');
        await AsyncStorage.setItem('notification_badge_last_viewed', new Date().toISOString());
      } else {
        console.warn('Failed to mark notifications as viewed:', result.error);
        updateState({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to mark notifications as viewed:', error);
      updateState({ 
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [syncWithFCM, fcmService, updateState]);

  /**
   * Clear badge count (local only)
   */
  const clearBadge = useCallback(async () => {
    updateState({ count: 0 });
    
    if (syncWithFCM) {
      await fcmService.setBadgeCount(0);
    }
    
    await AsyncStorage.setItem('notification_badge_count', '0');
  }, [syncWithFCM, fcmService, updateState]);

  /**
   * Increment badge count (for real-time updates)
   */
  const incrementCount = useCallback(() => {
    setState(prev => {
      const newCount = prev.count + 1;
      
      // Sync with FCM badge
      if (syncWithFCM) {
        fcmService.setBadgeCount(newCount).catch(console.error);
      }
      
      // Update local storage
      AsyncStorage.setItem('notification_badge_count', newCount.toString()).catch(console.error);
      
      return {
        ...prev,
        count: newCount,
        lastUpdated: new Date(),
      };
    });
  }, [syncWithFCM, fcmService]);

  /**
   * Set badge count directly
   */
  const setCount = useCallback((count: number) => {
    updateState({ count, lastUpdated: new Date() });
    
    if (syncWithFCM) {
      fcmService.setBadgeCount(count).catch(console.error);
    }
    
    AsyncStorage.setItem('notification_badge_count', count.toString()).catch(console.error);
  }, [syncWithFCM, fcmService, updateState]);

  /**
   * Handle app state changes
   */
  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
      // App came to foreground, refresh count
      refreshCount();
    }
    appStateRef.current = nextAppState;
  }, [refreshCount]);

  /**
   * Set up auto-refresh interval
   */
  const setupAutoRefresh = useCallback(() => {
    if (!autoRefresh) return;

    refreshIntervalRef.current = setInterval(() => {
      if (AppState.currentState === 'active') {
        refreshCount();
      }
    }, refreshInterval);
  }, [autoRefresh, refreshInterval, refreshCount]);

  /**
   * Clean up interval
   */
  const cleanupAutoRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  /**
   * Initialize badge count from storage
   */
  const initializeFromStorage = useCallback(async () => {
    try {
      const [storedCount, lastUpdated] = await Promise.all([
        AsyncStorage.getItem('notification_badge_count'),
        AsyncStorage.getItem('notification_badge_last_updated'),
      ]);

      if (storedCount) {
        updateState({
          count: parseInt(storedCount, 10),
          lastUpdated: lastUpdated ? new Date(lastUpdated) : null,
        });
      }
    } catch (error) {
      console.error('Failed to initialize badge count from storage:', error);
    }
  }, [updateState]);

  // Initialize on mount
  useEffect(() => {
    initializeFromStorage().then(() => {
      // Refresh count after loading from storage
      refreshCount();
    });

    // Set up app state listener
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    // Set up auto-refresh
    setupAutoRefresh();

    return () => {
      appStateSubscription?.remove();
      cleanupAutoRefresh();
    };
  }, [initializeFromStorage, refreshCount, handleAppStateChange, setupAutoRefresh, cleanupAutoRefresh]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanupAutoRefresh();
    };
  }, [cleanupAutoRefresh]);

  return {
    // State
    count: state.count,
    isLoading: state.isLoading,
    error: state.error,
    lastUpdated: state.lastUpdated,

    // Actions
    refreshCount,
    markAsViewed,
    clearBadge,
    incrementCount,
    setCount,
  };
}

/**
 * Hook for simple badge count (read-only)
 */
export function useNotificationCount() {
  const { count, isLoading, error } = useNotificationBadge({
    autoRefresh: true,
    syncWithFCM: false, // Don't sync to avoid conflicts
  });

  return { count, isLoading, error };
}

/**
 * Hook for notification actions only
 */
export function useNotificationActions() {
  const { markAsViewed, clearBadge, incrementCount, setCount, refreshCount } = useNotificationBadge({
    autoRefresh: false, // Don't auto-refresh for actions-only hook
  });

  return {
    markAsViewed,
    clearBadge,
    incrementCount,
    setCount,
    refreshCount,
  };
}
