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
  Keyboard,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack, useFocusEffect } from 'expo-router';
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
  const textInputRef = useRef<TextInput>(null);
  
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Debug: Log the route parameters
  console.log('🚀 ConversationScreen loaded with:', { conversationId, userId: user?.id });

  // Keyboard handling and auto-focus
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      // Scroll to bottom when keyboard shows
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });
    
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription?.remove();
      hideSubscription?.remove();
    };
  }, []);

  // Auto-focus text input when screen is focused (especially when coming from booking details)
  useFocusEffect(
    React.useCallback(() => {
      // Small delay to ensure the screen is fully loaded before focusing
      const focusTimeout = setTimeout(() => {
        if (textInputRef.current) {
          textInputRef.current.focus();
        }
      }, 500);

      return () => {
        clearTimeout(focusTimeout);
      };
    }, [])
  );

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
        .contains('participants', [user?.id])
        .maybeSingle();
      
      if (conversationError) {
        console.error('❌ Error fetching conversation:', conversationError);
        throw conversationError;
      }

      if (!conversationData) {
        console.error('❌ Conversation not found or inaccessible for user');
        throw new Error('Conversation not found or you no longer have access.');
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
        .maybeSingle();
      
      if (userError) {
        console.error('❌ Error fetching other user:', userError);
        throw userError;
      }

      if (!otherUserData) {
        throw new Error('Participant profile not found');
      }
      
      // Determine conversation type and handle accordingly
      if (!conversationData.booking_id) {
        // Check if this is an inquiry conversation (has listing_id) or admin conversation (no listing_id)
        if (conversationData.listing_id) {
          // This is a pre-booking inquiry conversation
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
          // This is an admin conversation (no booking_id, no listing_id)
          return {
            id: conversationData.id,
            bookingId: conversationData.id, // Use conversation ID as bookingId for compatibility
            booking: {
              id: conversationData.id,
              status: 'admin', // Special status for admin conversations
              listingId: '', // No listing for admin conversations
              ownerId: otherUserId, // Admin is treated as "owner" for consistency
              renterId: user?.id,
              startDate: new Date().toISOString(),
              endDate: new Date().toISOString(),
              listing: null,
            },
            otherUser: {
              id: otherUserData.id,
              full_name: otherUserData.full_name || '',
              avatar_url: otherUserData.avatar_url,
              verified: otherUserData.verified || false,
            },
          } as ConversationData;
        }
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
          .maybeSingle();
        
        if (bookingError) {
          console.error('❌ Error fetching booking data:', bookingError);
          throw bookingError;
        }

        if (!bookingData) {
          throw new Error('Booking not found for this conversation');
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
        const status = conversation?.booking.status;
        let welcomeMessage = '';
        
        switch (status) {
          case 'inquiry':
            welcomeMessage = `Pre-booking inquiry started for ${conversation?.booking.listing?.title || 'this listing'}. You can ask questions about availability, condition, pricing, and other details before making a booking.`;
            break;
          case 'admin':
            welcomeMessage = `Admin support conversation started. Our team is here to help you with any questions or issues you may have with the platform.`;
            break;
          default:
            // Regular booking conversation
            welcomeMessage = `Booking conversation started for ${conversation?.booking.listing?.title || 'this booking'}. You can now discuss pickup/delivery details, item condition checks, and other arrangements.`;
            break;
        }
        
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
      
      // Keep input focused after sending
      setTimeout(() => {
        if (textInputRef.current) {
          textInputRef.current.focus();
        }
      }, 100);
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 200);
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
        return '#3b82f6'; // Blue for pre-booking inquiries
      case 'admin':
        return '#8b5cf6'; // Purple for admin conversations
      case 'pending':
        return '#f59e0b'; // Orange for pending bookings
      case 'confirmed':
      case 'active':
        return '#10b981'; // Green for active bookings
      case 'completed':
        return '#6b7280'; // Gray for completed bookings
      case 'cancelled':
        return '#ef4444'; // Red for cancelled bookings
      default:
        return '#6b7280'; // Default gray
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
            // Only show booking details button for actual bookings (not inquiries or admin conversations)
            conversation.booking.status !== 'inquiry' && conversation.booking.status !== 'admin' ? {
              icon: 'information-circle-outline',
              onPress: () => router.push(`/bookings/${conversation.bookingId}`),
              testID: 'conversation-details-button'
            } : undefined
          }
          onBackPress={() => router.back()}
        />

      {/* Conversation Context */}
      <View style={styles.bookingContext}>
        <View style={styles.contextHeader}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(conversation.booking.status) }]} />
          <Text style={styles.contextTitle}>
            {conversation.booking.status === 'admin' 
              ? `Admin Support`
              : conversation.booking.listing?.title || `Booking #${conversation.booking.id.substring(0, 8)}`}
          </Text>
        </View>
        {conversation.booking.status === 'inquiry' ? (
          <Text style={styles.contextDates}>
            Pre-booking inquiry
          </Text>
        ) : conversation.booking.status === 'admin' ? (
          <Text style={styles.contextDates}>
            Platform support conversation
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
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.messageInputContainer}>
          <TextInput
            ref={textInputRef}
            style={styles.messageInput}
            placeholder="Type a message..."
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={1000}
            returnKeyType="send"
            onSubmitEditing={handleSendMessage}
            blurOnSubmit={false}
            onFocus={() => {
              // Scroll to bottom when input is focused
              setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
              }, 100);
            }}
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
    position: 'relative',
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