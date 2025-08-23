import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StatusBar, 
  StyleSheet, 
  Dimensions, 
  Image, 
  ScrollView, 
  SafeAreaView 
} from 'react-native';
import { useRouter } from 'expo-router';
import { mobileTokens } from '../../src/lib/design-system';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
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
            By continuing, you agree to our <Text style={styles.linkText}>Terms of Service</Text> and <Text style={styles.linkText}>Privacy Policy</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  heroSection: {
    height: Math.min(screenHeight * 0.5, 400),
    position: 'relative',
    minHeight: 300,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  } as const,
  logoContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  logoImage: {
    width: Math.min(100, screenWidth * 0.25),
    height: Math.min(46, screenWidth * 0.12),
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
    paddingHorizontal: 24,
  },
  heroTitle: {
    fontSize: Math.min(28, screenWidth * 0.07),
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    lineHeight: Math.min(36, screenWidth * 0.09),
  },
  heroSubtitle: {
    fontSize: Math.min(28, screenWidth * 0.07),
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    lineHeight: Math.min(36, screenWidth * 0.09),
  },
  contentSection: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    minHeight: screenHeight * 0.4,
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