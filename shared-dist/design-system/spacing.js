"use strict";
// Spacing System - Consistent spacing values for margins, padding, and gaps
// Based on 8px grid system for consistency across platforms
Object.defineProperty(exports, "__esModule", { value: true });
exports.layoutSpacing = exports.shadows = exports.borderRadius = exports.tailwindSpacing = exports.generateSpacingVariables = exports.getSectionPadding = exports.getCardPadding = exports.getButtonPadding = exports.getSpacing = exports.spacing = void 0;
// Spacing values based on 8px grid
exports.spacing = {
    // Base spacing units
    xs: 4, // 0.25rem
    sm: 8, // 0.5rem
    md: 16, // 1rem
    lg: 24, // 1.5rem
    xl: 32, // 2rem
    '2xl': 48, // 3rem
    '3xl': 64, // 4rem
    '4xl': 80, // 5rem
    '5xl': 96, // 6rem
    '6xl': 128, // 8rem
    // Semantic spacing
    none: 0,
    auto: 'auto',
    // Component specific spacing
    buttonPadding: {
        sm: { x: 12, y: 6 }, // Small button
        md: { x: 16, y: 8 }, // Medium button
        lg: { x: 24, y: 12 } // Large button
    },
    cardPadding: {
        sm: 16, // Small card padding
        md: 24, // Medium card padding
        lg: 32 // Large card padding
    },
    sectionPadding: {
        sm: 32, // Small section padding
        md: 48, // Medium section padding
        lg: 64 // Large section padding
    }
};
// Utility functions
const getSpacing = (size) => {
    return exports.spacing[size];
};
exports.getSpacing = getSpacing;
const getButtonPadding = (size) => {
    return exports.spacing.buttonPadding[size];
};
exports.getButtonPadding = getButtonPadding;
const getCardPadding = (size) => {
    return exports.spacing.cardPadding[size];
};
exports.getCardPadding = getCardPadding;
const getSectionPadding = (size) => {
    return exports.spacing.sectionPadding[size];
};
exports.getSectionPadding = getSectionPadding;
// CSS Custom Properties for web
const generateSpacingVariables = () => {
    const cssVars = {};
    // Base spacing
    Object.entries(exports.spacing).forEach(([key, value]) => {
        if (typeof value === 'number') {
            cssVars[`--spacing-${key}`] = `${value}px`;
        }
        else if (typeof value === 'string') {
            cssVars[`--spacing-${key}`] = value;
        }
    });
    // Button padding
    Object.entries(exports.spacing.buttonPadding).forEach(([size, padding]) => {
        cssVars[`--button-padding-x-${size}`] = `${padding.x}px`;
        cssVars[`--button-padding-y-${size}`] = `${padding.y}px`;
    });
    // Card padding
    Object.entries(exports.spacing.cardPadding).forEach(([size, padding]) => {
        cssVars[`--card-padding-${size}`] = `${padding}px`;
    });
    // Section padding
    Object.entries(exports.spacing.sectionPadding).forEach(([size, padding]) => {
        cssVars[`--section-padding-${size}`] = `${padding}px`;
    });
    return cssVars;
};
exports.generateSpacingVariables = generateSpacingVariables;
// Tailwind spacing configuration
exports.tailwindSpacing = {
    'xs': '4px',
    'sm': '8px',
    'md': '16px',
    'lg': '24px',
    'xl': '32px',
    '2xl': '48px',
    '3xl': '64px',
    '4xl': '80px',
    '5xl': '96px',
    '6xl': '128px',
    // Additional Tailwind spacing
    '0': '0px',
    '0.5': '2px',
    '1': '4px',
    '1.5': '6px',
    '2': '8px',
    '2.5': '10px',
    '3': '12px',
    '3.5': '14px',
    '4': '16px',
    '5': '20px',
    '6': '24px',
    '7': '28px',
    '8': '32px',
    '9': '36px',
    '10': '40px',
    '11': '44px',
    '12': '48px',
    '14': '56px',
    '16': '64px',
    '20': '80px',
    '24': '96px',
    '28': '112px',
    '32': '128px',
    '36': '144px',
    '40': '160px',
    '44': '176px',
    '48': '192px',
    '52': '208px',
    '56': '224px',
    '60': '240px',
    '64': '256px',
    '72': '288px',
    '80': '320px',
    '96': '384px',
};
// Border radius values
exports.borderRadius = {
    none: '0px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '20px',
    '3xl': '24px',
    full: '9999px',
};
// Shadow values
exports.shadows = {
    none: 'none',
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
};
// Container and layout spacing
exports.layoutSpacing = {
    containerMaxWidth: '1200px', // As per design spec
    sectionPadding: {
        top: 64, // 64px top padding
        bottom: 64, // 64px bottom padding
        sides: 0, // No side padding (handled by container)
    },
    // Hero section specific padding
    heroPadding: {
        top: 96, // 96px as per design spec
        bottom: 96,
        sides: 0,
    }
};
