"use strict";
/**
 * Platform detection utilities for shared package
 * Allows conditional imports based on environment
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isReactNative = isReactNative;
exports.isNode = isNode;
exports.isBrowser = isBrowser;
exports.getPlatform = getPlatform;
/**
 * Detect if we're running in React Native environment
 */
function isReactNative() {
    try {
        // React Native has a global navigator.product
        return (typeof globalThis.navigator !== 'undefined' &&
            globalThis.navigator.product === 'ReactNative');
    }
    catch {
        return false;
    }
}
/**
 * Detect if we're running in Node.js environment (server-side)
 */
function isNode() {
    try {
        return (typeof process !== 'undefined' &&
            process.versions &&
            !!process.versions.node);
    }
    catch {
        return false;
    }
}
/**
 * Detect if we're running in browser environment
 */
function isBrowser() {
    try {
        return (typeof globalThis.window !== 'undefined' &&
            typeof globalThis.document !== 'undefined');
    }
    catch {
        return false;
    }
}
function getPlatform() {
    if (isReactNative())
        return 'react-native';
    if (isNode())
        return 'node';
    if (isBrowser())
        return 'browser';
    return 'unknown';
}
