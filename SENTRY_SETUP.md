# Sentry Integration for Rent It Forward Mobile

This document describes the Sentry integration setup for error monitoring and performance tracking in the Rent It Forward mobile app.

## Overview

Sentry is configured to provide:
- **Error Monitoring**: Automatic capture of JavaScript errors and exceptions
- **Performance Monitoring**: Track app performance and slow operations
- **User Context**: Associate errors with specific users
- **Breadcrumbs**: Track user actions leading to errors
- **Release Tracking**: Monitor errors across different app versions

## Configuration

### Environment Variables

The Sentry DSN is configured in both environment files:

- **Development**: `.env.local`
- **Production**: `.env.production`

```bash
EXPO_PUBLIC_SENTRY_DSN=https://3e77ab571d241b2c614f3b82b0cbcfd2@o4509959319453696.ingest.de.sentry.io/4509959409762384
```

### App Configuration

The DSN is also configured in `app.json` for build-time access:

```json
{
  "expo": {
    "extra": {
      "sentryDsn": "https://3e77ab571d241b2c614f3b82b0cbcfd2@o4509959319453696.ingest.de.sentry.io/4509959409762384"
    }
  }
}
```

## Implementation Details

### Initialization

Sentry is initialized as early as possible in the app lifecycle in `app/_layout.tsx`:

```typescript
import { initSentry } from '../src/lib/sentry';

// Initialize Sentry as early as possible
initSentry();
```

### Configuration Options

The Sentry configuration includes:

- **Error Monitoring**: Enabled with automatic session tracking
- **Performance Monitoring**: 100% sampling in development, 10% in production
- **Profiling**: 100% sampling in development, 10% in production
- **User Context**: Automatically set when users authenticate
- **Environment**: Set to 'development' or 'production' based on build
- **Release Tracking**: Uses app version from `app.json`

### User Context Integration

User context is automatically managed through the `AuthProvider`:

- **Sign In**: User ID, email, and name are set in Sentry context
- **Sign Out**: User context is cleared
- **Auth Errors**: All authentication errors are captured with context

### Error Tracking

The following areas have integrated error tracking:

- **Authentication**: Sign in, sign up, sign out, password reset
- **Profile Management**: Profile updates and refreshes
- **Manual Capture**: Custom error and message capture functions

## Usage

### Automatic Error Capture

Most errors are automatically captured by Sentry. No additional code is required for:
- Unhandled JavaScript exceptions
- Network errors
- React Native bridge errors

### Manual Error Capture

For custom error handling:

```typescript
import { captureSentryException, captureSentryMessage } from '../lib/sentry';

// Capture an exception
try {
  // Some operation that might fail
} catch (error) {
  captureSentryException(error, {
    context: 'additional context data',
    userId: user.id,
  });
}

// Capture a custom message
captureSentryMessage('User performed important action', 'info', {
  action: 'button_click',
  screen: 'home',
});
```

### Adding Breadcrumbs

Track user actions leading to errors:

```typescript
import { addSentryBreadcrumb } from '../lib/sentry';

addSentryBreadcrumb('User navigated to profile', 'navigation', {
  from: 'home',
  to: 'profile',
});
```

## Testing

### Development Testing

In development builds, a test button is available in the top-right corner that allows you to:

1. **Test Error Capture**: Sends a test error to Sentry
2. **Test Message Capture**: Sends a test message to Sentry

### Manual Testing

You can also test the integration using the test script:

```bash
node scripts/test-sentry.js
```

### Verification

After testing, check your Sentry dashboard at:
https://rent-it-forward.sentry.io/insights/projects/react-native/

## Dashboard Access

The Sentry project is configured for the email account: `rentitforward.app@gmail.com`

### Key Dashboard Sections

- **Issues**: View and manage error reports
- **Performance**: Monitor app performance metrics
- **Releases**: Track errors across different app versions
- **Users**: View user-specific error reports

## Best Practices

### Error Handling

1. **Don't suppress all errors**: Let Sentry capture unhandled errors
2. **Add context**: Include relevant user and app state in error reports
3. **Use breadcrumbs**: Track user actions leading to errors
4. **Set user context**: Always associate errors with users when possible

### Performance

1. **Sampling rates**: Production uses 10% sampling to avoid performance impact
2. **Filter sensitive data**: Use `beforeSend` to filter out sensitive information
3. **Release tracking**: Tag releases to track error rates across versions

### Privacy

1. **PII handling**: `sendDefaultPii: true` is enabled - ensure compliance with privacy policies
2. **Data filtering**: Review and filter sensitive data in the `beforeSend` callback
3. **User consent**: Ensure users consent to error reporting

## Troubleshooting

### Common Issues

1. **DSN not found**: Check environment variables and app.json configuration
2. **Events not appearing**: Verify network connectivity and DSN validity
3. **Performance impact**: Adjust sampling rates if needed

### Debug Mode

In development, Sentry logs initialization and events to the console. Check the console for:
- "Sentry initialized successfully"
- Event details in the `beforeSend` callback

### Support

For Sentry-specific issues, refer to:
- [Sentry React Native Documentation](https://docs.sentry.io/platforms/react-native/)
- [Sentry Dashboard](https://rent-it-forward.sentry.io/)

## Security

- The DSN is safe to include in client-side code
- No sensitive data should be included in error reports
- User authentication tokens are not automatically included
- Review the `beforeSend` callback to ensure no sensitive data is transmitted
