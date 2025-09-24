import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { AuthContextType, AuthState, Profile } from '../types/auth';
import { setSentryUser, clearSentryUser, addSentryBreadcrumb, captureSentryException } from '../lib/sentry';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children, onReady }: { children: React.ReactNode; onReady?: () => void }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
  });
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isSignOutInProgress, setIsSignOutInProgress] = useState(false); // Prevent multiple simultaneous sign outs

  // Remove aggressive timeout - let Supabase handle session restoration naturally

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
        
        // If profile not found, it means the user was deleted
        // We should sign them out automatically
        if (error.code === 'PGRST116' || error.message.includes('No rows returned')) {
          console.log('Profile not found - user may have been deleted. Signing out...');
          addSentryBreadcrumb('Profile not found - auto signing out deleted user', 'auth', {
            userId,
            error: error.message,
          });
          
          // Sign out the user since their profile no longer exists
          await handleDeletedUserSignOut();
          return null;
        }
        
        return null;
      }

      return data;
    } catch (error) {
      console.error('Profile fetch error:', error);
      return null;
    }
  };

  // Handle sign out for deleted users
  const handleDeletedUserSignOut = async () => {
    // Prevent multiple simultaneous deleted user sign outs
    if (isSignOutInProgress) {
      console.log('Sign out already in progress, ignoring deleted user sign out');
      return;
    }

    try {
      console.log('Handling deleted user sign out...');
      setIsSignOutInProgress(true);
      
      // Clear Sentry user context first
      clearSentryUser();
      addSentryBreadcrumb('Deleted user sign out started', 'auth');
      
      try {
        // Clear the auth session
        await supabase.auth.signOut();
      } catch (error) {
        // Handle session errors gracefully during deleted user sign out
        if (error?.message?.includes('session') && error?.message?.includes('missing')) {
          console.log('Session already missing during deleted user sign out - proceeding');
          addSentryBreadcrumb('Session already missing during deleted user sign out', 'auth');
        } else {
          throw error;
        }
      }
      
      // Clear local state immediately
      setState({
        user: null,
        profile: null,
        loading: false,
        error: null,
      });
      
      addSentryBreadcrumb('Deleted user signed out automatically', 'auth');
      
      // Show alert to user
      Alert.alert(
        'Account Not Found',
        'Your account appears to have been deleted. You have been signed out.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to welcome screen
              router.replace('/(auth)/welcome');
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Error during deleted user sign out:', error);
      captureSentryException(error, { action: 'handleDeletedUserSignOut' });
      
      // Even if there's an error, clear state and navigate
      setState({
        user: null,
        profile: null,
        loading: false,
        error: null,
      });
      router.replace('/(auth)/welcome');
    } finally {
      setIsSignOutInProgress(false);
    }
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Let Supabase handle session restoration without artificial timeouts
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          if (session?.user) {
            const profile = await fetchProfile(session.user.id);
            
            // If profile is null, the user might have been deleted
            // The fetchProfile function will handle the sign out automatically
            if (profile === null) {
              // Don't update state here, let handleDeletedUserSignOut handle it
              return;
            }
            
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

            // Notify that auth is ready
            onReady?.();
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

            // Notify that auth is ready (even when signed out)
            onReady?.();
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

          // Notify that auth is ready (even on error)
          onReady?.();
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state change event:', event, 'hasSession:', !!session);
        addSentryBreadcrumb(`Auth state change: ${event}`, 'auth', { hasSession: !!session });

        // Don't update state if we're in the middle of signing out manually
        if (isSigningOut && (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED')) {
          console.log('Ignoring auth state change during manual sign out:', event);
          return;
        }

        // Don't update state if sign out is in progress
        if (isSignOutInProgress) {
          console.log('Ignoring auth state change during sign out process:', event);
          return;
        }

        if (session?.user) {
          try {
            const profile = await fetchProfile(session.user.id);
            
            // If profile is null, the user might have been deleted
            // The fetchProfile function will handle the sign out automatically
            if (profile === null) {
              // Don't update state here, let handleDeletedUserSignOut handle it
              return;
            }
            
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
          } catch (error) {
            console.error('Error during auth state change (sign in):', error);
            captureSentryException(error, { 
              action: 'authStateChange_signIn', 
              event, 
              userId: session.user.id 
            });
          }
        } else {
          // Only update state if not manually signing out
          if (!isSigningOut && !isSignOutInProgress) {
            setState({
              user: null,
              profile: null,
              loading: false,
              error: null,
            });
            
            // Clear Sentry user context only if not already cleared
            clearSentryUser();
            addSentryBreadcrumb('Auth state changed - user signed out', 'auth', {
              event,
            });
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [isSigningOut, isSignOutInProgress]);

  // Splash screen is now managed by SplashScreenManager in _layout.tsx

  const signIn = async (email: string, password: string) => {
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      addSentryBreadcrumb('Starting sign in process', 'auth', { email });
      
      // Let Supabase handle the sign in without artificial timeouts
      const { error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        addSentryBreadcrumb('Sign in failed', 'auth', { 
          email, 
          error: error.message,
          code: error.status
        });
        throw error;
      }
      
      addSentryBreadcrumb('Sign in successful', 'auth', { email });
      
      // Set loading to false after successful sign in
      setState(prev => ({ ...prev, loading: false }));
    } catch (error: any) {
      setState(prev => ({ ...prev, loading: false, error: error.message }));
      captureSentryException(error, { action: 'signIn', email, platform: 'mobile' });
      
      // Show more helpful error message
      let errorMessage = error.message;
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
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
    // Prevent multiple simultaneous sign out attempts
    if (isSignOutInProgress) {
      console.log('Sign out already in progress, ignoring duplicate request');
      return;
    }

    try {
      console.log('Starting sign out process...');
      setIsSignOutInProgress(true);
      setIsSigningOut(true);
      setState(prev => ({ ...prev, loading: true }));
      
      addSentryBreadcrumb('Sign out started', 'auth');
      
      // Clear Sentry user context before sign out
      clearSentryUser();
      
      // Call Supabase sign out
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        // Handle specific auth session errors gracefully
        if (error.message?.includes('session') && error.message?.includes('missing')) {
          console.log('Session already missing during sign out - proceeding with cleanup');
          addSentryBreadcrumb('Session already missing during sign out - proceeding', 'auth');
        } else {
          throw error;
        }
      }
      
      // Clear the state immediately after successful sign out
      setState({
        user: null,
        profile: null,
        loading: false,
        error: null,
      });
      
      addSentryBreadcrumb('Sign out completed successfully', 'auth');
      
      // Navigate directly to welcome screen
      console.log('Sign out successful - redirecting to welcome screen');
      router.replace('/(auth)/welcome');
      
    } catch (error: any) {
      console.error('Sign out error:', error);
      setState(prev => ({ ...prev, loading: false, error: error.message }));
      captureSentryException(error, { action: 'signOut', platform: 'mobile' });
      
      // Show user-friendly error message
      Alert.alert(
        'Sign Out Error', 
        'There was a problem signing you out. Please try again.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Even if there's an error, clear local state and navigate
              setState({
                user: null,
                profile: null,
                loading: false,
                error: null,
              });
              router.replace('/(auth)/welcome');
            }
          }
        ]
      );
    } finally {
      // Always reset the flags
      setIsSigningOut(false);
      setIsSignOutInProgress(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      // Use the same redirect URL construction as the web app
      // Determine the correct base URL for the redirect (same logic as web)
      let baseUrl = process.env.EXPO_PUBLIC_APP_URL || process.env.EXPO_PUBLIC_BASE_URL;
      
      // Fallback to hardcoded URL if no environment variable is set
      if (!baseUrl) {
        baseUrl = 'https://rentitforward.com.au';
      }
      
      // Use the correct callback format for password reset
      const redirectUrl = `${baseUrl}/auth/callback?type=recovery`;
      
      console.log('Mobile password reset configuration:', {
        email: email.toLowerCase().trim(),
        redirectUrl,
        baseUrl
      });
      
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.toLowerCase().trim(),
        {
          redirectTo: redirectUrl,
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
      
      // If profile is null, the user might have been deleted
      // The fetchProfile function will handle the sign out automatically
      if (profile === null) {
        return;
      }
      
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