import { useState, useEffect, useRef, useCallback } from 'react';

// Simple local types
interface SearchSuggestion {
  text: string;
  type: 'category' | 'item' | 'brand' | 'query' | 'location';
  count?: number;
  icon?: string;
}

interface UseSearchSuggestionsOptions {
  debounceDelay?: number;
  maxSuggestions?: number;
  minChars?: number;
  enableHistory?: boolean;
}

interface SearchSuggestionsResult {
  suggestions: SearchSuggestion[];
  isLoading: boolean;
  error: string | null;
  saveSearch: (query: string) => Promise<void>;
  clearHistory: () => Promise<void>;
}

// Mock suggestions for demo
const MOCK_SUGGESTIONS: SearchSuggestion[] = [
  { text: 'Camera', type: 'category', count: 45, icon: '📷' },
  { text: 'Cameras & Photography Gear', type: 'category', count: 45, icon: '📷' },
  { text: 'Drill', type: 'item', count: 23, icon: '🔧' },
  { text: 'Power Drill', type: 'item', count: 23, icon: '🔧' },
  { text: 'Laptop', type: 'category', count: 67, icon: '💻' },
  { text: 'Gaming Laptop', type: 'item', count: 67, icon: '💻' },
  { text: 'Canon', type: 'brand', count: 12, icon: '📸' },
  { text: 'Canon Camera', type: 'item', count: 12, icon: '📸' },
  { text: 'Power Tools', type: 'category', count: 34, icon: '⚡' },
  { text: 'Tools & DIY Equipment', type: 'category', count: 34, icon: '⚡' },
  { text: 'Electronics', type: 'category', count: 89, icon: '🔌' },
  { text: 'Electronics & Gadgets', type: 'category', count: 89, icon: '🔌' },
];

export function useSearchSuggestions(
  query: string,
  options: UseSearchSuggestionsOptions = {}
): SearchSuggestionsResult {
  const {
    debounceDelay = 300,
    maxSuggestions = 8,
    minChars = 2,
    enableHistory = true,
  } = options;

  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | undefined>(undefined);

  // Search history management
  const getSearchHistory = useCallback(async (): Promise<string[]> => {
    // In a real app, you'd use AsyncStorage here
    // For now, return mock data
    return ['camera', 'drill', 'laptop'];
  }, []);

  const saveSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    try {
      // In a real app, you'd save to AsyncStorage here
      console.log('Saving search to AsyncStorage:', searchQuery);
      
      // Mock implementation - in reality you'd do:
      // const history = await AsyncStorage.getItem('search_history');
      // const parsed = history ? JSON.parse(history) : [];
      // const newHistory = [searchQuery, ...parsed.filter(h => h !== searchQuery)].slice(0, 10);
      // await AsyncStorage.setItem('search_history', JSON.stringify(newHistory));
    } catch (error) {
      console.warn('Failed to save search history:', error);
    }
  }, []);

  const clearHistory = useCallback(async () => {
    try {
      // In a real app, you'd clear AsyncStorage here
      console.log('Clearing search history from AsyncStorage');
      
      // Mock implementation - in reality you'd do:
      // await AsyncStorage.removeItem('search_history');
    } catch (error) {
      console.warn('Failed to clear search history:', error);
    }
  }, []);

  // Generate suggestions
  const generateSuggestions = useCallback(async (searchQuery: string): Promise<SearchSuggestion[]> => {
    const normalizedQuery = searchQuery.toLowerCase().trim();
    
    if (!normalizedQuery || normalizedQuery.length < minChars) {
      return [];
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Filter mock suggestions
    const filtered = MOCK_SUGGESTIONS.filter(suggestion =>
      suggestion.text.toLowerCase().includes(normalizedQuery)
    );

    // Add recent searches if enabled
    let historySuggestions: SearchSuggestion[] = [];
    if (enableHistory) {
      const history = await getSearchHistory();
      historySuggestions = history
        .filter(search => search.toLowerCase().includes(normalizedQuery))
        .map(search => ({
          text: search,
          type: 'query' as const,
          icon: '🕒'
        }));
    }

    // Combine and limit results
    const combined = [...historySuggestions, ...filtered].slice(0, maxSuggestions);
    return combined;
  }, [minChars, enableHistory, getSearchHistory, maxSuggestions]);

  // Debounced search effect
  useEffect(() => {
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer
    debounceTimer.current = setTimeout(async () => {
      if (query.length >= minChars) {
        setIsLoading(true);
        setError(null);
        
        try {
          const results = await generateSuggestions(query);
          setSuggestions(results);
        } catch (err) {
          setError('Failed to fetch suggestions');
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setIsLoading(false);
      }
    }, debounceDelay);

    // Cleanup
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, debounceDelay, minChars, generateSuggestions]);

  return {
    suggestions,
    isLoading,
    error,
    saveSearch,
    clearHistory,
  };
}

// Export types for convenience
export type { SearchSuggestion, UseSearchSuggestionsOptions, SearchSuggestionsResult };