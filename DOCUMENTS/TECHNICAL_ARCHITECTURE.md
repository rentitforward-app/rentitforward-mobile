# 🏗️ Technical Architecture - Mobile App

*Last Updated: January 2025*

## 🎯 **Architecture Overview**

The Rent It Forward mobile app follows a modern React Native architecture with Expo, designed for scalability, maintainability, and performance across iOS and Android platforms.

## 📐 **System Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                     Mobile App Layer                        │
├─────────────────────────────────────────────────────────────┤
│  React Native + Expo + TypeScript + NativeWind             │
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Screens   │ │ Components  │ │    Utils    │           │
│  │             │ │             │ │             │           │
│  │ • Auth      │ │ • Forms     │ │ • Pricing   │           │
│  │ • Booking   │ │ • Lists     │ │ • Validation│           │
│  │ • Browse    │ │ • Cards     │ │ • Storage   │           │
│  │ • Messages  │ │ • Modals    │ │ • Network   │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│                    State Management                         │
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Zustand   │ │ TanStack    │ │ React Query │           │
│  │   Stores    │ │   Query     │ │   Cache     │           │
│  │             │ │             │ │             │           │
│  │ • Auth      │ │ • API Calls │ │ • Data      │           │
│  │ • UI State  │ │ • Mutations │ │ • Sync      │           │
│  │ • Settings  │ │ • Updates   │ │ • Offline   │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│                  External Services                          │
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │  Supabase   │ │   Stripe    │ │   Others    │           │
│  │             │ │             │ │             │           │
│  │ • Database  │ │ • Payments  │ │ • Maps      │           │
│  │ • Auth      │ │ • Connect   │ │ • Push      │           │
│  │ • Storage   │ │ • Webhooks  │ │ • Analytics │           │
│  │ • Realtime  │ │ • Escrow    │ │ • Sentry    │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 **Technology Stack**

### **Core Framework**
- **React Native**: 0.79.3 - Cross-platform mobile development
- **Expo**: ^53.0.11 - Development toolchain and managed workflow
- **TypeScript**: ~5.3.3 - Type safety and developer experience
- **Expo Router**: ~5.1.0 - File-based navigation system

### **State Management**
- **Zustand**: ^4.5.2 - Lightweight state management
- **TanStack Query**: ^5.0.0 - Server state management and caching
- **React Hook Form**: ^7.50.1 - Form state management
- **AsyncStorage**: ^2.1.2 - Local data persistence

### **UI & Styling**
- **NativeWind**: ^2.0.11 - Tailwind CSS for React Native
- **Shared Design System**: `@rentitforward/shared` - Cross-platform consistency
- **React Native Reanimated**: ~3.17.4 - High-performance animations
- **Gesture Handler**: ~2.20.2 - Native gesture handling

### **Backend & Services**
- **Supabase**: ^2.39.0 - Database, auth, storage, realtime
- **Stripe React Native**: 0.45.0 - Payment processing
- **Expo Notifications**: ~0.28.18 - Push notifications
- **Sentry**: ^6.15.1 - Error monitoring and performance

## 📁 **Project Structure**

```
rentitforward-mobile/
├── app/                          # Expo Router screens
│   ├── (auth)/                  # Authentication flow
│   │   ├── _layout.tsx         # Auth layout
│   │   ├── sign-in.tsx         # Sign in screen
│   │   ├── sign-up.tsx         # Sign up screen
│   │   └── welcome.tsx         # Welcome screen
│   ├── (tabs)/                 # Main app tabs
│   │   ├── _layout.tsx         # Tab layout
│   │   ├── index.tsx           # Home screen
│   │   ├── browse.tsx          # Browse listings
│   │   ├── create.tsx          # Create listing
│   │   ├── bookings.tsx        # Bookings management
│   │   └── profile.tsx         # User profile
│   ├── booking/                # Booking flow
│   │   ├── [listingId].tsx     # Booking initiation
│   │   ├── calendar.tsx        # Date selection
│   │   ├── summary.tsx         # Booking summary
│   │   └── success.tsx         # Booking confirmation
│   ├── listing/                # Listing details
│   │   └── [id].tsx           # Individual listing
│   ├── messages/               # Messaging system
│   │   ├── index.tsx          # Conversations list
│   │   ├── [conversationId].tsx # Chat screen
│   │   └── new.tsx            # New conversation
│   ├── payment/                # Payment flows
│   │   ├── booking-payment.tsx # Booking payment
│   │   ├── methods.tsx        # Payment methods
│   │   └── history.tsx        # Payment history
│   ├── profile/                # Profile management
│   │   ├── edit.tsx           # Edit profile
│   │   ├── settings.tsx       # Account settings
│   │   └── [userId].tsx       # Public profile
│   └── _layout.tsx            # Root layout
├── src/
│   ├── components/            # Reusable components
│   │   ├── ui/               # Base UI components
│   │   ├── forms/            # Form components
│   │   ├── booking/          # Booking-specific components
│   │   ├── messaging/        # Messaging components
│   │   ├── payment/          # Payment components
│   │   └── profile/          # Profile components
│   ├── lib/                  # Utilities and configuration
│   │   ├── supabase.ts       # Supabase client
│   │   ├── stripe-mobile.ts  # Stripe mobile client
│   │   ├── notifications.ts  # Push notifications
│   │   ├── network.ts        # Network state management
│   │   └── storage.ts        # Local storage utilities
│   ├── stores/               # Zustand stores
│   │   ├── auth.ts           # Authentication state
│   │   ├── booking.ts        # Booking state
│   │   ├── ui.ts             # UI state
│   │   └── settings.ts       # App settings
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.ts        # Authentication hook
│   │   ├── useBooking.ts     # Booking logic hook
│   │   ├── useNetwork.ts     # Network status hook
│   │   └── useNotifications.ts # Notifications hook
│   └── types/                # TypeScript type definitions
│       ├── navigation.ts     # Navigation types
│       ├── auth.ts           # Auth types
│       └── api.ts            # API response types
├── assets/                   # Static assets
│   ├── images/              # App images
│   └── fonts/               # Custom fonts
└── DOCUMENTS/               # Project documentation
    ├── MOBILE_DEVELOPMENT_ROADMAP.md
    ├── PHASE_1_CORE_FEATURES.md
    ├── PHASE_2_PAYMENTS.md
    ├── PHASE_3_COMMUNICATION.md
    ├── PHASE_4_ADVANCED.md
    ├── TECHNICAL_ARCHITECTURE.md
    └── MOBILE_UX_GUIDELINES.md
```

## 🔄 **Data Flow Architecture**

### **Authentication Flow**
```
User Action → Auth Store → Supabase Auth → Update Store → UI Update
     ↓
Persistent Storage (AsyncStorage) → App Restart → Auto Login
```

### **API Data Flow**
```
Component → TanStack Query → API Call → Supabase → 
Response → Cache Update → Component Re-render
     ↓
Offline Queue (if network failed) → Retry when online
```

### **Real-time Data Flow**
```
Supabase Realtime → Subscription → Event Handler → 
Store Update → Component Re-render
```

### **Payment Flow**
```
Booking Data → Stripe Intent → Mobile Payment → 
Confirmation → Webhook → Database Update → UI Update
```

## 🏪 **State Management Architecture**

### **Zustand Stores Structure**

```typescript
// stores/auth.ts
interface AuthStore {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (data: ProfileUpdate) => Promise<void>
}

// stores/booking.ts
interface BookingStore {
  currentBooking: BookingDraft | null
  bookings: Booking[]
  setBookingDraft: (draft: BookingDraft) => void
  submitBooking: () => Promise<Booking>
  clearDraft: () => void
}

// stores/ui.ts
interface UIStore {
  isOffline: boolean
  notifications: Notification[]
  bottomSheetState: BottomSheetState
  setNetworkStatus: (isOffline: boolean) => void
  addNotification: (notification: Notification) => void
}
```

### **TanStack Query Setup**

```typescript
// Key factories for consistent cache keys
export const queryKeys = {
  listings: {
    all: ['listings'] as const,
    list: (filters: ListingFilter) => [...queryKeys.listings.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.listings.all, 'detail', id] as const,
  },
  bookings: {
    all: ['bookings'] as const,
    list: (userId: string) => [...queryKeys.bookings.all, 'list', userId] as const,
    detail: (id: string) => [...queryKeys.bookings.all, 'detail', id] as const,
  },
  conversations: {
    all: ['conversations'] as const,
    list: (userId: string) => [...queryKeys.conversations.all, 'list', userId] as const,
    messages: (conversationId: string) => [...queryKeys.conversations.all, 'messages', conversationId] as const,
  },
}

// Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        if (error.status === 404) return false
        return failureCount < 3
      },
    },
  },
})
```

## 🔌 **API Integration Architecture**

### **Supabase Client Configuration**

```typescript
// lib/supabase.ts
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Realtime configuration
export const setupRealtimeSubscriptions = () => {
  const channel = supabase.channel('app-changes')
  
  channel
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'bookings' 
    }, handleBookingUpdate)
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'messages' 
    }, handleMessageUpdate)
    .subscribe()
    
  return channel
}
```

### **API Layer Structure**

```typescript
// lib/api/bookings.ts
export const bookingAPI = {
  getBookings: async (userId: string): Promise<Booking[]> => {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        listing:listings(*),
        owner:profiles!bookings_owner_id_fkey(*),
        renter:profiles!bookings_renter_id_fkey(*)
      `)
      .or(`owner_id.eq.${userId},renter_id.eq.${userId}`)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },
  
  createBooking: async (bookingData: CreateBooking): Promise<Booking> => {
    const { data, error } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },
}
```

## 📱 **Platform-Specific Considerations**

### **iOS Specific**
- **Navigation**: Large title style for main screens
- **Gestures**: Edge swipe for back navigation
- **Haptics**: Appropriate feedback for interactions
- **Safe Areas**: Proper handling of notch and home indicator
- **App Store**: Guidelines compliance for review process

### **Android Specific**
- **Navigation**: Material Design navigation patterns
- **Back Button**: Proper Android back button handling
- **Permissions**: Runtime permission requests
- **Adaptive Icons**: Support for different launcher styles
- **Play Store**: Compliance with Google Play policies

### **Cross-Platform**
- **Shared Components**: Maximum code reuse between platforms
- **Design System**: Consistent styling using shared tokens
- **Business Logic**: Platform-agnostic logic in shared utilities
- **Testing**: Unified testing approach across platforms

## 🔒 **Security Architecture**

### **Data Security**
- **Authentication**: Supabase Auth with JWT tokens
- **API Security**: Row Level Security (RLS) policies
- **Local Storage**: Encrypted storage for sensitive data
- **Network**: HTTPS only, certificate pinning
- **Payment**: PCI compliant Stripe integration

### **Privacy**
- **Data Minimization**: Collect only necessary user data
- **Consent**: Clear privacy policy and consent flows
- **Data Retention**: Automatic cleanup of old data
- **User Rights**: Data export and deletion capabilities

## 📊 **Performance Architecture**

### **Optimization Strategies**
- **Code Splitting**: Dynamic imports for feature modules
- **Image Optimization**: Multiple sizes, lazy loading, caching
- **List Performance**: Virtualization for large datasets
- **Bundle Size**: Tree shaking and dead code elimination
- **Memory Management**: Proper cleanup of subscriptions

### **Caching Strategy**
- **API Cache**: TanStack Query with appropriate stale times
- **Image Cache**: FastImage with disk and memory cache
- **Offline Cache**: Critical data cached locally
- **Database**: Supabase connection pooling and optimization

## 🚀 **Deployment Architecture**

### **Build Pipeline**
- **EAS Build**: Managed build service for both platforms
- **Environment**: Development, staging, production configs
- **Code Signing**: Automatic certificate management
- **OTA Updates**: Expo Updates for JavaScript changes

### **Release Process**
- **Versioning**: Semantic versioning with auto-increment
- **Testing**: Automated testing in CI/CD pipeline
- **Distribution**: App Store Connect and Play Console
- **Monitoring**: Real-time error and performance monitoring

---

**Architecture Lead**: [Assign Lead Developer]  
**Last Review**: [Date]  
**Next Review**: [Quarterly] 