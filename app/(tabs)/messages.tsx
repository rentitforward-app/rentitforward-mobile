import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../src/components/AuthProvider';
import { supabase } from '../../src/lib/supabase';
import { Header, HeaderPresets } from '../../src/components/Header';

interface Message {
  id: string;
  bookingId?: string;
  otherUserId: string;
  otherUser: {
    id: string;
    full_name: string;
    avatar_url?: string;
    verified: boolean;
  };
  lastMessage: {
    id: string;
    content: string;
    sent_at: string;
    sender_id: string;
    message_type: 'text' | 'image' | 'system';
  };
  unreadCount: number;
  updatedAt: string;
  booking?: {
    id: string;
    status: string;
    listing?: {
      title: string;
    };
  };
}

export default function MessagesTab() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch user messages from real conversations table
  const { data: messages = [], isLoading, refetch } = useQuery({
    queryKey: ['messages', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Fetch conversations where user is a participant
      console.log('🔍 Fetching conversations for user:', user.id);
      const { data: conversationsData, error } = await supabase
        .from('conversations')
        .select(`
          id,
          booking_id,
          listing_id,
          participants,
          last_message,
          last_message_at,
          updated_at,
          booking:bookings(
            id,
            status,
            owner_id,
            renter_id,
            listing:listings(title)
          ),
          listing:listings(
            id,
            title,
            owner_id
          )
        `)
        .contains('participants', [user.id])
        .order('updated_at', { ascending: false });
      
      console.log('📊 Found conversations:', conversationsData?.length || 0);
      console.log('📋 Conversations data:', conversationsData);
      
      if (error) throw error;

      // Transform conversations and fetch other user data
      const messagesWithUsers = await Promise.all(
        (conversationsData || []).map(async (conv) => {
          // Find the other participant
          const otherUserId = conv.participants.find(id => id !== user.id);
          
          if (!otherUserId) return null;

          // Fetch other user's profile
          const { data: otherUserData, error: userError } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, verified')
            .eq('id', otherUserId)
            .single();

          // Skip this conversation if we can't find the other user
          if (userError || !otherUserData) {
            console.warn('Could not find other user profile:', otherUserId, userError);
            return null;
          }

          // Get the last viewed timestamp for this conversation
          const lastViewedKey = `conversation_viewed_${conv.id}`;
          let lastViewedTimestamp: string | null = null;
          
          try {
            lastViewedTimestamp = await AsyncStorage.getItem(lastViewedKey);
          } catch (error) {
            console.warn('Error getting last viewed timestamp:', error);
          }
          
          let unreadCount = 0;
          
          if (lastViewedTimestamp) {
            // Count messages created after the last viewed timestamp (excluding user's own messages)
            const { count, error: countError } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('conversation_id', conv.id)
              .neq('sender_id', user.id)
              .gt('created_at', lastViewedTimestamp);

            if (countError) {
              console.warn('Error fetching unread count:', countError);
            } else {
              unreadCount = count || 0;
            }
          } else {
            // If no timestamp exists, count all messages from other users
            const { count, error: countError } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('conversation_id', conv.id)
              .neq('sender_id', user.id);

            if (countError) {
              console.warn('Error fetching unread count:', countError);
            } else {
              unreadCount = count || 0;
            }
          }

          // Handle both booking conversations and inquiry conversations
          const isInquiry = !conv.booking_id;
          
          return {
            id: conv.id,
            bookingId: conv.booking_id || conv.id, // Use conversation ID for inquiries
            otherUserId: otherUserId,
            otherUser: {
              id: otherUserData.id,
              full_name: otherUserData.full_name || '',
              avatar_url: otherUserData.avatar_url,
              verified: otherUserData.verified || false,
            },
            lastMessage: {
              id: 'last',
              content: conv.last_message || (isInquiry ? 'Inquiry started' : 'No messages yet'),
              sent_at: conv.last_message_at || conv.updated_at,
              sender_id: 'system',
              message_type: 'text' as const,
            },
            unreadCount: unreadCount,
            updatedAt: conv.updated_at,
            booking: isInquiry ? {
              // Create a pseudo-booking for inquiries
              id: conv.id,
              status: 'inquiry',
              listing: Array.isArray(conv.listing) ? conv.listing[0] : conv.listing,
            } : (conv.booking ? (() => {
              const bookingData = Array.isArray(conv.booking) ? conv.booking[0] : conv.booking;
              return bookingData ? {
                id: bookingData.id,
                status: bookingData.status,
                listing: Array.isArray(bookingData.listing) ? bookingData.listing[0] : bookingData.listing,
              } : null;
            })() : null),
          };
        })
      );

      // Filter out null values and return
      return messagesWithUsers.filter(msg => msg !== null);
    },
    enabled: !!user?.id,
  });

  // Set up real-time subscription for conversation updates
  useEffect(() => {
    if (!user?.id) return;

    console.log('🔔 Setting up real-time subscription for conversations, user:', user.id);
    console.log('🔔 Current messages count:', messages.length);
    
    const channel = supabase
      .channel('conversations:updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
        },
        (payload) => {
          console.log('🔄 Conversation updated (raw):', payload.new);
          
          // Check if user is a participant
          const participants = payload.new.participants || [];
          if (!participants.includes(user.id)) {
            console.log('❌ Conversation update not for user, ignoring');
            return;
          }
          
          console.log('✅ Processing conversation update for user');
          // Refetch conversations to get updated data
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversations',
        },
        (payload) => {
          console.log('🆕 New conversation created (raw):', payload.new);
          
          // Check if user is a participant
          const participants = payload.new.participants || [];
          if (!participants.includes(user.id)) {
            console.log('❌ New conversation not for user, ignoring');
            return;
          }
          
          console.log('✅ New conversation for user, refetching');
          // Refetch conversations to get updated data
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          console.log('🔥 New message received (raw):', payload.new);
          
          // Always refetch to update last message and unread counts
          // This is simpler and more reliable than trying to filter client-side
          console.log('🔄 Refetching conversations due to new message');
          refetch();
        }
      )
      .subscribe((status) => {
        console.log('📡 Conversations subscription status:', status);
      });

    return () => {
      console.log('🔕 Cleaning up conversations real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id, refetch]);

  // Filter messages based on search
  const filteredMessages = messages.filter(msg =>
    msg.otherUser?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (Array.isArray(msg.booking?.listing) ? msg.booking?.listing[0]?.title : msg.booking?.listing?.title)?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Format time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' });
    }
  };

  // Get status indicator color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'inquiry':
        return '#3b82f6'; // Blue for inquiries
      case 'pending':
        return '#f59e0b';
      case 'confirmed':
      case 'active':
        return '#10b981';
      case 'completed':
        return '#6b7280';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  // Mark conversation as read when opened
  const markConversationAsRead = async (conversationId: string) => {
    try {
      const viewedAt = new Date().toISOString();
      await AsyncStorage.setItem(`conversation_viewed_${conversationId}`, viewedAt);
      
      // Refetch to update the UI
      refetch();
    } catch (error) {
      console.warn('Error marking conversation as read:', error);
    }
  };

  // Render message item
  const renderMessage = ({ item }: { item: Message }) => (
    <TouchableOpacity
      style={styles.messageCard}
      onPress={() => {
        // Mark as read before navigating
        markConversationAsRead(item.id);
        // For inquiries, navigate to conversation ID; for bookings, use booking ID
        const navigationId = item.booking?.status === 'inquiry' ? item.id : item.bookingId;
        router.push(`/conversations/${navigationId}`);
      }}
    >
      <View style={styles.messageHeader}>
        {/* Avatar placeholder */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.otherUser.full_name.charAt(0).toUpperCase()}
          </Text>
        </View>

        {/* User info and message */}
        <View style={styles.messageContent}>
          <View style={styles.messageTop}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {item.otherUser.full_name}
              </Text>
              {item.otherUser.verified && (
                <Text style={styles.verifiedBadge}>✓</Text>
              )}
            </View>
            
            <View style={styles.messageMeta}>
              <Text style={styles.timeText}>{formatTime(item.lastMessage.sent_at)}</Text>
              {item.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{item.unreadCount}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Booking info */}
          {item.booking && (
            <View style={styles.bookingInfo}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.booking.status) }]} />
              <Text style={styles.bookingText} numberOfLines={1}>
                {(Array.isArray(item.booking.listing) ? item.booking.listing[0]?.title : item.booking.listing?.title) || `Booking #${item.booking.id.substring(0, 8)}`}
              </Text>
            </View>
          )}

          {/* Last message */}
          <Text style={styles.lastMessage} numberOfLines={2}>
            {item.lastMessage.content}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>No messages yet</Text>
      <Text style={styles.emptyDescription}>
        Your messages with other users will appear here when you start booking items or receive inquiries about your listings.
      </Text>
      <TouchableOpacity 
        style={styles.emptyAction} 
        onPress={() => router.push('/(tabs)/browse')}
      >
        <Text style={styles.emptyActionText}>Browse Items</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header {...HeaderPresets.main('Messages')} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header {...HeaderPresets.main('Messages')} />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search messages..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
      </View>

      {/* Messages List */}
      <FlatList
        data={filteredMessages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={[
          styles.listContainer,
          filteredMessages.length === 0 && styles.emptyListContainer,
        ]}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  searchContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  messageCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  messageHeader: {
    flexDirection: 'row',
    padding: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#44d62c',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  messageContent: {
    flex: 1,
  },
  messageTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginRight: 6,
  },
  verifiedBadge: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  messageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#6b7280',
  },
  unreadBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  bookingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  bookingText: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  lastMessage: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  emptyAction: {
    backgroundColor: '#44d62c',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});
