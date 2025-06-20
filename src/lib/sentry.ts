import * as Sentry from '@sentry/react-native';

// Configure Sentry for React Native
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  
  // Set tracesSampleRate to 1.0 to capture 100% of the transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
  
  // Set debug to true to see SDK logs
  debug: __DEV__,
  
  // Configure environment
  environment: __DEV__ ? 'development' : 'production',
  
  // Configure integrations
  integrations: [
    // Add React Native specific integrations
    Sentry.mobileReplayIntegration({
      maskAllText: true,
      maskAllImages: true,
      maskAllVectors: true,
    }),
  ],
  
  // Configure sessions
  sessionTrackingEnabled: true,
  
  // Configure user context
  beforeSend(event) {
    // Filter out development errors in production
    if (__DEV__) {
      return event;
    }
    
    // You can modify or filter events here
    return event;
  },
});

export default Sentry; 