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
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../src/components/AuthProvider';
import { supabase } from '../../src/lib/supabase';
import { Header, HeaderPresets } from '../../src/components/Header';
import { mobileNotificationApi } from '../../src/lib/notification-api';

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

// Shimmer Loading Component
const ShimmerView = ({ width, height, style }: { width: number | string; height: number; style?: any }) => {
  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, [shimmerValue]);

  const opacity = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: '#e5e7eb',
          borderRadius: 8,
          opacity,
        },
        style,
      ]}
    />
  );
};

// Chat Loading Skeleton Component
const ChatLoadingSkeleton = () => {
  return (
    <View style={styles.chatContainer}>
      {/* Messages area */}
      <View style={styles.messagesContainer}>
        {/* Simulate incoming message */}
        <View style={styles.incomingMessageSkeleton}>
          <ShimmerView width={40} height={40} style={styles.avatarSkeleton} />
          <View style={styles.messageBubbleSkeleton}>
            <ShimmerView width="80%" height={16} style={{ marginBottom: 4 }} />
            <ShimmerView width="60%" height={16} />
          </View>
        </View>

        {/* Simulate outgoing message */}
        <View style={styles.outgoingMessageSkeleton}>
          <View style={styles.messageBubbleSkeletonOutgoing}>
            <ShimmerView width="70%" height={16} style={{ marginBottom: 4 }} />
            <ShimmerView width="50%" height={16} />
          </View>
        </View>

        {/* Simulate another incoming message */}
        <View style={styles.incomingMessageSkeleton}>
          <ShimmerView width={40} height={40} style={styles.avatarSkeleton} />
          <View style={styles.messageBubbleSkeleton}>
            <ShimmerView width="90%" height={16} style={{ marginBottom: 4 }} />
            <ShimmerView width="70%" height={16} style={{ marginBottom: 4 }} />
            <ShimmerView width="40%" height={16} />
          </View>
        </View>

        {/* Simulate outgoing message */}
        <View style={styles.outgoingMessageSkeleton}>
          <View style={styles.messageBubbleSkeletonOutgoing}>
            <ShimmerView width="85%" height={16} />
          </View>
        </View>
      </View>

      {/* Input area skeleton */}
      <View style={styles.inputContainerSkeleton}>
        <ShimmerView width="85%" height={44} style={styles.inputSkeleton} />
        <ShimmerView width={44} height={44} style={styles.sendButtonSkeleton} />
      </View>
    </View>
  );
};

export default function MessageScreen() {
  const { id: bookingId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const flatListRef = useRef<FlatList>(null);
  
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Debug: Log the route parameters
  console.log('🚀 MessageScreen loaded with:', { bookingId, userId: user?.id });

  // Early return for debugging - show basic screen first
  if (!bookingId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No booking ID provided</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>User not authenticated</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Fetch conversation data and create conversation if needed
  const { data: conversation, isLoading: conversationLoading, error: conversationError } = useQuery({
    queryKey: ['conversation', bookingId],
    queryFn: async () => {
      console.log('🔍 Fetching conversation for booking ID:', bookingId);
      // First, fetch booking data
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
        .eq('id', bookingId)
        .single();
      
      if (bookingError) {
        console.error('❌ Error fetching booking data:', bookingError);
        throw bookingError;
      }
      
      console.log('✅ Booking data fetched:', bookingData.id, bookingData.status);

      // Check if conversation already exists for this booking
      const { data: existingConversation, error: conversationError } = await supabase
        .from('conversations')
        .select('id')
        .eq('booking_id', bookingId)
        .maybeSingle(); // Use maybeSingle() instead of single() to handle no results gracefully

      // If no conversation exists, create one
      if (!existingConversation) {
        const participants = [bookingData.owner_id, bookingData.renter_id];
        const { error: createError } = await supabase
          .from('conversations')
          .insert({
            booking_id: bookingId,
            listing_id: bookingData.listing_id,
            participants: participants,
            last_message: 'Conversation started',
            last_message_at: new Date().toISOString(),
          });

        if (createError) {
          console.error('Error creating conversation:', createError);
          // Don't throw here, continue with the booking data
        }
      }

      const isOwner = bookingData.owner_id === user?.id;
      const otherUser = isOwner ? 
        (Array.isArray(bookingData.renter) ? bookingData.renter[0] : bookingData.renter) : 
        (Array.isArray(bookingData.owner) ? bookingData.owner[0] : bookingData.owner);

      return {
        id: bookingId,
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
    },
    enabled: !!bookingId && !!user?.id,
  });

  // Fetch real messages from database
  const { data: messages = [], isLoading: messagesLoading, error: messagesError } = useQuery({
    queryKey: ['messages', bookingId],
    queryFn: async () => {
      console.log('💬 Fetching messages for booking ID:', bookingId);
      // Get conversation ID first
      const { data: conversationData, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .eq('booking_id', bookingId)
        .maybeSingle(); // Use maybeSingle() to handle no results gracefully

      if (convError) {
        console.error('Error fetching conversation:', convError);
        return [];
      }

      if (!conversationData) {
        // Return welcome message if no conversation found yet
        return [{
          id: 'system-welcome',
          content: `Conversation started for ${conversation?.booking.listing?.title || 'this booking'}. You can now discuss pickup details and other arrangements.`,
          senderId: 'system',
          messageType: 'system' as const,
          sentAt: new Date().toISOString(),
        }];
      }

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
        .eq('conversation_id', conversationData.id)
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
        transformedMessages.push({
          id: 'system-welcome',
          content: `Conversation started for ${conversation?.booking.listing?.title || 'this booking'}. You can now discuss pickup details and other arrangements.`,
          senderId: 'system',
          messageType: 'system',
          sentAt: new Date().toISOString(),
        });
      }

      return transformedMessages;
    },
    enabled: !!conversation && !!bookingId,
  });

  // Mark conversation as read when opened
  useEffect(() => {
    if (!conversation?.id) return;

    const markAsRead = async () => {
      try {
        const viewedAt = new Date().toISOString();
        await AsyncStorage.setItem(`conversation_viewed_${conversation.id}`, viewedAt);
        console.log('✅ Marked conversation as read:', conversation.id);
        
        // Invalidate messages query to update unread counts
        queryClient.invalidateQueries({ queryKey: ['messages'] });
      } catch (error) {
        console.warn('Error marking conversation as read:', error);
      }
    };

    markAsRead();
  }, [conversation?.id, queryClient]);

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!bookingId || !user?.id) return;

    console.log('🔔 Setting up real-time subscription for booking:', bookingId, 'user:', user.id);
    
    // Subscribe to ALL messages and filter for this conversation
    const channel = supabase
      .channel(`messages:${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          console.log('🔥 New message received (raw):', payload.new);
          
          // Get conversation ID to check if this message belongs to our conversation
          try {
            const { data: conversationData, error: convError } = await supabase
              .from('conversations')
              .select('id')
              .eq('booking_id', bookingId)
              .maybeSingle();

            if (convError || !conversationData) {
              console.warn('Could not verify conversation for message:', convError);
              return;
            }

            // Check if this message belongs to our conversation
            if (payload.new.conversation_id !== conversationData.id) {
              console.log('❌ Message not for this conversation, ignoring');
              return;
            }

            console.log('✅ Processing message for this conversation');

            // Mark conversation as read since user is viewing it
            try {
              const viewedAt = new Date().toISOString();
              await AsyncStorage.setItem(`conversation_viewed_${conversationData.id}`, viewedAt);
            } catch (error) {
              console.warn('Error updating read timestamp:', error);
            }
            
            const newMessage: Message = {
              id: payload.new.id,
              content: payload.new.content,
              senderId: payload.new.sender_id,
              messageType: payload.new.message_type as 'text' | 'image' | 'system',
              sentAt: payload.new.created_at,
            };

            // Add new message to the query cache
            queryClient.setQueryData(['messages', bookingId], (old: Message[] = []) => {
              // Check if message already exists to avoid duplicates
              if (old.some(msg => msg.id === newMessage.id)) {
                console.log('⚠️ Duplicate message, skipping');
                return old;
              }
              console.log('✅ Adding new message to chat');
              return [...old, newMessage];
            });

            // Scroll to bottom when new message arrives
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
            
            // Invalidate messages list to update unread counts
            queryClient.invalidateQueries({ queryKey: ['messages'] });
          } catch (error) {
            console.error('Error processing new message:', error);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          console.log('🔄 Message updated (raw):', payload.new);
          
          // Get conversation ID to check if this message belongs to our conversation
          try {
            const { data: conversationData, error: convError } = await supabase
              .from('conversations')
              .select('id')
              .eq('booking_id', bookingId)
              .maybeSingle();

            if (convError || !conversationData) {
              console.warn('Could not verify conversation for message update:', convError);
              return;
            }

            // Check if this message belongs to our conversation
            if (payload.new.conversation_id !== conversationData.id) {
              console.log('❌ Message update not for this conversation, ignoring');
              return;
            }

            console.log('✅ Processing message update for this conversation');
            
            const updatedMessage: Message = {
              id: payload.new.id,
              content: payload.new.content,
              senderId: payload.new.sender_id,
              messageType: payload.new.message_type as 'text' | 'image' | 'system',
              sentAt: payload.new.created_at,
            };

            // Update message in the query cache
            queryClient.setQueryData(['messages', bookingId], (old: Message[] = []) => {
              return old.map(msg => 
                msg.id === updatedMessage.id ? updatedMessage : msg
              );
            });
          } catch (error) {
            console.error('Error processing message update:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Messages subscription status:', status);
      });

    return () => {
      console.log('🔕 Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [bookingId, queryClient, user?.id]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      // Get conversation ID first
      const { data: conversationData, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .eq('booking_id', bookingId)
        .maybeSingle();

      if (convError) {
        throw new Error(`Error fetching conversation: ${convError.message}`);
      }

      if (!conversationData) {
        throw new Error('Conversation not found. Please try refreshing the page.');
      }

      // Determine receiver ID
      const receiverId = conversation?.booking.ownerId === user?.id 
        ? conversation?.booking.renterId 
        : conversation?.booking.ownerId;

      // Save message to database
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationData.id,
          sender_id: user?.id,
          receiver_id: receiverId,
          booking_id: bookingId,
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
        .eq('id', conversationData.id);

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
    onSuccess: async (newMessage) => {
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

      // Trigger notification to the other user
      try {
        const receiverId = conversation?.booking.ownerId === user?.id 
          ? conversation?.booking.renterId 
          : conversation?.booking.ownerId;

        if (receiverId && conversation?.id) {
          await mobileNotificationApi.notifyNewMessage(
            newMessage.id,
            conversation.id,
            receiverId
          );
          console.log('Message notification sent successfully');
        }
      } catch (notificationError) {
        console.error('Failed to send message notification:', notificationError);
        // Don't show error to user as message was sent successfully
      }
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

  // Format message time (only time, no date)
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-AU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format date separator
  const formatDateSeparator = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (messageDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (messageDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-AU', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  };

  // Group messages by date
  const groupMessagesByDate = (messages: Message[]) => {
    const grouped: Array<{ type: 'date' | 'message'; data: any; id: string }> = [];
    let currentDate = '';

    messages.forEach((message, index) => {
      const messageDate = new Date(message.sentAt).toDateString();
      
      if (messageDate !== currentDate) {
        currentDate = messageDate;
        grouped.push({
          type: 'date',
          data: { date: message.sentAt },
          id: `date-${messageDate}`,
        });
      }
      
      grouped.push({
        type: 'message',
        data: message,
        id: message.id,
      });
    });

    return grouped;
  };

  const groupedMessages = groupMessagesByDate(messages || []);

  // Render date separator
  const renderDateSeparator = (date: string) => {
    return (
      <View style={styles.dateSeparatorContainer}>
        <Text style={styles.dateSeparatorText}>
          {formatDateSeparator(date)}
        </Text>
      </View>
    );
  };

  // Render message bubble
  const renderMessage = ({ item: message }: { item: Message }) => {
    const isOwnMessage = message.senderId === user?.id;
    const isSystemMessage = message.messageType === 'system';

    if (isSystemMessage) {
      return (
        <View style={styles.systemMessageContainer}>
          <Text style={styles.systemMessage}>{message.content}</Text>
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

  // Render grouped item (date separator or message)
  const renderGroupedItem = ({ item }: { item: { type: 'date' | 'message'; data: any; id: string } }) => {
    if (item.type === 'date') {
      return renderDateSeparator(item.data.date);
    } else {
      return renderMessage({ item: item.data });
    }
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
        <Header {...HeaderPresets.detail('Messages')} />
        <ChatLoadingSkeleton />
      </SafeAreaView>
    );
  }

  if (conversationError) {
    return (
      <SafeAreaView style={styles.container}>
        <Header {...HeaderPresets.detail('Error')} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading conversation</Text>
          <Text style={styles.errorText}>{conversationError.message}</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!conversation) {
    return (
      <SafeAreaView style={styles.container}>
        <Header {...HeaderPresets.detail('Not Found')} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Conversation not found</Text>
          <Text style={styles.errorText}>Booking ID: {bookingId}</Text>
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
      <Header 
        {...HeaderPresets.detail(
          conversation.otherUser.full_name + (conversation.otherUser.verified ? ' ✓' : '')
        )}
        rightAction={{
          icon: 'information-circle-outline',
          onPress: () => router.push(`/bookings/${conversation.bookingId}`),
        }}
      />

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
        data={groupedMessages}
        renderItem={renderGroupedItem}
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
  // Chat Loading Skeleton Styles
  chatContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
    paddingBottom: 0,
  },
  incomingMessageSkeleton: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  outgoingMessageSkeleton: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  avatarSkeleton: {
    borderRadius: 20,
    marginRight: 8,
  },
  messageBubbleSkeleton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
    maxWidth: '70%',
    minWidth: '40%',
  },
  messageBubbleSkeletonOutgoing: {
    backgroundColor: '#44d62c',
    borderRadius: 16,
    borderBottomRightRadius: 4,
    padding: 12,
    maxWidth: '70%',
    minWidth: '30%',
  },
  inputContainerSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  inputSkeleton: {
    borderRadius: 22,
  },
  sendButtonSkeleton: {
    borderRadius: 22,
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
  dateSeparatorContainer: {
    alignSelf: 'center',
    marginVertical: 16,
  },
  dateSeparatorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    textAlign: 'center',
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