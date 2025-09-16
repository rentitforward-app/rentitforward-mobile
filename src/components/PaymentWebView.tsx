import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Modal } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../lib/design-system';

interface PaymentWebViewProps {
  isVisible: boolean;
  paymentUrl: string;
  onSuccess: () => void;
  onCancel: () => void;
  onError: (error: string) => void;
}

export function PaymentWebView({ 
  isVisible, 
  paymentUrl, 
  onSuccess, 
  onCancel, 
  onError 
}: PaymentWebViewProps) {
  const [loading, setLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState('');
  const webViewRef = useRef<WebView>(null);

  const handleNavigationStateChange = (navState: any) => {
    const { url } = navState;
    setCurrentUrl(url);
    console.log('Navigation state changed to:', url);

    // Check for success URL patterns (both HTTPS redirect and deep link)
    if (url.includes('rentitforward.com.au/payments/success') || url.includes('payment-success')) {
      console.log('Payment successful detected in navigation change');
      console.log('Calling onSuccess from navigation change...');
      setTimeout(() => {
        console.log('Executing onSuccess from navigation change');
        onSuccess();
      }, 100);
      return;
    }

    // Check for cancel URL patterns (both HTTPS redirect and deep link)
    if (url.includes('rentitforward.com.au/payments/cancel') || url.includes('payment-cancel')) {
      console.log('Payment cancelled detected in navigation change');
      setTimeout(() => {
        onCancel();
      }, 100);
      return;
    }
    
    // Check for error patterns
    if (url.includes('error') || url.includes('failed')) {
      console.log('Payment error detected in navigation change');
      setTimeout(() => {
        onError('Payment failed. Please try again.');
      }, 100);
      return;
    }
  };

  const handleShouldStartLoadWithRequest = (request: any) => {
    const { url } = request;
    
    // Handle success URLs
    if (url.includes('rentitforward.com.au/payments/success') || url.includes('payment-success')) {
      console.log('Intercepting success URL:', url);
      console.log('Calling onSuccess callback...');
      setTimeout(() => {
        console.log('Executing onSuccess callback now');
        onSuccess();
      }, 100);
      return false; // Don't load these URLs
    }
    
    // Handle cancel URLs
    if (url.includes('rentitforward.com.au/payments/cancel') || url.includes('payment-cancel')) {
      console.log('Intercepting cancel URL:', url);
      setTimeout(() => {
        onCancel();
      }, 100);
      return false; // Don't load these URLs
    }
    
    // Handle error URLs
    if (url.includes('error') || url.includes('failed')) {
      console.log('Intercepting error URL:', url);
      setTimeout(() => {
        onError('Payment failed. Please try again.');
      }, 100);
      return false; // Don't load these URLs
    }
    
    return true; // Allow other URLs to load
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error:', nativeEvent);
    onError('Failed to load payment page. Please check your internet connection.');
  };

  const handleClose = () => {
    Alert.alert(
      'Cancel Payment?',
      'Are you sure you want to cancel the payment? Your booking will remain unpaid.',
      [
        {
          text: 'Continue Payment',
          style: 'cancel',
        },
        {
          text: 'Cancel Payment',
          style: 'destructive',
          onPress: onCancel,
        },
      ]
    );
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={{ flex: 1, backgroundColor: colors.white }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: colors.gray[200],
          backgroundColor: colors.white,
        }}>
          <Text style={{
            fontSize: typography.sizes.lg,
            fontWeight: typography.weights.semibold,
            color: colors.gray[900],
          }}>
            Complete Payment
          </Text>
          
          <TouchableOpacity
            onPress={handleClose}
            style={{
              padding: spacing.xs,
              borderRadius: 20,
              backgroundColor: colors.gray[100],
            }}
          >
            <Ionicons name="close" size={20} color={colors.gray[600]} />
          </TouchableOpacity>
        </View>

        {/* Loading indicator */}
        {loading && (
          <View style={{
            position: 'absolute',
            top: 100,
            left: 0,
            right: 0,
            alignItems: 'center',
            zIndex: 1,
          }}>
            <ActivityIndicator size="large" color={colors.primary.green} />
            <Text style={{
              marginTop: spacing.sm,
              fontSize: typography.sizes.base,
              color: colors.gray[600],
            }}>
              Loading payment page...
            </Text>
          </View>
        )}

        {/* WebView */}
            <WebView
              ref={webViewRef}
              source={{ uri: paymentUrl }}
              onNavigationStateChange={handleNavigationStateChange}
              onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
              onError={handleError}
              onLoadStart={() => setLoading(true)}
              onLoadEnd={() => setLoading(false)}
              style={{ flex: 1 }}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              scalesPageToFit={true}
              allowsInlineMediaPlayback={true}
            />

        {/* URL indicator (for debugging) */}
        {__DEV__ && (
          <View style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: spacing.xs,
          }}>
            <Text style={{
              fontSize: typography.sizes.xs,
              color: colors.white,
            }} numberOfLines={1}>
              {currentUrl}
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
}