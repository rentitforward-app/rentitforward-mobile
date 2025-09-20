import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../src/lib/design-system';
import { Header } from '../../src/components/Header';
import { useFCM, useNotificationBadge } from '../../src/components/FCMProvider';
import { useTestNotifications } from '../../src/hooks/useNotifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface StoredNotification {
  id: string;
  title: string;
  body: string;
  data: any;
  receivedAt: string;
  isRead: boolean;
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isInitialized } = useFCM();
  const { count, clear } = useNotificationBadge();
  const { testAllNotifications } = useTestNotifications();
  
  const [notifications, setNotifications] = useState<StoredNotification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (isInitialized) {
      loadNotifications();
    }
  }, [isInitialized]);

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
      await AsyncStorage.setItem('fcm_badge_count', unreadCount.toString());
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Handle notification tap
  const handleNotificationTap = async (notification: StoredNotification) => {
    // Mark as read
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Handle navigation based on notification data
    if (notification.data?.action_url) {
      // Handle deep linking
      console.log('Navigate to:', notification.data.action_url);
      // router.push(notification.data.action_url);
    } else if (notification.data?.type) {
      // Handle navigation based on type
      switch (notification.data.type) {
        case 'booking_request':
        case 'booking_confirmed':
        case 'booking_cancelled':
        case 'booking_completed':
          if (notification.data.booking_id) {
            router.push(`/bookings/${notification.data.booking_id}`);
          } else {
            router.push('/bookings');
          }
          break;
          
        case 'message_received':
          if (notification.data.message_id) {
            router.push(`/conversations/${notification.data.message_id}`);
          } else {
            router.push('/conversations');
          }
          break;
          
        case 'payment_received':
        case 'payment_failed':
          router.push('/account/earnings');
          break;
          
        default:
          console.log('Unknown notification type:', notification.data.type);
      }
    }
  };

  // Clear all notifications
  const handleClearAll = () => {
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
              await clear();
              setNotifications([]);
              await AsyncStorage.removeItem('fcm_notifications');
            } catch (error) {
              console.error('Failed to clear notifications:', error);
            }
          },
        },
      ]
    );
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      const updatedNotifications = notifications.map(notification => ({
        ...notification,
        isRead: true,
      }));
      
      setNotifications(updatedNotifications);
      await AsyncStorage.setItem('fcm_notifications', JSON.stringify(updatedNotifications));
      await AsyncStorage.setItem('fcm_badge_count', '0');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  // Get notification icon based on type
  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'booking_request':
      case 'booking_confirmed':
      case 'booking_cancelled':
      case 'booking_completed':
        return 'calendar';
      case 'message_received':
        return 'chatbubble';
      case 'payment_received':
      case 'payment_failed':
        return 'card';
      case 'review_received':
      case 'review_request':
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
        return colors.semantic.warning;
      case 'payment_failed':
        return colors.semantic.error;
      case 'message_received':
        return colors.semantic.info;
      default:
        return colors.primary.main;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.gray[50] }}>
      <Header 
        title="Notifications" 
        rightElement={
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {__DEV__ && (
              <TouchableOpacity
                onPress={testAllNotifications}
                style={{
                  paddingHorizontal: spacing.sm,
                  paddingVertical: spacing.xs,
                }}
              >
                <Text style={{
                  color: colors.semantic.info,
                  fontSize: typography.sizes.sm,
                  fontWeight: typography.weights.medium,
                }}>
                  Test
                </Text>
              </TouchableOpacity>
            )}
            {notifications.length > 0 && (
              <>
                {unreadCount > 0 && (
                  <TouchableOpacity
                    onPress={handleMarkAllRead}
                    style={{
                      paddingHorizontal: spacing.sm,
                      paddingVertical: spacing.xs,
                    }}
                  >
                    <Text style={{
                      color: colors.primary.main,
                      fontSize: typography.sizes.sm,
                      fontWeight: typography.weights.medium,
                    }}>
                      Mark All Read
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={handleClearAll}
                  style={{
                    paddingHorizontal: spacing.sm,
                    paddingVertical: spacing.xs,
                  }}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.gray[600]} />
                </TouchableOpacity>
              </>
            )}
          </View>
        }
      />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary.main}
          />
        }
      >
        {loading ? (
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: spacing.xl * 2,
          }}>
            <Text style={{
              fontSize: typography.sizes.base,
              color: colors.gray[600],
            }}>
              Loading notifications...
            </Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: spacing.xl * 2,
            paddingHorizontal: spacing.lg,
          }}>
            <Ionicons 
              name="notifications-outline" 
              size={64} 
              color={colors.gray[400]} 
              style={{ marginBottom: spacing.lg }}
            />
            <Text style={{
              fontSize: typography.sizes.lg,
              fontWeight: typography.weights.semibold,
              color: colors.gray[900],
              textAlign: 'center',
              marginBottom: spacing.sm,
            }}>
              No Notifications Yet
            </Text>
            <Text style={{
              fontSize: typography.sizes.base,
              color: colors.gray[600],
              textAlign: 'center',
              lineHeight: typography.lineHeights.relaxed * typography.sizes.base,
            }}>
              You'll see notifications here when you receive booking requests, messages, and other updates.
            </Text>
          </View>
        ) : (
          <View style={{ padding: spacing.lg }}>
            {notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                onPress={() => handleNotificationTap(notification)}
                style={{
                  backgroundColor: notification.isRead ? colors.white : colors.primary.main + '05',
                  borderRadius: 12,
                  padding: spacing.lg,
                  marginBottom: spacing.md,
                  borderWidth: notification.isRead ? 1 : 2,
                  borderColor: notification.isRead ? colors.gray[200] : colors.primary.main + '20',
                  shadowColor: colors.black,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  marginBottom: spacing.sm,
                }}>
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: getNotificationColor(notification.data?.type) + '15',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: spacing.md,
                  }}>
                    <Ionicons 
                      name={getNotificationIcon(notification.data?.type)} 
                      size={20} 
                      color={getNotificationColor(notification.data?.type)} 
                    />
                  </View>
                  
                  <View style={{ flex: 1 }}>
                    <View style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: spacing.xs,
                    }}>
                      <Text style={{
                        fontSize: typography.sizes.base,
                        fontWeight: typography.weights.semibold,
                        color: colors.gray[900],
                        flex: 1,
                        marginRight: spacing.sm,
                      }}>
                        {notification.title}
                      </Text>
                      
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{
                          fontSize: typography.sizes.xs,
                          color: colors.gray[500],
                          marginRight: spacing.xs,
                        }}>
                          {formatTimeAgo(notification.receivedAt)}
                        </Text>
                        {!notification.isRead && (
                          <View style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: colors.primary.main,
                          }} />
                        )}
                      </View>
                    </View>
                    
                    <Text style={{
                      fontSize: typography.sizes.sm,
                      color: colors.gray[600],
                      lineHeight: typography.lineHeights.normal * typography.sizes.sm,
                    }}>
                      {notification.body}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
