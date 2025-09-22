// Mobile Design System - Rent It Forward
// Local design tokens for React Native compatibility

// Local color definitions (temporary until shared imports work)
const lightColors = {
  primary: {
    main: '#44D62C',
    light: '#4ade80',
    dark: '#15803d',
  },
  neutral: {
    white: '#FFFFFF',
    lightGray: '#F9FAFB',
    mediumGray: '#6B7280',
    darkGray: '#1F2937',
    black: '#000000',
  },
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  text: {
    primary: '#1F2937',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
    brand: '#44D62C',
  },
  semantic: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  accent: {
    yellow: '#F59E0B',
  },
  background: {
    main: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
  },
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
  },
} as const;

// Local typography definitions
const sharedTypography = {
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  weights: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

// Local spacing definitions
const sharedSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

// Local breakpoints
const sharedBreakpoints = {
  mobile: 640,
  tablet: 768,
  laptop: 1024,
  desktop: 1280,
} as const;

// Export colors with React Native compatibility
export const colors = {
  ...lightColors,
  // Maintain backward compatibility
  neutral: lightColors.neutral,
  primary: lightColors.primary,
  gray: lightColors.gray,
  text: lightColors.text,
  semantic: lightColors.semantic,
  success: lightColors.success,
  warning: lightColors.warning,
  error: lightColors.error,
  info: lightColors.info,
  accent: lightColors.accent,
} as const;

// Export shared typography with React Native compatible values
export const typography = {
  sizes: sharedTypography.sizes,
  weights: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  // Add missing typography properties for booking details
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 1.3,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 1.4,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 1.4,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 1.5,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 1.4,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 1.4,
  },
  titleMedium: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 1.4,
  },
  titleSmall: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 1.4,
  },
} as const;

// Export spacing with React Native compatibility (numbers not strings)
export const spacing = sharedSpacing;

// Export breakpoints
export const breakpoints = sharedBreakpoints;

// Component-specific styles
export const componentStyles = {
  button: {
    primary: {
      backgroundColor: colors.primary.main,
      borderRadius: 8,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    secondary: {
      backgroundColor: colors.gray[100],
      borderRadius: 8,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
  },
  card: {
    base: {
      backgroundColor: colors.white,
      borderRadius: 8,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.gray[200],
    },
  },
  input: {
    base: {
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.gray[300],
      borderRadius: 8,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
    },
  },
} as const;

// Mobile tokens (legacy export for backward compatibility)
export const mobileTokens = {
  colors,
  typography,
  spacing,
  componentStyles,
} as const;

// Default export
export default {
  colors,
  typography,
  spacing,
  breakpoints,
  componentStyles,
  mobileTokens,
};
