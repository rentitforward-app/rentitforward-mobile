import React from 'react';
import { TouchableOpacity, Text, Alert, View, StyleSheet } from 'react-native';
import { captureSentryException, captureSentryMessage, addSentryBreadcrumb } from '../lib/sentry';

/**
 * Test component for Sentry integration
 * This should only be used in development builds
 */
export function SentryTestButton(): React.JSX.Element | null {
  // Only show in development
  if (!__DEV__) {
    return null;
  }

  const testError = () => {
    try {
      // Add breadcrumb before throwing error
      addSentryBreadcrumb('Testing Sentry error capture', 'test');
      
      // Throw a test error
      throw new Error('This is a test error for Sentry integration');
    } catch (error) {
      captureSentryException(error as Error, { 
        test: true, 
        component: 'SentryTestButton' 
      });
      
      Alert.alert(
        'Test Error Sent', 
        'A test error has been sent to Sentry. Check your Sentry dashboard to verify it was received.'
      );
    }
  };

  const testMessage = () => {
    addSentryBreadcrumb('Testing Sentry message capture', 'test');
    
    captureSentryMessage(
      'This is a test message for Sentry integration', 
      'info', 
      { 
        test: true, 
        component: 'SentryTestButton',
        timestamp: new Date().toISOString()
      }
    );
    
    Alert.alert(
      'Test Message Sent', 
      'A test message has been sent to Sentry. Check your Sentry dashboard to verify it was received.'
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Sentry Test
      </Text>
      <TouchableOpacity
        onPress={testError}
        style={[styles.button, styles.errorButton]}
      >
        <Text style={styles.buttonText}>
          Test Error
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={testMessage}
        style={[styles.button, styles.messageButton]}
      >
        <Text style={styles.buttonText}>
          Test Message
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    right: 20,
    zIndex: 1000,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 10,
    borderRadius: 8,
  },
  title: {
    color: 'white',
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  button: {
    padding: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  errorButton: {
    backgroundColor: '#ef4444',
  },
  messageButton: {
    backgroundColor: '#3b82f6',
  },
  buttonText: {
    color: 'white',
    fontSize: 10,
    textAlign: 'center',
  },
});
