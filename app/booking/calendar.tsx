import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, DateData } from 'react-native-calendars';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../src/lib/supabase';

interface MarkedDates {
  [key: string]: {
    selected?: boolean;
    startingDay?: boolean;
    endingDay?: boolean;
    color?: string;
    textColor?: string;
    disabled?: boolean;
    disableTouchEvent?: boolean;
  };
}

export default function CalendarScreen() {
  const { listingId, startDate, endDate } = useLocalSearchParams<{
    listingId: string;
    startDate?: string;
    endDate?: string;
  }>();
  const router = useRouter();

  const [selectedDates, setSelectedDates] = useState<{
    startDate: string | null;
    endDate: string | null;
  }>({
    startDate: startDate ? new Date(startDate).toISOString().split('T')[0] : null,
    endDate: endDate ? new Date(endDate).toISOString().split('T')[0] : null,
  });

  const [markedDates, setMarkedDates] = useState<MarkedDates>({});

  // Fetch booking availability for the listing
  const { data: unavailableDates = [] } = useQuery({
    queryKey: ['listing-availability', listingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('start_date, end_date')
        .eq('listing_id', listingId)
        .in('status', ['confirmed', 'active', 'pending'])
        .gte('end_date', new Date().toISOString().split('T')[0]);

      if (error) throw error;
      
      // Generate array of unavailable dates
      const unavailable: string[] = [];
      data.forEach(booking => {
        const start = new Date(booking.start_date);
        const end = new Date(booking.end_date);
        
        for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
          unavailable.push(d.toISOString().split('T')[0]);
        }
      });
      
      return unavailable;
    },
    enabled: !!listingId,
  });

  // Update marked dates when selection or availability changes
  useEffect(() => {
    const marked: MarkedDates = {};

    // Mark unavailable dates
    unavailableDates.forEach(date => {
      marked[date] = {
        disabled: true,
        disableTouchEvent: true,
        color: '#fee2e2',
        textColor: '#dc2626',
      };
    });

    // Mark today and past dates as disabled
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    for (let i = 0; i < 365; i++) {
      const date = new Date(yesterday);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      if (!marked[dateString]) {
        marked[dateString] = {
          disabled: true,
          disableTouchEvent: true,
          color: '#f3f4f6',
          textColor: '#9ca3af',
        };
      }
    }

    // Mark selected date range
    if (selectedDates.startDate && selectedDates.endDate) {
      const start = new Date(selectedDates.startDate);
      const end = new Date(selectedDates.endDate);

      // Mark start date
      marked[selectedDates.startDate] = {
        ...marked[selectedDates.startDate],
        selected: true,
        startingDay: true,
        color: '#44d62c',
        textColor: '#ffffff',
        disabled: false,
        disableTouchEvent: false,
      };

      // Mark end date
      marked[selectedDates.endDate] = {
        ...marked[selectedDates.endDate],
        selected: true,
        endingDay: true,
        color: '#44d62c',
        textColor: '#ffffff',
        disabled: false,
        disableTouchEvent: false,
      };

      // Mark days in between
      const current = new Date(start);
      current.setDate(current.getDate() + 1);
      
      while (current < end) {
        const dateString = current.toISOString().split('T')[0];
        if (!unavailableDates.includes(dateString)) {
          marked[dateString] = {
            selected: true,
            color: '#dcfce7',
            textColor: '#166534',
            disabled: false,
            disableTouchEvent: false,
          };
        }
        current.setDate(current.getDate() + 1);
      }
    } else if (selectedDates.startDate) {
      // Mark only start date
      marked[selectedDates.startDate] = {
        ...marked[selectedDates.startDate],
        selected: true,
        color: '#44d62c',
        textColor: '#ffffff',
        disabled: false,
        disableTouchEvent: false,
      };
    }

    setMarkedDates(marked);
  }, [selectedDates, unavailableDates]);

  const handleDayPress = (day: DateData) => {
    const dateString = day.dateString;

    // Check if date is unavailable
    if (unavailableDates.includes(dateString)) {
      Alert.alert('Date Unavailable', 'This date is already booked.');
      return;
    }

    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(dateString);
    
    if (selectedDate < today) {
      Alert.alert('Invalid Date', 'Cannot select dates in the past.');
      return;
    }

    if (!selectedDates.startDate || (selectedDates.startDate && selectedDates.endDate)) {
      // Start new selection
      setSelectedDates({
        startDate: dateString,
        endDate: null,
      });
    } else if (selectedDates.startDate && !selectedDates.endDate) {
      const startDate = new Date(selectedDates.startDate);
      const endDate = new Date(dateString);

      if (endDate < startDate) {
        // Selected end date is before start date, swap them
        setSelectedDates({
          startDate: dateString,
          endDate: selectedDates.startDate,
        });
      } else if (endDate.getTime() === startDate.getTime()) {
        // Same date selected, clear selection
        setSelectedDates({
          startDate: null,
          endDate: null,
        });
      } else {
        // Check if any dates in between are unavailable
        const datesInBetween: string[] = [];
        const current = new Date(startDate);
        current.setDate(current.getDate() + 1);
        
        while (current < endDate) {
          datesInBetween.push(current.toISOString().split('T')[0]);
          current.setDate(current.getDate() + 1);
        }

        const hasUnavailableDates = datesInBetween.some(date => 
          unavailableDates.includes(date)
        );

        if (hasUnavailableDates) {
          Alert.alert(
            'Date Range Unavailable', 
            'Some dates in this range are already booked. Please select a different range.'
          );
          return;
        }

        // Valid range
        setSelectedDates({
          startDate: selectedDates.startDate,
          endDate: dateString,
        });
      }
    }
  };

  const handleConfirmDates = () => {
    if (!selectedDates.startDate || !selectedDates.endDate) {
      Alert.alert('Incomplete Selection', 'Please select both start and end dates.');
      return;
    }

    // Calculate minimum rental period (e.g., 1 day)
    const start = new Date(selectedDates.startDate);
    const end = new Date(selectedDates.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (days < 1) {
      Alert.alert('Invalid Period', 'Minimum rental period is 1 day.');
      return;
    }

    // Return to booking screen with selected dates
    router.back();
    // Note: In a real app, you'd want to pass these dates back to the previous screen
    // This could be done through navigation params, state management, or a callback
  };

  const handleClearSelection = () => {
    setSelectedDates({
      startDate: null,
      endDate: null,
    });
  };

  const getTotalDays = () => {
    if (!selectedDates.startDate || !selectedDates.endDate) return 0;
    const start = new Date(selectedDates.startDate);
    const end = new Date(selectedDates.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Dates</Text>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsText}>
          {!selectedDates.startDate 
            ? 'Tap to select your start date'
            : !selectedDates.endDate 
            ? 'Tap to select your end date'
            : `${getTotalDays()} day${getTotalDays() === 1 ? '' : 's'} selected`
          }
        </Text>
      </View>

      {/* Calendar */}
      <View style={styles.calendarContainer}>
        <Calendar
          onDayPress={handleDayPress}
          markedDates={markedDates}
          markingType="period"
          theme={{
            backgroundColor: '#ffffff',
            calendarBackground: '#ffffff',
            textSectionTitleColor: '#b6c1cd',
            selectedDayBackgroundColor: '#44d62c',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#44d62c',
            dayTextColor: '#2d4150',
            textDisabledColor: '#d9e1e8',
            dotColor: '#44d62c',
            selectedDotColor: '#ffffff',
            arrowColor: '#44d62c',
            disabledArrowColor: '#d9e1e8',
            monthTextColor: '#2d4150',
            indicatorColor: '#44d62c',
            textDayFontFamily: 'System',
            textMonthFontFamily: 'System',
            textDayHeaderFontFamily: 'System',
            textDayFontSize: 16,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 13,
          }}
          minDate={new Date().toISOString().split('T')[0]}
          maxDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
        />
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Legend</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#fee2e2' }]} />
            <Text style={styles.legendText}>Unavailable</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#44d62c' }]} />
            <Text style={styles.legendText}>Selected</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#dcfce7' }]} />
            <Text style={styles.legendText}>Selected Range</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        {(selectedDates.startDate || selectedDates.endDate) && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClearSelection}>
            <Text style={styles.clearButtonText}>Clear Selection</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[
            styles.confirmButton,
            (!selectedDates.startDate || !selectedDates.endDate) && styles.confirmButtonDisabled
          ]}
          onPress={handleConfirmDates}
          disabled={!selectedDates.startDate || !selectedDates.endDate}
        >
          <Text style={styles.confirmButtonText}>
            Confirm Dates
            {getTotalDays() > 0 && ` (${getTotalDays()} day${getTotalDays() === 1 ? '' : 's'})`}
          </Text>
        </TouchableOpacity>
      </View>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#44d62c',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 8,
  },
  instructions: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  instructionsText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  calendarContainer: {
    backgroundColor: '#ffffff',
    marginTop: 8,
    paddingVertical: 16,
  },
  legend: {
    backgroundColor: '#ffffff',
    marginTop: 8,
    padding: 16,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    color: '#6b7280',
  },
  actions: {
    padding: 16,
    gap: 12,
    marginTop: 'auto',
  },
  clearButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
  confirmButton: {
    backgroundColor: '#44d62c',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
}); 