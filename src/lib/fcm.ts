import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper to detect if running in Expo Go
const isExpoGo = (): boolean => {
  return Constants.appOwnership === 'expo';
};

export interface FCMConfig {
  projectId: string;
  apiKey: string;
  appId: string;
  messagingSenderId: string;
  logLevel?: 'none' | 'error' | 'warn' | 'info' | 'debug';
  requiresUserPrivacyConsent?: boolean;
}

export interface FCMToken {
  token: string;
  platform: 'ios' | 'android' | 'web';
  deviceId: string;
  createdAt: Date;
  isActive: boolean;
}

export interface NotificationData {
  type?: string;
  action_url?: string;
  notification_id?: string;
  booking_id?: string;
  message_id?: string;
  listing_id?: string;
  [key: string]: any;
}

export class FCMService {
  private isInitialized = false;
  private config: FCMConfig;
  private currentToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;

  constructor(config: FCMConfig) {
    this.config = config;
  }

  /**
   * Initialize Firebase Cloud Messaging
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('FCM already initialized');
      return;
    }

    try {
      // Configure notification handling
      await this.configureNotifications();

      // Set up notification listeners
      this.setupNotificationListeners();

      this.isInitialized = true;
      console.log('FCM initialized successfully');

    } catch (error) {
      console.error('Failed to initialize FCM:', error);
      throw error;
    }
  }

  /**
   * Configure notification behavior
   */
  private async configureNotifications(): Promise<void> {
    // Set notification handler for when app is in foreground
    Notifications.setNotificationHandler({
      handleNotification: async (notification) => {
        // Check if we should show the notification in foreground
        const shouldShow = await this.shouldShowInForeground(notification);
        
        // SDK 54 adds shouldShowBanner/shouldShowList on iOS
        return {
          shouldShowAlert: shouldShow,
          shouldPlaySound: shouldShow,
          shouldSetBadge: true,
          // These are ignored on Android but satisfy the updated type
          shouldShowBanner: shouldShow,
          shouldShowList: shouldShow,
        } as Notifications.NotificationBehavior;
      },
    });

    // Configure notification categories for iOS
    if (Platform.OS === 'ios') {
      await this.configureNotificationCategories();
    }

    // Configure notification channels for Android
    if (Platform.OS === 'android') {
      await this.configureNotificationChannels();
    }
  }

  /**
   * Configure notification categories for iOS
   */
  private async configureNotificationCategories(): Promise<void> {
    await Notifications.setNotificationCategoryAsync('booking', [
      {
        identifier: 'view_booking',
        buttonTitle: 'View Booking',
        options: { opensAppToForeground: true },
      },
      {
        identifier: 'respond_booking',
        buttonTitle: 'Respond',
        options: { opensAppToForeground: true },
      },
    ]);

    await Notifications.setNotificationCategoryAsync('message', [
      {
        identifier: 'reply_message',
        buttonTitle: 'Reply',
        options: { opensAppToForeground: true },
      },
      {
        identifier: 'view_conversation',
        buttonTitle: 'View',
        options: { opensAppToForeground: true },
      },
    ]);

    await Notifications.setNotificationCategoryAsync('payment', [
      {
        identifier: 'view_payment',
        buttonTitle: 'View Details',
        options: { opensAppToForeground: true },
      },
    ]);
  }

  /**
   * Configure notification channels for Android
   */
  private async configureNotificationChannels(): Promise<void> {
    // High priority channel for urgent notifications
    await Notifications.setNotificationChannelAsync('urgent', {
      name: 'Urgent Notifications',
      description: 'Time-sensitive notifications that require immediate attention',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#44D62C',
      sound: 'default',
      enableLights: true,
      enableVibrate: true,
      showBadge: true,
    });

    // Bookings channel
    await Notifications.setNotificationChannelAsync('bookings', {
      name: 'Booking Updates',
      description: 'Notifications about booking requests, confirmations, and changes',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#44D62C',
      sound: 'default',
    });

    // Messages channel
    await Notifications.setNotificationChannelAsync('messages', {
      name: 'Messages',
      description: 'New messages and conversation updates',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250],
      lightColor: '#3B82F6',
      sound: 'default',
    });

    // Payments channel
    await Notifications.setNotificationChannelAsync('payments', {
      name: 'Payments',
      description: 'Payment confirmations, failures, and updates',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#10B981',
      sound: 'default',
    });

    // Reviews channel
    await Notifications.setNotificationChannelAsync('reviews', {
      name: 'Reviews',
      description: 'Review requests and received reviews',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250],
      lightColor: '#F59E0B',
    });

    // System channel
    await Notifications.setNotificationChannelAsync('system', {
      name: 'System Updates',
      description: 'App updates and system announcements',
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: '#6B7280',
    });

    // Marketing channel
    await Notifications.setNotificationChannelAsync('marketing', {
      name: 'Promotions',
      description: 'Special offers and promotional content',
      importance: Notifications.AndroidImportance.LOW,
      lightColor: '#8B5CF6',
    });
  }

  /**
   * Set up notification event listeners
   */
  private setupNotificationListeners(): void {
    // Listen for notifications received while app is running
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('FCM notification received:', notification);
        this.handleNotificationReceived(notification);
      }
    );

    // Listen for notification responses (user tapped notification)
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('FCM notification response:', response);
        this.handleNotificationResponse(response);
      }
    );
  }

  /**
   * Handle notification received while app is running
   */
  private async handleNotificationReceived(
    notification: Notifications.Notification
  ): Promise<void> {
    const data = notification.request.content.data as NotificationData;
    
    // Update badge count
    await this.updateBadgeCount();
    
    // Store notification for in-app display
    await this.storeNotification(notification);
    
    // Emit event for UI updates
    // You can use EventEmitter or your state management solution here
    console.log('Notification received with data:', data);
  }

  /**
   * Handle notification response (user interaction)
   */
  private async handleNotificationResponse(
    response: Notifications.NotificationResponse
  ): Promise<void> {
    const data = response.notification.request.content.data as NotificationData;
    
    // Handle deep linking based on notification data
    if (data.action_url) {
      await this.handleDeepLink(data.action_url);
    } else if (data.type) {
      await this.handleNotificationAction(data);
    }
    
    // Mark notification as read
    if (data.notification_id) {
      await this.markNotificationAsRead(data.notification_id);
    }
  }

  /**
   * Handle deep linking from notifications
   */
  private async handleDeepLink(url: string): Promise<void> {
    // Implementation depends on your navigation setup
    console.log('FCM deep link:', url);
    
    // Example with Expo Router:
    // import { router } from 'expo-router';
    // router.push(url);
  }

  /**
   * Handle notification actions based on type
   */
  private async handleNotificationAction(data: NotificationData): Promise<void> {
    switch (data.type) {
      case 'booking_request':
      case 'booking_confirmed':
      case 'booking_cancelled':
      case 'booking_completed':
        if (data.booking_id) {
          // Navigate to booking details
          console.log('Navigate to booking:', data.booking_id);
        }
        break;
        
      case 'message_received':
        if (data.message_id) {
          // Navigate to conversation
          console.log('Navigate to message:', data.message_id);
        }
        break;
        
      case 'payment_received':
      case 'payment_failed':
        // Navigate to payment/earnings section
        console.log('Navigate to payments');
        break;
        
      default:
        console.log('Unknown notification type:', data.type);
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<boolean> {
    try {
      // Check if running in Expo Go
      if (isExpoGo()) {
        console.warn('🚫 Push notifications are not supported in Expo Go. Please use a development build.');
        console.warn('💡 Run "npx expo run:ios" or "npx expo run:android" to test notifications.');
        return false;
      }

      if (!Device.isDevice) {
        console.warn('Push notifications only work on physical devices');
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Permission not granted for notifications');
        return false;
      }

      // Get push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: this.config.projectId,
      });

      this.currentToken = tokenData.data;
      console.log('FCM token obtained:', this.currentToken);

      // Store token locally
      await AsyncStorage.setItem('fcm_token', this.currentToken);
      await AsyncStorage.setItem('fcm_permission_granted', 'true');

      return true;
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      
      // If it's an Expo Go related error, provide helpful message
      if (error.message && (error.message.includes('Expo Go') || error.message.includes('Invalid uuid'))) {
        console.warn('💡 Push notifications require a development build. Use EAS Build or "npx expo run" commands.');
      }
      
      return false;
    }
  }

  /**
   * Get current permission status
   */
  async getPermission(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Failed to get permission status:', error);
      return false;
    }
  }

  /**
   * Check if notifications are enabled
   */
  async isEnabled(): Promise<boolean> {
    try {
      const permission = await this.getPermission();
      const token = await AsyncStorage.getItem('fcm_token');
      return permission && !!token;
    } catch (error) {
      console.error('Failed to check if notifications are enabled:', error);
      return false;
    }
  }

  /**
   * Get current FCM token
   */
  async getToken(): Promise<string | null> {
    try {
      // Check if running in Expo Go
      if (isExpoGo()) {
        console.warn('🚫 FCM tokens are not available in Expo Go. Use a development build.');
        return null;
      }

      if (this.currentToken) {
        return this.currentToken;
      }

      const storedToken = await AsyncStorage.getItem('fcm_token');
      if (storedToken) {
        this.currentToken = storedToken;
        return storedToken;
      }

      // Request new token if none exists
      const hasPermission = await this.getPermission();
      if (!hasPermission) {
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: this.config.projectId,
      });

      this.currentToken = tokenData.data;
      await AsyncStorage.setItem('fcm_token', this.currentToken);
      
      return this.currentToken;
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      
      // Provide helpful message for Expo Go users
      if (error.message && (error.message.includes('Expo Go') || error.message.includes('Invalid uuid'))) {
        console.warn('💡 FCM tokens require a development build. Use "npx expo run:ios" or "npx expo run:android".');
      }
      
      return null;
    }
  }

  /**
   * Set external user ID (link FCM token to your user)
   */
  async setExternalUserId(userId: string): Promise<void> {
    try {
      await AsyncStorage.setItem('fcm_user_id', userId);
      console.log('FCM external user ID set:', userId);
      
      // Send token to your backend to associate with user
      const token = await this.getToken();
      if (token) {
        await this.registerTokenWithBackend(token, userId);
      }
    } catch (error) {
      console.error('Failed to set external user ID:', error);
    }
  }

  /**
   * Remove external user ID (logout)
   */
  async removeExternalUserId(): Promise<void> {
    try {
      const userId = await AsyncStorage.getItem('fcm_user_id');
      const token = await this.getToken();
      
      if (userId && token) {
        await this.unregisterTokenFromBackend(token, userId);
      }
      
      await AsyncStorage.removeItem('fcm_user_id');
      console.log('FCM external user ID removed');
    } catch (error) {
      console.error('Failed to remove external user ID:', error);
    }
  }

  /**
   * Set notification preferences
   */
  async setNotificationPreferences(preferences: {
    booking_notifications?: boolean;
    message_notifications?: boolean;
    payment_notifications?: boolean;
    review_notifications?: boolean;
    system_notifications?: boolean;
    marketing_notifications?: boolean;
  }): Promise<void> {
    try {
      await AsyncStorage.setItem('fcm_preferences', JSON.stringify(preferences));
      console.log('FCM preferences set:', preferences);
      
      // Send preferences to backend
      const userId = await AsyncStorage.getItem('fcm_user_id');
      const token = await this.getToken();
      
      if (userId && token) {
        await this.updatePreferencesOnBackend(userId, preferences);
      }
    } catch (error) {
      console.error('Failed to set notification preferences:', error);
    }
  }

  /**
   * Get notification preferences
   */
  async getNotificationPreferences(): Promise<{
    booking_notifications: boolean;
    message_notifications: boolean;
    payment_notifications: boolean;
    review_notifications: boolean;
    system_notifications: boolean;
    marketing_notifications: boolean;
  }> {
    try {
      const stored = await AsyncStorage.getItem('fcm_preferences');
      if (stored) {
        return JSON.parse(stored);
      }
      
      // Default preferences
      return {
        booking_notifications: true,
        message_notifications: true,
        payment_notifications: true,
        review_notifications: true,
        system_notifications: true,
        marketing_notifications: false,
      };
    } catch (error) {
      console.error('Failed to get notification preferences:', error);
      return {
        booking_notifications: true,
        message_notifications: true,
        payment_notifications: true,
        review_notifications: true,
        system_notifications: true,
        marketing_notifications: false,
      };
    }
  }

  /**
   * Clear all notifications from the notification center
   */
  async clearNotifications(): Promise<void> {
    try {
      await Notifications.dismissAllNotificationsAsync();
      await this.setBadgeCount(0);
      console.log('FCM notifications cleared');
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  }

  /**
   * Set badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
      await AsyncStorage.setItem('fcm_badge_count', count.toString());
    } catch (error) {
      console.error('Failed to set badge count:', error);
    }
  }

  /**
   * Get current badge count
   */
  async getBadgeCount(): Promise<number> {
    try {
      const stored = await AsyncStorage.getItem('fcm_badge_count');
      return stored ? parseInt(stored, 10) : 0;
    } catch (error) {
      console.error('Failed to get badge count:', error);
      return 0;
    }
  }

  /**
   * Update badge count (increment by 1)
   */
  async updateBadgeCount(): Promise<void> {
    try {
      const current = await this.getBadgeCount();
      await this.setBadgeCount(current + 1);
    } catch (error) {
      console.error('Failed to update badge count:', error);
    }
  }

  /**
   * Determine if notification should show in foreground
   */
  private async shouldShowInForeground(
    notification: Notifications.Notification
  ): Promise<boolean> {
    const data = notification.request.content.data as NotificationData;
    
    // Always show high priority notifications
    if (data.type === 'booking_request' || data.type === 'payment_failed') {
      return true;
    }
    
    // Check user preferences
    const preferences = await this.getNotificationPreferences();
    
    switch (data.type) {
      case 'booking_confirmed':
      case 'booking_cancelled':
      case 'booking_completed':
        return preferences.booking_notifications;
        
      case 'message_received':
        return preferences.message_notifications;
        
      case 'payment_received':
        return preferences.payment_notifications;
        
      case 'review_received':
      case 'review_request':
        return preferences.review_notifications;
        
      default:
        return true;
    }
  }

  /**
   * Store notification for in-app display
   */
  private async storeNotification(
    notification: Notifications.Notification
  ): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('fcm_notifications');
      const notifications = stored ? JSON.parse(stored) : [];
      
      const notificationData = {
        id: notification.request.identifier,
        title: notification.request.content.title,
        body: notification.request.content.body,
        data: notification.request.content.data,
        receivedAt: new Date().toISOString(),
        isRead: false,
      };
      
      notifications.unshift(notificationData);
      
      // Keep only last 50 notifications
      if (notifications.length > 50) {
        notifications.splice(50);
      }
      
      await AsyncStorage.setItem('fcm_notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Failed to store notification:', error);
    }
  }

  /**
   * Mark notification as read
   */
  private async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('fcm_notifications');
      if (!stored) return;
      
      const notifications = JSON.parse(stored);
      const notification = notifications.find((n: any) => n.id === notificationId);
      
      if (notification) {
        notification.isRead = true;
        await AsyncStorage.setItem('fcm_notifications', JSON.stringify(notifications));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  /**
   * Register token with backend
   */
  private async registerTokenWithBackend(token: string, userId: string): Promise<void> {
    try {
      // TODO: Implement API call to register token with your backend
      console.log('Registering FCM token with backend:', { token, userId });
      
      // Example API call:
      // await fetch('/api/notifications/register-token', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     token,
      //     userId,
      //     platform: Platform.OS,
      //     deviceId: Constants.deviceId,
      //   }),
      // });
    } catch (error) {
      console.error('Failed to register token with backend:', error);
    }
  }

  /**
   * Unregister token from backend
   */
  private async unregisterTokenFromBackend(token: string, userId: string): Promise<void> {
    try {
      // TODO: Implement API call to unregister token from your backend
      console.log('Unregistering FCM token from backend:', { token, userId });
      
      // Example API call:
      // await fetch('/api/notifications/unregister-token', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ token, userId }),
      // });
    } catch (error) {
      console.error('Failed to unregister token from backend:', error);
    }
  }

  /**
   * Update preferences on backend
   */
  private async updatePreferencesOnBackend(
    userId: string,
    preferences: Record<string, boolean>
  ): Promise<void> {
    try {
      // TODO: Implement API call to update preferences on your backend
      console.log('Updating FCM preferences on backend:', { userId, preferences });
      
      // Example API call:
      // await fetch('/api/notifications/preferences', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ userId, preferences }),
      // });
    } catch (error) {
      console.error('Failed to update preferences on backend:', error);
    }
  }

  /**
   * Cleanup listeners
   */
  cleanup(): void {
    try {
      const safeRemove = (sub: any) => {
        if (!sub) return;
        // Prefer the subscription.remove() API if available
        if (typeof sub.remove === 'function') {
          sub.remove();
          return;
        }
        // Fallback for older expo-notifications API
        const maybeRemove = (Notifications as any)?.removeNotificationSubscription;
        if (typeof maybeRemove === 'function') {
          maybeRemove(sub);
        }
      };

      safeRemove(this.notificationListener);
      this.notificationListener = null;

      safeRemove(this.responseListener);
      this.responseListener = null;
    } catch (error) {
      // Do not crash the app on cleanup in Expo Go / SDK limitations
      console.warn('FCM cleanup warning:', error);
    }
  }
}

// Default configuration
export const defaultFCMConfig: FCMConfig = {
  projectId: '', // Will be set from Constants.expoConfig.extra.firebaseProjectId
  apiKey: '', // Will be set from Constants.expoConfig.extra.firebaseApiKey
  appId: '', // Will be set from Constants.expoConfig.extra.firebaseAppId
  messagingSenderId: '', // Will be set from Constants.expoConfig.extra.firebaseMessagingSenderId
  logLevel: __DEV__ ? 'debug' : 'warn',
  requiresUserPrivacyConsent: false,
};

// Create singleton instance
let fcmService: FCMService | null = null;

export function getFCMService(): FCMService {
  if (!fcmService) {
    // Get config from environment variables or Expo config
    const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 
                     Constants.expoConfig?.extra?.firebaseProjectId || '';
    const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 
                  Constants.expoConfig?.extra?.firebaseApiKey || '';
    const appId = process.env.EXPO_PUBLIC_FIREBASE_APP_ID || 
                 Constants.expoConfig?.extra?.firebaseAppId || '';
    const messagingSenderId = process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 
                             Constants.expoConfig?.extra?.firebaseMessagingSenderId || '';
    
    fcmService = new FCMService({
      ...defaultFCMConfig,
      projectId,
      apiKey,
      appId,
      messagingSenderId,
    });
  }
  
  return fcmService;
}
