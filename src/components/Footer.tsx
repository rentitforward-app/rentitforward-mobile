import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
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
  dark: '#0F172A',        // Dark background
  darkGray: '#64748B',    // Muted text
};

type NavigationProps = NavigationProp<RootStackParamList>;

export default function Footer() {
  const navigation = useNavigation<NavigationProps>();

  const handleEmailPress = () => {
    Linking.openURL('mailto:hello@rentitforward.com.au');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.grid}>
          {/* Logo and Description */}
          <View style={styles.section}>
            <View style={styles.logoContainer}>
              <View style={[styles.logoIcon, { backgroundColor: COLORS.primary }]}>
                <Text style={styles.logoText}>R</Text>
              </View>
              <Text style={styles.logoTitle}>RENT IT FORWARD</Text>
            </View>
            <Text style={styles.description}>
              Share more, buy less. Rent from your community and promote a sustainable lifestyle.
            </Text>
          </View>
          
          {/* Company Links */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Company</Text>
            <View style={styles.linkList}>
              <TouchableOpacity onPress={() => navigation.navigate('About')}>
                <Text style={styles.linkText}>About Us</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Guarantee')}>
                <Text style={styles.linkText}>Guarantee</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('FAQ')}>
                <Text style={styles.linkText}>FAQs</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Support Links */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>
            <View style={styles.linkList}>
              <TouchableOpacity onPress={() => navigation.navigate('Contact')}>
                <Text style={styles.linkText}>Contact Us</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Terms')}>
                <Text style={styles.linkText}>Terms and Conditions</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Privacy')}>
                <Text style={styles.linkText}>Privacy Policy</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
                <Text style={styles.linkText}>All Categories</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Contact Info */}
          <View style={styles.section}>
            <TouchableOpacity onPress={handleEmailPress} style={styles.contactItem}>
              <Text style={styles.linkText}>hello@rentitforward.com.au</Text>
            </TouchableOpacity>
            <Text style={styles.contactText}>Address: Australia</Text>
          </View>
        </View>
        
        {/* Bottom Bar */}
        <View style={styles.bottomBar}>
          <Text style={styles.copyrightText}>
            Copyright © 2025 Rent It Forward. All rights reserved.
          </Text>
          <Text style={styles.creditText}>
            Built by Digital Linked.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.dark,
    paddingVertical: 48,
  },
  content: {
    maxWidth: 1280,
    marginHorizontal: 'auto',
    paddingHorizontal: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 32,
    justifyContent: 'space-between',
  },
  section: {
    flex: 1,
    minWidth: 200,
    marginBottom: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 18,
  },
  logoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  description: {
    color: COLORS.darkGray,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 16,
    color: COLORS.white,
    fontSize: 16,
  },
  linkList: {
    gap: 8,
  },
  linkText: {
    color: COLORS.darkGray,
    fontSize: 14,
    paddingVertical: 4,
  },
  contactItem: {
    marginBottom: 8,
  },
  contactText: {
    color: COLORS.darkGray,
    fontSize: 14,
  },
  bottomBar: {
    borderTopWidth: 1,
    borderTopColor: '#374151',
    marginTop: 32,
    paddingTop: 32,
    alignItems: 'center',
  },
  copyrightText: {
    color: COLORS.darkGray,
    fontSize: 14,
    textAlign: 'center',
  },
  creditText: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
}); 