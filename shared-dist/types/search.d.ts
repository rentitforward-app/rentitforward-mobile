/**
 * Search-related types for predictive text and suggestions
 * Used across web and mobile platforms
 */
export interface SearchSuggestion {
    /** The suggestion text */
    text: string;
    /** Type of suggestion */
    type: SearchSuggestionType;
    /** Category this suggestion belongs to */
    category?: string;
    /** Number of results/matches for this suggestion */
    count?: number;
    /** Icon or emoji to display with suggestion */
    icon?: string;
    /** Confidence score (0-1) for suggestion relevance */
    confidence?: number;
    /** Whether this is a trending/popular suggestion */
    trending?: boolean;
}
export declare enum SearchSuggestionType {
    QUERY_COMPLETION = "query_completion",
    POPULAR_SEARCH = "popular_search",
    RECENT_SEARCH = "recent_search",
    CATEGORY = "category",
    BRAND = "brand",
    LOCATION = "location",
    ITEM_NAME = "item_name",
    CORRECTION = "correction",
    RELATED = "related"
}
export interface SearchSuggestionsResponse {
    /** Main query suggestions */
    suggestions: SearchSuggestion[];
    /** Popular searches */
    popular_searches: PopularSearch[];
    /** User's recent searches */
    recent_searches: RecentSearch[];
    /** Search corrections if query has typos */
    corrections?: SearchCorrection[];
    /** Related searches */
    related_searches?: RelatedSearch[];
}
export interface PopularSearch {
    /** Search query text */
    query: string;
    /** Number of times searched */
    count: number;
    /** Trend direction */
    trend?: 'up' | 'down' | 'stable';
    /** Category this search belongs to */
    category?: string;
}
export interface RecentSearch {
    /** Search query text */
    query: string;
    /** When the search was performed */
    timestamp: Date;
    /** Number of results returned */
    result_count?: number;
}
export interface SearchCorrection {
    /** Original query with typos */
    original: string;
    /** Corrected query */
    corrected: string;
    /** Confidence in the correction (0-1) */
    confidence: number;
}
export interface RelatedSearch {
    /** Related query text */
    query: string;
    /** Relevance to original query (0-1) */
    relevance: number;
    /** Why this is related */
    reason?: string;
}
export interface SearchSuggestionRequest {
    /** Current query text */
    query: string;
    /** Maximum number of suggestions to return */
    limit?: number;
    /** Types of suggestions to include */
    types?: SearchSuggestionType[];
    /** User's location for location-based suggestions */
    location?: {
        lat: number;
        lng: number;
    };
    /** User ID for personalized suggestions */
    user_id?: string;
    /** Include popular searches */
    include_popular?: boolean;
    /** Include recent searches */
    include_recent?: boolean;
    /** Platform context (web/mobile) */
    platform?: 'web' | 'mobile';
}
export interface SearchHistoryItem {
    /** Unique ID for the search */
    id: string;
    /** Search query */
    query: string;
    /** When the search was performed */
    timestamp: Date;
    /** Number of results returned */
    result_count: number;
    /** Filters applied */
    filters?: Record<string, any>;
    /** User who performed the search */
    user_id?: string;
    /** Platform where search was performed */
    platform: 'web' | 'mobile';
}
export interface PredictiveTextConfig {
    /** Minimum characters before showing suggestions */
    min_chars: number;
    /** Maximum suggestions to show */
    max_suggestions: number;
    /** Debounce delay in milliseconds */
    debounce_delay: number;
    /** Enable local caching */
    enable_cache: boolean;
    /** Cache TTL in milliseconds */
    cache_ttl: number;
    /** Enable spell correction */
    enable_corrections: boolean;
    /** Enable trending suggestions */
    enable_trending: boolean;
    /** Include emoji/icons in suggestions */
    include_icons: boolean;
}
export interface SearchAnalytics {
    /** Total number of searches */
    total_searches: number;
    /** Average search time in milliseconds */
    avg_search_time: number;
    /** Most common search queries */
    top_queries: string[];
    /** Search success rate (searches that returned results) */
    success_rate: number;
    /** Zero result searches */
    zero_result_rate: number;
    /** Suggestion click-through rate */
    suggestion_ctr: number;
}
export interface CategorySuggestion extends SearchSuggestion {
    type: SearchSuggestionType.CATEGORY;
    /** Number of items in this category */
    item_count: number;
    /** Category slug for routing */
    slug: string;
    /** Subcategories */
    subcategories?: string[];
}
export interface BrandSuggestion extends SearchSuggestion {
    type: SearchSuggestionType.BRAND;
    /** Brand logo URL */
    logo_url?: string;
    /** Number of items from this brand */
    item_count: number;
    /** Brand description */
    description?: string;
}
export interface LocationSuggestion extends SearchSuggestion {
    type: SearchSuggestionType.LOCATION;
    /** Geographic coordinates */
    coordinates?: {
        lat: number;
        lng: number;
    };
    /** Address components */
    address_components?: {
        city?: string;
        state?: string;
        country?: string;
        postal_code?: string;
    };
    /** Distance from user in kilometers */
    distance_km?: number;
}
export interface ItemSuggestion extends SearchSuggestion {
    type: SearchSuggestionType.ITEM_NAME;
    /** Average price for this item */
    avg_price?: number;
    /** Number of available listings */
    available_count: number;
    /** Most common category for this item */
    primary_category?: string;
    /** Sample image URL */
    image_url?: string;
}
export type TypedSearchSuggestion = CategorySuggestion | BrandSuggestion | LocationSuggestion | ItemSuggestion | SearchSuggestion;
export interface SearchSuggestionCacheConfig {
    /** Cache key (usually the query) */
    key: string;
    /** Cached suggestions */
    suggestions: SearchSuggestion[];
    /** When the cache was created */
    timestamp: Date;
    /** Cache expiration time */
    expires_at: Date;
    /** Query hash for cache invalidation */
    query_hash: string;
}
export interface SearchSuggestionError {
    /** Error code */
    code: string;
    /** Human-readable error message */
    message: string;
    /** Additional error details */
    details?: any;
    /** Suggested retry delay in milliseconds */
    retry_after?: number;
}
export type SearchSuggestionResult = {
    success: true;
    data: SearchSuggestionsResponse;
} | {
    success: false;
    error: SearchSuggestionError;
};
