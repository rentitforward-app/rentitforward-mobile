# Mobile Environment Setup for FCM

This document outlines the environment variable configuration for Firebase Cloud Messaging (FCM) in the React Native mobile app.

## Environment Files Updated

### 1. `.env.local` (Development)
Contains the actual Firebase configuration values for development:
```env
# Firebase Cloud Messaging (FCM) Configuration
EXPO_PUBLIC_FIREBASE_PROJECT_ID=rentitforward-mobile
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyCLbtvFnFTvm7_d1obz5KDgx9Ifck4uOf4
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=rentitforward-mobile.firebaseapp.com
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=rentitforward-mobile.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=793254315983
EXPO_PUBLIC_FIREBASE_APP_ID=1:793254315983:android:ca7bede09f9387f4b2f4ba
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 2. `.env.production` (Production)
Contains the Firebase configuration values for production deployment:
```env
# Firebase Cloud Messaging (FCM) Configuration
EXPO_PUBLIC_FIREBASE_PROJECT_ID=rentitforward-mobile
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyCLbtvFnFTvm7_d1obz5KDgx9Ifck4uOf4
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=rentitforward-mobile.firebaseapp.com
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=rentitforward-mobile.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=793254315983
EXPO_PUBLIC_FIREBASE_APP_ID=1:793254315983:android:ca7bede09f9387f4b2f4ba
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 3. `.env.production.template` (Template)
Template file with placeholder values for production setup:
```env
# Firebase Cloud Messaging (FCM) Configuration
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_project_id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_project_id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
```

## Environment Variable Usage

### FCM Service Configuration
The FCM service (`src/lib/fcm.ts`) reads these environment variables:

```typescript
export function getFCMService(): FCMService {
  if (!fcmService) {
    // Get config from environment variables or Expo config
    const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 
                     Constants.expoConfig?.extra?.firebaseProjectId || '';
    const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 
                  Constants.expoConfig?.extra?.firebaseApiKey || '';
    const appId = process.env.EXPO_PUBLIC_FIREBASE_APP_ID || 
                 Constants.expoConfig?.extra?.firebaseAppId || '';
    const messagingSenderId = process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 
                             Constants.expoConfig?.extra?.firebaseMessagingSenderId || '';
    
    fcmService = new FCMService({
      ...defaultFCMConfig,
      projectId,
      apiKey,
      appId,
      messagingSenderId,
    });
  }
  
  return fcmService;
}
```

### Expo Configuration Fallback
The service also supports configuration through `app.json` via the `extra` field as a fallback:

```json
{
  "expo": {
    "extra": {
      "firebaseProjectId": "rentitforward-mobile",
      "firebaseApiKey": "AIzaSyCLbtvFnFTvm7_d1obz5KDgx9Ifck4uOf4",
      "firebaseAppId": "1:793254315983:android:ca7bede09f9387f4b2f4ba",
      "firebaseMessagingSenderId": "793254315983"
    }
  }
}
```

## Variable Descriptions

### Required Variables
- **EXPO_PUBLIC_FIREBASE_PROJECT_ID**: Your Firebase project ID
- **EXPO_PUBLIC_FIREBASE_API_KEY**: Firebase Web API key (safe for client-side use)
- **EXPO_PUBLIC_FIREBASE_APP_ID**: Firebase app ID (Android or iOS)
- **EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID**: FCM sender ID for push notifications

### Optional Variables
- **EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN**: Firebase Auth domain (usually `{project-id}.firebaseapp.com`)
- **EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET**: Firebase Storage bucket (usually `{project-id}.appspot.com`)
- **EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID**: Google Analytics measurement ID (optional)

## Security Notes

### Client-Side Safety
All Firebase configuration keys are prefixed with `EXPO_PUBLIC_` because they are safe for client-side use:
- These keys are designed to be public
- Security is enforced by Firebase Security Rules, not by hiding keys
- App Check can be implemented for additional security

### Platform-Specific Configuration
The current configuration uses the Android app ID and API key. For iOS-specific configuration:
- Use the iOS app ID: `1:793254315983:ios:your_ios_app_id`
- Use the iOS API key if different from Android

## Migration from OneSignal

### Removed Variables
The following OneSignal variables have been commented out:
```env
# Legacy OneSignal (deprecated - migrating to FCM)
# NEXT_PUBLIC_ONESIGNAL_APP_ID="c2dc70ad-f5de-4b7c-8318-819c517cdb00"
# ONESIGNAL_API_KEY="os_v2_app_ylohblpv3zfxzayyqgofc7g3aasyuwjfub6umpnjs7yvo47wradrb4gf6q4iwx54dy62ainjtkaf7lumi6nqa55d4olh4ysqj7xnceq"
```

### Added Variables
New Firebase FCM variables have been added to replace OneSignal functionality.

## Development vs Production

### Development Configuration
- Uses test/development Firebase project
- May have different API keys and project IDs
- Configured in `.env.local`

### Production Configuration
- Uses production Firebase project
- Production API keys and project IDs
- Configured in `.env.production`
- Should be kept secure and not committed to version control

## Setup Instructions

### For New Developers
1. Copy `.env.production.template` to `.env.local`
2. Replace placeholder values with actual Firebase configuration
3. Ensure Firebase project is properly configured for FCM
4. Test notification functionality in development

### For Production Deployment
1. Update `.env.production` with production Firebase configuration
2. Ensure EAS build includes correct environment variables
3. Test FCM functionality on production builds
4. Monitor Firebase Console for delivery metrics

## Troubleshooting

### Common Issues
1. **FCM not initializing**: Check that all required environment variables are set
2. **Notifications not received**: Verify Firebase project configuration and API keys
3. **Build errors**: Ensure environment variables are properly loaded by Expo

### Debug Steps
1. Check environment variable values in FCM service initialization
2. Verify Firebase project settings in Firebase Console
3. Test with Firebase Console test messages
4. Check device logs for FCM-related errors

## References
- [Firebase Console](https://console.firebase.google.com/)
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
