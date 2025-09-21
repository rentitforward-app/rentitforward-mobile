import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRealSearchSuggestions } from '../../hooks/useRealSearchSuggestions';
import { colors, spacing, typography } from '../../lib/design-system';

interface SearchSuggestion {
  text: string;
  type: 'category' | 'item' | 'popular' | 'recent';
  count?: number;
  icon?: string;
}

interface RealAPIPredictiveSearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  style?: any;
  useRealAPI?: boolean;
  onSuggestionsVisibilityChange?: (visible: boolean) => void;
}

export interface RealAPIPredictiveSearchInputRef {
  closeSuggestions: () => void;
}

export const RealAPIPredictiveSearchInput = forwardRef<RealAPIPredictiveSearchInputRef, RealAPIPredictiveSearchInputProps>(({
  value,
  onChangeText,
  onSearch,
  placeholder = "Search for items...",
  style,
  useRealAPI = false,
  onSuggestionsVisibilityChange
}, ref) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<TextInput>(null);

  // Function to update suggestions visibility and notify parent
  const updateSuggestionsVisibility = (visible: boolean) => {
    setShowSuggestions(visible);
    onSuggestionsVisibilityChange?.(visible);
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    closeSuggestions: () => {
      updateSuggestionsVisibility(false);
      inputRef.current?.blur();
    }
  }));

  // Use real API or mock data based on prop
  const { suggestions: realSuggestions, loading, error } = useRealSearchSuggestions(
    useRealAPI ? value : ''
  );

  // Popular searches shown when search bar is focused but empty
  const popularSearches: SearchSuggestion[] = [
    { text: 'Camera', type: 'popular', count: 245, icon: '📷' },
    { text: 'Drill', type: 'popular', count: 189, icon: '🔧' },
    { text: 'Laptop', type: 'popular', count: 167, icon: '💻' },
    { text: 'Car', type: 'popular', count: 134, icon: '🚗' },
    { text: 'Bicycle', type: 'popular', count: 98, icon: '🚲' },
  ];

  // Mock suggestions for fallback
  const mockSuggestions: SearchSuggestion[] = [
    { text: 'Camera', type: 'category' as const, count: 45, icon: '📷' },
    { text: 'Canon Camera', type: 'item' as const, count: 12, icon: '📷' },
    { text: 'Drill', type: 'category' as const, count: 23, icon: '🔧' },
    { text: 'Power Drill', type: 'item' as const, count: 8, icon: '🔧' },
    { text: 'Laptop', type: 'category' as const, count: 67, icon: '💻' },
    { text: 'MacBook Pro', type: 'item' as const, count: 15, icon: '💻' },
  ].filter(suggestion => 
    suggestion.text.toLowerCase().includes(value.toLowerCase())
  );

  const getFilteredSuggestions = () => {
    if (value.length === 0) {
      return popularSearches;
    }
    
    if (useRealAPI && value.length > 0) {
      return realSuggestions;
    }
    
    return mockSuggestions;
  };

  const suggestions = getFilteredSuggestions();
  const filteredSuggestions = suggestions.slice(0, 5);

  const handleInputChange = (text: string) => {
    onChangeText(text);
    updateSuggestionsVisibility(true);
    setSelectedIndex(-1);
  };

  const handleSuggestionPress = (suggestion: SearchSuggestion) => {
    console.log('Suggestion pressed:', suggestion.text);
    onChangeText(suggestion.text);
    updateSuggestionsVisibility(false);
    inputRef.current?.blur(); // Dismiss keyboard
    // Trigger search immediately when suggestion is clicked
    if (onSearch) {
      onSearch(suggestion.text);
    }
  };

  const handleInputFocus = () => {
    updateSuggestionsVisibility(true);
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicking
    setTimeout(() => updateSuggestionsVisibility(false), 150);
  };

  const handleSearch = () => {
    console.log('Search button pressed:', value);
    if (value.trim()) {
      updateSuggestionsVisibility(false);
      inputRef.current?.blur(); // Dismiss keyboard
      if (onSearch) {
        onSearch(value.trim());
      }
    }
  };

  const handleOutsidePress = () => {
    console.log('Outside press detected');
    updateSuggestionsVisibility(false);
    inputRef.current?.blur(); // Dismiss keyboard
  };

  // Close suggestions when keyboard is dismissed
  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      updateSuggestionsVisibility(false);
    });

    return () => {
      keyboardDidHideListener?.remove();
    };
  }, []);

  const getSuggestionTypeLabel = (type: string) => {
    switch (type) {
      case 'category': return 'Category';
      case 'item': return 'Item';
      case 'popular': return 'Popular';
      case 'recent': return 'Recent';
      default: return '';
    }
  };

  return (
    <View style={{ position: 'relative', zIndex: 99999 }}>
      {/* Search Input with Button */}
      <View style={{ position: 'relative' }}>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onSubmitEditing={handleSearch}
          placeholder={placeholder}
          returnKeyType="search"
          style={[
            {
              backgroundColor: colors.white,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              paddingRight: 50, // Make space for search button
              fontSize: 16,
              borderWidth: 1,
              borderColor: showSuggestions ? colors.primary.main : colors.gray[300],
              color: colors.text.primary,
            },
            style
          ]}
          placeholderTextColor={colors.text.tertiary}
        />
        
        {/* Search Button - Always visible */}
        <TouchableOpacity
          onPress={handleSearch}
          style={{
            position: 'absolute',
            right: 4,
            top: 4,
            bottom: 4,
            width: 40,
            backgroundColor: colors.primary.main,
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons name="search" size={18} color={colors.white} />
        </TouchableOpacity>
      </View>


      {/* Dropdown Suggestions */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <View
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: colors.white,
            borderRadius: 12,
            marginTop: 4,
            shadowColor: colors.black,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 8,
            zIndex: 100000,
            borderWidth: 1,
            borderColor: colors.gray[200],
          }}
        >
            {/* Header */}
            <View style={{
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: 8,
              borderBottomWidth: 1,
              borderBottomColor: colors.gray[200],
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {value.length === 0 ? (
                  <>
                    <Text style={{ fontSize: 16 }}>🔥</Text>
                    <Text style={{ 
                      fontSize: 14, 
                      fontWeight: '600', 
                      color: colors.text.primary,
                      marginLeft: 6 
                    }}>
                      Popular Searches
                    </Text>
                    <View style={{
                      backgroundColor: colors.semantic.warning + '20',
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 8,
                      marginLeft: 6,
                    }}>
                      <Text style={{ 
                        fontSize: 10, 
                        color: colors.semantic.warning,
                        fontWeight: '500' 
                      }}>
                        Trending
                      </Text>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={{ fontSize: 16 }}>💡</Text>
                    <Text style={{ 
                      fontSize: 14, 
                      fontWeight: '600', 
                      color: colors.text.primary,
                      marginLeft: 6 
                    }}>
                      Suggestions
                    </Text>
                    {useRealAPI && (
                      <View style={{
                        backgroundColor: colors.semantic.success + '20',
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 8,
                        marginLeft: 6,
                      }}>
                        <Text style={{ 
                          fontSize: 10, 
                          color: colors.semantic.success,
                          fontWeight: '500' 
                        }}>
                          Live
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </View>
              
              {useRealAPI && loading && (
                <ActivityIndicator size="small" color={colors.primary.main} />
              )}
            </View>

            {/* Error Message */}
            {useRealAPI && error && (
              <View style={{
                backgroundColor: colors.semantic.error + '10',
                paddingHorizontal: 16,
                paddingVertical: 6,
                borderBottomWidth: 1,
                borderBottomColor: colors.gray[200],
              }}>
                <Text style={{ fontSize: 11, color: colors.semantic.error }}>
                  Using offline suggestions
                </Text>
              </View>
            )}

            {/* Suggestions List */}
            <View>
              {filteredSuggestions.map((item, index) => (
                <TouchableOpacity
                  key={`${item.text}-${item.type}-${index}`}
                  onPress={() => handleSuggestionPress(item)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderBottomWidth: index < filteredSuggestions.length - 1 ? 1 : 0,
                    borderBottomColor: colors.gray[200],
                    backgroundColor: index === selectedIndex ? colors.primary.main + '10' : colors.white,
                    minHeight: 56,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Text style={{ fontSize: 18, marginRight: 12 }}>{item.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ 
                        fontSize: 16, 
                        fontWeight: '500', 
                        color: colors.text.primary,
                        marginBottom: 2 
                      }}>
                        {item.text}
                      </Text>
                      <Text style={{ 
                        fontSize: 12, 
                        color: colors.text.secondary 
                      }}>
                        {getSuggestionTypeLabel(item.type)}
                        {item.count && ` • ${item.count} items`}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 16, color: colors.gray[400] }}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
        </View>
      )}
    </View>
  );
});







