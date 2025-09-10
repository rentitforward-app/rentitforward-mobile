import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/components/AuthProvider';
import { mobileTokens } from '../../src/lib/design-system';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, loading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // Refs for keyboard navigation
  const fullNameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  const validateForm = () => {
    const newErrors: {
      fullName?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    try {
      await signUp(email.trim(), password, fullName.trim());
      // User will be redirected to email verification screen
    } catch (error) {
      // Error is already handled in AuthProvider
      console.error('Sign up error:', error);
    }
  };

  // Keyboard navigation handlers
  const handleFullNameSubmit = () => {
    emailInputRef.current?.focus();
  };

  const handleEmailSubmit = () => {
    passwordInputRef.current?.focus();
  };

  const handlePasswordSubmit = () => {
    confirmPasswordInputRef.current?.focus();
  };

  const handleConfirmPasswordSubmit = () => {
    // Dismiss keyboard and attempt sign up
    confirmPasswordInputRef.current?.blur();
    handleSignUp();
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join the community and start sharing
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                ref={fullNameInputRef}
                style={[styles.input, errors.fullName && styles.inputError]}
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  if (errors.fullName) {
                    setErrors(prev => ({ ...prev, fullName: undefined }));
                  }
                }}
                placeholder="Enter your full name"
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={handleFullNameSubmit}
                editable={!loading}
              />
              {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                ref={emailInputRef}
                style={[styles.input, errors.email && styles.inputError]}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) {
                    setErrors(prev => ({ ...prev, email: undefined }));
                  }
                }}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={handleEmailSubmit}
                editable={!loading}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  ref={passwordInputRef}
                  style={[styles.passwordInput, errors.password && styles.inputError]}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) {
                      setErrors(prev => ({ ...prev, password: undefined }));
                    }
                  }}
                  placeholder="Create a password"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={handlePasswordSubmit}
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  ref={confirmPasswordInputRef}
                  style={[styles.passwordInput, errors.confirmPassword && styles.inputError]}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword) {
                      setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                    }
                  }}
                  placeholder="Confirm your password"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  blurOnSubmit={true}
                  onSubmitEditing={handleConfirmPasswordSubmit}
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>

            <TouchableOpacity
              onPress={handleSignUp}
              style={[styles.signUpButton, loading && styles.buttonDisabled]}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.signUpButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.termsText}>
              By creating an account, you agree to our{'\n'}
              <Text style={styles.linkText}>Terms of Service</Text> and 
              <Text style={styles.linkText}>Privacy Policy</Text>
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Already have an account? 
              <Text
                style={styles.linkText}
                onPress={() => router.push('/(auth)/sign-in')}
              >
                Sign In
              </Text>
            </Text>
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
    marginBottom: 32,
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
    lineHeight: 24,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: 'white',
  },
  passwordContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingRight: 50, // Make room for the eye icon
    fontSize: 16,
    backgroundColor: 'white',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
  },
  signUpButton: {
    backgroundColor: mobileTokens.colors.primary.main,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
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
  signUpButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  termsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#6B7280',
  },
  linkText: {
    color: mobileTokens.colors.primary.main,
    fontWeight: '600',
  },
}); 