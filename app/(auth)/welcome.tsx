import React from 'react';
import { View, Text, TouchableOpacity, StatusBar, StyleSheet, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { mobileTokens } from '../../src/lib/design-system';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Hero Section with Overlaid Text */}
      <View style={styles.heroSection}>
        <Image 
          source={require('../../assets/images/RIF_Onboarding_Image.png')}
          style={styles.heroImage}
          resizeMode="cover"
        />
        
        {/* PNG Logo in Top Right */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/images/RentitForwardInvertedColorTransparentbg.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        
        {/* Overlay Content */}
        <View style={styles.overlay}>
          <View style={styles.overlayContent}>
            <Text style={styles.heroTitle}>Rent What You Need</Text>
            <Text style={styles.heroSubtitle}>Share What You Have</Text>
          </View>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.contentSection}>
        <Text style={styles.description}>
          Access tools, electronics, sports gear, and more from people in your community.
        </Text>
        
        <Text style={styles.subDescription}>
          Save money, live sustainably, and make sharing second nature.
        </Text>
        
        {/* Action Buttons */}
        <TouchableOpacity
          onPress={() => router.push('/(auth)/sign-up')}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(auth)/sign-in')}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>Sign In</Text>
        </TouchableOpacity>
        
        <Text style={styles.termsText}>
          By continuing, you agree to our{' '}
          <Text style={styles.linkText}>Terms of Service</Text> and{' '}
          <Text style={styles.linkText}>Privacy Policy</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  heroSection: {
    height: screenHeight * 0.55,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  } as const,
  logoContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
        zIndex: 10,
  },
  logoImage: {
    width: 100,
    height: 46,
  } as const,
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContent: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  contentSection: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: 48,
    justifyContent: 'space-between',
  },
  description: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  subDescription: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
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
    marginBottom: 32,
    backgroundColor: 'white',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  termsText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
  },
  linkText: {
    color: mobileTokens.colors.primary.main,
    fontWeight: '500',
  },
}); 