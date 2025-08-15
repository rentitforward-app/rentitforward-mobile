"use strict";
// Color System - Rental Platform Design System v1.0
// Brand colors, neutral palette, and text hierarchy for sharing economy marketplace
Object.defineProperty(exports, "__esModule", { value: true });
exports.colors = exports.tailwindColors = exports.generateCSSVariables = exports.getColorValue = exports.darkColors = exports.lightColors = void 0;
// Rental Platform Design System Colors
exports.lightColors = {
    // Primary Brand Colors
    primary: {
        main: '#44D62C', // Vibrant lime green from logo arrow
    },
    // Secondary Brand Colors
    secondary: {
        light: '#E8F8EC', // Light green for backgrounds
        medium: '#B8E6C1', // Medium green for subtle accents
    },
    // Neutral Colors
    neutral: {
        white: '#FFFFFF',
        lightGray: '#F5F5F5',
        mediumGray: '#E0E0E0',
        darkGray: '#6B7280',
        charcoal: '#343C3E',
        logoGray: '#343C3E', // Exact dark gray from logo text
    },
    // Text Color Hierarchy
    text: {
        primary: '#343C3E', // Main text (charcoal/logoGray)
        secondary: '#6B7280', // Supporting text (darkGray)
        tertiary: '#9CA3AF', // Light text (metadata, labels)
        inverse: '#FFFFFF', // Text on dark backgrounds
        brand: '#44D62C', // Links and brand text
    },
    // Accent Colors
    accent: {
        yellow: '#FFC107', // Used for ratings and special highlights
    },
    // Semantic Colors
    success: '#44D62C', // Use brand green for success
    warning: '#FFC107', // Use accent yellow for warnings
    error: '#EF4444', // Red for errors
    info: '#3B82F6', // Blue for info
    // Legacy support (mapped to new system)
    white: '#FFFFFF',
    black: '#343C3E', // Map to charcoal instead of pure black
    gray50: '#F5F5F5', // lightGray
    gray100: '#E8F8EC', // secondary.light
    gray200: '#E0E0E0', // mediumGray
    gray300: '#B8E6C1', // secondary.medium
    gray400: '#9CA3AF', // text.tertiary
    gray500: '#6B7280', // text.secondary
    gray600: '#4B5563', // Darker variant
    gray700: '#374151', // Darker variant
    gray800: '#1F2937', // Very dark
    gray900: '#343C3E', // text.primary
};
// Dark Mode Theme Colors (adapted for new palette)
exports.darkColors = {
    // Primary Brand Colors
    primary: {
        main: '#44D62C', // Keep brand green consistent
    },
    // Secondary Brand Colors
    secondary: {
        light: '#1A2E1F', // Dark green for backgrounds
        medium: '#2A4A2F', // Medium dark green
    },
    // Neutral Colors
    neutral: {
        white: '#FFFFFF',
        lightGray: '#1F2937',
        mediumGray: '#374151',
        darkGray: '#9CA3AF',
        charcoal: '#F9FAFB',
        logoGray: '#F9FAFB',
    },
    // Text Color Hierarchy (inverted for dark mode)
    text: {
        primary: '#F9FAFB', // Light text on dark backgrounds
        secondary: '#9CA3AF', // Medium gray text
        tertiary: '#6B7280', // Darker gray text
        inverse: '#343C3E', // Dark text on light backgrounds
        brand: '#44D62C', // Brand green stays consistent
    },
    // Accent Colors
    accent: {
        yellow: '#FFC107',
    },
    // Semantic Colors
    success: '#44D62C',
    warning: '#FFC107',
    error: '#F87171',
    info: '#60A5FA',
    // Legacy support (adapted for dark mode)
    white: '#FFFFFF',
    black: '#000000',
    gray50: '#1F2937',
    gray100: '#374151',
    gray200: '#4B5563',
    gray300: '#6B7280',
    gray400: '#9CA3AF',
    gray500: '#D1D5DB',
    gray600: '#E5E7EB',
    gray700: '#F3F4F6',
    gray800: '#F9FAFB',
    gray900: '#FFFFFF',
};
// Color utilities
const getColorValue = (colorPath, isDark = false) => {
    const palette = isDark ? exports.darkColors : exports.lightColors;
    const keys = colorPath.split('.');
    let value = palette;
    for (const key of keys) {
        value = value[key];
        if (value === undefined) {
            console.warn(`Color path "${colorPath}" not found`);
            return palette.text.primary;
        }
    }
    return typeof value === 'string' ? value : palette.text.primary;
};
exports.getColorValue = getColorValue;
// CSS Custom Properties for web
const generateCSSVariables = (colors) => {
    const cssVars = {};
    // Flatten nested color objects
    const flattenColors = (obj, prefix = '') => {
        Object.entries(obj).forEach(([key, value]) => {
            const cssKey = prefix ? `${prefix}-${key}` : key;
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                flattenColors(value, cssKey);
            }
            else if (typeof value === 'string') {
                cssVars[`--color-${cssKey.replace(/([A-Z])/g, '-$1').toLowerCase()}`] = value;
            }
        });
    };
    flattenColors(colors);
    return cssVars;
};
exports.generateCSSVariables = generateCSSVariables;
// Tailwind color configuration
exports.tailwindColors = {
    primary: {
        50: '#F0FDF4',
        100: '#DCFCE7',
        200: '#BBF7D0',
        300: '#86EFAC',
        400: '#4ADE80',
        500: '#44D62C', // Main brand color
        600: '#37B02A',
        700: '#2A8A21',
        800: '#1D641A',
        900: '#15501A',
    },
    secondary: {
        50: '#F9FAFB',
        100: '#E8F8EC',
        200: '#D1F2DB',
        300: '#B8E6C1',
        400: '#9DDAAB',
        500: '#7FCD91',
        600: '#60B877',
        700: '#4A9B60',
        800: '#3A7D4B',
        900: '#2F5F3B',
    },
    neutral: {
        50: '#F9FAFB',
        100: '#F5F5F5',
        200: '#E0E0E0',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#343C3E',
    },
    text: {
        primary: '#343C3E',
        secondary: '#6B7280',
        tertiary: '#9CA3AF',
        inverse: '#FFFFFF',
        brand: '#44D62C',
    }
};
// Export colors object for use in Tailwind config
exports.colors = {
    primary: exports.tailwindColors.primary,
    secondary: exports.tailwindColors.secondary,
    neutral: exports.tailwindColors.neutral,
    text: exports.tailwindColors.text,
    accent: {
        yellow: '#FFC107',
    }
};
