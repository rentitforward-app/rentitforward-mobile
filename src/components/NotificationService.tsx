import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthProvider';

interface Notification {
  id: string;
  type: 'listing_approved' | 'listing_rejected' | 'booking_request' | 'general';
  title: string;
  message: string;
  data?: any;
  created_at: string;
  read: boolean;
}

export const NotificationService: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;

    // Subscribe to real-time notifications
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          
          // Show immediate alert for important notifications
          if (newNotification.type === 'listing_approved') {
            Alert.alert(
              '🎉 Listing Approved!',
              `Your listing "${newNotification.data?.listing_title || 'item'}" has been approved and is now live!`,
              [
                { text: 'View Listing', onPress: () => {
                  // Navigate to listing - you can implement navigation here
                  console.log('Navigate to listing:', newNotification.data?.listing_id);
                }},
                { text: 'OK' }
              ]
            );
          } else if (newNotification.type === 'listing_rejected') {
            Alert.alert(
              '❌ Listing Needs Updates',
              `Your listing "${newNotification.data?.listing_title || 'item'}" needs some updates before it can go live. Check your email for details.`,
              [{ text: 'OK' }]
            );
          }
          
          setNotifications(prev => [newNotification, ...prev]);
        }
      )
      .subscribe();

    // Load existing unread notifications
    loadNotifications();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // This component doesn't render anything visible - it just handles notifications
  return null;
};

// Hook to use notifications in other components
export const useNotifications = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchUnreadCount = async () => {
      try {
        const { count, error } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('read', false);

        if (error) throw error;
        setUnreadCount(count || 0);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();

    // Subscribe to changes
    const subscription = supabase
      .channel('notification_count')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return { unreadCount };
};

