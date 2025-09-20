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

export default function CommunityGuidelinesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleReportViolation = () => {
    const email = 'support@rentitforward.com.au';
    const subject = 'Community Guidelines Violation Report';
    const body = 'Hi Rent It Forward Safety Team,\n\nI would like to report a violation of the Community Guidelines:\n\nUser/Listing ID: \nDescription of violation: \nAdditional details: \n\n';
    
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open email client');
      }
    });
  };

  const guidelines = [
    {
      title: 'Welcome to Rent It Forward',
      content: 'Rent It Forward is a peer-to-peer rental marketplace that connects people who want to rent items with those who have items to share. Our community is built on trust, respect, and mutual benefit. These guidelines help ensure a safe, positive experience for everyone.',
      icon: 'heart',
    },
    {
      title: 'Core Principles',
      content: 'Our platform operates on three fundamental principles that guide all interactions:',
      icon: 'star',
      subsections: [
        {
          title: 'Trust & Safety',
          content: 'We prioritize the safety and security of all users. This means being honest, reliable, and respectful in all interactions.',
        },
        {
          title: 'Mutual Respect',
          content: 'Treat others as you would like to be treated. Respect different backgrounds, opinions, and circumstances.',
        },
        {
          title: 'Shared Responsibility',
          content: 'We all play a role in maintaining a positive community. Report issues, help others, and contribute to a welcoming environment.',
        },
      ],
    },
    {
      title: 'User Responsibilities',
      content: 'As a member of our community, you are responsible for:',
      icon: 'people',
      subsections: [
        {
          title: 'Accurate Information',
          content: 'Provide truthful information about yourself, your items, and your rental needs. Use real photos and honest descriptions.',
        },
        {
          title: 'Timely Communication',
          content: 'Respond to messages promptly and keep others informed about changes to bookings or item availability.',
        },
        {
          title: 'Item Care',
          content: 'Treat rented items with care and return them in the same condition you received them. Report any pre-existing damage immediately.',
        },
        {
          title: 'Payment Integrity',
          content: 'Pay for rentals on time and in full. Don\'t attempt to circumvent platform fees or engage in off-platform transactions.',
        },
      ],
    },
    {
      title: 'Prohibited Items',
      content: 'The following items are strictly prohibited on our platform:',
      icon: 'warning',
      subsections: [
        {
          title: 'Illegal Items',
          content: 'Weapons, drugs, stolen goods, or any items that violate local, state, or federal laws.',
        },
        {
          title: 'Dangerous Items',
          content: 'Explosives, hazardous materials, or items that pose a safety risk to users or the public.',
        },
        {
          title: 'Personal Items',
          content: 'Underwear, personal hygiene items, or other intimate personal belongings.',
        },
        {
          title: 'Regulated Items',
          content: 'Prescription medications, alcohol (where prohibited), or items requiring special licenses you don\'t possess.',
        },
      ],
    },
    {
      title: 'Communication Guidelines',
      content: 'When communicating with other users, please:',
      icon: 'chatbubbles',
      subsections: [
        {
          title: 'Be Respectful',
          content: 'Use polite language and avoid offensive, discriminatory, or harassing comments.',
        },
        {
          title: 'Stay On-Topic',
          content: 'Keep conversations focused on the rental transaction. Avoid personal topics or unsolicited messages.',
        },
        {
          title: 'Be Professional',
          content: 'Maintain a business-like tone while being friendly and approachable.',
        },
        {
          title: 'Respect Privacy',
          content: 'Don\'t ask for personal information beyond what\'s necessary for the rental transaction.',
        },
      ],
    },
    {
      title: 'Safety Guidelines',
      content: 'Your safety is our priority. Follow these guidelines:',
      icon: 'shield-checkmark',
      subsections: [
        {
          title: 'Meet in Safe Locations',
          content: 'Choose public, well-lit locations for item exchanges. Consider meeting at police stations or busy shopping centers.',
        },
        {
          title: 'Bring a Friend',
          content: 'Consider bringing someone with you for item exchanges, especially for high-value items or first-time meetings.',
        },
        {
          title: 'Trust Your Instincts',
          content: 'If something feels wrong, trust your gut. You can always cancel a transaction if you feel unsafe.',
        },
        {
          title: 'Document Everything',
          content: 'Take photos of items before and after rental. Keep records of all communications and transactions.',
        },
      ],
    },
    {
      title: 'Payment & Transaction Rules',
      content: 'To maintain platform integrity, please:',
      icon: 'card',
      subsections: [
        {
          title: 'Use Platform Payments',
          content: 'All payments must go through our secure platform. Never arrange off-platform payments.',
        },
        {
          title: 'No Fee Avoidance',
          content: 'Don\'t attempt to circumvent platform fees or arrange payments outside the system.',
        },
        {
          title: 'Honest Pricing',
          content: 'Set fair, market-appropriate prices. Don\'t engage in price gouging or deceptive pricing.',
        },
        {
          title: 'Prompt Payments',
          content: 'Pay for rentals on time. Late payments may result in account restrictions.',
        },
      ],
    },
    {
      title: 'Content & Media Guidelines',
      content: 'When creating listings and sharing content:',
      icon: 'images',
      subsections: [
        {
          title: 'Accurate Photos',
          content: 'Use clear, recent photos that accurately represent the item\'s current condition.',
        },
        {
          title: 'Appropriate Content',
          content: 'No offensive, inappropriate, or misleading images or descriptions.',
        },
        {
          title: 'Original Content',
          content: 'Use your own photos and descriptions. Don\'t copy content from other listings.',
        },
        {
          title: 'Complete Information',
          content: 'Provide detailed descriptions, including any flaws, limitations, or special requirements.',
        },
      ],
    },
    {
      title: 'Dispute Resolution',
      content: 'If you encounter issues:',
      icon: 'scale',
      subsections: [
        {
          title: 'Communicate First',
          content: 'Try to resolve issues directly with the other party through respectful communication.',
        },
        {
          title: 'Document Everything',
          content: 'Keep records of all communications, photos, and transaction details.',
        },
        {
          title: 'Use Our Support',
          content: 'Contact our support team if you can\'t resolve issues directly. We\'re here to help.',
        },
        {
          title: 'Be Patient',
          content: 'Dispute resolution takes time. Provide all requested information promptly.',
        },
      ],
    },
    {
      title: 'Consequences of Violations',
      content: 'Violations of these guidelines may result in:',
      icon: 'alert-circle',
      subsections: [
        {
          title: 'Warning',
          content: 'First-time minor violations may result in a warning and education about the guidelines.',
        },
        {
          title: 'Account Restrictions',
          content: 'Repeated violations may lead to temporary restrictions on listing or booking capabilities.',
        },
        {
          title: 'Account Suspension',
          content: 'Serious violations may result in temporary account suspension.',
        },
        {
          title: 'Account Termination',
          content: 'Severe or repeated violations may result in permanent account termination.',
        },
      ],
    },
    {
      title: 'Reporting Violations',
      content: 'Help us maintain a safe community by reporting violations:',
      icon: 'flag',
      subsections: [
        {
          title: 'What to Report',
          content: 'Report any behavior that violates these guidelines, including harassment, fraud, safety concerns, or inappropriate content.',
        },
        {
          title: 'How to Report',
          content: 'Use the report button on listings or profiles, or contact our safety team directly.',
        },
        {
          title: 'Anonymous Reporting',
          content: 'You can report violations anonymously. We investigate all reports thoroughly.',
        },
        {
          title: 'False Reports',
          content: 'False or malicious reports may result in consequences for the reporter.',
        },
      ],
    },
    {
      title: 'Privacy & Data Protection',
      content: 'We respect your privacy and protect your data:',
      icon: 'lock-closed',
      subsections: [
        {
          title: 'Data Security',
          content: 'We use bank-level encryption and security measures to protect your personal information.',
        },
        {
          title: 'Limited Sharing',
          content: 'We only share necessary information with other users for legitimate rental purposes.',
        },
        {
          title: 'Your Control',
          content: 'You control what information is visible to other users in your profile and listings.',
        },
        {
          title: 'Data Retention',
          content: 'We retain transaction data as required by law and for platform safety, but respect your privacy rights.',
        },
      ],
    },
    {
      title: 'Community Moderation',
      content: 'Our moderation approach:',
      icon: 'people-circle',
      subsections: [
        {
          title: 'Proactive Monitoring',
          content: 'We use automated systems and human moderators to identify potential violations.',
        },
        {
          title: 'User Reports',
          content: 'Community reports help us identify and address issues quickly.',
        },
        {
          title: 'Fair Process',
          content: 'All moderation decisions follow a fair process with opportunities for appeal.',
        },
        {
          title: 'Continuous Improvement',
          content: 'We regularly review and update our guidelines based on community feedback and evolving needs.',
        },
      ],
    },
    {
      title: 'Updates to Guidelines',
      content: 'These guidelines may be updated to reflect changes in our platform or community needs. We will notify users of significant changes.',
      icon: 'refresh',
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.gray[50] }}>
      <Header 
        title="Community Guidelines" 
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
            <Text style={{
              fontSize: typography.sizes.xl,
              fontWeight: typography.weights.bold,
              color: colors.gray[900],
              marginBottom: spacing.md,
              textAlign: 'center',
            }}>
              Community Guidelines
            </Text>
            <Text style={{
              fontSize: typography.sizes.base,
              color: colors.gray[600],
              lineHeight: 24,
              textAlign: 'center',
            }}>
              Help us build a safe, trustworthy, and respectful community for everyone
            </Text>
          </View>

          {/* Report Violation Button */}
          <TouchableOpacity
            onPress={handleReportViolation}
            style={{
              backgroundColor: colors.semantic.error,
              borderRadius: 12,
              padding: spacing.lg,
              marginBottom: spacing.lg,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: colors.black,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Ionicons name="flag" size={24} color={colors.white} />
            <Text style={{
              marginLeft: spacing.sm,
              fontSize: typography.sizes.base,
              fontWeight: typography.weights.semibold,
              color: colors.white,
            }}>
              Report a Violation
            </Text>
          </TouchableOpacity>

          {/* Guidelines Content */}
          {guidelines.map((guideline, index) => (
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
              }}
            >
              {/* Guideline Header */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: spacing.lg,
                paddingTop: spacing.lg,
                paddingBottom: spacing.md,
              }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.primary.main + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: spacing.md,
                }}>
                  <Ionicons name={guideline.icon as any} size={20} color={colors.primary.main} />
                </View>
                <Text style={{
                  fontSize: typography.sizes.lg,
                  fontWeight: typography.weights.semibold,
                  color: colors.gray[900],
                  flex: 1,
                }}>
                  {guideline.title}
                </Text>
              </View>

              {/* Guideline Content */}
              <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
                <Text style={{
                  fontSize: typography.sizes.base,
                  color: colors.gray[700],
                  lineHeight: 22,
                  marginBottom: guideline.subsections ? spacing.md : 0,
                }}>
                  {guideline.content}
                </Text>

                {/* Subsections */}
                {guideline.subsections && guideline.subsections.map((subsection, subIndex) => (
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
              Need Help?
            </Text>

            <View style={{ gap: spacing.md }}>
              <TouchableOpacity
                onPress={() => router.push('/account/help-support')}
                style={{ flexDirection: 'row', alignItems: 'center' }}
              >
                <Ionicons name="help-circle" size={20} color={colors.primary.main} />
                <Text style={{
                  marginLeft: spacing.sm,
                  fontSize: typography.sizes.base,
                  color: colors.primary.main,
                  fontWeight: typography.weights.medium,
                }}>
                  Help & Support
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/account/contact-us')}
                style={{ flexDirection: 'row', alignItems: 'center' }}
              >
                <Ionicons name="mail" size={20} color={colors.primary.main} />
                <Text style={{
                  marginLeft: spacing.sm,
                  fontSize: typography.sizes.base,
                  color: colors.primary.main,
                  fontWeight: typography.weights.medium,
                }}>
                  Contact Us
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleReportViolation}
                style={{ flexDirection: 'row', alignItems: 'center' }}
              >
                <Ionicons name="flag" size={20} color={colors.semantic.error} />
                <Text style={{
                  marginLeft: spacing.sm,
                  fontSize: typography.sizes.base,
                  color: colors.semantic.error,
                  fontWeight: typography.weights.medium,
                }}>
                  Report Safety Issue
                </Text>
              </TouchableOpacity>
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
