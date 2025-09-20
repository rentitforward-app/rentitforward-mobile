# Firebase Cloud Messaging (FCM) Implementation

This document outlines the complete Firebase Cloud Messaging implementation for the Rent It Forward mobile app, replacing OneSignal.

## Overview

We've implemented a comprehensive notification system using Firebase Cloud Messaging (FCM) with the following features:

- **Push Notifications**: Real-time notifications for bookings, messages, payments, and system updates
- **Notification Categories**: Organized notifications with proper Android channels and iOS categories
- **User Preferences**: Granular control over notification types
- **Badge Management**: Automatic badge count updates
- **Deep Linking**: Navigation to relevant screens from notifications
- **Cross-Platform**: Works on both iOS and Android

## Architecture

### Core Components

1. **FCMService** (`src/lib/fcm.ts`)
   - Handles FCM initialization and configuration
   - Manages notification permissions and tokens
   - Configures notification channels (Android) and categories (iOS)
   - Handles notification reception and user interactions

2. **FCMProvider** (`src/components/FCMProvider.tsx`)
   - React context provider for FCM functionality
   - Manages FCM state and user authentication
   - Provides hooks for notification management

3. **NotificationService** (`src/lib/notification-service.ts`)
   - High-level service for sending notifications
   - Handles notification templates and user preferences
   - Stores notifications locally for in-app display

4. **Notification Hooks** (`src/hooks/useNotifications.ts`)
   - Easy-to-use hooks for triggering notifications
   - Type-safe notification contexts
   - Testing utilities for development

### UI Components

1. **Notifications Tab** (`app/(tabs)/notifications.tsx`)
   - Displays all received notifications
   - Mark as read/unread functionality
   - Clear notifications
   - Deep linking to relevant screens

2. **Notification Settings** (`app/account/notifications.tsx`)
   - Configure notification preferences
   - Enable/disable push notifications
   - Granular category controls

3. **Notification Badge** (`src/components/NotificationBadge.tsx`)
   - Badge component for tab icons
   - Automatic count updates
   - Customizable appearance

## Setup Instructions

### 1. Install Dependencies

The following dependencies are already added to `package.json`:

```json
{
  "expo-notifications": "~0.31.0",
  "expo-device": "~7.0.1"
}
```

Install them:
```bash
npm install
```

### 2. Configure Firebase Project

1. Create a Firebase project at https://console.firebase.google.com
2. Add your iOS and Android apps to the project
3. Download configuration files:
   - `google-services.json` for Android
   - `GoogleService-Info.plist` for iOS
4. Add these files to your project root

### 3. Update App Configuration

Add Firebase configuration to `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/icons/notification-icon.png",
          "color": "#44D62C",
          "defaultChannel": "default"
        }
      ]
    ],
    "extra": {
      "firebaseProjectId": "your-project-id",
      "firebaseApiKey": "your-api-key",
      "firebaseAppId": "your-app-id",
      "firebaseMessagingSenderId": "your-sender-id"
    }
  }
}
```

### 4. Add Notification Icon

Create a notification icon and place it at:
- `assets/icons/notification-icon.png` (Android)

## Usage

### Basic Notification Sending

```typescript
import { useNotifications } from '../hooks/useNotifications';

function BookingComponent() {
  const { notifyBookingRequest } = useNotifications();

  const handleBookingRequest = async () => {
    await notifyBookingRequest('user-id', {
      booking_id: 'booking-123',
      item_title: 'Canon EOS R5 Camera',
      renter_name: 'John Doe',
    });
  };

  return (
    <TouchableOpacity onPress={handleBookingRequest}>
      <Text>Send Booking Request</Text>
    </TouchableOpacity>
  );
}
```

### Managing Notification Preferences

```typescript
import { useNotificationPreferences } from '../components/FCMProvider';

function SettingsComponent() {
  const { preferences, updatePreference } = useNotificationPreferences();

  const toggleBookingNotifications = async () => {
    await updatePreference('booking_notifications', !preferences.booking_notifications);
  };

  return (
    <Switch
      value={preferences.booking_notifications}
      onValueChange={toggleBookingNotifications}
    />
  );
}
```

### Badge Management

```typescript
import { useNotificationBadge } from '../components/FCMProvider';

function TabIcon() {
  const { count, clear } = useNotificationBadge();

  return (
    <TabIconWithBadge badgeCount={count}>
      <Ionicons name="notifications" size={24} />
    </TabIconWithBadge>
  );
}
```

## Notification Types

The system supports the following notification types:

### Booking Notifications
- `booking_request`: New booking request received
- `booking_confirmed`: Booking has been confirmed
- `booking_cancelled`: Booking has been cancelled
- `booking_completed`: Booking has been completed

### Message Notifications
- `message_received`: New message received

### Payment Notifications
- `payment_received`: Payment has been received
- `payment_failed`: Payment has failed

### Review Notifications
- `review_received`: New review received
- `review_request`: Review requested

### System Notifications
- `system_announcement`: System announcement
- `reminder`: General reminder

## Notification Channels (Android)

The app configures the following notification channels:

- **Urgent**: High-priority, time-sensitive notifications
- **Bookings**: Booking-related notifications
- **Messages**: Message notifications
- **Payments**: Payment-related notifications
- **Reviews**: Review notifications
- **System**: System announcements and reminders
- **Marketing**: Promotional content

## Notification Categories (iOS)

Interactive notification categories for iOS:

- **Booking**: Accept/Decline actions for booking requests
- **Message**: Reply/View actions for messages
- **Payment**: View Details action for payments

## Testing

### Development Testing

In development mode, you can test notifications using the test button in the notifications tab:

1. Open the app in development mode
2. Navigate to the Notifications tab
3. Tap the "Test" button to generate sample notifications

### Manual Testing

```typescript
import { useTestNotifications } from '../hooks/useNotifications';

function TestComponent() {
  const {
    testBookingRequest,
    testNewMessage,
    testPaymentReceived,
    testAllNotifications,
  } = useTestNotifications();

  return (
    <View>
      <Button title="Test Booking Request" onPress={testBookingRequest} />
      <Button title="Test New Message" onPress={testNewMessage} />
      <Button title="Test Payment Received" onPress={testPaymentReceived} />
      <Button title="Test All Notifications" onPress={testAllNotifications} />
    </View>
  );
}
```

## Backend Integration

### Sending Notifications from Backend

Your backend should send notifications using the FCM Admin SDK:

```javascript
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

// Send notification
const message = {
  notification: {
    title: 'New Booking Request',
    body: 'John Doe wants to rent your Canon EOS R5 Camera',
  },
  data: {
    type: 'booking_request',
    booking_id: 'booking-123',
    action_url: '/bookings/booking-123',
  },
  token: userFcmToken,
  android: {
    notification: {
      channelId: 'bookings',
      priority: 'high',
    },
  },
  apns: {
    payload: {
      aps: {
        category: 'booking',
        badge: 1,
      },
    },
  },
};

await admin.messaging().send(message);
```

### Token Management

Store FCM tokens in your database and associate them with users:

```sql
CREATE TABLE fcm_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  fcm_token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  device_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, fcm_token)
);
```

## Troubleshooting

### Common Issues

1. **Notifications not appearing**
   - Check if permissions are granted
   - Verify FCM token is being sent to backend
   - Check notification channel configuration (Android)

2. **Badge count not updating**
   - Ensure `setBadgeCount` is called after notification handling
   - Check iOS badge entitlements

3. **Deep linking not working**
   - Verify URL schemes are configured correctly
   - Check navigation logic in notification handlers

### Debug Tools

Enable debug logging in development:

```typescript
// In FCMService constructor
if (__DEV__) {
  console.log('FCM Debug Mode Enabled');
}
```

### Testing on Device

1. **iOS Simulator**: Push notifications don't work in simulator
2. **Android Emulator**: Works with Google Play Services
3. **Physical Devices**: Required for full testing

## Security Considerations

1. **Token Security**: FCM tokens should be treated as sensitive data
2. **Validation**: Always validate notification data on the backend
3. **Rate Limiting**: Implement rate limiting for notification sending
4. **User Consent**: Respect user notification preferences

## Performance

1. **Token Refresh**: Handle token refresh automatically
2. **Batch Operations**: Batch notification operations when possible
3. **Storage**: Limit stored notifications to prevent memory issues
4. **Background Processing**: Handle notifications efficiently in background

## Migration from OneSignal

The FCM implementation replaces OneSignal with the following benefits:

1. **Native Integration**: Direct Firebase integration
2. **Better Control**: More granular control over notification behavior
3. **Cost Effective**: No third-party service fees
4. **Platform Alignment**: Better alignment with Google/Apple guidelines

### Migration Checklist

- [x] Remove OneSignal dependencies
- [x] Implement FCM service
- [x] Update notification UI
- [x] Configure notification channels/categories
- [x] Implement user preferences
- [x] Add badge management
- [x] Create testing utilities
- [x] Update shared types
- [ ] Update backend to use FCM Admin SDK
- [ ] Migrate existing user preferences
- [ ] Update deployment configuration

## Next Steps

1. **Backend Integration**: Update your backend to use FCM Admin SDK
2. **User Migration**: Migrate existing OneSignal user preferences
3. **Analytics**: Implement notification analytics and tracking
4. **A/B Testing**: Test different notification strategies
5. **Rich Notifications**: Add rich media support for notifications

## Resources

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Expo Notifications Documentation](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [FCM Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [iOS Push Notifications Guidelines](https://developer.apple.com/design/human-interface-guidelines/push-notifications)
- [Android Notification Guidelines](https://developer.android.com/guide/topics/ui/notifiers/notifications)
