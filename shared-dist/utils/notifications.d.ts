import { NotificationType, NotificationTemplate, NotificationContext, PushNotification, AppNotification } from '../types/notification';
/**
 * Template replacement utility
 * Replaces {{variable}} placeholders in notification templates with actual values
 */
export declare function replaceTemplate(template: string, context: Record<string, any>): string;
/**
 * Creates a notification payload for a specific type with context
 */
export declare function createNotification<T extends NotificationType>(type: T, context: NotificationContext[T], userId: string, overrides?: Partial<NotificationTemplate>): Omit<AppNotification, 'id' | 'created_at' | 'updated_at'>;
/**
 * Creates a OneSignal push notification payload
 */
export declare function createPushNotification(appId: string, notification: Partial<AppNotification> & {
    title: string;
    message: string;
    user_id: string;
}, options?: {
    external_user_ids?: string[];
    player_ids?: string[];
    segments?: string[];
    big_picture?: string;
    web_url?: string;
    web_buttons?: Array<{
        id: string;
        text: string;
        url?: string;
    }>;
    priority?: number;
    ttl?: number;
    send_after?: string;
    delayed_option?: 'timezone' | 'last-active';
}): PushNotification;
/**
 * Validates notification preferences for a user
 */
export declare function shouldSendNotification(notificationType: NotificationType, preferences: {
    push_notifications: boolean;
    booking_notifications?: boolean;
    message_notifications?: boolean;
    payment_notifications?: boolean;
    review_notifications?: boolean;
    system_notifications?: boolean;
    marketing_notifications?: boolean;
    quiet_hours_enabled?: boolean;
    quiet_hours_start?: string;
    quiet_hours_end?: string;
    timezone?: string;
}): boolean;
/**
 * Checks if current time is within user's quiet hours
 */
export declare function isWithinQuietHours(preferences: {
    quiet_hours_enabled?: boolean;
    quiet_hours_start?: string;
    quiet_hours_end?: string;
    timezone?: string;
}): boolean;
/**
 * Calculates optimal send time based on user preferences
 */
export declare function getOptimalSendTime(preferences: {
    quiet_hours_enabled?: boolean;
    quiet_hours_start?: string;
    quiet_hours_end?: string;
    timezone?: string;
}, urgency?: 'immediate' | 'normal' | 'low'): string | undefined;
/**
 * Notification priority mapping
 */
export declare const NOTIFICATION_PRIORITIES: {
    readonly immediate: 10;
    readonly high: 9;
    readonly normal: 7;
    readonly low: 5;
    readonly marketing: 3;
};
/**
 * Gets notification priority based on type and context
 */
export declare function getNotificationPriority(type: NotificationType, context?: {
    isUrgent?: boolean;
    amount?: number;
}): number;
/**
 * Creates a delayed notification for optimal delivery
 */
export declare function createDelayedNotification(appId: string, notification: Partial<AppNotification> & {
    title: string;
    message: string;
    user_id: string;
}, preferences: {
    quiet_hours_enabled?: boolean;
    quiet_hours_start?: string;
    quiet_hours_end?: string;
    timezone?: string;
}, urgency?: 'immediate' | 'normal' | 'low', options?: Parameters<typeof createPushNotification>[2]): PushNotification;
