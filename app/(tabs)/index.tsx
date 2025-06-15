import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Rent It Forward</Text>
          <Text style={styles.subtitle}>Rent. Share. Repeat.</Text>
        </View>

        <View style={styles.searchContainer}>
          <Text style={styles.searchText}>Find what you need</Text>
          <TouchableOpacity style={styles.searchButton}>
            <Text style={styles.searchButtonText}>Search Items</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Popular Categories</Text>
          <View style={styles.categoryGrid}>
            {['Tools & DIY', 'Electronics', 'Sports', 'Events'].map((category) => (
              <TouchableOpacity key={category} style={styles.categoryCard}>
                <Text style={styles.categoryText}>{category}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.featuredContainer}>
          <Text style={styles.sectionTitle}>Featured Items</Text>
          <Text style={styles.placeholderText}>
            Featured items will appear here once you have listings
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#44D62C',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#343C3E',
  },
  searchContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    alignItems: 'center',
  },
  searchText: {
    fontSize: 18,
    color: '#343C3E',
    marginBottom: 16,
  },
  searchButton: {
    backgroundColor: '#44D62C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  categoriesContainer: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#343C3E',
    marginBottom: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: '45%',
    alignItems: 'center',
  },
  categoryText: {
    color: '#343C3E',
    fontSize: 14,
    fontWeight: '500',
  },
  featuredContainer: {
    margin: 20,
    marginBottom: 40,
  },
  placeholderText: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
}); 