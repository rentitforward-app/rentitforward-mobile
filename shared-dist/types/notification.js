"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NOTIFICATION_TEMPLATES = exports.FCMSubscriptionSchema = exports.NotificationPreferencesSchema = exports.AppNotificationSchema = exports.PushNotificationSchema = exports.NotificationTypeSchema = void 0;
const zod_1 = require("zod");
// FCM notification types
exports.NotificationTypeSchema = zod_1.z.enum([
    'booking_request',
    'booking_confirmed',
    'booking_cancelled',
    'booking_completed',
    'payment_received',
    'payment_failed',
    'message_received',
    'review_received',
    'review_request',
    'listing_approved',
    'listing_rejected',
    'system_announcement',
    'reminder',
]);
// FCM push notification payload
exports.PushNotificationSchema = zod_1.z.object({
    // FCM required fields
    to: zod_1.z.string().optional(), // FCM token
    registration_ids: zod_1.z.array(zod_1.z.string()).optional(), // Multiple FCM tokens
    condition: zod_1.z.string().optional(), // Topic condition
    // Notification payload
    notification: zod_1.z.object({
        title: zod_1.z.string(),
        body: zod_1.z.string(),
        image: zod_1.z.string().url().optional(),
        icon: zod_1.z.string().optional(),
        color: zod_1.z.string().optional(),
        sound: zod_1.z.string().optional(),
        tag: zod_1.z.string().optional(),
        click_action: zod_1.z.string().optional(),
        body_loc_key: zod_1.z.string().optional(),
        body_loc_args: zod_1.z.array(zod_1.z.string()).optional(),
        title_loc_key: zod_1.z.string().optional(),
        title_loc_args: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional(),
    // Data payload
    data: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional(),
    // Android specific
    android: zod_1.z.object({
        collapse_key: zod_1.z.string().optional(),
        priority: zod_1.z.enum(['normal', 'high']).optional(),
        ttl: zod_1.z.string().optional(),
        restricted_package_name: zod_1.z.string().optional(),
        data: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional(),
        notification: zod_1.z.object({
            title: zod_1.z.string().optional(),
            body: zod_1.z.string().optional(),
            icon: zod_1.z.string().optional(),
            color: zod_1.z.string().optional(),
            sound: zod_1.z.string().optional(),
            tag: zod_1.z.string().optional(),
            click_action: zod_1.z.string().optional(),
            body_loc_key: zod_1.z.string().optional(),
            body_loc_args: zod_1.z.array(zod_1.z.string()).optional(),
            title_loc_key: zod_1.z.string().optional(),
            title_loc_args: zod_1.z.array(zod_1.z.string()).optional(),
            channel_id: zod_1.z.string().optional(),
            ticker: zod_1.z.string().optional(),
            sticky: zod_1.z.boolean().optional(),
            event_time: zod_1.z.string().optional(),
            local_only: zod_1.z.boolean().optional(),
            notification_priority: zod_1.z.enum(['PRIORITY_MIN', 'PRIORITY_LOW', 'PRIORITY_DEFAULT', 'PRIORITY_HIGH', 'PRIORITY_MAX']).optional(),
            default_sound: zod_1.z.boolean().optional(),
            default_vibrate_timings: zod_1.z.boolean().optional(),
            default_light_settings: zod_1.z.boolean().optional(),
            vibrate_timings: zod_1.z.array(zod_1.z.string()).optional(),
            visibility: zod_1.z.enum(['PRIVATE', 'PUBLIC', 'SECRET']).optional(),
            notification_count: zod_1.z.number().optional(),
        }).optional(),
    }).optional(),
    // iOS specific (APNS)
    apns: zod_1.z.object({
        headers: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional(),
        payload: zod_1.z.object({
            aps: zod_1.z.object({
                alert: zod_1.z.union([
                    zod_1.z.string(),
                    zod_1.z.object({
                        title: zod_1.z.string().optional(),
                        subtitle: zod_1.z.string().optional(),
                        body: zod_1.z.string().optional(),
                        'launch-image': zod_1.z.string().optional(),
                        'title-loc-key': zod_1.z.string().optional(),
                        'title-loc-args': zod_1.z.array(zod_1.z.string()).optional(),
                        'subtitle-loc-key': zod_1.z.string().optional(),
                        'subtitle-loc-args': zod_1.z.array(zod_1.z.string()).optional(),
                        'loc-key': zod_1.z.string().optional(),
                        'loc-args': zod_1.z.array(zod_1.z.string()).optional(),
                    }),
                ]).optional(),
                badge: zod_1.z.number().optional(),
                sound: zod_1.z.union([zod_1.z.string(), zod_1.z.object({
                        critical: zod_1.z.boolean().optional(),
                        name: zod_1.z.string().optional(),
                        volume: zod_1.z.number().optional(),
                    })]).optional(),
                'thread-id': zod_1.z.string().optional(),
                category: zod_1.z.string().optional(),
                'content-available': zod_1.z.number().optional(),
                'mutable-content': zod_1.z.number().optional(),
            }),
        }).optional(),
    }).optional(),
    // Web specific (WebPush)
    webpush: zod_1.z.object({
        headers: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional(),
        data: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
        notification: zod_1.z.object({
            title: zod_1.z.string().optional(),
            body: zod_1.z.string().optional(),
            icon: zod_1.z.string().optional(),
            image: zod_1.z.string().optional(),
            badge: zod_1.z.string().optional(),
            tag: zod_1.z.string().optional(),
            color: zod_1.z.string().optional(),
            click_action: zod_1.z.string().optional(),
            actions: zod_1.z.array(zod_1.z.object({
                action: zod_1.z.string(),
                title: zod_1.z.string(),
                icon: zod_1.z.string().optional(),
            })).optional(),
        }).optional(),
    }).optional(),
});
// Application notification data structure
exports.AppNotificationSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    user_id: zod_1.z.string().uuid(),
    type: exports.NotificationTypeSchema,
    title: zod_1.z.string(),
    message: zod_1.z.string(),
    data: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    is_read: zod_1.z.boolean().default(false),
    created_at: zod_1.z.date(),
    updated_at: zod_1.z.date(),
    action_url: zod_1.z.string().optional(),
    // FCM tracking
    fcm_message_id: zod_1.z.string().optional(),
    sent_at: zod_1.z.date().optional(),
    delivered_at: zod_1.z.date().optional(),
    opened_at: zod_1.z.date().optional(),
});
// Notification preferences
exports.NotificationPreferencesSchema = zod_1.z.object({
    user_id: zod_1.z.string().uuid(),
    email_notifications: zod_1.z.boolean().default(true),
    push_notifications: zod_1.z.boolean().default(true),
    sms_notifications: zod_1.z.boolean().default(false),
    // Granular preferences
    booking_notifications: zod_1.z.boolean().default(true),
    message_notifications: zod_1.z.boolean().default(true),
    payment_notifications: zod_1.z.boolean().default(true),
    review_notifications: zod_1.z.boolean().default(true),
    system_notifications: zod_1.z.boolean().default(true),
    marketing_notifications: zod_1.z.boolean().default(false),
    // Timing preferences
    quiet_hours_enabled: zod_1.z.boolean().default(false),
    quiet_hours_start: zod_1.z.string().optional(), // HH:MM format
    quiet_hours_end: zod_1.z.string().optional(), // HH:MM format
    timezone: zod_1.z.string().default('UTC'),
    created_at: zod_1.z.date(),
    updated_at: zod_1.z.date(),
});
// FCM subscription data
exports.FCMSubscriptionSchema = zod_1.z.object({
    user_id: zod_1.z.string().uuid(),
    fcm_token: zod_1.z.string(), // FCM registration token
    platform: zod_1.z.enum(['web', 'ios', 'android']),
    device_type: zod_1.z.enum(['web_push', 'ios', 'android']),
    device_id: zod_1.z.string().optional(),
    app_version: zod_1.z.string().optional(),
    is_active: zod_1.z.boolean().default(true),
    subscription_data: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    created_at: zod_1.z.date(),
    updated_at: zod_1.z.date(),
    last_active: zod_1.z.date().optional(),
});
// Pre-defined notification templates
exports.NOTIFICATION_TEMPLATES = {
    booking_request: {
        title: 'New Booking Request',
        message: '{{renter_name}} wants to rent your "{{item_title}}" for {{duration}} days',
        action_url: '/dashboard/bookings',
        priority: 8,
        ttl: 86400, // 24 hours
    },
    booking_confirmed: {
        title: 'Booking Confirmed',
        message: 'Your booking for "{{item_title}}" has been confirmed!',
        action_url: '/bookings/{{booking_id}}',
        priority: 9,
    },
    booking_cancelled: {
        title: 'Booking Cancelled',
        message: 'Your booking for "{{item_title}}" has been cancelled',
        action_url: '/bookings/{{booking_id}}',
        priority: 7,
    },
    booking_completed: {
        title: 'Booking Completed',
        message: 'Your rental of "{{item_title}}" is complete. Please leave a review!',
        action_url: '/bookings/{{booking_id}}?action=review',
        priority: 6,
    },
    payment_received: {
        title: 'Payment Received',
        message: 'You received ${{amount}} for "{{item_title}}" rental',
        action_url: '/dashboard',
        priority: 8,
    },
    payment_failed: {
        title: 'Payment Failed',
        message: 'Payment for "{{item_title}}" rental could not be processed',
        action_url: '/bookings/{{booking_id}}',
        priority: 9,
    },
    message_received: {
        title: 'New Message',
        message: '{{sender_name}} sent you a message about "{{item_title}}"',
        action_url: '/messages',
        priority: 7,
        ttl: 172800, // 48 hours
    },
    review_received: {
        title: 'New Review',
        message: '{{reviewer_name}} left you a {{rating}}-star review',
        action_url: '/dashboard/reviews',
        priority: 6,
    },
    review_request: {
        title: 'Review Request',
        message: 'How was your experience with "{{item_title}}"? Leave a review!',
        action_url: '/bookings/{{booking_id}}?action=review',
        priority: 5,
        ttl: 604800, // 7 days
    },
    listing_approved: {
        title: 'Listing Approved',
        message: 'Your listing "{{item_title}}" has been approved and is now live!',
        action_url: '/listings/{{listing_id}}',
        priority: 7,
    },
    listing_rejected: {
        title: 'Listing Rejected',
        message: 'Your listing "{{item_title}}" needs updates before it can be published',
        action_url: '/listings/{{listing_id}}/edit',
        priority: 8,
    },
    system_announcement: {
        title: 'System Update',
        message: '{{announcement_text}}',
        priority: 5,
    },
    reminder: {
        title: 'Reminder',
        message: '{{reminder_text}}',
        priority: 4,
        ttl: 86400, // 24 hours
    },
};
