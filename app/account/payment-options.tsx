import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../src/lib/design-system';
import { Header } from '../../src/components/Header';

export default function PaymentOptionsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [actionLoading, setActionLoading] = useState(false);

  const handleOpenSettings = async () => {
    setActionLoading(true);
    try {
      // Simple redirect to web app settings with anchor to seller account section
      const webUrl = 'https://rentitforward.com.au/settings#seller-account';
      const canOpen = await Linking.canOpenURL(webUrl);
      if (canOpen) {
        await Linking.openURL(webUrl);
      } else {
        Alert.alert('Error', 'Cannot open web browser');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to open settings. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewTransactionHistory = () => {
    Alert.alert(
      'Transaction History',
      'Transaction history will be available soon.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.gray[50] }}>
      <Header 
        title="Payment Options" 
        showBackButton 
        onBackPress={() => router.back()} 
      />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: spacing.lg }}>

          {/* Seller Account */}
          <View style={{
            backgroundColor: colors.white,
            borderRadius: 12,
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
              paddingHorizontal: spacing.lg,
              paddingTop: spacing.lg,
              paddingBottom: spacing.md,
            }}>
              <Ionicons name="card-outline" size={24} color={colors.primary.main} />
              <Text style={{
                fontSize: typography.sizes.lg,
                fontWeight: typography.weights.semibold,
                color: colors.gray[900],
                marginLeft: spacing.sm,
              }}>
                Seller Account
              </Text>
            </View>
            
            <Text style={{
              fontSize: typography.sizes.sm,
              color: colors.gray[600],
              paddingHorizontal: spacing.lg,
              marginBottom: spacing.lg,
            }}>
              Required for receiving payments as a sharer
            </Text>

            <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
              <View style={{
                backgroundColor: colors.semantic.info + '10',
                padding: spacing.md,
                borderRadius: 8,
                marginBottom: spacing.md,
              }}>
                <Text style={{
                  fontSize: typography.sizes.sm,
                  fontWeight: typography.weights.medium,
                  color: colors.semantic.info,
                  marginBottom: spacing.sm,
                }}>
                  Manage Your Seller Account
                </Text>
                <Text style={{
                  fontSize: typography.sizes.sm,
                  color: colors.gray[600],
                  lineHeight: 18,
                }}>
                  Set up and manage your Stripe Connect account to receive payments from renters. All account management is handled through our web platform.
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleOpenSettings}
                disabled={actionLoading}
                style={{
                  backgroundColor: colors.primary.main,
                  paddingVertical: spacing.md,
                  paddingHorizontal: spacing.lg,
                  borderRadius: 8,
                  alignItems: 'center',
                  opacity: actionLoading ? 0.6 : 1,
                }}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={{
                    color: colors.white,
                    fontSize: typography.sizes.base,
                    fontWeight: typography.weights.semibold,
                  }}>
                    Open Settings
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Transaction History */}
          <View style={{
            backgroundColor: colors.white,
            borderRadius: 12,
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
              paddingHorizontal: spacing.lg,
              paddingTop: spacing.lg,
              paddingBottom: spacing.md,
            }}>
              Transaction History
            </Text>
            
            <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
              <TouchableOpacity
                onPress={handleViewTransactionHistory}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: spacing.md,
                }}
              >
                <Ionicons name="receipt-outline" size={24} color={colors.gray[600]} />
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={{
                    fontSize: typography.sizes.base,
                    color: colors.gray[900],
                  }}>
                    View All Transactions
                  </Text>
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    color: colors.gray[500],
                    marginTop: spacing.xs / 2,
                  }}>
                    See your payment and payout history
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Security Information */}
          <View style={{
            backgroundColor: colors.white,
            borderRadius: 12,
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
              paddingHorizontal: spacing.lg,
              paddingTop: spacing.lg,
              paddingBottom: spacing.md,
            }}>
              Security & Protection
            </Text>
            
            <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
              <View style={{
                backgroundColor: colors.semantic.success + '10',
                padding: spacing.md,
                borderRadius: 8,
                marginBottom: spacing.md,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                  <Ionicons name="shield-checkmark" size={20} color={colors.semantic.success} />
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    fontWeight: typography.weights.medium,
                    color: colors.semantic.success,
                    marginLeft: spacing.sm,
                  }}>
                    Secure Payments
                  </Text>
                </View>
                <Text style={{
                  fontSize: typography.sizes.sm,
                  color: colors.gray[600],
                  lineHeight: 18,
                }}>
                  All payments are processed securely through Stripe with bank-level encryption and fraud protection.
                </Text>
              </View>

              <View style={{
                backgroundColor: colors.semantic.success + '10',
                padding: spacing.md,
                borderRadius: 8,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                  <Ionicons name="lock-closed" size={20} color={colors.semantic.success} />
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    fontWeight: typography.weights.medium,
                    color: colors.semantic.success,
                    marginLeft: spacing.sm,
                  }}>
                    Data Protection
                  </Text>
                </View>
                <Text style={{
                  fontSize: typography.sizes.sm,
                  color: colors.gray[600],
                  lineHeight: 18,
                }}>
                  Your payment information is never stored on our servers. All sensitive data is handled securely by Stripe.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
