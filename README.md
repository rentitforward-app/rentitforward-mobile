# Rent It Forward - Mobile App

A React Native mobile application built with Expo for the Rent It Forward rental marketplace.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI: `npm install -g @expo/cli`
- For iOS development: Xcode (Mac only)
- For Android development: Android Studio

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on specific platforms:
```bash
# iOS Simulator (Mac only)
npm run ios

# Android Emulator
npm run android

# Web browser
npm run web
```

## 📱 Features

- **Tab Navigation**: Home, Browse, Create Listing, Bookings, Profile
- **Shared Types**: Uses the shared package for consistent type definitions
- **Expo Router**: File-based routing system
- **TypeScript**: Full type safety
- **Cross-Platform**: iOS, Android, and Web support

## 🏗️ Project Structure

```
rentitforward-mobile/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigator screens
│   │   ├── index.tsx      # Home screen
│   │   ├── browse.tsx     # Browse listings
│   │   ├── create.tsx     # Create listing
│   │   ├── bookings.tsx   # User bookings
│   │   └── profile.tsx    # User profile
│   └── _layout.tsx        # Root layout
├── assets/                # Images, icons, splash screens
├── src/                   # Source code (to be created)
│   ├── components/        # Reusable components
│   ├── hooks/             # Custom hooks
│   ├── utils/             # Utility functions
│   └── constants/         # App constants
├── app.json               # Expo configuration
├── eas.json               # EAS Build configuration
└── package.json           # Dependencies
```

## 🛠️ Development

### Running the App

```bash
# Start Expo development server
npm start

# Or with specific options
npx expo start --clear  # Clear cache
npx expo start --tunnel # Use tunnel for external access
```

### Building for Production

#### Setup EAS Build

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Login to Expo:
```bash
eas login
```

3. Configure your project:
```bash
eas build:configure
```

#### Build Commands

```bash
# Build for development
eas build --profile development

# Build for app store preview
eas build --profile preview

# Build for production
eas build --profile production

# Build for specific platform
eas build --platform ios
eas build --platform android
```

## 📦 Deployment

### iOS App Store

1. **Prerequisites**:
   - Apple Developer Account ($99/year)
   - App Store Connect app created
   - iOS distribution certificate

2. **Build and Submit**:
```bash
# Build for iOS
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

3. **App Store Connect**:
   - Complete app metadata
   - Add screenshots
   - Set pricing and availability
   - Submit for review

### Google Play Store

1. **Prerequisites**:
   - Google Play Console account ($25 one-time)
   - Android app bundle created
   - Google Play service account JSON

2. **Build and Submit**:
```bash
# Build for Android
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

3. **Play Console**:
   - Complete store listing
   - Add screenshots
   - Set content rating
   - Publish app

## 🔧 Configuration

### App Configuration (`app.json`)

Update the following for your app:

```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug",
    "ios": {
      "bundleIdentifier": "com.yourcompany.yourapp"
    },
    "android": {
      "package": "com.yourcompany.yourapp"
    }
  }
}
```

### EAS Configuration (`eas.json`)

Update the submit configuration:

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "your-app-store-connect-id"
      },
      "android": {
        "serviceAccountKeyPath": "./google-play-service-account.json"
      }
    }
  }
}
```

## 📄 Store Listing Requirements

### App Store (iOS)

- **App Name**: Rent It Forward
- **Category**: Lifestyle
- **Description**: Rent tools, equipment, and more from people in your community
- **Keywords**: rental, tools, equipment, sharing, community
- **Screenshots**: iPhone 6.7", 6.5", 5.5" and iPad Pro 12.9", 12.9" (2nd gen)
- **Privacy Policy**: Required
- **Support URL**: Required

### Play Store (Android)

- **App Name**: Rent It Forward
- **Category**: Lifestyle
- **Description**: Same as iOS
- **Screenshots**: Phone and tablet screenshots
- **Feature Graphic**: 1024x500 pixels
- **Privacy Policy**: Required
- **Target Audience**: 18+

## 🎨 Assets Needed

Create the following assets before building:

- **App Icon**: 1024x1024 PNG
- **Splash Screen**: 1242x2208 PNG
- **Adaptive Icon** (Android): 1024x1024 PNG
- **Favicon**: 48x48 PNG
- **Store Screenshots**: Various sizes for both platforms

## 🔐 Environment Variables

Create a `.env` file for sensitive configuration:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📱 Testing

### Device Testing

1. **iOS**: Use Expo Go app or create development build
2. **Android**: Use Expo Go app or create development build
3. **Web**: Runs in browser at `http://localhost:8081`

### Real Device Testing

```bash
# Create development build
eas build --profile development

# Install on device and test
```

## 🚀 Next Steps

1. **Complete UI Implementation**:
   - Browse and search functionality
   - Listing details and creation
   - User authentication
   - Booking system

2. **Add Core Features**:
   - Image upload
   - Location services
   - Push notifications
   - Payment integration

3. **App Store Preparation**:
   - Create app store assets
   - Write app descriptions
   - Set up analytics
   - Prepare for submission

## 📞 Support

For deployment assistance:
- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [App Store Guidelines](https://developer.apple.com/app-store/guidelines/)
- [Play Store Guidelines](https://developer.android.com/distribute/play-policies) 