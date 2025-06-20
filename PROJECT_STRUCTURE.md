Here is the updated and aligned project structure for my multi-repo setup under RENTITFORWARD-WORKSPACE, following your correct architectural pattern, the new stack (Next.js, Expo, Supabase, Stripe Connect), and the latest pricing/incentives/payment logic:

🔧 rentitforward-web/ (Next.js + Tailwind)

/pages
  ├── index.tsx                      → EntryPage (public landing)
/onboarding
  ├── login.tsx                      → LoginPage
  ├── signup.tsx                     → SignupPage
  ├── verify-email.tsx              → EmailVerificationPage
  ├── permissions.tsx               → PermissionsPage
/home
  ├── main.tsx                       → MainPage (after login)
  ├── featured.tsx                   → FeaturedListingsPage
  └── categories.tsx                 → BrowseByCategoryPage
/browse
  ├── index.tsx                      → BrowseMainPage
  ├── category/[slug].tsx           → CategoryFilteredPage
  ├── search.tsx                     → SearchResultsPage
  └── item/[id].tsx                 → ItemDetailsPage
/post
  ├── basic.tsx                      → Step1_BasicDetailsPage
  ├── category.tsx                   → Step2_CategoryConditionPage
  ├── pricing.tsx                    → Step3_PricingDepositPage
  ├── photos.tsx                     → Step4_PhotosPage
  ├── location.tsx                   → Step5_LocationPage
  ├── calendar.tsx                   → Step6_CalendarPage
  └── review.tsx                     → ReviewPublishPage
/booking
  ├── date.tsx                       → SelectDatePage
  ├── add-ons.tsx                    → AddOnsPage
  ├── apply-points.tsx              → ApplyPointsPage
  ├── confirm.tsx                    → ConfirmPaymentPage
  └── success.tsx                    → BookingSuccessPage
/rentals
  ├── index.tsx                      → MyRentalsPage
  ├── [id]/details.tsx              → RentalDetailsPage
  ├── [id]/modify.tsx               → ModifyBookingPage
  ├── [id]/cancel.tsx               → CancelBookingPage
  └── [id]/review.tsx               → LeaveReviewPage
/listings
  ├── index.tsx                      → MyListingsPage
  ├── [id]/edit.tsx                 → EditListingPage
  ├── [id]/bookings.tsx            → BookingHistoryPage
  ├── [id]/confirm-return.tsx      → ConfirmReturnPage
  └── earnings.tsx                   → EarningsOverviewPage
/profile
  ├── index.tsx                      → MainProfilePage
  ├── edit.tsx                       → EditProfilePage
  ├── referral.tsx                   → ReferralPage
  ├── points.tsx                     → PointsAndRewardsPage
  └── verify.tsx                     → VerificationPage (Stripe Connect onboarding)
/messages
  ├── index.tsx                      → MessagesListPage
  └── [chatId].tsx                  → ChatPage
/notifications
  ├── index.tsx                      → NotificationsPage
  └── settings.tsx                   → NotificationSettingsPage
/settings
  ├── index.tsx                      → SettingsPage
  ├── payments.tsx                   → PaymentMethodsPage
  ├── preferences.tsx                → LanguageCurrencyPage
  ├── help.tsx                       → HelpCenterPage
  ├── privacy.tsx                    → PrivacyPolicyPage
  └── delete.tsx                     → DeleteAccountPage
/admin
  ├── dashboard.tsx                  → Admin_DashboardPage
  ├── users.tsx                      → Admin_ManageUsersPage
  ├── listings.tsx                   → Admin_ModerateListingsPage
  ├── refunds.tsx                    → Admin_RefundDepositsPage
  ├── disputes.tsx                   → Admin_DisputeManagementPage
  └── reports.tsx                    → Admin_ReportsAnalyticsPage
/blog
  ├── index.tsx                      → BlogListPage
  └── [slug].tsx                     → BlogDetailsPage
/docs
  ├── terms-of-use.tsx              → Terms & Conditions
  ├── privacy-policy.tsx            → Privacy Policy
  └── faq.tsx                        → Frequently Asked Questions


📱 rentitforward-mobile – Cross-platform mobile app built with Expo, using NativeWind and Supabase.

rentitforward-mobile/
├── app/
│   ├── navigation/
│   │   ├── RootNavigator.tsx         // Main stack/tab navigator entry
│   │   ├── AuthNavigator.tsx         // Login/Signup/Onboarding navigation stack
│   │   └── MainTabs.tsx              // Bottom tab config: Home, Browse, Listings, Profile
│
│   ├── screens/
│   │   ├── Onboarding/               // Login, Signup, Email verification
│   │   ├── Home/                     // Main landing/dashboard experience
│   │   ├── Browse/                   // Search, categories, filtered results
│   │   ├── PostItem/                 // Multi-step listing creation flow
│   │   ├── Booking/                  // Calendar selection, add-ons, payment
│   │   ├── Rentals/                  // Rentals user made (renter view)
│   │   ├── Listings/                 // Listings user owns (sharer view)
│   │   ├── Profile/                  // Profile edit, referral, verification
│   │   ├── Messages/                 // 1-on-1 messaging threads
│   │   ├── Notifications/            // Push and in-app alerts
│   │   ├── Settings/                 // Preferences, language, support
│   │   ├── Admin/                    // Admin dashboard screens (mobile-friendly)
│   │   ├── Blog/                     // Blog listing and detail screens
│   │   └── Docs/                     // Terms, privacy, FAQ
│
│   ├── components/
│   │   ├── ui/                       // Buttons, Inputs, Modals (NativeWind styled)
│   │   ├── shared/                   // Shared cross-screen UI like ItemCard, RatingStars
│   │   └── layout/                   // Page wrappers, headers, layout controls
│
│   ├── hooks/
│   │   ├── useUser.ts                // User auth state + Supabase session logic
│   │   ├── useStripe.ts              // Mobile browser redirect for Stripe onboarding
│   │   ├── useBooking.ts             // Booking create/fetch/update
│   │   └── useIncentives.ts          // Claim and calculate point rewards
│
│   ├── lib/
│   │   ├── supabase.ts               // Supabase client for Expo
│   │   ├── stripe.ts                 // Browser-based Connect onboarding, Stripe sheet
│   │   └── analytics.ts              // Firebase or Segment (optional)
│
│   ├── assets/                       // Images, logos, icons
│   ├── constants/                    // App-wide constants and configs
│   ├── styles/                       // Custom Tailwind config for NativeWind
│   ├── App.tsx                       // Root app config and navigator injection
│   └── app.json                      // Expo config (deep linking, icon, permissions)



♻️ rentitforward-shared – Logic-only package containing types, utility functions, constants, and design tokens.

rentitforward-shared/
├── src/
│   ├── types/
│   │   ├── user.ts                 // User, VerifiedStatus, UserRole, StripeAccountStatus
│   │   ├── listing.ts              // Listing, ListingStatus, Category, Condition, AvailabilitySlot
│   │   ├── booking.ts              // Booking, BookingStatus, PaymentStatus, DepositStatus
│   │   ├── incentive.ts            // IncentiveAction, PointsEntry, ReferralReward
│   │   ├── review.ts               // Review, Rating, FeedbackType
│   │   ├── payment.ts              // PaymentIntent, StripeTransaction, TransferDetails
│   │   ├── blog.ts                 // BlogPost, Slug, BlogMetadata
│   │   ├── doc.ts                  // PolicyDoc, DocType (privacy, terms, faq)
│   │   └── index.ts                // Combined exports of all types
│
│   ├── utils/
│   │   ├── pricing.ts              // calculateSpanCost, calculateTotalWithFees, insurance/duration logic
│   │   ├── booking.ts              // availability conflict check, span validation, status transitions
│   │   ├── incentives.ts           // award points for referral, review, milestone
│   │   ├── stripe.ts               // Stripe Connect onboarding, payment intent, deposit refunds
│   │   ├── validation.ts           // isValidEmail, isValidPhone, form validators
│   │   ├── supabase.ts             // Shared Supabase client, session helpers
│   │   └── index.ts                // Re-export of utility functions
│
│   ├── design-system/
│   │   ├── tokens.ts               // Core tokens: color, spacing, font sizes, radius
│   │   ├── theme.ts                // Tailwind + NativeWind theme maps using tokens
│   │   └── index.ts                // Combined design system exports
│
│   └── constants/
│       ├── fees.ts                 // Platform fees, insurance rates, service commissions
│       ├── depositRules.ts         // Logic: recommended deposit by item value
│       ├── categories.ts           // Rental category list and icons
│       ├── states.ts               // Australian state definitions
│       └── index.ts                // Central export for constants
