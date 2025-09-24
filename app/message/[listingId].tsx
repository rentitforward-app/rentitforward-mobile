import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../src/lib/design-system';
import { useAuth } from '../../src/components/AuthProvider';
import { supabase } from '../../src/lib/supabase';
import { Header } from '../../src/components/Header';

interface ListingData {
  id: string;
  title: string;
  profiles: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    verified: boolean;
  };
}

export default function MessageScreen() {
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [listing, setListing] = useState<ListingData | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (listingId) {
      fetchListingDetails();
    }
  }, [listingId]);

  const fetchListingDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          id,
          title,
          profiles:owner_id (
            id,
            full_name,
            avatar_url,
            verified
          )
        `)
        .eq('id', listingId)
        .single();

      if (error) {
        console.error('Error fetching listing:', error);
        Alert.alert('Error', 'Failed to load listing details');
        router.back();
        return;
      }

      if (data) {
        setListing(data as ListingData);
        setMessage(`Hi! I'm interested in your listing "${data.title}". Is it available?`);
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to load listing details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      Alert.alert('Message Required', 'Please enter a message before sending.');
      return;
    }

    if (!user || !listing?.profiles.id) {
      Alert.alert('Error', 'Missing user or listing information');
      return;
    }

    setSending(true);
    try {
      // Check if conversation already exists for this listing between these users
      const { data: existingConversation, error: checkError } = await supabase
        .from('conversations')
        .select('id')
        .eq('listing_id', listing.id)
        .is('booking_id', null)
        .contains('participants', [user.id])
        .contains('participants', [listing.profiles.id])
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing conversation:', checkError);
      }

      let conversationId: string;

      if (!existingConversation) {
        // Create new conversation
        const { data: newConversation, error: createError } = await supabase
          .from('conversations')
          .insert({
            booking_id: null,
            listing_id: listing.id,
            participants: [listing.profiles.id, user.id],
            last_message: message,
            last_message_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (createError || !newConversation) {
          console.error('Error creating conversation:', createError);
          throw new Error('Failed to create conversation');
        }

        conversationId = newConversation.id;
      } else {
        conversationId = existingConversation.id;
      }

      // Send the message
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          receiver_id: listing.profiles.id,
          content: message,
          message_type: 'text',
        });

      if (messageError) {
        console.error('Error sending message:', messageError);
        throw new Error('Failed to send message');
      }

      // Update conversation with last message
      await supabase
        .from('conversations')
        .update({
          last_message: message,
          last_message_at: new Date().toISOString(),
        })
        .eq('id', conversationId);

      Alert.alert('Success', 'Your message has been sent!', [
        {
          text: 'OK',
          onPress: () => {
            router.push(`/conversations/${conversationId}`);
          },
        },
      ]);
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
        <Stack.Screen options={{ headerShown: false }} />
        <Header
          title="Send Message"
          showBackButton={true}
          onBackPress={() => router.back()}
        />
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: spacing.lg,
        }}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={{
            marginTop: spacing.md,
            fontSize: typography.sizes.base,
            color: colors.text.secondary,
          }}>
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!listing) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
        <Stack.Screen options={{ headerShown: false }} />
        <Header
          title="Send Message"
          showBackButton={true}
          onBackPress={() => router.back()}
        />
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: spacing.lg,
        }}>
          <Text style={{
            fontSize: typography.sizes.base,
            color: colors.text.secondary,
          }}>
            Listing not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header
        title="Send Message"
        showBackButton={true}
        onBackPress={() => router.back()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, padding: spacing.lg }}>
          {/* Host Info */}
          <View style={{
            backgroundColor: colors.gray[50],
            padding: spacing.lg,
            borderRadius: 12,
            marginBottom: spacing.lg,
            borderWidth: 1,
            borderColor: colors.gray[200],
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <View style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: colors.gray[300],
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: spacing.md,
              }}>
                {listing.profiles.avatar_url ? (
                  <Image
                    source={{ uri: listing.profiles.avatar_url }}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                    }}
                    resizeMode="cover"
                  />
                ) : (
                  <Ionicons 
                    name="person" 
                    size={28} 
                    color={colors.gray[600]} 
                  />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: spacing.xs,
                }}>
                  <Text style={{
                    fontSize: typography.sizes.lg,
                    fontWeight: typography.weights.semibold,
                    color: colors.text.primary,
                    marginRight: spacing.xs,
                  }}>
                    {listing.profiles.full_name}
                  </Text>
                  {listing.profiles.verified && (
                    <Ionicons name="checkmark-circle" size={18} color={colors.semantic.success} />
                  )}
                </View>
                <Text style={{
                  fontSize: typography.sizes.sm,
                  color: colors.text.secondary,
                }} numberOfLines={2}>
                  Host of "{listing.title}"
                </Text>
              </View>
            </View>
          </View>

          {/* Message Input */}
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: typography.sizes.base,
              fontWeight: typography.weights.semibold,
              color: colors.text.primary,
              marginBottom: spacing.sm,
            }}>
              Your Message
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: colors.gray[300],
                borderRadius: 12,
                padding: spacing.md,
                fontSize: typography.sizes.base,
                color: colors.text.primary,
                textAlignVertical: 'top',
                minHeight: 120,
                backgroundColor: colors.white,
              }}
              value={message}
              onChangeText={setMessage}
              placeholder="Type your message here..."
              placeholderTextColor={colors.text.tertiary}
              multiline
              editable={!sending}
              autoFocus
            />
          </View>

          {/* Send Button */}
          <View style={{ marginTop: spacing.lg }}>
            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={sending || !message.trim()}
              style={{
                backgroundColor: colors.primary.main,
                borderRadius: 12,
                paddingVertical: spacing.md,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                opacity: (sending || !message.trim()) ? 0.5 : 1,
              }}
            >
              {sending ? (
                <>
                  <ActivityIndicator size="small" color={colors.white} style={{ marginRight: spacing.sm }} />
                  <Text style={{
                    fontSize: typography.sizes.base,
                    fontWeight: typography.weights.semibold,
                    color: colors.white,
                  }}>
                    Sending...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="paper-plane" size={18} color={colors.white} style={{ marginRight: spacing.sm }} />
                  <Text style={{
                    fontSize: typography.sizes.base,
                    fontWeight: typography.weights.semibold,
                    color: colors.white,
                  }}>
                    Send Message
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
