/**
 * Shared search utilities for predictive text and suggestions
 * Used across web and mobile platforms
 */
import type { SearchSuggestion, SearchSuggestionRequest, PredictiveTextConfig, SearchCorrection, PopularSearch, RecentSearch } from '../types/search';
import { SearchSuggestionType } from '../types/search';
export declare const DEFAULT_PREDICTIVE_CONFIG: PredictiveTextConfig;
export declare const SEARCH_CATEGORIES: readonly [{
    readonly id: "tools_diy_equipment";
    readonly name: "Tools & DIY Equipment";
    readonly icon: "🔧";
    readonly keywords: readonly ["drill", "saw", "hammer", "screwdriver", "tool"];
}, {
    readonly id: "cameras_photography_gear";
    readonly name: "Cameras & Photography Gear";
    readonly icon: "📷";
    readonly keywords: readonly ["camera", "lens", "tripod", "flash", "photography"];
}, {
    readonly id: "event_party_equipment";
    readonly name: "Event & Party Equipment";
    readonly icon: "🎉";
    readonly keywords: readonly ["tent", "speaker", "microphone", "projector", "party"];
}, {
    readonly id: "camping_outdoor_gear";
    readonly name: "Camping & Outdoor Gear";
    readonly icon: "🏕️";
    readonly keywords: readonly ["tent", "sleeping bag", "hiking", "camping", "outdoor"];
}, {
    readonly id: "tech_electronics";
    readonly name: "Tech & Electronics";
    readonly icon: "📱";
    readonly keywords: readonly ["laptop", "phone", "tablet", "electronics", "tech"];
}, {
    readonly id: "vehicles_transport";
    readonly name: "Vehicles & Transport";
    readonly icon: "🚗";
    readonly keywords: readonly ["car", "bike", "scooter", "vehicle", "transport"];
}, {
    readonly id: "home_garden_appliances";
    readonly name: "Home & Garden Appliances";
    readonly icon: "🏡";
    readonly keywords: readonly ["appliance", "garden", "home", "kitchen", "cleaning"];
}, {
    readonly id: "sports_fitness_equipment";
    readonly name: "Sports & Fitness Equipment";
    readonly icon: "🏃";
    readonly keywords: readonly ["fitness", "sports", "gym", "exercise", "workout"];
}, {
    readonly id: "musical_instruments_gear";
    readonly name: "Musical Instruments & Gear";
    readonly icon: "🎸";
    readonly keywords: readonly ["guitar", "piano", "drum", "music", "instrument"];
}, {
    readonly id: "costumes_props";
    readonly name: "Costumes & Props";
    readonly icon: "🎭";
    readonly keywords: readonly ["costume", "props", "theater", "halloween", "dress up"];
}, {
    readonly id: "maker_craft_supplies";
    readonly name: "Maker & Craft Supplies";
    readonly icon: "✂️";
    readonly keywords: readonly ["craft", "art", "supplies", "making", "creative"];
}];
export declare const COMMON_ITEMS: readonly [{
    readonly name: "Camera";
    readonly keywords: readonly ["dslr", "mirrorless", "photography", "canon", "nikon"];
    readonly category: "cameras_photography_gear";
}, {
    readonly name: "Drill";
    readonly keywords: readonly ["power drill", "cordless", "electric", "dewalt", "milwaukee"];
    readonly category: "tools_diy_equipment";
}, {
    readonly name: "Laptop";
    readonly keywords: readonly ["computer", "macbook", "pc", "gaming", "work"];
    readonly category: "tech_electronics";
}, {
    readonly name: "Tent";
    readonly keywords: readonly ["camping", "outdoor", "shelter", "hiking", "backpacking"];
    readonly category: "camping_outdoor_gear";
}, {
    readonly name: "Projector";
    readonly keywords: readonly ["presentation", "movie", "screen", "display", "home theater"];
    readonly category: "event_party_equipment";
}, {
    readonly name: "Guitar";
    readonly keywords: readonly ["acoustic", "electric", "bass", "music", "strings"];
    readonly category: "musical_instruments_gear";
}, {
    readonly name: "Bike";
    readonly keywords: readonly ["bicycle", "cycling", "mountain", "road", "electric"];
    readonly category: "vehicles_transport";
}, {
    readonly name: "Lawnmower";
    readonly keywords: readonly ["lawn", "grass", "mowing", "garden", "yard"];
    readonly category: "home_garden_appliances";
}, {
    readonly name: "Treadmill";
    readonly keywords: readonly ["running", "exercise", "cardio", "fitness", "gym"];
    readonly category: "sports_fitness_equipment";
}, {
    readonly name: "Sewing Machine";
    readonly keywords: readonly ["craft", "fabric", "tailoring", "quilting", "making"];
    readonly category: "maker_craft_supplies";
}];
export declare const POPULAR_BRANDS: readonly ["Apple", "Canon", "Nikon", "Sony", "Dewalt", "Milwaukee", "Black & Decker", "Nike", "Adidas", "GoPro", "Bose", "Samsung", "LG", "Honda", "Toyota", "Coleman", "North Face", "Patagonia", "REI", "Fender", "Gibson", "Yamaha"];
/**
 * Generate text-based search suggestions using fuzzy matching
 */
export declare function generateTextSuggestions(query: string, existingData: string[], maxSuggestions?: number): SearchSuggestion[];
/**
 * Generate category suggestions based on query
 */
export declare function generateCategorySuggestions(query: string): SearchSuggestion[];
/**
 * Generate item name suggestions
 */
export declare function generateItemSuggestions(query: string): SearchSuggestion[];
/**
 * Generate brand suggestions
 */
export declare function generateBrandSuggestions(query: string): SearchSuggestion[];
/**
 * Generate comprehensive search suggestions
 */
export declare function generateSearchSuggestions(query: string, config?: Partial<PredictiveTextConfig>, context?: {
    recentSearches?: RecentSearch[];
    popularSearches?: PopularSearch[];
    existingItems?: string[];
}): SearchSuggestion[];
/**
 * Generate spelling corrections for search queries
 */
export declare function generateSpellingCorrections(query: string): SearchCorrection[];
/**
 * Normalize text for comparison (lowercase, trim, remove special chars)
 */
export declare function normalizeSearchText(text: string): string;
/**
 * Calculate string similarity using Levenshtein distance
 */
export declare function calculateStringSimilarity(str1: string, str2: string): number;
/**
 * Remove duplicate suggestions based on text
 */
export declare function removeDuplicateSuggestions(suggestions: SearchSuggestion[]): SearchSuggestion[];
/**
 * Create a debounced function for search suggestions
 */
export declare function createSearchDebouncer<T extends (...args: any[]) => any>(func: T, delay: number): T;
/**
 * Simple cache implementation for search suggestions
 */
export declare class SearchSuggestionCacheManager {
    private cache;
    private ttl;
    constructor(ttlMs?: number);
    set(key: string, suggestions: SearchSuggestion[]): void;
    get(key: string): SearchSuggestion[] | null;
    clear(): void;
    size(): number;
}
/**
 * Create search suggestion request object
 */
export declare function createSearchSuggestionRequest(query: string, options?: Partial<SearchSuggestionRequest>): SearchSuggestionRequest;
/**
 * Filter suggestions based on type and relevance
 */
export declare function filterSuggestions(suggestions: SearchSuggestion[], filters: {
    types?: SearchSuggestionType[];
    minConfidence?: number;
    maxResults?: number;
}): SearchSuggestion[];
