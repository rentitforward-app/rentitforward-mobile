import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function GraphQLListingsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          🚀 Coming Soon
        </Text>
        <Text style={styles.headerSubtitle}>
          Advanced GraphQL features are being developed
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>
          This screen will include:
        </Text>
        
        <View style={styles.featureList}>
          <Text style={styles.featureItem}>• Real-time listing updates</Text>
          <Text style={styles.featureItem}>• Advanced search and filtering</Text>
          <Text style={styles.featureItem}>• User profiles and reviews</Text>
          <Text style={styles.featureItem}>• Booking management</Text>
          <Text style={styles.featureItem}>• Push notifications</Text>
        </View>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>
            Explore Basic Features
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  content: {
    padding: 16,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 16,
  },
  featureList: {
    marginBottom: 24,
  },
  featureItem: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    paddingLeft: 8,
  },
  button: {
    backgroundColor: '#44D62C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});