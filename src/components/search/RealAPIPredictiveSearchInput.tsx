import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRealSearchSuggestions } from '../../hooks/useRealSearchSuggestions';

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
  useRealAPI?: boolean; // Toggle between real API and mock data
}

export function RealAPIPredictiveSearchInput({
  value,
  onChangeText,
  onSearch,
  placeholder = "Search for items...",
  style,
  useRealAPI = false
}: RealAPIPredictiveSearchInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<TextInput>(null);

  // Use real API or mock data based on prop
  const { suggestions: realSuggestions, loading, error } = useRealSearchSuggestions(
    useRealAPI ? value : ''
  );

  // Mock suggestions for fallback
  const mockSuggestions: SearchSuggestion[] = [
    { text: 'Camera', type: 'category' as any, count: 45, icon: '📷' },
    { text: 'Canon Camera', type: 'item' as any, count: 12, icon: '📷' },
    { text: 'Drill', type: 'category' as any, count: 23, icon: '🔧' },
    { text: 'Power Drill', type: 'item' as any, count: 8, icon: '🔧' },
    { text: 'Laptop', type: 'category' as any, count: 67, icon: '💻' },
    { text: 'MacBook Pro', type: 'item' as any, count: 15, icon: '💻' },
    { text: 'Bicycle', type: 'category' as any, count: 34, icon: '🚲' },
    { text: 'Mountain Bike', type: 'item', count: 9, icon: '🚲' },
  ].filter(suggestion => 
    suggestion.text.toLowerCase().includes(value.toLowerCase())
  );

  const suggestions = useRealAPI ? realSuggestions : mockSuggestions;
  const filteredSuggestions = suggestions.slice(0, 8);

  const handleInputChange = (text: string) => {
    onChangeText(text);
    setShowSuggestions(text.length > 0);
    setSelectedIndex(-1);
  };

  const handleSuggestionPress = (suggestion: SearchSuggestion) => {
    onChangeText(suggestion.text);
    setShowSuggestions(false);
    onSearch?.(suggestion.text);
  };

  const handleInputFocus = () => {
    if (value.length > 0) {
      setShowSuggestions(true);
    }
  };

  const getSuggestionTypeLabel = (type: string) => {
    switch (type) {
      case 'category': return 'Category';
      case 'item': return 'Item';
      case 'popular': return 'Popular';
      case 'recent': return 'Recent';
      default: return '';
    }
  };

  const renderSuggestionItem = ({ item, index }: { item: SearchSuggestion; index: number }) => (
    <TouchableOpacity
      onPress={() => handleSuggestionPress(item)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: index < filteredSuggestions.length - 1 ? 1 : 0,
        borderBottomColor: '#f3f4f6',
        backgroundColor: index === selectedIndex ? '#f0f9ff' : 'white',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <Text style={{ fontSize: 18, marginRight: 12 }}>{item.icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ 
            fontSize: 16, 
            fontWeight: '500', 
            color: '#111827',
            marginBottom: 2 
          }}>
            {item.text}
          </Text>
          <Text style={{ 
            fontSize: 12, 
            color: '#6b7280' 
          }}>
            {getSuggestionTypeLabel(item.type)}
            {item.count && ` • ${item.count} items`}
          </Text>
        </View>
      </View>
      <Text style={{ fontSize: 16, color: '#9ca3af' }}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleInputChange}
        onFocus={handleInputFocus}
        placeholder={placeholder}
        style={[
          {
            backgroundColor: '#f9fafb',
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            fontSize: 16,
            borderWidth: 1,
            borderColor: '#e5e7eb',
          },
          style
        ]}
      />

      <Modal
        visible={showSuggestions && filteredSuggestions.length > 0}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuggestions(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            paddingHorizontal: 20,
          }}
          activeOpacity={1}
          onPress={() => setShowSuggestions(false)}
        >
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 16,
              maxHeight: '70%',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <View style={{
              paddingHorizontal: 16,
              paddingTop: 16,
              paddingBottom: 8,
              borderBottomWidth: 1,
              borderBottomColor: '#f3f4f6',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 18 }}>💡</Text>
                <Text style={{ 
                  fontSize: 16, 
                  fontWeight: '600', 
                  color: '#374151',
                  marginLeft: 8 
                }}>
                  Search Suggestions
                </Text>
                {useRealAPI && (
                  <View style={{
                    backgroundColor: '#dcfce7',
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 12,
                    marginLeft: 8,
                  }}>
                    <Text style={{ 
                      fontSize: 12, 
                      color: '#166534',
                      fontWeight: '500' 
                    }}>
                      Real-time
                    </Text>
                  </View>
                )}
              </View>
              
              {useRealAPI && loading && (
                <ActivityIndicator size="small" color="#3b82f6" />
              )}
            </View>

            {/* Error Message */}
            {useRealAPI && error && (
              <View style={{
                backgroundColor: '#fef2f2',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderBottomWidth: 1,
                borderBottomColor: '#f3f4f6',
              }}>
                <Text style={{ fontSize: 12, color: '#dc2626' }}>
                  Using offline suggestions
                </Text>
              </View>
            )}

            {/* Suggestions List */}
            <FlatList
              data={filteredSuggestions}
              renderItem={renderSuggestionItem}
              keyExtractor={(item, index) => `${item.text}-${item.type}-${index}`}
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 400 }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}