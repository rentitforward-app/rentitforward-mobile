"use strict";
// Theme System - Main theme configuration and management
// Centralized theme system similar to FlutterFlow
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTheme = exports.createTheme = exports.getCurrentTheme = exports.getTheme = exports.darkTheme = exports.lightTheme = void 0;
const colors_1 = require("./colors");
const typography_1 = require("./typography");
const spacing_1 = require("./spacing");
const breakpoints_1 = require("./breakpoints");
const components_1 = require("./components");
// Default theme configurations
exports.lightTheme = {
    name: 'Rent It Forward Light',
    mode: 'light',
    colors: colors_1.lightColors,
    typography: typography_1.typography,
    spacing: spacing_1.spacing,
    breakpoints: breakpoints_1.breakpoints,
    components: (0, components_1.createComponentTheme)(colors_1.lightColors),
};
exports.darkTheme = {
    name: 'Rent It Forward Dark',
    mode: 'dark',
    colors: colors_1.darkColors,
    typography: typography_1.typography,
    spacing: spacing_1.spacing,
    breakpoints: breakpoints_1.breakpoints,
    components: (0, components_1.createComponentTheme)(colors_1.darkColors),
};
// Theme utilities
const getTheme = (mode = 'light') => {
    return mode === 'dark' ? exports.darkTheme : exports.lightTheme;
};
exports.getTheme = getTheme;
const getCurrentTheme = (isDark) => {
    return isDark ? exports.darkTheme : exports.lightTheme;
};
exports.getCurrentTheme = getCurrentTheme;
// Theme creation function
const createTheme = (config) => {
    const customLightColors = { ...colors_1.lightColors, ...config.customColors };
    const customDarkColors = { ...colors_1.darkColors, ...config.customColors };
    const customTypography = { ...typography_1.typography, ...config.customTypography };
    const customSpacing = { ...spacing_1.spacing, ...config.customSpacing };
    return {
        light: {
            name: 'Custom Light Theme',
            mode: 'light',
            colors: customLightColors,
            typography: customTypography,
            spacing: customSpacing,
            breakpoints: breakpoints_1.breakpoints,
            components: (0, components_1.createComponentTheme)(customLightColors),
        },
        dark: {
            name: 'Custom Dark Theme',
            mode: 'dark',
            colors: customDarkColors,
            typography: customTypography,
            spacing: customSpacing,
            breakpoints: breakpoints_1.breakpoints,
            components: (0, components_1.createComponentTheme)(customDarkColors),
        }
    };
};
exports.createTheme = createTheme;
// React Hook placeholder for theme (web only)
const useTheme = () => {
    throw new Error('useTheme hook must be implemented in the web project');
};
exports.useTheme = useTheme;
