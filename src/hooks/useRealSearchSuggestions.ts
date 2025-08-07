import { useState, useEffect, useCallback } from 'react';

interface SearchSuggestion {
  text: string;
  type: 'category' | 'item' | 'popular' | 'recent';
  count?: number;
  icon?: string;
}

interface UseRealSearchSuggestionsReturn {
  suggestions: SearchSuggestion[];
  loading: boolean;
  error: string | null;
}

export function useRealSearchSuggestions(query: string): UseRealSearchSuggestionsReturn {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // For mobile, connect to your web API
      // Use your computer's IP address for testing on real device
      const API_BASE = __DEV__ ? 'http://192.168.0.201:3000' : 'https://your-production-url.com';
      const response = await fetch(
        `${API_BASE}/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }

      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (err) {
      console.warn('Failed to fetch real suggestions, using fallback:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSuggestions(query);
    }, 300); // Debounce 300ms

    return () => clearTimeout(timeoutId);
  }, [query, fetchSuggestions]);

  return { suggestions, loading, error };
}