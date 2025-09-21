"use strict";
/**
 * Shared utilities index
 * Export all utility functions for use across web and mobile platforms
 */
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
// Formatting utilities
__exportStar(require("./formatting"), exports);
// Pricing utilities
__exportStar(require("./pricing"), exports);
// Platform utilities
__exportStar(require("./platform"), exports);
// Stripe utilities (platform-aware)
__exportStar(require("./stripe-platform"), exports);
// Legacy Stripe utilities (server-only, disabled due to TypeScript errors)
// export * from './stripe';
// Reviews utilities
__exportStar(require("./reviews"), exports);
// Geolocation utilities
__exportStar(require("./geolocation"), exports);
// Geocoding utilities
__exportStar(require("./geocoding"), exports);
// Notification utilities
__exportStar(require("./notifications"), exports);
// Search and predictive text utilities
__exportStar(require("./search"), exports);
__exportStar(require("./search-api"), exports);
// Calendar and availability utilities
__exportStar(require("./calendar"), exports);
// Booking utilities
__exportStar(require("./booking"), exports);
