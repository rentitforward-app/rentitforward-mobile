import { z } from 'zod';
export declare const NotificationTypeSchema: z.ZodEnum<["booking_request", "booking_confirmed", "booking_cancelled", "booking_completed", "payment_received", "payment_failed", "message_received", "review_received", "review_request", "listing_approved", "listing_rejected", "system_announcement", "reminder"]>;
export type NotificationType = z.infer<typeof NotificationTypeSchema>;
export declare const PushNotificationSchema: z.ZodObject<{
    app_id: z.ZodString;
    headings: z.ZodRecord<z.ZodString, z.ZodString>;
    contents: z.ZodRecord<z.ZodString, z.ZodString>;
    include_external_user_ids: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    include_player_ids: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    included_segments: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    priority: z.ZodOptional<z.ZodNumber>;
    ttl: z.ZodOptional<z.ZodNumber>;
    big_picture: z.ZodOptional<z.ZodString>;
    large_icon: z.ZodOptional<z.ZodString>;
    small_icon: z.ZodOptional<z.ZodString>;
    web_url: z.ZodOptional<z.ZodString>;
    web_buttons: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        text: z.ZodString;
        url: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        text: string;
        url?: string | undefined;
    }, {
        id: string;
        text: string;
        url?: string | undefined;
    }>, "many">>;
    ios_attachments: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    android_channel_id: z.ZodOptional<z.ZodString>;
    send_after: z.ZodOptional<z.ZodString>;
    delayed_option: z.ZodOptional<z.ZodEnum<["timezone", "last-active"]>>;
}, "strip", z.ZodTypeAny, {
    app_id: string;
    headings: Record<string, string>;
    contents: Record<string, string>;
    include_external_user_ids?: string[] | undefined;
    include_player_ids?: string[] | undefined;
    included_segments?: string[] | undefined;
    data?: Record<string, any> | undefined;
    priority?: number | undefined;
    ttl?: number | undefined;
    big_picture?: string | undefined;
    large_icon?: string | undefined;
    small_icon?: string | undefined;
    web_url?: string | undefined;
    web_buttons?: {
        id: string;
        text: string;
        url?: string | undefined;
    }[] | undefined;
    ios_attachments?: Record<string, string> | undefined;
    android_channel_id?: string | undefined;
    send_after?: string | undefined;
    delayed_option?: "timezone" | "last-active" | undefined;
}, {
    app_id: string;
    headings: Record<string, string>;
    contents: Record<string, string>;
    include_external_user_ids?: string[] | undefined;
    include_player_ids?: string[] | undefined;
    included_segments?: string[] | undefined;
    data?: Record<string, any> | undefined;
    priority?: number | undefined;
    ttl?: number | undefined;
    big_picture?: string | undefined;
    large_icon?: string | undefined;
    small_icon?: string | undefined;
    web_url?: string | undefined;
    web_buttons?: {
        id: string;
        text: string;
        url?: string | undefined;
    }[] | undefined;
    ios_attachments?: Record<string, string> | undefined;
    android_channel_id?: string | undefined;
    send_after?: string | undefined;
    delayed_option?: "timezone" | "last-active" | undefined;
}>;
export type PushNotification = z.infer<typeof PushNotificationSchema>;
export declare const AppNotificationSchema: z.ZodObject<{
    id: z.ZodString;
    user_id: z.ZodString;
    type: z.ZodEnum<["booking_request", "booking_confirmed", "booking_cancelled", "booking_completed", "payment_received", "payment_failed", "message_received", "review_received", "review_request", "listing_approved", "listing_rejected", "system_announcement", "reminder"]>;
    title: z.ZodString;
    message: z.ZodString;
    data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    is_read: z.ZodDefault<z.ZodBoolean>;
    created_at: z.ZodDate;
    updated_at: z.ZodDate;
    action_url: z.ZodOptional<z.ZodString>;
    onesignal_id: z.ZodOptional<z.ZodString>;
    sent_at: z.ZodOptional<z.ZodDate>;
    delivered_at: z.ZodOptional<z.ZodDate>;
    opened_at: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    message: string;
    type: "payment_failed" | "review_request" | "review_received" | "booking_request" | "booking_confirmed" | "booking_cancelled" | "booking_completed" | "payment_received" | "message_received" | "listing_approved" | "listing_rejected" | "system_announcement" | "reminder";
    title: string;
    user_id: string;
    is_read: boolean;
    created_at: Date;
    updated_at: Date;
    data?: Record<string, any> | undefined;
    action_url?: string | undefined;
    onesignal_id?: string | undefined;
    sent_at?: Date | undefined;
    delivered_at?: Date | undefined;
    opened_at?: Date | undefined;
}, {
    id: string;
    message: string;
    type: "payment_failed" | "review_request" | "review_received" | "booking_request" | "booking_confirmed" | "booking_cancelled" | "booking_completed" | "payment_received" | "message_received" | "listing_approved" | "listing_rejected" | "system_announcement" | "reminder";
    title: string;
    user_id: string;
    created_at: Date;
    updated_at: Date;
    data?: Record<string, any> | undefined;
    is_read?: boolean | undefined;
    action_url?: string | undefined;
    onesignal_id?: string | undefined;
    sent_at?: Date | undefined;
    delivered_at?: Date | undefined;
    opened_at?: Date | undefined;
}>;
export type AppNotification = z.infer<typeof AppNotificationSchema>;
export declare const NotificationPreferencesSchema: z.ZodObject<{
    user_id: z.ZodString;
    email_notifications: z.ZodDefault<z.ZodBoolean>;
    push_notifications: z.ZodDefault<z.ZodBoolean>;
    sms_notifications: z.ZodDefault<z.ZodBoolean>;
    booking_notifications: z.ZodDefault<z.ZodBoolean>;
    message_notifications: z.ZodDefault<z.ZodBoolean>;
    payment_notifications: z.ZodDefault<z.ZodBoolean>;
    review_notifications: z.ZodDefault<z.ZodBoolean>;
    system_notifications: z.ZodDefault<z.ZodBoolean>;
    marketing_notifications: z.ZodDefault<z.ZodBoolean>;
    quiet_hours_enabled: z.ZodDefault<z.ZodBoolean>;
    quiet_hours_start: z.ZodOptional<z.ZodString>;
    quiet_hours_end: z.ZodOptional<z.ZodString>;
    timezone: z.ZodDefault<z.ZodString>;
    created_at: z.ZodDate;
    updated_at: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    timezone: string;
    user_id: string;
    created_at: Date;
    updated_at: Date;
    email_notifications: boolean;
    push_notifications: boolean;
    sms_notifications: boolean;
    booking_notifications: boolean;
    message_notifications: boolean;
    payment_notifications: boolean;
    review_notifications: boolean;
    system_notifications: boolean;
    marketing_notifications: boolean;
    quiet_hours_enabled: boolean;
    quiet_hours_start?: string | undefined;
    quiet_hours_end?: string | undefined;
}, {
    user_id: string;
    created_at: Date;
    updated_at: Date;
    timezone?: string | undefined;
    email_notifications?: boolean | undefined;
    push_notifications?: boolean | undefined;
    sms_notifications?: boolean | undefined;
    booking_notifications?: boolean | undefined;
    message_notifications?: boolean | undefined;
    payment_notifications?: boolean | undefined;
    review_notifications?: boolean | undefined;
    system_notifications?: boolean | undefined;
    marketing_notifications?: boolean | undefined;
    quiet_hours_enabled?: boolean | undefined;
    quiet_hours_start?: string | undefined;
    quiet_hours_end?: string | undefined;
}>;
export type NotificationPreferences = z.infer<typeof NotificationPreferencesSchema>;
export declare const OneSignalSubscriptionSchema: z.ZodObject<{
    user_id: z.ZodString;
    player_id: z.ZodString;
    external_user_id: z.ZodString;
    platform: z.ZodEnum<["web", "ios", "android"]>;
    device_type: z.ZodEnum<["web_push", "ios", "android"]>;
    is_active: z.ZodDefault<z.ZodBoolean>;
    subscription_data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    created_at: z.ZodDate;
    updated_at: z.ZodDate;
    last_active: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    user_id: string;
    created_at: Date;
    updated_at: Date;
    player_id: string;
    external_user_id: string;
    platform: "web" | "ios" | "android";
    device_type: "ios" | "android" | "web_push";
    is_active: boolean;
    subscription_data?: Record<string, any> | undefined;
    last_active?: Date | undefined;
}, {
    user_id: string;
    created_at: Date;
    updated_at: Date;
    player_id: string;
    external_user_id: string;
    platform: "web" | "ios" | "android";
    device_type: "ios" | "android" | "web_push";
    is_active?: boolean | undefined;
    subscription_data?: Record<string, any> | undefined;
    last_active?: Date | undefined;
}>;
export type OneSignalSubscription = z.infer<typeof OneSignalSubscriptionSchema>;
export interface NotificationTemplate {
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, any>;
    action_url?: string;
    priority?: number;
    ttl?: number;
    big_picture?: string;
    web_url?: string;
    web_buttons?: Array<{
        id: string;
        text: string;
        url?: string;
    }>;
}
export declare const NOTIFICATION_TEMPLATES: Record<NotificationType, Omit<NotificationTemplate, 'type'>>;
export type NotificationContext = {
    booking_request: {
        renter_name: string;
        item_title: string;
        duration: number;
        booking_id: string;
    };
    booking_confirmed: {
        item_title: string;
        booking_id: string;
        start_date: string;
    };
    booking_cancelled: {
        item_title: string;
        booking_id: string;
        reason?: string;
    };
    booking_completed: {
        item_title: string;
        booking_id: string;
    };
    payment_received: {
        amount: number;
        item_title: string;
        booking_id: string;
    };
    payment_failed: {
        item_title: string;
        booking_id: string;
        error_message?: string;
    };
    message_received: {
        sender_name: string;
        item_title: string;
        message_id: string;
    };
    review_received: {
        reviewer_name: string;
        rating: number;
        review_id: string;
    };
    review_request: {
        item_title: string;
        booking_id: string;
    };
    listing_approved: {
        item_title: string;
        listing_id: string;
    };
    listing_rejected: {
        item_title: string;
        listing_id: string;
        reason?: string;
    };
    system_announcement: {
        announcement_text: string;
    };
    reminder: {
        reminder_text: string;
    };
};
