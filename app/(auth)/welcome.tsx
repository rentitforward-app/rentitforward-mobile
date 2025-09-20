import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StatusBar, 
  StyleSheet, 
  Dimensions, 
  Image, 
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { mobileTokens } from '../../src/lib/design-system';
import { addSentryBreadcrumb, captureSentryException } from '../../src/lib/sentry';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  // Add Sentry breadcrumb when welcome screen loads
  useEffect(() => {
    addSentryBreadcrumb('Welcome screen loaded', 'navigation', {
      screen: 'welcome',
      timestamp: new Date().toISOString(),
    });
  }, []);

  // Enhanced error handling for navigation
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

  const handleSignIn = () => {
    try {
      addSentryBreadcrumb('Sign In button pressed', 'user_action', {
        screen: 'welcome',
        action: 'sign_in',
      });
      router.push('/(auth)/sign-in');
    } catch (error) {
      captureSentryException(error as Error, {
        screen: 'welcome',
        action: 'sign_in_navigation',
        error_type: 'navigation_error',
      });
    }
  };

  const handleTermsPress = () => {
    try {
      addSentryBreadcrumb('Terms of Service link pressed', 'user_action', {
        screen: 'welcome',
        action: 'terms_link',
      });
      router.push('/(auth)/terms');
    } catch (error) {
      captureSentryException(error as Error, {
        screen: 'welcome',
        action: 'terms_navigation',
        error_type: 'navigation_error',
      });
    }
  };

  const handlePrivacyPress = () => {
    try {
      addSentryBreadcrumb('Privacy Policy link pressed', 'user_action', {
        screen: 'welcome',
        action: 'privacy_link',
      });
      router.push('/(auth)/privacy');
    } catch (error) {
      captureSentryException(error as Error, {
        screen: 'welcome',
        action: 'privacy_navigation',
        error_type: 'navigation_error',
      });
    }
  };

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Image Section */}
          <View style={styles.heroSection}>
            <Image
              source={require('../../assets/images/RIF_Onboarding_Image.png')}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <View style={styles.logoContainer}>
              {/* Logo */}
              <Image
                source={require('../../assets/images/RentitForwardInvertedColorTransparentbg.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            
            {/* Hero Text Overlay */}
            <View style={styles.heroTextOverlay}>
              <Text style={styles.heroHeading}>Share More, Buy Less</Text>
            </View>
          </View>

          {/* Content Section */}
          <View style={styles.contentSection}>
            <Text style={styles.description}>
              Access tools, electronics, sports gear, and more from people in your community.
            </Text>
            
            <Text style={styles.subDescription}>
            Building communities, one rental at a time.
            </Text>
            
            {/* Action Buttons */}
            <TouchableOpacity
              onPress={handleGetStarted}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSignIn}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>Sign In</Text>
            </TouchableOpacity>
            
            <Text style={styles.termsText}>
              By continuing, you agree to our{' '}
              <Text style={styles.linkText} onPress={handleTermsPress}>
                Terms of Service
              </Text>
              {' '}and{' '}
              <Text style={styles.linkText} onPress={handlePrivacyPress}>
                Privacy Policy
              </Text>
            </Text>
          </View>
        </ScrollView>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  heroSection: {
    height: screenHeight * 0.4,
    position: 'relative',
  },
  heroImage: {
    width: screenWidth,
    height: '100%',
  } as const,
  logoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 20,
  },
  logoImage: {
    width: 120,
    height: 40,
  },
  heroTextOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 120,
    paddingBottom: 40,
    zIndex: 5,
  },
  heroHeading: {
    fontSize: Math.min(32, screenWidth * 0.08),
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    lineHeight: Math.min(40, screenWidth * 0.1),
  },
  heroSubheading: {
    fontSize: Math.min(18, screenWidth * 0.045),
    fontWeight: '500',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    lineHeight: Math.min(24, screenWidth * 0.06),
    opacity: 0.95,
    marginBottom: 20,
  },
  contentSection: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  description: {
    fontSize: Math.min(16, screenWidth * 0.04),
    color: '#374151',
    textAlign: 'center',
    lineHeight: Math.min(24, screenWidth * 0.06),
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  subDescription: {
    fontSize: Math.min(16, screenWidth * 0.04),
    color: '#374151',
    textAlign: 'center',
    lineHeight: Math.min(24, screenWidth * 0.06),
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  primaryButton: {
    backgroundColor: mobileTokens.colors.primary.main,
    borderRadius: 12,
    paddingVertical: 18,
    marginBottom: 16,
    shadowColor: mobileTokens.colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 56,
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 24,
    backgroundColor: 'white',
    minHeight: 52,
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  termsText: {
    fontSize: Math.min(12, screenWidth * 0.03),
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: Math.min(16, screenWidth * 0.04),
    paddingHorizontal: 16,
  },
  linkText: {
    color: mobileTokens.colors.primary.main,
    fontWeight: '500',
  },
}); 