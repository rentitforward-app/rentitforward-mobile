/**
 * Shared API client patterns for search suggestions and autocomplete
 * Used across web and mobile platforms
 */
import type { SearchSuggestion, SearchSuggestionRequest, SearchSuggestionResult, PredictiveTextConfig, PopularSearch, RecentSearch } from '../types/search';
export declare const SEARCH_API_ENDPOINTS: {
    readonly SUGGESTIONS: "/api/search/suggestions";
    readonly POPULAR: "/api/search/popular";
    readonly RECENT: "/api/search/recent";
    readonly HISTORY: "/api/search/history";
    readonly ANALYTICS: "/api/search/analytics";
};
/**
 * Base API client for search suggestions
 */
export declare class SearchSuggestionAPI {
    private baseUrl;
    private cache;
    private config;
    private debouncedFetch;
    constructor(baseUrl?: string, config?: Partial<PredictiveTextConfig>);
    /**
     * Get search suggestions with caching and debouncing
     */
    getSuggestions(query: string, options?: Partial<SearchSuggestionRequest>): Promise<SearchSuggestionResult>;
    /**
     * Get popular searches
     */
    getPopularSearches(limit?: number): Promise<PopularSearch[]>;
    /**
     * Get user's recent searches
     */
    getRecentSearches(userId: string, limit?: number): Promise<RecentSearch[]>;
    /**
     * Save search to history
     */
    saveSearchToHistory(searchData: {
        query: string;
        user_id?: string;
        result_count: number;
        filters?: Record<string, any>;
        platform: 'web' | 'mobile';
    }): Promise<boolean>;
    /**
     * Get instant local suggestions (for offline/fallback scenarios)
     */
    getInstantSuggestions(query: string, context?: {
        existingItems?: string[];
        recentSearches?: RecentSearch[];
        popularSearches?: PopularSearch[];
    }): SearchSuggestion[];
    /**
     * Clear suggestion cache
     */
    clearCache(): void;
    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<PredictiveTextConfig>): void;
    /**
     * Private method to fetch suggestions from API
     */
    private fetchSuggestionsFromAPI;
    /**
     * Generic API fetch method
     */
    private fetchFromAPI;
    /**
     * Create cache key for request
     */
    private createCacheKey;
    /**
     * Fallback suggestions when API is unavailable
     */
    private getFallbackSuggestions;
    /**
     * Fallback popular searches
     */
    private getFallbackPopularSearches;
}
/**
 * Hook-style API for React applications
 */
export declare function createSearchSuggestionHook(apiClient: SearchSuggestionAPI): {
    /**
     * Get suggestions with built-in state management
     */
    useSuggestions: (query: string, options?: Partial<SearchSuggestionRequest>) => {
        getSuggestions: (q: string) => Promise<SearchSuggestionResult>;
        getInstant: (q: string) => SearchSuggestion[];
        clearCache: () => void;
    };
    /**
     * Popular searches hook
     */
    usePopularSearches: (limit?: number) => {
        getPopular: () => Promise<PopularSearch[]>;
    };
    /**
     * Recent searches hook
     */
    useRecentSearches: (userId: string, limit?: number) => {
        getRecent: () => Promise<RecentSearch[]>;
        saveSearch: (searchData: any) => Promise<boolean>;
    };
};
/**
 * Factory function to create API client instances
 */
export declare function createSearchAPI(baseUrl: string, config?: Partial<PredictiveTextConfig>): SearchSuggestionAPI;
/**
 * Platform-specific API client creators
 */
export declare const createWebSearchAPI: (baseUrl?: string) => SearchSuggestionAPI;
export declare const createMobileSearchAPI: (baseUrl?: string) => SearchSuggestionAPI;
/**
 * Local storage helper for search history (client-side)
 */
export declare class LocalSearchHistory {
    private storageKey;
    private maxItems;
    constructor(storageKey?: string, maxItems?: number);
    /**
     * Add search to local history
     */
    addSearch(query: string): void;
    /**
     * Get local search history
     */
    getHistory(): RecentSearch[];
    /**
     * Clear local history
     */
    clearHistory(): void;
    /**
     * Remove specific search from history
     */
    removeSearch(query: string): void;
    /**
     * Platform-agnostic storage getters
     */
    private getFromStorage;
    private saveToStorage;
    private removeFromStorage;
    private saveHistory;
}
