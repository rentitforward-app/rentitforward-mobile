import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../types/navigation';

// Brand colors from Rent It Forward design system
const COLORS = {
  primary: '#44D62C',     // Vibrant Green
  secondary: '#343C3E',   // Charcoal Grey  
  white: '#FFFFFF',
  gray: '#6B7280',
  lightGray: '#E5E7EB',
};

type NavigationProps = NavigationProp<RootStackParamList>;

export default function Header() {
  const navigation = useNavigation<NavigationProps>();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          {/* Logo */}
          <TouchableOpacity 
            onPress={() => navigation.navigate('Home')}
            style={styles.logoContainer}
          >
            <View style={[styles.logoIcon, { backgroundColor: COLORS.primary }]}>
              <Text style={styles.logoText}>R</Text>
            </View>
            <Text style={[styles.logoTitle, { color: COLORS.secondary }]}>
              RENT IT FORWARD
            </Text>
          </TouchableOpacity>
          
          {/* User Actions */}
          <View style={styles.userActions}>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.linkText, { color: COLORS.secondary }]}>
                Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Register')}
              style={[styles.signUpButton, { backgroundColor: COLORS.primary }]}
            >
              <Text style={[styles.signUpText, { color: COLORS.white }]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  content: {
    maxWidth: 1280,
    marginHorizontal: 'auto',
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  logoText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  logoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  linkText: {
    fontWeight: '500',
    fontSize: 16,
  },
  signUpButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 24,
  },
  signUpText: {
    fontWeight: '500',
    fontSize: 16,
  },
}); 