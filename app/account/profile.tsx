import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../src/components/AuthProvider';
import { supabase } from '../../src/lib/supabase';
import { colors, spacing, typography } from '../../src/lib/design-system';
import { Header } from '../../src/components/Header';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  bio?: string;
  avatar_url?: string;
  address?: string;
  city?: string;
  state?: string;
  verified: boolean;
  stripe_onboarded: boolean;
  created_at: string;
  trust_score?: number;
  completion_rate?: number;
}

export default function ProfileDetailsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user: currentUser, profile: existingProfile } = useAuth();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone_number: '',
    bio: '',
    address: '',
    city: '',
    state: ''
  });

  // Use existing profile from auth context or fetch if needed
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) throw new Error('No user ID');
      
      // If we already have a profile from auth context, use it
      if (existingProfile) {
        const enhancedProfile: UserProfile = {
          ...existingProfile,
          verified: existingProfile.verified || false,
          stripe_onboarded: false, // Default value, should be fetched from database
          trust_score: 87,
          completion_rate: 94
        };
        return enhancedProfile;
      }
      
      // Otherwise fetch from database
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();
      
      if (error) throw error;

      const enhancedProfile: UserProfile = {
        ...data,
        trust_score: 87,
        completion_rate: 94
      };

      return enhancedProfile;
    },
    enabled: !!currentUser?.id,
    initialData: existingProfile ? {
      ...existingProfile,
      verified: existingProfile.verified || false,
      stripe_onboarded: false,
      trust_score: 87,
      completion_rate: 94
    } : undefined,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', currentUser?.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', currentUser?.id] });
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to update profile');
      console.error('Profile update error:', error);
    },
  });

  useEffect(() => {
    if (profile) {
      setEditForm({
        full_name: profile.full_name ?? '',
        phone_number: profile.phone_number ?? '',
        bio: profile.bio ?? '',
        address: profile.address ?? '',
        city: profile.city ?? '',
        state: profile.state ?? ''
      });
    }
  }, [profile]);

  const handleProfileUpdate = () => {
    updateProfileMutation.mutate(editForm);
  };


  const handleImageUpload = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setIsUploadingImage(true);
        
        const file = result.assets[0];
        
        if (file.fileSize && file.fileSize > 5 * 1024 * 1024) {
          Alert.alert('Error', 'Image must be less than 5MB');
          return;
        }

        const fileExt = file.uri.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${currentUser?.id}/${fileName}`;

        const response = await fetch(file.uri);
        const blob = await response.blob();

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, blob);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('id', currentUser?.id);

        if (updateError) throw updateError;

        queryClient.invalidateQueries({ queryKey: ['profile', currentUser?.id] });
        Alert.alert('Success', 'Profile picture updated successfully');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.gray[50] }}>
        <Header title="Profile Details" showBackButton onBackPress={() => router.back()} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={{ marginTop: spacing.md, color: colors.gray[600] }}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.gray[50] }}>
        <Header title="Profile Details" showBackButton onBackPress={() => router.back()} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg }}>
          <Text style={{ fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.gray[900], marginBottom: spacing.sm }}>
            Profile not found
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: colors.primary.main,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              borderRadius: 8,
            }}
            onPress={() => router.back()}
          >
            <Text style={{ color: colors.white, fontWeight: typography.weights.semibold }}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.gray[50] }}>
      <Header 
        title="Profile Details" 
        showBackButton 
        onBackPress={() => router.back()}
        rightAction={{
          icon: isEditing ? "close" : "pencil",
          onPress: () => setIsEditing(!isEditing),
        }}
      />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: spacing.lg }}>
          {/* Profile Information Card */}
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
              Profile Information
            </Text>

            <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
              {/* Avatar Section */}
              <View style={{ position: 'relative', marginBottom: spacing.md }}>
                {profile.avatar_url ? (
                  <Image
                    source={{ uri: profile.avatar_url }}
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: 60,
                    }}
                  />
                ) : (
                  <View style={{
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                    backgroundColor: colors.primary.main,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    <Text style={{
                      fontSize: 48,
                      fontWeight: typography.weights.bold,
                      color: colors.white,
                    }}>
                      {profile.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </Text>
                  </View>
                )}
                
                <TouchableOpacity
                  onPress={handleImageUpload}
                  disabled={isUploadingImage}
                  style={{
                    position: 'absolute',
                    bottom: 4,
                    right: 4,
                    backgroundColor: colors.white,
                    borderRadius: 20,
                    width: 40,
                    height: 40,
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: colors.black,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  {isUploadingImage ? (
                    <ActivityIndicator size="small" color={colors.primary.main} />
                  ) : (
                    <Ionicons name="camera" size={20} color={colors.gray[600]} />
                  )}
                </TouchableOpacity>
              </View>

              {/* Profile Details */}
              {isEditing ? (
                <View style={{ width: '100%', gap: spacing.md }}>
                  <View>
                    <Text style={{
                      fontSize: typography.sizes.sm,
                      fontWeight: typography.weights.medium,
                      color: colors.gray[700],
                      marginBottom: spacing.xs,
                    }}>
                      Full Name
                    </Text>
                    <TextInput
                      value={editForm.full_name}
                      onChangeText={(text) => setEditForm(prev => ({ ...prev, full_name: text }))}
                      style={{
                        borderWidth: 1,
                        borderColor: colors.gray[300],
                        borderRadius: 8,
                        paddingHorizontal: spacing.sm,
                        paddingVertical: spacing.sm,
                        fontSize: typography.sizes.base,
                      }}
                      placeholder="Enter your full name"
                    />
                  </View>

                  <View>
                    <Text style={{
                      fontSize: typography.sizes.sm,
                      fontWeight: typography.weights.medium,
                      color: colors.gray[700],
                      marginBottom: spacing.xs,
                    }}>
                      Phone
                    </Text>
                    <TextInput
                      value={editForm.phone_number}
                      onChangeText={(text) => setEditForm(prev => ({ ...prev, phone_number: text }))}
                      style={{
                        borderWidth: 1,
                        borderColor: colors.gray[300],
                        borderRadius: 8,
                        paddingHorizontal: spacing.sm,
                        paddingVertical: spacing.sm,
                        fontSize: typography.sizes.base,
                      }}
                      placeholder="Enter your phone number"
                      keyboardType="phone-pad"
                    />
                  </View>

                  <View>
                    <Text style={{
                      fontSize: typography.sizes.sm,
                      fontWeight: typography.weights.medium,
                      color: colors.gray[700],
                      marginBottom: spacing.xs,
                    }}>
                      Bio
                    </Text>
                    <TextInput
                      value={editForm.bio}
                      onChangeText={(text) => setEditForm(prev => ({ ...prev, bio: text }))}
                      style={{
                        borderWidth: 1,
                        borderColor: colors.gray[300],
                        borderRadius: 8,
                        paddingHorizontal: spacing.sm,
                        paddingVertical: spacing.sm,
                        fontSize: typography.sizes.base,
                        height: 80,
                        textAlignVertical: 'top',
                      }}
                      placeholder="Tell others about yourself..."
                      multiline
                      numberOfLines={3}
                    />
                  </View>

                  <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: typography.sizes.sm,
                        fontWeight: typography.weights.medium,
                        color: colors.gray[700],
                        marginBottom: spacing.xs,
                      }}>
                        City
                      </Text>
                      <TextInput
                        value={editForm.city}
                        onChangeText={(text) => setEditForm(prev => ({ ...prev, city: text }))}
                        style={{
                          borderWidth: 1,
                          borderColor: colors.gray[300],
                          borderRadius: 8,
                          paddingHorizontal: spacing.sm,
                          paddingVertical: spacing.sm,
                          fontSize: typography.sizes.base,
                        }}
                        placeholder="City"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: typography.sizes.sm,
                        fontWeight: typography.weights.medium,
                        color: colors.gray[700],
                        marginBottom: spacing.xs,
                      }}>
                        State
                      </Text>
                      <TextInput
                        value={editForm.state}
                        onChangeText={(text) => setEditForm(prev => ({ ...prev, state: text }))}
                        style={{
                          borderWidth: 1,
                          borderColor: colors.gray[300],
                          borderRadius: 8,
                          paddingHorizontal: spacing.sm,
                          paddingVertical: spacing.sm,
                          fontSize: typography.sizes.base,
                        }}
                        placeholder="State"
                      />
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
                    <TouchableOpacity
                      onPress={handleProfileUpdate}
                      disabled={updateProfileMutation.isPending}
                      style={{
                        flex: 1,
                        backgroundColor: colors.primary.main,
                        paddingVertical: spacing.sm,
                        borderRadius: 8,
                        alignItems: 'center',
                      }}
                    >
                      {updateProfileMutation.isPending ? (
                        <ActivityIndicator size="small" color={colors.white} />
                      ) : (
                        <Text style={{
                          color: colors.white,
                          fontWeight: typography.weights.semibold,
                        }}>
                          Save Changes
                        </Text>
                      )}
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={() => setIsEditing(false)}
                      style={{
                        flex: 1,
                        backgroundColor: colors.gray[100],
                        paddingVertical: spacing.sm,
                        borderRadius: 8,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{
                        color: colors.gray[700],
                        fontWeight: typography.weights.semibold,
                      }}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={{ width: '100%', alignItems: 'center', gap: spacing.sm }}>
                  <Text style={{
                    fontSize: typography.sizes.xl,
                    fontWeight: typography.weights.bold,
                    color: colors.gray[900],
                  }}>
                    {profile.full_name}
                  </Text>
                  
                  <Text style={{
                    fontSize: typography.sizes.base,
                    color: colors.gray[600],
                  }}>
                    {profile.email}
                  </Text>
                  
                  {profile.verified && (
                    <View style={{
                      backgroundColor: colors.semantic.success,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.xs,
                      borderRadius: 16,
                      marginTop: spacing.xs,
                    }}>
                      <Text style={{
                        color: colors.white,
                        fontSize: typography.sizes.sm,
                        fontWeight: typography.weights.medium,
                      }}>
                        ✓ Verified
                      </Text>
                    </View>
                  )}
                  
                  {profile.phone_number && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="call" size={16} color={colors.gray[600]} />
                      <Text style={{
                        marginLeft: spacing.xs,
                        color: colors.gray[600],
                        fontSize: typography.sizes.base,
                      }}>
                        {profile.phone_number}
                      </Text>
                    </View>
                  )}
                  
                  {(profile.address || profile.city || profile.state) && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="location" size={16} color={colors.gray[600]} />
                      <Text style={{
                        marginLeft: spacing.xs,
                        color: colors.gray[600],
                        fontSize: typography.sizes.base,
                      }}>
                        {profile.address}{profile.address && (profile.city || profile.state) && ', '}{profile.city}{profile.city && profile.state && ', '}{profile.state}
                      </Text>
                    </View>
                  )}
                  
                  {profile.bio && (
                    <View style={{ marginTop: spacing.sm }}>
                      <Text style={{
                        fontSize: typography.sizes.base,
                        fontWeight: typography.weights.medium,
                        color: colors.gray[900],
                        marginBottom: spacing.xs,
                      }}>
                        About
                      </Text>
                      <Text style={{
                        fontSize: typography.sizes.base,
                        color: colors.gray[600],
                        textAlign: 'center',
                      }}>
                        {profile.bio}
                      </Text>
                    </View>
                  )}
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm }}>
                    <Ionicons name="trophy" size={16} color={colors.gray[500]} />
                    <Text style={{
                      marginLeft: spacing.xs,
                      fontSize: typography.sizes.sm,
                      color: colors.gray[500],
                    }}>
                      Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}
