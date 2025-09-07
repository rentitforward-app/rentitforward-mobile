import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
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
          setTimeout(() => reject(new Error('Session timeout')), 8000) // Reduced to 8s to be more conservative
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

  const signIn = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      addSentryBreadcrumb('Starting sign in process', 'auth', { email });
      
      // Add timeout to prevent hanging on network issues
      const signInPromise = supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Sign in timeout - please check your connection')), 10000)
      );
      
      const { error } = await Promise.race([signInPromise, timeoutPromise]) as any;

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
      Alert.alert('Sign In Error', error.message);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const { error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        throw error;
      }

      Alert.alert(
        'Check your email',
        'Please check your email and click the confirmation link to complete your registration.'
      );
    } catch (error: any) {
      setState(prev => ({ ...prev, loading: false, error: error.message }));
      captureSentryException(error, { action: 'signUp', email, fullName });
      Alert.alert('Sign Up Error', error.message);
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