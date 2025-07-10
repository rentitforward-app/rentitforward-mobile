import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../src/stores/auth';
import { supabase } from '../../src/lib/supabase';
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
  const router = useRouter();
  const { user } = useAuthStore();
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
        return <Text style={styles.stepIconCompleted}>✓</Text>;
      case 'failed':
        return <Text style={styles.stepIconFailed}>✗</Text>;
      case 'reviewing':
        return <Text style={styles.stepIconReviewing}>⏳</Text>;
      default:
        return (
          <View style={[
            styles.stepIconPending,
            required && styles.stepIconRequired,
          ]}>
            <Text style={styles.stepIconText}>{required ? '!' : '?'}</Text>
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
            color: '#f59e0b',
            backgroundColor: '#fef3c7',
          };
        case 'verified':
          return {
            title: 'Verification Complete',
            description: 'Your identity has been successfully verified!',
            color: '#10b981',
            backgroundColor: '#d1fae5',
          };
        case 'rejected':
          return {
            title: 'Verification Rejected',
            description: verificationData.rejection_reason || 'Your verification was rejected. Please try again with clearer documents.',
            color: '#ef4444',
            backgroundColor: '#fee2e2',
          };
        default:
          return null;
      }
    };

    const statusInfo = getStatusInfo();
    if (!statusInfo) return null;

    return (
      <View style={[styles.statusCard, { backgroundColor: statusInfo.backgroundColor }]}>
        <Text style={[styles.statusTitle, { color: statusInfo.color }]}>
          {statusInfo.title}
        </Text>
        <Text style={styles.statusDescription}>
          {statusInfo.description}
        </Text>
        {verificationData.submitted_at && (
          <Text style={styles.statusDate}>
            Submitted: {new Date(verificationData.submitted_at).toLocaleDateString('en-AU')}
          </Text>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading verification status...</Text>
      </View>
    );
  }

  const canSubmit = verificationData?.verification_status !== 'pending' && 
                   steps.filter(s => s.required).every(s => s.status === 'completed');

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Identity Verification</Text>
      </View>

      {/* Status Card */}
      {renderStatusCard()}

      {/* Introduction */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Why Verify Your Identity?</Text>
        <Text style={styles.sectionDescription}>
          Identity verification helps build trust and safety in our community. Verified users have access to premium features and higher booking limits.
        </Text>
        
        <View style={styles.benefitsList}>
          <Text style={styles.benefit}>✓ Increased trust from other users</Text>
          <Text style={styles.benefit}>✓ Higher booking limits</Text>
          <Text style={styles.benefit}>✓ Priority customer support</Text>
          <Text style={styles.benefit}>✓ Access to premium features</Text>
        </View>
      </View>

      {/* Verification Steps */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Verification Steps</Text>
        
        {steps.map((step, index) => (
          <View key={step.id} style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <View style={styles.stepLeft}>
                {renderStepIcon(step.status, step.required)}
                <View style={styles.stepInfo}>
                  <Text style={styles.stepTitle}>
                    {step.title}
                    {step.required && <Text style={styles.requiredMarker}> *</Text>}
                  </Text>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                </View>
              </View>
              
              {step.status !== 'completed' && (
                <TouchableOpacity
                  style={styles.stepAction}
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
                  <Text style={styles.stepActionText}>
                    {step.id === 'document_type' ? 'Select' : 'Upload'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Requirements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Requirements</Text>
        <View style={styles.requirementsList}>
          <Text style={styles.requirement}>• Use a government-issued photo ID</Text>
          <Text style={styles.requirement}>• Ensure all text is clearly readable</Text>
          <Text style={styles.requirement}>• Document should not be expired</Text>
          <Text style={styles.requirement}>• Take photos in good lighting</Text>
          <Text style={styles.requirement}>• Avoid glare or shadows</Text>
          <Text style={styles.requirement}>• Face should be clearly visible in selfie</Text>
        </View>
      </View>

      {/* Submit Button */}
      {verificationData?.verification_status !== 'verified' && (
        <View style={styles.submitSection}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!canSubmit || isSubmitting) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!canSubmit || isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.submitNote}>
            By submitting, you agree that the information provided is accurate and belongs to you.
          </Text>
        </View>
      )}

      {/* Document Type Selection Modal */}
      <Modal
        visible={showDocumentPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDocumentPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Document Type</Text>
            
            {DOCUMENT_TYPES.map((docType) => (
              <TouchableOpacity
                key={docType.id}
                style={styles.documentOption}
                onPress={() => handleDocumentTypeSelect(docType.id)}
              >
                <Text style={styles.documentOptionTitle}>{docType.name}</Text>
                <Text style={styles.documentOptionDescription}>{docType.description}</Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowDocumentPicker(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
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
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#44d62c',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  statusCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  statusDescription: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 20,
  },
  statusDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  section: {
    backgroundColor: '#ffffff',
    marginTop: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  benefitsList: {
    gap: 8,
  },
  benefit: {
    fontSize: 14,
    color: '#10b981',
    lineHeight: 20,
  },
  stepCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepInfo: {
    marginLeft: 12,
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  requiredMarker: {
    color: '#ef4444',
  },
  stepDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 18,
  },
  stepIconCompleted: {
    fontSize: 20,
    color: '#10b981',
    fontWeight: '600',
  },
  stepIconFailed: {
    fontSize: 20,
    color: '#ef4444',
    fontWeight: '600',
  },
  stepIconReviewing: {
    fontSize: 20,
    color: '#f59e0b',
  },
  stepIconPending: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIconRequired: {
    backgroundColor: '#fee2e2',
  },
  stepIconText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  stepAction: {
    backgroundColor: '#44d62c',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  stepActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  requirementsList: {
    gap: 8,
  },
  requirement: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  submitSection: {
    padding: 16,
  },
  submitButton: {
    backgroundColor: '#44d62c',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  submitNote: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  documentOption: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  documentOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  documentOptionDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  modalCancelButton: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
}); 