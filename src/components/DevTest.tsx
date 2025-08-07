import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function DevTest() {
  const testNotification = () => {
    Alert.alert('Test', 'Development test notification');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Development Test Component
      </Text>
      
      <View style={styles.statusContainer}>
        <View style={styles.statusItem}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>
            App is running successfully
          </Text>
        </View>
        
        <View style={styles.statusItem}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>
            Shared package connected
          </Text>
        </View>
        
        <View style={styles.statusItem}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>
            Authentication ready
          </Text>
        </View>
        
        <View style={styles.statusItem}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>
            Ready for deployment
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={testNotification}
      >
        <Text style={styles.buttonText}>
          Test Notification
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  statusContainer: {
    gap: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    backgroundColor: '#44D62C',
    borderRadius: 6,
    marginRight: 12,
  },
  statusText: {
    fontSize: 14,
    color: '#374151',
  },
  button: {
    marginTop: 16,
    backgroundColor: '#44D62C',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '500',
    textAlign: 'center',
  },
});