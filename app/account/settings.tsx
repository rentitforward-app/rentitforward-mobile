import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../src/lib/design-system';
import { Header } from '../../src/components/Header';

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

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_bookings: true,
    email_messages: true,
    email_marketing: false,
    sms_bookings: true,
    sms_reminders: true,
    push_notifications: true
  });

  const [security, setSecurity] = useState<SecuritySettings>({
    two_factor_enabled: false,
    login_alerts: true,
    session_timeout: 30
  });

  const handleNotificationUpdate = (key: keyof NotificationSettings, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    // Would save to database in real app
    Alert.alert('Success', 'Notification preferences updated');
  };

  const handleSecurityUpdate = (key: keyof SecuritySettings, value: boolean | number) => {
    setSecurity(prev => ({ ...prev, [key]: value }));
    // Would save to database in real app
    Alert.alert('Success', 'Security settings updated');
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Change Password',
      'Password change functionality will be implemented soon.',
      [{ text: 'OK' }]
    );
  };

  const handleTwoFactorAuth = () => {
    Alert.alert(
      'Two-Factor Authentication',
      '2FA setup will be implemented soon.',
      [{ text: 'OK' }]
    );
  };

  const handleDownloadData = () => {
    Alert.alert(
      'Download Data',
      'Data download functionality will be implemented soon.',
      [{ text: 'OK' }]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deletion', 'Account deletion functionality will be implemented soon.');
          }
        }
      ]
    );
  };

  return (
    <View style={[{ flex: 1, backgroundColor: colors.gray[50] }, { paddingTop: insets.top }]}>
      <Header 
        title="Settings" 
        showBackButton 
        onBackPress={() => router.back()} 
      />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: spacing.lg }}>
          {/* Notification Settings */}
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
              <Ionicons name="notifications" size={24} color={colors.semantic.warning} />
              <Text style={{
                fontSize: typography.sizes.lg,
                fontWeight: typography.weights.semibold,
                color: colors.gray[900],
                marginLeft: spacing.sm,
              }}>
                Notification Preferences
              </Text>
            </View>
            
            <Text style={{
              fontSize: typography.sizes.sm,
              color: colors.gray[600],
              paddingHorizontal: spacing.lg,
              marginBottom: spacing.lg,
            }}>
              Choose how you want to receive notifications
            </Text>

            <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
              <Text style={{
                fontSize: typography.sizes.base,
                fontWeight: typography.weights.medium,
                color: colors.gray[900],
                marginBottom: spacing.md,
              }}>
                Email Notifications
              </Text>

              {[
                { key: 'email_bookings', label: 'Booking updates and confirmations', description: 'Get notified about new bookings and status changes' },
                { key: 'email_messages', label: 'New messages', description: 'Receive emails when you get new messages' },
                { key: 'email_marketing', label: 'Marketing and promotions', description: 'Tips, news, and special offers from Rent It Forward' }
              ].map((item) => (
                <View key={item.key} style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: spacing.sm,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.gray[100],
                }}>
                  <View style={{ flex: 1, marginRight: spacing.md }}>
                    <Text style={{
                      fontSize: typography.sizes.base,
                      fontWeight: typography.weights.medium,
                      color: colors.gray[900],
                    }}>
                      {item.label}
                    </Text>
                    <Text style={{
                      fontSize: typography.sizes.sm,
                      color: colors.gray[500],
                      marginTop: spacing.xs / 2,
                    }}>
                      {item.description}
                    </Text>
                  </View>
                  <Switch
                    value={notifications[item.key as keyof NotificationSettings]}
                    onValueChange={(value) => handleNotificationUpdate(item.key as keyof NotificationSettings, value)}
                    trackColor={{ false: colors.gray[300], true: colors.primary.main + '40' }}
                    thumbColor={notifications[item.key as keyof NotificationSettings] ? colors.primary.main : colors.gray[400]}
                  />
                </View>
              ))}

              <Text style={{
                fontSize: typography.sizes.base,
                fontWeight: typography.weights.medium,
                color: colors.gray[900],
                marginTop: spacing.lg,
                marginBottom: spacing.md,
              }}>
                SMS Notifications
              </Text>

              {[
                { key: 'sms_bookings', label: 'Urgent booking alerts', description: 'Time-sensitive booking notifications' },
                { key: 'sms_reminders', label: 'Rental reminders', description: 'Reminders about upcoming pickups and returns' }
              ].map((item) => (
                <View key={item.key} style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: spacing.sm,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.gray[100],
                }}>
                  <View style={{ flex: 1, marginRight: spacing.md }}>
                    <Text style={{
                      fontSize: typography.sizes.base,
                      fontWeight: typography.weights.medium,
                      color: colors.gray[900],
                    }}>
                      {item.label}
                    </Text>
                    <Text style={{
                      fontSize: typography.sizes.sm,
                      color: colors.gray[500],
                      marginTop: spacing.xs / 2,
                    }}>
                      {item.description}
                    </Text>
                  </View>
                  <Switch
                    value={notifications[item.key as keyof NotificationSettings]}
                    onValueChange={(value) => handleNotificationUpdate(item.key as keyof NotificationSettings, value)}
                    trackColor={{ false: colors.gray[300], true: colors.primary.main + '40' }}
                    thumbColor={notifications[item.key as keyof NotificationSettings] ? colors.primary.main : colors.gray[400]}
                  />
                </View>
              ))}

              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: spacing.sm,
              }}>
                <View style={{ flex: 1, marginRight: spacing.md }}>
                  <Text style={{
                    fontSize: typography.sizes.base,
                    fontWeight: typography.weights.medium,
                    color: colors.gray[900],
                  }}>
                    Push Notifications
                  </Text>
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    color: colors.gray[500],
                    marginTop: spacing.xs / 2,
                  }}>
                    Receive push notifications on your device
                  </Text>
                </View>
                <Switch
                  value={notifications.push_notifications}
                  onValueChange={(value) => handleNotificationUpdate('push_notifications', value)}
                  trackColor={{ false: colors.gray[300], true: colors.primary.main + '40' }}
                  thumbColor={notifications.push_notifications ? colors.primary.main : colors.gray[400]}
                />
              </View>
            </View>
          </View>

          {/* Security Settings */}
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
              <Ionicons name="shield-checkmark" size={24} color={colors.semantic.success} />
              <Text style={{
                fontSize: typography.sizes.lg,
                fontWeight: typography.weights.semibold,
                color: colors.gray[900],
                marginLeft: spacing.sm,
              }}>
                Privacy & Security
              </Text>
            </View>
            
            <Text style={{
              fontSize: typography.sizes.sm,
              color: colors.gray[600],
              paddingHorizontal: spacing.lg,
              marginBottom: spacing.lg,
            }}>
              Manage your privacy settings and security preferences
            </Text>

            <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
              <TouchableOpacity
                onPress={handleTwoFactorAuth}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: spacing.md,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.gray[100],
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: typography.sizes.base,
                    fontWeight: typography.weights.medium,
                    color: colors.gray[900],
                  }}>
                    Two-Factor Authentication
                  </Text>
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    color: colors.gray[500],
                    marginTop: spacing.xs / 2,
                  }}>
                    Add an extra layer of security to your account
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleChangePassword}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: spacing.md,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.gray[100],
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: typography.sizes.base,
                    fontWeight: typography.weights.medium,
                    color: colors.gray[900],
                  }}>
                    Change Password
                  </Text>
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    color: colors.gray[500],
                    marginTop: spacing.xs / 2,
                  }}>
                    Update your account password
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
              </TouchableOpacity>

              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: spacing.md,
              }}>
                <View style={{ flex: 1, marginRight: spacing.md }}>
                  <Text style={{
                    fontSize: typography.sizes.base,
                    fontWeight: typography.weights.medium,
                    color: colors.gray[900],
                  }}>
                    Login Alerts
                  </Text>
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    color: colors.gray[500],
                    marginTop: spacing.xs / 2,
                  }}>
                    Get notified when someone logs into your account
                  </Text>
                </View>
                <Switch
                  value={security.login_alerts}
                  onValueChange={(value) => handleSecurityUpdate('login_alerts', value)}
                  trackColor={{ false: colors.gray[300], true: colors.primary.main + '40' }}
                  thumbColor={security.login_alerts ? colors.primary.main : colors.gray[400]}
                />
              </View>
            </View>
          </View>

          {/* Data & Privacy */}
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
              <Ionicons name="document-text" size={24} color={colors.semantic.info} />
              <Text style={{
                fontSize: typography.sizes.lg,
                fontWeight: typography.weights.semibold,
                color: colors.gray[900],
                marginLeft: spacing.sm,
              }}>
                Data & Privacy
              </Text>
            </View>
            
            <Text style={{
              fontSize: typography.sizes.sm,
              color: colors.gray[600],
              paddingHorizontal: spacing.lg,
              marginBottom: spacing.lg,
            }}>
              Manage your data and privacy settings
            </Text>

            <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
              <TouchableOpacity
                onPress={handleDownloadData}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: spacing.md,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.gray[100],
                }}
              >
                <Ionicons name="download" size={20} color={colors.gray[600]} />
                <Text style={{
                  fontSize: typography.sizes.base,
                  color: colors.gray[900],
                  marginLeft: spacing.sm,
                  flex: 1,
                }}>
                  Download Your Data
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/account/privacy-settings')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: spacing.md,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.gray[100],
                }}
              >
                <Ionicons name="eye" size={20} color={colors.gray[600]} />
                <Text style={{
                  fontSize: typography.sizes.base,
                  color: colors.gray[900],
                  marginLeft: spacing.sm,
                  flex: 1,
                }}>
                  Privacy Settings
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/account/login-history')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: spacing.md,
                }}
              >
                <Ionicons name="time" size={20} color={colors.gray[600]} />
                <Text style={{
                  fontSize: typography.sizes.base,
                  color: colors.gray[900],
                  marginLeft: spacing.sm,
                  flex: 1,
                }}>
                  Login History
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Account Management */}
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
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: spacing.lg,
              paddingTop: spacing.lg,
              paddingBottom: spacing.md,
            }}>
              <Ionicons name="settings" size={24} color={colors.gray[600]} />
              <Text style={{
                fontSize: typography.sizes.lg,
                fontWeight: typography.weights.semibold,
                color: colors.gray[900],
                marginLeft: spacing.sm,
              }}>
                Account Management
              </Text>
            </View>

            <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
              <View style={{
                borderTopWidth: 1,
                borderTopColor: colors.gray[200],
                paddingTop: spacing.lg,
                marginTop: spacing.md,
              }}>
                <Text style={{
                  fontSize: typography.sizes.base,
                  fontWeight: typography.weights.medium,
                  color: colors.semantic.error,
                  marginBottom: spacing.md,
                }}>
                  Danger Zone
                </Text>
                
                <View style={{
                  padding: spacing.md,
                  borderWidth: 1,
                  borderColor: colors.semantic.error + '40',
                  borderRadius: 8,
                  backgroundColor: colors.semantic.error + '10',
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: typography.sizes.base,
                        fontWeight: typography.weights.medium,
                        color: colors.semantic.error,
                      }}>
                        Delete Account
                      </Text>
                      <Text style={{
                        fontSize: typography.sizes.sm,
                        color: colors.semantic.error,
                        marginTop: spacing.xs / 2,
                      }}>
                        Permanently delete your account and all associated data
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={handleDeleteAccount}
                      style={{
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.sm,
                        borderWidth: 1,
                        borderColor: colors.semantic.error,
                        borderRadius: 6,
                        backgroundColor: colors.white,
                      }}
                    >
                      <Text style={{
                        color: colors.semantic.error,
                        fontSize: typography.sizes.sm,
                        fontWeight: typography.weights.medium,
                      }}>
                        Delete
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
