import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../src/lib/design-system';
import { Header } from '../../src/components/Header';

export default function ContactUsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');

  const handleEmailSupport = () => {
    const email = 'support@rentitforward.com';
    const emailSubject = subject || 'Support Request';
    const emailBody = message || 'Hi Rent It Forward team,\n\nI need help with:\n\n';
    
    const url = `mailto:${email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open email client');
      }
    });
  };

  const handlePhoneSupport = () => {
    const phoneNumber = '+61 2 1234 5678';
    const url = `tel:${phoneNumber}`;
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to make phone call');
      }
    });
  };

  const handleSubmitMessage = () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in both subject and message fields');
      return;
    }

    // In a real app, this would send the message to your backend
    Alert.alert(
      'Message Sent',
      'Thank you for contacting us! We\'ll get back to you within 24 hours.',
      [
        {
          text: 'OK',
          onPress: () => {
            setSubject('');
            setMessage('');
          }
        }
      ]
    );
  };

  const contactMethods = [
    {
      title: 'Email Support',
      description: 'Send us an email and we\'ll get back to you within 24 hours',
      icon: 'mail',
      color: colors.semantic.info,
      action: handleEmailSupport,
      details: 'support@rentitforward.com'
    },
    {
      title: 'Phone Support',
      description: 'Call us for urgent support matters',
      icon: 'call',
      color: colors.semantic.success,
      action: handlePhoneSupport,
      details: '+61 2 1234 5678'
    },
    {
      title: 'Live Chat',
      description: 'Chat with our support team in real-time',
      icon: 'chatbubble',
      color: colors.semantic.warning,
      action: () => Alert.alert('Live Chat', 'Live chat is currently unavailable. Please use email or phone support.'),
      details: 'Available Mon-Fri 9AM-5PM AEST'
    }
  ];

  return (
    <View style={[{ flex: 1, backgroundColor: colors.gray[50] }, { paddingTop: insets.top }]}>
      <Header 
        title="Contact Us" 
        showBackButton 
        onBackPress={() => router.back()} 
      />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: spacing.lg }}>
          {/* Contact Methods */}
          <View style={{
            backgroundColor: colors.white,
            borderRadius: 12,
            marginBottom: spacing.lg,
            shadowColor: colors.black,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}>
            <Text style={{
              fontSize: typography.sizes.lg,
              fontWeight: typography.weights.semibold,
              color: colors.gray[900],
              paddingHorizontal: spacing.lg,
              paddingTop: spacing.lg,
              paddingBottom: spacing.md,
            }}>
              Get in Touch
            </Text>
            
            <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
              {contactMethods.map((method, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={method.action}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: spacing.md,
                    borderBottomWidth: index < contactMethods.length - 1 ? 1 : 0,
                    borderBottomColor: colors.gray[100],
                  }}
                >
                  <View style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: method.color + '20',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: spacing.md,
                  }}>
                    <Ionicons name={method.icon as any} size={24} color={method.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: typography.sizes.base,
                      fontWeight: typography.weights.semibold,
                      color: colors.gray[900],
                    }}>
                      {method.title}
                    </Text>
                    <Text style={{
                      fontSize: typography.sizes.sm,
                      color: colors.gray[600],
                      marginTop: spacing.xs / 2,
                    }}>
                      {method.description}
                    </Text>
                    <Text style={{
                      fontSize: typography.sizes.sm,
                      color: method.color,
                      marginTop: spacing.xs / 2,
                      fontWeight: typography.weights.medium,
                    }}>
                      {method.details}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Send Message Form */}
          <View style={{
            backgroundColor: colors.white,
            borderRadius: 12,
            marginBottom: spacing.lg,
            shadowColor: colors.black,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}>
            <Text style={{
              fontSize: typography.sizes.lg,
              fontWeight: typography.weights.semibold,
              color: colors.gray[900],
              paddingHorizontal: spacing.lg,
              paddingTop: spacing.lg,
              paddingBottom: spacing.md,
            }}>
              Send us a Message
            </Text>
            
            <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
              <View style={{ marginBottom: spacing.md }}>
                <Text style={{
                  fontSize: typography.sizes.sm,
                  fontWeight: typography.weights.medium,
                  color: colors.gray[700],
                  marginBottom: spacing.xs,
                }}>
                  Subject
                </Text>
                <TextInput
                  value={subject}
                  onChangeText={setSubject}
                  placeholder="What can we help you with?"
                  style={{
                    borderWidth: 1,
                    borderColor: colors.gray[300],
                    borderRadius: 8,
                    paddingHorizontal: spacing.sm,
                    paddingVertical: spacing.sm,
                    fontSize: typography.sizes.base,
                    backgroundColor: colors.white,
                  }}
                />
              </View>

              <View style={{ marginBottom: spacing.lg }}>
                <Text style={{
                  fontSize: typography.sizes.sm,
                  fontWeight: typography.weights.medium,
                  color: colors.gray[700],
                  marginBottom: spacing.xs,
                }}>
                  Message
                </Text>
                <TextInput
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Please describe your issue or question..."
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  style={{
                    borderWidth: 1,
                    borderColor: colors.gray[300],
                    borderRadius: 8,
                    paddingHorizontal: spacing.sm,
                    paddingVertical: spacing.sm,
                    fontSize: typography.sizes.base,
                    backgroundColor: colors.white,
                    height: 120,
                  }}
                />
              </View>

              <TouchableOpacity
                onPress={handleSubmitMessage}
                style={{
                  backgroundColor: colors.primary.main,
                  paddingVertical: spacing.md,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  color: colors.white,
                  fontSize: typography.sizes.base,
                  fontWeight: typography.weights.semibold,
                }}>
                  Send Message
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Support Hours */}
          <View style={{
            backgroundColor: colors.white,
            borderRadius: 12,
            marginBottom: spacing.xl,
            shadowColor: colors.black,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}>
            <Text style={{
              fontSize: typography.sizes.lg,
              fontWeight: typography.weights.semibold,
              color: colors.gray[900],
              paddingHorizontal: spacing.lg,
              paddingTop: spacing.lg,
              paddingBottom: spacing.md,
            }}>
              Support Hours
            </Text>
            
            <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
              <View style={{
                backgroundColor: colors.semantic.info + '10',
                padding: spacing.md,
                borderRadius: 8,
                marginBottom: spacing.md,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                  <Ionicons name="time" size={20} color={colors.semantic.info} />
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    fontWeight: typography.weights.medium,
                    color: colors.semantic.info,
                    marginLeft: spacing.sm,
                  }}>
                    Business Hours
                  </Text>
                </View>
                <Text style={{
                  fontSize: typography.sizes.sm,
                  color: colors.gray[600],
                  lineHeight: 18,
                }}>
                  Monday - Friday: 9:00 AM - 5:00 PM AEST
                </Text>
                <Text style={{
                  fontSize: typography.sizes.sm,
                  color: colors.gray[600],
                  lineHeight: 18,
                  marginTop: spacing.xs,
                }}>
                  Saturday - Sunday: 10:00 AM - 2:00 PM AEST
                </Text>
              </View>

              <View style={{
                backgroundColor: colors.semantic.warning + '10',
                padding: spacing.md,
                borderRadius: 8,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                  <Ionicons name="alert-circle" size={20} color={colors.semantic.warning} />
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    fontWeight: typography.weights.medium,
                    color: colors.semantic.warning,
                    marginLeft: spacing.sm,
                  }}>
                    Emergency Support
                  </Text>
                </View>
                <Text style={{
                  fontSize: typography.sizes.sm,
                  color: colors.gray[600],
                  lineHeight: 18,
                }}>
                  For urgent safety or security issues, call our emergency line: +61 2 1234 5679
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
