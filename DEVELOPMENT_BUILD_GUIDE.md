# Development Build Guide for FCM Testing

## 🚨 Important: Expo Go Limitations

**Push notifications do NOT work in Expo Go** starting from SDK 53. You need to use a development build to test FCM functionality.

## Current Issues in Expo Go

When running in Expo Go, you'll see these errors:
- `expo-notifications: Android Push notifications functionality was removed from Expo Go with SDK 53`
- `Error encountered while fetching Expo token, expected an OK response, received: 400`
- `"projectId": Invalid uuid` validation error

## Solutions

### Option 1: EAS Development Build (Recommended)

#### 1. Install EAS CLI
```bash
npm install -g @expo/eas-cli
```

#### 2. Login to EAS
```bash
eas login
```

#### 3. Configure EAS Build
```bash
eas build:configure
```

#### 4. Create Development Build
```bash
# For iOS
eas build --platform ios --profile development

# For Android
eas build --platform android --profile development
```

#### 5. Install on Device
- Download the build from EAS dashboard
- Install on your physical device
- FCM will work properly in the development build

### Option 2: Local Development Build

#### 1. Setup Local Environment

**For iOS:**
```bash
# Install Xcode and iOS dependencies
npx expo install --fix
npx expo run:ios
```

**For Android:**
```bash
# Install Android Studio and Android SDK
npx expo install --fix
npx expo run:android
```

#### 2. Run on Physical Device
```bash
# iOS (with device connected)
npx expo run:ios --device

# Android (with device connected or emulator)
npx expo run:android --device
```

## Testing FCM in Development Build

### 1. Verify FCM Configuration
- Check that Firebase project ID matches in both `app.json` and environment variables
- Ensure all Firebase configuration values are correct
- Verify Android/iOS app is properly configured in Firebase Console

### 2. Test Notification Flow
1. **Permission Request**: App should request notification permission
2. **Token Generation**: FCM token should be generated successfully
3. **Token Registration**: Token should be sent to your backend
4. **Notification Sending**: Test sending notifications from Firebase Console
5. **Notification Handling**: Verify notifications are received and handled

### 3. Debug Tools
- Use React Native Debugger or Flipper
- Check Firebase Console for message delivery status
- Monitor device logs for FCM-related messages

## Current Configuration Status

### ✅ Fixed Issues
- **Project ID Mismatch**: Updated `app.json` to use `"rentitforward-mobile"` instead of `"rent-it-forward"`
- **Expo Go Detection**: Added graceful handling for Expo Go limitations
- **Error Messages**: Improved error messages with helpful guidance

### 🔧 Environment Variables
```env
EXPO_PUBLIC_FIREBASE_PROJECT_ID=rentitforward-mobile
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyCLbtvFnFTvm7_d1obz5KDgx9Ifck4uOf4
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=rentitforward-mobile.firebaseapp.com
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=rentitforward-mobile.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=793254315983
EXPO_PUBLIC_FIREBASE_APP_ID=1:793254315983:android:ca7bede09f9387f4b2f4ba
```

## Expected Behavior

### In Expo Go
- ⚠️ Warning messages about Expo Go limitations
- 🚫 FCM token requests will fail gracefully
- ℹ️ Helpful messages directing to use development build

### In Development Build
- ✅ FCM initialization should succeed
- ✅ Permission requests should work
- ✅ Token generation should succeed
- ✅ Notifications should be received and handled

## Troubleshooting

### Common Issues

#### 1. "Invalid uuid" Error
- **Cause**: Project ID format mismatch
- **Solution**: Ensure `app.json` and environment variables use the same project ID

#### 2. Token Generation Fails
- **Cause**: Running in Expo Go or missing permissions
- **Solution**: Use development build and ensure device permissions

#### 3. Notifications Not Received
- **Cause**: Various factors (permissions, token registration, Firebase config)
- **Solution**: Check Firebase Console, verify token registration, test with Firebase test messages

### Debug Steps
1. Check console logs for FCM-related messages
2. Verify Firebase project configuration
3. Test with Firebase Console test messages
4. Check device notification settings
5. Verify backend token registration

## Next Steps

1. **Create Development Build**: Use EAS Build or local build
2. **Test on Physical Device**: Install development build on real device
3. **Verify FCM Flow**: Test complete notification flow
4. **Backend Integration**: Ensure backend can send notifications to registered tokens

## Resources

- [Expo Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
