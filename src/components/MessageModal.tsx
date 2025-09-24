import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../lib/design-system';

interface MessageModalProps {
  visible: boolean;
  onClose: () => void;
  onSendMessage: (message: string) => Promise<void>;
  recipientName: string;
  listingTitle: string;
  recipientAvatar?: string;
  isVerified?: boolean;
}

export function MessageModal({
  visible,
  onClose,
  onSendMessage,
  recipientName,
  listingTitle,
  recipientAvatar,
  isVerified = false,
}: MessageModalProps) {
  const [message, setMessage] = useState(`Hi! I'm interested in your listing "${listingTitle}". Is it available?`);
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      Alert.alert('Message Required', 'Please enter a message before sending.');
      return;
    }

    setIsSending(true);
    try {
      await onSendMessage(message);
      Alert.alert('Success', 'Your message has been sent!');
      onClose();
    } catch (error) {
      console.error('Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    if (!isSending) {
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.md,
      }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ width: '100%', maxWidth: 400 }}
        >
          <View style={{
            backgroundColor: colors.white,
            borderRadius: 8,
            width: '100%',
            maxHeight: '80%',
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
            overflow: 'hidden',
          }}>
            {/* Header */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: spacing.lg,
              borderBottomWidth: 1,
              borderBottomColor: colors.gray[200],
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <Ionicons 
                  name="chatbubble-outline" 
                  size={24} 
                  color={colors.primary.main} 
                  style={{ marginRight: spacing.sm }}
                />
                <Text style={{
                  fontSize: typography.sizes.lg,
                  fontWeight: typography.weights.semibold,
                  color: colors.text.primary,
                }}>
                  Send Message
                </Text>
              </View>
              
              <TouchableOpacity
                onPress={handleClose}
                style={{
                  padding: spacing.sm,
                  borderRadius: 20,
                  backgroundColor: colors.gray[100],
                }}
              >
                <Ionicons name="close" size={20} color={colors.gray[500]} />
              </TouchableOpacity>
            </View>

            {/* Host Info */}
            <View style={{
              backgroundColor: colors.gray[50],
              padding: spacing.lg,
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: colors.gray[300],
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: spacing.md,
                }}>
                  {recipientAvatar ? (
                    <Image
                      source={{ uri: recipientAvatar }}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                      }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Ionicons 
                      name="person" 
                      size={24} 
                      color={colors.gray[600]} 
                    />
                  )}
                </View>
                <View>
                  <Text style={{
                    fontSize: typography.sizes.base,
                    fontWeight: typography.weights.medium,
                    color: colors.text.primary,
                  }}>
                    {recipientName}
                  </Text>
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    color: colors.text.secondary,
                  }}>
                    Host of "{listingTitle}"
                  </Text>
                </View>
              </View>
            </View>

            {/* Message Form */}
            <View style={{
              padding: spacing.lg,
            }}>
              <View style={{ marginBottom: spacing.md }}>
                <Text style={{
                  fontSize: typography.sizes.sm,
                  fontWeight: typography.weights.medium,
                  color: colors.text.primary,
                  marginBottom: spacing.sm,
                }}>
                  Your Message
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: colors.gray[300],
                    borderRadius: 8,
                    padding: spacing.md,
                    fontSize: typography.sizes.sm,
                    color: colors.text.primary,
                    textAlignVertical: 'top',
                    height: 80,
                    backgroundColor: colors.white,
                  }}
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Type your message here..."
                  placeholderTextColor={colors.text.tertiary}
                  multiline
                  numberOfLines={4}
                  editable={!isSending}
                />
              </View>

              {/* Action Buttons */}
              <View style={{
                flexDirection: 'row',
                gap: spacing.sm,
              }}>
                <TouchableOpacity
                  onPress={handleClose}
                  disabled={isSending}
                  style={{
                    flex: 1,
                    backgroundColor: colors.white,
                    borderWidth: 1,
                    borderColor: colors.gray[300],
                    borderRadius: 8,
                    paddingVertical: spacing.sm,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: isSending ? 0.5 : 1,
                  }}
                >
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    fontWeight: typography.weights.medium,
                    color: colors.text.primary,
                  }}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSendMessage}
                  disabled={isSending || !message.trim()}
                  style={{
                    flex: 1,
                    backgroundColor: colors.primary.main,
                    borderRadius: 8,
                    paddingVertical: spacing.sm,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    opacity: (isSending || !message.trim()) ? 0.5 : 1,
                  }}
                >
                  {isSending ? (
                    <>
                      <ActivityIndicator size="small" color={colors.white} style={{ marginRight: spacing.xs }} />
                      <Text style={{
                        fontSize: typography.sizes.sm,
                        fontWeight: typography.weights.medium,
                        color: colors.white,
                      }}>
                        Sending...
                      </Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="paper-plane" size={16} color={colors.white} style={{ marginRight: spacing.xs }} />
                      <Text style={{
                        fontSize: typography.sizes.sm,
                        fontWeight: typography.weights.medium,
                        color: colors.white,
                      }}>
                        Send Message
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}