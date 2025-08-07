import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, Alert, ScrollView } from 'react-native';
import { useOneSignal, useNotificationPermission } from './OneSignalProvider';
// Temporarily using local colors until design system is fixed
const colors = {
  primary: { green: '#44D62C' },
  gray: { 200: '#e5e7eb', 300: '#d1d5db', 600: '#4b5563', 900: '#111827' }
};
const typography = {
  sizes: { base: 16, lg: 18, sm: 14 },
  weights: { medium: '500', semibold: '600' },
  lineHeights: { normal: 1.5, relaxed: 1.75 }
};
const spacing = { md: 16 };

interface NotificationCategory {
  key: string;
  title: string;
  description: string;
  defaultValue: boolean;
}

const notificationCategories: NotificationCategory[] = [
  {
    key: 'booking_notifications',
    title: 'Booking Updates',
    description: 'Get notified about booking requests, confirmations, and changes',
    defaultValue: true,
  },
  {
    key: 'message_notifications',
    title: 'Messages',
    description: 'Receive notifications for new messages and conversations',
    defaultValue: true,
  },
  {
    key: 'payment_notifications',
    title: 'Payments',
    description: 'Get notified about payments, refunds, and transaction updates',
    defaultValue: true,
  },
  {
    key: 'review_notifications',
    title: 'Reviews',
    description: 'Notifications for review requests and received reviews',
    defaultValue: true,
  },
  {
    key: 'system_notifications',
    title: 'System Updates',
    description: 'Important app updates and system announcements',
    defaultValue: true,
  },
  {
    key: 'marketing_notifications',
    title: 'Marketing & Promotions',
    description: 'Special offers, tips, and promotional content',
    defaultValue: false,
  },
];

interface NotificationSettingsProps {
  onSettingsChange?: (settings: Record<string, boolean>) => void;
}

export function NotificationSettings({ onSettingsChange }: NotificationSettingsProps) {
  const { setNotificationPreferences } = useOneSignal();
  const { 
    permission, 
    subscribed, 
    loading, 
    enableNotifications, 
    disableNotifications 
  } = useNotificationPermission();

  const [settings, setSettings] = useState<Record<string, boolean>>(() => {
    const initialSettings: Record<string, boolean> = {};
    notificationCategories.forEach(category => {
      initialSettings[category.key] = category.defaultValue;
    });
    return initialSettings;
  });

  const [isUpdating, setIsUpdating] = useState(false);

  // Load saved preferences from OneSignal tags or local storage
  useEffect(() => {
    // In a real implementation, you'd load this from your API or OneSignal tags
    // For now, we'll use the default values
  }, []);

  const handleMainToggleChange = async (enabled: boolean) => {
    try {
      if (enabled) {
        const success = await enableNotifications();
        if (!success) {
          Alert.alert(
            'Permission Required',
            'Please enable notifications in your device settings to receive updates.',
            [{ text: 'OK' }]
          );
        }
      } else {
        Alert.alert(
          'Disable Notifications',
          'Are you sure you want to disable all notifications? You can miss important updates about your bookings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Disable', 
              style: 'destructive',
              onPress: () => disableNotifications()
            }
          ]
        );
      }
    } catch (error) {
      console.error('Failed to toggle notifications:', error);
      Alert.alert('Error', 'Failed to update notification settings. Please try again.');
    }
  };

  const handleCategoryToggle = async (key: string, value: boolean) => {
    if (!subscribed) {
      Alert.alert(
        'Enable Notifications First',
        'Please enable push notifications to customize your preferences.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsUpdating(true);
      
      const newSettings = {
        ...settings,
        [key]: value,
      };
      
      setSettings(newSettings);
      
      // Update OneSignal tags
      await setNotificationPreferences(newSettings);
      
      // Notify parent component
      onSettingsChange?.(newSettings);
      
    } catch (error) {
      console.error('Failed to update category setting:', error);
      
      // Revert the change
      setSettings(prev => ({
        ...prev,
        [key]: !value,
      }));
      
      Alert.alert('Error', 'Failed to update notification preferences. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Push Notifications</Text>
        <Text style={styles.sectionDescription}>
          Get notified about important updates, messages, and booking activity
        </Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Enable Notifications</Text>
            <Text style={styles.settingDescription}>
              {!permission 
                ? 'Notifications are not allowed in device settings'
                : subscribed 
                  ? 'You\'ll receive push notifications'
                  : 'Enable to receive important updates'
              }
            </Text>
          </View>
          <Switch
            value={subscribed && permission}
            onValueChange={handleMainToggleChange}
            disabled={loading}
            thumbColor={subscribed ? colors.primary.green : colors.gray[300]}
            trackColor={{
              false: colors.gray[200],
              true: `${colors.primary.green}40`, // 40 = 25% opacity
            }}
          />
        </View>
      </View>

      {subscribed && permission && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Categories</Text>
          <Text style={styles.sectionDescription}>
            Choose which types of notifications you want to receive
          </Text>
          
          {notificationCategories.map((category) => (
            <View key={category.key} style={styles.settingRow}>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{category.title}</Text>
                <Text style={styles.settingDescription}>{category.description}</Text>
              </View>
              <Switch
                value={settings[category.key] || false}
                onValueChange={(value) => handleCategoryToggle(category.key, value)}
                disabled={isUpdating}
                thumbColor={settings[category.key] ? colors.primary.green : colors.gray[300]}
                trackColor={{
                  false: colors.gray[200],
                  true: `${colors.primary.green}40`,
                }}
              />
            </View>
          ))}
        </View>
      )}

      {!permission && (
        <View style={styles.permissionHint}>
          <Text style={styles.permissionHintText}>
            💡 To enable notifications, you may need to allow them in your device settings under Settings → Notifications → Rent It Forward
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  section: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  sectionDescription: {
    fontSize: typography.sizes.sm,
    color: colors.gray[600],
    marginBottom: spacing.md,
    lineHeight: typography.lineHeights.relaxed * typography.sizes.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  settingContent: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.gray[900],
    marginBottom: spacing.xs / 2,
  },
  settingDescription: {
    fontSize: typography.sizes.sm,
    color: colors.gray[600],
    lineHeight: typography.lineHeights.normal * typography.sizes.sm,
  },
  permissionHint: {
    margin: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  permissionHintText: {
    fontSize: typography.sizes.sm,
    color: colors.gray[700],
    lineHeight: typography.lineHeights.relaxed * typography.sizes.sm,
  },
}); 