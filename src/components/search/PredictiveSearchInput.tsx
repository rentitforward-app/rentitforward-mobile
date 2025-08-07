import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Keyboard,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../lib/design-system';

const { width: screenWidth } = Dimensions.get('window');

interface PredictiveSearchInputProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onSearch?: (query: string) => void;
  style?: any;
  showHistory?: boolean;
  config?: {
    min_chars?: number;
    max_suggestions?: number;
    debounce_delay?: number;
  };
}

// Local types
interface SearchSuggestion {
  text: string;
  type: 'category' | 'item' | 'brand' | 'query';
  count?: number;
  icon?: string;
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

export function PredictiveSearchInput({
  placeholder = 'Search for items, e.g. camera, drill...',
  value,
  onChangeText,
  onSearch,
  style,
  showHistory = true,
  config = {}
}: PredictiveSearchInputProps) {
  const {
    min_chars = 2,
    max_suggestions = 6,
    debounce_delay = 300,
  } = config;

  // State
  const [internalValue, setInternalValue] = useState(value || '');
  const [modalVisible, setModalVisible] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Refs
  const textInputRef = useRef<TextInput>(null);
  const debounceTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  const modalAnimation = useRef(new Animated.Value(0)).current;

  // Get recent searches from storage (mock implementation)
  const getRecentSearches = useCallback(async (): Promise<string[]> => {
    // In a real app, you'd use AsyncStorage here
    return ['camera', 'drill', 'laptop']; // Mock data
  }, []);

  // Save search to history (mock implementation)
  const saveSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;
    // In a real app, you'd save to AsyncStorage here
    console.log('Saving search:', query);
  }, []);

  // Generate suggestions
  const generateSuggestions = useCallback((query: string): SearchSuggestion[] => {
    const normalizedQuery = query.toLowerCase().trim();
    
    if (!normalizedQuery || normalizedQuery.length < min_chars) {
      return [];
    }

    // Filter mock suggestions
    const filtered = MOCK_SUGGESTIONS.filter(suggestion =>
      suggestion.text.toLowerCase().includes(normalizedQuery)
    );

    return filtered.slice(0, max_suggestions);
  }, [min_chars, max_suggestions]);

  // Debounced search function
  const debouncedSearch = useCallback((query: string) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      setIsLoading(true);
      
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const newSuggestions = generateSuggestions(query);
        setSuggestions(newSuggestions);
      } catch (error) {
        console.error('Error generating suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, debounce_delay);
  }, [debounce_delay, generateSuggestions]);

  // Handle text change
  const handleTextChange = (text: string) => {
    setInternalValue(text);
    onChangeText?.(text);
    
    if (text.length >= min_chars) {
      debouncedSearch(text);
    } else {
      setSuggestions([]);
      setIsLoading(false);
    }
  };

  // Handle input focus
  const handleFocus = async () => {
    setModalVisible(true);
    Animated.timing(modalAnimation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Load recent searches
    if (showHistory) {
      const recent = await getRecentSearches();
      setRecentSearches(recent);
    }

    // Generate suggestions for current text
    if (internalValue.length >= min_chars) {
      debouncedSearch(internalValue);
    }
  };

  // Handle modal close
  const handleClose = () => {
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setSuggestions([]);
      setIsLoading(false);
    });
    
    Keyboard.dismiss();
    textInputRef.current?.blur();
  };

  // Handle suggestion selection
  const handleSuggestionSelect = async (suggestion: SearchSuggestion) => {
    const selectedText = suggestion.text;
    setInternalValue(selectedText);
    onChangeText?.(selectedText);
    
    // Save to history
    await saveSearch(selectedText);
    
    // Close modal and trigger search
    handleClose();
    onSearch?.(selectedText);
  };

  // Handle recent search selection
  const handleRecentSearchSelect = async (searchText: string) => {
    setInternalValue(searchText);
    onChangeText?.(searchText);
    
    // Close modal and trigger search
    handleClose();
    onSearch?.(searchText);
  };

  // Handle search submit
  const handleSearchSubmit = async () => {
    if (internalValue.trim()) {
      await saveSearch(internalValue.trim());
      handleClose();
      onSearch?.(internalValue.trim());
    }
  };

  // Get icon for suggestion type
  const getSuggestionIcon = (type: string): string => {
    switch (type) {
      case 'category': return '🏷️';
      case 'item': return '🔍';
      case 'brand': return '🏢';
      case 'query': return '🕒';
      default: return '🔍';
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return (
    <>
      <TouchableOpacity onPress={handleFocus} style={[styles.searchInput, style]}>
        <Ionicons name="search" size={20} color={colors.gray[500]} style={styles.searchIcon} />
        <TextInput
          ref={textInputRef}
          style={styles.textInput}
          placeholder={placeholder}
          placeholderTextColor={colors.gray[500]}
          value={internalValue}
          onChangeText={handleTextChange}
          onFocus={handleFocus}
          returnKeyType="search"
          onSubmitEditing={handleSearchSubmit}
        />
        {internalValue.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setInternalValue('');
              onChangeText?.('');
              setSuggestions([]);
            }}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={20} color={colors.gray[400]} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="none"
        transparent={true}
        onRequestClose={handleClose}
      >
        <View style={styles.modalContainer}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                opacity: modalAnimation,
                transform: [
                  {
                    translateY: modalAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="arrow-back" size={24} color={colors.gray[600]} />
              </TouchableOpacity>
              <View style={styles.modalSearchInput}>
                <Ionicons name="search" size={20} color={colors.gray[500]} />
                <TextInput
                  style={styles.modalTextInput}
                  placeholder={placeholder}
                  placeholderTextColor={colors.gray[500]}
                  value={internalValue}
                  onChangeText={handleTextChange}
                  autoFocus={true}
                  returnKeyType="search"
                  onSubmitEditing={handleSearchSubmit}
                />
              </View>
            </View>

            {/* Content */}
            <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
              {isLoading && suggestions.length === 0 ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary.main} />
                  <Text style={styles.loadingText}>Finding suggestions...</Text>
                </View>
              ) : (
                <>
                  {/* Recent Searches */}
                  {showHistory && recentSearches.length > 0 && internalValue.length < min_chars && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Recent Searches</Text>
                      {recentSearches.map((search, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.suggestionItem}
                          onPress={() => handleRecentSearchSelect(search)}
                        >
                          <Text style={styles.suggestionIcon}>🕒</Text>
                          <Text style={styles.suggestionText}>{search}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {/* Suggestions */}
                  {suggestions.length > 0 && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Suggestions</Text>
                      {suggestions.map((suggestion, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.suggestionItem}
                          onPress={() => handleSuggestionSelect(suggestion)}
                        >
                          <Text style={styles.suggestionIcon}>
                            {suggestion.icon || getSuggestionIcon(suggestion.type)}
                          </Text>
                          <View style={styles.suggestionContent}>
                            <Text style={styles.suggestionText}>{suggestion.text}</Text>
                            {suggestion.count && (
                              <Text style={styles.suggestionCount}>
                                {suggestion.count} items
                              </Text>
                            )}
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {/* No results */}
                  {internalValue.length >= min_chars && suggestions.length === 0 && !isLoading && (
                    <View style={styles.noResultsContainer}>
                      <Text style={styles.noResultsText}>No suggestions found</Text>
                      <Text style={styles.noResultsSubtext}>
                        Try a different search term
                      </Text>
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.gray[900],
  },
  clearButton: {
    marginLeft: spacing.sm,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  closeButton: {
    marginRight: spacing.md,
  },
  modalSearchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  modalTextInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: typography.sizes.base,
    color: colors.gray[900],
  },
  modalBody: {
    flex: 1,
  },
  section: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.gray[600],
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
  },
  suggestionIcon: {
    fontSize: 20,
    marginRight: spacing.md,
    width: 24,
    textAlign: 'center',
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionText: {
    fontSize: typography.sizes.base,
    color: colors.gray[900],
    fontWeight: typography.weights.medium,
  },
  suggestionCount: {
    fontSize: typography.sizes.sm,
    color: colors.gray[500],
    marginTop: 2,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.base,
    color: colors.gray[600],
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  noResultsText: {
    fontSize: typography.sizes.base,
    color: colors.gray[600],
    fontWeight: typography.weights.medium,
    textAlign: 'center',
  },
  noResultsSubtext: {
    fontSize: typography.sizes.sm,
    color: colors.gray[500],
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});