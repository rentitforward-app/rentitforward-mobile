import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '../../../src/lib/design-system';

export default function StripeOnboardingSuccessScreen() {
  const router = useRouter();

  useEffect(() => {
    // Give user a moment to see the success message, then redirect
    const timer = setTimeout(() => {
      router.replace('/account/payment-options');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={{
      flex: 1,
      backgroundColor: colors.white,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    }}>
      <View style={{
        backgroundColor: colors.semantic.success + '20',
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
      }}>
        <Text style={{
          fontSize: 32,
          color: colors.semantic.success,
        }}>
          ✓
        </Text>
      </View>

      <Text style={{
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.gray[900],
        textAlign: 'center',
        marginBottom: spacing.md,
      }}>
        Setup Complete!
      </Text>

      <Text style={{
        fontSize: typography.sizes.base,
        color: colors.gray[600],
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: spacing.xl,
      }}>
        Your payment account has been successfully set up. You can now receive payments from renters.
      </Text>

      <ActivityIndicator size="small" color={colors.primary.main} />
      <Text style={{
        fontSize: typography.sizes.sm,
        color: colors.gray[500],
        marginTop: spacing.sm,
      }}>
        Redirecting...
      </Text>
    </View>
  );
}
