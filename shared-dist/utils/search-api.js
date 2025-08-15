"use strict";
/**
 * Shared API client patterns for search suggestions and autocomplete
 * Used across web and mobile platforms
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalSearchHistory = exports.createMobileSearchAPI = exports.createWebSearchAPI = exports.SearchSuggestionAPI = exports.SEARCH_API_ENDPOINTS = void 0;
exports.createSearchSuggestionHook = createSearchSuggestionHook;
exports.createSearchAPI = createSearchAPI;
const search_1 = require("./search");
// API endpoints
exports.SEARCH_API_ENDPOINTS = {
    SUGGESTIONS: '/api/search/suggestions',
    POPULAR: '/api/search/popular',
    RECENT: '/api/search/recent',
    HISTORY: '/api/search/history',
    ANALYTICS: '/api/search/analytics',
};
/**
 * Base API client for search suggestions
 */
class SearchSuggestionAPI {
    constructor(baseUrl = '', config = {}) {
        this.baseUrl = baseUrl;
        this.config = { ...search_1.DEFAULT_PREDICTIVE_CONFIG, ...config };
        this.cache = new search_1.SearchSuggestionCacheManager(this.config.cache_ttl);
        // Create debounced fetch function
        this.debouncedFetch = (0, search_1.createSearchDebouncer)(this.fetchSuggestionsFromAPI.bind(this), this.config.debounce_delay);
    }
    /**
     * Get search suggestions with caching and debouncing
     */
    async getSuggestions(query, options = {}) {
        // Input validation
        if (!query || query.length < this.config.min_chars) {
            return {
                success: true,
                data: {
                    suggestions: [],
                    popular_searches: [],
                    recent_searches: [],
                },
            };
        }
        const cacheKey = this.createCacheKey(query, options);
        // Check cache first
        if (this.config.enable_cache) {
            const cached = this.cache.get(cacheKey);
            if (cached) {
                return {
                    success: true,
                    data: {
                        suggestions: cached,
                        popular_searches: [],
                        recent_searches: [],
                    },
                };
            }
        }
        // Create request object
        const request = (0, search_1.createSearchSuggestionRequest)(query, {
            platform: 'web', // Default platform, override in options
            ...options,
        });
        try {
            // Use debounced fetch for live suggestions
            const result = await this.debouncedFetch(request);
            // Cache successful results
            if (result.success && this.config.enable_cache) {
                this.cache.set(cacheKey, result.data.suggestions);
            }
            return result;
        }
        catch (error) {
            console.error('Error fetching search suggestions:', error);
            // Fallback to local suggestions
            return this.getFallbackSuggestions(query, options);
        }
    }
    /**
     * Get popular searches
     */
    async getPopularSearches(limit = 10) {
        try {
            const response = await this.fetchFromAPI(exports.SEARCH_API_ENDPOINTS.POPULAR, {
                method: 'GET',
                params: { limit },
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            return data.popular_searches || [];
        }
        catch (error) {
            console.error('Error fetching popular searches:', error);
            return this.getFallbackPopularSearches();
        }
    }
    /**
     * Get user's recent searches
     */
    async getRecentSearches(userId, limit = 10) {
        try {
            const response = await this.fetchFromAPI(exports.SEARCH_API_ENDPOINTS.RECENT, {
                method: 'GET',
                params: { user_id: userId, limit },
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            return data.recent_searches || [];
        }
        catch (error) {
            console.error('Error fetching recent searches:', error);
            return [];
        }
    }
    /**
     * Save search to history
     */
    async saveSearchToHistory(searchData) {
        try {
            const response = await this.fetchFromAPI(exports.SEARCH_API_ENDPOINTS.HISTORY, {
                method: 'POST',
                body: JSON.stringify(searchData),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return response.ok;
        }
        catch (error) {
            console.error('Error saving search to history:', error);
            return false;
        }
    }
    /**
     * Get instant local suggestions (for offline/fallback scenarios)
     */
    getInstantSuggestions(query, context) {
        return (0, search_1.generateSearchSuggestions)(query, this.config, context);
    }
    /**
     * Clear suggestion cache
     */
    clearCache() {
        this.cache.clear();
    }
    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        // Update cache TTL if changed
        if (newConfig.cache_ttl) {
            this.cache = new search_1.SearchSuggestionCacheManager(newConfig.cache_ttl);
        }
    }
    /**
     * Private method to fetch suggestions from API
     */
    async fetchSuggestionsFromAPI(request) {
        try {
            const response = await this.fetchFromAPI(exports.SEARCH_API_ENDPOINTS.SUGGESTIONS, {
                method: 'POST',
                body: JSON.stringify(request),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            return { success: true, data };
        }
        catch (error) {
            const searchError = {
                code: 'API_ERROR',
                message: error instanceof Error ? error.message : 'Unknown error occurred',
                details: error,
            };
            return { success: false, error: searchError };
        }
    }
    /**
     * Generic API fetch method
     */
    async fetchFromAPI(endpoint, options) {
        let url = `${this.baseUrl}${endpoint}`;
        // Add query parameters
        if (options.params) {
            const searchParams = new URLSearchParams();
            Object.entries(options.params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    searchParams.append(key, String(value));
                }
            });
            if (searchParams.toString()) {
                url += `?${searchParams.toString()}`;
            }
        }
        return fetch(url, {
            method: options.method,
            body: options.body,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });
    }
    /**
     * Create cache key for request
     */
    createCacheKey(query, options) {
        const key = {
            query: query.trim().toLowerCase(),
            types: options.types?.sort(),
            limit: options.limit,
            platform: options.platform,
        };
        return JSON.stringify(key);
    }
    /**
     * Fallback suggestions when API is unavailable
     */
    getFallbackSuggestions(query, options) {
        try {
            const suggestions = (0, search_1.generateSearchSuggestions)(query, this.config);
            return {
                success: true,
                data: {
                    suggestions,
                    popular_searches: [],
                    recent_searches: [],
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'FALLBACK_ERROR',
                    message: 'Failed to generate fallback suggestions',
                    details: error,
                },
            };
        }
    }
    /**
     * Fallback popular searches
     */
    getFallbackPopularSearches() {
        return [
            { query: 'camera', count: 245 },
            { query: 'drill', count: 189 },
            { query: 'laptop', count: 156 },
            { query: 'tent', count: 134 },
            { query: 'guitar', count: 112 },
            { query: 'projector', count: 98 },
            { query: 'bike', count: 87 },
            { query: 'power tools', count: 76 },
        ];
    }
}
exports.SearchSuggestionAPI = SearchSuggestionAPI;
/**
 * Hook-style API for React applications
 */
function createSearchSuggestionHook(apiClient) {
    return {
        /**
         * Get suggestions with built-in state management
         */
        useSuggestions: (query, options = {}) => {
            // This would be implemented differently in React vs React Native
            // For now, return the core functionality
            return {
                getSuggestions: (q) => apiClient.getSuggestions(q, options),
                getInstant: (q) => apiClient.getInstantSuggestions(q),
                clearCache: () => apiClient.clearCache(),
            };
        },
        /**
         * Popular searches hook
         */
        usePopularSearches: (limit = 10) => {
            return {
                getPopular: () => apiClient.getPopularSearches(limit),
            };
        },
        /**
         * Recent searches hook
         */
        useRecentSearches: (userId, limit = 10) => {
            return {
                getRecent: () => apiClient.getRecentSearches(userId, limit),
                saveSearch: (searchData) => apiClient.saveSearchToHistory(searchData),
            };
        },
    };
}
/**
 * Factory function to create API client instances
 */
function createSearchAPI(baseUrl, config = {}) {
    return new SearchSuggestionAPI(baseUrl, config);
}
/**
 * Platform-specific API client creators
 */
const createWebSearchAPI = (baseUrl = '') => createSearchAPI(baseUrl, { platform: 'web' });
exports.createWebSearchAPI = createWebSearchAPI;
const createMobileSearchAPI = (baseUrl = '') => createSearchAPI(baseUrl, { platform: 'mobile' });
exports.createMobileSearchAPI = createMobileSearchAPI;
/**
 * Local storage helper for search history (client-side)
 */
class LocalSearchHistory {
    constructor(storageKey = 'search_history', maxItems = 50) {
        this.storageKey = storageKey;
        this.maxItems = maxItems;
    }
    /**
     * Add search to local history
     */
    addSearch(query) {
        if (!query.trim())
            return;
        try {
            const history = this.getHistory();
            const newSearch = {
                query: query.trim(),
                timestamp: new Date(),
            };
            // Remove existing entry if it exists
            const filtered = history.filter(item => item.query !== newSearch.query);
            // Add to beginning and limit size
            const updated = [newSearch, ...filtered].slice(0, this.maxItems);
            this.saveHistory(updated);
        }
        catch (error) {
            console.error('Error adding search to local history:', error);
        }
    }
    /**
     * Get local search history
     */
    getHistory() {
        try {
            const stored = this.getFromStorage();
            if (!stored)
                return [];
            const parsed = JSON.parse(stored);
            return Array.isArray(parsed) ? parsed.map(item => ({
                ...item,
                timestamp: new Date(item.timestamp),
            })) : [];
        }
        catch (error) {
            console.error('Error getting local search history:', error);
            return [];
        }
    }
    /**
     * Clear local history
     */
    clearHistory() {
        try {
            this.removeFromStorage();
        }
        catch (error) {
            console.error('Error clearing local search history:', error);
        }
    }
    /**
     * Remove specific search from history
     */
    removeSearch(query) {
        try {
            const history = this.getHistory();
            const filtered = history.filter(item => item.query !== query);
            this.saveHistory(filtered);
        }
        catch (error) {
            console.error('Error removing search from local history:', error);
        }
    }
    /**
     * Platform-agnostic storage getters
     */
    getFromStorage() {
        // This would be implemented differently for web vs mobile
        if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
            return globalThis.localStorage?.getItem(this.storageKey) || null;
        }
        return null;
    }
    saveToStorage(data) {
        if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
            globalThis.localStorage?.setItem(this.storageKey, data);
        }
    }
    removeFromStorage() {
        if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
            globalThis.localStorage?.removeItem(this.storageKey);
        }
    }
    saveHistory(history) {
        try {
            this.saveToStorage(JSON.stringify(history));
        }
        catch (error) {
            console.error('Error saving search history:', error);
        }
    }
}
exports.LocalSearchHistory = LocalSearchHistory;
