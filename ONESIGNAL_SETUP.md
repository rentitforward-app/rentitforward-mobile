# OneSignal Push Notifications Setup Guide

This guide will help you set up OneSignal push notifications for both web and mobile platforms in the Rent It Forward application.

## Prerequisites

1. **OneSignal Account**: Sign up at [https://onesignal.com](https://onesignal.com)
2. **Mobile App Store Credentials** (for mobile):
   - **iOS**: Apple Developer Account with push notification certificates
   - **Android**: Google Firebase project with FCM credentials

## 1. OneSignal Dashboard Setup

### 1.1 Create a New App

1. Log in to OneSignal dashboard
2. Click "New App/Website"
3. Enter app name: "Rent It Forward"
4. Select platforms you want to support:
   - ✅ Web Push
   - ✅ iOS
   - ✅ Android

### 1.2 Web Platform Setup

1. **Choose Integration**: Select "Typical Site"
2. **Site Setup**:
   - **Site Name**: Rent It Forward
   - **Site URL**: Your production domain (e.g., `https://rentitforward.com`)
   - **Default Icon URL**: Upload your app icon
3. **Auto Resubscribe**: Enable (recommended)
4. **Choose a Subscription Bell**: Optional (we have custom UI)

### 1.3 Mobile Platform Setup

#### iOS Setup
1. **Upload iOS Push Certificate**:
   - Download your push certificate from Apple Developer Portal
   - Upload the `.p12` file to OneSignal
   - Enter the certificate password

#### Android Setup
1. **Firebase Server Key**:
   - Go to Firebase Console
   - Select your project → Settings → Cloud Messaging
   - Copy the Server Key
   - Paste it in OneSignal Android setup

### 1.4 Get Your App Credentials

After setup, note down these important values:
- **App ID**: Found in Settings → Keys & IDs
- **REST API Key**: Found in Settings → Keys & IDs (keep this secret!)

## 2. Environment Variables Setup

### 2.1 Web App (.env.local)

```bash
# OneSignal Configuration
NEXT_PUBLIC_ONESIGNAL_APP_ID="your-onesignal-app-id"
ONESIGNAL_API_KEY="your-onesignal-rest-api-key"

# Internal API Security (generate a random string)
INTERNAL_API_KEY="your-random-internal-api-key"
```

### 2.2 Mobile App (app.config.js)

```javascript
export default {
  expo: {
    // ... existing config
    extra: {
      oneSignalAppId: "your-onesignal-app-id",
    },
    plugins: [
      [
        "onesignal-expo-plugin",
        {
          mode: "development", // or "production"
        },
      ],
    ],
  },
};
```

## 3. Package Installation

### 3.1 Web App

```bash
cd rentitforward-web
npm install react-onesignal
```

### 3.2 Mobile App

```bash
cd rentitforward-mobile
npx expo install onesignal-expo-plugin
npm install react-native-onesignal
```

## 4. Web Integration

### 4.1 Add OneSignal Script to Layout

Add to `app/layout.tsx`:

```jsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.onesignal.com/sdks/OneSignalSDK.js" async="" />
      </head>
      <body>
        <OneSignalProvider>
          {children}
        </OneSignalProvider>
      </body>
    </html>
  );
}
```

### 4.2 Initialize OneSignal Provider

The `OneSignalProvider` component is already created in `src/components/OneSignalProvider.tsx`. It will automatically:
- Initialize OneSignal with your App ID
- Set external user ID when user logs in
- Handle subscription management

### 4.3 Add Notification Settings to User Dashboard

```jsx
import { NotificationSettings } from '@/components/notifications/NotificationSettings';

function SettingsPage() {
  return (
    <div>
      <h1>Settings</h1>
      <NotificationSettings />
    </div>
  );
}
```

## 5. Mobile Integration

### 5.1 Update App Config

Ensure your `app.config.js` includes the OneSignal plugin:

```javascript
export default {
  expo: {
    name: "Rent It Forward",
    slug: "rentitforward-mobile",
    plugins: [
      [
        "onesignal-expo-plugin",
        {
          mode: "development", // Change to "production" for production builds
        },
      ],
    ],
    extra: {
      oneSignalAppId: process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID,
    },
    ios: {
      bundleIdentifier: "com.rentitforward.mobile",
      infoPlist: {
        UIBackgroundModes: ["remote-notification"],
      },
    },
    android: {
      package: "com.rentitforward.mobile",
    },
  },
};
```

### 5.2 Environment Variables

Create `.env` file in mobile directory:

```bash
EXPO_PUBLIC_ONESIGNAL_APP_ID=your-onesignal-app-id
```

### 5.3 Initialize OneSignal in App

The `OneSignalProvider` component in `src/components/OneSignalProvider.tsx` handles initialization. Wrap your app:

```jsx
// app/_layout.tsx
import { OneSignalProvider } from '../src/components/OneSignalProvider';

export default function RootLayout() {
  return (
    <OneSignalProvider>
      <Stack>
        {/* Your app screens */}
      </Stack>
    </OneSignalProvider>
  );
}
```

### 5.4 Add Notification Settings Screen

```jsx
// app/settings/notifications.tsx
import { NotificationSettings } from '../../src/components/NotificationSettings';

export default function NotificationSettingsScreen() {
  return <NotificationSettings />;
}
```

## 6. Database Setup

### 6.1 Run Migration

Apply the notification preferences migration:

```bash
cd rentitforward-web
# If using Supabase locally
supabase db reset

# If using hosted Supabase, apply migration manually in SQL editor
```

The migration creates:
- `notification_preferences` table for user preferences
- `notification_logs` table for tracking sent notifications
- Helper functions for preference management

## 7. Testing Push Notifications

### 7.1 Test Web Notifications

1. Start the web app: `npm run dev`
2. Open browser and navigate to the app
3. Log in with a test user
4. Go to Settings → Notifications
5. Click "Enable Push" and allow permissions
6. Test sending a notification from OneSignal dashboard

### 7.2 Test Mobile Notifications

1. Build and run the app on device/simulator
2. Log in with a test user
3. Go to Settings → Notifications
4. Enable notifications and grant permissions
5. Test from OneSignal dashboard

### 7.3 Test from OneSignal Dashboard

1. Go to OneSignal → Messages → Push
2. Create a new message
3. Target specific users by External User ID (user UUID)
4. Send and verify delivery

## 8. Notification Triggers Integration

### 8.1 Booking Notifications

When a booking is created, add to your booking creation logic:

```typescript
import { BookingNotificationTriggers } from 'rentitforward-shared';

// After booking creation
await BookingNotificationTriggers.sendBookingRequest({
  listing_owner_id: listing.owner_id,
  renter_name: user.name,
  item_title: listing.title,
  duration: bookingDuration,
  booking_id: booking.id,
  start_date: booking.start_date,
  end_date: booking.end_date,
  price_total: booking.total_price,
});
```

### 8.2 Message Notifications

When a message is sent:

```typescript
import { MessageNotificationTriggers } from 'rentitforward-shared';

await MessageNotificationTriggers.sendMessageReceived({
  recipient_id: recipient.id,
  sender_name: sender.name,
  item_title: listing.title,
  message_id: message.id,
  message_preview: message.content.substring(0, 100),
});
```

### 8.3 Payment Notifications

When payment is processed:

```typescript
import { PaymentNotificationTriggers } from 'rentitforward-shared';

await PaymentNotificationTriggers.sendPaymentReceived({
  owner_id: listing.owner_id,
  amount: payment.amount,
  item_title: listing.title,
  booking_id: booking.id,
  renter_name: renter.name,
});
```

## 9. Production Deployment

### 9.1 Web Deployment

1. **Vercel/Netlify**: Add environment variables in deployment settings
2. **Domain Configuration**: Update OneSignal settings with production domain
3. **HTTPS Required**: Ensure your domain has valid SSL certificate

### 9.2 Mobile Deployment

1. **iOS**:
   - Upload production push certificate to OneSignal
   - Set `mode: "production"` in `onesignal-expo-plugin`
   - Build with `eas build --platform ios --profile production`

2. **Android**:
   - Ensure Firebase project is configured for production
   - Build with `eas build --platform android --profile production`

## 10. Troubleshooting

### Common Issues

1. **"OneSignal not defined" error**:
   - Ensure OneSignal script is loaded before initialization
   - Check browser console for script loading errors

2. **Notifications not received on mobile**:
   - Verify app is built with OneSignal plugin
   - Check device notification permissions
   - Verify OneSignal App ID is correct

3. **Web notifications blocked**:
   - User must manually enable in browser settings
   - Test in incognito mode to reset permissions

4. **External User ID not set**:
   - Ensure user is logged in before OneSignal initialization
   - Check that `setExternalUserId` is called with user UUID

### Debugging Tools

1. **OneSignal Dashboard**: Check delivery reports and user subscriptions
2. **Browser DevTools**: Check console for OneSignal logs
3. **Mobile Debug Builds**: Use Expo development builds for debugging

## 11. Best Practices

1. **Respect User Preferences**: Always check user notification preferences before sending
2. **Rate Limiting**: Don't spam users with too many notifications
3. **Personalization**: Use user data to make notifications relevant
4. **Timing**: Consider user timezone for scheduled notifications
5. **Testing**: Test on real devices, not just simulators
6. **Analytics**: Track notification performance and engagement

## 12. Security Considerations

1. **API Keys**: Keep REST API key secret (server-side only)
2. **User Verification**: Verify user identity before sending sensitive notifications
3. **Data Privacy**: Follow GDPR/privacy laws for notification data
4. **Rate Limiting**: Implement server-side rate limiting for notification endpoints

---

## Support

For issues with this implementation:
1. Check OneSignal documentation: https://documentation.onesignal.com/
2. Review this setup guide
3. Check application logs for errors
4. Test with OneSignal dashboard tools

For Rent It Forward specific issues, contact the development team. 