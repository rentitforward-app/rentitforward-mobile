import { useCallback } from 'react';
import { 
  getNotificationService,
  sendBookingRequestNotification,
  sendBookingConfirmedNotification,
  sendBookingCancelledNotification,
  sendBookingCompletedNotification,
  sendNewMessageNotification,
  sendPaymentReceivedNotification,
  sendPaymentFailedNotification,
} from '../lib/notification-service';

export interface BookingNotificationContext {
  booking_id: string;
  item_title: string;
  renter_name?: string;
  start_date?: string;
  reason?: string;
}

export interface MessageNotificationContext {
  message_id: string;
  sender_name: string;
  item_title: string;
}

export interface PaymentNotificationContext {
  booking_id: string;
  item_title: string;
  amount?: number;
  error_message?: string;
}

export function useNotifications() {
  const notificationService = getNotificationService();

  // Booking notifications
  const notifyBookingRequest = useCallback(
    (userId: string, context: BookingNotificationContext) => {
      if (!context.renter_name) {
        console.error('Renter name is required for booking request notification');
        return;
      }
      return sendBookingRequestNotification(userId, {
        booking_id: context.booking_id,
        item_title: context.item_title,
        renter_name: context.renter_name,
      });
    },
    []
  );

  const notifyBookingConfirmed = useCallback(
    (userId: string, context: BookingNotificationContext) => {
      if (!context.start_date) {
        console.error('Start date is required for booking confirmed notification');
        return;
      }
      return sendBookingConfirmedNotification(userId, {
        booking_id: context.booking_id,
        item_title: context.item_title,
        start_date: context.start_date,
      });
    },
    []
  );

  const notifyBookingCancelled = useCallback(
    (userId: string, context: BookingNotificationContext) => {
      return sendBookingCancelledNotification(userId, {
        booking_id: context.booking_id,
        item_title: context.item_title,
        reason: context.reason,
      });
    },
    []
  );

  const notifyBookingCompleted = useCallback(
    (userId: string, context: BookingNotificationContext) => {
      return sendBookingCompletedNotification(userId, {
        booking_id: context.booking_id,
        item_title: context.item_title,
      });
    },
    []
  );

  // Message notifications
  const notifyNewMessage = useCallback(
    (userId: string, context: MessageNotificationContext) => {
      return sendNewMessageNotification(userId, context);
    },
    []
  );

  // Payment notifications
  const notifyPaymentReceived = useCallback(
    (userId: string, context: PaymentNotificationContext) => {
      if (!context.amount) {
        console.error('Amount is required for payment received notification');
        return;
      }
      return sendPaymentReceivedNotification(userId, {
        booking_id: context.booking_id,
        item_title: context.item_title,
        amount: context.amount,
      });
    },
    []
  );

  const notifyPaymentFailed = useCallback(
    (userId: string, context: PaymentNotificationContext) => {
      return sendPaymentFailedNotification(userId, {
        booking_id: context.booking_id,
        item_title: context.item_title,
        error_message: context.error_message,
      });
    },
    []
  );

  // Review notifications
  const notifyReviewReceived = useCallback(
    async (
      userId: string,
      context: {
        review_id: string;
        reviewer_name: string;
        rating: number;
        item_title: string;
      }
    ) => {
      return notificationService.sendReviewNotification(userId, 'review_received', {
        review_id: context.review_id,
        reviewer_name: context.reviewer_name,
        rating: context.rating,
        item_title: context.item_title,
      });
    },
    [notificationService]
  );

  const notifyReviewRequest = useCallback(
    async (
      userId: string,
      context: {
        booking_id: string;
        item_title: string;
      }
    ) => {
      return notificationService.sendReviewNotification(userId, 'review_request', {
        booking_id: context.booking_id,
        item_title: context.item_title,
      });
    },
    [notificationService]
  );

  // System notifications
  const notifySystemAnnouncement = useCallback(
    async (
      userId: string,
      announcement: string
    ) => {
      return notificationService.sendSystemNotification(userId, 'system_announcement', {
        announcement_text: announcement,
      });
    },
    [notificationService]
  );

  const notifyReminder = useCallback(
    async (
      userId: string,
      reminder: string
    ) => {
      return notificationService.sendSystemNotification(userId, 'reminder', {
        reminder_text: reminder,
      });
    },
    [notificationService]
  );

  return {
    // Booking notifications
    notifyBookingRequest,
    notifyBookingConfirmed,
    notifyBookingCancelled,
    notifyBookingCompleted,
    
    // Message notifications
    notifyNewMessage,
    
    // Payment notifications
    notifyPaymentReceived,
    notifyPaymentFailed,
    
    // Review notifications
    notifyReviewReceived,
    notifyReviewRequest,
    
    // System notifications
    notifySystemAnnouncement,
    notifyReminder,
  };
}

// Hook for testing notifications in development
export function useTestNotifications() {
  const notifications = useNotifications();

  const testBookingRequest = useCallback(() => {
    notifications.notifyBookingRequest('test-user-id', {
      booking_id: 'booking-123',
      item_title: 'Canon EOS R5 Camera',
      renter_name: 'John Doe',
    });
  }, [notifications]);

  const testBookingConfirmed = useCallback(() => {
    notifications.notifyBookingConfirmed('test-user-id', {
      booking_id: 'booking-123',
      item_title: 'Canon EOS R5 Camera',
      start_date: 'March 15, 2024',
    });
  }, [notifications]);

  const testNewMessage = useCallback(() => {
    notifications.notifyNewMessage('test-user-id', {
      message_id: 'message-123',
      sender_name: 'Jane Smith',
      item_title: 'MacBook Pro 16"',
    });
  }, [notifications]);

  const testPaymentReceived = useCallback(() => {
    notifications.notifyPaymentReceived('test-user-id', {
      booking_id: 'booking-123',
      item_title: 'DJI Mavic Air 2',
      amount: 150,
    });
  }, [notifications]);

  const testPaymentFailed = useCallback(() => {
    notifications.notifyPaymentFailed('test-user-id', {
      booking_id: 'booking-123',
      item_title: 'Sony A7 III Camera',
      error_message: 'Insufficient funds',
    });
  }, [notifications]);

  const testReviewReceived = useCallback(() => {
    notifications.notifyReviewReceived('test-user-id', {
      review_id: 'review-123',
      reviewer_name: 'Alice Johnson',
      rating: 5,
      item_title: 'GoPro Hero 11',
    });
  }, [notifications]);

  const testAllNotifications = useCallback(() => {
    testBookingRequest();
    setTimeout(() => testBookingConfirmed(), 1000);
    setTimeout(() => testNewMessage(), 2000);
    setTimeout(() => testPaymentReceived(), 3000);
    setTimeout(() => testPaymentFailed(), 4000);
    setTimeout(() => testReviewReceived(), 5000);
  }, [
    testBookingRequest,
    testBookingConfirmed,
    testNewMessage,
    testPaymentReceived,
    testPaymentFailed,
    testReviewReceived,
  ]);

  return {
    testBookingRequest,
    testBookingConfirmed,
    testNewMessage,
    testPaymentReceived,
    testPaymentFailed,
    testReviewReceived,
    testAllNotifications,
  };
}
