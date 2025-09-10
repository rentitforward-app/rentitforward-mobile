import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/components/AuthProvider';
import { mobileTokens } from '../../src/lib/design-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { loading } = useAuth();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ code?: string }>({});

  // Refs for keyboard navigation
  const codeInputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Get email from AsyncStorage (set during signup)
    const getSignupEmail = async () => {
      try {
        const signupEmail = await AsyncStorage.getItem('signup_email');
        if (signupEmail) {
          setEmail(signupEmail);
        } else {
          // If no email found, redirect to signup
          Alert.alert('Error', 'Please sign up first');
          router.replace('/(auth)/sign-up');
        }
      } catch (error) {
        console.error('Error getting signup email:', error);
        router.replace('/(auth)/sign-up');
      }
    };

    getSignupEmail();
  }, [router]);

  useEffect(() => {
    // Handle cooldown timer
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const validateForm = () => {
    const newErrors: { code?: string } = {};

    if (!code.trim()) {
      newErrors.code = 'Verification code is required';
    } else if (code.length !== 6) {
      newErrors.code = 'Verification code must be 6 characters';
    } else if (!/^\d{6}$/.test(code)) {
      newErrors.code = 'Verification code must contain only numbers';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerifyCode = async () => {
    if (!validateForm() || !email) return;

    setIsLoading(true);
    try {
      const { supabase } = await import('../../src/lib/supabase');
      
      const { data: verifyData, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'signup'
      });

      if (error) {
        Alert.alert('Verification Error', error.message);
        return;
      }

      if (verifyData.user) {
        // Clear the stored email
        await AsyncStorage.removeItem('signup_email');
        
        Alert.alert(
          'Success!',
          'Email verified successfully!',
          [
            {
              text: 'Continue',
              onPress: () => {
                // Navigate to onboarding
                router.replace('/(auth)/onboarding');
              }
            }
          ]
        );
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email || resendCooldown > 0) return;

    setIsResending(true);
    try {
      const { supabase } = await import('../../src/lib/supabase');
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        // No emailRedirectTo option - this will send OTP code instead of link
      });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Success', 'New verification code sent!');
        setResendCooldown(60); // 60 second cooldown
      }
    } catch (error: any) {
      console.error('Resend error:', error);
      Alert.alert('Error', 'Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const maskEmail = (email: string) => {
    if (!email) return '';
    const [name, domain] = email.split('@');
    const maskedName = name.charAt(0) + '*'.repeat(name.length - 2) + name.charAt(name.length - 1);
    return `${maskedName}@${domain}`;
  };

  const handleCodeChange = (text: string) => {
    // Only allow numbers and limit to 6 characters
    const numericValue = text.replace(/[^0-9]/g, '').slice(0, 6);
    setCode(numericValue);
    
    // Clear error when user starts typing
    if (errors.code) {
      setErrors(prev => ({ ...prev, code: undefined }));
    }
  };

  const handleCodeSubmit = () => {
    // Dismiss keyboard and attempt verification
    codeInputRef.current?.blur();
    handleVerifyCode();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image Section */}
        <View style={styles.heroSection}>
          <Image
            source={require('../../assets/images/RIF_Onboarding_SoscialSignin2.png')}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay}>
            {/* Logo */}
            <Image
              source={require('../../assets/images/RentitForwardInvertedColorTransparentbg.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="mail" size={32} color="white" />
            </View>
            <Text style={styles.title}>Check your email</Text>
            <Text style={styles.subtitle}>
              We sent a verification code to
            </Text>
            <Text style={styles.emailText}>
              {maskEmail(email)}
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Verification code</Text>
              <TextInput
                ref={codeInputRef}
                style={[styles.codeInput, errors.code && styles.inputError]}
                value={code}
                onChangeText={handleCodeChange}
                placeholder="000000"
                keyboardType="number-pad"
                maxLength={6}
                autoComplete="one-time-code"
                returnKeyType="done"
                blurOnSubmit={true}
                onSubmitEditing={handleCodeSubmit}
                editable={!isLoading && !loading}
                textAlign="center"
              />
              {errors.code && <Text style={styles.errorText}>{errors.code}</Text>}
            </View>

            <TouchableOpacity
              onPress={handleVerifyCode}
              style={[
                styles.verifyButton, 
                (isLoading || loading || !code || code.length !== 6) && styles.buttonDisabled
              ]}
              disabled={isLoading || loading || !code || code.length !== 6}
            >
              {isLoading || loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.verifyButtonText}>Verify Email</Text>
                  <Ionicons name="checkmark" size={20} color="white" style={styles.buttonIcon} />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Resend Section */}
          <View style={styles.resendSection}>
            <Text style={styles.resendText}>
              Didn't receive the code?
            </Text>
            <TouchableOpacity
              onPress={handleResendCode}
              style={[
                styles.resendButton,
                (isResending || resendCooldown > 0) && styles.buttonDisabled
              ]}
              disabled={isResending || resendCooldown > 0}
            >
              {isResending ? (
                <View style={styles.buttonContent}>
                  <ActivityIndicator size="small" color={mobileTokens.colors.primary.main} />
                  <Text style={styles.resendButtonText}>Sending...</Text>
                </View>
              ) : resendCooldown > 0 ? (
                <View style={styles.buttonContent}>
                  <Ionicons name="refresh" size={16} color={mobileTokens.colors.primary.main} />
                  <Text style={styles.resendButtonText}>Resend in {resendCooldown}s</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Ionicons name="refresh" size={16} color={mobileTokens.colors.primary.main} />
                  <Text style={styles.resendButtonText}>Resend verification code</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Help Text */}
          <View style={styles.helpSection}>
            <Text style={styles.helpText}>
              Check your spam folder if you don't see the code. The verification code expires in 60 minutes.
            </Text>
          </View>

          {/* Back to Signup */}
          <View style={styles.backSection}>
            <TouchableOpacity
              onPress={async () => {
                await AsyncStorage.removeItem('signup_email');
                router.replace('/(auth)/sign-up');
              }}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={16} color="#6B7280" />
              <Text style={styles.backButtonText}>Back to signup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroSection: {
    height: screenHeight * 0.4,
    position: 'relative',
  },
  heroImage: {
    width: screenWidth,
    height: '100%',
  },
  heroOverlay: {
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
  logo: {
    width: 120,
    height: 40,
  },
  contentSection: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingTop: 32,
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
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: mobileTokens.colors.primary.main,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 16,
    color: mobileTokens.colors.primary.main,
    fontWeight: '600',
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  codeInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 24,
    fontWeight: '600',
    backgroundColor: 'white',
    letterSpacing: 4,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
  },
  verifyButton: {
    backgroundColor: mobileTokens.colors.primary.main,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: mobileTokens.colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: mobileTokens.colors.primary.light,
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  resendSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resendText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  resendButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendButtonText: {
    color: mobileTokens.colors.primary.main,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  helpSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  helpText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
  },
  backSection: {
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  backButtonText: {
    color: '#6B7280',
    fontSize: 14,
    marginLeft: 4,
  },
});
