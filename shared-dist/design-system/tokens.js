"use strict";
// Design Tokens - Platform-agnostic design values
// Easy consumption for web and mobile platforms
Object.defineProperty(exports, "__esModule", { value: true });
exports.breakpoints = exports.shadows = exports.borderRadius = exports.spacing = exports.typography = exports.darkColors = exports.lightColors = exports.mobileTokens = exports.webTokens = exports.generateTokenVariables = exports.getToken = exports.designTokens = void 0;
const colors_1 = require("./colors");
const typography_1 = require("./typography");
const spacing_1 = require("./spacing");
const breakpoints_1 = require("./breakpoints");
// Complete design tokens
exports.designTokens = {
    colors: {
        light: colors_1.lightColors,
        dark: colors_1.darkColors,
    },
    typography: typography_1.typography,
    spacing: spacing_1.spacing,
    borderRadius: spacing_1.borderRadius,
    shadows: spacing_1.shadows,
    breakpoints: breakpoints_1.breakpoints,
    animation: {
        duration: {
            fast: 150,
            normal: 300,
            slow: 500,
        },
        easing: {
            easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
            easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
            easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        }
    },
    zIndex: {
        dropdown: 1000,
        modal: 1050,
        tooltip: 1070,
        overlay: 1040,
        max: 9999,
    }
};
// Token utilities
const getToken = (path, mode = 'light') => {
    const keys = path.split('.');
    let value = exports.designTokens;
    for (const key of keys) {
        if (key === 'colors' && keys.length > 1) {
            value = value[key][mode];
            continue;
        }
        value = value[key];
        if (value === undefined)
            break;
    }
    return value;
};
exports.getToken = getToken;
// CSS Custom Properties generation
const generateTokenVariables = (mode = 'light') => {
    const cssVars = {};
    // Colors
    const colors = mode === 'dark' ? colors_1.darkColors : colors_1.lightColors;
    Object.entries(colors).forEach(([key, value]) => {
        cssVars[`--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`] = value;
    });
    // Typography
    Object.entries(typography_1.typography).forEach(([key, style]) => {
        const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        cssVars[`--text-${kebabKey}-size`] = `${style.fontSize}px`;
        cssVars[`--text-${kebabKey}-height`] = `${style.lineHeight}`;
        cssVars[`--text-${kebabKey}-weight`] = `${style.fontWeight}`;
        cssVars[`--text-${kebabKey}-spacing`] = `${style.letterSpacing}em`;
        cssVars[`--text-${kebabKey}-family`] = style.fontFamily;
    });
    // Spacing
    Object.entries(spacing_1.spacing).forEach(([key, value]) => {
        if (typeof value === 'number') {
            cssVars[`--spacing-${key}`] = `${value}px`;
        }
        else if (typeof value === 'string') {
            cssVars[`--spacing-${key}`] = value;
        }
    });
    // Border radius
    Object.entries(spacing_1.borderRadius).forEach(([key, value]) => {
        cssVars[`--radius-${key}`] = value;
    });
    // Shadows
    Object.entries(spacing_1.shadows).forEach(([key, value]) => {
        cssVars[`--shadow-${key}`] = value;
    });
    // Animation
    Object.entries(exports.designTokens.animation.duration).forEach(([key, value]) => {
        cssVars[`--duration-${key}`] = `${value}ms`;
    });
    Object.entries(exports.designTokens.animation.easing).forEach(([key, value]) => {
        cssVars[`--easing-${key}`] = value;
    });
    // Z-index
    Object.entries(exports.designTokens.zIndex).forEach(([key, value]) => {
        cssVars[`--z-${key}`] = `${value}`;
    });
    return cssVars;
};
exports.generateTokenVariables = generateTokenVariables;
// Platform-specific token exports
exports.webTokens = {
    css: (0, exports.generateTokenVariables)('light'),
    cssDark: (0, exports.generateTokenVariables)('dark'),
    tailwind: {
        colors: {
            primary: colors_1.lightColors.primary,
            secondary: colors_1.lightColors.secondary,
            success: colors_1.lightColors.success,
            warning: colors_1.lightColors.warning,
            error: colors_1.lightColors.error,
            info: colors_1.lightColors.info,
        },
        fontFamily: {
            sora: ['Sora', 'system-ui', 'sans-serif'],
            manrope: ['Manrope', 'system-ui', 'sans-serif'],
        },
        spacing: {
            xs: `${spacing_1.spacing.xs}px`,
            sm: `${spacing_1.spacing.sm}px`,
            md: `${spacing_1.spacing.md}px`,
            lg: `${spacing_1.spacing.lg}px`,
            xl: `${spacing_1.spacing.xl}px`,
        },
    }
};
// React Native / Mobile tokens
exports.mobileTokens = {
    colors: colors_1.lightColors,
    colorsDark: colors_1.darkColors,
    typography: Object.fromEntries(Object.entries(typography_1.typography).map(([key, style]) => [
        key,
        {
            fontSize: style.fontSize,
            lineHeight: style.fontSize * style.lineHeight,
            fontWeight: style.fontWeight.toString(),
            letterSpacing: style.letterSpacing,
            fontFamily: style.fontFamily,
        }
    ])),
    spacing: Object.fromEntries(Object.entries(spacing_1.spacing).map(([key, value]) => [
        key,
        typeof value === 'number' ? value : 0
    ])),
    borderRadius: Object.fromEntries(Object.entries(spacing_1.borderRadius).map(([key, value]) => [
        key,
        parseInt(value.replace('px', ''))
    ])),
};
// Export individual token categories for easier imports
var colors_2 = require("./colors");
Object.defineProperty(exports, "lightColors", { enumerable: true, get: function () { return colors_2.lightColors; } });
Object.defineProperty(exports, "darkColors", { enumerable: true, get: function () { return colors_2.darkColors; } });
var typography_2 = require("./typography");
Object.defineProperty(exports, "typography", { enumerable: true, get: function () { return typography_2.typography; } });
var spacing_2 = require("./spacing");
Object.defineProperty(exports, "spacing", { enumerable: true, get: function () { return spacing_2.spacing; } });
Object.defineProperty(exports, "borderRadius", { enumerable: true, get: function () { return spacing_2.borderRadius; } });
Object.defineProperty(exports, "shadows", { enumerable: true, get: function () { return spacing_2.shadows; } });
var breakpoints_2 = require("./breakpoints");
Object.defineProperty(exports, "breakpoints", { enumerable: true, get: function () { return breakpoints_2.breakpoints; } });
