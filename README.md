# Rent It Forward – Mobile App

This project is part of a multi-repository workspace for **Rent It Forward** (`RENTITFORWARD-WORKSPACE`), a peer-to-peer rental marketplace.

**Last Updated**: July 20, 2025  
**Version**: 1.0.0  
**Status**: MVP Development Phase

Workspace contains:
- `rentitforward-web/`: Next.js + Tailwind web app
- `rentitforward-mobile/`: Expo + React Native mobile app (THIS REPOSITORY)
- `rentitforward-shared/`: Shared logic (types, utils, API clients, design system)

This is the cross-platform mobile app built with **Expo**, **React Native**, and **NativeWind**.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (macOS) or Android Studio (for emulators)

### Installation
```bash
# Clone the repository (if not already done)
git clone [repository-url]
cd rentitforward-mobile

# Install dependencies
npm install

# Build shared package
npm run build:shared

# Start development server
npm run dev

# Or start with cache cleared
npm run dev:clear
```

### Platform-Specific Development
```bash
# iOS (requires macOS and Xcode)
npm run ios

# Android (requires Android Studio)
npm run android

# Web (for testing)
npm run web
```

---

## 🔧 Key Technologies

### Core Stack
- **Framework**: Expo 53.0.19 + React Native 0.79.5
- **Language**: TypeScript (strict mode)
- **Styling**: NativeWind 2.0.11 (Tailwind for React Native)
- **Navigation**: Expo Router 5.1.3 (file-based routing)
- **State Management**: Zustand + TanStack Query 5.82.0
- **Forms**: React Hook Form 7.60.0 + Zod validation
- **Authentication**: Supabase Auth 2.39.0

### Platform Services
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Real-time)
- **Payments**: Stripe Connect (@stripe/stripe-react-native 0.45.0)
- **Error Tracking**: Sentry 6.14.0
- **Push Notifications**: Expo Notifications
- **Location**: Expo Location 18.1.6
- **Camera/Gallery**: Expo Image Picker 16.1.4

### Development Tools
- **Package Manager**: npm
- **Linting**: Expo Lint
- **Type Checking**: TypeScript compiler
- **Build System**: EAS Build
- **Testing**: Jest + React Native Testing Library (to be implemented)

---

## 📁 Project Structure

```
rentitforward-mobile/
├── app/                          # Expo Router screens and navigation
│   ├── (auth)/                   # Authentication screens
│   │   ├── intro.tsx            # Onboarding intro slides
│   │   ├── welcome.tsx          # Welcome screen for returning users
│   │   ├── sign-in.tsx          # Login screen
│   │   ├── sign-up.tsx          # Registration screen
│   │   └── forgot-password.tsx  # Password reset
│   ├── (tabs)/                  # Main app tab navigation
│   │   ├── browse.tsx           # Browse listings
│   │   ├── bookings.tsx         # User bookings
│   │   ├── create.tsx           # Create listing
│   │   ├── index.tsx            # Home/dashboard
│   │   └── profile.tsx          # User profile
│   ├── booking/                 # Booking flow screens
│   ├── listing/                 # Listing detail screens
│   └── search/                  # Search and filter screens
├── assets/                      # Images, fonts, icons
├── src/
│   ├── components/              # Reusable React Native components
│   │   ├── AuthProvider.tsx     # Authentication context provider
│   │   └── Providers.tsx        # App-wide providers
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Configuration and utilities
│   │   ├── supabase.ts          # Supabase client configuration
│   │   ├── query-client.ts      # TanStack Query setup
│   │   └── design-system.ts     # Design tokens (imports from shared)
│   ├── stores/                  # Zustand state stores
│   │   ├── auth.ts              # Authentication state
│   │   └── ui.ts                # UI state management
│   ├── types/                   # TypeScript type definitions
│   └── utils/                   # Utility functions
├── tailwind.config.js           # NativeWind configuration
├── app.json                     # Expo configuration
├── eas.json                     # EAS Build configuration
└── package.json                 # Dependencies and scripts
```

---

## 📦 Shared Modules

Uses shared packages from `../rentitforward-shared/`, including:
- **Types**: User, Listing, Booking interfaces with Zod validation
- **Utils**: Pricing calculations, date formatting, validation helpers
- **Design System**: Colors, typography, spacing tokens
- **Constants**: App-wide configuration and enums

### Design System Integration
```typescript
// Import shared design tokens
import { colors, spacing, typography } from 'rentitforward-shared/src/design-system';

// Use in NativeWind classes or styles
<View className="bg-primary-green p-4">
  <Text style={{ color: colors.gray[900], fontSize: typography.sizes.lg }}>
    Consistent styling across platforms
  </Text>
</View>
```

---

## ✅ Implemented Features

### 🔐 Authentication System
- [x] **Complete Authentication Flow**
  - User registration with email/password
  - Login with session persistence
  - Password reset via email
  - Biometric authentication ready
  - Social login integration ready

- [x] **Onboarding Experience**
  - 3-slide intro for new users with feature highlights
  - Welcome screen for returning users
  - Smart routing between intro → auth → main app
  - Authentication guards protecting authenticated routes

- [x] **State Management**
  - Zustand store for authentication state
  - Session persistence with AsyncStorage
  - Automatic session refresh
  - Proper logout and cleanup

### 🎨 UI/UX Foundation
- [x] **Design System Implementation**
  - Shared design tokens across web and mobile
  - Primary brand green (#44D62C) color scheme
  - Consistent typography and spacing
  - NativeWind integration for Tailwind-style classes

- [x] **Navigation Structure**
  - Tab-based main navigation (Browse, Bookings, Create, Profile)
  - Authentication flow routing
  - Deep linking capability
  - Route protection and guards

### 📊 Data Architecture
- [x] **Type System**
  - Comprehensive TypeScript interfaces
  - Zod schemas for runtime validation
  - Shared types across platforms

---

## 🚧 In Development

### 📱 Core App Screens (40% Complete)
- ✅ Authentication screens with modern design
- ✅ Basic tab navigation structure
- 🔄 Browse/search functionality
- 🔄 Listing detail pages
- 🔄 Booking flow implementation
- 🔄 User profile management

### 🔍 Search & Discovery
- 🔄 Search listings with filters
- 🔄 Map-based location search
- 🔄 Category and price filtering
- 🔄 Favorites and saved searches

---

## 📋 Roadmap

### Phase 1: Core Marketplace (Weeks 1-10)
- [ ] **Listing Management**
  - Create/edit listing forms
  - Image upload and management
  - Category selection and pricing
  - Availability calendar

- [ ] **Search & Browse**
  - Advanced search with filters
  - Map integration for location
  - Listing grid and detail views
  - Favorites functionality

- [ ] **Basic Booking Flow**
  - Booking request forms
  - Date selection and availability
  - Pricing calculation
  - Booking confirmation

### Phase 2: Payment Integration (Weeks 11-16)
- [ ] **Stripe Connect Integration**
  - Express account onboarding
  - Payment processing with escrow
  - Security deposit handling
  - Payout automation

### Phase 3: Communication (Weeks 17-21)
- [ ] **Messaging System**
  - Real-time chat between users
  - Push notifications
  - Image sharing in messages

### Phase 4: Trust & Safety (Weeks 22-25)
- [ ] **User Verification**
  - Identity document upload
  - Phone verification
  - Trust score system

- [ ] **Review System**
  - Post-rental reviews
  - Rating aggregation
  - Dispute resolution

### Phase 5: App Store Launch (Weeks 26-27)
- [ ] **Store Submission**
  - iOS App Store preparation
  - Google Play Store submission
  - Beta testing via TestFlight

---

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start with shared package build
npm run dev:clear        # Start with cleared cache
npm start               # Basic Expo start
npm run tunnel          # Start with tunnel for external testing

# Platform-specific
npm run ios             # Run on iOS simulator
npm run android         # Run on Android emulator
npm run web             # Run in web browser

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # TypeScript type checking

# Build & Deploy
eas build --platform ios      # Build for iOS
eas build --platform android  # Build for Android
eas submit                     # Submit to app stores
```

---

## 📱 App Store Information

### iOS App Store
- **Bundle ID**: au.com.rentitforward.mobile
- **Apple ID**: rentitforward@gmail.com
- **Team ID**: 752V3M4Q2S
- **App Store Connect ID**: 6748590879

### Google Play Store
- **Package Name**: au.com.rentitforward.mobile
- **Release Track**: Production (when ready)

### Expo Application Services
- **Project ID**: c79578fa-7070-423e-a29e-64877b598b60
- **Owner**: rentitforward

---

## 🌍 Environment Configuration

### Required Environment Variables
```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# App Configuration
EXPO_PUBLIC_APP_ENV=development|staging|production
```

### EAS Secrets (Production)
Configure these in EAS Console for production builds:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `STRIPE_PUBLISHABLE_KEY`

---

## 🧠 Development Notes

### Best Practices
- **Shared Logic**: Always import types, utilities, and design tokens from `rentitforward-shared`
- **No Duplication**: Don't recreate constants or types—extend shared interfaces if needed
- **Platform Consistency**: Use shared design system to match web app styling
- **Type Safety**: Leverage TypeScript strict mode and Zod validation
- **Performance**: Use FlatList for long lists, optimize images, implement proper memoization

### Cross-Platform Considerations
- Use React Native components (`View`, `Text`, `TouchableOpacity`) not HTML
- Wrap navigation with `useNavigation()` from Expo Router
- Test on both iOS and Android simulators
- Consider platform-specific design differences (iOS vs Material Design)

### Stripe Connect Flow
- Item owners onboard as Stripe Express accounts
- Payments held in escrow until rental completion
- Platform takes 20% commission (configurable)
- Deposits handled separately and refunded post-return

---

## 📞 Support & Resources

### Documentation
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [NativeWind Documentation](https://www.nativewind.dev/)
- [Supabase React Native Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)

### Project Resources
- **Technical Documentation**: See `/DOCUMENTS/` folder
- **Design Assets**: See `/assets/images/` folder
- **Project Status**: See `/DOCUMENTS/Project_Status_Update_2025-01-20.md`

### Contact
- **Technical Lead**: [Contact Information]
- **Project Manager**: [Contact Information]

---

*This README is updated regularly to reflect the current project status and development progress.*
