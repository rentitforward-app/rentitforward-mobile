import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../src/lib/design-system';
import { Header } from '../../src/components/Header';

export default function PaymentOptionsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleAddPaymentMethod = () => {
    Alert.alert(
      'Add Payment Method',
      'Payment method setup will be implemented with Stripe integration.',
      [{ text: 'OK' }]
    );
  };

  const handleManageStripeAccount = () => {
    Alert.alert(
      'Stripe Account',
      'Stripe account management will be implemented soon.',
      [{ text: 'OK' }]
    );
  };

  const handleViewTransactionHistory = () => {
    Alert.alert(
      'Transaction History',
      'Transaction history will be available soon.',
      [{ text: 'OK' }]
    );
  };

  const handleSetupPayouts = () => {
    Alert.alert(
      'Setup Payouts',
      'Payout setup will be implemented with Stripe Connect.',
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
          {/* Payment Methods */}
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
              Payment Methods
            </Text>
            
            <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
              <TouchableOpacity
                onPress={handleAddPaymentMethod}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: spacing.md,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.gray[100],
                }}
              >
                <Ionicons name="add-circle-outline" size={24} color={colors.primary.main} />
                <Text style={{
                  fontSize: typography.sizes.base,
                  color: colors.gray[900],
                  marginLeft: spacing.md,
                  flex: 1,
                }}>
                  Add Payment Method
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
              </TouchableOpacity>

              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: colors.gray[100],
              }}>
                <Ionicons name="card-outline" size={24} color={colors.gray[600]} />
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={{
                    fontSize: typography.sizes.base,
                    color: colors.gray[900],
                  }}>
                    **** **** **** 1234
                  </Text>
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    color: colors.gray[500],
                    marginTop: spacing.xs / 2,
                  }}>
                    Visa • Expires 12/25
                  </Text>
                </View>
                <TouchableOpacity
                  style={{
                    padding: spacing.sm,
                    borderRadius: 6,
                    backgroundColor: colors.gray[100],
                  }}
                >
                  <Ionicons name="pencil" size={16} color={colors.gray[600]} />
                </TouchableOpacity>
              </View>

              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: spacing.md,
              }}>
                <Ionicons name="card-outline" size={24} color={colors.gray[600]} />
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={{
                    fontSize: typography.sizes.base,
                    color: colors.gray[900],
                  }}>
                    **** **** **** 5678
                  </Text>
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    color: colors.gray[500],
                    marginTop: spacing.xs / 2,
                  }}>
                    Mastercard • Expires 08/26
                  </Text>
                </View>
                <TouchableOpacity
                  style={{
                    padding: spacing.sm,
                    borderRadius: 6,
                    backgroundColor: colors.gray[100],
                  }}
                >
                  <Ionicons name="pencil" size={16} color={colors.gray[600]} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Stripe Connect */}
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
              Stripe Connect
            </Text>
            
            <Text style={{
              fontSize: typography.sizes.sm,
              color: colors.gray[600],
              paddingHorizontal: spacing.lg,
              marginBottom: spacing.lg,
            }}>
              Manage your Stripe account for receiving payments
            </Text>

            <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
              <TouchableOpacity
                onPress={handleSetupPayouts}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: spacing.md,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.gray[100],
                }}
              >
                <Ionicons name="wallet-outline" size={24} color={colors.gray[600]} />
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={{
                    fontSize: typography.sizes.base,
                    color: colors.gray[900],
                  }}>
                    Setup Payouts
                  </Text>
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    color: colors.gray[500],
                    marginTop: spacing.xs / 2,
                  }}>
                    Configure how you receive payments
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleManageStripeAccount}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: spacing.md,
                }}
              >
                <Ionicons name="settings-outline" size={24} color={colors.gray[600]} />
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={{
                    fontSize: typography.sizes.base,
                    color: colors.gray[900],
                  }}>
                    Manage Account
                  </Text>
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    color: colors.gray[500],
                    marginTop: spacing.xs / 2,
                  }}>
                    Update tax information and bank details
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
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

          {/* Payment Information */}
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
              Payment Information
            </Text>
            
            <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
              <View style={{
                backgroundColor: colors.semantic.info + '10',
                padding: spacing.md,
                borderRadius: 8,
                marginBottom: spacing.md,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                  <Ionicons name="information-circle" size={20} color={colors.semantic.info} />
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    fontWeight: typography.weights.medium,
                    color: colors.semantic.info,
                    marginLeft: spacing.sm,
                  }}>
                    Platform Fees
                  </Text>
                </View>
                <Text style={{
                  fontSize: typography.sizes.sm,
                  color: colors.gray[600],
                  lineHeight: 18,
                }}>
                  Rent It Forward charges a 3% platform fee on successful rentals. This covers payment processing, insurance, and platform maintenance.
                </Text>
              </View>

              <View style={{
                backgroundColor: colors.semantic.success + '10',
                padding: spacing.md,
                borderRadius: 8,
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
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
