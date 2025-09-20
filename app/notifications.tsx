import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography } from '../src/lib/design-system';
import { useFCM, useNotificationBadge } from '../src/components/FCMProvider';
import { useTestNotifications } from '../src/hooks/useNotifications';

interface StoredNotification {
  id: string;
  title: string;
  body: string;
  receivedAt: string;
  isRead: boolean;
  data?: {
    type?: string;
    booking_id?: string;
    message_id?: string;
    action_url?: string;
  };
}

export default function NotificationsScreen() {
  const router = useRouter();
  
  // FCM hooks
  const { hasPermission, isEnabled } = useFCM();
  const { count, clear } = useNotificationBadge();
  const { testAllNotifications } = useTestNotifications();

  const [notifications, setNotifications] = useState<StoredNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load notifications from storage
  const loadNotifications = async () => {
    try {
      const stored = await AsyncStorage.getItem('fcm_notifications');
      if (stored) {
        const parsedNotifications = JSON.parse(stored);
        setNotifications(parsedNotifications);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  useEffect(() => {
    loadNotifications();
    setLoading(false);
  }, []);

  // Refresh notifications
  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const updatedNotifications = notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      );

      setNotifications(updatedNotifications);
      await AsyncStorage.setItem('fcm_notifications', JSON.stringify(updatedNotifications));

      // Update badge count
      const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
      if (unreadCount === 0) clear();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Handle notification tap
  const handleNotificationTap = async (notification: StoredNotification) => {
    // Mark as read if not already
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Handle navigation based on notification data
    if (notification.data?.action_url) {
      // Navigate to specific URL
      console.log('Navigate to:', notification.data.action_url);
      // router.push(notification.data.action_url);
    } else if (notification.data?.type) {
      // Navigate based on notification type
      switch (notification.data.type) {
        case 'booking_request':
        case 'booking_confirmed':
        case 'booking_cancelled':
          if (notification.data.booking_id) {
            router.push(`/bookings/${notification.data.booking_id}`);
          }
          break;
        case 'new_message':
          if (notification.data.message_id) {
            router.push(`/conversations/${notification.data.message_id}`);
          }
          break;
        default:
          console.log('Unknown notification type:', notification.data.type);
      }
    }
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              setNotifications([]);
              await AsyncStorage.removeItem('fcm_notifications');
              clear(); // Clear badge count
            } catch (error) {
              console.error('Failed to clear notifications:', error);
            }
          },
        },
      ]
    );
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const updatedNotifications = notifications.map(notification => ({
        ...notification,
        isRead: true,
      }));

      setNotifications(updatedNotifications);
      await AsyncStorage.setItem('fcm_notifications', JSON.stringify(updatedNotifications));
      clear(); // Clear badge count
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Get notification icon based on type
  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'booking_request':
      case 'booking_confirmed':
      case 'booking_cancelled':
        return 'calendar';
      case 'new_message':
        return 'chatbubble';
      case 'payment_received':
      case 'payment_processing':
        return 'card';
      case 'review_received':
        return 'star';
      default:
        return 'notifications';
    }
  };

  // Get notification color based on type
  const getNotificationColor = (type?: string) => {
    switch (type) {
      case 'booking_request':
      case 'booking_confirmed':
        return colors.semantic.success;
      case 'booking_cancelled':
        return colors.semantic.error;
      case 'new_message':
        return colors.primary.main;
      case 'payment_received':
        return colors.semantic.success;
      case 'payment_processing':
        return colors.semantic.warning;
      case 'review_received':
        return colors.semantic.warning;
      default:
        return colors.primary.main;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.neutral.lightGray }}>
      
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Actions Bar */}
        {notifications.length > 0 && (
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            backgroundColor: colors.white,
            borderBottomWidth: 1,
            borderBottomColor: colors.gray[200],
          }}>
            <TouchableOpacity
              onPress={markAllAsRead}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: spacing.xs,
                paddingHorizontal: spacing.sm,
              }}
            >
              <Ionicons name="checkmark-circle-outline" size={16} color={colors.primary.main} />
              <Text style={{
                marginLeft: spacing.xs,
                fontSize: typography.sizes.sm,
                color: colors.primary.main,
                fontWeight: typography.weights.medium,
              }}>
                Mark all read
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={clearAllNotifications}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: spacing.xs,
                paddingHorizontal: spacing.sm,
              }}
            >
              <Ionicons name="trash-outline" size={16} color={colors.semantic.error} />
              <Text style={{
                marginLeft: spacing.xs,
                fontSize: typography.sizes.sm,
                color: colors.semantic.error,
                fontWeight: typography.weights.medium,
              }}>
                Clear all
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Notifications List */}
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: spacing['2xl'] }}>
            <ActivityIndicator size="large" color={colors.primary.main} />
            <Text style={{ marginTop: spacing.md, color: colors.text.secondary }}>
              Loading notifications...
            </Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: spacing['2xl'],
            paddingHorizontal: spacing.xl,
          }}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: colors.gray[100],
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: spacing.lg,
            }}>
              <Ionicons 
                name="notifications-outline" 
                size={32} 
                color={colors.gray[400]} 
              />
            </View>
            <Text style={{
              fontSize: typography.sizes.lg,
              fontWeight: typography.weights.semibold,
              color: colors.text.primary,
              textAlign: 'center',
              marginBottom: spacing.sm,
            }}>
              No Notifications Yet
            </Text>
            <Text style={{
              fontSize: typography.sizes.base,
              color: colors.text.secondary,
              textAlign: 'center',
              lineHeight: 20,
            }}>
              You'll see notifications here when you receive booking requests, messages, and other updates.
            </Text>
          </View>
        ) : (
          <View style={{ paddingTop: spacing.sm }}>
            {notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                onPress={() => handleNotificationTap(notification)}
                style={{
                  backgroundColor: notification.isRead ? colors.white : colors.primary.main + '05',
                  borderBottomWidth: 1,
                  borderBottomColor: colors.gray[100],
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.md,
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  borderWidth: notification.isRead ? 1 : 2,
                  borderColor: notification.isRead ? colors.gray[200] : colors.primary.main + '20',
                  marginHorizontal: spacing.md,
                  marginBottom: spacing.xs,
                  borderRadius: 8,
                }}
                activeOpacity={0.7}
              >
                {/* Icon */}
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: getNotificationColor(notification.data?.type) + '15',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: spacing.sm,
                  marginTop: 2,
                }}>
                  <Ionicons
                    name={getNotificationIcon(notification.data?.type)} 
                    size={20}
                    color={getNotificationColor(notification.data?.type)} 
                  />
                </View>

                {/* Content */}
                <View style={{ flex: 1 }}>
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: spacing.xs,
                  }}>
                    <Text style={{
                      fontSize: typography.sizes.base,
                      fontWeight: notification.isRead ? typography.weights.medium : typography.weights.semibold,
                      color: colors.text.primary,
                      flex: 1,
                      marginRight: spacing.sm,
                    }}>
                      {notification.title}
                    </Text>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{
                        fontSize: typography.sizes.xs,
                        color: colors.text.secondary,
                      }}>
                        {formatTimeAgo(notification.receivedAt)}
                      </Text>
                      {!notification.isRead && (
                        <View style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: colors.primary.main,
                          marginTop: spacing.xs / 2,
                        }} />
                      )}
                    </View>
                  </View>
                  
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    color: colors.text.secondary,
                    lineHeight: 18,
                  }}>
                    {notification.body}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
