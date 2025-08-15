"use strict";
// Design System - Rental Platform Design System v1.0
// Comprehensive design system for sharing economy marketplace
// Exports all design tokens, components, and utilities
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTheme = exports.createTheme = exports.containers = exports.gridPatterns = exports.sections = exports.patterns = exports.breakpoints = exports.spacing = exports.typography = exports.colors = void 0;
// Core Design Tokens
__exportStar(require("./colors"), exports);
__exportStar(require("./typography"), exports);
__exportStar(require("./spacing"), exports);
__exportStar(require("./breakpoints"), exports);
// Component System
__exportStar(require("./components"), exports);
// Layout System
__exportStar(require("./layout"), exports);
// Pattern System
__exportStar(require("./patterns"), exports);
// Theme Configuration
__exportStar(require("./theme"), exports);
__exportStar(require("./tokens"), exports);
// Re-export commonly used items for convenience
var colors_1 = require("./colors");
Object.defineProperty(exports, "colors", { enumerable: true, get: function () { return colors_1.lightColors; } });
var typography_1 = require("./typography");
Object.defineProperty(exports, "typography", { enumerable: true, get: function () { return typography_1.typography; } });
var spacing_1 = require("./spacing");
Object.defineProperty(exports, "spacing", { enumerable: true, get: function () { return spacing_1.spacing; } });
var breakpoints_1 = require("./breakpoints");
Object.defineProperty(exports, "breakpoints", { enumerable: true, get: function () { return breakpoints_1.breakpoints; } });
var patterns_1 = require("./patterns");
Object.defineProperty(exports, "patterns", { enumerable: true, get: function () { return patterns_1.patterns; } });
var layout_1 = require("./layout");
Object.defineProperty(exports, "sections", { enumerable: true, get: function () { return layout_1.sections; } });
Object.defineProperty(exports, "gridPatterns", { enumerable: true, get: function () { return layout_1.gridPatterns; } });
Object.defineProperty(exports, "containers", { enumerable: true, get: function () { return layout_1.containers; } });
// Main theme configuration
var theme_1 = require("./theme");
Object.defineProperty(exports, "createTheme", { enumerable: true, get: function () { return theme_1.createTheme; } });
Object.defineProperty(exports, "useTheme", { enumerable: true, get: function () { return theme_1.useTheme; } });
