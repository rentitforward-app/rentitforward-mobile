import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/components/AuthProvider';
import { supabase } from '../../src/lib/supabase';
// Temporary hardcoded values to fix the error
const colors = {
  white: '#FFFFFF',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  semantic: {
    error: '#EF4444',
  },
  info: '#3B82F6',
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
  },
  weights: {
    semibold: '600',
    bold: '700',
  },
};
import { Header } from '../../src/components/Header';

export default function AccountManagementScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user: currentUser, signOut } = useAuth();
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone and will remove all your data, listings, bookings, and messages.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => {
            setShowDeleteModal(true);
          },
        },
      ]
    );
  };

  const handleFinalDelete = async () => {
    if (deleteConfirmationText !== 'DELETE') {
      Alert.alert(
        'Invalid Confirmation',
        'Please type "DELETE" exactly as shown to confirm account deletion.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsDeletingAccount(true);
      setShowDeleteModal(false);
      await deleteUserAccount();
    } catch (error) {
      console.error('Account deletion error:', error);
      Alert.alert(
        'Error',
        'Failed to delete account. Please try again or contact support.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteConfirmationText('');
  };

  const deleteUserAccount = async () => {
    if (!currentUser?.id) {
      throw new Error('No user ID available');
    }

    try {
      // Get the current session to pass the auth token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('No valid session found');
      }

      // Call the Edge Function to delete the user account
      const { data, error } = await supabase.functions.invoke('delete-user-account', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to delete account');
      }

      // Show success message and redirect
      Alert.alert(
        'Account Deleted',
        'Your account has been permanently deleted. Thank you for using Rent It Forward.',
        [
          {
            text: 'OK',
            onPress: () => {
              // The user will be automatically signed out when the auth state changes
              router.replace('/(auth)/sign-in');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.gray[50] }}>
      <Header title="Account Management" />
      
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: spacing.lg }}>
          {/* Account Management Info */}
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
            <View style={{ padding: spacing.lg }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
                <Ionicons name="settings-outline" size={24} color={colors.gray[600]} />
                <Text style={{
                  fontSize: typography.sizes.lg,
                  fontWeight: typography.weights.semibold,
                  color: colors.gray[900],
                  marginLeft: spacing.sm,
                }}>
                  Account Management
                </Text>
              </View>
              
              <Text style={{
                fontSize: typography.sizes.base,
                color: colors.gray[600],
                lineHeight: 24,
                marginBottom: spacing.lg,
              }}>
                Manage your account settings and data. Use these options carefully as some actions cannot be undone.
              </Text>
            </View>
          </View>

          {/* Danger Zone */}
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
            <View style={{ padding: spacing.lg }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: spacing.md,
                paddingBottom: spacing.sm,
                borderBottomWidth: 2,
                borderBottomColor: colors.semantic.error,
              }}>
                <Ionicons name="warning-outline" size={24} color={colors.semantic.error} />
                <Text style={{
                  fontSize: typography.sizes.lg,
                  fontWeight: typography.weights.semibold,
                  color: colors.semantic.error,
                  marginLeft: spacing.sm,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}>
                  Danger Zone
                </Text>
              </View>
              
              <Text style={{
                fontSize: typography.sizes.sm,
                color: colors.gray[600],
                marginBottom: spacing.lg,
                lineHeight: 20,
              }}>
                The actions below are permanent and cannot be undone. Please proceed with caution.
              </Text>
              
              <TouchableOpacity
                onPress={() => handleDeleteAccount()}
                disabled={isDeletingAccount}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: spacing.md,
                  paddingHorizontal: spacing.md,
                  backgroundColor: colors.semantic.error + '08',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.semantic.error + '20',
                  opacity: isDeletingAccount ? 0.6 : 1,
                }}
              >
                {isDeletingAccount ? (
                  <ActivityIndicator size="small" color={colors.semantic.error} />
                ) : (
                  <Ionicons name="trash-outline" size={24} color={colors.semantic.error} />
                )}
                
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={{
                    fontSize: typography.sizes.base,
                    color: colors.semantic.error,
                    fontWeight: typography.weights.semibold,
                    marginBottom: spacing.xs / 2,
                  }}>
                    {isDeletingAccount ? 'Deleting Account...' : 'Delete Account'}
                  </Text>
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    color: colors.semantic.error,
                    opacity: 0.8,
                    lineHeight: 18,
                  }}>
                    {isDeletingAccount 
                      ? 'Please wait while we delete your account' 
                      : 'Permanently delete your account and all associated data'
                    }
                  </Text>
                </View>
                
                {!isDeletingAccount && (
                  <Ionicons name="chevron-forward" size={20} color={colors.semantic.error} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Additional Information */}
          <View style={{
            backgroundColor: colors.info + '10',
            borderRadius: 12,
            padding: spacing.lg,
            marginBottom: spacing.xl,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm }}>
              <Ionicons name="information-circle-outline" size={20} color={colors.info} />
              <Text style={{
                fontSize: typography.sizes.sm,
                fontWeight: typography.weights.semibold,
                color: colors.gray[800],
                marginLeft: spacing.sm,
                flex: 1,
              }}>
                Need Help?
              </Text>
            </View>
            
            <Text style={{
              fontSize: typography.sizes.sm,
              color: colors.gray[700],
              lineHeight: 20,
              marginBottom: spacing.sm,
            }}>
              If you're having issues with your account or need assistance, please contact our support team before deleting your account.
            </Text>
            
            <TouchableOpacity
              onPress={() => router.push('/account/contact-us')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                alignSelf: 'flex-start',
              }}
            >
              <Text style={{
                fontSize: typography.sizes.sm,
                color: colors.info,
                fontWeight: typography.weights.semibold,
                marginRight: spacing.xs,
              }}>
                Contact Support
              </Text>
              <Ionicons name="arrow-forward" size={16} color={colors.info} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Delete Account Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeDeleteModal}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: spacing.lg,
        }}>
          <View style={{
            backgroundColor: colors.white,
            borderRadius: 16,
            padding: spacing.xl,
            width: '100%',
            maxWidth: 400,
            shadowColor: colors.black,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 8,
          }}>
            {/* Modal Header */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: spacing.lg,
              paddingBottom: spacing.md,
              borderBottomWidth: 1,
              borderBottomColor: colors.semantic.error + '20',
            }}>
              <Ionicons name="warning" size={28} color={colors.semantic.error} />
              <Text style={{
                fontSize: typography.sizes.xl,
                fontWeight: typography.weights.bold,
                color: colors.semantic.error,
                marginLeft: spacing.sm,
                flex: 1,
              }}>
                Final Confirmation
              </Text>
            </View>

            {/* Warning Text */}
            <Text style={{
              fontSize: typography.sizes.base,
              color: colors.gray[700],
              lineHeight: 24,
              marginBottom: spacing.lg,
            }}>
              This is your final warning. Deleting your account will permanently remove:
            </Text>

            {/* List of what will be deleted */}
            <View style={{ marginBottom: spacing.lg }}>
              {[
                'Your profile and personal information',
                'All your listings',
                'All your booking history',
                'All your messages',
                'All your payment information'
              ].map((item, index) => (
                <View key={index} style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: spacing.xs,
                }}>
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    color: colors.semantic.error,
                    marginRight: spacing.sm,
                  }}>
                    •
                  </Text>
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    color: colors.gray[600],
                    flex: 1,
                  }}>
                    {item}
                  </Text>
                </View>
              ))}
            </View>

            <Text style={{
              fontSize: typography.sizes.base,
              fontWeight: typography.weights.semibold,
              color: colors.semantic.error,
              marginBottom: spacing.md,
            }}>
              This action CANNOT be undone.
            </Text>

            {/* Confirmation Input */}
            <View style={{ marginBottom: spacing.lg }}>
              <Text style={{
                fontSize: typography.sizes.sm,
                color: colors.gray[700],
                marginBottom: spacing.sm,
              }}>
                To confirm, please type <Text style={{ fontWeight: typography.weights.bold, color: colors.semantic.error }}>DELETE</Text> in the box below:
              </Text>
              
              <TextInput
                value={deleteConfirmationText}
                onChangeText={setDeleteConfirmationText}
                placeholder="Type DELETE here"
                style={{
                  borderWidth: 1,
                  borderColor: colors.gray[300],
                  borderRadius: 8,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  fontSize: typography.sizes.base,
                  backgroundColor: colors.white,
                }}
                autoCapitalize="characters"
                autoCorrect={false}
                placeholderTextColor={colors.gray[400]}
              />
            </View>

            {/* Modal Buttons */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: spacing.sm,
            }}>
              <TouchableOpacity
                onPress={closeDeleteModal}
                style={{
                  flex: 1,
                  paddingVertical: spacing.md,
                  paddingHorizontal: spacing.lg,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.gray[300],
                  backgroundColor: colors.white,
                }}
              >
                <Text style={{
                  fontSize: typography.sizes.base,
                  fontWeight: typography.weights.semibold,
                  color: colors.gray[700],
                  textAlign: 'center',
                }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleFinalDelete}
                disabled={deleteConfirmationText !== 'DELETE'}
                style={{
                  flex: 1,
                  paddingVertical: spacing.md,
                  paddingHorizontal: spacing.lg,
                  borderRadius: 8,
                  backgroundColor: deleteConfirmationText === 'DELETE' ? colors.semantic.error : colors.gray[300],
                }}
              >
                <Text style={{
                  fontSize: typography.sizes.base,
                  fontWeight: typography.weights.semibold,
                  color: colors.white,
                  textAlign: 'center',
                }}>
                  Delete Forever
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
