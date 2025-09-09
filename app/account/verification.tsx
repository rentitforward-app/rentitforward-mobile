import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../src/components/AuthProvider';
import { supabase } from '../../src/lib/supabase';
import { colors, spacing, typography } from '../../src/lib/design-system';
import { Header } from '../../src/components/Header';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

interface VerificationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'reviewing';
  required: boolean;
}

interface VerificationData {
  id_document_type: string;
  id_document_url?: string;
  selfie_url?: string;
  additional_document_url?: string;
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
  submitted_at?: string;
  reviewed_at?: string;
  rejection_reason?: string;
}

const DOCUMENT_TYPES = [
  { id: 'drivers_license', name: 'Driver\'s License', description: 'Government-issued driver\'s license' },
  { id: 'passport', name: 'Passport', description: 'Valid passport' },
  { id: 'national_id', name: 'National ID', description: 'Government-issued national identification' },
  { id: 'other', name: 'Other ID', description: 'Other government-issued photo ID' },
];

export default function VerificationScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('');
  const [showDocumentPicker, setShowDocumentPicker] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState({
    id_document: null as string | null,
    selfie: null as string | null,
    additional: null as string | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch current verification data
  const { data: verificationData, isLoading } = useQuery({
    queryKey: ['verification', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_verifications')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data as VerificationData | null;
    },
    enabled: !!user?.id,
  });

  // Submit verification mutation
  const submitVerificationMutation = useMutation({
    mutationFn: async (data: Partial<VerificationData>) => {
      if (!user?.id) throw new Error('User not found');

      const verificationPayload = {
        user_id: user.id,
        ...data,
        verification_status: 'pending',
        submitted_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('user_verifications')
        .upsert(verificationPayload);
      
      if (error) throw error;

      // Update profile verification status
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ verification_status: 'pending' })
        .eq('id', user.id);

      if (profileError) throw profileError;

      return verificationPayload;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      setIsSubmitting(false);
      
      Alert.alert(
        'Verification Submitted',
        'Your verification documents have been submitted successfully. We will review them within 24-48 hours and notify you of the result.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    },
    onError: (error) => {
      console.error('Verification submission error:', error);
      setIsSubmitting(false);
      Alert.alert('Error', 'Failed to submit verification. Please try again.');
    },
  });

  // Get verification steps based on current status
  const getVerificationSteps = (): VerificationStep[] => {
    const baseSteps: VerificationStep[] = [
      {
        id: 'document_type',
        title: 'Choose Document Type',
        description: 'Select the type of ID document you want to upload',
        status: selectedDocumentType ? 'completed' : 'pending',
        required: true,
      },
      {
        id: 'id_document',
        title: 'Upload ID Document',
        description: 'Take a clear photo of your government-issued ID',
        status: uploadedDocuments.id_document ? 'completed' : 'pending',
        required: true,
      },
      {
        id: 'selfie',
        title: 'Take Selfie',
        description: 'Take a selfie to verify your identity',
        status: uploadedDocuments.selfie ? 'completed' : 'pending',
        required: true,
      },
      {
        id: 'additional',
        title: 'Additional Document (Optional)',
        description: 'Upload additional verification if needed',
        status: uploadedDocuments.additional ? 'completed' : 'pending',
        required: false,
      },
    ];

    // If verification data exists, update step statuses
    if (verificationData) {
      baseSteps.forEach(step => {
        switch (step.id) {
          case 'document_type':
            if (verificationData.id_document_type) {
              step.status = 'completed';
              setSelectedDocumentType(verificationData.id_document_type);
            }
            break;
          case 'id_document':
            if (verificationData.id_document_url) step.status = 'completed';
            break;
          case 'selfie':
            if (verificationData.selfie_url) step.status = 'completed';
            break;
          case 'additional':
            if (verificationData.additional_document_url) step.status = 'completed';
            break;
        }
      });
    }

    return baseSteps;
  };

  const steps = getVerificationSteps();

  // Handle document type selection
  const handleDocumentTypeSelect = (documentType: string) => {
    setSelectedDocumentType(documentType);
    setShowDocumentPicker(false);
  };

  // Handle photo upload
  const handlePhotoUpload = async (type: 'id_document' | 'selfie' | 'additional') => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow camera access to take photos for verification.');
      return;
    }

    Alert.alert(
      'Take Photo',
      'Choose how you want to capture your document',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Camera', 
          onPress: () => openCamera(type)
        },
        { 
          text: 'Photo Library', 
          onPress: () => openImagePicker(type)
        },
      ]
    );
  };

  const openCamera = async (type: 'id_document' | 'selfie' | 'additional') => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'selfie' ? [1, 1] : [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setUploadedDocuments(prev => ({
        ...prev,
        [type]: result.assets[0].uri,
      }));
    }
  };

  const openImagePicker = async (type: 'id_document' | 'selfie' | 'additional') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'selfie' ? [1, 1] : [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setUploadedDocuments(prev => ({
        ...prev,
        [type]: result.assets[0].uri,
      }));
    }
  };

  // Handle document upload (for additional documents)
  const handleDocumentUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadedDocuments(prev => ({
          ...prev,
          additional: result.assets[0].uri,
        }));
      }
    } catch (error) {
      console.error('Document picker error:', error);
      Alert.alert('Error', 'Failed to select document. Please try again.');
    }
  };

  // Handle submission
  const handleSubmit = () => {
    const requiredSteps = steps.filter(step => step.required);
    const completedRequiredSteps = requiredSteps.filter(step => step.status === 'completed');

    if (completedRequiredSteps.length < requiredSteps.length) {
      Alert.alert('Incomplete', 'Please complete all required verification steps before submitting.');
      return;
    }

    setIsSubmitting(true);
    submitVerificationMutation.mutate({
      id_document_type: selectedDocumentType,
      id_document_url: uploadedDocuments.id_document || undefined,
      selfie_url: uploadedDocuments.selfie || undefined,
      additional_document_url: uploadedDocuments.additional || undefined,
    });
  };

  // Render step status icon
  const renderStepIcon = (status: string, required: boolean) => {
    switch (status) {
      case 'completed':
        return <Text style={{ fontSize: 20, color: colors.semantic.success, fontWeight: '600' }}>✓</Text>;
      case 'failed':
        return <Text style={{ fontSize: 20, color: colors.semantic.error, fontWeight: '600' }}>✗</Text>;
      case 'reviewing':
        return <Text style={{ fontSize: 20, color: colors.semantic.warning }}>⏳</Text>;
      default:
        return (
          <View style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: required ? colors.semantic.error + '20' : colors.gray[300],
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.gray[600] }}>
              {required ? '!' : '?'}
            </Text>
          </View>
        );
    }
  };

  // Render verification status card
  const renderStatusCard = () => {
    if (!verificationData) return null;

    const getStatusInfo = () => {
      switch (verificationData.verification_status) {
        case 'pending':
          return {
            title: 'Verification Pending',
            description: 'Your documents are being reviewed. This usually takes 24-48 hours.',
            color: colors.semantic.warning,
            backgroundColor: colors.semantic.warning + '20',
          };
        case 'verified':
          return {
            title: 'Verification Complete',
            description: 'Your identity has been successfully verified!',
            color: colors.semantic.success,
            backgroundColor: colors.semantic.success + '20',
          };
        case 'rejected':
          return {
            title: 'Verification Rejected',
            description: verificationData.rejection_reason || 'Your verification was rejected. Please try again with clearer documents.',
            color: colors.semantic.error,
            backgroundColor: colors.semantic.error + '20',
          };
        default:
          return null;
      }
    };

    const statusInfo = getStatusInfo();
    if (!statusInfo) return null;

    return (
      <View style={{
        backgroundColor: statusInfo.backgroundColor,
        padding: spacing.md,
        borderRadius: 8,
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: statusInfo.color + '40',
      }}>
        <Text style={{
          fontSize: typography.sizes.lg,
          fontWeight: typography.weights.semibold,
          color: statusInfo.color,
          marginBottom: spacing.sm,
        }}>
          {statusInfo.title}
        </Text>
        <Text style={{
          fontSize: typography.sizes.sm,
          color: colors.gray[600],
          lineHeight: 20,
          marginBottom: spacing.sm,
        }}>
          {statusInfo.description}
        </Text>
        {verificationData.submitted_at && (
          <Text style={{
            fontSize: typography.sizes.xs,
            color: colors.gray[500],
          }}>
            Submitted: {new Date(verificationData.submitted_at).toLocaleDateString('en-AU')}
          </Text>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[{ flex: 1, backgroundColor: colors.gray[50] }, { paddingTop: insets.top }]}>
        <Header title="Identity Verification" showBackButton onBackPress={() => router.back()} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: typography.sizes.base, color: colors.gray[600] }}>
            Loading verification status...
          </Text>
        </View>
      </View>
    );
  }

  const canSubmit = verificationData?.verification_status !== 'pending' && 
                   steps.filter(s => s.required).every(s => s.status === 'completed');

  return (
    <View style={[{ flex: 1, backgroundColor: colors.gray[50] }, { paddingTop: insets.top }]}>
      <Header 
        title="Identity Verification" 
        showBackButton 
        onBackPress={() => router.back()} 
      />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: spacing.lg }}>
          {/* Status Card */}
          {renderStatusCard()}

          {/* Introduction */}
          <View style={{
            backgroundColor: colors.white,
            borderRadius: 12,
            padding: spacing.lg,
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
              marginBottom: spacing.md,
            }}>
              Why Verify Your Identity?
            </Text>
            <Text style={{
              fontSize: typography.sizes.sm,
              color: colors.gray[600],
              lineHeight: 20,
              marginBottom: spacing.lg,
            }}>
              Identity verification helps build trust and safety in our community. Verified users have access to premium features and higher booking limits.
            </Text>
            
            <View style={{ gap: spacing.sm }}>
              <Text style={{ fontSize: typography.sizes.sm, color: colors.semantic.success, lineHeight: 20 }}>
                ✓ Increased trust from other users
              </Text>
              <Text style={{ fontSize: typography.sizes.sm, color: colors.semantic.success, lineHeight: 20 }}>
                ✓ Higher booking limits
              </Text>
              <Text style={{ fontSize: typography.sizes.sm, color: colors.semantic.success, lineHeight: 20 }}>
                ✓ Priority customer support
              </Text>
              <Text style={{ fontSize: typography.sizes.sm, color: colors.semantic.success, lineHeight: 20 }}>
                ✓ Access to premium features
              </Text>
            </View>
          </View>

          {/* Verification Steps */}
          <View style={{
            backgroundColor: colors.white,
            borderRadius: 12,
            padding: spacing.lg,
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
              marginBottom: spacing.lg,
            }}>
              Verification Steps
            </Text>
            
            {steps.map((step, index) => (
              <View key={step.id} style={{
                backgroundColor: colors.gray[50],
                borderRadius: 8,
                padding: spacing.md,
                marginBottom: spacing.md,
                borderWidth: 1,
                borderColor: colors.gray[200],
              }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flex: 1,
                  }}>
                    {renderStepIcon(step.status, step.required)}
                    <View style={{ marginLeft: spacing.sm, flex: 1 }}>
                      <Text style={{
                        fontSize: typography.sizes.base,
                        fontWeight: typography.weights.semibold,
                        color: colors.gray[900],
                        marginBottom: spacing.xs / 2,
                      }}>
                        {step.title}
                        {step.required && <Text style={{ color: colors.semantic.error }}> *</Text>}
                      </Text>
                      <Text style={{
                        fontSize: typography.sizes.sm,
                        color: colors.gray[600],
                        lineHeight: 18,
                      }}>
                        {step.description}
                      </Text>
                    </View>
                  </View>
                  
                  {step.status !== 'completed' && (
                    <TouchableOpacity
                      style={{
                        backgroundColor: colors.primary.main,
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.sm,
                        borderRadius: 6,
                      }}
                      onPress={() => {
                        switch (step.id) {
                          case 'document_type':
                            setShowDocumentPicker(true);
                            break;
                          case 'id_document':
                            handlePhotoUpload('id_document');
                            break;
                          case 'selfie':
                            handlePhotoUpload('selfie');
                            break;
                          case 'additional':
                            Alert.alert(
                              'Additional Document',
                              'Choose upload method',
                              [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Take Photo', onPress: () => handlePhotoUpload('additional') },
                                { text: 'Upload File', onPress: handleDocumentUpload },
                              ]
                            );
                            break;
                        }
                      }}
                    >
                      <Text style={{
                        fontSize: typography.sizes.sm,
                        fontWeight: typography.weights.semibold,
                        color: colors.white,
                      }}>
                        {step.id === 'document_type' ? 'Select' : 'Upload'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* Requirements */}
          <View style={{
            backgroundColor: colors.white,
            borderRadius: 12,
            padding: spacing.lg,
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
              marginBottom: spacing.md,
            }}>
              Requirements
            </Text>
            <View style={{ gap: spacing.sm }}>
              <Text style={{ fontSize: typography.sizes.sm, color: colors.gray[600], lineHeight: 20 }}>
                • Use a government-issued photo ID
              </Text>
              <Text style={{ fontSize: typography.sizes.sm, color: colors.gray[600], lineHeight: 20 }}>
                • Ensure all text is clearly readable
              </Text>
              <Text style={{ fontSize: typography.sizes.sm, color: colors.gray[600], lineHeight: 20 }}>
                • Document should not be expired
              </Text>
              <Text style={{ fontSize: typography.sizes.sm, color: colors.gray[600], lineHeight: 20 }}>
                • Take photos in good lighting
              </Text>
              <Text style={{ fontSize: typography.sizes.sm, color: colors.gray[600], lineHeight: 20 }}>
                • Avoid glare or shadows
              </Text>
              <Text style={{ fontSize: typography.sizes.sm, color: colors.gray[600], lineHeight: 20 }}>
                • Face should be clearly visible in selfie
              </Text>
            </View>
          </View>

          {/* Submit Button */}
          {verificationData?.verification_status !== 'verified' && (
            <View style={{ marginBottom: spacing.xl }}>
              <TouchableOpacity
                style={{
                  backgroundColor: canSubmit && !isSubmitting ? colors.primary.main : colors.gray[300],
                  paddingVertical: spacing.md,
                  borderRadius: 8,
                  alignItems: 'center',
                  marginBottom: spacing.sm,
                }}
                onPress={handleSubmit}
                disabled={!canSubmit || isSubmitting}
              >
                <Text style={{
                  fontSize: typography.sizes.base,
                  fontWeight: typography.weights.semibold,
                  color: colors.white,
                }}>
                  {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
                </Text>
              </TouchableOpacity>
              
              <Text style={{
                fontSize: typography.sizes.xs,
                color: colors.gray[500],
                textAlign: 'center',
                lineHeight: 16,
              }}>
                By submitting, you agree that the information provided is accurate and belongs to you.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Document Type Selection Modal */}
      <Modal
        visible={showDocumentPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDocumentPicker(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        }}>
          <View style={{
            backgroundColor: colors.white,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: spacing.lg,
            maxHeight: '80%',
          }}>
            <Text style={{
              fontSize: typography.sizes.xl,
              fontWeight: typography.weights.semibold,
              color: colors.gray[900],
              marginBottom: spacing.lg,
              textAlign: 'center',
            }}>
              Select Document Type
            </Text>
            
            {DOCUMENT_TYPES.map((docType) => (
              <TouchableOpacity
                key={docType.id}
                style={{
                  backgroundColor: colors.gray[50],
                  padding: spacing.md,
                  borderRadius: 8,
                  marginBottom: spacing.sm,
                  borderWidth: 1,
                  borderColor: colors.gray[200],
                }}
                onPress={() => handleDocumentTypeSelect(docType.id)}
              >
                <Text style={{
                  fontSize: typography.sizes.base,
                  fontWeight: typography.weights.semibold,
                  color: colors.gray[900],
                  marginBottom: spacing.xs / 2,
                }}>
                  {docType.name}
                </Text>
                <Text style={{
                  fontSize: typography.sizes.sm,
                  color: colors.gray[600],
                }}>
                  {docType.description}
                </Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={{
                backgroundColor: colors.gray[100],
                padding: spacing.md,
                borderRadius: 8,
                alignItems: 'center',
                marginTop: spacing.sm,
              }}
              onPress={() => setShowDocumentPicker(false)}
            >
              <Text style={{
                fontSize: typography.sizes.base,
                fontWeight: typography.weights.medium,
                color: colors.gray[600],
              }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
