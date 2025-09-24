import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/components/AuthProvider';
import { supabase } from '../../src/lib/supabase';
import { colors, spacing, typography } from '../../src/lib/design-system';
import { Header } from '../../src/components/Header';
import { useNotificationCount } from '../../src/hooks/useNotificationBadge';
import { NotificationBadge } from '../../src/components/NotificationBadge';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  bio?: string;
  avatar_url?: string;
  address?: string;
  city?: string;
  state?: string;
  verified: boolean;
  stripe_onboarded: boolean;
  created_at: string;
  trust_score?: number;
  completion_rate?: number;
}

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user: currentUser, profile: existingProfile, signOut } = useAuth();
  const { count: notificationCount } = useNotificationCount();

  // Use existing profile from auth context or fetch if needed
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) throw new Error('No user ID');
      
      // If we already have a profile from auth context, use it
      if (existingProfile) {
        const enhancedProfile: UserProfile = {
          ...existingProfile,
          verified: existingProfile.verified || false,
          stripe_onboarded: false, // Default value, should be fetched from database
          trust_score: 87,
          completion_rate: 94
        };
        return enhancedProfile;
      }
      
      // Otherwise fetch from database
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();
      
      if (error) throw error;

      const enhancedProfile: UserProfile = {
        ...data,
        trust_score: 87,
        completion_rate: 94
      };

      return enhancedProfile;
    },
    enabled: !!currentUser?.id,
    initialData: existingProfile ? {
      ...existingProfile,
      verified: existingProfile.verified || false,
      stripe_onboarded: false,
      trust_score: 87,
      completion_rate: 94
    } : undefined,
  });

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('User confirmed sign out from account screen');
              await signOut();
            } catch (error) {
              console.error('Sign out error from account screen:', error);
              // Error handling is already done in AuthProvider.signOut()
            }
          },
        },
      ]
    );
  };


  const getTrustScoreColor = (score: number) => {
    if (score >= 90) return colors.semantic.success;
    if (score >= 70) return colors.semantic.warning;
    return colors.semantic.error;
  };

  const getTrustScoreBadge = (score: number) => {
    if (score >= 90) return { text: 'Excellent', color: colors.semantic.success };
    if (score >= 70) return { text: 'Good', color: colors.semantic.warning };
    return { text: 'Needs Improvement', color: colors.semantic.error };
  };

  // If no user is authenticated, show sign-in prompt
  if (!currentUser) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.gray[50] }}>
        <Header title="Account" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg }}>
          <Text style={{ fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold, color: colors.text.primary, marginBottom: spacing.sm }}>
            Please Sign In
          </Text>
          <Text style={{ fontSize: typography.sizes.base, color: colors.text.secondary, marginBottom: spacing.xl }}>
            Sign in to view your account
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: colors.primary.main,
              paddingHorizontal: spacing.xl,
              paddingVertical: spacing.md,
              borderRadius: 8,
            }}
            onPress={() => router.push('/(auth)/sign-in')}
          >
            <Text style={{ color: colors.white, fontWeight: typography.weights.semibold }}>
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.gray[50] }}>
        <Header title="Account" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={{ marginTop: spacing.md, color: colors.gray[600] }}>Loading account...</Text>
        </View>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.gray[50] }}>
        <Header title="Account" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg }}>
          <Text style={{ fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.gray[900], marginBottom: spacing.sm }}>
            Profile not found
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: colors.primary.main,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              borderRadius: 8,
            }}
            onPress={() => router.back()}
          >
            <Text style={{ color: colors.white, fontWeight: typography.weights.semibold }}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.gray[50] }}>
      <Header title="Account" />
      
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Profile Header Section */}
        <View style={{
          backgroundColor: colors.primary.main,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.xl,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg }}>
            {/* Avatar */}
            <View style={{ marginRight: spacing.md }}>
              {profile.avatar_url ? (
                <Image
                  source={{ uri: profile.avatar_url }}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    borderWidth: 3,
                    borderColor: colors.white,
                  }}
                />
              ) : (
                <View style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: colors.white,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 3,
                  borderColor: colors.white,
                }}>
                  <Text style={{
                    fontSize: 32,
                    fontWeight: typography.weights.bold,
                    color: colors.primary.main,
                  }}>
                    {profile.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </Text>
                </View>
              )}
            </View>

            {/* Profile Info */}
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: typography.sizes['2xl'],
                fontWeight: typography.weights.bold,
                color: colors.white,
                marginBottom: spacing.xs,
              }}>
                {profile.full_name}
              </Text>
              
              <Text style={{
                fontSize: typography.sizes.base,
                color: colors.white,
                opacity: 0.9,
                marginBottom: spacing.xs,
              }}>
                {profile.city && profile.state ? `${profile.city}, ${profile.state}` : 'Location not set'}
              </Text>
              
              <TouchableOpacity
                onPress={() => router.push('/account/profile')}
                style={{ flexDirection: 'row', alignItems: 'center' }}
              >
                <Text style={{
                  fontSize: typography.sizes.sm,
                  color: colors.white,
                  opacity: 0.8,
                  marginRight: spacing.xs,
                }}>
                  See your public profile
                </Text>
                <Ionicons name="pencil" size={16} color={colors.white} />
                <Text style={{
                  fontSize: typography.sizes.sm,
                  color: colors.white,
                  marginLeft: spacing.xs,
                }}>
                  Edit
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={{ padding: spacing.lg }}>
          {/* Account Settings Section */}
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
              ACCOUNT SETTINGS
            </Text>
            
            <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
              <TouchableOpacity
                onPress={() => router.push('/account/payment-options')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: spacing.md,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.gray[100],
                }}
              >
                <Ionicons name="card-outline" size={24} color={colors.semantic.info} />
                <Text style={{
                  fontSize: typography.sizes.base,
                  color: colors.gray[900],
                  marginLeft: spacing.md,
                  flex: 1,
                }}>
                  Payment options
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/account/notifications')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: spacing.md,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.gray[100],
                }}
              >
                <View style={{ position: 'relative' }}>
                  <Ionicons name="notifications-outline" size={24} color={colors.semantic.warning} />
                  {notificationCount > 0 && (
                    <View style={{
                      position: 'absolute',
                      top: -4,
                      right: -8,
                      zIndex: 1,
                    }}>
                      <NotificationBadge count={notificationCount} size="small" />
                    </View>
                  )}
                </View>
                <Text style={{
                  fontSize: typography.sizes.base,
                  color: colors.gray[900],
                  marginLeft: spacing.md,
                  flex: 1,
                }}>
                  Notification preferences
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/account/verification')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: spacing.md,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.gray[100],
                }}
              >
                <Ionicons name="shield-checkmark-outline" size={24} color={colors.semantic.success} />
                <Text style={{
                  fontSize: typography.sizes.base,
                  color: colors.gray[900],
                  marginLeft: spacing.md,
                  flex: 1,
                }}>
                  Identity verification
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/account/account-management')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: spacing.md,
                }}
              >
                <Ionicons name="settings-outline" size={24} color={colors.primary.main} />
                <Text style={{
                  fontSize: typography.sizes.base,
                  color: colors.gray[900],
                  marginLeft: spacing.md,
                  flex: 1,
                }}>
                  Account management
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Earning Money Section */}
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
              MY ACTIVITY
            </Text>
            
            <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
              <TouchableOpacity
                onPress={() => router.push('/account/saved-items')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: spacing.md,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.gray[100],
                }}
              >
                <Ionicons name="heart-outline" size={24} color="#FF6B6B" />
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={{
                    fontSize: typography.sizes.base,
                    color: colors.gray[900],
                  }}>
                    Saved Items
                  </Text>
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    color: colors.gray[500],
                    marginTop: spacing.xs / 2,
                  }}>
                    View your saved listings and favorites
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/conversations')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: spacing.md,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.gray[100],
                }}
              >
                <Ionicons name="chatbubble-outline" size={24} color="#4A90E2" />
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={{
                    fontSize: typography.sizes.base,
                    color: colors.gray[900],
                  }}>
                    Messages
                  </Text>
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    color: colors.gray[500],
                    marginTop: spacing.xs / 2,
                  }}>
                    Connect with other members of the community
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/listing/create')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: spacing.md,
                }}
              >
                <Ionicons name="add-circle-outline" size={24} color={colors.primary.main} />
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={{
                    fontSize: typography.sizes.base,
                    color: colors.gray[900],
                  }}>
                    List my Items
                  </Text>
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    color: colors.gray[500],
                    marginTop: spacing.xs / 2,
                  }}>
                    Create listings for your items so customers can rent them
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Help and Support Section */}
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
              HELP AND SUPPORT
            </Text>
            
            <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
              <TouchableOpacity
                onPress={() => router.push('/account/faq')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: spacing.md,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.gray[100],
                }}
              >
                <Ionicons name="help-circle-outline" size={24} color="#8E44AD" />
                <Text style={{
                  fontSize: typography.sizes.base,
                  color: colors.gray[900],
                  marginLeft: spacing.md,
                  flex: 1,
                }}>
                  Frequently asked questions
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/account/community-guidelines')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: spacing.md,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.gray[100],
                }}
              >
                <Ionicons name="people-outline" size={24} color="#E67E22" />
                <Text style={{
                  fontSize: typography.sizes.base,
                  color: colors.gray[900],
                  marginLeft: spacing.md,
                  flex: 1,
                }}>
                  Community guidelines
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/account/contact-us')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: spacing.md,
                }}
              >
                <Ionicons name="chatbubble-outline" size={24} color="#4A90E2" />
                <Text style={{
                  fontSize: typography.sizes.base,
                  color: colors.gray[900],
                  marginLeft: spacing.md,
                  flex: 1,
                }}>
                  Contact us
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Safety Section */}
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
              SAFETY
            </Text>
            
            <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
              <TouchableOpacity
                onPress={() => router.push('/account/insurance-protection')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: spacing.md,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.gray[100],
                }}
              >
                <Ionicons name="shield-outline" size={24} color={colors.semantic.success} />
                <Text style={{
                  fontSize: typography.sizes.base,
                  color: colors.gray[900],
                  marginLeft: spacing.md,
                  flex: 1,
                }}>
                  Insurance protection
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/account/legal')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: spacing.md,
                }}
              >
                <Ionicons name="document-text-outline" size={24} color="#95A5A6" />
                <Text style={{
                  fontSize: typography.sizes.base,
                  color: colors.gray[900],
                  marginLeft: spacing.md,
                  flex: 1,
                }}>
                  Legal
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Log out Button */}
          <TouchableOpacity
            onPress={handleSignOut}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.white,
              borderRadius: 12,
              paddingVertical: spacing.md,
              marginBottom: spacing.xl,
              shadowColor: colors.black,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Ionicons name="log-out-outline" size={24} color={colors.semantic.error} />
            <Text style={{
              fontSize: typography.sizes.base,
              color: colors.semantic.error,
              fontWeight: typography.weights.semibold,
              marginLeft: spacing.sm,
            }}>
              Log out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
