/**
 * Mobile Environment Variable Validation
 * 
 * Validates that all required environment variables are properly configured
 * for mobile notifications and external service integrations
 */

import Constants from 'expo-constants';

interface MobileEnvValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  config: {
    supabase: {
      configured: boolean;
      url: boolean;
      anonKey: boolean;
    };
    firebase: {
      configured: boolean;
      projectId: boolean;
      apiKey: boolean;
      appId: boolean;
      messagingSenderId: boolean;
    };
    backend: {
      configured: boolean;
      baseUrl: boolean;
    };
    expo: {
      configured: boolean;
      projectId: boolean;
    };
  };
}

/**
 * Validate all required environment variables for mobile notifications and services.
 * @returns {MobileEnvValidationResult} The validation result.
 */
export function validateMobileEnvironmentConfig(): MobileEnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const config = {
    supabase: { configured: false, url: false, anonKey: false },
    firebase: { configured: false, projectId: false, apiKey: false, appId: false, messagingSenderId: false },
    backend: { configured: false, baseUrl: false },
    expo: { configured: false, projectId: false },
  };

  // Supabase (Database and Auth)
  if (process.env.EXPO_PUBLIC_SUPABASE_URL) {
    config.supabase.url = true;
  } else {
    errors.push('EXPO_PUBLIC_SUPABASE_URL is not set. Database and auth will not work.');
  }

  if (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
    config.supabase.anonKey = true;
  } else {
    errors.push('EXPO_PUBLIC_SUPABASE_ANON_KEY is not set. Database and auth will not work.');
  }

  config.supabase.configured = config.supabase.url && config.supabase.anonKey;

  // Firebase (Push Notifications)
  if (process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID) {
    config.firebase.projectId = true;
  } else {
    errors.push('EXPO_PUBLIC_FIREBASE_PROJECT_ID is not set. Push notifications will not work.');
  }

  if (process.env.EXPO_PUBLIC_FIREBASE_API_KEY) {
    config.firebase.apiKey = true;
  } else {
    errors.push('EXPO_PUBLIC_FIREBASE_API_KEY is not set. Push notifications will not work.');
  }

  if (process.env.EXPO_PUBLIC_FIREBASE_APP_ID) {
    config.firebase.appId = true;
  } else {
    errors.push('EXPO_PUBLIC_FIREBASE_APP_ID is not set. Push notifications will not work.');
  }

  if (process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) {
    config.firebase.messagingSenderId = true;
  } else {
    errors.push('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID is not set. Push notifications will not work.');
  }

  config.firebase.configured = config.firebase.projectId && config.firebase.apiKey && 
                               config.firebase.appId && config.firebase.messagingSenderId;

  // Backend API (for notifications and sync)
  if (process.env.EXPO_PUBLIC_BASE_URL) {
    config.backend.baseUrl = true;
    config.backend.configured = true;
  } else {
    errors.push('EXPO_PUBLIC_BASE_URL is not set. Backend API calls will not work.');
  }

  // Expo Project Configuration
  const expoConfig = Constants.expoConfig;
  if (expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId) {
    config.expo.projectId = true;
    config.expo.configured = true;
  } else {
    warnings.push('Expo project ID not found. EAS builds and updates may not work properly.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    config,
  };
}

/**
 * Get missing configuration items for mobile environment
 */
export function getMobileMissingConfiguration(): string[] {
  const { errors, warnings } = validateMobileEnvironmentConfig();
  return [...errors, ...warnings];
}

/**
 * Check if Firebase is properly configured for push notifications
 */
export function isFirebaseConfigured(): boolean {
  const { config } = validateMobileEnvironmentConfig();
  return config.firebase.configured;
}

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  const { config } = validateMobileEnvironmentConfig();
  return config.supabase.configured;
}

/**
 * Check if backend API is properly configured
 */
export function isBackendConfigured(): boolean {
  const { config } = validateMobileEnvironmentConfig();
  return config.backend.configured;
}

/**
 * Get environment configuration summary for debugging
 */
export function getEnvironmentSummary(): {
  platform: string;
  expoVersion: string;
  projectId: string | null;
  hasFirebase: boolean;
  hasSupabase: boolean;
  hasBackend: boolean;
  errors: string[];
  warnings: string[];
} {
  const validation = validateMobileEnvironmentConfig();
  const expoConfig = Constants.expoConfig;
  
  return {
    platform: Constants.platform?.ios ? 'ios' : Constants.platform?.android ? 'android' : 'unknown',
    expoVersion: Constants.expoVersion || 'unknown',
    projectId: expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId || null,
    hasFirebase: validation.config.firebase.configured,
    hasSupabase: validation.config.supabase.configured,
    hasBackend: validation.config.backend.configured,
    errors: validation.errors,
    warnings: validation.warnings,
  };
}

/**
 * Log environment validation results to console
 */
export function logEnvironmentValidation(): void {
  const validation = validateMobileEnvironmentConfig();
  const summary = getEnvironmentSummary();
  
  console.log('🔧 Mobile Environment Validation');
  console.log('================================');
  console.log(`Platform: ${summary.platform}`);
  console.log(`Expo Version: ${summary.expoVersion}`);
  console.log(`Project ID: ${summary.projectId || 'Not set'}`);
  console.log('');
  
  console.log('Service Configuration:');
  console.log(`✅ Supabase: ${summary.hasSupabase ? 'Configured' : '❌ Missing'}`);
  console.log(`✅ Firebase: ${summary.hasFirebase ? 'Configured' : '❌ Missing'}`);
  console.log(`✅ Backend API: ${summary.hasBackend ? 'Configured' : '❌ Missing'}`);
  console.log('');
  
  if (validation.errors.length > 0) {
    console.log('❌ Errors:');
    validation.errors.forEach(error => console.log(`  • ${error}`));
    console.log('');
  }
  
  if (validation.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    validation.warnings.forEach(warning => console.log(`  • ${warning}`));
    console.log('');
  }
  
  if (validation.isValid) {
    console.log('✅ All required environment variables are configured!');
  } else {
    console.log('❌ Some required environment variables are missing.');
  }
  
  console.log('================================');
}

/**
 * React hook for environment validation in components
 */
export function useEnvironmentValidation() {
  const validation = validateMobileEnvironmentConfig();
  const summary = getEnvironmentSummary();
  
  return {
    isValid: validation.isValid,
    errors: validation.errors,
    warnings: validation.warnings,
    config: validation.config,
    summary,
    hasFirebase: summary.hasFirebase,
    hasSupabase: summary.hasSupabase,
    hasBackend: summary.hasBackend,
  };
}

