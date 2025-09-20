import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../../src/lib/design-system';
import { Header } from '../../../src/components/Header';

export default function SafetyIndexScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const safetyFeatures = [
    {
      title: 'Insurance Protection',
      description: 'Comprehensive coverage for all rentals with up to $10,000 protection',
      icon: 'shield-checkmark',
      color: colors.semantic.success,
      route: '/account/safety/insurance-protection',
      features: [
        'Automatic coverage for all rentals',
        'Up to $10,000 item damage/loss',
        '$1,000,000 liability protection',
        '24/7 claims support',
      ],
    },
    {
      title: 'Legal Information',
      description: 'Terms of service, privacy policy, and legal protections',
      icon: 'document-text',
      color: colors.semantic.info,
      route: '/account/safety/legal',
      features: [
        'Terms of Service',
        'Privacy Policy',
        'User Agreement',
        'Dispute Resolution',
      ],
    },
    {
      title: 'Community Guidelines',
      description: 'Rules and standards for our community',
      icon: 'people',
      color: colors.primary.main,
      route: '/account/community-guidelines',
      features: [
        'User responsibilities',
        'Safety guidelines',
        'Communication standards',
        'Violation reporting',
      ],
    },
  ];

  const safetyTips = [
    {
      title: 'Verify Before You Rent',
      description: 'Always verify item condition and owner identity before finalizing rentals.',
      icon: 'checkmark-circle',
    },
    {
      title: 'Meet in Safe Locations',
      description: 'Choose public, well-lit locations for item exchanges.',
      icon: 'location',
    },
    {
      title: 'Document Everything',
      description: 'Take photos before and after rental to document item condition.',
      icon: 'camera',
    },
    {
      title: 'Use Platform Payments',
      description: 'Always use our secure payment system for all transactions.',
      icon: 'card',
    },
    {
      title: 'Report Issues Immediately',
      description: 'Report any problems or violations to our support team right away.',
      icon: 'flag',
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.gray[50] }}>
      <Header 
        title="Safety & Legal" 
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
                Safety & Legal
              </Text>
            </View>
            <Text style={{
              fontSize: typography.sizes.base,
              color: colors.gray[600],
              lineHeight: 22,
            }}>
              Your safety and legal protection are our top priorities. Access comprehensive insurance coverage, legal information, and safety guidelines to ensure a secure experience on Rent It Forward.
            </Text>
          </View>

          {/* Main Safety Features */}
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
              Protection & Legal
            </Text>

            <View style={{ gap: spacing.md }}>
              {safetyFeatures.map((feature, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => router.push(feature.route)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: spacing.md,
                    backgroundColor: colors.gray[50],
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.gray[200],
                  }}
                >
                  <View style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: feature.color + '20',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: spacing.md,
                  }}>
                    <Ionicons name={feature.icon as any} size={24} color={feature.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: typography.sizes.base,
                      fontWeight: typography.weights.semibold,
                      color: colors.gray[900],
                      marginBottom: spacing.xs / 2,
                    }}>
                      {feature.title}
                    </Text>
                    <Text style={{
                      fontSize: typography.sizes.sm,
                      color: colors.gray[600],
                      lineHeight: 18,
                    }}>
                      {feature.description}
                    </Text>
                    <View style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      marginTop: spacing.xs,
                    }}>
                      {feature.features.slice(0, 2).map((item, idx) => (
                        <Text key={idx} style={{
                          fontSize: typography.sizes.xs,
                          color: colors.gray[500],
                          backgroundColor: colors.gray[100],
                          paddingHorizontal: spacing.xs,
                          paddingVertical: 2,
                          borderRadius: 4,
                          marginRight: spacing.xs,
                          marginTop: spacing.xs / 2,
                        }}>
                          {item}
                        </Text>
                      ))}
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Safety Tips */}
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
              Safety Tips
            </Text>

            <View style={{ gap: spacing.md }}>
              {safetyTips.map((tip, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    padding: spacing.md,
                    backgroundColor: colors.gray[50],
                    borderRadius: 8,
                    borderLeftWidth: 3,
                    borderLeftColor: colors.primary.main,
                  }}
                >
                  <View style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: colors.primary.main + '20',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: spacing.md,
                    marginTop: 2,
                  }}>
                    <Ionicons name={tip.icon as any} size={16} color={colors.primary.main} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: typography.sizes.base,
                      fontWeight: typography.weights.semibold,
                      color: colors.gray[900],
                      marginBottom: spacing.xs / 2,
                    }}>
                      {tip.title}
                    </Text>
                    <Text style={{
                      fontSize: typography.sizes.sm,
                      color: colors.gray[600],
                      lineHeight: 18,
                    }}>
                      {tip.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Emergency Contact */}
          <View style={{
            backgroundColor: colors.semantic.error + '10',
            borderRadius: 12,
            padding: spacing.lg,
            marginBottom: spacing.lg,
            borderWidth: 1,
            borderColor: colors.semantic.error + '30',
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: spacing.md,
            }}>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.semantic.error + '20',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: spacing.md,
              }}>
                <Ionicons name="call" size={20} color={colors.semantic.error} />
              </View>
              <Text style={{
                fontSize: typography.sizes.lg,
                fontWeight: typography.weights.semibold,
                color: colors.gray[900],
              }}>
                Emergency Support
              </Text>
            </View>
            <Text style={{
              fontSize: typography.sizes.base,
              color: colors.gray[700],
              marginBottom: spacing.md,
            }}>
              For urgent safety issues or emergency situations:
            </Text>
            <View style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="call" size={16} color={colors.semantic.error} />
                <Text style={{
                  marginLeft: spacing.sm,
                  fontSize: typography.sizes.base,
                  fontWeight: typography.weights.semibold,
                  color: colors.semantic.error,
                }}>
                  +61 2 1234 5678
                </Text>
                <Text style={{
                  marginLeft: spacing.sm,
                  fontSize: typography.sizes.sm,
                  color: colors.gray[600],
                }}>
                  (24/7 Emergency Line)
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="mail" size={16} color={colors.semantic.error} />
                <Text style={{
                  marginLeft: spacing.sm,
                  fontSize: typography.sizes.base,
                  color: colors.gray[700],
                }}>
                  emergency@rentitforward.com
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Links */}
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
              Quick Links
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
                onPress={() => router.push('/account/faq')}
                style={{ flexDirection: 'row', alignItems: 'center' }}
              >
                <Ionicons name="help" size={20} color={colors.primary.main} />
                <Text style={{
                  marginLeft: spacing.sm,
                  fontSize: typography.sizes.base,
                  color: colors.primary.main,
                  fontWeight: typography.weights.medium,
                }}>
                  Frequently Asked Questions
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
