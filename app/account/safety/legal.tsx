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

export default function LegalScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  const toggleSection = (index: number) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  const handleContactLegal = () => {
    const email = 'legal@rentitforward.com';
    const subject = 'Legal Inquiry';
    const body = 'Hi Rent It Forward Legal Team,\n\nI have a legal question or concern:\n\n';
    
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open email client');
      }
    });
  };

  const handleReportLegalIssue = () => {
    const email = 'legal@rentitforward.com';
    const subject = 'Legal Issue Report';
    const body = 'Hi Rent It Forward Legal Team,\n\nI need to report a legal issue:\n\nDescription: \n\nAdditional details: \n\n';
    
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open email client');
      }
    });
  };

  const legalSections = [
    {
      title: 'Terms of Service',
      icon: 'document-text',
      content: 'Our Terms of Service govern your use of the Rent It Forward platform and services.',
      subsections: [
        {
          title: 'Acceptance of Terms',
          content: 'By using our platform, you agree to be bound by these terms and conditions. If you do not agree, please do not use our services.',
        },
        {
          title: 'User Responsibilities',
          content: 'Users must be at least 18 years old, provide accurate information, and comply with all applicable laws and regulations.',
        },
        {
          title: 'Platform Usage',
          content: 'You may only use our platform for lawful purposes and in accordance with our Community Guidelines.',
        },
        {
          title: 'Account Security',
          content: 'You are responsible for maintaining the security of your account and all activities that occur under your account.',
        },
        {
          title: 'Prohibited Activities',
          content: 'Users may not engage in fraud, harassment, illegal activities, or violate intellectual property rights.',
        },
        {
          title: 'Termination',
          content: 'We reserve the right to suspend or terminate accounts that violate these terms.',
        },
      ],
    },
    {
      title: 'Privacy Policy',
      icon: 'shield',
      content: 'We are committed to protecting your privacy and personal information.',
      subsections: [
        {
          title: 'Information We Collect',
          content: 'We collect information you provide directly, information from your use of our services, and information from third parties.',
        },
        {
          title: 'How We Use Information',
          content: 'We use your information to provide services, process transactions, communicate with you, and improve our platform.',
        },
        {
          title: 'Information Sharing',
          content: 'We may share your information with other users as necessary for transactions, with service providers, and as required by law.',
        },
        {
          title: 'Data Security',
          content: 'We implement appropriate security measures to protect your personal information against unauthorized access.',
        },
        {
          title: 'Your Rights',
          content: 'You have the right to access, update, or delete your personal information, subject to certain limitations.',
        },
        {
          title: 'Cookies and Tracking',
          content: 'We use cookies and similar technologies to enhance your experience and analyze platform usage.',
        },
      ],
    },
    {
      title: 'User Agreement',
      icon: 'people',
      content: 'The agreement between Rent It Forward and platform users.',
      subsections: [
        {
          title: 'Service Description',
          content: 'Rent It Forward provides a platform connecting item owners with renters for peer-to-peer rental transactions.',
        },
        {
          title: 'User Eligibility',
          content: 'Users must be at least 18 years old and have the legal capacity to enter into binding agreements.',
        },
        {
          title: 'Account Registration',
          content: 'Users must provide accurate, current, and complete information during registration and maintain updated information.',
        },
        {
          title: 'Verification Requirements',
          content: 'We may require identity verification, payment method verification, and other security checks.',
        },
        {
          title: 'User Conduct',
          content: 'Users must comply with all applicable laws, respect other users, and use the platform responsibly.',
        },
        {
          title: 'Dispute Resolution',
          content: 'Disputes between users should be resolved through our support system before legal action.',
        },
      ],
    },
    {
      title: 'Rental Agreement Terms',
      icon: 'contract',
      content: 'Terms specific to rental transactions on our platform.',
      subsections: [
        {
          title: 'Booking Confirmation',
          content: 'A rental is confirmed when payment is processed and both parties receive confirmation.',
        },
        {
          title: 'Item Condition',
          content: 'Items must be accurately described and in working condition unless otherwise stated.',
        },
        {
          title: 'Rental Period',
          content: 'Rentals are for the specified dates only. Extensions require mutual agreement.',
        },
        {
          title: 'Payment Terms',
          content: 'Payment is required in advance. Refunds are subject to cancellation policies.',
        },
        {
          title: 'Item Return',
          content: 'Items must be returned in the same condition as received, normal wear and tear excepted.',
        },
        {
          title: 'Damage and Loss',
          content: 'Users are responsible for damage beyond normal wear and tear, subject to insurance coverage.',
        },
      ],
    },
    {
      title: 'Intellectual Property',
      icon: 'copyright',
      content: 'Protection of intellectual property rights on our platform.',
      subsections: [
        {
          title: 'Platform Content',
          content: 'Rent It Forward owns all rights to the platform, including software, design, and content.',
        },
        {
          title: 'User Content',
          content: 'Users retain ownership of their content but grant us license to use it for platform operations.',
        },
        {
          title: 'Prohibited Content',
          content: 'Users may not post content that violates intellectual property rights of others.',
        },
        {
          title: 'Copyright Policy',
          content: 'We respect copyright laws and respond to valid takedown requests under the DMCA.',
        },
        {
          title: 'Trademark Usage',
          content: 'Users may not use Rent It Forward trademarks without written permission.',
        },
      ],
    },
    {
      title: 'Liability and Disclaimers',
      icon: 'warning',
      content: 'Limitations of liability and service disclaimers.',
      subsections: [
        {
          title: 'Service Availability',
          content: 'We provide services "as is" and do not guarantee uninterrupted or error-free operation.',
        },
        {
          title: 'User Transactions',
          content: 'We facilitate transactions but are not party to user agreements. Users interact at their own risk.',
        },
        {
          title: 'Limitation of Liability',
          content: 'Our liability is limited to the amount paid for our services in the 12 months preceding the claim.',
        },
        {
          title: 'Third-Party Services',
          content: 'We are not responsible for third-party services, websites, or content linked from our platform.',
        },
        {
          title: 'Force Majeure',
          content: 'We are not liable for delays or failures due to circumstances beyond our reasonable control.',
        },
      ],
    },
    {
      title: 'Payment and Financial Terms',
      icon: 'card',
      content: 'Terms related to payments, fees, and financial transactions.',
      subsections: [
        {
          title: 'Payment Processing',
          content: 'Payments are processed through secure third-party payment processors. We do not store payment card information.',
        },
        {
          title: 'Platform Fees',
          content: 'We charge a platform fee on successful transactions. Fees are clearly displayed before booking.',
        },
        {
          title: 'Refund Policy',
          content: 'Refunds are subject to our cancellation policy and may be processed for valid claims.',
        },
        {
          title: 'Currency and Taxes',
          content: 'All transactions are processed in the currency displayed. Users are responsible for applicable taxes.',
        },
        {
          title: 'Chargebacks and Disputes',
          content: 'Payment disputes should be resolved through our support system before initiating chargebacks.',
        },
      ],
    },
    {
      title: 'Data Protection and GDPR',
      icon: 'lock-closed',
      content: 'Our commitment to data protection and privacy rights.',
      subsections: [
        {
          title: 'GDPR Compliance',
          content: 'We comply with the General Data Protection Regulation (GDPR) for EU users.',
        },
        {
          title: 'Data Processing',
          content: 'We process personal data lawfully, fairly, and transparently for legitimate business purposes.',
        },
        {
          title: 'User Rights',
          content: 'Users have rights to access, rectification, erasure, portability, and restriction of processing.',
        },
        {
          title: 'Data Retention',
          content: 'We retain personal data only as long as necessary for the purposes for which it was collected.',
        },
        {
          title: 'Data Breach Notification',
          content: 'We will notify affected users and authorities of data breaches as required by law.',
        },
      ],
    },
    {
      title: 'Dispute Resolution',
      icon: 'scale',
      content: 'How disputes are handled on our platform.',
      subsections: [
        {
          title: 'Internal Resolution',
          content: 'We encourage users to resolve disputes through our support system before legal action.',
        },
        {
          title: 'Mediation Process',
          content: 'For complex disputes, we may offer mediation services to help reach resolution.',
        },
        {
          title: 'Arbitration Agreement',
          content: 'Disputes may be subject to binding arbitration as specified in our terms.',
        },
        {
          title: 'Class Action Waiver',
          content: 'Users agree to resolve disputes individually and waive the right to class action lawsuits.',
        },
        {
          title: 'Governing Law',
          content: 'These terms are governed by the laws of the jurisdiction where Rent It Forward is incorporated.',
        },
      ],
    },
    {
      title: 'Updates and Changes',
      icon: 'refresh',
      content: 'How we handle updates to our legal terms.',
      subsections: [
        {
          title: 'Notification of Changes',
          content: 'We will notify users of material changes to our terms through email or platform notifications.',
        },
        {
          title: 'Acceptance of Changes',
          content: 'Continued use of our platform after changes constitutes acceptance of the new terms.',
        },
        {
          title: 'Version Control',
          content: 'Previous versions of our terms are archived and available upon request.',
        },
        {
          title: 'Effective Date',
          content: 'Changes become effective on the date specified in the notification or 30 days after notification.',
        },
      ],
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.gray[50] }}>
      <Header 
        title="Legal Information" 
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
                backgroundColor: colors.semantic.info + '20',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: spacing.md,
              }}>
                <Ionicons name="document-text" size={24} color={colors.semantic.info} />
              </View>
              <Text style={{
                fontSize: typography.sizes.xl,
                fontWeight: typography.weights.bold,
                color: colors.gray[900],
                flex: 1,
              }}>
                Legal Information
              </Text>
            </View>
            <Text style={{
              fontSize: typography.sizes.base,
              color: colors.gray[600],
              lineHeight: 22,
            }}>
              Important legal information about using the Rent It Forward platform. Please review these terms carefully as they govern your use of our services and your rights and responsibilities as a user.
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
              Legal Support
            </Text>

            <View style={{ gap: spacing.md }}>
              <TouchableOpacity
                onPress={handleContactLegal}
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
                  Contact Legal Team
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleReportLegalIssue}
                style={{
                  backgroundColor: colors.semantic.warning,
                  borderRadius: 8,
                  padding: spacing.md,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="flag" size={20} color={colors.white} />
                <Text style={{
                  marginLeft: spacing.sm,
                  fontSize: typography.sizes.base,
                  fontWeight: typography.weights.semibold,
                  color: colors.white,
                }}>
                  Report Legal Issue
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Important Notice */}
          <View style={{
            backgroundColor: colors.semantic.warning + '10',
            borderRadius: 12,
            padding: spacing.lg,
            marginBottom: spacing.lg,
            borderLeftWidth: 4,
            borderLeftColor: colors.semantic.warning,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
              <Ionicons name="warning" size={20} color={colors.semantic.warning} />
              <Text style={{
                marginLeft: spacing.sm,
                fontSize: typography.sizes.base,
                fontWeight: typography.weights.semibold,
                color: colors.gray[900],
              }}>
                Important Notice
              </Text>
            </View>
            <Text style={{
              fontSize: typography.sizes.sm,
              color: colors.gray[700],
              lineHeight: 20,
            }}>
              This information is for general guidance only and does not constitute legal advice. For specific legal questions, please consult with a qualified attorney or contact our legal team.
            </Text>
          </View>

          {/* Legal Sections */}
          {legalSections.map((section, index) => (
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
              Legal Team Contact
            </Text>

            <View style={{ gap: spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="mail" size={20} color={colors.gray[600]} />
                <Text style={{
                  marginLeft: spacing.sm,
                  fontSize: typography.sizes.base,
                  color: colors.gray[900],
                }}>
                  legal@rentitforward.com
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="call" size={20} color={colors.gray[600]} />
                <Text style={{
                  marginLeft: spacing.sm,
                  fontSize: typography.sizes.base,
                  color: colors.gray[900],
                }}>
                  +61 2 1234 5679 (Legal Department)
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

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="business" size={20} color={colors.gray[600]} />
                <Text style={{
                  marginLeft: spacing.sm,
                  fontSize: typography.sizes.base,
                  color: colors.gray[900],
                }}>
                  Legal Department, Rent It Forward Pty Ltd
                </Text>
              </View>
            </View>
          </View>

          {/* Last Updated */}
          <View style={{
            backgroundColor: colors.gray[100],
            borderRadius: 8,
            padding: spacing.md,
            marginBottom: spacing.xl,
          }}>
            <Text style={{
              fontSize: typography.sizes.sm,
              color: colors.gray[600],
              textAlign: 'center',
            }}>
              Last updated: {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
