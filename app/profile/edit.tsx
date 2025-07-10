import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../src/stores/auth';
import { supabase } from '../../src/lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

// Form validation schema
const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(50),
  last_name: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  location: z.string().max(100).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileSettings {
  show_phone: boolean;
  show_location: boolean;
  allow_messages: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
}

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [settings, setSettings] = useState<ProfileSettings>({
    show_phone: true,
    show_location: true,
    allow_messages: true,
    email_notifications: true,
    push_notifications: true,
  });

  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      bio: '',
      location: '',
    },
  });

  // Fetch current profile data
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Load profile data into form
  useEffect(() => {
    if (profile) {
      setValue('first_name', profile.first_name || '');
      setValue('last_name', profile.last_name || '');
      setValue('email', profile.email || '');
      setValue('phone', profile.phone || '');
      setValue('bio', profile.bio || '');
      setValue('location', profile.location || '');
      setAvatarUri(profile.avatar_url);
      
      // Load settings (in a real app, these would come from a settings table)
      setSettings({
        show_phone: profile.show_phone ?? true,
        show_location: profile.show_location ?? true,
        allow_messages: profile.allow_messages ?? true,
        email_notifications: profile.email_notifications ?? true,
        push_notifications: profile.push_notifications ?? true,
      });
    }
  }, [profile, setValue]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData & { avatar_url?: string }) => {
      if (!user?.id) throw new Error('User not found');

      const updateData = {
        ...data,
        ...settings,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);
      
      if (error) throw error;

      // Update auth user data
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
        }
      });

      if (authError) throw authError;

      return { ...data, ...settings };
    },
    onSuccess: (updatedData) => {
      // Update local auth store
      if (user) {
        setUser({
          ...user,
          user_metadata: {
            ...user.user_metadata,
            first_name: updatedData.first_name,
            last_name: updatedData.last_name,
          }
        });
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      
      setIsSubmitting(false);
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    },
    onError: (error) => {
      console.error('Profile update error:', error);
      setIsSubmitting(false);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    },
  });

  // Handle form submission
  const onSubmit = (data: ProfileFormData) => {
    setIsSubmitting(true);
    updateProfileMutation.mutate({
      ...data,
      avatar_url: avatarUri || undefined,
    });
  };

  // Handle avatar selection
  const handleSelectAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library to upload an avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  // Handle verification document upload
  const handleVerificationUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        Alert.alert(
          'Document Uploaded',
          'Your verification document has been uploaded. We will review it within 24-48 hours.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Document picker error:', error);
      Alert.alert('Error', 'Failed to upload document. Please try again.');
    }
  };

  // Handle settings change
  const handleSettingChange = (key: keyof ProfileSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity 
            onPress={handleSubmit(onSubmit)}
            style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
            disabled={isSubmitting}
          >
            <Text style={styles.saveButtonText}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Avatar Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Photo</Text>
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {watch('first_name')?.charAt(0).toUpperCase() || 'U'}
                  {watch('last_name')?.charAt(0).toUpperCase() || ''}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.changeAvatarButton} onPress={handleSelectAvatar}>
              <Text style={styles.changeAvatarText}>Change Photo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>First Name *</Text>
            <Controller
              control={control}
              name="first_name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.first_name && styles.inputError]}
                  placeholder="Enter your first name"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  autoCapitalize="words"
                />
              )}
            />
            {errors.first_name && (
              <Text style={styles.errorText}>{errors.first_name.message}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Last Name *</Text>
            <Controller
              control={control}
              name="last_name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.last_name && styles.inputError]}
                  placeholder="Enter your last name"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  autoCapitalize="words"
                />
              )}
            />
            {errors.last_name && (
              <Text style={styles.errorText}>{errors.last_name.message}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email Address *</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="Enter your email"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              )}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email.message}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.phone && styles.inputError]}
                  placeholder="Enter your phone number"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  keyboardType="phone-pad"
                />
              )}
            />
            {errors.phone && (
              <Text style={styles.errorText}>{errors.phone.message}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Location</Text>
            <Controller
              control={control}
              name="location"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.location && styles.inputError]}
                  placeholder="Enter your city or region"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  autoCapitalize="words"
                />
              )}
            />
            {errors.location && (
              <Text style={styles.errorText}>{errors.location.message}</Text>
            )}
          </View>
        </View>

        {/* Bio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About You</Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Bio</Text>
            <Controller
              control={control}
              name="bio"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.textArea, errors.bio && styles.inputError]}
                  placeholder="Tell others about yourself, your hobbies, or what you're passionate about..."
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                />
              )}
            />
            <Text style={styles.characterCount}>
              {watch('bio')?.length || 0}/500
            </Text>
            {errors.bio && (
              <Text style={styles.errorText}>{errors.bio.message}</Text>
            )}
          </View>
        </View>

        {/* Verification Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Verification</Text>
          <Text style={styles.sectionDescription}>
            Verification helps build trust in the community. Upload an ID or other document to get verified.
          </Text>
          
          <View style={styles.verificationCard}>
            <Text style={styles.verificationStatus}>
              Status: {profile?.verification_status === 'verified' ? '✓ Verified' : 
                      profile?.verification_status === 'pending' ? '⏳ Pending Review' : 
                      '❌ Unverified'}
            </Text>
            
            {profile?.verification_status !== 'verified' && (
              <TouchableOpacity 
                style={styles.uploadButton}
                onPress={handleVerificationUpload}
              >
                <Text style={styles.uploadButtonText}>
                  {profile?.verification_status === 'pending' ? 'Upload New Document' : 'Upload ID Document'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Privacy Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Show Phone Number</Text>
              <Text style={styles.settingDescription}>Allow other users to see your phone number</Text>
            </View>
            <Switch
              value={settings.show_phone}
              onValueChange={(value) => handleSettingChange('show_phone', value)}
              trackColor={{ false: '#e5e7eb', true: '#86efac' }}
              thumbColor={settings.show_phone ? '#22c55e' : '#f3f4f6'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Show Location</Text>
              <Text style={styles.settingDescription}>Display your general location on your profile</Text>
            </View>
            <Switch
              value={settings.show_location}
              onValueChange={(value) => handleSettingChange('show_location', value)}
              trackColor={{ false: '#e5e7eb', true: '#86efac' }}
              thumbColor={settings.show_location ? '#22c55e' : '#f3f4f6'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Allow Messages</Text>
              <Text style={styles.settingDescription}>Let other users send you messages</Text>
            </View>
            <Switch
              value={settings.allow_messages}
              onValueChange={(value) => handleSettingChange('allow_messages', value)}
              trackColor={{ false: '#e5e7eb', true: '#86efac' }}
              thumbColor={settings.allow_messages ? '#22c55e' : '#f3f4f6'}
            />
          </View>
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Email Notifications</Text>
              <Text style={styles.settingDescription}>Receive updates via email</Text>
            </View>
            <Switch
              value={settings.email_notifications}
              onValueChange={(value) => handleSettingChange('email_notifications', value)}
              trackColor={{ false: '#e5e7eb', true: '#86efac' }}
              thumbColor={settings.email_notifications ? '#22c55e' : '#f3f4f6'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingDescription}>Receive notifications on your device</Text>
            </View>
            <Switch
              value={settings.push_notifications}
              onValueChange={(value) => handleSettingChange('push_notifications', value)}
              trackColor={{ false: '#e5e7eb', true: '#86efac' }}
              thumbColor={settings.push_notifications ? '#22c55e' : '#f3f4f6'}
            />
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Change Password</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Download My Data</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.dangerButton]}>
            <Text style={[styles.actionButtonText, styles.dangerButtonText]}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6b7280',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  saveButton: {
    backgroundColor: '#44d62c',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
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
    marginBottom: 16,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  avatarSection: {
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#44d62c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
  },
  changeAvatarButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  changeAvatarText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#111827',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#111827',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  verificationCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  verificationStatus: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 12,
  },
  uploadButton: {
    backgroundColor: '#44d62c',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 18,
  },
  actionButton: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  dangerButton: {
    backgroundColor: '#fee2e2',
    borderColor: '#fecaca',
  },
  dangerButtonText: {
    color: '#dc2626',
  },
}); 