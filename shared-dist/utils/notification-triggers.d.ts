import { NotificationType } from '../types/notification';
/**
 * Booking-related notification triggers
 */
export declare class BookingNotificationTriggers {
    /**
     * Send notification when a new booking request is made
     */
    static sendBookingRequest(data: {
        listing_owner_id: string;
        renter_name: string;
        item_title: string;
        duration: number;
        booking_id: string;
        start_date: string;
        end_date: string;
        price_total: number;
    }): Promise<void>;
    /**
     * Send notification when a booking is confirmed
     */
    static sendBookingConfirmed(data: {
        renter_id: string;
        item_title: string;
        booking_id: string;
        start_date: string;
        owner_name: string;
    }): Promise<void>;
    /**
     * Send notification when a booking is cancelled
     */
    static sendBookingCancelled(data: {
        affected_user_id: string;
        item_title: string;
        booking_id: string;
        reason?: string;
    }): Promise<void>;
    /**
     * Send notification when a booking is completed
     */
    static sendBookingCompleted(data: {
        renter_id: string;
        item_title: string;
        booking_id: string;
    }): Promise<void>;
}
/**
 * Payment-related notification triggers
 */
export declare class PaymentNotificationTriggers {
    /**
     * Send notification when payment is received
     */
    static sendPaymentReceived(data: {
        owner_id: string;
        amount: number;
        item_title: string;
        booking_id: string;
        renter_name: string;
    }): Promise<void>;
    /**
     * Send notification when payment fails
     */
    static sendPaymentFailed(data: {
        renter_id: string;
        item_title: string;
        booking_id: string;
        error_message?: string;
    }): Promise<void>;
}
/**
 * Message-related notification triggers
 */
export declare class MessageNotificationTriggers {
    /**
     * Send notification when a new message is received
     */
    static sendMessageReceived(data: {
        recipient_id: string;
        sender_name: string;
        item_title: string;
        message_id: string;
        message_preview?: string;
    }): Promise<void>;
}
/**
 * Review-related notification triggers
 */
export declare class ReviewNotificationTriggers {
    /**
     * Send notification when a review is received
     */
    static sendReviewReceived(data: {
        reviewee_id: string;
        reviewer_name: string;
        rating: number;
        review_id: string;
        item_title?: string;
    }): Promise<void>;
    /**
     * Send notification requesting a review
     */
    static sendReviewRequest(data: {
        user_id: string;
        item_title: string;
        booking_id: string;
        days_after_completion?: number;
    }): Promise<void>;
}
/**
 * Listing-related notification triggers
 */
export declare class ListingNotificationTriggers {
    /**
     * Send notification when a listing is approved
     */
    static sendListingApproved(data: {
        owner_id: string;
        item_title: string;
        listing_id: string;
    }): Promise<void>;
    /**
     * Send notification when a listing is rejected
     */
    static sendListingRejected(data: {
        owner_id: string;
        item_title: string;
        listing_id: string;
        reason?: string;
    }): Promise<void>;
}
/**
 * System notification triggers
 */
export declare class SystemNotificationTriggers {
    /**
     * Send system announcement to all users or specific segments
     */
    static sendSystemAnnouncement(data: {
        announcement_text: string;
        target_users?: string[];
        urgency?: 'immediate' | 'normal' | 'low';
    }): Promise<void>;
    /**
     * Send a reminder notification
     */
    static sendReminder(data: {
        user_id: string;
        reminder_text: string;
        urgency?: 'immediate' | 'normal' | 'low';
    }): Promise<void>;
}
/**
 * Batch notification sending for multiple users
 */
export declare function sendBatchNotifications(notifications: Array<{
    user_id: string;
    type: NotificationType;
    context: any;
    urgency?: 'immediate' | 'normal' | 'low';
}>): Promise<void>;
/**
 * Scheduled notification helpers
 */
export declare class ScheduledNotifications {
    /**
     * Schedule a booking reminder (e.g., 24 hours before start date)
     */
    static scheduleBookingReminder(data: {
        user_id: string;
        booking_id: string;
        item_title: string;
        start_date: Date;
        hours_before: number;
    }): Promise<void>;
    /**
     * Schedule a review request (e.g., 3 days after booking completion)
     */
    static scheduleReviewRequest(data: {
        user_id: string;
        booking_id: string;
        item_title: string;
        completion_date: Date;
        days_after: number;
    }): Promise<void>;
}
