import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../src/lib/design-system';
import { Header } from '../../src/components/Header';
import { useFCM, useNotificationPermission, useNotificationPreferences } from '../../src/components/FCMProvider';

interface NotificationSettings {
  email_bookings: boolean;
  email_messages: boolean;
  email_marketing: boolean;
  sms_bookings: boolean;
  sms_reminders: boolean;
  push_notifications: boolean;
  push_bookings: boolean;
  push_messages: boolean;
  push_reminders: boolean;
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  // FCM hooks
  const { hasPermission, isEnabled } = useFCM();
  const { permission, enabled, loading: permissionLoading, enable, disable } = useNotificationPermission();
  const { preferences, loading: preferencesLoading, updatePreference } = useNotificationPreferences();

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_bookings: true,
    email_messages: true,
    email_marketing: false,
    sms_bookings: true,
    sms_reminders: true,
    push_notifications: enabled,
    push_bookings: preferences.booking_notifications,
    push_messages: preferences.message_notifications,
    push_reminders: preferences.system_notifications
  });

  // Update local state when FCM state changes
  useEffect(() => {
    setNotifications(prev => ({
      ...prev,
      push_notifications: enabled,
      push_bookings: preferences.booking_notifications,
      push_messages: preferences.message_notifications,
      push_reminders: preferences.system_notifications,
    }));
  }, [enabled, preferences]);

  const handleNotificationUpdate = async (key: keyof NotificationSettings, value: boolean) => {
    try {
      // Handle push notification main toggle
      if (key === 'push_notifications') {
        if (value) {
          const success = await enable();
          if (!success) {
            Alert.alert(
              'Permission Required',
              'Please enable notifications in your device settings to receive updates.',
              [{ text: 'OK' }]
            );
            return;
          }
        } else {
          Alert.alert(
            'Disable Notifications',
            'Are you sure you want to disable all push notifications? You may miss important updates about your bookings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Disable', 
                style: 'destructive',
                onPress: async () => {
                  await disable();
                  setNotifications(prev => ({ ...prev, [key]: false }));
                }
              }
            ]
          );
          return;
        }
      }
      
      // Handle push notification category toggles
      if (key.startsWith('push_') && key !== 'push_notifications') {
        if (!enabled) {
          Alert.alert(
            'Enable Push Notifications First',
            'Please enable push notifications to customize your preferences.',
            [{ text: 'OK' }]
          );
          return;
        }
        
        // Map UI keys to FCM preference keys
        const fcmKey = key === 'push_bookings' ? 'booking_notifications' :
                      key === 'push_messages' ? 'message_notifications' :
                      key === 'push_reminders' ? 'system_notifications' : null;
        
        if (fcmKey) {
          await updatePreference(fcmKey as keyof typeof preferences, value);
        }
      }
      
      // Update local state
      setNotifications(prev => ({ ...prev, [key]: value }));
      
      // Show success message for non-push notifications
      if (!key.startsWith('push_')) {
        Alert.alert('Success', 'Notification preferences updated');
      }
      
    } catch (error) {
      console.error('Failed to update notification setting:', error);
      Alert.alert('Error', 'Failed to update notification preferences. Please try again.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.gray[50] }}>
      <Header 
        title="Notification Preferences" 
        showBackButton 
        onBackPress={() => router.back()} 
      />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: spacing.lg }}>
          {/* Email Notifications */}
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
              <Ionicons name="mail" size={24} color={colors.semantic.info} />
              <Text style={{
                fontSize: typography.sizes.lg,
                fontWeight: typography.weights.semibold,
                color: colors.gray[900],
                marginLeft: spacing.sm,
              }}>
                Email Notifications
              </Text>
            </View>
            
            <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
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
            </View>
          </View>

          {/* SMS Notifications */}
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
              <Ionicons name="chatbubble" size={24} color={colors.semantic.success} />
              <Text style={{
                fontSize: typography.sizes.lg,
                fontWeight: typography.weights.semibold,
                color: colors.gray[900],
                marginLeft: spacing.sm,
              }}>
                SMS Notifications
              </Text>
            </View>
            
            <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
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
            </View>
          </View>

          {/* Push Notifications */}
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
                Push Notifications
              </Text>
            </View>
            
            <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
              <View style={{
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
                    Enable Push Notifications
                  </Text>
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    color: colors.gray[500],
                    marginTop: spacing.xs / 2,
                  }}>
                    {permissionLoading 
                      ? 'Checking notification status...'
                      : !permission 
                        ? 'Notifications are not allowed in device settings'
                        : enabled 
                          ? 'You\'ll receive push notifications'
                          : 'Enable to receive important updates'
                    }
                  </Text>
                </View>
                {permissionLoading ? (
                  <ActivityIndicator size="small" color={colors.primary.main} />
                ) : (
                  <Switch
                    value={notifications.push_notifications}
                    onValueChange={(value) => handleNotificationUpdate('push_notifications', value)}
                    disabled={permissionLoading}
                    trackColor={{ false: colors.gray[300], true: colors.primary.main + '40' }}
                    thumbColor={notifications.push_notifications ? colors.primary.main : colors.gray[400]}
                  />
                )}
              </View>

              {notifications.push_notifications && (
                <>
                  {[
                    { key: 'push_bookings', label: 'Booking notifications', description: 'Get notified about booking updates' },
                    { key: 'push_messages', label: 'Message notifications', description: 'Get notified about new messages' },
                    { key: 'push_reminders', label: 'Reminder notifications', description: 'Get reminded about upcoming events' }
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
                      {preferencesLoading ? (
                        <ActivityIndicator size="small" color={colors.primary.main} />
                      ) : (
                        <Switch
                          value={notifications[item.key as keyof NotificationSettings]}
                          onValueChange={(value) => handleNotificationUpdate(item.key as keyof NotificationSettings, value)}
                          disabled={preferencesLoading}
                          trackColor={{ false: colors.gray[300], true: colors.primary.main + '40' }}
                          thumbColor={notifications[item.key as keyof NotificationSettings] ? colors.primary.main : colors.gray[400]}
                        />
                      )}
                    </View>
                  ))}
                </>
              )}
            </View>
          </View>

          {/* Permission Hint */}
          {!permission && (
            <View style={{
              backgroundColor: colors.semantic.warning + '10',
              borderRadius: 12,
              marginBottom: spacing.lg,
              padding: spacing.lg,
              borderWidth: 1,
              borderColor: colors.semantic.warning + '30',
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: spacing.md,
              }}>
                <Ionicons name="warning" size={24} color={colors.semantic.warning} />
                <Text style={{
                  fontSize: typography.sizes.lg,
                  fontWeight: typography.weights.semibold,
                  color: colors.gray[900],
                  marginLeft: spacing.sm,
                }}>
                  Notifications Disabled
                </Text>
              </View>
              <Text style={{
                fontSize: typography.sizes.sm,
                color: colors.gray[600],
                lineHeight: 18,
                marginBottom: spacing.sm,
              }}>
                💡 To enable notifications, you may need to allow them in your device settings under Settings → Notifications → Rent It Forward
              </Text>
              <Text style={{
                fontSize: typography.sizes.sm,
                color: colors.gray[600],
                lineHeight: 18,
              }}>
                Push notifications help you stay updated on booking requests, messages, and important updates.
              </Text>
            </View>
          )}

          {/* Notification Tips */}
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
              <Ionicons name="bulb" size={24} color={colors.semantic.warning} />
              <Text style={{
                fontSize: typography.sizes.lg,
                fontWeight: typography.weights.semibold,
                color: colors.gray[900],
                marginLeft: spacing.sm,
              }}>
                Notification Tips
              </Text>
            </View>
            
            <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
              <View style={{
                backgroundColor: colors.semantic.info + '10',
                padding: spacing.md,
                borderRadius: 8,
                marginBottom: spacing.md,
              }}>
                <Text style={{
                  fontSize: typography.sizes.sm,
                  color: colors.gray[600],
                  lineHeight: 18,
                }}>
                  • Keep booking and message notifications enabled to stay updated on your rentals
                </Text>
              </View>

              <View style={{
                backgroundColor: colors.semantic.success + '10',
                padding: spacing.md,
                borderRadius: 8,
                marginBottom: spacing.md,
              }}>
                <Text style={{
                  fontSize: typography.sizes.sm,
                  color: colors.gray[600],
                  lineHeight: 18,
                }}>
                  • SMS notifications are great for urgent alerts when you're away from your phone
                </Text>
              </View>

              <View style={{
                backgroundColor: colors.semantic.warning + '10',
                padding: spacing.md,
                borderRadius: 8,
              }}>
                <Text style={{
                  fontSize: typography.sizes.sm,
                  color: colors.gray[600],
                  lineHeight: 18,
                }}>
                  • You can always change these settings later if your preferences change
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
