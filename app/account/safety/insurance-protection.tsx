import React, { useState } from 'react';
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
import { colors, spacing, typography } from '../../../src/lib/design-system';
import { Header } from '../../../src/components/Header';

export default function InsuranceProtectionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  const toggleSection = (index: number) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  const handleFileClaim = () => {
    const email = 'claims@rentitforward.com';
    const subject = 'Insurance Claim - Item Damage/Loss';
    const body = 'Hi Rent It Forward Claims Team,\n\nI need to file an insurance claim:\n\nBooking ID: \nItem: \nDescription of incident: \nDate of incident: \nPhotos attached: [Please attach photos]\n\nAdditional details: \n\n';
    
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open email client');
      }
    });
  };

  const handleContactClaims = () => {
    const email = 'claims@rentitforward.com';
    const subject = 'Insurance Inquiry';
    const body = 'Hi Rent It Forward Claims Team,\n\nI have a question about insurance coverage:\n\n';
    
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open email client');
      }
    });
  };

  const insuranceSections = [
    {
      title: 'What is Rent It Forward Insurance?',
      icon: 'shield-checkmark',
      content: 'Rent It Forward provides comprehensive insurance protection for all rentals on our platform. This coverage protects both item owners and renters against damage, loss, and liability issues that may occur during the rental period.',
      subsections: [
        {
          title: 'Coverage Scope',
          content: 'Our insurance covers physical damage to items, loss due to theft, and liability protection for both parties during the rental period.',
        },
        {
          title: 'Automatic Coverage',
          content: 'All legitimate rentals through our platform are automatically covered. No additional sign-up or payment is required.',
        },
        {
          title: 'Global Coverage',
          content: 'Insurance protection is available for rentals worldwide, subject to local laws and regulations.',
        },
      ],
    },
    {
      title: 'What is Covered?',
      icon: 'checkmark-circle',
      content: 'Our insurance policy provides comprehensive coverage for various scenarios that may occur during rentals.',
      subsections: [
        {
          title: 'Item Damage',
          content: 'Accidental damage to rented items, including scratches, dents, water damage, and other physical harm that occurs during normal use.',
        },
        {
          title: 'Loss or Theft',
          content: 'Items that are lost, stolen, or cannot be returned due to circumstances beyond the renter\'s control.',
        },
        {
          title: 'Liability Protection',
          content: 'Protection against third-party claims for bodily injury or property damage that occurs during the rental period.',
        },
        {
          title: 'Consequential Damages',
          content: 'Coverage for damages that result from the use of a damaged or defective rented item.',
        },
      ],
    },
    {
      title: 'Coverage Limits & Deductibles',
      icon: 'card',
      content: 'Understanding the financial aspects of our insurance coverage.',
      subsections: [
        {
          title: 'Coverage Limits',
          content: 'Up to $10,000 USD per rental for item damage and loss. Higher value items may require additional verification.',
        },
        {
          title: 'Deductible Structure',
          content: 'Standard deductible is $100 USD per claim. This amount is deducted from any claim payout.',
        },
        {
          title: 'Liability Coverage',
          content: 'Up to $1,000,000 USD in liability protection per incident for third-party claims.',
        },
        {
          title: 'Coverage Period',
          content: 'Coverage begins when payment is confirmed and ends when the item is returned in good condition.',
        },
      ],
    },
    {
      title: 'What is NOT Covered?',
      icon: 'close-circle',
      content: 'Important exclusions to understand about our insurance policy.',
      subsections: [
        {
          title: 'Intentional Damage',
          content: 'Damage caused intentionally or through gross negligence by the renter.',
        },
        {
          title: 'Pre-existing Damage',
          content: 'Damage that existed before the rental period began, unless documented and acknowledged.',
        },
        {
          title: 'Normal Wear and Tear',
          content: 'Expected deterioration that occurs through normal use of the item.',
        },
        {
          title: 'Prohibited Use',
          content: 'Damage resulting from use of items in ways not intended or explicitly prohibited.',
        },
        {
          title: 'Off-Platform Rentals',
          content: 'Any rental arrangements made outside of the Rent It Forward platform.',
        },
        {
          title: 'Illegal Activities',
          content: 'Damage or loss occurring during illegal activities or use of prohibited items.',
        },
      ],
    },
    {
      title: 'How to File a Claim',
      icon: 'document-text',
      content: 'Step-by-step process for filing an insurance claim.',
      subsections: [
        {
          title: 'Step 1: Document the Incident',
          content: 'Take clear photos of any damage and gather all relevant information about the incident.',
        },
        {
          title: 'Step 2: Report Immediately',
          content: 'Contact our claims team within 48 hours of discovering the damage or loss.',
        },
        {
          title: 'Step 3: Provide Information',
          content: 'Submit booking details, photos, and a detailed description of what happened.',
        },
        {
          title: 'Step 4: Investigation',
          content: 'Our team will investigate the claim and may request additional information.',
        },
        {
          title: 'Step 5: Resolution',
          content: 'Once approved, you\'ll receive compensation minus the deductible amount.',
        },
      ],
    },
    {
      title: 'Claims Process Timeline',
      icon: 'time',
      content: 'What to expect during the claims process.',
      subsections: [
        {
          title: 'Initial Response',
          content: 'We acknowledge receipt of your claim within 24 hours during business days.',
        },
        {
          title: 'Investigation Period',
          content: 'Most claims are investigated and resolved within 5-10 business days.',
        },
        {
          title: 'Complex Claims',
          content: 'Claims requiring additional investigation may take up to 30 days.',
        },
        {
          title: 'Payment Processing',
          content: 'Approved claims are processed within 3-5 business days after approval.',
        },
      ],
    },
    {
      title: 'Prevention & Best Practices',
      icon: 'bulb',
      content: 'Tips to prevent damage and ensure smooth rentals.',
      subsections: [
        {
          title: 'For Renters',
          content: 'Inspect items upon pickup, use items as intended, and return them in the same condition.',
        },
        {
          title: 'For Owners',
          content: 'Document item condition before rental, provide clear usage instructions, and maintain items properly.',
        },
        {
          title: 'Communication',
          content: 'Maintain open communication about item condition and any concerns during the rental period.',
        },
        {
          title: 'Documentation',
          content: 'Take photos before and after rental to document item condition.',
        },
      ],
    },
    {
      title: 'Emergency Procedures',
      icon: 'warning',
      content: 'What to do in emergency situations.',
      subsections: [
        {
          title: 'Injury or Accident',
          content: 'Call emergency services immediately and contact our support team as soon as possible.',
        },
        {
          title: 'Theft or Crime',
          content: 'File a police report immediately and contact our claims team within 24 hours.',
        },
        {
          title: 'Fire or Natural Disaster',
          content: 'Ensure safety first, contact emergency services, then report to our claims team.',
        },
        {
          title: '24/7 Support',
          content: 'Our emergency support line is available 24/7 for urgent claims and safety issues.',
        },
      ],
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.gray[50] }}>
      <Header 
        title="Insurance Protection" 
        showBackButton 
        onBackPress={() => router.back()} 
      />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: spacing.lg }}>
          {/* Introduction */}
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
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: spacing.md,
            }}>
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
              <Text style={{
                fontSize: typography.sizes.xl,
                fontWeight: typography.weights.bold,
                color: colors.gray[900],
                flex: 1,
              }}>
                Insurance Protection
              </Text>
            </View>
            <Text style={{
              fontSize: typography.sizes.base,
              color: colors.gray[600],
              lineHeight: 22,
            }}>
              Comprehensive protection for all your rentals. Every booking on Rent It Forward is automatically covered by our insurance policy, giving you peace of mind when sharing or renting items.
            </Text>
          </View>

          {/* Quick Actions */}
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
              Quick Actions
            </Text>

            <View style={{ gap: spacing.md }}>
              <TouchableOpacity
                onPress={handleFileClaim}
                style={{
                  backgroundColor: colors.semantic.error,
                  borderRadius: 8,
                  padding: spacing.md,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="document-text" size={20} color={colors.white} />
                <Text style={{
                  marginLeft: spacing.sm,
                  fontSize: typography.sizes.base,
                  fontWeight: typography.weights.semibold,
                  color: colors.white,
                }}>
                  File a Claim
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleContactClaims}
                style={{
                  backgroundColor: colors.primary.main,
                  borderRadius: 8,
                  padding: spacing.md,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="mail" size={20} color={colors.white} />
                <Text style={{
                  marginLeft: spacing.sm,
                  fontSize: typography.sizes.base,
                  fontWeight: typography.weights.semibold,
                  color: colors.white,
                }}>
                  Contact Claims Team
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Coverage Summary */}
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
              Coverage Summary
            </Text>

            <View style={{ gap: spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="checkmark-circle" size={20} color={colors.semantic.success} />
                <Text style={{
                  marginLeft: spacing.sm,
                  fontSize: typography.sizes.base,
                  color: colors.gray[700],
                }}>
                  Up to $10,000 item damage/loss coverage
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="checkmark-circle" size={20} color={colors.semantic.success} />
                <Text style={{
                  marginLeft: spacing.sm,
                  fontSize: typography.sizes.base,
                  color: colors.gray[700],
                }}>
                  $1,000,000 liability protection
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="checkmark-circle" size={20} color={colors.semantic.success} />
                <Text style={{
                  marginLeft: spacing.sm,
                  fontSize: typography.sizes.base,
                  color: colors.gray[700],
                }}>
                  $100 deductible per claim
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="checkmark-circle" size={20} color={colors.semantic.success} />
                <Text style={{
                  marginLeft: spacing.sm,
                  fontSize: typography.sizes.base,
                  color: colors.gray[700],
                }}>
                  24/7 claims support
                </Text>
              </View>
            </View>
          </View>

          {/* Detailed Sections */}
          {insuranceSections.map((section, index) => (
            <View
              key={index}
              style={{
                backgroundColor: colors.white,
                borderRadius: 12,
                marginBottom: spacing.lg,
                shadowColor: colors.black,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
                overflow: 'hidden',
              }}
            >
              <TouchableOpacity
                onPress={() => toggleSection(index)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.lg,
                  backgroundColor: colors.gray[50],
                }}
              >
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.primary.main + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: spacing.md,
                }}>
                  <Ionicons name={section.icon as any} size={20} color={colors.primary.main} />
                </View>
                <Text style={{
                  fontSize: typography.sizes.lg,
                  fontWeight: typography.weights.semibold,
                  color: colors.gray[900],
                  flex: 1,
                }}>
                  {section.title}
                </Text>
                <Ionicons 
                  name={expandedSection === index ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={colors.gray[600]} 
                />
              </TouchableOpacity>

              {expandedSection === index && (
                <View style={{ padding: spacing.lg }}>
                  <Text style={{
                    fontSize: typography.sizes.base,
                    color: colors.gray[700],
                    lineHeight: 22,
                    marginBottom: spacing.md,
                  }}>
                    {section.content}
                  </Text>

                  {section.subsections && section.subsections.map((subsection, subIndex) => (
                    <View key={subIndex} style={{ marginBottom: spacing.md }}>
                      <Text style={{
                        fontSize: typography.sizes.base,
                        fontWeight: typography.weights.semibold,
                        color: colors.gray[900],
                        marginBottom: spacing.sm,
                      }}>
                        {subsection.title}
                      </Text>
                      <Text style={{
                        fontSize: typography.sizes.sm,
                        color: colors.gray[600],
                        lineHeight: 20,
                      }}>
                        {subsection.content}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
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
              Contact Claims Team
            </Text>

            <View style={{ gap: spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="mail" size={20} color={colors.gray[600]} />
                <Text style={{
                  marginLeft: spacing.sm,
                  fontSize: typography.sizes.base,
                  color: colors.gray[900],
                }}>
                  claims@rentitforward.com
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="call" size={20} color={colors.gray[600]} />
                <Text style={{
                  marginLeft: spacing.sm,
                  fontSize: typography.sizes.base,
                  color: colors.gray[900],
                }}>
                  +61 2 1234 5678 (24/7 Emergency)
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="time" size={20} color={colors.gray[600]} />
                <Text style={{
                  marginLeft: spacing.sm,
                  fontSize: typography.sizes.base,
                  color: colors.gray[900],
                }}>
                  Claims: Mon-Fri 9AM-5PM AEST
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="warning" size={20} color={colors.gray[600]} />
                <Text style={{
                  marginLeft: spacing.sm,
                  fontSize: typography.sizes.base,
                  color: colors.gray[900],
                }}>
                  Emergency: 24/7 Support Available
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
