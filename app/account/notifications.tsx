import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
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
  push_bookings: boolean;
  push_messages: boolean;
  push_reminders: boolean;
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_bookings: true,
    email_messages: true,
    email_marketing: false,
    sms_bookings: true,
    sms_reminders: true,
    push_notifications: true,
    push_bookings: true,
    push_messages: true,
    push_reminders: true
  });

  const handleNotificationUpdate = (key: keyof NotificationSettings, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    // Would save to database in real app
    Alert.alert('Success', 'Notification preferences updated');
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
                      <Switch
                        value={notifications[item.key as keyof NotificationSettings]}
                        onValueChange={(value) => handleNotificationUpdate(item.key as keyof NotificationSettings, value)}
                        trackColor={{ false: colors.gray[300], true: colors.primary.main + '40' }}
                        thumbColor={notifications[item.key as keyof NotificationSettings] ? colors.primary.main : colors.gray[400]}
                      />
                    </View>
                  ))}
                </>
              )}
            </View>
          </View>

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
