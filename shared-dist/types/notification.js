"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NOTIFICATION_TEMPLATES = exports.OneSignalSubscriptionSchema = exports.NotificationPreferencesSchema = exports.AppNotificationSchema = exports.PushNotificationSchema = exports.NotificationTypeSchema = void 0;
const zod_1 = require("zod");
// OneSignal notification types
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
// OneSignal push notification payload
exports.PushNotificationSchema = zod_1.z.object({
    // OneSignal required fields
    app_id: zod_1.z.string(),
    headings: zod_1.z.record(zod_1.z.string(), zod_1.z.string()),
    contents: zod_1.z.record(zod_1.z.string(), zod_1.z.string()),
    // Targeting
    include_external_user_ids: zod_1.z.array(zod_1.z.string()).optional(),
    include_player_ids: zod_1.z.array(zod_1.z.string()).optional(),
    included_segments: zod_1.z.array(zod_1.z.string()).optional(),
    // Custom data
    data: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    // Notification behavior
    priority: zod_1.z.number().optional(),
    ttl: zod_1.z.number().optional(),
    // Rich content
    big_picture: zod_1.z.string().url().optional(),
    large_icon: zod_1.z.string().url().optional(),
    small_icon: zod_1.z.string().optional(),
    // Web specific
    web_url: zod_1.z.string().url().optional(),
    web_buttons: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        text: zod_1.z.string(),
        url: zod_1.z.string().url().optional(),
    })).optional(),
    // Mobile specific
    ios_attachments: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional(),
    android_channel_id: zod_1.z.string().optional(),
    // Scheduling
    send_after: zod_1.z.string().optional(),
    delayed_option: zod_1.z.enum(['timezone', 'last-active']).optional(),
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
    // OneSignal tracking
    onesignal_id: zod_1.z.string().optional(),
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
// OneSignal subscription data
exports.OneSignalSubscriptionSchema = zod_1.z.object({
    user_id: zod_1.z.string().uuid(),
    player_id: zod_1.z.string(), // OneSignal player/subscription ID
    external_user_id: zod_1.z.string(), // Our user ID
    platform: zod_1.z.enum(['web', 'ios', 'android']),
    device_type: zod_1.z.enum(['web_push', 'ios', 'android']),
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
