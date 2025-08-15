"use strict";
// Patterns System - Rental Platform Design System v1.0
// Reusable design patterns for sharing economy marketplace
Object.defineProperty(exports, "__esModule", { value: true });
exports.easingFunctions = exports.animationDurations = exports.touchTargets = exports.generatePatternCSS = exports.patterns = void 0;
// Design Patterns Configuration
exports.patterns = {
    // Search Input Pattern
    searchInput: {
        style: 'rounded-pill',
        background: '#FFFFFF',
        placeholder: 'Light gray text (#9CA3AF)',
        button: {
            background: '#44D62C', // Primary green
            style: 'pill-attached-right',
        },
        width: {
            mobile: '100%',
            desktop: 'constrained',
        },
        borderRadius: '9999px', // Full pill shape
        padding: '12px 24px',
    },
    // Rating Pattern
    ratings: {
        display: 'star-icons-plus-number',
        starColor: '#FFC107', // Accent yellow
        textColor: '#9CA3AF', // Tertiary text
        fontSize: '14px',
        iconSize: '16px',
    },
    // Pricing Pattern
    pricing: {
        format: 'currency-symbol-plus-amount',
        color: '#343C3E', // Primary text
        fontWeight: '600',
        fontSize: '16px',
        position: 'prominent',
    },
    // Steps Pattern
    steps: {
        layout: 'horizontal-flow',
        numbering: {
            style: 'circular-badges',
            background: '#44D62C', // Primary green
            color: '#FFFFFF',
            size: '32px',
        },
        connection: {
            style: 'dotted-lines',
            color: '#E0E0E0', // Medium gray
        },
        iconStyle: 'simple-line-icons',
    },
    // Animation Patterns
    animations: {
        hover: {
            scale: '1.02-1.05',
            shadow: 'increase',
            duration: '0.2s',
        },
        transitions: {
            duration: '0.2-0.3s',
            timing: 'ease-out',
        },
        loading: {
            type: 'skeleton-screens',
            color: '#E0E0E0',
        },
        microInteractions: {
            buttons: 'state-changes',
            forms: 'validation-feedback',
        },
    },
};
// CSS Utilities for Patterns
exports.generatePatternCSS = {
    searchInput: () => ({
        borderRadius: exports.patterns.searchInput.borderRadius,
        backgroundColor: exports.patterns.searchInput.background,
        padding: exports.patterns.searchInput.padding,
        width: '100%',
        border: '1px solid #E0E0E0',
        '&:focus': {
            outline: 'none',
            borderColor: '#44D62C',
            boxShadow: '0 0 0 3px rgba(68, 214, 44, 0.1)',
        },
        '&::placeholder': {
            color: '#9CA3AF',
        },
    }),
    ratingStars: () => ({
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: exports.patterns.ratings.fontSize,
        color: exports.patterns.ratings.textColor,
        '.star': {
            color: exports.patterns.ratings.starColor,
            fontSize: exports.patterns.ratings.iconSize,
        },
    }),
    pricing: () => ({
        color: exports.patterns.pricing.color,
        fontWeight: exports.patterns.pricing.fontWeight,
        fontSize: exports.patterns.pricing.fontSize,
        '.currency': {
            fontWeight: 'normal',
            marginRight: '2px',
        },
    }),
    stepIndicator: () => ({
        display: 'flex',
        alignItems: 'center',
        '.step-number': {
            width: exports.patterns.steps.numbering.size,
            height: exports.patterns.steps.numbering.size,
            borderRadius: '50%',
            backgroundColor: exports.patterns.steps.numbering.background,
            color: exports.patterns.steps.numbering.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600',
            fontSize: '14px',
        },
        '.step-connector': {
            width: '48px',
            height: '2px',
            backgroundColor: exports.patterns.steps.connection.color,
            borderStyle: 'dotted',
            borderWidth: '2px 0 0 0',
            borderColor: exports.patterns.steps.connection.color,
        },
    }),
    hoverEffect: () => ({
        transition: `all ${exports.patterns.animations.transitions.duration} ${exports.patterns.animations.transitions.timing}`,
        '&:hover': {
            transform: 'scale(1.02)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        },
    }),
};
// Touch target sizes for mobile accessibility
exports.touchTargets = {
    minimum: '44px',
    recommended: '48px',
    small: '32px',
    large: '56px',
};
// Animation durations
exports.animationDurations = {
    fast: '0.15s',
    normal: '0.2s',
    slow: '0.3s',
    loading: '1.5s',
};
// Easing functions
exports.easingFunctions = {
    easeOut: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    easeIn: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
    easeInOut: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};
