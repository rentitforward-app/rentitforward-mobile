"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NOTIFICATION_PRIORITIES = void 0;
exports.replaceTemplate = replaceTemplate;
exports.createNotification = createNotification;
exports.createPushNotification = createPushNotification;
exports.shouldSendNotification = shouldSendNotification;
exports.isWithinQuietHours = isWithinQuietHours;
exports.getOptimalSendTime = getOptimalSendTime;
exports.getNotificationPriority = getNotificationPriority;
exports.createDelayedNotification = createDelayedNotification;
const notification_1 = require("../types/notification");
/**
 * Template replacement utility
 * Replaces {{variable}} placeholders in notification templates with actual values
 */
function replaceTemplate(template, context) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        const value = context[key];
        return value !== undefined ? String(value) : match;
    });
}
/**
 * Creates a notification payload for a specific type with context
 */
function createNotification(type, context, userId, overrides) {
    const template = notification_1.NOTIFICATION_TEMPLATES[type];
    const title = replaceTemplate(template.title, context);
    const message = replaceTemplate(template.message, context);
    const action_url = template.action_url
        ? replaceTemplate(template.action_url, context)
        : undefined;
    return {
        user_id: userId,
        type,
        title: overrides?.title || title,
        message: overrides?.message || message,
        data: { ...context, ...overrides?.data },
        is_read: false,
        action_url: overrides?.action_url || action_url,
    };
}
/**
 * Creates a FCM push notification payload
 */
function createPushNotification(notification, options) {
    const template = notification.type
        ? notification_1.NOTIFICATION_TEMPLATES[notification.type]
        : null;
    const priority = options?.priority || (template?.priority && template.priority > 7 ? 'high' : 'normal');
    const channelId = options?.android_channel_id || getAndroidChannelId(notification.type);
    return {
        // Targeting
        registration_ids: options?.fcm_tokens,
        condition: options?.condition,
        // Notification payload
        notification: {
            title: notification.title,
            body: notification.message,
            image: options?.image || template?.big_picture,
            click_action: options?.click_action || getWebUrl(notification.action_url),
            color: '#44D62C', // Brand color
            icon: 'notification_icon',
        },
        // Data payload for custom handling
        data: {
            type: notification.type || '',
            action_url: notification.action_url || '',
            notification_id: notification.id || '',
            user_id: notification.user_id,
            ...Object.fromEntries(Object.entries(notification.data || {}).map(([key, value]) => [
                key,
                typeof value === 'string' ? value : JSON.stringify(value)
            ])),
        },
        // Android specific configuration
        android: {
            priority,
            ttl: options?.ttl ? `${options.ttl}s` : '86400s', // 24 hours default
            collapse_key: options?.collapse_key,
            notification: {
                title: notification.title,
                body: notification.message,
                icon: 'notification_icon',
                color: '#44D62C',
                channel_id: channelId,
                click_action: options?.click_action || getWebUrl(notification.action_url),
                notification_priority: priority === 'high' ? 'PRIORITY_HIGH' : 'PRIORITY_DEFAULT',
                default_sound: true,
                default_vibrate_timings: true,
            },
        },
        // iOS specific configuration (APNS)
        apns: {
            headers: {
                'apns-priority': priority === 'high' ? '10' : '5',
                ...(options?.ttl && {
                    'apns-expiration': String(Math.floor(Date.now() / 1000) + options.ttl)
                }),
            },
            payload: {
                aps: {
                    alert: {
                        title: notification.title,
                        body: notification.message,
                    },
                    badge: 1, // Will be updated by the app
                    sound: 'default',
                    category: getCategoryId(notification.type),
                    'mutable-content': 1, // Enable notification service extension
                },
            },
        },
        // Web specific configuration
        webpush: {
            headers: {
                TTL: options?.ttl ? String(options.ttl) : '86400',
                Urgency: priority,
            },
            notification: {
                title: notification.title,
                body: notification.message,
                icon: '/icons/notification-icon-192.png',
                image: options?.image || template?.big_picture,
                badge: '/icons/notification-badge-72.png',
                tag: notification.type || 'general',
                click_action: options?.click_action || getWebUrl(notification.action_url),
                actions: getWebActions(notification.type),
            },
        },
    };
}
/**
 * Converts relative URLs to absolute web URLs
 */
function getWebUrl(actionUrl) {
    if (!actionUrl)
        return undefined;
    // If it's already an absolute URL, return as is
    if (actionUrl.startsWith('http')) {
        return actionUrl;
    }
    // Convert relative URL to absolute
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.rentitforward.com';
    return `${baseUrl}${actionUrl.startsWith('/') ? '' : '/'}${actionUrl}`;
}
/**
 * Gets appropriate Android notification channel based on notification type
 */
function getAndroidChannelId(type) {
    if (!type)
        return 'default';
    switch (type) {
        case 'booking_request':
        case 'booking_confirmed':
        case 'booking_cancelled':
        case 'booking_completed':
            return 'bookings';
        case 'payment_received':
        case 'payment_failed':
            return 'payments';
        case 'message_received':
            return 'messages';
        case 'review_received':
        case 'review_request':
            return 'reviews';
        case 'listing_approved':
        case 'listing_rejected':
            return 'listings';
        case 'system_announcement':
        case 'reminder':
            return 'system';
        default:
            return 'default';
    }
}
/**
 * Gets iOS notification category ID for interactive notifications
 */
function getCategoryId(type) {
    if (!type)
        return 'general';
    switch (type) {
        case 'booking_request':
        case 'booking_confirmed':
        case 'booking_cancelled':
        case 'booking_completed':
            return 'booking';
        case 'message_received':
            return 'message';
        case 'payment_received':
        case 'payment_failed':
            return 'payment';
        default:
            return 'general';
    }
}
/**
 * Gets web notification actions based on notification type
 */
function getWebActions(type) {
    switch (type) {
        case 'booking_request':
            return [
                { action: 'accept', title: 'Accept', icon: '/icons/check.png' },
                { action: 'decline', title: 'Decline', icon: '/icons/close.png' },
            ];
        case 'message_received':
            return [
                { action: 'reply', title: 'Reply', icon: '/icons/reply.png' },
                { action: 'view', title: 'View', icon: '/icons/view.png' },
            ];
        default:
            return undefined;
    }
}
/**
 * Validates notification preferences for a user
 */
function shouldSendNotification(notificationType, preferences) {
    // Check if push notifications are enabled globally
    if (!preferences.push_notifications) {
        return false;
    }
    // Check category-specific preferences
    switch (notificationType) {
        case 'booking_request':
        case 'booking_confirmed':
        case 'booking_cancelled':
        case 'booking_completed':
            return preferences.booking_notifications !== false;
        case 'message_received':
            return preferences.message_notifications !== false;
        case 'payment_received':
        case 'payment_failed':
            return preferences.payment_notifications !== false;
        case 'review_received':
        case 'review_request':
            return preferences.review_notifications !== false;
        case 'system_announcement':
        case 'reminder':
            return preferences.system_notifications !== false;
        case 'listing_approved':
        case 'listing_rejected':
            return preferences.system_notifications !== false;
        default:
            return true;
    }
}
/**
 * Checks if current time is within user's quiet hours
 */
function isWithinQuietHours(preferences) {
    if (!preferences.quiet_hours_enabled ||
        !preferences.quiet_hours_start ||
        !preferences.quiet_hours_end) {
        return false;
    }
    try {
        const now = new Date();
        const timezone = preferences.timezone || 'UTC';
        // Convert current time to user's timezone
        const userTime = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        }).format(now);
        const [currentHour, currentMinute] = userTime.split(':').map(Number);
        const currentTimeMinutes = currentHour * 60 + currentMinute;
        // Parse quiet hours
        const [startHour, startMinute] = preferences.quiet_hours_start.split(':').map(Number);
        const [endHour, endMinute] = preferences.quiet_hours_end.split(':').map(Number);
        const startTimeMinutes = startHour * 60 + startMinute;
        const endTimeMinutes = endHour * 60 + endMinute;
        // Handle overnight quiet hours (e.g., 22:00 to 08:00)
        if (startTimeMinutes > endTimeMinutes) {
            return currentTimeMinutes >= startTimeMinutes || currentTimeMinutes <= endTimeMinutes;
        }
        else {
            return currentTimeMinutes >= startTimeMinutes && currentTimeMinutes <= endTimeMinutes;
        }
    }
    catch (error) {
        console.error('Error checking quiet hours:', error);
        return false;
    }
}
/**
 * Calculates optimal send time based on user preferences
 */
function getOptimalSendTime(preferences, urgency = 'normal') {
    // For immediate notifications, send right away regardless of quiet hours
    if (urgency === 'immediate') {
        return undefined;
    }
    // If not in quiet hours, send immediately
    if (!isWithinQuietHours(preferences)) {
        return undefined;
    }
    // If in quiet hours, schedule for end of quiet hours
    if (preferences.quiet_hours_end && preferences.timezone) {
        try {
            const now = new Date();
            const [endHour, endMinute] = preferences.quiet_hours_end.split(':').map(Number);
            // Create date for end of quiet hours
            const endTime = new Date(now);
            endTime.setHours(endHour, endMinute, 0, 0);
            // If end time is in the past (tomorrow's quiet hours), add a day
            if (endTime <= now) {
                endTime.setDate(endTime.getDate() + 1);
            }
            // Return ISO string for OneSignal send_after parameter
            return endTime.toISOString();
        }
        catch (error) {
            console.error('Error calculating optimal send time:', error);
            return undefined;
        }
    }
    return undefined;
}
/**
 * Notification priority mapping
 */
exports.NOTIFICATION_PRIORITIES = {
    immediate: 10,
    high: 9,
    normal: 7,
    low: 5,
    marketing: 3,
};
/**
 * Gets notification priority based on type and context
 */
function getNotificationPriority(type, context) {
    if (context?.isUrgent) {
        return exports.NOTIFICATION_PRIORITIES.immediate;
    }
    switch (type) {
        case 'payment_failed':
        case 'booking_request':
            return exports.NOTIFICATION_PRIORITIES.high;
        case 'booking_confirmed':
        case 'payment_received':
        case 'message_received':
            return exports.NOTIFICATION_PRIORITIES.normal;
        case 'review_request':
        case 'listing_approved':
        case 'reminder':
            return exports.NOTIFICATION_PRIORITIES.low;
        case 'system_announcement':
            return exports.NOTIFICATION_PRIORITIES.marketing;
        default:
            return exports.NOTIFICATION_PRIORITIES.normal;
    }
}
/**
 * Creates a delayed notification for optimal delivery
 */
function createDelayedNotification(notification, preferences, urgency = 'normal', options) {
    const priority = urgency === 'immediate' ? 'high' : 'normal';
    const ttl = getOptimalTTL(preferences, urgency);
    return createPushNotification(notification, {
        ...options,
        priority,
        ttl,
    });
}
/**
 * Gets optimal TTL based on urgency and user preferences
 */
function getOptimalTTL(preferences, urgency = 'normal') {
    // For immediate notifications, use shorter TTL
    if (urgency === 'immediate') {
        return 3600; // 1 hour
    }
    // For normal notifications during quiet hours, extend TTL
    if (isWithinQuietHours(preferences)) {
        return 172800; // 48 hours
    }
    // Default TTL based on urgency
    switch (urgency) {
        case 'normal':
            return 86400; // 24 hours
        case 'low':
            return 604800; // 7 days
        default:
            return 86400; // 24 hours
    }
}
