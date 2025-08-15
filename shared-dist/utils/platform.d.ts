/**
 * Platform detection utilities for shared package
 * Allows conditional imports based on environment
 */
/**
 * Detect if we're running in React Native environment
 */
export declare function isReactNative(): boolean;
/**
 * Detect if we're running in Node.js environment (server-side)
 */
export declare function isNode(): boolean;
/**
 * Detect if we're running in browser environment
 */
export declare function isBrowser(): boolean;
/**
 * Get current platform type
 */
export type PlatformType = 'react-native' | 'node' | 'browser' | 'unknown';
export declare function getPlatform(): PlatformType;
