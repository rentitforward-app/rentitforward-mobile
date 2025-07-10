import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { DevTest } from '../../src/components/DevTest';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          🏠 Welcome to Rent It Forward
        </Text>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Development Environment Test
          </Text>
          <Text style={styles.cardText}>
            This screen confirms that our development environment is working correctly!
          </Text>
        </View>

        <DevTest />
        
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>
            ✅ Development Environment Status
          </Text>
          <Text style={styles.statusText}>
            • React Native: Working
          </Text>
          <Text style={styles.statusText}>
            • Component imports: Working
          </Text>
          <Text style={styles.statusText}>
            • TypeScript: Working
          </Text>
          <Text style={styles.statusText}>
            • State management: Ready
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 16,
    paddingTop: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#44D62C',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 16,
    color: '#6b7280',
  },
  statusCard: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e40af',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#1e40af',
    marginBottom: 4,
  },
}); 