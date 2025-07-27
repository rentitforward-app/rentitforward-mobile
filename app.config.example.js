export default {
  expo: {
    name: "Rent It Forward",
    slug: "rentitforward-mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/RentitForwardMainLogo.png",
    scheme: "rentitforward",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/RentitForwardMainLogo.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.rentitforward.mobile", // ✅ Required for iOS builds
      infoPlist: {
        UIBackgroundModes: ["remote-notification"] // ✅ Required for push notifications
      },
      entitlements: {
        "aps-environment": "development", // ✅ Change to "production" for App Store builds
        "com.apple.security.application-groups": [
          "group.com.rentitforward.mobile.onesignal" // ✅ Required for confirmed delivery
        ]
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/RentitForwardMainLogo.png",
        backgroundColor: "#ffffff"
      },
      package: "com.rentitforward.mobile" // ✅ Required for Android builds
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/RentItForwardFavicon2.png"
    },
    plugins: [
      "expo-router",
      [
        "onesignal-expo-plugin", // ✅ OneSignal plugin - must be first in array
        {
          mode: "development" // Change to "production" for production builds
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      // OneSignal App ID - replace with your actual app ID
      oneSignalAppId: "YOUR_ONESIGNAL_APP_ID_HERE",
      
      // API URLs
      apiUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000",
      
      // Supabase configuration
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      
      // Environment
      environment: process.env.EXPO_PUBLIC_ENVIRONMENT || "development",
      
      eas: {
        projectId: "your-eas-project-id"
      }
    }
  }
}; 