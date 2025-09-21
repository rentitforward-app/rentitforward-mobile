import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
  TextInput,
  Switch,
  Platform,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../../src/lib/supabase';
import { useAuth } from '../../../src/components/AuthProvider';
import { colors, spacing, typography } from '../../../src/lib/design-system';
import { Header } from '../../../src/components/Header';
import { issueReportService, IssueReportData } from '../../../src/services/issueReportService';

interface ReportFormData {
  issue_type: string;
  severity: string;
  title: string;
  description: string;
  location: string;
  occurred_at: string;
  financial_impact: boolean;
  estimated_cost: number;
  resolution_request: string;
  contact_preference: string;
  photos: string[];
}

const ISSUE_TYPES = [
  { value: 'damage', label: 'Damage', icon: 'warning-outline', description: 'Physical damage to the item' },
  { value: 'missing_parts', label: 'Missing Parts', icon: 'remove-circle-outline', description: 'Parts or accessories are missing' },
  { value: 'malfunction', label: 'Malfunction', icon: 'build-outline', description: 'Item not working properly' },
  { value: 'cleanliness', label: 'Cleanliness', icon: 'water-outline', description: 'Item not clean or hygienic' },
  { value: 'late_pickup', label: 'Late Pickup', icon: 'time-outline', description: 'Pickup was delayed' },
  { value: 'communication', label: 'Communication', icon: 'chatbubble-outline', description: 'Communication issues' },
  { value: 'safety', label: 'Safety', icon: 'shield-outline', description: 'Safety concerns' },
  { value: 'fraud', label: 'Fraud', icon: 'alert-circle-outline', description: 'Fraudulent activity' },
  { value: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline', description: 'Other issues' },
];

const SEVERITY_LEVELS = [
  { value: 'low', label: 'Low', color: colors.semantic.success, description: 'Minor issue, no immediate action needed' },
  { value: 'medium', label: 'Medium', color: '#f59e0b', description: 'Moderate issue, needs attention' },
  { value: 'high', label: 'High', color: '#f97316', description: 'Serious issue, urgent attention required' },
  { value: 'critical', label: 'Critical', color: colors.semantic.error, description: 'Critical issue, immediate action required' },
];

const CONTACT_PREFERENCES = [
  { value: 'email', label: 'Email', icon: 'mail-outline' },
  { value: 'phone', label: 'Phone', icon: 'call-outline' },
  { value: 'message', label: 'In-App Message', icon: 'chatbubble-outline' },
];

export default function ReportIssueScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [showIssueTypeDropdown, setShowIssueTypeDropdown] = useState(false);
  const [showSeverityDropdown, setShowSeverityDropdown] = useState(false);

  const [formData, setFormData] = useState<ReportFormData>({
    issue_type: '',
    severity: '',
    title: '',
    description: '',
    location: '',
    occurred_at: new Date().toISOString().split('T')[0],
    financial_impact: false,
    estimated_cost: 0,
    resolution_request: '',
    contact_preference: 'email',
    photos: [],
  });

  // Fetch booking details
  const { data: booking, isLoading, error } = useQuery({
    queryKey: ['booking-details', id],
    queryFn: async () => {
      if (!id) throw new Error('No booking ID provided');
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          listings!listing_id (
            id,
            title,
            images,
            price_per_day,
            category,
            owner_id,
            profiles!owner_id (
              id,
              full_name,
              email,
              phone_number,
              avatar_url
            )
          ),
          renter:profiles!renter_id (
            id,
            full_name,
            email,
            phone_number,
            avatar_url
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching booking details:', error);
        throw error;
      }

      return data;
    },
    enabled: !!id,
  });

  // Check if user is authorized to report issues for this booking
  const isAuthorized = booking && user && 
    (booking.renter_id === user.id || booking.listings?.owner_id === user.id);

  const userRole = booking && user ? 
    (booking.renter_id === user.id ? 'renter' : 'owner') : null;

  // Request permissions on component mount
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to upload photos.');
        }
      }
    })();
  }, []);

  const updateFormData = (field: keyof ReportFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getSelectedIssueType = () => {
    return ISSUE_TYPES.find(type => type.value === formData.issue_type);
  };

  const getSelectedSeverity = () => {
    return SEVERITY_LEVELS.find(level => level.value === formData.severity);
  };

  // Dropdown Component
  const DropdownModal = ({ 
    visible, 
    onClose, 
    title, 
    options, 
    selectedValue, 
    onSelect,
    renderOption 
  }: {
    visible: boolean;
    onClose: () => void;
    title: string;
    options: any[];
    selectedValue: string;
    onSelect: (value: string) => void;
    renderOption: (option: any, isSelected: boolean) => React.ReactNode;
  }) => (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScrollView}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.modalOption,
                  selectedValue === option.value && styles.modalOptionSelected
                ]}
                onPress={() => {
                  onSelect(option.value);
                  onClose();
                }}
              >
                {renderOption(option, selectedValue === option.value)}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets) {
        setUploadingPhotos(true);
        const newPhotos = [...formData.photos];
        
        for (const asset of result.assets) {
          if (newPhotos.length >= 5) {
            Alert.alert('Limit reached', 'You can upload up to 5 photos.');
            break;
          }
          
          // For now, we'll store the local URI
          // In production, you'd upload to Supabase Storage
          newPhotos.push(asset.uri);
        }
        
        updateFormData('photos', newPhotos);
        setUploadingPhotos(false);
      }
    } catch (error) {
      setUploadingPhotos(false);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = formData.photos.filter((_, i) => i !== index);
    updateFormData('photos', newPhotos);
  };

  const validateForm = (): string | null => {
    if (!formData.issue_type) return 'Please select an issue type';
    if (!formData.severity) return 'Please select a severity level';
    if (!formData.title.trim()) return 'Please enter a title';
    if (!formData.description.trim()) return 'Please provide a description';
    if (formData.financial_impact && formData.estimated_cost <= 0) {
      return 'Please enter a valid estimated cost';
    }
    return null;
  };

  const submitReport = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    if (!booking || !user || !userRole) {
      Alert.alert('Error', 'Unable to submit report. Please try again.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare report data for the service
      const reportData: IssueReportData = {
        booking_id: booking.id,
        reporter_role: userRole,
        issue_type: formData.issue_type,
        severity: formData.severity as 'low' | 'medium' | 'high' | 'critical',
        title: formData.title,
        description: formData.description,
        location: formData.location || undefined,
        occurred_at: formData.occurred_at,
        financial_impact: formData.financial_impact,
        estimated_cost: formData.estimated_cost,
        resolution_request: formData.resolution_request || undefined,
        contact_preference: formData.contact_preference as 'email' | 'phone' | 'message',
        photos: formData.photos,
      };

      // Submit using the mobile service
      const result = await issueReportService.submitIssueReport(reportData);

      if (!result.success) {
        throw new Error(result.error || result.message);
      }

      Alert.alert(
        'Report Submitted',
        'Your issue report has been submitted successfully. Our admin team will review it and contact you soon.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert(
        'Submission Failed',
        error instanceof Error ? error.message : 'Failed to submit report. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header 
          title="Report Issue"
          showBackButton={true}
          onBackPress={() => router.back()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading booking details...</Text>
        </View>
      </View>
    );
  }

  if (error || !booking || !isAuthorized) {
    return (
      <View style={styles.container}>
        <Header 
          title="Report Issue"
          showBackButton={true}
          onBackPress={() => router.back()}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.semantic.error} />
          <Text style={styles.errorTitle}>Access Denied</Text>
          <Text style={styles.errorText}>
            {error?.message || 'You are not authorized to report issues for this booking.'}
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header 
        title="Report Issue"
        showBackButton={true}
        onBackPress={() => router.back()}
      />

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Booking Context */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Information</Text>
          <View style={styles.bookingCard}>
            <View style={styles.bookingHeader}>
              <Ionicons name="document-text-outline" size={24} color={colors.primary.main} />
              <Text style={styles.bookingTitle}>Booking Details</Text>
            </View>
            <View style={styles.bookingInfo}>
              <Text style={styles.bookingItemTitle}>{booking.listings?.title}</Text>
              <Text style={styles.bookingDates}>
                {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
              </Text>
              <Text style={styles.bookingRole}>
                Reporting as: {userRole === 'renter' ? 'Renter' : 'Owner'}
              </Text>
            </View>
          </View>
        </View>

        {/* Issue Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Issue Type *</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowIssueTypeDropdown(true)}
          >
            <View style={styles.dropdownContent}>
              {getSelectedIssueType() ? (
                <View style={styles.dropdownSelected}>
                  <Ionicons 
                    name={getSelectedIssueType()!.icon as any} 
                    size={20} 
                    color={colors.primary.main} 
                  />
                  <Text style={styles.dropdownSelectedText}>
                    {getSelectedIssueType()!.label}
                  </Text>
                </View>
              ) : (
                <Text style={styles.dropdownPlaceholder}>Select issue type</Text>
              )}
            </View>
            <Ionicons name="chevron-down" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Severity Level */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Severity Level *</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowSeverityDropdown(true)}
          >
            <View style={styles.dropdownContent}>
              {getSelectedSeverity() ? (
                <View style={styles.dropdownSelected}>
                  <View style={[
                    styles.severityDot, 
                    { backgroundColor: getSelectedSeverity()!.color }
                  ]} />
                  <Text style={styles.dropdownSelectedText}>
                    {getSelectedSeverity()!.label}
                  </Text>
                </View>
              ) : (
                <Text style={styles.dropdownPlaceholder}>Select severity level</Text>
              )}
            </View>
            <Ionicons name="chevron-down" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Issue Title */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Issue Title *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Brief summary of the issue"
            value={formData.title}
            onChangeText={(text) => updateFormData('title', text)}
            maxLength={100}
          />
          <Text style={styles.characterCount}>{formData.title.length}/100</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description *</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Please provide detailed information about the issue..."
            value={formData.description}
            onChangeText={(text) => updateFormData('description', text)}
            multiline
            numberOfLines={6}
            maxLength={1000}
            textAlignVertical="top"
          />
          <Text style={styles.characterCount}>{formData.description.length}/1000</Text>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location (Optional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Where did this issue occur?"
            value={formData.location}
            onChangeText={(text) => updateFormData('location', text)}
            maxLength={200}
          />
        </View>

        {/* Photos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos (Optional)</Text>
          <Text style={styles.sectionSubtitle}>Upload photos to help document the issue (up to 5 photos)</Text>
          
          <View style={styles.photosContainer}>
            {formData.photos.map((photo, index) => (
              <View key={index} style={styles.photoContainer}>
                <Image source={{ uri: photo }} style={styles.photoPreview} />
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={() => removePhoto(index)}
                >
                  <Ionicons name="close-circle" size={24} color={colors.semantic.error} />
                </TouchableOpacity>
              </View>
            ))}
            
            {formData.photos.length < 5 && (
              <TouchableOpacity
                style={styles.addPhotoButton}
                onPress={pickImage}
                disabled={uploadingPhotos}
              >
                {uploadingPhotos ? (
                  <ActivityIndicator size="small" color={colors.primary.main} />
                ) : (
                  <>
                    <Ionicons name="camera-outline" size={32} color={colors.primary.main} />
                    <Text style={styles.addPhotoText}>Add Photo</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Financial Impact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Impact</Text>
          <View style={styles.switchContainer}>
            <View style={styles.switchContent}>
              <Text style={styles.switchLabel}>Does this issue involve financial impact?</Text>
              <Text style={styles.switchDescription}>
                Check this if the issue resulted in additional costs or damages
              </Text>
            </View>
            <Switch
              value={formData.financial_impact}
              onValueChange={(value) => updateFormData('financial_impact', value)}
              trackColor={{ false: colors.gray[300], true: colors.primary.main }}
              thumbColor={formData.financial_impact ? colors.white : colors.gray[400]}
            />
          </View>
          
          {formData.financial_impact && (
            <View style={styles.costInputContainer}>
              <Text style={styles.costInputLabel}>Estimated Cost (AUD) *</Text>
              <TextInput
                style={styles.costInput}
                placeholder="0.00"
                value={formData.estimated_cost > 0 ? formData.estimated_cost.toString() : ''}
                onChangeText={(text) => {
                  const cost = parseFloat(text) || 0;
                  updateFormData('estimated_cost', cost);
                }}
                keyboardType="numeric"
              />
            </View>
          )}
        </View>

        {/* Resolution Request */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resolution Request (Optional)</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="What would you like to see happen to resolve this issue?"
            value={formData.resolution_request}
            onChangeText={(text) => updateFormData('resolution_request', text)}
            multiline
            numberOfLines={4}
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={styles.characterCount}>{formData.resolution_request.length}/500</Text>
        </View>

        {/* Contact Preference */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferred Contact Method</Text>
          <View style={styles.contactContainer}>
            {CONTACT_PREFERENCES.map((pref) => (
              <TouchableOpacity
                key={pref.value}
                style={[
                  styles.contactOption,
                  formData.contact_preference === pref.value && styles.contactOptionSelected
                ]}
                onPress={() => updateFormData('contact_preference', pref.value)}
              >
                <Ionicons 
                  name={pref.icon as any} 
                  size={20} 
                  color={formData.contact_preference === pref.value ? colors.primary.main : colors.text.secondary} 
                />
                <Text style={[
                  styles.contactLabel,
                  formData.contact_preference === pref.value && styles.contactLabelSelected
                ]}>
                  {pref.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={submitReport}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Ionicons name="send" size={20} color={colors.white} />
                <Text style={styles.submitButtonText}>Submit Report</Text>
              </>
            )}
          </TouchableOpacity>
          
          <Text style={styles.submitNote}>
            Your report will be reviewed by our admin team and you'll be contacted via your preferred method.
          </Text>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Issue Type Dropdown Modal */}
      <DropdownModal
        visible={showIssueTypeDropdown}
        onClose={() => setShowIssueTypeDropdown(false)}
        title="Select Issue Type"
        options={ISSUE_TYPES}
        selectedValue={formData.issue_type}
        onSelect={(value) => updateFormData('issue_type', value)}
        renderOption={(option, isSelected) => (
          <View style={styles.modalOptionContent}>
            <View style={styles.modalOptionHeader}>
              <Ionicons 
                name={option.icon as any} 
                size={24} 
                color={isSelected ? colors.primary.main : colors.text.secondary} 
              />
              <Text style={[
                styles.modalOptionLabel,
                isSelected && styles.modalOptionLabelSelected
              ]}>
                {option.label}
              </Text>
            </View>
            <Text style={styles.modalOptionDescription}>{option.description}</Text>
          </View>
        )}
      />

      {/* Severity Level Dropdown Modal */}
      <DropdownModal
        visible={showSeverityDropdown}
        onClose={() => setShowSeverityDropdown(false)}
        title="Select Severity Level"
        options={SEVERITY_LEVELS}
        selectedValue={formData.severity}
        onSelect={(value) => updateFormData('severity', value)}
        renderOption={(option, isSelected) => (
          <View style={styles.modalOptionContent}>
            <View style={styles.modalOptionHeader}>
              <View style={[styles.severityDot, { backgroundColor: option.color }]} />
              <Text style={[
                styles.modalOptionLabel,
                isSelected && { color: option.color }
              ]}>
                {option.label}
              </Text>
            </View>
            <Text style={styles.modalOptionDescription}>{option.description}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.lightGray,
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  sectionSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  bookingCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    borderRadius: 12,
    padding: spacing.md,
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  bookingTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  bookingInfo: {
    paddingLeft: spacing.lg + spacing.sm,
  },
  bookingItemTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  bookingDates: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  bookingRole: {
    fontSize: typography.sizes.sm,
    color: colors.primary.main,
    fontWeight: typography.weights.medium,
  },
  dropdownButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownContent: {
    flex: 1,
  },
  dropdownSelected: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownSelectedText: {
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
    marginLeft: spacing.sm,
  },
  dropdownPlaceholder: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
  },
  severityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  modalCloseButton: {
    padding: spacing.xs,
  },
  modalScrollView: {
    maxHeight: 400,
  },
  modalOption: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  modalOptionSelected: {
    backgroundColor: `${colors.primary.main}10`,
  },
  modalOptionContent: {
    flex: 1,
  },
  modalOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  modalOptionLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  modalOptionLabelSelected: {
    color: colors.primary.main,
  },
  modalOptionDescription: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginLeft: spacing.lg + spacing.sm,
  },
  textInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    marginHorizontal: spacing.md,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    textAlign: 'right',
    marginTop: spacing.xs,
    marginRight: spacing.md,
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
  },
  photoContainer: {
    position: 'relative',
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  photoPreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.white,
    borderRadius: 12,
  },
  addPhotoButton: {
    width: 80,
    height: 80,
    borderWidth: 2,
    borderColor: colors.primary.main,
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: `${colors.primary.main}10`,
  },
  addPhotoText: {
    fontSize: typography.sizes.xs,
    color: colors.primary.main,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  switchContainer: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchContent: {
    flex: 1,
    marginRight: spacing.md,
  },
  switchLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  switchDescription: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  costInputContainer: {
    marginTop: spacing.md,
  },
  costInputLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  costInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    marginHorizontal: spacing.md,
  },
  contactContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
  },
  contactOption: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.gray[200],
    borderRadius: 8,
    padding: spacing.md,
    marginRight: spacing.sm,
    alignItems: 'center',
  },
  contactOptionSelected: {
    borderColor: colors.primary.main,
    backgroundColor: `${colors.primary.main}10`,
  },
  contactLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  contactLabelSelected: {
    color: colors.primary.main,
    fontWeight: typography.weights.medium,
  },
  submitContainer: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  submitButton: {
    backgroundColor: colors.primary.main,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray[400],
  },
  submitButtonText: {
    color: colors.white,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    marginLeft: spacing.sm,
  },
  submitNote: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});
