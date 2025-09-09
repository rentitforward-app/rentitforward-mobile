import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../src/lib/design-system';
import { Header } from '../../src/components/Header';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSection {
  title: string;
  items: FAQItem[];
}

export default function FAQScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const faqSections: FAQSection[] = [
    {
      title: 'Getting Started',
      items: [
        {
          question: 'How do I create my first listing?',
          answer: 'To create your first listing, go to the "My Listings" tab and tap the "+" button. Fill in the details about your item, add photos, and set your rental price. Make sure to provide accurate descriptions and clear photos to attract renters.'
        },
        {
          question: 'How do I verify my identity?',
          answer: 'Go to Account > Personal Information and follow the verification process. You\'ll need to provide a government-issued ID and take a selfie. This helps build trust with other users and is required for certain features.'
        },
        {
          question: 'How do I set up payments?',
          answer: 'Navigate to Account > Payment Options to set up your Stripe account for receiving payments from rentals. You\'ll need to provide your bank account details and complete the verification process.'
        },
        {
          question: 'What information do I need to get started?',
          answer: 'You\'ll need a valid email address, phone number, and government-issued ID for verification. You can also add a profile photo and bio to help other users get to know you.'
        }
      ]
    },
    {
      title: 'Renting Items',
      items: [
        {
          question: 'How do I book an item?',
          answer: 'Browse available items, select the dates you need, and tap "Book Now". The owner will review and approve your request. You\'ll receive a confirmation once approved.'
        },
        {
          question: 'What if the item is damaged when I receive it?',
          answer: 'Report any damage immediately through the app by taking photos and describing the issue. We have insurance protection and dispute resolution processes in place to handle these situations fairly.'
        },
        {
          question: 'How do I cancel a booking?',
          answer: 'Go to your Bookings tab, select the booking, and tap "Cancel". Cancellation policies vary by owner, so check the listing details before booking. Some cancellations may incur fees.'
        },
        {
          question: 'What happens if I don\'t return an item on time?',
          answer: 'Late returns may incur additional fees as specified in the rental agreement. Contact the owner immediately if you need to extend your rental period. Repeated late returns may affect your account standing.'
        },
        {
          question: 'How do I contact the item owner?',
          answer: 'Use the built-in messaging system in the app to communicate with item owners. This keeps all communication in one place and helps with dispute resolution if needed.'
        }
      ]
    },
    {
      title: 'Listing Items',
      items: [
        {
          question: 'How much can I charge for my items?',
          answer: 'You set your own rental prices. Consider the item\'s value, condition, and market demand when pricing. You can also look at similar items on the platform for reference.'
        },
        {
          question: 'What items can I list?',
          answer: 'You can list most personal items like electronics, furniture, tools, and recreational equipment. Prohibited items include weapons, drugs, illegal goods, and items that violate our community guidelines.'
        },
        {
          question: 'How do I manage my listings?',
          answer: 'Use the "My Listings" tab to view, edit, and manage all your active listings. You can update availability, prices, and descriptions at any time.'
        },
        {
          question: 'What if someone damages my item?',
          answer: 'Report the damage immediately through the app with photos and details. We have insurance protection that covers most damage scenarios, and our support team will help resolve the issue.'
        },
        {
          question: 'How do I handle booking requests?',
          answer: 'You\'ll receive notifications for new booking requests. Review the renter\'s profile and rental history before approving. You can approve, decline, or request more information.'
        }
      ]
    },
    {
      title: 'Payments & Fees',
      items: [
        {
          question: 'What are the platform fees?',
          answer: 'Rent It Forward charges a 3% platform fee on successful rentals. This covers payment processing, insurance, platform maintenance, and customer support.'
        },
        {
          question: 'When do I get paid?',
          answer: 'Payments are released to your account 24 hours after the rental period ends, minus platform fees. This delay helps ensure the item is returned in good condition.'
        },
        {
          question: 'How do I update my payment information?',
          answer: 'Go to Account > Payment Options to update your bank account or payment method. Changes may take 1-2 business days to take effect.'
        },
        {
          question: 'What payment methods are accepted?',
          answer: 'We accept all major credit cards, debit cards, and bank transfers. All payments are processed securely through Stripe.'
        },
        {
          question: 'Are there any hidden fees?',
          answer: 'No hidden fees. The only charges are the 3% platform fee and any optional insurance or deposit fees that are clearly displayed before booking.'
        }
      ]
    },
    {
      title: 'Safety & Security',
      items: [
        {
          question: 'Is my personal information safe?',
          answer: 'Yes, we use bank-level encryption and never share your personal information with other users without your consent. We only share necessary information for successful transactions.'
        },
        {
          question: 'What if someone doesn\'t return my item?',
          answer: 'We have insurance protection and a dispute resolution process. Contact support immediately if an item isn\'t returned. We\'ll work with you to resolve the situation.'
        },
        {
          question: 'How do I report a problem?',
          answer: 'Use the "Contact Us" option in Help & Support, or call our support line for urgent issues. We have a dedicated team to help resolve problems quickly.'
        },
        {
          question: 'What verification is required?',
          answer: 'All users must verify their identity with a government-issued ID. Additional verification may be required for high-value items or certain transactions.'
        },
        {
          question: 'How do I block or report a user?',
          answer: 'You can block users through their profile or in the messaging section. To report inappropriate behavior, use the report function or contact support directly.'
        }
      ]
    }
  ];

  return (
    <View style={[{ flex: 1, backgroundColor: colors.gray[50] }, { paddingTop: insets.top }]}>
      <Header 
        title="FAQ" 
        showBackButton 
        onBackPress={() => router.back()} 
      />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: spacing.lg }}>
          {faqSections.map((section, sectionIndex) => (
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
                {section.items.map((item, itemIndex) => {
                  const itemId = `${sectionIndex}-${itemIndex}`;
                  const isExpanded = expandedItems.has(itemId);
                  
                  return (
                    <View
                      key={itemIndex}
                      style={{
                        borderBottomWidth: itemIndex < section.items.length - 1 ? 1 : 0,
                        borderBottomColor: colors.gray[100],
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => toggleExpanded(itemId)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingVertical: spacing.md,
                        }}
                      >
                        <Text style={{
                          fontSize: typography.sizes.base,
                          fontWeight: typography.weights.medium,
                          color: colors.gray[900],
                          flex: 1,
                          marginRight: spacing.sm,
                        }}>
                          {item.question}
                        </Text>
                        <Ionicons
                          name={isExpanded ? "chevron-up" : "chevron-down"}
                          size={20}
                          color={colors.gray[600]}
                        />
                      </TouchableOpacity>
                      
                      {isExpanded && (
                        <View style={{
                          paddingBottom: spacing.md,
                          paddingLeft: spacing.sm,
                        }}>
                          <Text style={{
                            fontSize: typography.sizes.sm,
                            color: colors.gray[600],
                            lineHeight: 20,
                          }}>
                            {item.answer}
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          ))}

          {/* Contact Support */}
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
              marginBottom: spacing.md,
            }}>
              Still need help?
            </Text>
            
            <Text style={{
              fontSize: typography.sizes.base,
              color: colors.gray[600],
              marginBottom: spacing.lg,
            }}>
              Can't find what you're looking for? Our support team is here to help.
            </Text>

            <TouchableOpacity
              onPress={() => router.push('/account/help-support')}
              style={{
                backgroundColor: colors.primary.main,
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.lg,
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{
                color: colors.white,
                fontSize: typography.sizes.base,
                fontWeight: typography.weights.semibold,
              }}>
                Contact Support
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
