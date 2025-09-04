/**
 * Test script to verify Sentry integration
 * Run this with: node scripts/test-sentry.js
 */

const { initSentry, captureSentryException, captureSentryMessage } = require('../src/lib/sentry');

console.log('Testing Sentry integration...');

// Initialize Sentry
initSentry();

// Test message capture
console.log('Sending test message to Sentry...');
captureSentryMessage('Sentry integration test from mobile app', 'info', {
  test: true,
  timestamp: new Date().toISOString(),
  platform: 'mobile',
});

// Test exception capture
console.log('Sending test exception to Sentry...');
try {
  throw new Error('Test exception for Sentry integration verification');
} catch (error) {
  captureSentryException(error, {
    test: true,
    component: 'test-script',
    timestamp: new Date().toISOString(),
  });
}

console.log('Test completed! Check your Sentry dashboard to verify the events were received.');
console.log('Dashboard URL: https://rent-it-forward.sentry.io/insights/projects/react-native/');
