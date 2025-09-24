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
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../src/components/AuthProvider';
import { supabase } from '../../src/lib/supabase';
import { ConversationShimmer } from '../../src/components/ShimmerLoading';
import { Header } from '../../src/components/Header';

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
    full_name: string;
    avatar_url?: string;
    verified: boolean;
  };
}

export default function ConversationScreen() {
  const { id: conversationId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const flatListRef = useRef<FlatList>(null);
  
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Debug: Log the route parameters
  console.log('🚀 ConversationScreen loaded with:', { conversationId, userId: user?.id });

  // Early return for debugging - show basic screen first
  if (!conversationId) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container}>
          <Header
            title="Conversation"
            showBackButton={true}
            showNotificationIcon={false}
            onBackPress={() => router.back()}
          />
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>No conversation ID provided</Text>
            <TouchableOpacity style={styles.button} onPress={() => router.back()}>
              <Text style={styles.buttonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container}>
          <Header
            title="Conversation"
            showBackButton={true}
            showNotificationIcon={false}
            onBackPress={() => router.back()}
          />
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>User not authenticated</Text>
            <TouchableOpacity style={styles.button} onPress={() => router.back()}>
              <Text style={styles.buttonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </>
    );
  }

  // Fetch conversation data
  const { data: conversation, isLoading: conversationLoading, error: conversationError } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      console.log('🔍 Fetching conversation for ID:', conversationId);
      
      // Fetch conversation data with listing info
      const { data: conversationData, error: conversationError } = await supabase
        .from('conversations')
        .select(`
          id,
          booking_id,
          listing_id,
          participants,
          listing:listings(title)
        `)
        .eq('id', conversationId)
        .single();
      
      if (conversationError) {
        console.error('❌ Error fetching conversation:', conversationError);
        throw conversationError;
      }
      
      // Get the other participant
      const otherUserId = conversationData.participants.find(id => id !== user?.id);
      if (!otherUserId) {
        throw new Error('Other participant not found');
      }
      
      // Fetch other user's profile
      const { data: otherUserData, error: userError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, verified')
        .eq('id', otherUserId)
        .single();
      
      if (userError) {
        console.error('❌ Error fetching other user:', userError);
        throw userError;
      }
      
      // Check if this is an inquiry conversation (no booking_id) or a booking conversation
      if (!conversationData.booking_id) {
        // This is an inquiry conversation
        return {
          id: conversationData.id,
          bookingId: conversationData.id, // Use conversation ID as bookingId for compatibility
          booking: {
            id: conversationData.id,
            status: 'inquiry', // Special status for inquiries
            listingId: conversationData.listing_id,
            ownerId: otherUserId, // The other user is the owner in inquiries
            renterId: user?.id,
            startDate: new Date().toISOString(),
            endDate: new Date().toISOString(),
            listing: Array.isArray(conversationData.listing) ? conversationData.listing[0] : conversationData.listing,
          },
          otherUser: {
            id: otherUserData.id,
            full_name: otherUserData.full_name || '',
            avatar_url: otherUserData.avatar_url,
            verified: otherUserData.verified || false,
          },
        } as ConversationData;
      } else {
        // This is a booking conversation - fetch booking data
        const { data: bookingData, error: bookingError } = await supabase
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
            owner:profiles!bookings_owner_id_fkey(id, full_name, avatar_url, verified),
            renter:profiles!bookings_renter_id_fkey(id, full_name, avatar_url, verified)
          `)
          .eq('id', conversationData.booking_id)
          .single();
        
        if (bookingError) {
          console.error('❌ Error fetching booking data:', bookingError);
          throw bookingError;
        }
        
        console.log('✅ Booking data fetched:', bookingData.id, bookingData.status);

        const isOwner = bookingData.owner_id === user?.id;
        const otherUser = isOwner ? 
          (Array.isArray(bookingData.renter) ? bookingData.renter[0] : bookingData.renter) : 
          (Array.isArray(bookingData.owner) ? bookingData.owner[0] : bookingData.owner);

        return {
          id: conversationData.id,
          bookingId: bookingData.id,
          booking: {
            id: bookingData.id,
            status: bookingData.status,
            listingId: bookingData.listing_id,
            ownerId: bookingData.owner_id,
            renterId: bookingData.renter_id,
            startDate: bookingData.start_date,
            endDate: bookingData.end_date,
            listing: Array.isArray(bookingData.listing) ? bookingData.listing[0] : bookingData.listing,
          },
          otherUser,
        } as ConversationData;
      }
    },
    enabled: !!conversationId && !!user?.id,
  });

  // Fetch real messages from database
  const { data: messages = [], isLoading: messagesLoading, error: messagesError } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      console.log('💬 Fetching messages for conversation ID:', conversationId);
      
      // Fetch messages for this conversation
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          sender_id,
          message_type,
          created_at,
          metadata
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        return [];
      }

      // Transform messages to match our interface
      const transformedMessages: Message[] = (messagesData || []).map(msg => ({
        id: msg.id,
        content: msg.content,
        senderId: msg.sender_id,
        messageType: msg.message_type as 'text' | 'image' | 'system',
        sentAt: msg.created_at,
      }));

      // If no messages exist, add a system message
      if (transformedMessages.length === 0) {
        const isInquiry = conversation?.booking.status === 'inquiry';
        const welcomeMessage = isInquiry 
          ? `Inquiry started for ${conversation?.booking.listing?.title || 'this listing'}. You can ask questions about availability, condition, and other details.`
          : `Conversation started for ${conversation?.booking.listing?.title || 'this booking'}. You can now discuss pickup details and other arrangements.`;
        
        transformedMessages.push({
          id: 'system-welcome',
          content: welcomeMessage,
          senderId: 'system',
          messageType: 'system',
          sentAt: new Date().toISOString(),
        });
      }

      return transformedMessages;
    },
    enabled: !!conversation && !!conversationId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      // Determine receiver ID
      const receiverId = conversation?.booking.ownerId === user?.id 
        ? conversation?.booking.renterId 
        : conversation?.booking.ownerId;

      // Save message to database
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user?.id,
          receiver_id: receiverId,
          booking_id: conversation?.booking.status === 'inquiry' ? null : conversation?.booking.id,
          content,
          message_type: 'text',
          is_read: false,
        })
        .select()
        .single();

      if (messageError) {
        throw messageError;
      }

      // Update conversation's last message
      await supabase
        .from('conversations')
        .update({
          last_message: content,
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', conversationId);

      // Transform to our message format
      const newMessage: Message = {
        id: messageData.id,
        content: messageData.content,
        senderId: messageData.sender_id,
        messageType: messageData.message_type as 'text' | 'image' | 'system',
        sentAt: messageData.created_at,
      };
      
      return newMessage;
    },
    onSuccess: (newMessage) => {
      // Add message to local state
      queryClient.setQueryData(['messages', conversationId], (old: Message[] = []) => [
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

  if (conversationLoading || messagesLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container}>
          <ConversationShimmer />
        </SafeAreaView>
      </>
    );
  }

  if (conversationError) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container}>
          <Header
            title="Conversation"
            showBackButton={true}
            showNotificationIcon={false}
            onBackPress={() => router.back()}
          />
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error loading conversation</Text>
            <Text style={styles.errorText}>{conversationError.message}</Text>
            <TouchableOpacity style={styles.button} onPress={() => router.back()}>
              <Text style={styles.buttonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </>
    );
  }

  if (!conversation) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container}>
          <Header
            title="Conversation"
            showBackButton={true}
            showNotificationIcon={false}
            onBackPress={() => router.back()}
          />
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Conversation not found</Text>
            <Text style={styles.errorText}>Conversation ID: {conversationId}</Text>
            <TouchableOpacity style={styles.button} onPress={() => router.back()}>
              <Text style={styles.buttonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <Header
          title={conversation.otherUser.full_name}
          subtitle={conversation.otherUser.verified ? '✓ Verified' : undefined}
          showBackButton={true}
          showNotificationIcon={true}
          rightAction={
            // Only show booking details button for actual bookings, not inquiries
            conversation.booking.status !== 'inquiry' ? {
              icon: 'information-circle-outline',
              onPress: () => router.push(`/bookings/${conversation.bookingId}`),
              testID: 'conversation-details-button'
            } : undefined
          }
          onBackPress={() => router.back()}
        />

      {/* Booking Context */}
      <View style={styles.bookingContext}>
        <View style={styles.contextHeader}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(conversation.booking.status) }]} />
          <Text style={styles.contextTitle}>
            {conversation.booking.listing?.title || `Booking #${conversation.booking.id.substring(0, 8)}`}
          </Text>
        </View>
        {conversation.booking.status === 'inquiry' ? (
          <Text style={styles.contextDates}>
            Pre-booking inquiry
          </Text>
        ) : (
          <Text style={styles.contextDates}>
            {new Date(conversation.booking.startDate).toLocaleDateString('en-AU')} - {new Date(conversation.booking.endDate).toLocaleDateString('en-AU')}
          </Text>
        )}
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
    </>
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