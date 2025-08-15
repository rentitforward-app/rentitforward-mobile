"use strict";
// Breakpoint System - Rental Platform Design System v1.0
// Mobile-first responsive design breakpoints for sharing economy marketplace
Object.defineProperty(exports, "__esModule", { value: true });
exports.gridConfig = exports.containerSizes = exports.tailwindBreakpoints = exports.generateBreakpointVariables = exports.getCurrentBreakpoint = exports.isBreakpoint = exports.getMediaQuery = exports.getBreakpoint = exports.mediaQueries = exports.breakpoints = void 0;
// Breakpoint values (mobile-first approach)
exports.breakpoints = {
    mobile: 320, // Mobile devices
    tablet: 768, // Tablets
    desktop: 1024, // Desktop
    wide: 1200, // Wide screens
};
// Media queries for CSS (mobile-first)
exports.mediaQueries = {
    mobile: `(max-width: ${exports.breakpoints.tablet - 1}px)`,
    tablet: `(min-width: ${exports.breakpoints.tablet}px) and (max-width: ${exports.breakpoints.desktop - 1}px)`,
    desktop: `(min-width: ${exports.breakpoints.desktop}px) and (max-width: ${exports.breakpoints.wide - 1}px)`,
    wide: `(min-width: ${exports.breakpoints.wide}px)`,
    // Utility queries
    mobileOnly: `(max-width: ${exports.breakpoints.tablet - 1}px)`,
    tabletOnly: `(min-width: ${exports.breakpoints.tablet}px) and (max-width: ${exports.breakpoints.desktop - 1}px)`,
    desktopUp: `(min-width: ${exports.breakpoints.desktop}px)`,
    tabletUp: `(min-width: ${exports.breakpoints.tablet}px)`,
};
// Utility functions
const getBreakpoint = (name) => {
    return exports.breakpoints[name];
};
exports.getBreakpoint = getBreakpoint;
const getMediaQuery = (name) => {
    return exports.mediaQueries[name];
};
exports.getMediaQuery = getMediaQuery;
// Check if current screen size matches breakpoint (for client-side)
const isBreakpoint = (breakpointName, currentWidth) => {
    switch (breakpointName) {
        case 'mobile':
            return currentWidth < exports.breakpoints.tablet;
        case 'tablet':
            return currentWidth >= exports.breakpoints.tablet && currentWidth < exports.breakpoints.desktop;
        case 'desktop':
            return currentWidth >= exports.breakpoints.desktop && currentWidth < exports.breakpoints.wide;
        case 'wide':
            return currentWidth >= exports.breakpoints.wide;
        default:
            return false;
    }
};
exports.isBreakpoint = isBreakpoint;
// Get current breakpoint name based on width
const getCurrentBreakpoint = (width) => {
    if (width < exports.breakpoints.tablet)
        return 'mobile';
    if (width < exports.breakpoints.desktop)
        return 'tablet';
    if (width < exports.breakpoints.wide)
        return 'desktop';
    return 'wide';
};
exports.getCurrentBreakpoint = getCurrentBreakpoint;
// CSS Custom Properties for web
const generateBreakpointVariables = () => {
    const cssVars = {};
    Object.entries(exports.breakpoints).forEach(([key, value]) => {
        cssVars[`--breakpoint-${key}`] = `${value}px`;
    });
    return cssVars;
};
exports.generateBreakpointVariables = generateBreakpointVariables;
// Tailwind breakpoint configuration
exports.tailwindBreakpoints = {
    'sm': `${exports.breakpoints.mobile}px`, // 320px
    'md': `${exports.breakpoints.tablet}px`, // 768px
    'lg': `${exports.breakpoints.desktop}px`, // 1024px
    'xl': `${exports.breakpoints.wide}px`, // 1200px
    '2xl': '1536px', // Extra wide (Tailwind default)
};
// Container max-widths for different breakpoints
exports.containerSizes = {
    mobile: '100%',
    tablet: '720px',
    desktop: '960px',
    wide: '1200px', // Updated to match design spec
};
// Grid system configuration - Rental Platform Design System
exports.gridConfig = {
    columns: 12,
    gutter: 24, // 24px gutter as per spec
    margins: {
        mobile: 16,
        tablet: 24,
        desktop: 32,
    },
    // Common grid collapse patterns
    collapsePatterns: {
        categories: {
            desktop: 6, // 6 columns on desktop
            tablet: 3, // 3 columns on tablet
            mobile: 2, // 2 columns on mobile
        },
        features: {
            desktop: 3, // 3-column grid
            tablet: 2, // 2 columns on tablet
            mobile: 1, // 1 column on mobile
        },
        products: {
            desktop: 4, // 4-column grid
            tablet: 3, // 3 columns on tablet
            mobile: 2, // 2 columns on mobile
        }
    }
};
