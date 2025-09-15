import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../src/components/AuthProvider';
import { supabase } from '../../src/lib/supabase';

interface Message {
  id: string;
  content: string;
  senderId: string;
  messageType: 'text' | 'image' | 'system';
  sentAt: string;
  edited?: boolean;
  editedAt?: string;
}

interface ConversationData {
  id: string;
  bookingId: string;
  booking: {
    id: string;
    status: string;
    listingId: string;
    ownerId: string;
    renterId: string;
    startDate: string;
    endDate: string;
    listing?: {
      title: string;
    };
  };
  otherUser: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
    verification_status: string;
  };
}

export default function ConversationScreen() {
  const { id: bookingId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const flatListRef = useRef<FlatList>(null);
  
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Fetch conversation data
  const { data: conversation, isLoading: conversationLoading } = useQuery({
    queryKey: ['conversation', bookingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          status,
          listing_id,
          owner_id,
          renter_id,
          start_date,
          end_date,
          listing:listings(title),
          owner:profiles!bookings_owner_id_fkey(id, first_name, last_name, avatar_url, verification_status),
          renter:profiles!bookings_renter_id_fkey(id, first_name, last_name, avatar_url, verification_status)
        `)
        .eq('id', bookingId)
        .single();
      
      if (error) throw error;

      const isOwner = data.owner_id === user?.id;
      const otherUser = isOwner ? 
        (Array.isArray(data.renter) ? data.renter[0] : data.renter) : 
        (Array.isArray(data.owner) ? data.owner[0] : data.owner);

      return {
        id: bookingId,
        bookingId: data.id,
        booking: {
          id: data.id,
          status: data.status,
          listingId: data.listing_id,
          ownerId: data.owner_id,
          renterId: data.renter_id,
          startDate: data.start_date,
          endDate: data.end_date,
          listing: Array.isArray(data.listing) ? data.listing[0] : data.listing,
        },
        otherUser,
      } as ConversationData;
    },
    enabled: !!bookingId && !!user?.id,
  });

  // Fetch messages (simulated for now)
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', bookingId],
    queryFn: async () => {
      // In a real app, you'd have a messages table
      // For now, we'll return simulated messages
      const simulatedMessages: Message[] = [
        {
          id: '1',
          content: 'Hi! I\'m interested in renting your item. Is it available for the dates I selected?',
          senderId: conversation?.booking.renterId || '',
          messageType: 'text',
          sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          content: 'Hello! Yes, it\'s available for those dates. Let me know if you have any questions about the item.',
          senderId: conversation?.booking.ownerId || '',
          messageType: 'text',
          sentAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          content: 'Great! I\'ll proceed with the booking. When would be a good time for pickup?',
          senderId: conversation?.booking.renterId || '',
          messageType: 'text',
          sentAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'system-1',
          content: `Booking request submitted for ${conversation?.booking.listing?.title || 'this item'}`,
          senderId: 'system',
          messageType: 'system',
          sentAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
      ];

      return simulatedMessages;
    },
    enabled: !!conversation,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      // In a real app, you'd save to a messages table
      const newMessage: Message = {
        id: Date.now().toString(),
        content,
        senderId: user?.id || '',
        messageType: 'text',
        sentAt: new Date().toISOString(),
      };
      
      return newMessage;
    },
    onSuccess: (newMessage) => {
      // Add message to local state
      queryClient.setQueryData(['messages', bookingId], (old: Message[] = []) => [
        ...old,
        newMessage,
      ]);
      
      setMessageText('');
      setIsSending(false);
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    },
    onError: (error) => {
      console.error('Send message error:', error);
      setIsSending(false);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    },
  });

  // Handle send message
  const handleSendMessage = () => {
    const trimmedText = messageText.trim();
    if (!trimmedText || isSending) return;

    setIsSending(true);
    sendMessageMutation.mutate(trimmedText);
  };

  // Format message time
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-AU', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      return date.toLocaleDateString('en-AU', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  // Render message bubble
  const renderMessage = ({ item: message }: { item: Message }) => {
    const isOwnMessage = message.senderId === user?.id;
    const isSystemMessage = message.messageType === 'system';

    if (isSystemMessage) {
      return (
        <View style={styles.systemMessageContainer}>
          <Text style={styles.systemMessage}>{message.content}</Text>
          <Text style={styles.systemMessageTime}>
            {formatMessageTime(message.sentAt)}
          </Text>
        </View>
      );
    }

    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer,
      ]}>
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble,
        ]}>
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
          ]}>
            {message.content}
          </Text>
        </View>
        <Text style={[
          styles.messageTime,
          isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime,
        ]}>
          {formatMessageTime(message.sentAt)}
        </Text>
      </View>
    );
  };

  // Get status color
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

  if (conversationLoading || messagesLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading conversation...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!conversation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Conversation not found</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {conversation.otherUser.first_name} {conversation.otherUser.last_name}
          </Text>
          {conversation.otherUser.verification_status === 'verified' && (
            <Text style={styles.verifiedBadge}>✓ Verified</Text>
          )}
        </View>

        <TouchableOpacity 
          style={styles.detailsButton}
          onPress={() => router.push(`/bookings/${conversation.bookingId}`)}
        >
          <Text style={styles.detailsButtonText}>Details</Text>
        </TouchableOpacity>
      </View>

      {/* Booking Context */}
      <View style={styles.bookingContext}>
        <View style={styles.contextHeader}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(conversation.booking.status) }]} />
          <Text style={styles.contextTitle}>
            {conversation.booking.listing?.title || `Booking #${conversation.booking.id.substring(0, 8)}`}
          </Text>
        </View>
        <Text style={styles.contextDates}>
          {new Date(conversation.booking.startDate).toLocaleDateString('en-AU')} - {new Date(conversation.booking.endDate).toLocaleDateString('en-AU')}
        </Text>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onLayout={() => {
          // Scroll to bottom when component mounts
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: false });
          }, 100);
        }}
      />

      {/* Message Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={styles.messageInputContainer}>
          <TextInput
            style={styles.messageInput}
            placeholder="Type a message..."
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={1000}
            returnKeyType="send"
            onSubmitEditing={handleSendMessage}
            blurOnSubmit={false}
          />
          
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!messageText.trim() || isSending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={!messageText.trim() || isSending}
          >
            <Text style={styles.sendButtonText}>
              {isSending ? '...' : 'Send'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    marginBottom: 20,
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#44d62c',
    fontWeight: '500',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  verifiedBadge: {
    fontSize: 12,
    color: '#10b981',
    marginTop: 2,
  },
  detailsButton: {
    padding: 8,
  },
  detailsButtonText: {
    fontSize: 16,
    color: '#44d62c',
    fontWeight: '500',
  },
  bookingContext: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  contextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  contextTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  contextDates: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 16,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  ownMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 4,
  },
  ownMessageBubble: {
    backgroundColor: '#44d62c',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#ffffff',
  },
  otherMessageText: {
    color: '#111827',
  },
  messageTime: {
    fontSize: 12,
  },
  ownMessageTime: {
    color: '#6b7280',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#6b7280',
    textAlign: 'left',
  },
  systemMessageContainer: {
    alignSelf: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  systemMessage: {
    fontSize: 14,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    textAlign: 'center',
  },
  systemMessageTime: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  inputContainer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    gap: 12,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: '#f9fafb',
  },
  sendButton: {
    backgroundColor: '#44d62c',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  button: {
    backgroundColor: '#44d62c',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
}); 