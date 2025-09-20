import { z } from 'zod';
export declare const NotificationTypeSchema: z.ZodEnum<["booking_request", "booking_confirmed", "booking_cancelled", "booking_completed", "payment_received", "payment_failed", "message_received", "review_received", "review_request", "listing_approved", "listing_rejected", "system_announcement", "reminder"]>;
export type NotificationType = z.infer<typeof NotificationTypeSchema>;
export declare const PushNotificationSchema: z.ZodObject<{
    to: z.ZodOptional<z.ZodString>;
    registration_ids: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    condition: z.ZodOptional<z.ZodString>;
    notification: z.ZodOptional<z.ZodObject<{
        title: z.ZodString;
        body: z.ZodString;
        image: z.ZodOptional<z.ZodString>;
        icon: z.ZodOptional<z.ZodString>;
        color: z.ZodOptional<z.ZodString>;
        sound: z.ZodOptional<z.ZodString>;
        tag: z.ZodOptional<z.ZodString>;
        click_action: z.ZodOptional<z.ZodString>;
        body_loc_key: z.ZodOptional<z.ZodString>;
        body_loc_args: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        title_loc_key: z.ZodOptional<z.ZodString>;
        title_loc_args: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        body: string;
        tag?: string | undefined;
        image?: string | undefined;
        icon?: string | undefined;
        color?: string | undefined;
        sound?: string | undefined;
        click_action?: string | undefined;
        body_loc_key?: string | undefined;
        body_loc_args?: string[] | undefined;
        title_loc_key?: string | undefined;
        title_loc_args?: string[] | undefined;
    }, {
        title: string;
        body: string;
        tag?: string | undefined;
        image?: string | undefined;
        icon?: string | undefined;
        color?: string | undefined;
        sound?: string | undefined;
        click_action?: string | undefined;
        body_loc_key?: string | undefined;
        body_loc_args?: string[] | undefined;
        title_loc_key?: string | undefined;
        title_loc_args?: string[] | undefined;
    }>>;
    data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    android: z.ZodOptional<z.ZodObject<{
        collapse_key: z.ZodOptional<z.ZodString>;
        priority: z.ZodOptional<z.ZodEnum<["normal", "high"]>>;
        ttl: z.ZodOptional<z.ZodString>;
        restricted_package_name: z.ZodOptional<z.ZodString>;
        data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        notification: z.ZodOptional<z.ZodObject<{
            title: z.ZodOptional<z.ZodString>;
            body: z.ZodOptional<z.ZodString>;
            icon: z.ZodOptional<z.ZodString>;
            color: z.ZodOptional<z.ZodString>;
            sound: z.ZodOptional<z.ZodString>;
            tag: z.ZodOptional<z.ZodString>;
            click_action: z.ZodOptional<z.ZodString>;
            body_loc_key: z.ZodOptional<z.ZodString>;
            body_loc_args: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            title_loc_key: z.ZodOptional<z.ZodString>;
            title_loc_args: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            channel_id: z.ZodOptional<z.ZodString>;
            ticker: z.ZodOptional<z.ZodString>;
            sticky: z.ZodOptional<z.ZodBoolean>;
            event_time: z.ZodOptional<z.ZodString>;
            local_only: z.ZodOptional<z.ZodBoolean>;
            notification_priority: z.ZodOptional<z.ZodEnum<["PRIORITY_MIN", "PRIORITY_LOW", "PRIORITY_DEFAULT", "PRIORITY_HIGH", "PRIORITY_MAX"]>>;
            default_sound: z.ZodOptional<z.ZodBoolean>;
            default_vibrate_timings: z.ZodOptional<z.ZodBoolean>;
            default_light_settings: z.ZodOptional<z.ZodBoolean>;
            vibrate_timings: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            visibility: z.ZodOptional<z.ZodEnum<["PRIVATE", "PUBLIC", "SECRET"]>>;
            notification_count: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            title?: string | undefined;
            tag?: string | undefined;
            body?: string | undefined;
            icon?: string | undefined;
            color?: string | undefined;
            sound?: string | undefined;
            click_action?: string | undefined;
            body_loc_key?: string | undefined;
            body_loc_args?: string[] | undefined;
            title_loc_key?: string | undefined;
            title_loc_args?: string[] | undefined;
            channel_id?: string | undefined;
            ticker?: string | undefined;
            sticky?: boolean | undefined;
            event_time?: string | undefined;
            local_only?: boolean | undefined;
            notification_priority?: "PRIORITY_MIN" | "PRIORITY_LOW" | "PRIORITY_DEFAULT" | "PRIORITY_HIGH" | "PRIORITY_MAX" | undefined;
            default_sound?: boolean | undefined;
            default_vibrate_timings?: boolean | undefined;
            default_light_settings?: boolean | undefined;
            vibrate_timings?: string[] | undefined;
            visibility?: "PRIVATE" | "PUBLIC" | "SECRET" | undefined;
            notification_count?: number | undefined;
        }, {
            title?: string | undefined;
            tag?: string | undefined;
            body?: string | undefined;
            icon?: string | undefined;
            color?: string | undefined;
            sound?: string | undefined;
            click_action?: string | undefined;
            body_loc_key?: string | undefined;
            body_loc_args?: string[] | undefined;
            title_loc_key?: string | undefined;
            title_loc_args?: string[] | undefined;
            channel_id?: string | undefined;
            ticker?: string | undefined;
            sticky?: boolean | undefined;
            event_time?: string | undefined;
            local_only?: boolean | undefined;
            notification_priority?: "PRIORITY_MIN" | "PRIORITY_LOW" | "PRIORITY_DEFAULT" | "PRIORITY_HIGH" | "PRIORITY_MAX" | undefined;
            default_sound?: boolean | undefined;
            default_vibrate_timings?: boolean | undefined;
            default_light_settings?: boolean | undefined;
            vibrate_timings?: string[] | undefined;
            visibility?: "PRIVATE" | "PUBLIC" | "SECRET" | undefined;
            notification_count?: number | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        notification?: {
            title?: string | undefined;
            tag?: string | undefined;
            body?: string | undefined;
            icon?: string | undefined;
            color?: string | undefined;
            sound?: string | undefined;
            click_action?: string | undefined;
            body_loc_key?: string | undefined;
            body_loc_args?: string[] | undefined;
            title_loc_key?: string | undefined;
            title_loc_args?: string[] | undefined;
            channel_id?: string | undefined;
            ticker?: string | undefined;
            sticky?: boolean | undefined;
            event_time?: string | undefined;
            local_only?: boolean | undefined;
            notification_priority?: "PRIORITY_MIN" | "PRIORITY_LOW" | "PRIORITY_DEFAULT" | "PRIORITY_HIGH" | "PRIORITY_MAX" | undefined;
            default_sound?: boolean | undefined;
            default_vibrate_timings?: boolean | undefined;
            default_light_settings?: boolean | undefined;
            vibrate_timings?: string[] | undefined;
            visibility?: "PRIVATE" | "PUBLIC" | "SECRET" | undefined;
            notification_count?: number | undefined;
        } | undefined;
        data?: Record<string, string> | undefined;
        collapse_key?: string | undefined;
        priority?: "normal" | "high" | undefined;
        ttl?: string | undefined;
        restricted_package_name?: string | undefined;
    }, {
        notification?: {
            title?: string | undefined;
            tag?: string | undefined;
            body?: string | undefined;
            icon?: string | undefined;
            color?: string | undefined;
            sound?: string | undefined;
            click_action?: string | undefined;
            body_loc_key?: string | undefined;
            body_loc_args?: string[] | undefined;
            title_loc_key?: string | undefined;
            title_loc_args?: string[] | undefined;
            channel_id?: string | undefined;
            ticker?: string | undefined;
            sticky?: boolean | undefined;
            event_time?: string | undefined;
            local_only?: boolean | undefined;
            notification_priority?: "PRIORITY_MIN" | "PRIORITY_LOW" | "PRIORITY_DEFAULT" | "PRIORITY_HIGH" | "PRIORITY_MAX" | undefined;
            default_sound?: boolean | undefined;
            default_vibrate_timings?: boolean | undefined;
            default_light_settings?: boolean | undefined;
            vibrate_timings?: string[] | undefined;
            visibility?: "PRIVATE" | "PUBLIC" | "SECRET" | undefined;
            notification_count?: number | undefined;
        } | undefined;
        data?: Record<string, string> | undefined;
        collapse_key?: string | undefined;
        priority?: "normal" | "high" | undefined;
        ttl?: string | undefined;
        restricted_package_name?: string | undefined;
    }>>;
    apns: z.ZodOptional<z.ZodObject<{
        headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        payload: z.ZodOptional<z.ZodObject<{
            aps: z.ZodObject<{
                alert: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
                    title: z.ZodOptional<z.ZodString>;
                    subtitle: z.ZodOptional<z.ZodString>;
                    body: z.ZodOptional<z.ZodString>;
                    'launch-image': z.ZodOptional<z.ZodString>;
                    'title-loc-key': z.ZodOptional<z.ZodString>;
                    'title-loc-args': z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                    'subtitle-loc-key': z.ZodOptional<z.ZodString>;
                    'subtitle-loc-args': z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                    'loc-key': z.ZodOptional<z.ZodString>;
                    'loc-args': z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                }, "strip", z.ZodTypeAny, {
                    title?: string | undefined;
                    body?: string | undefined;
                    subtitle?: string | undefined;
                    'launch-image'?: string | undefined;
                    'title-loc-key'?: string | undefined;
                    'title-loc-args'?: string[] | undefined;
                    'subtitle-loc-key'?: string | undefined;
                    'subtitle-loc-args'?: string[] | undefined;
                    'loc-key'?: string | undefined;
                    'loc-args'?: string[] | undefined;
                }, {
                    title?: string | undefined;
                    body?: string | undefined;
                    subtitle?: string | undefined;
                    'launch-image'?: string | undefined;
                    'title-loc-key'?: string | undefined;
                    'title-loc-args'?: string[] | undefined;
                    'subtitle-loc-key'?: string | undefined;
                    'subtitle-loc-args'?: string[] | undefined;
                    'loc-key'?: string | undefined;
                    'loc-args'?: string[] | undefined;
                }>]>>;
                badge: z.ZodOptional<z.ZodNumber>;
                sound: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
                    critical: z.ZodOptional<z.ZodBoolean>;
                    name: z.ZodOptional<z.ZodString>;
                    volume: z.ZodOptional<z.ZodNumber>;
                }, "strip", z.ZodTypeAny, {
                    critical?: boolean | undefined;
                    name?: string | undefined;
                    volume?: number | undefined;
                }, {
                    critical?: boolean | undefined;
                    name?: string | undefined;
                    volume?: number | undefined;
                }>]>>;
                'thread-id': z.ZodOptional<z.ZodString>;
                category: z.ZodOptional<z.ZodString>;
                'content-available': z.ZodOptional<z.ZodNumber>;
                'mutable-content': z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                category?: string | undefined;
                sound?: string | {
                    critical?: boolean | undefined;
                    name?: string | undefined;
                    volume?: number | undefined;
                } | undefined;
                alert?: string | {
                    title?: string | undefined;
                    body?: string | undefined;
                    subtitle?: string | undefined;
                    'launch-image'?: string | undefined;
                    'title-loc-key'?: string | undefined;
                    'title-loc-args'?: string[] | undefined;
                    'subtitle-loc-key'?: string | undefined;
                    'subtitle-loc-args'?: string[] | undefined;
                    'loc-key'?: string | undefined;
                    'loc-args'?: string[] | undefined;
                } | undefined;
                badge?: number | undefined;
                'thread-id'?: string | undefined;
                'content-available'?: number | undefined;
                'mutable-content'?: number | undefined;
            }, {
                category?: string | undefined;
                sound?: string | {
                    critical?: boolean | undefined;
                    name?: string | undefined;
                    volume?: number | undefined;
                } | undefined;
                alert?: string | {
                    title?: string | undefined;
                    body?: string | undefined;
                    subtitle?: string | undefined;
                    'launch-image'?: string | undefined;
                    'title-loc-key'?: string | undefined;
                    'title-loc-args'?: string[] | undefined;
                    'subtitle-loc-key'?: string | undefined;
                    'subtitle-loc-args'?: string[] | undefined;
                    'loc-key'?: string | undefined;
                    'loc-args'?: string[] | undefined;
                } | undefined;
                badge?: number | undefined;
                'thread-id'?: string | undefined;
                'content-available'?: number | undefined;
                'mutable-content'?: number | undefined;
            }>;
        }, "strip", z.ZodTypeAny, {
            aps: {
                category?: string | undefined;
                sound?: string | {
                    critical?: boolean | undefined;
                    name?: string | undefined;
                    volume?: number | undefined;
                } | undefined;
                alert?: string | {
                    title?: string | undefined;
                    body?: string | undefined;
                    subtitle?: string | undefined;
                    'launch-image'?: string | undefined;
                    'title-loc-key'?: string | undefined;
                    'title-loc-args'?: string[] | undefined;
                    'subtitle-loc-key'?: string | undefined;
                    'subtitle-loc-args'?: string[] | undefined;
                    'loc-key'?: string | undefined;
                    'loc-args'?: string[] | undefined;
                } | undefined;
                badge?: number | undefined;
                'thread-id'?: string | undefined;
                'content-available'?: number | undefined;
                'mutable-content'?: number | undefined;
            };
        }, {
            aps: {
                category?: string | undefined;
                sound?: string | {
                    critical?: boolean | undefined;
                    name?: string | undefined;
                    volume?: number | undefined;
                } | undefined;
                alert?: string | {
                    title?: string | undefined;
                    body?: string | undefined;
                    subtitle?: string | undefined;
                    'launch-image'?: string | undefined;
                    'title-loc-key'?: string | undefined;
                    'title-loc-args'?: string[] | undefined;
                    'subtitle-loc-key'?: string | undefined;
                    'subtitle-loc-args'?: string[] | undefined;
                    'loc-key'?: string | undefined;
                    'loc-args'?: string[] | undefined;
                } | undefined;
                badge?: number | undefined;
                'thread-id'?: string | undefined;
                'content-available'?: number | undefined;
                'mutable-content'?: number | undefined;
            };
        }>>;
    }, "strip", z.ZodTypeAny, {
        headers?: Record<string, string> | undefined;
        payload?: {
            aps: {
                category?: string | undefined;
                sound?: string | {
                    critical?: boolean | undefined;
                    name?: string | undefined;
                    volume?: number | undefined;
                } | undefined;
                alert?: string | {
                    title?: string | undefined;
                    body?: string | undefined;
                    subtitle?: string | undefined;
                    'launch-image'?: string | undefined;
                    'title-loc-key'?: string | undefined;
                    'title-loc-args'?: string[] | undefined;
                    'subtitle-loc-key'?: string | undefined;
                    'subtitle-loc-args'?: string[] | undefined;
                    'loc-key'?: string | undefined;
                    'loc-args'?: string[] | undefined;
                } | undefined;
                badge?: number | undefined;
                'thread-id'?: string | undefined;
                'content-available'?: number | undefined;
                'mutable-content'?: number | undefined;
            };
        } | undefined;
    }, {
        headers?: Record<string, string> | undefined;
        payload?: {
            aps: {
                category?: string | undefined;
                sound?: string | {
                    critical?: boolean | undefined;
                    name?: string | undefined;
                    volume?: number | undefined;
                } | undefined;
                alert?: string | {
                    title?: string | undefined;
                    body?: string | undefined;
                    subtitle?: string | undefined;
                    'launch-image'?: string | undefined;
                    'title-loc-key'?: string | undefined;
                    'title-loc-args'?: string[] | undefined;
                    'subtitle-loc-key'?: string | undefined;
                    'subtitle-loc-args'?: string[] | undefined;
                    'loc-key'?: string | undefined;
                    'loc-args'?: string[] | undefined;
                } | undefined;
                badge?: number | undefined;
                'thread-id'?: string | undefined;
                'content-available'?: number | undefined;
                'mutable-content'?: number | undefined;
            };
        } | undefined;
    }>>;
    webpush: z.ZodOptional<z.ZodObject<{
        headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        notification: z.ZodOptional<z.ZodObject<{
            title: z.ZodOptional<z.ZodString>;
            body: z.ZodOptional<z.ZodString>;
            icon: z.ZodOptional<z.ZodString>;
            image: z.ZodOptional<z.ZodString>;
            badge: z.ZodOptional<z.ZodString>;
            tag: z.ZodOptional<z.ZodString>;
            color: z.ZodOptional<z.ZodString>;
            click_action: z.ZodOptional<z.ZodString>;
            actions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                action: z.ZodString;
                title: z.ZodString;
                icon: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                title: string;
                action: string;
                icon?: string | undefined;
            }, {
                title: string;
                action: string;
                icon?: string | undefined;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            title?: string | undefined;
            tag?: string | undefined;
            body?: string | undefined;
            image?: string | undefined;
            icon?: string | undefined;
            color?: string | undefined;
            click_action?: string | undefined;
            badge?: string | undefined;
            actions?: {
                title: string;
                action: string;
                icon?: string | undefined;
            }[] | undefined;
        }, {
            title?: string | undefined;
            tag?: string | undefined;
            body?: string | undefined;
            image?: string | undefined;
            icon?: string | undefined;
            color?: string | undefined;
            click_action?: string | undefined;
            badge?: string | undefined;
            actions?: {
                title: string;
                action: string;
                icon?: string | undefined;
            }[] | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        notification?: {
            title?: string | undefined;
            tag?: string | undefined;
            body?: string | undefined;
            image?: string | undefined;
            icon?: string | undefined;
            color?: string | undefined;
            click_action?: string | undefined;
            badge?: string | undefined;
            actions?: {
                title: string;
                action: string;
                icon?: string | undefined;
            }[] | undefined;
        } | undefined;
        data?: Record<string, any> | undefined;
        headers?: Record<string, string> | undefined;
    }, {
        notification?: {
            title?: string | undefined;
            tag?: string | undefined;
            body?: string | undefined;
            image?: string | undefined;
            icon?: string | undefined;
            color?: string | undefined;
            click_action?: string | undefined;
            badge?: string | undefined;
            actions?: {
                title: string;
                action: string;
                icon?: string | undefined;
            }[] | undefined;
        } | undefined;
        data?: Record<string, any> | undefined;
        headers?: Record<string, string> | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    condition?: string | undefined;
    to?: string | undefined;
    registration_ids?: string[] | undefined;
    notification?: {
        title: string;
        body: string;
        tag?: string | undefined;
        image?: string | undefined;
        icon?: string | undefined;
        color?: string | undefined;
        sound?: string | undefined;
        click_action?: string | undefined;
        body_loc_key?: string | undefined;
        body_loc_args?: string[] | undefined;
        title_loc_key?: string | undefined;
        title_loc_args?: string[] | undefined;
    } | undefined;
    data?: Record<string, string> | undefined;
    android?: {
        notification?: {
            title?: string | undefined;
            tag?: string | undefined;
            body?: string | undefined;
            icon?: string | undefined;
            color?: string | undefined;
            sound?: string | undefined;
            click_action?: string | undefined;
            body_loc_key?: string | undefined;
            body_loc_args?: string[] | undefined;
            title_loc_key?: string | undefined;
            title_loc_args?: string[] | undefined;
            channel_id?: string | undefined;
            ticker?: string | undefined;
            sticky?: boolean | undefined;
            event_time?: string | undefined;
            local_only?: boolean | undefined;
            notification_priority?: "PRIORITY_MIN" | "PRIORITY_LOW" | "PRIORITY_DEFAULT" | "PRIORITY_HIGH" | "PRIORITY_MAX" | undefined;
            default_sound?: boolean | undefined;
            default_vibrate_timings?: boolean | undefined;
            default_light_settings?: boolean | undefined;
            vibrate_timings?: string[] | undefined;
            visibility?: "PRIVATE" | "PUBLIC" | "SECRET" | undefined;
            notification_count?: number | undefined;
        } | undefined;
        data?: Record<string, string> | undefined;
        collapse_key?: string | undefined;
        priority?: "normal" | "high" | undefined;
        ttl?: string | undefined;
        restricted_package_name?: string | undefined;
    } | undefined;
    apns?: {
        headers?: Record<string, string> | undefined;
        payload?: {
            aps: {
                category?: string | undefined;
                sound?: string | {
                    critical?: boolean | undefined;
                    name?: string | undefined;
                    volume?: number | undefined;
                } | undefined;
                alert?: string | {
                    title?: string | undefined;
                    body?: string | undefined;
                    subtitle?: string | undefined;
                    'launch-image'?: string | undefined;
                    'title-loc-key'?: string | undefined;
                    'title-loc-args'?: string[] | undefined;
                    'subtitle-loc-key'?: string | undefined;
                    'subtitle-loc-args'?: string[] | undefined;
                    'loc-key'?: string | undefined;
                    'loc-args'?: string[] | undefined;
                } | undefined;
                badge?: number | undefined;
                'thread-id'?: string | undefined;
                'content-available'?: number | undefined;
                'mutable-content'?: number | undefined;
            };
        } | undefined;
    } | undefined;
    webpush?: {
        notification?: {
            title?: string | undefined;
            tag?: string | undefined;
            body?: string | undefined;
            image?: string | undefined;
            icon?: string | undefined;
            color?: string | undefined;
            click_action?: string | undefined;
            badge?: string | undefined;
            actions?: {
                title: string;
                action: string;
                icon?: string | undefined;
            }[] | undefined;
        } | undefined;
        data?: Record<string, any> | undefined;
        headers?: Record<string, string> | undefined;
    } | undefined;
}, {
    condition?: string | undefined;
    to?: string | undefined;
    registration_ids?: string[] | undefined;
    notification?: {
        title: string;
        body: string;
        tag?: string | undefined;
        image?: string | undefined;
        icon?: string | undefined;
        color?: string | undefined;
        sound?: string | undefined;
        click_action?: string | undefined;
        body_loc_key?: string | undefined;
        body_loc_args?: string[] | undefined;
        title_loc_key?: string | undefined;
        title_loc_args?: string[] | undefined;
    } | undefined;
    data?: Record<string, string> | undefined;
    android?: {
        notification?: {
            title?: string | undefined;
            tag?: string | undefined;
            body?: string | undefined;
            icon?: string | undefined;
            color?: string | undefined;
            sound?: string | undefined;
            click_action?: string | undefined;
            body_loc_key?: string | undefined;
            body_loc_args?: string[] | undefined;
            title_loc_key?: string | undefined;
            title_loc_args?: string[] | undefined;
            channel_id?: string | undefined;
            ticker?: string | undefined;
            sticky?: boolean | undefined;
            event_time?: string | undefined;
            local_only?: boolean | undefined;
            notification_priority?: "PRIORITY_MIN" | "PRIORITY_LOW" | "PRIORITY_DEFAULT" | "PRIORITY_HIGH" | "PRIORITY_MAX" | undefined;
            default_sound?: boolean | undefined;
            default_vibrate_timings?: boolean | undefined;
            default_light_settings?: boolean | undefined;
            vibrate_timings?: string[] | undefined;
            visibility?: "PRIVATE" | "PUBLIC" | "SECRET" | undefined;
            notification_count?: number | undefined;
        } | undefined;
        data?: Record<string, string> | undefined;
        collapse_key?: string | undefined;
        priority?: "normal" | "high" | undefined;
        ttl?: string | undefined;
        restricted_package_name?: string | undefined;
    } | undefined;
    apns?: {
        headers?: Record<string, string> | undefined;
        payload?: {
            aps: {
                category?: string | undefined;
                sound?: string | {
                    critical?: boolean | undefined;
                    name?: string | undefined;
                    volume?: number | undefined;
                } | undefined;
                alert?: string | {
                    title?: string | undefined;
                    body?: string | undefined;
                    subtitle?: string | undefined;
                    'launch-image'?: string | undefined;
                    'title-loc-key'?: string | undefined;
                    'title-loc-args'?: string[] | undefined;
                    'subtitle-loc-key'?: string | undefined;
                    'subtitle-loc-args'?: string[] | undefined;
                    'loc-key'?: string | undefined;
                    'loc-args'?: string[] | undefined;
                } | undefined;
                badge?: number | undefined;
                'thread-id'?: string | undefined;
                'content-available'?: number | undefined;
                'mutable-content'?: number | undefined;
            };
        } | undefined;
    } | undefined;
    webpush?: {
        notification?: {
            title?: string | undefined;
            tag?: string | undefined;
            body?: string | undefined;
            image?: string | undefined;
            icon?: string | undefined;
            color?: string | undefined;
            click_action?: string | undefined;
            badge?: string | undefined;
            actions?: {
                title: string;
                action: string;
                icon?: string | undefined;
            }[] | undefined;
        } | undefined;
        data?: Record<string, any> | undefined;
        headers?: Record<string, string> | undefined;
    } | undefined;
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
    fcm_message_id: z.ZodOptional<z.ZodString>;
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
    fcm_message_id?: string | undefined;
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
    fcm_message_id?: string | undefined;
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
    timezone: string;
    quiet_hours_start?: string | undefined;
    quiet_hours_end?: string | undefined;
}, {
    user_id: string;
    created_at: Date;
    updated_at: Date;
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
    timezone?: string | undefined;
}>;
export type NotificationPreferences = z.infer<typeof NotificationPreferencesSchema>;
export declare const FCMSubscriptionSchema: z.ZodObject<{
    user_id: z.ZodString;
    fcm_token: z.ZodString;
    platform: z.ZodEnum<["web", "ios", "android"]>;
    device_type: z.ZodEnum<["web_push", "ios", "android"]>;
    device_id: z.ZodOptional<z.ZodString>;
    app_version: z.ZodOptional<z.ZodString>;
    is_active: z.ZodDefault<z.ZodBoolean>;
    subscription_data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    created_at: z.ZodDate;
    updated_at: z.ZodDate;
    last_active: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    user_id: string;
    created_at: Date;
    updated_at: Date;
    fcm_token: string;
    platform: "android" | "web" | "ios";
    device_type: "android" | "ios" | "web_push";
    is_active: boolean;
    device_id?: string | undefined;
    app_version?: string | undefined;
    subscription_data?: Record<string, any> | undefined;
    last_active?: Date | undefined;
}, {
    user_id: string;
    created_at: Date;
    updated_at: Date;
    fcm_token: string;
    platform: "android" | "web" | "ios";
    device_type: "android" | "ios" | "web_push";
    device_id?: string | undefined;
    app_version?: string | undefined;
    is_active?: boolean | undefined;
    subscription_data?: Record<string, any> | undefined;
    last_active?: Date | undefined;
}>;
export type FCMSubscription = z.infer<typeof FCMSubscriptionSchema>;
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
