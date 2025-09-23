import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../lib/design-system';

interface AuthWebViewProps {
  isVisible: boolean;
  url: string;
  title: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AuthWebView({ 
  isVisible, 
  url, 
  title,
  onClose,
  onSuccess
}: AuthWebViewProps) {
  const [loading, setLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState('');
  const webViewRef = useRef<WebView>(null);

  const handleNavigationStateChange = (navState: any) => {
    const { url: navUrl } = navState;
    setCurrentUrl(navUrl);
    console.log('Auth WebView navigation state changed to:', navUrl);

    // Check for success patterns (password reset completion)
    if (navUrl.includes('reset-password') && navUrl.includes('success')) {
      console.log('Password reset success detected');
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 100);
      }
      return;
    }

    // Check if user navigated to sign-in page (likely after successful reset)
    if (navUrl.includes('/sign-in') || navUrl.includes('/login')) {
      console.log('User navigated to sign-in page - likely successful reset');
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 100);
      }
      return;
    }
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('Auth WebView error:', nativeEvent);
    setLoading(false);
  };

  const handleClose = () => {
    onClose();
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
          paddingTop: spacing.lg, // Extra padding for status bar
          borderBottomWidth: 1,
          borderBottomColor: colors.gray[200],
          backgroundColor: colors.white,
        }}>
          <Text style={{
            fontSize: typography.sizes.lg,
            fontWeight: typography.weights.semibold,
            color: colors.gray[900],
            flex: 1,
          }}>
            {title}
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
            top: '50%',
            left: 0,
            right: 0,
            alignItems: 'center',
            zIndex: 1,
          }}>
            <ActivityIndicator size="large" color={colors.primary.main} />
            <Text style={{
              marginTop: spacing.sm,
              fontSize: typography.sizes.base,
              color: colors.gray[600],
            }}>
              Loading...
            </Text>
          </View>
        )}

        {/* WebView */}
        <WebView
          ref={webViewRef}
          source={{ uri: url }}
          onNavigationStateChange={handleNavigationStateChange}
          onError={handleError}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          style={{ flex: 1 }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          allowsInlineMediaPlayback={true}
          // Allow the web page to handle its own navigation
          onShouldStartLoadWithRequest={() => true}
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
