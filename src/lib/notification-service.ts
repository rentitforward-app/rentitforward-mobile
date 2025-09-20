import { getFCMService } from './fcm';
import { 
  NotificationType, 
  createNotification, 
  NotificationContext 
} from '../../../rentitforward-shared/src/types/notification';

export interface NotificationTrigger {
  userId: string;
  type: NotificationType;
  context: any;
  priority?: 'immediate' | 'high' | 'normal' | 'low';
}

export class NotificationService {
  private fcmService = getFCMService();

  /**
   * Send a notification to a user
   */
  async sendNotification(trigger: NotificationTrigger): Promise<void> {
    try {
      // Check if FCM is initialized
      if (!this.fcmService) {
        console.warn('FCM service not initialized');
        return;
      }

      // Get user preferences
      const preferences = await this.fcmService.getNotificationPreferences();
      
      // Check if user wants this type of notification
      if (!this.shouldSendNotification(trigger.type, preferences)) {
        console.log(`Notification blocked by user preferences: ${trigger.type}`);
        return;
      }

      // Create notification data
      const notificationData = createNotification(
        trigger.type,
        trigger.context,
        trigger.userId
      );

      // For mobile, we'll store the notification locally and show it
      // In a real app, this would be sent from your backend to FCM
      await this.storeLocalNotification({
        id: `local_${Date.now()}`,
        title: notificationData.title,
        body: notificationData.message,
        data: notificationData.data || {},
        receivedAt: new Date().toISOString(),
        isRead: false,
      });

      console.log('Notification sent:', {
        type: trigger.type,
        userId: trigger.userId,
        title: notificationData.title,
      });

    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  /**
   * Send booking-related notifications
   */
  async sendBookingNotification(
    userId: string,
    type: 'booking_request' | 'booking_confirmed' | 'booking_cancelled' | 'booking_completed',
    context: {
      booking_id: string;
      item_title: string;
      renter_name?: string;
      start_date?: string;
      reason?: string;
    }
  ): Promise<void> {
    await this.sendNotification({
      userId,
      type,
      context,
      priority: type === 'booking_request' ? 'high' : 'normal',
    });
  }

  /**
   * Send message notifications
   */
  async sendMessageNotification(
    userId: string,
    context: {
      message_id: string;
      sender_name: string;
      item_title: string;
    }
  ): Promise<void> {
    await this.sendNotification({
      userId,
      type: 'message_received',
      context,
      priority: 'normal',
    });
  }

  /**
   * Send payment notifications
   */
  async sendPaymentNotification(
    userId: string,
    type: 'payment_received' | 'payment_failed',
    context: {
      booking_id: string;
      item_title: string;
      amount?: number;
      error_message?: string;
    }
  ): Promise<void> {
    await this.sendNotification({
      userId,
      type,
      context,
      priority: type === 'payment_failed' ? 'high' : 'normal',
    });
  }

  /**
   * Send review notifications
   */
  async sendReviewNotification(
    userId: string,
    type: 'review_received' | 'review_request',
    context: {
      booking_id?: string;
      review_id?: string;
      reviewer_name?: string;
      rating?: number;
      item_title: string;
    }
  ): Promise<void> {
    await this.sendNotification({
      userId,
      type,
      context,
      priority: 'low',
    });
  }

  /**
   * Send system notifications
   */
  async sendSystemNotification(
    userId: string,
    type: 'system_announcement' | 'reminder',
    context: {
      announcement_text?: string;
      reminder_text?: string;
    }
  ): Promise<void> {
    await this.sendNotification({
      userId,
      type,
      context,
      priority: 'low',
    });
  }

  /**
   * Check if notification should be sent based on user preferences
   */
  private shouldSendNotification(
    type: NotificationType,
    preferences: {
      booking_notifications: boolean;
      message_notifications: boolean;
      payment_notifications: boolean;
      review_notifications: boolean;
      system_notifications: boolean;
      marketing_notifications: boolean;
    }
  ): boolean {
    switch (type) {
      case 'booking_request':
      case 'booking_confirmed':
      case 'booking_cancelled':
      case 'booking_completed':
        return preferences.booking_notifications;
        
      case 'message_received':
        return preferences.message_notifications;
        
      case 'payment_received':
      case 'payment_failed':
        return preferences.payment_notifications;
        
      case 'review_received':
      case 'review_request':
        return preferences.review_notifications;
        
      case 'system_announcement':
      case 'reminder':
      case 'listing_approved':
      case 'listing_rejected':
        return preferences.system_notifications;
        
      default:
        return true;
    }
  }

  /**
   * Store notification locally for display in the app
   */
  private async storeLocalNotification(notification: {
    id: string;
    title: string;
    body: string;
    data: any;
    receivedAt: string;
    isRead: boolean;
  }): Promise<void> {
    try {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      
      const stored = await AsyncStorage.default.getItem('fcm_notifications');
      const notifications = stored ? JSON.parse(stored) : [];
      
      notifications.unshift(notification);
      
      // Keep only last 50 notifications
      if (notifications.length > 50) {
        notifications.splice(50);
      }
      
      await AsyncStorage.default.setItem('fcm_notifications', JSON.stringify(notifications));
      
      // Update badge count
      const unreadCount = notifications.filter((n: any) => !n.isRead).length;
      await AsyncStorage.default.setItem('fcm_badge_count', unreadCount.toString());
      
      // Update FCM service badge
      await this.fcmService.setBadgeCount(unreadCount);
      
    } catch (error) {
      console.error('Failed to store local notification:', error);
    }
  }
}

// Create singleton instance
let notificationService: NotificationService | null = null;

export function getNotificationService(): NotificationService {
  if (!notificationService) {
    notificationService = new NotificationService();
  }
  return notificationService;
}

// Convenience functions for common notification types
export const sendBookingRequestNotification = (
  userId: string,
  context: {
    booking_id: string;
    item_title: string;
    renter_name: string;
  }
) => getNotificationService().sendBookingNotification(userId, 'booking_request', context);

export const sendBookingConfirmedNotification = (
  userId: string,
  context: {
    booking_id: string;
    item_title: string;
    start_date: string;
  }
) => getNotificationService().sendBookingNotification(userId, 'booking_confirmed', context);

export const sendBookingCancelledNotification = (
  userId: string,
  context: {
    booking_id: string;
    item_title: string;
    reason?: string;
  }
) => getNotificationService().sendBookingNotification(userId, 'booking_cancelled', context);

export const sendBookingCompletedNotification = (
  userId: string,
  context: {
    booking_id: string;
    item_title: string;
  }
) => getNotificationService().sendBookingNotification(userId, 'booking_completed', context);

export const sendNewMessageNotification = (
  userId: string,
  context: {
    message_id: string;
    sender_name: string;
    item_title: string;
  }
) => getNotificationService().sendMessageNotification(userId, context);

export const sendPaymentReceivedNotification = (
  userId: string,
  context: {
    booking_id: string;
    item_title: string;
    amount: number;
  }
) => getNotificationService().sendPaymentNotification(userId, 'payment_received', context);

export const sendPaymentFailedNotification = (
  userId: string,
  context: {
    booking_id: string;
    item_title: string;
    error_message?: string;
  }
) => getNotificationService().sendPaymentNotification(userId, 'payment_failed', context);
