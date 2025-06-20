# Sentry Setup Guide for Rent It Forward

This guide will help you set up Sentry monitoring for the entire Rent It Forward workspace.

## 📋 Prerequisites

- Sentry account: https://digital-linked.sentry.io
- Access to all three repositories (web, mobile, shared)

## 🚀 Quick Setup

### 1. Create Sentry Projects

Go to your Sentry dashboard and create two projects:

1. **Web Project:**
   - Platform: **Next.js**
   - Project name: **`rentitforward-web`**
   - Copy the DSN URL

2. **Mobile Project:**
   - Platform: **React Native**
   - Project name: **`rentitforward-mobile`**
   - Copy the DSN URL

### 2. Configure Environment Variables

#### For Web App (`rentitforward-web/.env.local`):
```bash
# Sentry Configuration
SENTRY_DSN=https://your-web-dsn@digital-linked.ingest.sentry.io/project-id
NEXT_PUBLIC_SENTRY_DSN=https://your-web-dsn@digital-linked.ingest.sentry.io/project-id
```

#### For Mobile App (`rentitforward-mobile/.env.local`):
```bash
# Sentry Configuration
EXPO_PUBLIC_SENTRY_DSN=https://your-mobile-dsn@digital-linked.ingest.sentry.io/project-id
```

## 📦 Installed Packages

✅ **Web App** (`@sentry/nextjs`): Installed
✅ **Mobile App** (`@sentry/react-native`): Installed

## 🔧 Configuration Files Created

### Web App Configuration:
- `sentry.client.config.ts` - Browser-side configuration
- `sentry.server.config.ts` - Server-side configuration
- `sentry.edge.config.ts` - Edge runtime configuration
- `next.config.js` - Updated with Sentry integration

### Mobile App Configuration:
- `src/lib/sentry.ts` - React Native configuration
- `app/_layout.tsx` - Updated to initialize Sentry

## 🎯 Features Enabled

### Web App Features:
- ✅ Error tracking and performance monitoring
- ✅ Session replay (10% sample rate)
- ✅ Source map upload for better stack traces
- ✅ Performance monitoring (100% sample rate in dev)
- ✅ Automatic Vercel Cron Monitor integration
- ✅ Ad-blocker circumvention via `/monitoring` route

### Mobile App Features:
- ✅ Error tracking and crash reporting
- ✅ Performance monitoring
- ✅ Session tracking
- ✅ Mobile replay with privacy masking
- ✅ Development vs production environment detection

## 🔍 Testing the Setup

### Web App Testing:
1. **Start the web app:** `npm run dev`
2. **Trigger an error:** Add this to any page component:
   ```jsx
   // Test error
   throw new Error("Test Sentry error from web app");
   ```
3. **Check Sentry Dashboard:** Errors should appear in your `rentitforward-web` project

### Mobile App Testing:
1. **Start the mobile app:** `npm start`
2. **Trigger an error:** Add this to any screen:
   ```jsx
   import Sentry from '../src/lib/sentry';
   
   // Test error
   Sentry.captureException(new Error("Test Sentry error from mobile app"));
   ```
3. **Check Sentry Dashboard:** Errors should appear in your `rentitforward-mobile` project

## 🏷️ User Context Integration

### Web App - Add user context:
```jsx
import * as Sentry from "@sentry/nextjs";

// Set user context
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.email,
});
```

### Mobile App - Add user context:
```jsx
import Sentry from '../src/lib/sentry';

// Set user context
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.email,
});
```

## 📊 Dashboard Overview

Your Sentry organization: **digital-linked**
- Web Project: `rentitforward-web`
- Mobile Project: `rentitforward-mobile`
- Region: Germany (https://de.sentry.io)

## 🔐 Security Best Practices

1. **Never commit DSN to version control** - Always use environment variables
2. **Use different DSNs** for development and production
3. **Mask sensitive data** in replays (already configured)
4. **Filter out development errors** in production (already configured)

## 📚 Additional Resources

- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry React Native Docs](https://docs.sentry.io/platforms/react-native/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Session Replay](https://docs.sentry.io/product/session-replay/)

## 🚨 Troubleshooting

### Common Issues:

1. **"DSN not found" error:**
   - Verify DSN is correctly set in environment variables
   - Check project exists in Sentry dashboard

2. **No errors appearing:**
   - Ensure environment variables are loaded
   - Check network connectivity
   - Verify DSN format

3. **Build errors:**
   - Ensure all Sentry config files are in the correct locations
   - Check Next.js config syntax

## 🎉 Next Steps

1. **Create the Sentry projects** in your dashboard
2. **Copy the DSN URLs** to your environment files
3. **Deploy to production** with production DSNs
4. **Set up alerts** for critical errors
5. **Configure release tracking** for better error context

Your Rent It Forward workspace is now fully monitored with Sentry! 🎯 