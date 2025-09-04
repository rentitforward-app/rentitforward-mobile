# Crash Monitoring Guide for Rent It Forward Mobile

## Overview

This guide explains how Sentry monitors crashes in the Rent It Forward mobile app, with specific focus on the welcome page crash issue reported in TestFlight.

## Current Crash Monitoring Setup

### ✅ What's Already Monitored

1. **Automatic Crash Detection**: All unhandled JavaScript errors and native crashes
2. **Welcome Page Monitoring**: Enhanced monitoring specifically for the welcome screen
3. **User Context**: User information associated with crash reports
4. **Breadcrumbs**: User actions leading to crashes
5. **Error Boundaries**: React error boundaries to catch component crashes
6. **Navigation Errors**: Specific monitoring for navigation-related crashes

### 🔍 Welcome Page Crash Monitoring

The welcome page now has enhanced crash monitoring:

```typescript
// Automatic breadcrumb when screen loads
useEffect(() => {
  addSentryBreadcrumb('Welcome screen loaded', 'navigation', {
    screen: 'welcome',
    timestamp: new Date().toISOString(),
  });
}, []);

// Error handling for navigation actions
const handleGetStarted = () => {
  try {
    addSentryBreadcrumb('Get Started button pressed', 'user_action', {
      screen: 'welcome',
      action: 'get_started',
    });
    router.push('/(auth)/sign-up');
  } catch (error) {
    captureSentryException(error as Error, {
      screen: 'welcome',
      action: 'get_started_navigation',
      error_type: 'navigation_error',
    });
  }
};
```

## Accessing Crash Reports

### Dashboard Access
- **URL**: https://rent-it-forward.sentry.io/insights/projects/react-native/
- **Account**: rentitforward.app@gmail.com

### Key Dashboard Sections

1. **Issues Tab**: View all crash reports
2. **Performance Tab**: Monitor app performance
3. **Releases Tab**: Track crashes across different app versions
4. **Users Tab**: View user-specific crash reports

## Investigating the Welcome Page Crash

### Step 1: Check Recent Issues
1. Go to the Sentry dashboard
2. Click on "Issues" tab
3. Look for issues with:
   - **Tags**: `screen:welcome` or `platform:mobile`
   - **Environment**: `production` (for TestFlight builds)
   - **Release**: Check the app version from TestFlight

### Step 2: Filter by Welcome Page
Use these filters in Sentry:
- **Environment**: `production`
- **Tags**: `screen:welcome`
- **Time Range**: Last 7 days (or since TestFlight release)

### Step 3: Analyze Crash Details
For each crash report, check:

1. **Error Message**: The specific error that caused the crash
2. **Stack Trace**: Where in the code the crash occurred
3. **Breadcrumbs**: User actions leading to the crash
4. **Device Info**: iOS version, device model, app version
5. **User Context**: If user was logged in or anonymous

### Step 4: Common Welcome Page Crash Causes

Based on the code analysis, potential crash causes:

1. **Image Loading Issues**:
   ```typescript
   // These images could fail to load
   source={require('../../assets/images/RIF_Onboarding_Image.png')}
   source={require('../../assets/images/RentitForwardInvertedColorTransparentbg.png')}
   ```

2. **Navigation Errors**:
   ```typescript
   // Router navigation could fail
   router.push('/(auth)/sign-up')
   router.push('/(auth)/sign-in')
   ```

3. **Design System Issues**:
   ```typescript
   // mobileTokens could be undefined
   backgroundColor: mobileTokens.colors.primary.main
   ```

4. **SafeAreaView Issues**: iOS-specific safe area handling

## Debugging Steps

### 1. Check Sentry Dashboard
- Look for crash reports with `screen:welcome` tag
- Check the error message and stack trace
- Review breadcrumbs to see user actions before crash

### 2. TestFlight Specific Issues
- Check if crashes happen on specific iOS versions
- Look for device-specific issues (iPhone vs iPad)
- Check if crashes happen on first launch vs subsequent launches

### 3. Common iOS TestFlight Issues
- **Memory Issues**: Large images causing memory pressure
- **Asset Loading**: Images not bundled correctly
- **Safe Area**: iOS safe area handling issues
- **Navigation**: Expo Router issues on iOS

## Monitoring Commands

### Check Recent Crashes
```bash
# Check Sentry dashboard for recent issues
# Filter by: Environment=production, Tags=screen:welcome
```

### Test Crash Monitoring
```bash
# In development, use the test buttons in the app
# Or run the test script
node scripts/test-sentry.js
```

## Fixing Common Issues

### 1. Image Loading Crashes
If crashes are related to image loading:

```typescript
// Add error handling for images
<Image 
  source={require('../../assets/images/RIF_Onboarding_Image.png')}
  style={styles.heroImage}
  resizeMode="cover"
  onError={(error) => {
    captureSentryException(error, {
      screen: 'welcome',
      component: 'hero_image',
      image: 'RIF_Onboarding_Image.png'
    });
  }}
/>
```

### 2. Navigation Crashes
If crashes are related to navigation:

```typescript
// Enhanced navigation error handling
const handleNavigation = (route: string) => {
  try {
    addSentryBreadcrumb(`Navigating to ${route}`, 'navigation', {
      from: 'welcome',
      to: route,
    });
    router.push(route);
  } catch (error) {
    captureSentryException(error as Error, {
      screen: 'welcome',
      action: 'navigation',
      route,
      error_type: 'navigation_error',
    });
  }
};
```

### 3. Design System Crashes
If crashes are related to design tokens:

```typescript
// Add fallback for design tokens
const primaryColor = mobileTokens?.colors?.primary?.main || '#44D62C';
```

## Alerting and Notifications

### Setting Up Alerts
1. Go to Sentry dashboard
2. Navigate to "Alerts" section
3. Create alerts for:
   - New crashes in production
   - Crashes with `screen:welcome` tag
   - High crash rate (>5% of sessions)

### Email Notifications
- Sentry will send email notifications for new crashes
- Check the email account: rentitforward.app@gmail.com

## Best Practices

### 1. Regular Monitoring
- Check Sentry dashboard daily during active development
- Monitor crash rates after each TestFlight release
- Set up alerts for critical issues

### 2. Crash Analysis
- Always check breadcrumbs to understand user flow
- Look for patterns in device types and iOS versions
- Correlate crashes with app updates

### 3. Testing
- Test crash monitoring in development builds
- Use the test buttons to verify Sentry integration
- Test on different iOS versions and devices

## Troubleshooting

### If No Crashes Appear in Sentry
1. Check if Sentry is properly initialized
2. Verify DSN configuration
3. Check network connectivity
4. Ensure app is in production mode

### If Crashes Don't Have Context
1. Check if user context is being set
2. Verify breadcrumbs are being added
3. Ensure error boundaries are working

### If Dashboard Access Issues
1. Verify email account: rentitforward.app@gmail.com
2. Check Sentry project permissions
3. Ensure correct project URL

## Next Steps

1. **Monitor Dashboard**: Check for welcome page crashes in the next 24-48 hours
2. **Analyze Patterns**: Look for common crash causes and device types
3. **Implement Fixes**: Based on crash analysis, implement targeted fixes
4. **Test Fixes**: Deploy fixes and monitor for resolution

The enhanced crash monitoring will now provide detailed information about any crashes that occur on the welcome page or anywhere else in the app.
