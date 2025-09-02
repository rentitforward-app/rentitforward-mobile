import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/components/AuthProvider';
import { supabase } from '../src/lib/supabase';
import { colors, spacing, typography } from '../src/lib/design-system';

interface NotificationSettings {
  email_bookings: boolean;
  email_messages: boolean;
  email_marketing: boolean;
  sms_bookings: boolean;
  sms_reminders: boolean;
  push_notifications: boolean;
}

interface SecuritySettings {
  two_factor_enabled: boolean;
  login_alerts: boolean;
  session_timeout: number;
}

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  verified: boolean;
  stripe_onboarded: boolean;
}

type SettingsSection = 'verification' | 'notifications' | 'security' | 'data' | 'account';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  
  const [activeSection, setActiveSection] = useState<SettingsSection>('verification');
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_bookings: true,
    email_messages: true,
    email_marketing: false,
    sms_bookings: true,
    sms_reminders: true,
    push_notifications: true,
  });
  
  const [security, setSecurity] = useState<SecuritySettings>({
    two_factor_enabled: false,
    login_alerts: true,
    session_timeout: 30,
  });

  const handleNotificationUpdate = async (key: keyof NotificationSettings, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    // In a real app, this would save to database
    Alert.alert('Success', 'Notification preferences updated');
  };

  const handleSecurityUpdate = async (key: keyof SecuritySettings, value: boolean | number) => {
    setSecurity(prev => ({ ...prev, [key]: value }));
    // In a real app, this would save to database
    Alert.alert('Success', 'Security settings updated');
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await signOut();
      router.replace('/(auth)/welcome');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert('Not Implemented', 'Account deletion feature is not yet implemented');
    setShowDeleteConfirm(false);
  };

  const handleChangePassword = () => {
    router.push('/(auth)/forgot-password');
  };

  const handleDownloadData = () => {
    Alert.alert('Not Implemented', 'Data download feature is not yet implemented');
  };

  const sections = [
    {
      key: 'verification' as SettingsSection,
      label: 'Payments & Verification',
      icon: 'card-outline' as const,
      color: colors.semantic.info,
    },
    {
      key: 'notifications' as SettingsSection,
      label: 'Notifications',
      icon: 'notifications-outline' as const,
      color: colors.primary.main,
    },
    {
      key: 'security' as SettingsSection,
      label: 'Privacy & Security',
      icon: 'shield-outline' as const,
      color: colors.semantic.success,
    },
    {
      key: 'data' as SettingsSection,
      label: 'Data & Privacy',
      icon: 'document-outline' as const,
      color: colors.semantic.info,
    },
    {
      key: 'account' as SettingsSection,
      label: 'Account Management',
      icon: 'settings-outline' as const,
      color: colors.gray[600],
    },
  ];

  const renderSectionNavigation = () => (
    <View style={{ backgroundColor: colors.white, marginBottom: spacing.md }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: spacing.md }}>
        <View style={{ flexDirection: 'row', paddingVertical: spacing.sm }}>
          {sections.map((section) => (
            <TouchableOpacity
              key={section.key}
              onPress={() => setActiveSection(section.key)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                marginRight: spacing.sm,
                borderRadius: 20,
                backgroundColor: activeSection === section.key ? section.color + '20' : colors.gray[100],
                borderWidth: activeSection === section.key ? 1 : 0,
                borderColor: activeSection === section.key ? section.color : 'transparent',
              }}
            >
              <Ionicons
                name={section.icon}
                size={16}
                color={activeSection === section.key ? section.color : colors.gray[600]}
                style={{ marginRight: spacing.xs }}
              />
              <Text
                style={{
                  fontSize: typography.sizes.sm,
                  fontWeight: activeSection === section.key ? typography.weights.semibold : typography.weights.normal,
                  color: activeSection === section.key ? section.color : colors.gray[600],
                }}
              >
                {section.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderToggleSwitch = (value: boolean, onValueChange: (value: boolean) => void) => (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: colors.gray[300], true: colors.primary.main + '40' }}
      thumbColor={value ? colors.primary.main : colors.white}
      ios_backgroundColor={colors.gray[300]}
    />
  );

  const renderVerificationSection = () => (
    <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: spacing.lg, marginBottom: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
        <Ionicons name="card" size={24} color={colors.semantic.info} style={{ marginRight: spacing.sm }} />
        <Text style={{ fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.gray[900] }}>
          Payments & Verification
        </Text>
      </View>
      
      <Text style={{ fontSize: typography.sizes.sm, color: colors.gray[600], marginBottom: spacing.lg }}>
        Manage your payment methods and verification status
      </Text>

      <View style={{ marginBottom: spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: typography.sizes.base, fontWeight: typography.weights.medium, color: colors.gray[900] }}>
              Identity Verification
            </Text>
            <Text style={{ fontSize: typography.sizes.sm, color: colors.gray[600] }}>
              Verify your identity to increase trust
            </Text>
          </View>
          <View style={{
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            borderRadius: 16,
            backgroundColor: profile?.verified ? colors.semantic.success + '20' : colors.semantic.warning + '20',
          }}>
            <Text style={{
              fontSize: typography.sizes.xs,
              fontWeight: typography.weights.medium,
              color: profile?.verified ? colors.semantic.success : colors.semantic.warning,
            }}>
              {profile?.verified ? 'Verified' : 'Pending'}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: typography.sizes.base, fontWeight: typography.weights.medium, color: colors.gray[900] }}>
              Payment Setup
            </Text>
            <Text style={{ fontSize: typography.sizes.sm, color: colors.gray[600] }}>
              Set up payments to start earning
            </Text>
          </View>
          <View style={{
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            borderRadius: 16,
            backgroundColor: profile?.stripe_onboarded ? colors.semantic.success + '20' : colors.semantic.warning + '20',
          }}>
            <Text style={{
              fontSize: typography.sizes.xs,
              fontWeight: typography.weights.medium,
              color: profile?.stripe_onboarded ? colors.semantic.success : colors.semantic.warning,
            }}>
              {profile?.stripe_onboarded ? 'Complete' : 'Setup Required'}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={{
          backgroundColor: colors.primary.main,
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          borderRadius: 8,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: colors.white, fontSize: typography.sizes.base, fontWeight: typography.weights.semibold }}>
          Complete Verification
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderNotificationsSection = () => (
    <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: spacing.lg, marginBottom: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
        <Ionicons name="notifications" size={24} color={colors.primary.main} style={{ marginRight: spacing.sm }} />
        <Text style={{ fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.gray[900] }}>
          Notification Preferences
        </Text>
      </View>
      
      <Text style={{ fontSize: typography.sizes.sm, color: colors.gray[600], marginBottom: spacing.lg }}>
        Choose how you want to receive notifications
      </Text>

      {/* Email Notifications */}
      <View style={{ marginBottom: spacing.lg }}>
        <Text style={{ fontSize: typography.sizes.base, fontWeight: typography.weights.medium, color: colors.gray[900], marginBottom: spacing.md }}>
          Email Notifications
        </Text>
        
        {[
          { key: 'email_bookings', label: 'Booking updates', description: 'Get notified about new bookings and status changes' },
          { key: 'email_messages', label: 'New messages', description: 'Receive emails when you get new messages' },
          { key: 'email_marketing', label: 'Marketing & promotions', description: 'Tips, news, and special offers' },
        ].map((item) => (
          <View key={item.key} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md }}>
            <View style={{ flex: 1, marginRight: spacing.md }}>
              <Text style={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, color: colors.gray[900] }}>
                {item.label}
              </Text>
              <Text style={{ fontSize: typography.sizes.xs, color: colors.gray[600] }}>
                {item.description}
              </Text>
            </View>
            {renderToggleSwitch(
              notifications[item.key as keyof NotificationSettings],
              (value) => handleNotificationUpdate(item.key as keyof NotificationSettings, value)
            )}
          </View>
        ))}
      </View>

      {/* SMS Notifications */}
      <View>
        <Text style={{ fontSize: typography.sizes.base, fontWeight: typography.weights.medium, color: colors.gray[900], marginBottom: spacing.md }}>
          SMS Notifications
        </Text>
        
        {[
          { key: 'sms_bookings', label: 'Urgent booking alerts', description: 'Time-sensitive booking notifications' },
          { key: 'sms_reminders', label: 'Rental reminders', description: 'Reminders about upcoming pickups and returns' },
        ].map((item) => (
          <View key={item.key} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md }}>
            <View style={{ flex: 1, marginRight: spacing.md }}>
              <Text style={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, color: colors.gray[900] }}>
                {item.label}
              </Text>
              <Text style={{ fontSize: typography.sizes.xs, color: colors.gray[600] }}>
                {item.description}
              </Text>
            </View>
            {renderToggleSwitch(
              notifications[item.key as keyof NotificationSettings],
              (value) => handleNotificationUpdate(item.key as keyof NotificationSettings, value)
            )}
          </View>
        ))}
      </View>
    </View>
  );

  const renderSecuritySection = () => (
    <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: spacing.lg, marginBottom: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
        <Ionicons name="shield" size={24} color={colors.semantic.success} style={{ marginRight: spacing.sm }} />
        <Text style={{ fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.gray[900] }}>
          Privacy & Security
        </Text>
      </View>
      
      <Text style={{ fontSize: typography.sizes.sm, color: colors.gray[600], marginBottom: spacing.lg }}>
        Manage your privacy settings and security preferences
      </Text>

      {/* Two-Factor Authentication */}
      <View style={{ marginBottom: spacing.lg }}>
        <Text style={{ fontSize: typography.sizes.base, fontWeight: typography.weights.medium, color: colors.gray[900], marginBottom: spacing.md }}>
          Two-Factor Authentication
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md }}>
          <View style={{ flex: 1, marginRight: spacing.md }}>
            <Text style={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, color: colors.gray[900] }}>
              Enable 2FA
            </Text>
            <Text style={{ fontSize: typography.sizes.xs, color: colors.gray[600] }}>
              Add an extra layer of security to your account
            </Text>
          </View>
          <TouchableOpacity
            style={{
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: colors.primary.main,
              backgroundColor: security.two_factor_enabled ? colors.primary.main : colors.white,
            }}
          >
            <Text style={{
              fontSize: typography.sizes.sm,
              fontWeight: typography.weights.medium,
              color: security.two_factor_enabled ? colors.white : colors.primary.main,
            }}>
              {security.two_factor_enabled ? 'Disable' : 'Enable'} 2FA
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Password */}
      <View style={{ marginBottom: spacing.lg }}>
        <Text style={{ fontSize: typography.sizes.base, fontWeight: typography.weights.medium, color: colors.gray[900], marginBottom: spacing.md }}>
          Password
        </Text>
        <TouchableOpacity
          onPress={handleChangePassword}
          style={{
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: colors.gray[300],
            backgroundColor: colors.white,
            alignSelf: 'flex-start',
          }}
        >
          <Text style={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, color: colors.gray[900] }}>
            Change Password
          </Text>
        </TouchableOpacity>
      </View>

      {/* Login Alerts */}
      <View>
        <Text style={{ fontSize: typography.sizes.base, fontWeight: typography.weights.medium, color: colors.gray[900], marginBottom: spacing.md }}>
          Login Alerts
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, marginRight: spacing.md }}>
            <Text style={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, color: colors.gray[900] }}>
              Email alerts for new logins
            </Text>
            <Text style={{ fontSize: typography.sizes.xs, color: colors.gray[600] }}>
              Get notified when someone logs into your account
            </Text>
          </View>
          {renderToggleSwitch(
            security.login_alerts,
            (value) => handleSecurityUpdate('login_alerts', value)
          )}
        </View>
      </View>
    </View>
  );

  const renderDataSection = () => (
    <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: spacing.lg, marginBottom: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
        <Ionicons name="document" size={24} color={colors.semantic.info} style={{ marginRight: spacing.sm }} />
        <Text style={{ fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.gray[900] }}>
          Data & Privacy
        </Text>
      </View>
      
      <Text style={{ fontSize: typography.sizes.sm, color: colors.gray[600], marginBottom: spacing.lg }}>
        Manage your data and privacy settings
      </Text>

      <View style={{ gap: spacing.md }}>
        <TouchableOpacity
          onPress={handleDownloadData}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.md,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.gray[300],
            backgroundColor: colors.white,
          }}
        >
          <Ionicons name="download-outline" size={20} color={colors.gray[600]} style={{ marginRight: spacing.sm }} />
          <Text style={{ fontSize: typography.sizes.base, fontWeight: typography.weights.medium, color: colors.gray[900] }}>
            Download Your Data
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.md,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.gray[300],
            backgroundColor: colors.white,
          }}
        >
          <Ionicons name="eye-outline" size={20} color={colors.gray[600]} style={{ marginRight: spacing.sm }} />
          <Text style={{ fontSize: typography.sizes.base, fontWeight: typography.weights.medium, color: colors.gray[900] }}>
            Privacy Settings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.md,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.gray[300],
            backgroundColor: colors.white,
          }}
        >
          <Ionicons name="time-outline" size={20} color={colors.gray[600]} style={{ marginRight: spacing.sm }} />
          <Text style={{ fontSize: typography.sizes.base, fontWeight: typography.weights.medium, color: colors.gray[900] }}>
            Login History
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAccountSection = () => (
    <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: spacing.lg, marginBottom: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
        <Ionicons name="settings" size={24} color={colors.gray[600]} style={{ marginRight: spacing.sm }} />
        <Text style={{ fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.gray[900] }}>
          Account Management
        </Text>
      </View>

      <View style={{ gap: spacing.md }}>
        <TouchableOpacity
          onPress={handleLogout}
          disabled={isLoading}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.md,
            borderRadius: 8,
            backgroundColor: colors.primary.main,
          }}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.white} style={{ marginRight: spacing.sm }} />
          ) : (
            <Ionicons name="log-out-outline" size={20} color={colors.white} style={{ marginRight: spacing.sm }} />
          )}
          <Text style={{ fontSize: typography.sizes.base, fontWeight: typography.weights.medium, color: colors.white }}>
            {isLoading ? 'Signing Out...' : 'Sign Out'}
          </Text>
        </TouchableOpacity>

        <View style={{ marginTop: spacing.lg, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.gray[200] }}>
          <Text style={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, color: colors.semantic.error, marginBottom: spacing.md }}>
            Danger Zone
          </Text>
          <View style={{
            padding: spacing.md,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.semantic.error + '40',
            backgroundColor: colors.semantic.error + '10',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, marginRight: spacing.md }}>
                <Text style={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, color: colors.semantic.error }}>
                  Delete Account
                </Text>
                <Text style={{ fontSize: typography.sizes.xs, color: colors.semantic.error }}>
                  Permanently delete your account and all data
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowDeleteConfirm(true)}
                style={{
                  paddingHorizontal: spacing.sm,
                  paddingVertical: spacing.xs,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: colors.semantic.error,
                  backgroundColor: colors.white,
                }}
              >
                <Text style={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, color: colors.semantic.error }}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'verification':
        return renderVerificationSection();
      case 'notifications':
        return renderNotificationsSection();
      case 'security':
        return renderSecuritySection();
      case 'data':
        return renderDataSection();
      case 'account':
        return renderAccountSection();
      default:
        return renderVerificationSection();
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray[50] }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: typography.sizes.lg, color: colors.gray[600] }}>
            Please sign in to access settings
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray[50] }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[200],
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginRight: spacing.md }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.gray[900]} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.gray[900] }}>
            Settings
          </Text>
          <Text style={{ fontSize: typography.sizes.sm, color: colors.gray[600] }}>
            Manage your account preferences
          </Text>
        </View>
      </View>

      {/* Section Navigation */}
      {renderSectionNavigation()}

      {/* Content */}
      <ScrollView style={{ flex: 1, paddingHorizontal: spacing.lg }}>
        {renderContent()}
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: spacing.lg,
          }}
          onPress={() => setShowDeleteConfirm(false)}
        >
          <Pressable
            style={{
              backgroundColor: colors.white,
              borderRadius: 12,
              padding: spacing.lg,
              width: '100%',
              maxWidth: 400,
            }}
            onPress={() => {}} // Prevent modal from closing when tapping content
          >
            <Text style={{ fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.gray[900], marginBottom: spacing.md }}>
              Delete Account
            </Text>
            <Text style={{ fontSize: typography.sizes.base, color: colors.gray[600], marginBottom: spacing.lg }}>
              Are you sure you want to delete your account? This action cannot be undone.
            </Text>
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <TouchableOpacity
                onPress={handleDeleteAccount}
                style={{
                  flex: 1,
                  backgroundColor: colors.semantic.error,
                  paddingVertical: spacing.sm,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: colors.white, fontSize: typography.sizes.base, fontWeight: typography.weights.semibold }}>
                  Yes, Delete Account
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowDeleteConfirm(false)}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: colors.gray[300],
                  paddingVertical: spacing.sm,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: colors.gray[900], fontSize: typography.sizes.base, fontWeight: typography.weights.semibold }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
