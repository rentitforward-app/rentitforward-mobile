import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../src/lib/design-system';
import { Header } from '../../src/components/Header';
import { supabase } from '../../src/lib/supabase';

interface AccountStatus {
  has_account: boolean;
  onboarding_completed: boolean;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  requirements: string[];
  payout_methods: Array<{
    id: string;
    type: string;
    last4: string;
    bank_name?: string;
    currency: string;
    default_for_currency: boolean;
  }>;
  recent_payouts: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    arrival_date: number;
    created: number;
  }>;
  payout_schedule: {
    interval: string;
    delay_days?: number;
  } | null;
}

export default function PaymentOptionsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAccountStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('https://rentitforward.com.au/api/mobile/stripe/account-status', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAccountStatus(data);
      } else {
        console.error('Failed to fetch account status');
      }
    } catch (error) {
      console.error('Error fetching account status:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAccountStatus();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAccountStatus();
  };

  const handleStartOnboarding = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      setActionLoading(true);

      const response = await fetch('https://rentitforward.com.au/api/mobile/stripe/create-onboarding-link', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        await Linking.openURL(data.url);
      } else {
        Alert.alert('Error', 'Failed to create onboarding link');
      }
    } catch (error) {
      console.error('Error starting onboarding:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefreshOnboarding = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      setActionLoading(true);

      const response = await fetch('https://rentitforward.com.au/api/mobile/stripe/refresh-onboarding', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        await Linking.openURL(data.url);
      } else {
        Alert.alert('Error', 'Failed to refresh onboarding link');
      }
    } catch (error) {
      console.error('Error refreshing onboarding:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleManagePayouts = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      setActionLoading(true);

      const response = await fetch('https://rentitforward.com.au/api/mobile/stripe/login-link', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        await Linking.openURL(data.url);
      } else {
        Alert.alert('Error', 'Failed to create dashboard link');
      }
    } catch (error) {
      console.error('Error creating dashboard link:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = () => {
    if (!accountStatus?.has_account) return colors.gray[500];
    if (!accountStatus.onboarding_completed) return colors.semantic.warning;
    if (accountStatus.requirements.length > 0) return colors.semantic.warning;
    return colors.semantic.success;
  };

  const getStatusText = () => {
    if (!accountStatus?.has_account) return 'Not Set Up';
    if (!accountStatus.onboarding_completed) return 'Setup Required';
    if (accountStatus.requirements.length > 0) return 'Action Required';
    return 'Active';
  };

  const getStatusIcon = () => {
    if (!accountStatus?.has_account) return 'alert-circle-outline';
    if (!accountStatus.onboarding_completed) return 'time-outline';
    if (accountStatus.requirements.length > 0) return 'warning-outline';
    return 'checkmark-circle-outline';
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.gray[50] }}>
        <Header 
          title="Payment Options" 
          showBackButton 
          onBackPress={() => router.back()} 
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={{ 
            marginTop: spacing.md, 
            color: colors.gray[600],
            fontSize: typography.sizes.base 
          }}>
            Loading account status...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.gray[50] }}>
      <Header 
        title="Payment Options" 
        showBackButton 
        onBackPress={() => router.back()} 
      />

      <ScrollView 
        style={{ flex: 1 }} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={{ padding: spacing.lg }}>

          {/* Account Status */}
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
              justifyContent: 'space-between',
              paddingHorizontal: spacing.lg,
              paddingTop: spacing.lg,
              paddingBottom: spacing.md,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="card-outline" size={24} color={colors.primary.main} />
                <Text style={{
                  fontSize: typography.sizes.lg,
                  fontWeight: typography.weights.semibold,
                  color: colors.gray[900],
                  marginLeft: spacing.sm,
                }}>
                  Owner Account
                </Text>
              </View>
              
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center',
                backgroundColor: getStatusColor() + '20',
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xs,
                borderRadius: 16,
              }}>
                <Ionicons name={getStatusIcon()} size={16} color={getStatusColor()} />
                <Text style={{
                  fontSize: typography.sizes.sm,
                  fontWeight: typography.weights.medium,
                  color: getStatusColor(),
                  marginLeft: spacing.xs,
                }}>
                  {getStatusText()}
                </Text>
              </View>
            </View>
            
            <Text style={{
              fontSize: typography.sizes.sm,
              color: colors.gray[600],
              paddingHorizontal: spacing.lg,
              marginBottom: spacing.lg,
            }}>
              Required for receiving payments for owner / sharer
            </Text>

            <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
              {!accountStatus?.has_account || !accountStatus.onboarding_completed ? (
                <>
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
                      {!accountStatus?.has_account ? 'Setup Required' : 'Complete Your Setup'}
                    </Text>
                    <Text style={{
                      fontSize: typography.sizes.sm,
                      color: colors.gray[600],
                      lineHeight: 18,
                    }}>
                      {!accountStatus?.has_account 
                        ? 'Create your Stripe Connect account to start receiving payments from renters.'
                        : 'Complete your account setup to start receiving payments.'
                      }
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={!accountStatus?.has_account ? handleStartOnboarding : handleRefreshOnboarding}
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
                        {!accountStatus?.has_account ? 'Start Setup' : 'Complete Setup'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  {/* Account Details */}
                  <View style={{
                    backgroundColor: colors.semantic.success + '10',
                    padding: spacing.md,
                    borderRadius: 8,
                    marginBottom: spacing.md,
                  }}>
                    <Text style={{
                      fontSize: typography.sizes.sm,
                      fontWeight: typography.weights.medium,
                      color: colors.semantic.success,
                      marginBottom: spacing.sm,
                    }}>
                      Account Active
                    </Text>
                    <Text style={{
                      fontSize: typography.sizes.sm,
                      color: colors.gray[600],
                      lineHeight: 18,
                    }}>
                      Your account is set up and ready to receive payments.
                    </Text>
                  </View>

                  {/* Payout Methods */}
                  {accountStatus.payout_methods.length > 0 && (
                    <View style={{ marginBottom: spacing.md }}>
                      <Text style={{
                        fontSize: typography.sizes.sm,
                        fontWeight: typography.weights.medium,
                        color: colors.gray[900],
                        marginBottom: spacing.sm,
                      }}>
                        Payout Method
                      </Text>
                      {accountStatus.payout_methods.map((method) => (
                        <View key={method.id} style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: colors.gray[50],
                          padding: spacing.sm,
                          borderRadius: 8,
                          marginBottom: spacing.xs,
                        }}>
                          <Ionicons 
                            name={method.type === 'bank_account' ? 'card-outline' : 'card'} 
                            size={20} 
                            color={colors.gray[600]} 
                          />
                          <Text style={{
                            fontSize: typography.sizes.sm,
                            color: colors.gray[900],
                            marginLeft: spacing.sm,
                          }}>
                            {method.bank_name || 'Bank Account'} •••• {method.last4}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Recent Payouts */}
                  {accountStatus.recent_payouts.length > 0 && (
                    <View style={{ marginBottom: spacing.md }}>
                      <Text style={{
                        fontSize: typography.sizes.sm,
                        fontWeight: typography.weights.medium,
                        color: colors.gray[900],
                        marginBottom: spacing.sm,
                      }}>
                        Recent Payouts
                      </Text>
                      {accountStatus.recent_payouts.slice(0, 3).map((payout) => (
                        <View key={payout.id} style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          backgroundColor: colors.gray[50],
                          padding: spacing.sm,
                          borderRadius: 8,
                          marginBottom: spacing.xs,
                        }}>
                          <Text style={{
                            fontSize: typography.sizes.sm,
                            color: colors.gray[900],
                          }}>
                            ${payout.amount.toFixed(2)} {payout.currency.toUpperCase()}
                          </Text>
                          <Text style={{
                            fontSize: typography.sizes.xs,
                            color: colors.gray[500],
                          }}>
                            {payout.status}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <TouchableOpacity
                    onPress={handleManagePayouts}
                    disabled={actionLoading}
                    style={{
                      backgroundColor: colors.white,
                      borderWidth: 1,
                      borderColor: colors.primary.main,
                      paddingVertical: spacing.md,
                      paddingHorizontal: spacing.lg,
                      borderRadius: 8,
                      alignItems: 'center',
                      opacity: actionLoading ? 0.6 : 1,
                    }}
                  >
                    {actionLoading ? (
                      <ActivityIndicator size="small" color={colors.primary.main} />
                    ) : (
                      <Text style={{
                        color: colors.primary.main,
                        fontSize: typography.sizes.base,
                        fontWeight: typography.weights.semibold,
                      }}>
                        Manage Payout Details
                      </Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
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