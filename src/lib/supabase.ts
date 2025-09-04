import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Polyfill for structuredClone - not available in React Native
if (typeof globalThis.structuredClone === 'undefined') {
  globalThis.structuredClone = function(obj: any) {
    return JSON.parse(JSON.stringify(obj));
  };
}

const supabaseUrl = 'https://ulcrjgjbsromujglyxbu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsY3JqZ2pic3JvbXVqZ2x5eGJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4ODAzNTUsImV4cCI6MjA1MzQ1NjM1NX0.dGjSAmNMVN9cxF84TL-_fXISeou7y_MXiuin1VVi4Nk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // Add timeout for iOS production builds
    flowType: 'pkce',
  },
  global: {
    headers: {
      'X-Client-Info': 'rentitforward-mobile',
    },
  },
  // Add retry logic for network issues
  realtime: {
    params: {
      eventsPerSecond: 2,
    },
  },
}); 