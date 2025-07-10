# 🚀 Development Environment Setup

This guide will help you set up the development environment for the Rent It Forward mobile app.

## ✅ Prerequisites

- **Node.js** (v18 or later)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g @expo/cli`)
- **iOS Simulator** (for iOS development on Mac)
- **Android Studio** (for Android development)

## 📦 Installation

### 1. Install Dependencies

```bash
# Navigate to the mobile app directory
cd rentitforward-mobile

# Install all dependencies
npm install --legacy-peer-deps
```

### 2. Build Shared Package

```bash
# Build the shared package first
npm run build:shared
```

### 3. Start Development Server

```bash
# Start with shared package rebuild
npm run dev

# Or start with cache clear
npm run dev:clear

# Or just start normally
npm start
```

## 🏗️ Project Structure

```
rentitforward-mobile/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main tab navigation
│   └── _layout.tsx        # Root layout with providers
├── src/
│   ├── components/        # Reusable UI components
│   ├── stores/           # Zustand state management
│   │   ├── auth.ts       # Authentication store
│   │   └── ui.ts         # UI state store
│   ├── lib/              # Library configurations
│   │   ├── supabase.ts   # Supabase client
│   │   └── query-client.ts # TanStack Query setup
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   └── types/            # TypeScript type definitions
├── assets/               # Static assets
├── DOCUMENTS/            # Project documentation
└── global.css           # NativeWind global styles
```

## 🛠️ Technology Stack

- **Framework**: Expo + React Native
- **Navigation**: Expo Router
- **Styling**: NativeWind (Tailwind for React Native)
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **Database**: Supabase
- **Authentication**: Supabase Auth
- **Payments**: Stripe React Native SDK

## 📱 Development Workflow

### Running the App

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open the app**:
   - **iOS**: Press `i` in the terminal or scan QR code with Camera app
   - **Android**: Press `a` in the terminal or scan QR code with Expo Go app
   - **Web**: Press `w` in the terminal

### Making Changes

1. **Code changes** are hot-reloaded automatically
2. **Shared package changes** require rebuilding:
   ```bash
   npm run build:shared
   ```
3. **Clear cache** if experiencing issues:
   ```bash
   npm run dev:clear
   ```

## 🔧 Configuration

### Environment Variables

Copy `.env.local` and update with your values:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Other services...
```

### NativeWind Setup

NativeWind is configured with:
- `tailwind.config.js` - Tailwind configuration
- `global.css` - Global Tailwind imports
- `nativewind-env.d.ts` - TypeScript support
- `babel.config.js` - Babel plugin configuration

## 🧪 Testing the Setup

A development test component is available at `src/components/DevTest.tsx`. Add it to any screen to verify:

- ✅ Zustand stores are working
- ✅ TypeScript compilation
- ✅ Component rendering
- ✅ State management

## 📄 Available Scripts

- `npm start` - Start Expo development server
- `npm run dev` - Build shared package and start development
- `npm run dev:clear` - Build shared package and start with cache clear
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web
- `npm run build:shared` - Build the shared package
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint

## 🚨 Troubleshooting

### Common Issues

1. **Module resolution errors**:
   ```bash
   npm run dev:clear
   ```

2. **Shared package not found**:
   ```bash
   npm run build:shared
   ```

3. **NativeWind styles not working**:
   - Ensure `global.css` is imported in `app/_layout.tsx`
   - Check `nativewind-env.d.ts` is in the root directory

4. **TypeScript errors**:
   ```bash
   npm run type-check
   ```

### Reset Everything

If you encounter persistent issues:

```bash
# Clear all caches and restart
npm run reset
npx expo start --clear
```

## 📚 Next Steps

Now that your development environment is set up, you can:

1. **Start with Phase 1**: Review `DOCUMENTS/PHASE_1_CORE_FEATURES.md`
2. **Check the roadmap**: See `DOCUMENTS/MOBILE_DEVELOPMENT_ROADMAP.md`
3. **Review architecture**: Read `DOCUMENTS/TECHNICAL_ARCHITECTURE.md`

Happy coding! 🎉 