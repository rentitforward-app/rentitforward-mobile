import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Switch,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Calendar, DateData } from 'react-native-calendars';
import Slider from '@react-native-community/slider';

interface SearchFilters {
  query: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  location: string;
  radius: number;
  startDate: string | null;
  endDate: string | null;
  instantBook: boolean;
  deliveryAvailable: boolean;
  verifiedOwners: boolean;
  minRating: number;
  sortBy: 'relevance' | 'price_low' | 'price_high' | 'distance' | 'rating' | 'newest';
}

const CATEGORIES = [
  { id: 'all', name: 'All Categories', icon: '��' },
  { id: 'tools_diy_equipment', name: 'Tools & DIY Equipment', icon: '🔧' },
  { id: 'cameras_photography_gear', name: 'Cameras & Photography Gear', icon: '📷' },
  { id: 'event_party_equipment', name: 'Event & Party Equipment', icon: '🎉' },
  { id: 'camping_outdoor_gear', name: 'Camping & Outdoor Gear', icon: '🏕️' },
  { id: 'tech_electronics', name: 'Tech & Electronics', icon: '📱' },
  { id: 'vehicles_transport', name: 'Vehicles & Transport', icon: '🚗' },
  { id: 'home_garden_appliances', name: 'Home & Garden Appliances', icon: '🏡' },
  { id: 'sports_fitness_equipment', name: 'Sports & Fitness Equipment', icon: '🏃' },
  { id: 'musical_instruments_gear', name: 'Musical Instruments & Gear', icon: '🎸' },
  { id: 'costumes_props', name: 'Costumes & Props', icon: '🎭' },
  { id: 'maker_craft_supplies', name: 'Maker & Craft Supplies', icon: '✂️' },
];

const SORT_OPTIONS = [
  { id: 'relevance', name: 'Most Relevant', icon: '🎯' },
  { id: 'price_low', name: 'Price: Low to High', icon: '💰' },
  { id: 'price_high', name: 'Price: High to Low', icon: '💎' },
  { id: 'distance', name: 'Distance: Nearest First', icon: '📍' },
  { id: 'rating', name: 'Highest Rated', icon: '⭐' },
  { id: 'newest', name: 'Newest First', icon: '🆕' },
];

const PREDEFINED_LOCATIONS = [
  'Sydney, NSW',
  'Melbourne, VIC',
  'Brisbane, QLD',
  'Perth, WA',
  'Adelaide, SA',
  'Gold Coast, QLD',
  'Newcastle, NSW',
  'Canberra, ACT',
  'Wollongong, NSW',
  'Geelong, VIC',
];

export default function SearchFiltersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [filters, setFilters] = useState<SearchFilters>({
    query: (params.query as string) || '',
    category: (params.category as string) || 'all',
    minPrice: 0,
    maxPrice: 500,
    location: (params.location as string) || '',
    radius: 25,
    startDate: null,
    endDate: null,
    instantBook: false,
    deliveryAvailable: false,
    verifiedOwners: false,
    minRating: 0,
    sortBy: 'relevance',
  });

  const [showCalendar, setShowCalendar] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showSortPicker, setShowSortPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<'start' | 'end' | null>(null);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Calculate active filters count
  useEffect(() => {
    let count = 0;
    if (filters.category !== 'all') count++;
    if (filters.minPrice > 0 || filters.maxPrice < 500) count++;
    if (filters.location) count++;
    if (filters.startDate || filters.endDate) count++;
    if (filters.instantBook) count++;
    if (filters.deliveryAvailable) count++;
    if (filters.verifiedOwners) count++;
    if (filters.minRating > 0) count++;
    if (filters.sortBy !== 'relevance') count++;
    
    setActiveFiltersCount(count);
  }, [filters]);

  // Handle filter updates
  const updateFilter = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Handle date selection
  const handleDateSelect = (day: DateData) => {
    if (selectedDate === 'start') {
      updateFilter('startDate', day.dateString);
      // If end date is before start date, clear it
      if (filters.endDate && new Date(day.dateString) > new Date(filters.endDate)) {
        updateFilter('endDate', null);
      }
    } else if (selectedDate === 'end') {
      // Only allow end date if start date is selected and end date is after start date
      if (filters.startDate && new Date(day.dateString) >= new Date(filters.startDate)) {
        updateFilter('endDate', day.dateString);
      }
    }
    setShowCalendar(false);
    setSelectedDate(null);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      query: filters.query, // Keep search query
      category: 'all',
      minPrice: 0,
      maxPrice: 500,
      location: '',
      radius: 25,
      startDate: null,
      endDate: null,
      instantBook: false,
      deliveryAvailable: false,
      verifiedOwners: false,
      minRating: 0,
      sortBy: 'relevance',
    });
  };

  // Apply filters and navigate back
  const applyFilters = () => {
    // Create URL search params
    const searchParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== '' && value !== false && value !== 0 && value !== 'all' && value !== 'relevance') {
        searchParams.append(key, String(value));
      }
    });
    
    // Navigate back with filters
    router.push(`/(tabs)/browse?${searchParams.toString()}`);
  };

  // Format date display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-AU', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Get marked dates for calendar
  const getMarkedDates = () => {
    const marked: any = {};
    
    if (filters.startDate) {
      marked[filters.startDate] = {
        selected: true,
        startingDay: true,
        color: '#44d62c',
        textColor: 'white',
      };
    }
    
    if (filters.endDate) {
      marked[filters.endDate] = {
        selected: true,
        endingDay: true,
        color: '#44d62c',
        textColor: 'white',
      };
    }
    
    // Mark days between start and end date
    if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      
      for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        const dateString = d.toISOString().split('T')[0];
        if (dateString !== filters.startDate && dateString !== filters.endDate) {
          marked[dateString] = {
            color: '#86efac',
            textColor: 'white',
          };
        }
      }
    }
    
    return marked;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>
          Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </Text>
        
        <TouchableOpacity onPress={clearAllFilters} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Search Query */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="What are you looking for?"
            value={filters.query}
            onChangeText={(text) => updateFilter('query', text)}
            returnKeyType="search"
          />
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category</Text>
          <TouchableOpacity
            style={styles.picker}
            onPress={() => setShowCategoryPicker(true)}
          >
            <Text style={styles.pickerText}>
              {CATEGORIES.find(c => c.id === filters.category)?.icon}{' '}
              {CATEGORIES.find(c => c.id === filters.category)?.name}
            </Text>
            <Text style={styles.pickerArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Price Range */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Range (per day)</Text>
          <View style={styles.priceRange}>
            <Text style={styles.priceLabel}>
              ${filters.minPrice} - ${filters.maxPrice}
            </Text>
          </View>
          
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>Min: ${filters.minPrice}</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={500}
              value={filters.minPrice}
              onValueChange={(value) => updateFilter('minPrice', Math.floor(value))}
              minimumTrackTintColor="#44d62c"
              maximumTrackTintColor="#e5e7eb"
              thumbStyle={styles.sliderThumb}
            />
          </View>
          
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>Max: ${filters.maxPrice}</Text>
            <Slider
              style={styles.slider}
              minimumValue={filters.minPrice}
              maximumValue={1000}
              value={filters.maxPrice}
              onValueChange={(value) => updateFilter('maxPrice', Math.floor(value))}
              minimumTrackTintColor="#44d62c"
              maximumTrackTintColor="#e5e7eb"
              thumbStyle={styles.sliderThumb}
            />
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <TouchableOpacity
            style={styles.picker}
            onPress={() => setShowLocationPicker(true)}
          >
            <Text style={styles.pickerText}>
              {filters.location || 'Select location...'}
            </Text>
            <Text style={styles.pickerArrow}>▼</Text>
          </TouchableOpacity>
          
          {filters.location && (
            <View style={styles.radiusContainer}>
              <Text style={styles.radiusLabel}>
                Within {filters.radius} km
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={5}
                maximumValue={100}
                value={filters.radius}
                onValueChange={(value) => updateFilter('radius', Math.floor(value))}
                minimumTrackTintColor="#44d62c"
                maximumTrackTintColor="#e5e7eb"
                thumbStyle={styles.sliderThumb}
              />
            </View>
          )}
        </View>

        {/* Dates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Availability Dates</Text>
          <View style={styles.dateSelectors}>
            <TouchableOpacity
              style={styles.dateSelector}
              onPress={() => {
                setSelectedDate('start');
                setShowCalendar(true);
              }}
            >
              <Text style={styles.dateSelectorLabel}>Start Date</Text>
              <Text style={styles.dateSelectorValue}>
                {formatDate(filters.startDate) || 'Select'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.dateSelector}
              onPress={() => {
                if (filters.startDate) {
                  setSelectedDate('end');
                  setShowCalendar(true);
                }
              }}
            >
              <Text style={styles.dateSelectorLabel}>End Date</Text>
              <Text style={[
                styles.dateSelectorValue,
                !filters.startDate && styles.dateSelectorDisabled,
              ]}>
                {formatDate(filters.endDate) || 'Select'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {(filters.startDate || filters.endDate) && (
            <TouchableOpacity
              style={styles.clearDatesButton}
              onPress={() => {
                updateFilter('startDate', null);
                updateFilter('endDate', null);
              }}
            >
              <Text style={styles.clearDatesText}>Clear dates</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Filters */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Filters</Text>
          
          <View style={styles.switchItem}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Instant Book</Text>
              <Text style={styles.switchDescription}>Book immediately without approval</Text>
            </View>
            <Switch
              value={filters.instantBook}
              onValueChange={(value) => updateFilter('instantBook', value)}
              trackColor={{ false: '#e5e7eb', true: '#86efac' }}
              thumbColor={filters.instantBook ? '#22c55e' : '#f3f4f6'}
            />
          </View>
          
          <View style={styles.switchItem}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Delivery Available</Text>
              <Text style={styles.switchDescription}>Owner offers delivery service</Text>
            </View>
            <Switch
              value={filters.deliveryAvailable}
              onValueChange={(value) => updateFilter('deliveryAvailable', value)}
              trackColor={{ false: '#e5e7eb', true: '#86efac' }}
              thumbColor={filters.deliveryAvailable ? '#22c55e' : '#f3f4f6'}
            />
          </View>
          
          <View style={styles.switchItem}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Verified Owners Only</Text>
              <Text style={styles.switchDescription}>Show listings from verified users</Text>
            </View>
            <Switch
              value={filters.verifiedOwners}
              onValueChange={(value) => updateFilter('verifiedOwners', value)}
              trackColor={{ false: '#e5e7eb', true: '#86efac' }}
              thumbColor={filters.verifiedOwners ? '#22c55e' : '#f3f4f6'}
            />
          </View>
        </View>

        {/* Rating */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Minimum Rating</Text>
          <View style={styles.ratingOptions}>
            {[0, 3, 4, 4.5].map((rating) => (
              <TouchableOpacity
                key={rating}
                style={[
                  styles.ratingOption,
                  filters.minRating === rating && styles.ratingOptionActive,
                ]}
                onPress={() => updateFilter('minRating', rating)}
              >
                <Text style={[
                  styles.ratingOptionText,
                  filters.minRating === rating && styles.ratingOptionTextActive,
                ]}>
                  {rating === 0 ? 'Any' : `${rating}+ ⭐`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sort By */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sort By</Text>
          <TouchableOpacity
            style={styles.picker}
            onPress={() => setShowSortPicker(true)}
          >
            <Text style={styles.pickerText}>
              {SORT_OPTIONS.find(s => s.id === filters.sortBy)?.icon}{' '}
              {SORT_OPTIONS.find(s => s.id === filters.sortBy)?.name}
            </Text>
            <Text style={styles.pickerArrow}>▼</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Apply Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
          <Text style={styles.applyButtonText}>
            Apply Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category Picker Modal */}
      <Modal
        visible={showCategoryPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <ScrollView style={styles.modalList}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.modalOption,
                    filters.category === category.id && styles.modalOptionActive,
                  ]}
                  onPress={() => {
                    updateFilter('category', category.id);
                    setShowCategoryPicker(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>
                    {category.icon} {category.name}
                  </Text>
                  {filters.category === category.id && (
                    <Text style={styles.modalOptionCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCategoryPicker(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Location Picker Modal */}
      <Modal
        visible={showLocationPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLocationPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Location</Text>
            <TextInput
              style={styles.modalSearchInput}
              placeholder="Enter city or postcode..."
              value={filters.location}
              onChangeText={(text) => updateFilter('location', text)}
              autoFocus
            />
            <ScrollView style={styles.modalList}>
              {PREDEFINED_LOCATIONS.map((location) => (
                <TouchableOpacity
                  key={location}
                  style={styles.modalOption}
                  onPress={() => {
                    updateFilter('location', location);
                    setShowLocationPicker(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>📍 {location}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowLocationPicker(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Sort Picker Modal */}
      <Modal
        visible={showSortPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSortPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sort Results</Text>
            <ScrollView style={styles.modalList}>
              {SORT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.modalOption,
                    filters.sortBy === option.id && styles.modalOptionActive,
                  ]}
                  onPress={() => {
                    updateFilter('sortBy', option.id);
                    setShowSortPicker(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>
                    {option.icon} {option.name}
                  </Text>
                  {filters.sortBy === option.id && (
                    <Text style={styles.modalOptionCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowSortPicker(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Calendar Modal */}
      <Modal
        visible={showCalendar}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCalendar(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Select {selectedDate === 'start' ? 'Start' : 'End'} Date
            </Text>
            <Calendar
              onDayPress={handleDateSelect}
              markedDates={getMarkedDates()}
              markingType="period"
              minDate={new Date().toISOString().split('T')[0]}
              theme={{
                backgroundColor: '#ffffff',
                calendarBackground: '#ffffff',
                textSectionTitleColor: '#6b7280',
                selectedDayBackgroundColor: '#44d62c',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#44d62c',
                dayTextColor: '#111827',
                textDisabledColor: '#d1d5db',
                arrowColor: '#44d62c',
                monthTextColor: '#111827',
                indicatorColor: '#44d62c',
              }}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCalendar(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6b7280',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#ffffff',
    marginTop: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  picker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
  },
  pickerText: {
    fontSize: 16,
    color: '#111827',
  },
  pickerArrow: {
    fontSize: 12,
    color: '#6b7280',
  },
  priceRange: {
    alignItems: 'center',
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#44d62c',
  },
  sliderContainer: {
    marginBottom: 16,
  },
  sliderLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderThumb: {
    backgroundColor: '#44d62c',
    width: 20,
    height: 20,
  },
  radiusContainer: {
    marginTop: 12,
  },
  radiusLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  dateSelectors: {
    flexDirection: 'row',
    gap: 12,
  },
  dateSelector: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9fafb',
  },
  dateSelectorLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  dateSelectorValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  dateSelectorDisabled: {
    color: '#d1d5db',
  },
  clearDatesButton: {
    alignSelf: 'center',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  clearDatesText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '500',
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  switchInfo: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  ratingOptions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  ratingOption: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f9fafb',
  },
  ratingOptionActive: {
    backgroundColor: '#44d62c',
    borderColor: '#44d62c',
  },
  ratingOptionText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  ratingOptionTextActive: {
    color: '#ffffff',
  },
  footer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  applyButton: {
    backgroundColor: '#44d62c',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalSearchInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    marginBottom: 16,
  },
  modalList: {
    maxHeight: 300,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalOptionActive: {
    backgroundColor: '#f0fdf4',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
  modalOptionCheck: {
    fontSize: 16,
    color: '#44d62c',
    fontWeight: '600',
  },
  modalCloseButton: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
}); 