import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData?: any) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: any) => Promise<void>;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    try {
      set({ isLoading: true });
      
      // Get initial session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        return;
      }

      set({ 
        session, 
        user: session?.user ?? null,
        isInitialized: true,
        isLoading: false 
      });

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        set({ 
          session, 
          user: session?.user ?? null,
          isLoading: false 
        });

        // Store auth state for persistence
        if (session) {
          await AsyncStorage.setItem('auth_session', JSON.stringify(session));
        } else {
          await AsyncStorage.removeItem('auth_session');
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ isLoading: false, isInitialized: true });
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Session will be set automatically via onAuthStateChange
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signUp: async (email: string, password: string, userData = {}) => {
    try {
      set({ isLoading: true });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) {
        throw error;
      }

      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true });
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      // Clear local storage
      await AsyncStorage.removeItem('auth_session');
      
      set({ 
        user: null, 
        session: null, 
        isLoading: false 
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  resetPassword: async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  },

  updateProfile: async (updates: any) => {
    try {
      const { user } = get();
      if (!user) throw new Error('No user logged in');

      const { error } = await supabase.auth.updateUser(updates);
      
      if (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  },

  setSession: (session: Session | null) => {
    set({ 
      session, 
      user: session?.user ?? null 
    });
  },
})); 