import React, { useState } from 'react';
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
import { useAuthStore } from '../../src/stores/auth';
import { supabase } from '../../src/lib/supabase';

interface Conversation {
  id: string;
  bookingId?: string;
  otherUserId: string;
  otherUser: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
    verification_status: string;
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

export default function ConversationsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch user conversations
  const { data: conversations = [], isLoading, refetch } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // This is a simplified query - in a real app, you'd have a conversations table
      // For now, we'll fetch from bookings and simulate conversations
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
          id,
          status,
          owner_id,
          renter_id,
          updated_at,
          listing:listings(title),
          owner:profiles!bookings_owner_id_fkey(id, first_name, last_name, avatar_url, verification_status),
          renter:profiles!bookings_renter_id_fkey(id, first_name, last_name, avatar_url, verification_status)
        `)
        .or(`owner_id.eq.${user.id},renter_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;

      // Transform bookings into conversations
      const conversations = bookings.map(booking => {
        const isOwner = booking.owner_id === user.id;
        const otherUser = isOwner ? booking.renter : booking.owner;
        const otherUserData = Array.isArray(otherUser) ? otherUser[0] : otherUser;
        
        return {
          id: `booking-${booking.id}`,
          bookingId: booking.id,
          otherUserId: otherUserData?.id || '',
          otherUser: otherUserData,
          lastMessage: {
            id: '1',
            content: getLastMessageForBooking(booking.status),
            sent_at: booking.updated_at,
            sender_id: 'system',
            message_type: 'system' as const,
          },
          unreadCount: Math.floor(Math.random() * 3), // Simulated unread count
          updatedAt: booking.updated_at,
          booking: {
            id: booking.id,
            status: booking.status,
            listing: booking.listing,
          },
        };
      });

      return conversations;
    },
    enabled: !!user?.id,
  });

  // Generate last message based on booking status
  const getLastMessageForBooking = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Booking request submitted, awaiting approval';
      case 'confirmed':
        return 'Booking confirmed! Please coordinate pickup/delivery';
      case 'active':
        return 'Booking is currently active';
      case 'completed':
        return 'Booking completed successfully';
      case 'cancelled':
        return 'Booking has been cancelled';
      default:
        return 'No recent messages';
    }
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv =>
    conv.otherUser.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.otherUser.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (Array.isArray(conv.booking?.listing) ? conv.booking?.listing[0]?.title : conv.booking?.listing?.title)?.toLowerCase().includes(searchQuery.toLowerCase())
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

  // Render conversation item
  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationCard}
      onPress={() => router.push(`/conversations/${item.bookingId}`)}
    >
      <View style={styles.conversationHeader}>
        {/* Avatar placeholder */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.otherUser.first_name.charAt(0).toUpperCase()}
          </Text>
        </View>

        {/* User info and message */}
        <View style={styles.conversationContent}>
          <View style={styles.conversationTop}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {item.otherUser.first_name} {item.otherUser.last_name}
              </Text>
              {item.otherUser.verification_status === 'verified' && (
                <Text style={styles.verifiedBadge}>✓</Text>
              )}
            </View>
            
            <View style={styles.conversationMeta}>
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
      <Text style={styles.emptyTitle}>No conversations yet</Text>
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
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
      </View>

      {/* Conversations List */}
      <FlatList
        data={filteredConversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={[
          styles.listContainer,
          filteredConversations.length === 0 && styles.emptyListContainer,
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
  header: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
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
  conversationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  conversationHeader: {
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
  conversationContent: {
    flex: 1,
  },
  conversationTop: {
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
  conversationMeta: {
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