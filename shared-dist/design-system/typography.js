"use strict";
// Typography System - Rental Platform Design System v1.0
// System font stack with text color hierarchy for sharing economy marketplace
Object.defineProperty(exports, "__esModule", { value: true });
exports.tailwindTypography = exports.generateTypographyVariables = exports.generateTextStyleCSS = exports.getFontFamily = exports.getTextStyle = exports.typography = exports.fontFamilies = void 0;
// Font Families - System font stack focus
exports.fontFamilies = {
    system: {
        name: 'System',
        weights: [400, 500, 600, 700],
        fallback: [
            'system-ui',
            '-apple-system',
            'BlinkMacSystemFont',
            'Segoe UI',
            'Roboto',
            'Helvetica Neue',
            'Arial',
            'sans-serif'
        ]
    },
    // Legacy support
    sora: {
        name: 'System', // Map to system font
        weights: [400, 500, 600, 700],
        fallback: ['system-ui', '-apple-system', 'sans-serif']
    },
    manrope: {
        name: 'System', // Map to system font
        weights: [400, 500, 600, 700],
        fallback: ['system-ui', '-apple-system', 'sans-serif']
    },
    inter: {
        name: 'System', // Map to system font
        weights: [400, 500, 600, 700],
        fallback: ['system-ui', '-apple-system', 'sans-serif']
    }
};
// Typography Scale - Rental Platform Design System
exports.typography = {
    // Hero Styles - Main hero headlines
    hero: {
        fontSize: 56,
        lineHeight: 1.2,
        fontWeight: 700,
        letterSpacing: -0.02,
        fontFamily: 'System',
        color: 'text.primary', // Can be text.inverse on colored backgrounds
        responsive: {
            mobile: { fontSize: 48 },
            tablet: { fontSize: 52 },
            desktop: { fontSize: 56 }
        }
    },
    // Heading Styles - Section headers
    h1: {
        fontSize: 40,
        lineHeight: 1.3,
        fontWeight: 700,
        letterSpacing: -0.01,
        fontFamily: 'System',
        color: 'text.primary',
        responsive: {
            mobile: { fontSize: 32 },
            tablet: { fontSize: 36 },
            desktop: { fontSize: 40 }
        }
    },
    h2: {
        fontSize: 28,
        lineHeight: 1.4,
        fontWeight: 600,
        letterSpacing: 0,
        fontFamily: 'System',
        color: 'text.primary',
        responsive: {
            mobile: { fontSize: 24 },
            tablet: { fontSize: 26 },
            desktop: { fontSize: 28 }
        }
    },
    h3: {
        fontSize: 20,
        lineHeight: 1.4,
        fontWeight: 600,
        letterSpacing: 0,
        fontFamily: 'System',
        color: 'text.primary',
        responsive: {
            mobile: { fontSize: 18 },
            tablet: { fontSize: 19 },
            desktop: { fontSize: 20 }
        }
    },
    // Body Styles - Main content
    body: {
        fontSize: 16,
        lineHeight: 1.5,
        fontWeight: 400,
        letterSpacing: 0,
        fontFamily: 'System',
        color: 'text.primary',
        responsive: {
            mobile: { fontSize: 14 },
            tablet: { fontSize: 15 },
            desktop: { fontSize: 16 }
        }
    },
    bodySecondary: {
        fontSize: 16,
        lineHeight: 1.5,
        fontWeight: 400,
        letterSpacing: 0,
        fontFamily: 'System',
        color: 'text.secondary',
        responsive: {
            mobile: { fontSize: 14 },
            tablet: { fontSize: 15 },
            desktop: { fontSize: 16 }
        }
    },
    // Caption & Link Styles
    caption: {
        fontSize: 14,
        lineHeight: 1.4,
        fontWeight: 400,
        letterSpacing: 0,
        fontFamily: 'System',
        color: 'text.tertiary',
        responsive: {
            mobile: { fontSize: 12 },
            tablet: { fontSize: 13 },
            desktop: { fontSize: 14 }
        }
    },
    link: {
        fontSize: 16, // Inherits from parent
        lineHeight: 1.5,
        fontWeight: 500,
        letterSpacing: 0,
        fontFamily: 'System',
        color: 'text.brand',
        textDecoration: 'none', // underline on hover
        responsive: {
            mobile: { fontSize: 14 },
            tablet: { fontSize: 15 },
            desktop: { fontSize: 16 }
        }
    },
    // Legacy support - mapped to new system
    displayLarge: {
        fontSize: 56,
        lineHeight: 1.2,
        fontWeight: 700,
        letterSpacing: -0.02,
        fontFamily: 'System',
        color: 'text.primary',
        responsive: {
            mobile: { fontSize: 48 },
            tablet: { fontSize: 52 },
            desktop: { fontSize: 56 }
        }
    },
    displayMedium: {
        fontSize: 40,
        lineHeight: 1.3,
        fontWeight: 700,
        letterSpacing: -0.01,
        fontFamily: 'System',
        color: 'text.primary',
        responsive: {
            mobile: { fontSize: 32 },
            tablet: { fontSize: 36 },
            desktop: { fontSize: 40 }
        }
    },
    displaySmall: {
        fontSize: 28,
        lineHeight: 1.4,
        fontWeight: 600,
        letterSpacing: 0,
        fontFamily: 'System',
        color: 'text.primary',
        responsive: {
            mobile: { fontSize: 24 },
            tablet: { fontSize: 26 },
            desktop: { fontSize: 28 }
        }
    },
    headlineLarge: {
        fontSize: 40,
        lineHeight: 1.3,
        fontWeight: 700,
        letterSpacing: -0.01,
        fontFamily: 'System',
        color: 'text.primary',
        responsive: {
            mobile: { fontSize: 32 },
            tablet: { fontSize: 36 },
            desktop: { fontSize: 40 }
        }
    },
    headlineMedium: {
        fontSize: 28,
        lineHeight: 1.4,
        fontWeight: 600,
        letterSpacing: 0,
        fontFamily: 'System',
        color: 'text.primary',
        responsive: {
            mobile: { fontSize: 24 },
            tablet: { fontSize: 26 },
            desktop: { fontSize: 28 }
        }
    },
    headlineSmall: {
        fontSize: 20,
        lineHeight: 1.4,
        fontWeight: 600,
        letterSpacing: 0,
        fontFamily: 'System',
        color: 'text.primary',
        responsive: {
            mobile: { fontSize: 18 },
            tablet: { fontSize: 19 },
            desktop: { fontSize: 20 }
        }
    },
    titleLarge: {
        fontSize: 20,
        lineHeight: 1.4,
        fontWeight: 600,
        letterSpacing: 0,
        fontFamily: 'System',
        color: 'text.primary',
        responsive: {
            mobile: { fontSize: 18 },
            tablet: { fontSize: 19 },
            desktop: { fontSize: 20 }
        }
    },
    titleMedium: {
        fontSize: 18,
        lineHeight: 1.4,
        fontWeight: 600,
        letterSpacing: 0,
        fontFamily: 'System',
        color: 'text.primary',
        responsive: {
            mobile: { fontSize: 16 },
            tablet: { fontSize: 17 },
            desktop: { fontSize: 18 }
        }
    },
    titleSmall: {
        fontSize: 16,
        lineHeight: 1.4,
        fontWeight: 600,
        letterSpacing: 0,
        fontFamily: 'System',
        color: 'text.primary',
        responsive: {
            mobile: { fontSize: 14 },
            tablet: { fontSize: 15 },
            desktop: { fontSize: 16 }
        }
    },
    bodyLarge: {
        fontSize: 18,
        lineHeight: 1.6,
        fontWeight: 400,
        letterSpacing: 0,
        fontFamily: 'System',
        color: 'text.primary',
        responsive: {
            mobile: { fontSize: 16 },
            tablet: { fontSize: 17 },
            desktop: { fontSize: 18 }
        }
    },
    bodyMedium: {
        fontSize: 16,
        lineHeight: 1.5,
        fontWeight: 400,
        letterSpacing: 0,
        fontFamily: 'System',
        color: 'text.primary',
        responsive: {
            mobile: { fontSize: 14 },
            tablet: { fontSize: 15 },
            desktop: { fontSize: 16 }
        }
    },
    bodySmall: {
        fontSize: 14,
        lineHeight: 1.5,
        fontWeight: 400,
        letterSpacing: 0,
        fontFamily: 'System',
        color: 'text.secondary',
        responsive: {
            mobile: { fontSize: 12 },
            tablet: { fontSize: 13 },
            desktop: { fontSize: 14 }
        }
    },
    labelLarge: {
        fontSize: 16,
        lineHeight: 1.4,
        fontWeight: 600,
        letterSpacing: 0,
        fontFamily: 'System',
        color: 'text.primary',
        responsive: {
            mobile: { fontSize: 14 },
            tablet: { fontSize: 15 },
            desktop: { fontSize: 16 }
        }
    },
    labelMedium: {
        fontSize: 14,
        lineHeight: 1.4,
        fontWeight: 600,
        letterSpacing: 0,
        fontFamily: 'System',
        color: 'text.primary',
        responsive: {
            mobile: { fontSize: 12 },
            tablet: { fontSize: 13 },
            desktop: { fontSize: 14 }
        }
    },
    labelSmall: {
        fontSize: 12,
        lineHeight: 1.4,
        fontWeight: 600,
        letterSpacing: 0,
        fontFamily: 'System',
        color: 'text.secondary',
        responsive: {
            mobile: { fontSize: 10 },
            tablet: { fontSize: 11 },
            desktop: { fontSize: 12 }
        }
    }
};
// Utility functions
const getTextStyle = (styleName) => {
    return exports.typography[styleName];
};
exports.getTextStyle = getTextStyle;
const getFontFamily = (familyName) => {
    return exports.fontFamilies[familyName];
};
exports.getFontFamily = getFontFamily;
const generateTextStyleCSS = (style, breakpoint) => {
    const activeStyle = breakpoint && style.responsive?.[breakpoint]
        ? { ...style, ...style.responsive[breakpoint] }
        : style;
    const fontFamily = exports.fontFamilies[activeStyle.fontFamily]?.fallback.join(', ') || activeStyle.fontFamily;
    return `
    font-family: ${fontFamily};
    font-size: ${activeStyle.fontSize}px;
    line-height: ${activeStyle.lineHeight};
    font-weight: ${activeStyle.fontWeight};
    letter-spacing: ${activeStyle.letterSpacing}em;
    ${activeStyle.color ? `color: var(--color-${activeStyle.color.replace('.', '-')});` : ''}
    ${activeStyle.textDecoration ? `text-decoration: ${activeStyle.textDecoration};` : ''}
  `.trim();
};
exports.generateTextStyleCSS = generateTextStyleCSS;
// CSS Custom Properties for web
const generateTypographyVariables = () => {
    const cssVars = {};
    Object.entries(exports.typography).forEach(([key, style]) => {
        const baseKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        cssVars[`--font-size-${baseKey}`] = `${style.fontSize}px`;
        cssVars[`--line-height-${baseKey}`] = style.lineHeight.toString();
        cssVars[`--font-weight-${baseKey}`] = style.fontWeight.toString();
        cssVars[`--letter-spacing-${baseKey}`] = `${style.letterSpacing}em`;
    });
    return cssVars;
};
exports.generateTypographyVariables = generateTypographyVariables;
// Tailwind typography configuration
exports.tailwindTypography = {
    fontFamily: {
        sans: exports.fontFamilies.system.fallback,
    },
    fontSize: {
        'hero': ['56px', { lineHeight: '1.2', fontWeight: '700' }],
        'h1': ['40px', { lineHeight: '1.3', fontWeight: '700' }],
        'h2': ['28px', { lineHeight: '1.4', fontWeight: '600' }],
        'h3': ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-secondary': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['14px', { lineHeight: '1.4', fontWeight: '400' }],
        'link': ['16px', { lineHeight: '1.5', fontWeight: '500' }],
    },
    fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
    }
};
