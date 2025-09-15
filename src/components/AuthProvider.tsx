import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { AuthContextType, AuthState, Profile } from '../types/auth';
import { setSentryUser, clearSentryUser, addSentryBreadcrumb, captureSentryException } from '../lib/sentry';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
  });
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Add a safety timeout to prevent infinite loading
  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      if (state.loading) {
        console.warn('Auth loading timeout - forcing loading to false');
        addSentryBreadcrumb('Auth loading timeout triggered', 'auth', {
          user: !!state.user,
          profile: !!state.profile
        });
        setState(prev => ({ ...prev, loading: false }));
      }
    }, 12000); // 12 second safety timeout

    return () => clearTimeout(safetyTimeout);
  }, [state.loading, state.user, state.profile]);

  // Fetch user profile from database
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Profile fetch error:', error);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Use default session timeout to avoid interfering with Supabase's retry logic
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout - please check your connection')), 12000) // Increased to 12s
        );
        
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        
        if (mounted) {
          if (session?.user) {
            const profile = await fetchProfile(session.user.id);
            setState({
              user: session.user,
              profile,
              loading: false,
              error: null,
            });
            
            // Set Sentry user context
            setSentryUser({
              id: session.user.id,
              email: session.user.email,
              name: profile?.full_name || session.user.user_metadata?.full_name,
            });
            
            addSentryBreadcrumb('User authenticated', 'auth', {
              userId: session.user.id,
              email: session.user.email,
            });
          } else {
            setState({
              user: null,
              profile: null,
              loading: false,
              error: null,
            });
            
            // Clear Sentry user context
            clearSentryUser();
            addSentryBreadcrumb('User signed out', 'auth');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setState({
            user: null,
            profile: null,
            loading: false,
            error: null, // Don't show error to user, just proceed as unauthenticated
          });
          
          // Add Sentry breadcrumb for debugging
          addSentryBreadcrumb('Auth initialization failed', 'auth', {
            error: error instanceof Error ? error.message : 'Unknown error',
            platform: 'mobile'
          });
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        // Don't update state if we're in the middle of signing out
        if (isSigningOut && event === 'SIGNED_OUT') {
          return;
        }

        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setState({
            user: session.user,
            profile,
            loading: false,
            error: null,
          });
          
          // Set Sentry user context
          setSentryUser({
            id: session.user.id,
            email: session.user.email,
            name: profile?.full_name || session.user.user_metadata?.full_name,
          });
          
          addSentryBreadcrumb('Auth state changed - user signed in', 'auth', {
            event,
            userId: session.user.id,
            email: session.user.email,
          });
        } else {
          setState({
            user: null,
            profile: null,
            loading: false,
            error: null,
          });
          
          // Clear Sentry user context
          clearSentryUser();
          addSentryBreadcrumb('Auth state changed - user signed out', 'auth', {
            event,
          });
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [isSigningOut]);

  // Splash screen is now managed by SplashScreenManager in _layout.tsx

  const signIn = async (email: string, password: string, retryCount = 0) => {
    const maxRetries = 2;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      addSentryBreadcrumb('Starting sign in process', 'auth', { email, retryCount });
      
      // Add timeout to prevent hanging on network issues
      const signInPromise = supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Sign in timeout - please check your connection and try again')), 15000) // Increased to 15s
      );
      
      const { error } = await Promise.race([signInPromise, timeoutPromise]) as any;

      if (error) {
        addSentryBreadcrumb('Sign in failed', 'auth', { 
          email, 
          error: error.message,
          code: error.status,
          retryCount
        });
        throw error;
      }
      
      addSentryBreadcrumb('Sign in successful', 'auth', { email });
      
      // Set loading to false after successful sign in
      setState(prev => ({ ...prev, loading: false }));
    } catch (error: any) {
      // Retry logic for network timeouts
      if (error.message.includes('timeout') && retryCount < maxRetries) {
        addSentryBreadcrumb('Retrying sign in due to timeout', 'auth', { 
          email, 
          retryCount: retryCount + 1 
        });
        
        // Wait 2 seconds before retry
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        return signIn(email, password, retryCount + 1);
      }
      
      setState(prev => ({ ...prev, loading: false, error: error.message }));
      captureSentryException(error, { action: 'signIn', email, platform: 'mobile', retryCount });
      
      // Show more helpful error message
      let errorMessage = error.message;
      if (error.message.includes('timeout')) {
        errorMessage = 'Connection timeout. Please check your internet connection and try again.';
      } else if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      }
      
      Alert.alert('Sign In Error', errorMessage);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      addSentryBreadcrumb('Starting sign up process', 'auth', { email, fullName });
      
      // Create user account with email confirmation (OTP code verification)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          // Force OTP code verification by not providing emailRedirectTo
          // This should trigger OTP email instead of magic link
          data: {
            full_name: fullName.trim(),
          }
        }
      });

      console.log('Signup response:', { authData, authError });

      if (authError) {
        console.error('Signup error details:', authError);
        addSentryBreadcrumb('Sign up failed', 'auth', { 
          email, 
          error: authError.message,
          code: authError.status 
        });
        throw authError;
      }

      if (authData.user) {
        // Store email temporarily for verification page
        try {
          await AsyncStorage.setItem('signup_email', email.toLowerCase().trim());
        } catch (storageError) {
          console.error('Error storing signup email:', storageError);
        }
        
        if (authData.user.email_confirmed_at) {
          // Email already confirmed (shouldn't happen in signup)
          addSentryBreadcrumb('Sign up successful - email already confirmed', 'auth', { email });
          Alert.alert('Success', 'Account created successfully!');
          // Navigate to onboarding
          router.replace('/(auth)/onboarding');
        } else {
          // Email verification required
          addSentryBreadcrumb('Sign up successful - email verification required', 'auth', { email });
          Alert.alert(
            'Check your email',
            'Please check your email for a verification code!',
            [
              {
                text: 'Continue',
                onPress: () => {
                  // Navigate to verification screen
                  router.replace('/(auth)/verify-email');
                }
              }
            ]
          );
        }
      }
      
      setState(prev => ({ ...prev, loading: false }));
    } catch (error: any) {
      setState(prev => ({ ...prev, loading: false, error: error.message }));
      captureSentryException(error, { action: 'signUp', email, fullName });
      
      // Show more helpful error message
      let errorMessage = error.message;
      if (error.message.includes('User already registered')) {
        errorMessage = 'An account with this email already exists. Please sign in instead.';
      } else if (error.message.includes('Password should be at least 6 characters')) {
        errorMessage = 'Password must be at least 6 characters long.';
      } else if (error.message.includes('Invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      }
      
      Alert.alert('Sign Up Error', errorMessage);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setIsSigningOut(true);
      setState(prev => ({ ...prev, loading: true }));
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear the state immediately
      setState({
        user: null,
        profile: null,
        loading: false,
        error: null,
      });
      
      // Small delay to ensure state is cleared before navigation
      setTimeout(() => {
        // Navigate directly to welcome screen to avoid routing loops
        console.log('Signing out - redirecting to welcome screen');
        router.replace('/(auth)/welcome');
        setIsSigningOut(false);
      }, 100);
    } catch (error: any) {
      setState(prev => ({ ...prev, loading: false, error: error.message }));
      captureSentryException(error, { action: 'signOut' });
      setIsSigningOut(false);
      Alert.alert('Sign Out Error', error.message);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.toLowerCase().trim(),
        {
          redirectTo: 'rentitforward://reset-password',
        }
      );

      if (error) {
        throw error;
      }

      Alert.alert(
        'Password Reset',
        'Check your email for password reset instructions.'
      );
    } catch (error: any) {
      captureSentryException(error, { action: 'resetPassword', email });
      Alert.alert('Reset Password Error', error.message);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!state.user) throw new Error('No user logged in');

      setState(prev => ({ ...prev, loading: true }));

      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', state.user.id);

      if (error) throw error;

      // Refresh profile data
      await refreshProfile();
    } catch (error: any) {
      setState(prev => ({ ...prev, loading: false, error: error.message }));
      captureSentryException(error, { action: 'updateProfile', updates });
      Alert.alert('Update Profile Error', error.message);
      throw error;
    }
  };

  const refreshProfile = async () => {
    try {
      if (!state.user) return;

      const profile = await fetchProfile(state.user.id);
      setState(prev => ({
        ...prev,
        profile,
        loading: false,
        error: null,
      }));
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
    }
  };

  const value: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 