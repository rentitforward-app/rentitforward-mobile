import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

/**
 * Initialize Sentry for error monitoring and performance tracking
 * This should be called as early as possible in the app lifecycle
 */
export function initSentry(): void {
  const dsn = Constants.expoConfig?.extra?.sentryDsn || process.env.EXPO_PUBLIC_SENTRY_DSN;
  
  if (!dsn) {
    console.warn('Sentry DSN not found. Error monitoring will be disabled.');
    return;
  }

  Sentry.init({
    dsn,
    // Enable error monitoring
    enableAutoSessionTracking: true,
    // Enable performance monitoring
    tracesSampleRate: __DEV__ ? 1.0 : 0.1, // 100% in dev, 10% in production
    // Enable profiling
    profilesSampleRate: __DEV__ ? 1.0 : 0.1, // 100% in dev, 10% in production
    // Add more context data to events (IP address, cookies, user, etc.)
    sendDefaultPii: true,
    // Set environment
    environment: __DEV__ ? 'development' : 'production',
    // Set release version
    release: Constants.expoConfig?.version || '1.0.0',
    // Set user context
    beforeSend(event) {
      // Add custom context
      event.tags = {
        ...event.tags,
        platform: 'mobile',
        app: 'rentitforward-mobile',
      };
      
      // Filter out sensitive data in development
      if (__DEV__) {
        console.log('Sentry Event:', event);
      }
      
      return event;
    },
    // Configure integrations - using default integrations for now
    // integrations: [
    //   new Sentry.ReactNativeTracing({
    //     tracesSampleRate: __DEV__ ? 1.0 : 0.1,
    //   }),
    // ],
  });

  console.log('Sentry initialized successfully');
}

/**
 * Set user context for Sentry
 */
export function setSentryUser(user: { id: string; email?: string; name?: string }): void {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.name,
  });
}

/**
 * Clear user context from Sentry
 */
export function clearSentryUser(): void {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging
 */
export function addSentryBreadcrumb(message: string, category?: string, data?: any): void {
  Sentry.addBreadcrumb({
    message,
    category: category || 'user',
    data,
    level: 'info',
  });
}

/**
 * Capture exception manually
 */
export function captureSentryException(error: Error, context?: any): void {
  Sentry.captureException(error, {
    tags: {
      source: 'manual',
    },
    extra: context,
  });
}

/**
 * Capture message manually
 */
export function captureSentryMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: any): void {
  Sentry.captureMessage(message, level);
  if (context) {
    Sentry.setContext('custom_context', context);
  }
}