import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StatusBar, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth } = Dimensions.get('window');
const INTRO_SEEN_KEY = '@intro_seen';

export default function WelcomeScreen() {
  const router = useRouter();

  useEffect(() => {
    // Mark intro as seen when user reaches welcome screen
    const markIntroAsSeen = async () => {
      try {
        await AsyncStorage.setItem(INTRO_SEEN_KEY, 'true');
      } catch (error) {
        console.error('Error marking intro as seen:', error);
      }
    };

    markIntroAsSeen();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Main Content */}
      <View style={styles.content}>
        {/* Brand Header */}
        <View style={styles.brandSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🔄</Text>
          </View>
          <Text style={styles.title}>Rent It Forward</Text>
          <Text style={styles.tagline}>Share. Rent. Build Community.</Text>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroImageContainer}>
            <View style={styles.heroCircle1}>
              <Text style={styles.heroEmoji}>🔧</Text>
            </View>
            <View style={styles.heroCircle2}>
              <Text style={styles.heroEmoji}>📱</Text>
            </View>
            <View style={styles.heroCircle3}>
              <Text style={styles.heroEmoji}>🏠</Text>
            </View>
          </View>
          
          <Text style={styles.description}>
            Access tools, electronics, sports gear, and more from people in your community.
          </Text>
          
          <Text style={styles.subDescription}>
            Save money, live sustainably, and make sharing second nature.
          </Text>
        </View>
      </View>

      {/* Bottom Action Section */}
      <View style={styles.actionSection}>
        <TouchableOpacity
          onPress={() => router.push('/(auth)/sign-up')}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>
            Get Started
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(auth)/sign-in')}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>
            I already have an account
          </Text>
        </TouchableOpacity>

        <View style={styles.socialSection}>
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>
          
          <TouchableOpacity
            onPress={() => router.push('/(tabs)')}
            style={styles.browseButton}
          >
            <Text style={styles.browseButtonText}>
              Browse available items
            </Text>
          </TouchableOpacity>
        </View>

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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#16A34A',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoEmoji: {
    fontSize: 40,
    color: 'white',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    color: '#16A34A',
    textAlign: 'center',
    fontWeight: '500',
  },
  heroSection: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  heroImageContainer: {
    position: 'relative',
    width: 240,
    height: 240,
    marginBottom: 40,
  },
  heroCircle1: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 80,
    height: 80,
    backgroundColor: '#DCFCE7',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCircle2: {
    position: 'absolute',
    top: 80,
    right: 10,
    width: 100,
    height: 100,
    backgroundColor: '#FEF3C7',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCircle3: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    width: 90,
    height: 90,
    backgroundColor: '#DBEAFE',
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroEmoji: {
    fontSize: 32,
  },
  description: {
    fontSize: 18,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  subDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  actionSection: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  primaryButton: {
    backgroundColor: '#16A34A',
    borderRadius: 12,
    paddingVertical: 18,
    marginBottom: 16,
    shadowColor: '#16A34A',
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
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 24,
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  socialSection: {
    marginBottom: 24,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginHorizontal: 16,
  },
  browseButton: {
    paddingVertical: 12,
  },
  browseButtonText: {
    color: '#16A34A',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  termsText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
     linkText: {
     color: '#16A34A',
     fontWeight: '500',
   },
 }); 