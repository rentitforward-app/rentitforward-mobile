/**
 * Mobile Notification API Service
 * 
 * Handles communication with the web backend notification APIs
 * to trigger email, push, and in-app notifications from mobile actions
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NotificationApiConfig {
  baseUrl: string;
  timeout?: number;
}

export interface MessageNotificationData {
  messageId: string;
  conversationId: string;
  receiverId: string;
}

export interface BookingNotificationData {
  bookingId: string;
  action: 'request' | 'approve' | 'reject' | 'cancel' | 'pickup' | 'return';
  userId?: string;
}

export interface NotificationApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export class MobileNotificationApiService {
  private config: NotificationApiConfig;

  constructor(config?: Partial<NotificationApiConfig>) {
    this.config = {
      baseUrl: process.env.EXPO_PUBLIC_BASE_URL || 'https://rentitforward.com.au',
      timeout: 10000,
      ...config,
    };
  }

  /**
   * Get authentication headers for API requests
   */
  private async getAuthHeaders(): Promise<Record<string, string>> {
    try {
      // Try to get auth token from AsyncStorage
      const token = await AsyncStorage.getItem('supabase_auth_token');
      if (token) {
        return {
          'Authorization': `Bearer ${token}`,
        };
      }
      return {};
    } catch (error) {
      console.error('Failed to get auth headers:', error);
      return {};
    }
  }

  /**
   * Make API request with timeout and error handling
   */
  private async makeRequest(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'POST',
    body?: any
  ): Promise<NotificationApiResponse> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(await this.getAuthHeaders()),
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        message: result.message || 'Request successful',
      };
    } catch (error) {
      console.error(`Failed to call ${endpoint}:`, error);
      
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timeout',
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Trigger message notifications (email, push, in-app)
   * Called after sending a message from mobile
   */
  async notifyNewMessage(data: MessageNotificationData): Promise<NotificationApiResponse> {
    console.log('Triggering message notifications:', data);
    
    return this.makeRequest('/api/messages/notify', 'POST', data);
  }

  /**
   * Trigger booking notifications
   * Called after booking actions from mobile
   */
  async notifyBookingAction(data: BookingNotificationData): Promise<NotificationApiResponse> {
    console.log('Triggering booking notifications:', data);
    
    const endpoint = this.getBookingEndpoint(data.action, data.bookingId);
    if (!endpoint) {
      return {
        success: false,
        error: `Unsupported booking action: ${data.action}`,
      };
    }

    return this.makeRequest(endpoint, 'POST', { userId: data.userId });
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(preferences: Record<string, boolean>): Promise<NotificationApiResponse> {
    console.log('Updating notification preferences:', preferences);
    
    return this.makeRequest('/api/notifications/preferences', 'PUT', { preferences });
  }

  /**
   * Get unread notification count
   */
  async getUnreadNotificationCount(): Promise<{ count: number; success: boolean; error?: string }> {
    try {
      const response = await this.makeRequest('/api/notifications/unread-count', 'GET');
      
      if (!response.success) {
        return { count: 0, success: false, error: response.error };
      }

      // Parse the count from the response
      const result = await fetch(`${this.config.baseUrl}/api/notifications/unread-count`, {
        headers: await this.getAuthHeaders(),
      });
      
      if (result.ok) {
        const data = await result.json();
        return { count: data.unreadCount || 0, success: true };
      }

      return { count: 0, success: false, error: 'Failed to fetch count' };
    } catch (error) {
      console.error('Failed to get unread notification count:', error);
      return { 
        count: 0, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Mark notifications as viewed (update last viewed timestamp)
   */
  async markNotificationsAsViewed(): Promise<NotificationApiResponse> {
    console.log('Marking notifications as viewed');
    
    return this.makeRequest('/api/notifications/mark-viewed', 'POST');
  }

  /**
   * Register FCM token with backend
   */
  async registerFCMToken(tokenData: {
    fcm_token: string;
    user_id: string;
    platform: string;
    device_type: string;
    device_id: string;
  }): Promise<NotificationApiResponse> {
    console.log('Registering FCM token:', { ...tokenData, fcm_token: '***' });
    
    return this.makeRequest('/api/notifications/fcm-token', 'POST', tokenData);
  }

  /**
   * Unregister FCM token from backend
   */
  async unregisterFCMToken(tokenData: {
    fcm_token: string;
    user_id: string;
  }): Promise<NotificationApiResponse> {
    console.log('Unregistering FCM token:', { ...tokenData, fcm_token: '***' });
    
    return this.makeRequest('/api/notifications/fcm-token', 'DELETE', tokenData);
  }

  /**
   * Get the appropriate booking endpoint for the action
   */
  private getBookingEndpoint(action: string, bookingId: string): string | null {
    switch (action) {
      case 'request':
        return `/api/bookings/authorize`;
      case 'approve':
        return `/api/bookings/${bookingId}/approve`;
      case 'reject':
        return `/api/bookings/${bookingId}/reject`;
      case 'cancel':
        return `/api/bookings/${bookingId}/cancel`;
      case 'pickup':
        return `/api/bookings/${bookingId}/confirm-pickup`;
      case 'return':
        return `/api/bookings/${bookingId}/confirm-return`;
      default:
        return null;
    }
  }

  /**
   * Test notification system
   * Useful for development and debugging
   */
  async testNotifications(eventType: string, notificationType: string = 'all'): Promise<NotificationApiResponse> {
    console.log('Testing notifications:', { eventType, notificationType });
    
    return this.makeRequest('/api/admin/test-notifications', 'POST', {
      eventType,
      notificationType,
    });
  }
}

// Create singleton instance
let notificationApiService: MobileNotificationApiService | null = null;

export function getNotificationApiService(config?: Partial<NotificationApiConfig>): MobileNotificationApiService {
  if (!notificationApiService) {
    notificationApiService = new MobileNotificationApiService(config);
  }
  return notificationApiService;
}

// Export convenience functions
export const mobileNotificationApi = {
  /**
   * Call this after sending a message from mobile
   */
  notifyNewMessage: async (messageId: string, conversationId: string, receiverId: string) => {
    const service = getNotificationApiService();
    return service.notifyNewMessage({ messageId, conversationId, receiverId });
  },

  /**
   * Call this after booking actions from mobile
   */
  notifyBookingAction: async (bookingId: string, action: BookingNotificationData['action'], userId?: string) => {
    const service = getNotificationApiService();
    return service.notifyBookingAction({ bookingId, action, userId });
  },

  /**
   * Get unread notification count for badge
   */
  getUnreadCount: async () => {
    const service = getNotificationApiService();
    return service.getUnreadNotificationCount();
  },

  /**
   * Mark notifications as viewed when opening notifications screen
   */
  markAsViewed: async () => {
    const service = getNotificationApiService();
    return service.markNotificationsAsViewed();
  },

  /**
   * Update notification preferences
   */
  updatePreferences: async (preferences: Record<string, boolean>) => {
    const service = getNotificationApiService();
    return service.updateNotificationPreferences(preferences);
  },

  /**
   * Test notifications (development only)
   */
  test: async (eventType: string, notificationType: string = 'all') => {
    const service = getNotificationApiService();
    return service.testNotifications(eventType, notificationType);
  },
};
