import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../src/lib/design-system';
import { Header } from '../../src/components/Header';

export default function HelpSupportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleEmailSupport = () => {
    const email = 'support@rentitforward.com';
    const subject = 'Support Request';
    const body = 'Hi Rent It Forward team,\n\nI need help with:\n\n';
    
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open email client');
      }
    });
  };

  const handlePhoneSupport = () => {
    const phoneNumber = '+61 2 1234 5678';
    const url = `tel:${phoneNumber}`;
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to make phone call');
      }
    });
  };

  const handleLiveChat = () => {
    Alert.alert(
      'Live Chat',
      'Live chat is currently unavailable. Please use email support or call us for assistance.',
      [
        { text: 'OK', style: 'default' },
        { text: 'Email Support', onPress: handleEmailSupport },
      ]
    );
  };

  const helpSections = [
    {
      title: 'Getting Started',
      items: [
        { question: 'How do I create my first listing?', answer: 'To create your first listing, go to the "My Listings" tab and tap the "+" button. Fill in the details about your item, add photos, and set your rental price.' },
        { question: 'How do I verify my identity?', answer: 'Go to Account > Personal Information and follow the verification process. You\'ll need to provide a government-issued ID and take a selfie.' },
        { question: 'How do I set up payments?', answer: 'Navigate to Account > Payment Options to set up your Stripe account for receiving payments from rentals.' },
      ]
    },
    {
      title: 'Renting Items',
      items: [
        { question: 'How do I book an item?', answer: 'Browse available items, select the dates you need, and tap "Book & Pay Now". You\'ll be redirected to complete payment securely through Stripe. Once payment is successful, your booking is confirmed instantly.' },
        { question: 'What if the item is damaged?', answer: 'Report any damage immediately through the app. We have insurance protection and dispute resolution processes in place.' },
        { question: 'How do I cancel a booking?', answer: 'Go to your Bookings tab, select the booking, and tap "Cancel". Cancellation policies vary by owner.' },
      ]
    },
    {
      title: 'Listing Items',
      items: [
        { question: 'How much can I charge for my items?', answer: 'You set your own rental prices. Consider the item\'s value, condition, and market demand when pricing.' },
        { question: 'What items can I list?', answer: 'You can list most personal items like electronics, furniture, tools, and recreational equipment. Prohibited items include weapons, drugs, and illegal goods.' },
        { question: 'How do I manage my listings?', answer: 'Use the "My Listings" tab to view, edit, and manage all your active listings.' },
      ]
    },
    {
      title: 'Payments & Fees',
      items: [
        { question: 'What are the platform fees?', answer: 'Rent It Forward charges a 3% platform fee on successful rentals. This covers payment processing, insurance, and platform maintenance.' },
        { question: 'When do I get paid?', answer: 'Payments are released to your account 24 hours after the rental period ends, minus platform fees.' },
        { question: 'How do I update my payment information?', answer: 'Go to Account > Payment Options to update your bank account or payment method.' },
      ]
    },
    {
      title: 'Safety & Security',
      items: [
        { question: 'Is my personal information safe?', answer: 'Yes, we use bank-level encryption and never share your personal information with other users without your consent.' },
        { question: 'What if someone doesn\'t return my item?', answer: 'We have insurance protection and a dispute resolution process. Contact support immediately if an item isn\'t returned.' },
        { question: 'How do I report a problem?', answer: 'Use the "Contact Us" option in Help & Support, or call our support line for urgent issues.' },
      ]
    }
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.gray[50] }}>
      <Header 
        title="Help & Support" 
        showBackButton 
        onBackPress={() => router.back()} 
      />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: spacing.lg }}>
          {/* Quick Support Options */}
          <View style={{
            backgroundColor: colors.white,
            borderRadius: 12,
            padding: spacing.lg,
            marginBottom: spacing.lg,
            shadowColor: colors.black,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}>
            <Text style={{
              fontSize: typography.sizes.lg,
              fontWeight: typography.weights.semibold,
              color: colors.gray[900],
              marginBottom: spacing.lg,
            }}>
              Get Help Quickly
            </Text>

            <View style={{ gap: spacing.md }}>
              <TouchableOpacity
                onPress={() => router.push('/account/faq')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: spacing.md,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.gray[100],
                }}
              >
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: colors.primary.main + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: spacing.md,
                }}>
                  <Ionicons name="help-circle" size={24} color={colors.primary.main} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: typography.sizes.base,
                    fontWeight: typography.weights.semibold,
                    color: colors.gray[900],
                  }}>
                    FAQ
                  </Text>
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    color: colors.gray[600],
                    marginTop: spacing.xs / 2,
                  }}>
                    Find answers to common questions
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/account/community-guidelines')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: spacing.md,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.gray[100],
                }}
              >
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: colors.semantic.info + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: spacing.md,
                }}>
                  <Ionicons name="people" size={24} color={colors.semantic.info} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: typography.sizes.base,
                    fontWeight: typography.weights.semibold,
                    color: colors.gray[900],
                  }}>
                    Community Guidelines
                  </Text>
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    color: colors.gray[600],
                    marginTop: spacing.xs / 2,
                  }}>
                    Learn about our community rules and policies
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/account/insurance-protection')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: spacing.md,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.gray[100],
                }}
              >
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: colors.semantic.success + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: spacing.md,
                }}>
                  <Ionicons name="shield-checkmark" size={24} color={colors.semantic.success} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: typography.sizes.base,
                    fontWeight: typography.weights.semibold,
                    color: colors.gray[900],
                  }}>
                    Insurance Protection
                  </Text>
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    color: colors.gray[600],
                    marginTop: spacing.xs / 2,
                  }}>
                    Comprehensive coverage and claims information
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/account/legal')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: spacing.md,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.gray[100],
                }}
              >
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: colors.semantic.info + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: spacing.md,
                }}>
                  <Ionicons name="document-text" size={24} color={colors.semantic.info} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: typography.sizes.base,
                    fontWeight: typography.weights.semibold,
                    color: colors.gray[900],
                  }}>
                    Legal Information
                  </Text>
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    color: colors.gray[600],
                    marginTop: spacing.xs / 2,
                  }}>
                    Terms of service, privacy policy, and legal terms
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleEmailSupport}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: spacing.md,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.gray[100],
                }}
              >
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: colors.semantic.info + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: spacing.md,
                }}>
                  <Ionicons name="mail" size={24} color={colors.semantic.info} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: typography.sizes.base,
                    fontWeight: typography.weights.semibold,
                    color: colors.gray[900],
                  }}>
                    Email Support
                  </Text>
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    color: colors.gray[600],
                    marginTop: spacing.xs / 2,
                  }}>
                    Send us an email and we'll get back to you
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleLiveChat}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: spacing.md,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.gray[100],
                }}
              >
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: colors.semantic.warning + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: spacing.md,
                }}>
                  <Ionicons name="chatbubble" size={24} color={colors.semantic.warning} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: typography.sizes.base,
                    fontWeight: typography.weights.semibold,
                    color: colors.gray[900],
                  }}>
                    Live Chat
                  </Text>
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    color: colors.gray[600],
                    marginTop: spacing.xs / 2,
                  }}>
                    Chat with our support team in real-time
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handlePhoneSupport}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: spacing.md,
                }}
              >
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: colors.semantic.success + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: spacing.md,
                }}>
                  <Ionicons name="call" size={24} color={colors.semantic.success} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: typography.sizes.base,
                    fontWeight: typography.weights.semibold,
                    color: colors.gray[900],
                  }}>
                    Phone Support
                  </Text>
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    color: colors.gray[600],
                    marginTop: spacing.xs / 2,
                  }}>
                    Call us for urgent support matters
                  </Text>
                </View>
                <Text style={{
                  fontSize: typography.sizes.sm,
                  color: colors.gray[500],
                  marginRight: spacing.sm,
                }}>
                  Mon-Fri 9AM-5PM AEST
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
              </TouchableOpacity>
            </View>
          </View>

          {/* FAQ Sections */}
          {helpSections.map((section, sectionIndex) => (
            <View
              key={sectionIndex}
              style={{
                backgroundColor: colors.white,
                borderRadius: 12,
                marginBottom: spacing.lg,
                shadowColor: colors.black,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Text style={{
                fontSize: typography.sizes.lg,
                fontWeight: typography.weights.semibold,
                color: colors.gray[900],
                paddingHorizontal: spacing.lg,
                paddingTop: spacing.lg,
                paddingBottom: spacing.md,
              }}>
                {section.title}
              </Text>

              <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
                {section.items.map((item, itemIndex) => (
                  <View
                    key={itemIndex}
                    style={{
                      paddingVertical: spacing.md,
                      borderBottomWidth: itemIndex < section.items.length - 1 ? 1 : 0,
                      borderBottomColor: colors.gray[100],
                    }}
                  >
                    <Text style={{
                      fontSize: typography.sizes.base,
                      fontWeight: typography.weights.medium,
                      color: colors.gray[900],
                      marginBottom: spacing.sm,
                    }}>
                      {item.question}
                    </Text>
                    <Text style={{
                      fontSize: typography.sizes.sm,
                      color: colors.gray[600],
                      lineHeight: 20,
                    }}>
                      {item.answer}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}

          {/* Contact Information */}
          <View style={{
            backgroundColor: colors.white,
            borderRadius: 12,
            padding: spacing.lg,
            marginBottom: spacing.xl,
            shadowColor: colors.black,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}>
            <Text style={{
              fontSize: typography.sizes.lg,
              fontWeight: typography.weights.semibold,
              color: colors.gray[900],
              marginBottom: spacing.lg,
            }}>
              Contact Information
            </Text>

            <View style={{ gap: spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="mail" size={20} color={colors.gray[600]} />
                <Text style={{
                  marginLeft: spacing.sm,
                  fontSize: typography.sizes.base,
                  color: colors.gray[900],
                }}>
                  support@rentitforward.com
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="call" size={20} color={colors.gray[600]} />
                <Text style={{
                  marginLeft: spacing.sm,
                  fontSize: typography.sizes.base,
                  color: colors.gray[900],
                }}>
                  +61 2 1234 5678
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="time" size={20} color={colors.gray[600]} />
                <Text style={{
                  marginLeft: spacing.sm,
                  fontSize: typography.sizes.base,
                  color: colors.gray[900],
                }}>
                  Mon-Fri 9AM-5PM AEST
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
