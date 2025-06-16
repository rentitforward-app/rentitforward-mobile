// Mobile-specific design tokens for Rent It Forward
// These can be later integrated with ../../../rentitforward-shared/src/design-system when properly configured

export const mobileTokens = {
  colors: {
    primary: '#44D62C',     // Vibrant Green
    secondary: '#343C3E',   // Charcoal Grey  
    white: '#FFFFFF',
    gray: '#6B7280',
    lightGray: '#E5E7EB',
    dark: '#0F172A',        // Dark background
    darkGray: '#64748B',    // Muted text
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  fonts: {
    primary: 'Poppins',
    secondary: 'Roboto',
  },
  borderRadius: {
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
    xxl: 24,
  },
};

// TODO: Integrate with shared design system when available
// import { designTokens, lightTheme } from '../../../rentitforward-shared/src/design-system';
// export { designTokens, lightTheme };
