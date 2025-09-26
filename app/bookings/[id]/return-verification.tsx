import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { mobileTokens } from '../../../src/lib/design-system';
import { useAuth } from '../../../src/components/AuthProvider';
import { useBookingRealtime } from '../../../src/hooks/useBookingRealtime';
import { supabase } from '../../../src/lib/supabase';
import { isUserAdmin } from '../../../src/utils/admin';

const { width: screenWidth } = Dimensions.get('window');

interface ReturnPhoto {
  uri?: string;      // Local URI (for photos being taken)
  url?: string;      // Cloud URL (for photos from database)
  timestamp: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  description?: string;
  user_id?: string;
  user_type?: string;
  uploaded_by?: string; // User ID who uploaded this photo
  photo_index?: number;
  uploaded_at?: string;
  metadata?: {
    timestamp: string;
    location?: {
      latitude: number;
      longitude: number;
      address?: string;
    };
  };
}

interface PickupPhoto {
  uri?: string;      // Local URI (for photos being taken)
  url?: string;      // Cloud URL (for photos from database)
  timestamp: string;
  user_type: 'owner' | 'renter';
  photo_index: number;
  metadata?: {
    timestamp: string;
    location?: {
      latitude: number;
      longitude: number;
      address?: string;
    };
  };
}

interface BookingDetails {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  pickup_images?: PickupPhoto[];
  return_images?: ReturnPhoto[];
  listing_images?: string[];
  owner_id: string;
  renter_id: string;
  status: string;
  damage_report?: string;
  damage_reported_by?: string;
  damage_reported_at?: string;
  owner_notes?: string;
  listings?: {
    title: string;
    images: string[];
  };
}

export default function ReturnVerificationScreen() {
  const router = useRouter();
  const { id: bookingId } = useLocalSearchParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [photos, setPhotos] = useState<ReturnPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [showDamageModal, setShowDamageModal] = useState(false);
  const [damageReport, setDamageReport] = useState('');
  const [ownerNotes, setOwnerNotes] = useState('');
  const [selectedPickupPhoto, setSelectedPickupPhoto] = useState<PickupPhoto | null>(null);

  // Set up real-time subscription for this booking
  const { isConnected } = useBookingRealtime({
    bookingId: bookingId as string,
    userId: user?.id,
    enabled: !!bookingId && !!user?.id,
  });

  // Use React Query for booking data so it updates with real-time changes
  const { data: booking, isLoading: loading, error } = useQuery({
    queryKey: ['booking-details', bookingId],
    queryFn: async () => {
      if (!bookingId) throw new Error('No booking ID');
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          listings!listing_id (
            id,
            title,
            images
          )
        `)
        .eq('id', bookingId)
        .single();

      if (error) throw error;
      
      // Transform data to match expected structure
      const transformedBooking = {
        ...data,
        title: data.listings?.title || 'Unknown Item',
        listing_images: data.listings?.images || [],
      };
      
      return transformedBooking as BookingDetails;
    },
    enabled: !!bookingId,
  });

  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Load existing photos when booking data is available
  useEffect(() => {
    if (booking?.return_images && Array.isArray(booking.return_images)) {
      setPhotos(booking.return_images);
    }
  }, [booking?.return_images]);

  // Load existing damage report and owner notes when booking data is available
  useEffect(() => {
    if (booking?.damage_report) {
      setDamageReport(booking.damage_report);
    }
    if (booking?.owner_notes) {
      setOwnerNotes(booking.owner_notes);
    }
  }, [booking?.damage_report, booking?.owner_notes]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setCurrentLocation(location);
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const takePhoto = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera access is required to take verification photos.');
        return;
      }

              // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Create photo object with metadata
        const newPhoto: ReturnPhoto = {
          uri: asset.uri,
          timestamp: new Date().toISOString(),
          user_id: user?.id,
          user_type: booking?.renter_id === user?.id ? 'renter' : 'owner',
          location: currentLocation ? {
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          } : undefined,
        };

        // Add reverse geocoding to get address
        if (currentLocation) {
          try {
            const addresses = await Location.reverseGeocodeAsync({
              latitude: currentLocation.coords.latitude,
              longitude: currentLocation.coords.longitude,
            });
            if (addresses.length > 0) {
              const address = addresses[0];
              newPhoto.location!.address = `${address.street || ''} ${address.city || ''} ${address.region || ''}`.trim();
            }
          } catch (geocodeError) {
            console.error('Geocoding error:', geocodeError);
          }
        }

        setPhotos(prev => [...prev, newPhoto]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const removePhoto = (index: number) => {
    if (!user || !booking) return;
    
    const photoToRemove = photos[index];
    if (!photoToRemove) return;
    
    // Check ownership - prevent deletion of photos not uploaded by current user
    // For backward compatibility: if uploaded_by is missing, assume it belongs to renter
    const photoOwner = photoToRemove.uploaded_by || photoToRemove.user_id || booking.renter_id;
    
    if (photoOwner !== user.id) {
      const ownerName = photoOwner === booking.renter_id ? 'renter' : 'owner';
      Alert.alert(
        'Cannot Delete Photo',
        `You can only delete photos you uploaded. This photo was uploaded by the ${ownerName}.`,
        [{ text: 'OK' }]
      );
      return;
    }
    
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setPhotos(prev => prev.filter((_, i) => i !== index));
          },
        },
      ]
    );
  };

  const reportDamage = () => {
    setShowDamageModal(true);
  };

  const submitDamageReport = () => {
    if (damageReport.trim().length < 10) {
      Alert.alert('Damage Report', 'Please provide a more detailed damage report (at least 10 characters).');
      return;
    }
    
    Alert.alert(
      'Damage Report Submitted',
      'Your damage report has been recorded and will be reviewed by our team.',
      [{ text: 'OK', onPress: () => setShowDamageModal(false) }]
    );
  };

  const submitVerification = async () => {
    if (photos.length < 2) {
      Alert.alert('More Photos Required', 'Please take at least 2 verification photos to continue.');
      return;
    }

    if (photos.length > 10) {
      Alert.alert('Too Many Photos', 'Please limit to 10 photos maximum.');
      return;
    }

    if (!booking || !user) {
      Alert.alert('Error', 'Missing booking or user information.');
      return;
    }

    setUploading(true);
    try {
      // Determine if the current user is the renter or owner
      const isRenter = booking.renter_id === user.id;
      const isOwner = booking.owner_id === user.id;
      const isAdmin = isUserAdmin(user);

      if (!isRenter && !isOwner && !isAdmin) {
        Alert.alert('Error', 'You are not authorized to verify this booking.');
        return;
      }


      // Upload photos to Supabase Storage and get URLs
      const uploadedPhotos = [];
      
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        try {
          console.log(`Return photo object ${i + 1}:`, photo);
          
          // Skip photos that are already uploaded (have URL but no URI)
          if (photo.url && !photo.uri) {
            console.log(`Return photo ${i + 1} already uploaded, adding to list:`, photo.url);
            uploadedPhotos.push(photo);
            continue;
          }
          
          // Only upload photos that have a URI (new photos from camera)
          if (!photo.uri) {
            console.log(`Return photo ${i + 1} has no URI, skipping upload`);
            continue;
          }
          
          // Generate unique filename
          const fileExt = photo.uri.split('.').pop() || 'jpg';
          const fileName = `return_${bookingId}_${user.id}_${Date.now()}_${i}.${fileExt}`;
          
          console.log(`Uploading new return photo ${i + 1}: ${fileName}`);
          console.log(`Return photo URI: ${photo.uri}`);
          
          let publicUrl: string;
          
          // Try blob approach first (like profile upload)
          try {
            console.log(`Trying blob upload for return ${fileName}`);
            const response = await fetch(photo.uri);
            const blob = await response.blob();
            console.log(`Return blob created, size: ${blob.size}`);
            
            // Try listing-images bucket with blob
            const { data, error } = await supabase.storage
              .from('listing-images')
              .upload(fileName, blob);
            
            if (error) {
              console.error(`Return blob upload error for ${fileName}:`, error);
              throw error;
            }
            
            console.log(`Successfully uploaded return ${fileName} to listing-images bucket via blob`);
            
            // Get public URL
            const { data: { publicUrl: url } } = supabase.storage
              .from('listing-images')
              .getPublicUrl(fileName);
            
            publicUrl = url;
            console.log(`Return public URL: ${publicUrl}`);
            
          } catch (blobError) {
            console.error(`Return blob upload failed, trying FormData:`, blobError);
            
            // Fallback to FormData approach
            const uploadFormData = new FormData();
            uploadFormData.append('file', {
              uri: photo.uri,
              type: `image/${fileExt}`,
              name: fileName,
            } as any);
            
            console.log(`Return FormData created for ${fileName}`);
            
            // Try using listing-images bucket first (known to work)
            const { data, error } = await supabase.storage
              .from('listing-images')
              .upload(fileName, uploadFormData);
            
            if (error) {
              console.error(`Return FormData upload error for ${fileName}:`, error);
              // Try booking-confirmations bucket as fallback
              console.log('Trying booking-confirmations bucket as fallback for return...');
              const { data: fallbackData, error: fallbackError } = await supabase.storage
                .from('booking-confirmations')
                .upload(fileName, uploadFormData);
              
              if (fallbackError) {
                console.error(`Return fallback upload error for ${fileName}:`, fallbackError);
                throw fallbackError;
              }
              console.log(`Successfully uploaded return ${fileName} to booking-confirmations bucket`);
              
              // Get public URL from booking-confirmations
              const { data: { publicUrl: url } } = supabase.storage
                .from('booking-confirmations')
                .getPublicUrl(fileName);
              
              publicUrl = url;
              console.log(`Return public URL: ${publicUrl}`);
            } else {
              console.log(`Successfully uploaded return ${fileName} to listing-images bucket via FormData`);
              
              // Get public URL from listing-images
              const { data: { publicUrl: url } } = supabase.storage
                .from('listing-images')
                .getPublicUrl(fileName);
              
              publicUrl = url;
              console.log(`Return public URL: ${publicUrl}`);
            }
          }
          
          // Create photo object with cloud URL
          uploadedPhotos.push({
            url: publicUrl,
            user_id: user.id,
            user_type: isRenter ? 'renter' : 'owner',
            uploaded_by: user.id, // Track who uploaded this photo
            photo_index: i,
            uploaded_at: new Date().toISOString(),
            metadata: {
              timestamp: photo.timestamp || new Date().toISOString(),
              location: photo.location,
            },
          });
        } catch (uploadError) {
          console.error('Error uploading return photo:', uploadError);
          Alert.alert('Upload Failed', `Failed to upload photo ${i + 1}. Please try again.`);
          return;
        }
      }

      // Get current return images
      const currentReturnImages = booking.return_images || [];
      
      // Add new photos to existing ones
      const updatedReturnImages = [
        ...currentReturnImages,
        ...uploadedPhotos,
      ];

      // Update booking with return verification data
      const updateData: any = {
        return_images: updatedReturnImages,
        updated_at: new Date().toISOString(),
      };

      if (isRenter) {
        updateData.return_confirmed_by_renter = true;
        updateData.return_confirmed_at = new Date().toISOString();
      } else if (isOwner) {
        updateData.return_confirmed_by_owner = true;
        updateData.return_confirmed_at = new Date().toISOString();
      }

      // Add damage report if provided (both parties can report damage/issues)
      if (damageReport.trim()) {
        if (isRenter) {
          // Renter uses the existing damage_report field
          updateData.damage_report = damageReport.trim();
          updateData.damage_reported_by = user.id;
          updateData.damage_reported_at = new Date().toISOString();
        } else {
          // Owner uses the owner_notes field for now (until database schema is updated)
          updateData.owner_notes = damageReport.trim();
        }
      }

      // Check if both parties have now confirmed return
      // Note: We need to check the current state from database first
      const { data: currentBooking } = await supabase
        .from('bookings')
        .select('return_confirmed_by_renter, return_confirmed_by_owner, damage_report, owner_notes')
        .eq('id', bookingId)
        .single();

      const renterConfirmed = isRenter ? true : (currentBooking?.return_confirmed_by_renter || false);
      const ownerConfirmed = isOwner ? true : (currentBooking?.return_confirmed_by_owner || false);
      
      // Check if there are any damage reports that need resolution
      const hasDamageReport = currentBooking?.damage_report || updateData.damage_report;
      const hasOwnerNotes = currentBooking?.owner_notes || updateData.owner_notes;
      
      // If there are damage reports, the booking should NOT auto-complete
      // It should go to a "pending_damage_resolution" status instead
      const bothConfirmed = renterConfirmed && ownerConfirmed;
      const hasDamageReports = hasDamageReport || hasOwnerNotes;
      
      // Only complete if both confirmed AND no damage reports exist
      const canComplete = bothConfirmed && !hasDamageReports;
      
      if (canComplete) {
        updateData.status = 'completed';
        updateData.completed_at = new Date().toISOString();
      } else if (bothConfirmed && hasDamageReports) {
        // Both parties confirmed but there are damage reports - needs resolution
        updateData.status = 'disputed';
      }

      const { error: updateError } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId);

      if (updateError) {
        console.error('Error updating booking with return verification:', updateError);
        Alert.alert('Error', 'Failed to save return verification. Please try again.');
        return;
      }

      // Handle notifications based on completion status
      const otherPartyConfirmed = (isRenter && ownerConfirmed) || (isOwner && renterConfirmed);
      
      if (bothConfirmed) {
        // Both parties confirmed - send completion emails to both
        try {
          const { emailService } = await import('../../../src/lib/email-service');
          
          // Get booking with full details for emails
          const { data: fullBooking } = await supabase
            .from('bookings')
            .select(`
              *,
              listings!inner(id, title, images),
              renter_profile:renter_id!inner(id, full_name, email),
              owner_profile:owner_id!inner(id, full_name, email)
            `)
            .eq('id', bookingId)
            .single();

          if (fullBooking) {
            // Send completion email to renter
            await emailService.sendEmail({
              to: fullBooking.renter_profile.email,
              subject: '🎉 Rental Completed Successfully!',
              html: `
                <h2>Your rental has been completed!</h2>
                <p>Hi ${fullBooking.renter_profile.full_name},</p>
                <p>Great news! Your rental of "${fullBooking.listings.title}" has been successfully completed.</p>
                <p><strong>Rental Details:</strong></p>
                <ul>
                  <li>Item: ${fullBooking.listings.title}</li>
                  <li>Rental Period: ${new Date(fullBooking.start_date).toLocaleDateString()} - ${new Date(fullBooking.end_date).toLocaleDateString()}</li>
                  <li>Status: Completed</li>
                </ul>
                ${damageReport ? '<p><strong>Note:</strong> A damage report was submitted and is under review.</p>' : '<p>The item was returned in good condition. Your deposit will be refunded shortly.</p>'}
                <p>Thank you for using Rent It Forward!</p>
              `,
              text: `Your rental of "${fullBooking.listings.title}" has been completed successfully. ${damageReport ? 'A damage report is under review.' : 'Your deposit will be refunded shortly.'}`
            });

            // Send completion email to owner
            await emailService.sendEmail({
              to: fullBooking.owner_profile.email,
              subject: '📦 Your Item Has Been Returned',
              html: `
                <h2>Rental completed successfully!</h2>
                <p>Hi ${fullBooking.owner_profile.full_name},</p>
                <p>Your item "${fullBooking.listings.title}" has been successfully returned by ${fullBooking.renter_profile.full_name}.</p>
                <p><strong>Rental Details:</strong></p>
                <ul>
                  <li>Item: ${fullBooking.listings.title}</li>
                  <li>Renter: ${fullBooking.renter_profile.full_name}</li>
                  <li>Rental Period: ${new Date(fullBooking.start_date).toLocaleDateString()} - ${new Date(fullBooking.end_date).toLocaleDateString()}</li>
                  <li>Status: Completed</li>
                </ul>
                ${damageReport ? '<p><strong>Note:</strong> A damage report was submitted and requires your review.</p>' : '<p>The item was returned in good condition.</p>'}
                <p>Your rental payment will be processed shortly.</p>
                <p>Thank you for using Rent It Forward!</p>
              `,
              text: `Your item "${fullBooking.listings.title}" has been successfully returned. ${damageReport ? 'A damage report requires review.' : 'The rental completed without issues.'}`
            });
            
            console.log('✅ Completion emails sent to both parties');
          }
        } catch (emailError) {
          console.log('❌ Email notifications failed but return verification saved:', emailError);
          // Don't fail the entire process if email fails
        }
      } else if (!otherPartyConfirmed) {
        // Only one party confirmed - notify the other party
        try {
          const { getNotificationApiService } = await import('../../../src/lib/notification-api');
          const notificationApi = getNotificationApiService();
          await notificationApi.notifyBookingAction({
            bookingId: bookingId as string,
            action: 'return',
            userId: user.id
          });
        } catch (notificationError) {
          console.log('Notification failed but return verification saved:', notificationError);
          // Don't fail the entire process if notification fails
        }
      }

      // Invalidate queries to refresh booking details
      queryClient.invalidateQueries({ queryKey: ['booking-details', bookingId] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      
      // Show appropriate success message based on completion status
      if (canComplete) {
        Alert.alert(
          'Return Completed!',
          'The return has been confirmed by both parties with no damage reports. Payment will be processed.',
          [
            {
              text: 'Continue',
              onPress: () => {
                // Ensure cache is invalidated right before navigation
                queryClient.invalidateQueries({ queryKey: ['booking-details', bookingId] });
                router.back();
              },
            },
          ]
        );
      } else if (bothConfirmed && hasDamageReports) {
        Alert.alert(
          'Return Confirmed - Dispute Resolution Required',
          'Both parties have confirmed the return, but damage reports need to be resolved before payment can be processed. The booking is now marked as disputed and our support team will review the reports and contact you.',
          [
            {
              text: 'Continue',
              onPress: () => {
                // Ensure cache is invalidated right before navigation
                queryClient.invalidateQueries({ queryKey: ['booking-details', bookingId] });
                router.back();
              },
            },
          ]
        );
      } else {
        Alert.alert(
          'Return Confirmed!',
          'Your return has been confirmed successfully. Waiting for the other party to confirm.',
          [
            {
              text: 'Continue',
              onPress: () => {
                // Ensure cache is invalidated right before navigation
                queryClient.invalidateQueries({ queryKey: ['booking-details', bookingId] });
                router.back();
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error submitting verification:', error);
      Alert.alert('Error', 'Failed to submit verification. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={mobileTokens.colors.primary.main} />
        <Text style={styles.loadingText}>Loading booking details...</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color={mobileTokens.colors.error} />
        <Text style={styles.errorText}>Booking not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backIcon}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={mobileTokens.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Return Verification</Text>
        </View>

        {/* Booking Info */}
        <View style={styles.bookingCard}>
          <Text style={styles.bookingTitle}>{booking.title}</Text>
          <Text style={styles.bookingDates}>
            Return: {new Date(booking.end_date).toLocaleDateString()}
          </Text>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <View style={styles.instructionHeader}>
            <Ionicons name="return-down-back" size={24} color={mobileTokens.colors.primary.main} />
            <Text style={styles.instructionTitle}>Return Verification Instructions</Text>
          </View>
          <Text style={styles.instructionText}>
            1. Take 2-10 clear photos showing the item's current condition{'\n'}
            2. Compare with pickup photos to identify any changes{'\n'}
            3. Document any damage or wear that occurred during rental{'\n'}
            4. Report any issues using the damage report button{'\n'}
            5. Both parties must complete verification to confirm return
          </Text>
        </View>

        {/* Pickup Photos Comparison */}
        {booking.pickup_images && booking.pickup_images.length > 0 && (
          <View style={styles.comparisonSection}>
            <Text style={styles.sectionTitle}>Pickup Photos (For Comparison)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.referencePhotos}>
              {booking.pickup_images.map((photo, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedPickupPhoto(photo)}
                >
                  <Image
                    source={{ uri: photo.uri || photo.url }}
                    style={styles.referencePhoto}
                    resizeMode="cover"
                  />
                  <Text style={styles.photoLabel}>
                    {photo.user_type} - {new Date(photo.timestamp).toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Return Photo Grid */}
        <View style={styles.photoSection}>
          <View style={styles.photoHeader}>
            <Text style={styles.sectionTitle}>Return Photos ({photos.length}/10)</Text>
            <TouchableOpacity 
              style={styles.addPhotoButton}
              onPress={takePhoto}
              disabled={photos.length >= 10}
            >
              <Ionicons name="camera-outline" size={20} color="white" />
              <Text style={styles.addPhotoText}>Take Photo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.photoGrid}>
            {photos.map((photo, index) => {
              // Determine photo ownership - for backward compatibility, assume renter if no owner specified
              const photoOwner = photo.uploaded_by || photo.user_id || booking?.renter_id;
              const canDelete = photoOwner === user?.id;
              const ownerLabel = photoOwner === booking?.owner_id ? 'Owner' : 'Renter';
              
              return (
                <View key={index} style={styles.photoContainer}>
                  <Image source={{ uri: photo.uri || photo.url }} style={styles.photoThumbnail} />
                  
                  {/* Delete button - only show for photos owned by current user */}
                  {canDelete && (
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={() => removePhoto(index)}
                    >
                      <Ionicons name="close-circle" size={24} color={mobileTokens.colors.error} />
                    </TouchableOpacity>
                  )}
                  
                  {/* Ownership indicator */}
                  <View style={[
                    styles.ownerBadge, 
                    { backgroundColor: photoOwner === booking?.renter_id ? mobileTokens.colors.info : mobileTokens.colors.neutral.mediumGray }
                  ]}>
                    <Text style={styles.ownerBadgeText}>{ownerLabel}</Text>
                  </View>
                  
                  <View style={styles.photoInfo}>
                    <Text style={styles.photoTimestamp}>
                      {photo.timestamp && !isNaN(new Date(photo.timestamp).getTime()) 
                        ? new Date(photo.timestamp).toLocaleTimeString()
                        : 'Invalid Date'}
                    </Text>
                    {photo.location && (
                      <Ionicons name="location" size={12} color={mobileTokens.colors.primary.main} />
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          {photos.length === 0 && (
            <View style={styles.emptyPhotoState}>
              <Ionicons name="camera-outline" size={64} color={mobileTokens.colors.gray[400]} />
              <Text style={styles.emptyPhotoText}>No return photos taken yet</Text>
              <Text style={styles.emptyPhotoSubtext}>Take at least 2 verification photos</Text>
            </View>
          )}
        </View>

        {/* Damage/Issues Section */}
        <View style={styles.damageSection}>
          <View style={styles.damageSectionHeader}>
            <Ionicons name="warning" size={24} color={mobileTokens.colors.warning} />
            <Text style={styles.sectionTitle}>Damage & Issues Report</Text>
          </View>
          
          {/* Show existing damage reports */}
          {(booking?.damage_report || booking?.owner_notes) ? (
            <View style={styles.existingReportsContainer}>
              {/* Warning about damage resolution */}
              <View style={styles.damageWarningCard}>
                <Ionicons name="alert-circle" size={20} color={mobileTokens.colors.warning} />
                <Text style={styles.damageWarningText}>
                  Damage reports require resolution before payment can be processed
                </Text>
              </View>
              
              {/* Renter's damage report */}
              {booking?.damage_report && (
                <View style={styles.existingReportCard}>
                  <View style={styles.reportHeader}>
                    <Ionicons name="person" size={16} color={mobileTokens.colors.primary.main} />
                    <Text style={styles.reportAuthor}>Renter's Report</Text>
                    {booking.damage_reported_at && (
                      <Text style={styles.reportDate}>
                        {new Date(booking.damage_reported_at).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.reportText}>{booking.damage_report}</Text>
                </View>
              )}
              
              {/* Owner's notes/damage report */}
              {booking?.owner_notes && (
                <View style={styles.existingReportCard}>
                  <View style={styles.reportHeader}>
                    <Ionicons name="business" size={16} color={mobileTokens.colors.primary.main} />
                    <Text style={styles.reportAuthor}>Owner's Notes</Text>
                  </View>
                  <Text style={styles.reportText}>{booking.owner_notes}</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.noDamageContainer}>
              <Ionicons name="checkmark-circle" size={32} color={mobileTokens.colors.success} />
              <Text style={styles.noDamageText}>No damage or issues reported yet</Text>
              <Text style={styles.noDamageSubtext}>
                If you notice any damage or issues, please report them below
              </Text>
            </View>
          )}
          
          {/* Report damage button */}
          <TouchableOpacity 
            style={styles.reportDamageButton}
            onPress={reportDamage}
          >
            <Ionicons name="warning" size={20} color="white" />
            <Text style={styles.reportDamageButtonText}>
              {(booking?.damage_report || booking?.owner_notes) ? 'Add Additional Report' : 'Report Damage/Issues'}
            </Text>
          </TouchableOpacity>
          
          {/* Current user's draft report */}
          {damageReport && (
            <View style={styles.draftReportContainer}>
              <View style={styles.draftReportHeader}>
                <Ionicons name="document-text" size={16} color={mobileTokens.colors.warning} />
                <Text style={styles.draftReportTitle}>Your Draft Report</Text>
              </View>
              <Text style={styles.draftReportText}>{damageReport}</Text>
              <Text style={styles.draftReportNote}>
                This report will be submitted when you confirm the return
              </Text>
            </View>
          )}
        </View>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              photos.length < 2 && styles.submitButtonDisabled,
              uploading && styles.submitButtonDisabled,
            ]}
            onPress={submitVerification}
            disabled={photos.length < 2 || uploading}
          >
            {uploading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="checkmark-done" size={20} color="white" />
                <Text style={styles.submitButtonText}>
                  Confirm Return ({photos.length}/10 photos)
                </Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.submitNote}>
            This will confirm that the item has been returned and inspected.
            {photos.length < 2 && ' You need at least 2 photos to continue.'}
          </Text>
        </View>
      </ScrollView>

      {/* Damage Report / Owner Notes Modal */}
      <Modal
        visible={showDamageModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          {(() => {
            const isRenter = booking && user && booking.renter_id === user.id;
            const isOwner = booking && user && booking.owner_id === user.id;
            
            return (
              <>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowDamageModal(false)}>
                    <Text style={styles.modalCancelButton}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>
                    Report Damage/Issues
                  </Text>
                  <TouchableOpacity onPress={submitDamageReport}>
                    <Text style={styles.modalSubmitButton}>Submit</Text>
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.modalContent}>
                  {/* Show existing damage report if any */}
                  {booking?.damage_report && (
                    <View style={styles.existingReportContainer}>
                      <Text style={styles.existingReportTitle}>Damage Report by Renter:</Text>
                      <Text style={styles.existingReportText}>{booking.damage_report}</Text>
                      {booking.damage_reported_at && (
                        <Text style={styles.existingReportDate}>
                          Reported: {new Date(booking.damage_reported_at).toLocaleString()}
                        </Text>
                      )}
                    </View>
                  )}
                  
                  {/* Show existing owner notes if any */}
                  {booking?.owner_notes && (
                    <View style={styles.existingNotesContainer}>
                      <Text style={styles.existingNotesTitle}>Owner Notes:</Text>
                      <Text style={styles.existingNotesText}>{booking.owner_notes}</Text>
                    </View>
                  )}
                  
                  <Text style={styles.modalDescription}>
                    {isRenter 
                      ? 'Please describe any damage or issues you\'ve found with the returned item. Be as specific as possible.'
                      : 'Add your notes about the item condition, damage assessment, or any other observations.'
                    }
                  </Text>
                  
                  <TextInput
                    style={styles.damageInput}
                    multiline
                    numberOfLines={8}
                    placeholder="Describe any damage, issues, or concerns about the item condition..."
                    value={damageReport}
                    onChangeText={setDamageReport}
                    textAlignVertical="top"
                  />
                  
                  <Text style={styles.modalNote}>
                    This report will be reviewed by both parties before completing the return process and releasing payment.
                  </Text>
                </ScrollView>
              </>
            );
          })()}
        </View>
      </Modal>

      {/* Pickup Photo Viewer Modal */}
      {selectedPickupPhoto && (
        <Modal
          visible={!!selectedPickupPhoto}
          animationType="fade"
          transparent
        >
          <View style={styles.photoViewerContainer}>
            <TouchableOpacity 
              style={styles.photoViewerBackground}
              onPress={() => setSelectedPickupPhoto(null)}
            >
              <View style={styles.photoViewerContent}>
                <Image
                  source={{ uri: selectedPickupPhoto.uri || selectedPickupPhoto.url }}
                  style={styles.fullSizePhoto}
                  resizeMode="contain"
                />
                <View style={styles.photoViewerInfo}>
                  <Text style={styles.photoViewerTitle}>
                    Pickup Photo - {selectedPickupPhoto.user_type}
                  </Text>
                  <Text style={styles.photoViewerDate}>
                    {new Date(selectedPickupPhoto.timestamp).toLocaleString()}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: mobileTokens.colors.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: mobileTokens.colors.background.secondary,
  },
  loadingText: {
    marginTop: mobileTokens.spacing.md,
    fontSize: mobileTokens.typography.sizes.base,
    color: mobileTokens.colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: mobileTokens.colors.background.secondary,
    padding: mobileTokens.spacing.lg,
  },
  errorText: {
    fontSize: mobileTokens.typography.sizes.lg,
    fontWeight: mobileTokens.typography.weights.semibold,
    color: mobileTokens.colors.text.primary,
    marginTop: mobileTokens.spacing.md,
    marginBottom: mobileTokens.spacing.lg,
  },
  backButton: {
    backgroundColor: mobileTokens.colors.primary.main,
    paddingHorizontal: mobileTokens.spacing.lg,
    paddingVertical: mobileTokens.spacing.sm,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: mobileTokens.typography.sizes.base,
    fontWeight: mobileTokens.typography.weights.semibold,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: mobileTokens.spacing.md,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: mobileTokens.colors.gray[200],
  },
  backIcon: {
    marginRight: mobileTokens.spacing.md,
  },
  title: {
    fontSize: mobileTokens.typography.sizes.lg,
    fontWeight: mobileTokens.typography.weights.semibold,
    color: mobileTokens.colors.text.primary,
  },
  bookingCard: {
    backgroundColor: 'white',
    margin: mobileTokens.spacing.md,
    padding: mobileTokens.spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: mobileTokens.colors.gray[200],
  },
  bookingTitle: {
    fontSize: mobileTokens.typography.sizes.lg,
    fontWeight: mobileTokens.typography.weights.semibold,
    color: mobileTokens.colors.text.primary,
    marginBottom: mobileTokens.spacing.xs,
  },
  bookingDates: {
    fontSize: mobileTokens.typography.sizes.sm,
    color: mobileTokens.colors.text.secondary,
  },
  instructionsCard: {
    backgroundColor: 'white',
    marginHorizontal: mobileTokens.spacing.md,
    marginBottom: mobileTokens.spacing.md,
    padding: mobileTokens.spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: mobileTokens.colors.primary.main,
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: mobileTokens.spacing.sm,
  },
  instructionTitle: {
    fontSize: mobileTokens.typography.sizes.base,
    fontWeight: mobileTokens.typography.weights.semibold,
    color: mobileTokens.colors.primary.main,
    marginLeft: mobileTokens.spacing.sm,
  },
  instructionText: {
    fontSize: mobileTokens.typography.sizes.sm,
    color: mobileTokens.colors.text.secondary,
    lineHeight: 20,
  },
  comparisonSection: {
    backgroundColor: 'white',
    marginHorizontal: mobileTokens.spacing.md,
    marginBottom: mobileTokens.spacing.md,
    padding: mobileTokens.spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: mobileTokens.colors.gray[200],
  },
  sectionTitle: {
    fontSize: mobileTokens.typography.sizes.base,
    fontWeight: mobileTokens.typography.weights.semibold,
    color: mobileTokens.colors.text.primary,
    marginBottom: mobileTokens.spacing.sm,
  },
  referencePhotos: {
    marginTop: mobileTokens.spacing.sm,
  },
  referencePhoto: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: mobileTokens.spacing.sm,
  },
  photoLabel: {
    fontSize: mobileTokens.typography.sizes.xs,
    color: mobileTokens.colors.text.tertiary,
    textAlign: 'center',
    marginTop: mobileTokens.spacing.xs,
    marginRight: mobileTokens.spacing.sm,
  },
  photoSection: {
    backgroundColor: 'white',
    marginHorizontal: mobileTokens.spacing.md,
    marginBottom: mobileTokens.spacing.md,
    padding: mobileTokens.spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: mobileTokens.colors.gray[200],
  },
  photoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: mobileTokens.spacing.md,
  },
  photoActions: {
    flexDirection: 'row',
    gap: mobileTokens.spacing.sm,
  },
  damageButton: {
    backgroundColor: mobileTokens.colors.warning,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: mobileTokens.spacing.sm,
    paddingVertical: mobileTokens.spacing.xs,
    borderRadius: 8,
  },
  damageButtonText: {
    color: 'white',
    fontSize: mobileTokens.typography.sizes.sm,
    fontWeight: mobileTokens.typography.weights.semibold,
    marginLeft: mobileTokens.spacing.xs,
  },
  addPhotoButton: {
    backgroundColor: mobileTokens.colors.primary.main,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: mobileTokens.spacing.sm,
    paddingVertical: mobileTokens.spacing.xs,
    borderRadius: 8,
  },
  addPhotoText: {
    color: 'white',
    fontSize: mobileTokens.typography.sizes.sm,
    fontWeight: mobileTokens.typography.weights.semibold,
    marginLeft: mobileTokens.spacing.xs,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photoContainer: {
    width: (screenWidth - 64) / 2 - 8,
    marginBottom: mobileTokens.spacing.md,
    position: 'relative',
  },
  photoThumbnail: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  ownerBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    paddingHorizontal: mobileTokens.spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ownerBadgeText: {
    color: 'white',
    fontSize: mobileTokens.typography.sizes.xs,
    fontWeight: mobileTokens.typography.weights.semibold,
  },
  photoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: mobileTokens.spacing.xs,
  },
  photoTimestamp: {
    fontSize: mobileTokens.typography.sizes.xs,
    color: mobileTokens.colors.text.tertiary,
  },
  emptyPhotoState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: mobileTokens.spacing['3xl'],
  },
  emptyPhotoText: {
    fontSize: mobileTokens.typography.sizes.base,
    color: mobileTokens.colors.text.secondary,
    marginTop: mobileTokens.spacing.md,
  },
  emptyPhotoSubtext: {
    fontSize: mobileTokens.typography.sizes.sm,
    color: mobileTokens.colors.text.tertiary,
    marginTop: mobileTokens.spacing.xs,
  },
  damageReportSection: {
    backgroundColor: '#FFF3CD',
    marginHorizontal: mobileTokens.spacing.md,
    marginBottom: mobileTokens.spacing.md,
    padding: mobileTokens.spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: mobileTokens.colors.warning,
  },
  damageReportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: mobileTokens.spacing.sm,
  },
  damageReportTitle: {
    fontSize: mobileTokens.typography.sizes.base,
    fontWeight: mobileTokens.typography.weights.semibold,
    color: mobileTokens.colors.warning,
    marginLeft: mobileTokens.spacing.sm,
  },
  damageReportText: {
    fontSize: mobileTokens.typography.sizes.sm,
    color: mobileTokens.colors.text.primary,
    lineHeight: 18,
  },
  submitSection: {
    padding: mobileTokens.spacing.md,
  },
  submitButton: {
    backgroundColor: mobileTokens.colors.primary.main,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: mobileTokens.spacing.md,
    borderRadius: 12,
    marginBottom: mobileTokens.spacing.sm,
  },
  submitButtonDisabled: {
    backgroundColor: mobileTokens.colors.gray[300],
  },
  submitButtonText: {
    color: 'white',
    fontSize: mobileTokens.typography.sizes.base,
    fontWeight: mobileTokens.typography.weights.semibold,
    marginLeft: mobileTokens.spacing.sm,
  },
  submitNote: {
    fontSize: mobileTokens.typography.sizes.sm,
    color: mobileTokens.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: mobileTokens.spacing.md,
    paddingVertical: mobileTokens.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: mobileTokens.colors.gray[200],
  },
  modalCancelButton: {
    fontSize: mobileTokens.typography.sizes.base,
    color: mobileTokens.colors.text.secondary,
  },
  modalTitle: {
    fontSize: mobileTokens.typography.sizes.lg,
    fontWeight: mobileTokens.typography.weights.semibold,
    color: mobileTokens.colors.text.primary,
  },
  modalSubmitButton: {
    fontSize: mobileTokens.typography.sizes.base,
    color: mobileTokens.colors.primary.main,
    fontWeight: mobileTokens.typography.weights.semibold,
  },
  modalContent: {
    flex: 1,
    padding: mobileTokens.spacing.md,
  },
  modalDescription: {
    fontSize: mobileTokens.typography.sizes.base,
    color: mobileTokens.colors.text.secondary,
    marginBottom: mobileTokens.spacing.lg,
    lineHeight: 22,
  },
  damageInput: {
    borderWidth: 1,
    borderColor: mobileTokens.colors.gray[300],
    borderRadius: 8,
    padding: mobileTokens.spacing.sm,
    fontSize: mobileTokens.typography.sizes.base,
    color: mobileTokens.colors.text.primary,
    minHeight: 120,
    marginBottom: mobileTokens.spacing.md,
  },
  modalNote: {
    fontSize: mobileTokens.typography.sizes.sm,
    color: mobileTokens.colors.text.tertiary,
    fontStyle: 'italic',
  },
  existingReportContainer: {
    backgroundColor: mobileTokens.colors.warning + '20', // 20% opacity
    borderLeftWidth: 4,
    borderLeftColor: mobileTokens.colors.warning,
    padding: mobileTokens.spacing.sm,
    marginBottom: mobileTokens.spacing.md,
    borderRadius: 8,
  },
  existingReportTitle: {
    fontSize: mobileTokens.typography.sizes.sm,
    fontWeight: mobileTokens.typography.weights.semibold,
    color: mobileTokens.colors.warning,
    marginBottom: mobileTokens.spacing.xs,
  },
  existingReportText: {
    fontSize: mobileTokens.typography.sizes.base,
    color: mobileTokens.colors.text.primary,
    marginBottom: mobileTokens.spacing.xs,
    lineHeight: 20,
  },
  existingReportDate: {
    fontSize: mobileTokens.typography.sizes.xs,
    color: mobileTokens.colors.text.tertiary,
  },
  existingNotesContainer: {
    backgroundColor: mobileTokens.colors.info + '20', // 20% opacity
    borderLeftWidth: 4,
    borderLeftColor: mobileTokens.colors.info,
    padding: mobileTokens.spacing.sm,
    marginBottom: mobileTokens.spacing.md,
    borderRadius: 8,
  },
  existingNotesTitle: {
    fontSize: mobileTokens.typography.sizes.sm,
    fontWeight: mobileTokens.typography.weights.semibold,
    color: mobileTokens.colors.info,
    marginBottom: mobileTokens.spacing.xs,
  },
  existingNotesText: {
    fontSize: mobileTokens.typography.sizes.base,
    color: mobileTokens.colors.text.primary,
    lineHeight: 20,
  },
  // Photo viewer modal styles
  photoViewerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoViewerBackground: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoViewerContent: {
    width: '90%',
    height: '80%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullSizePhoto: {
    width: '100%',
    height: '90%',
  },
  photoViewerInfo: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: mobileTokens.spacing.md,
    paddingVertical: mobileTokens.spacing.sm,
    borderRadius: 8,
    marginTop: mobileTokens.spacing.md,
    alignItems: 'center',
  },
  photoViewerTitle: {
    color: 'white',
    fontSize: mobileTokens.typography.sizes.base,
    fontWeight: mobileTokens.typography.weights.semibold,
    textAlign: 'center',
  },
  photoViewerDate: {
    color: 'white',
    fontSize: mobileTokens.typography.sizes.sm,
    marginTop: mobileTokens.spacing.xs,
    textAlign: 'center',
  },
  // New damage section styles
  damageSection: {
    backgroundColor: 'white',
    marginHorizontal: mobileTokens.spacing.md,
    marginBottom: mobileTokens.spacing.md,
    padding: mobileTokens.spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: mobileTokens.colors.gray[200],
  },
  damageSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: mobileTokens.spacing.md,
  },
  existingReportsContainer: {
    marginBottom: mobileTokens.spacing.md,
  },
  damageWarningCard: {
    backgroundColor: mobileTokens.colors.warning + '20', // 20% opacity
    padding: mobileTokens.spacing.sm,
    borderRadius: 8,
    marginBottom: mobileTokens.spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: mobileTokens.colors.warning,
    flexDirection: 'row',
    alignItems: 'center',
  },
  damageWarningText: {
    fontSize: mobileTokens.typography.sizes.sm,
    color: mobileTokens.colors.warning,
    fontWeight: mobileTokens.typography.weights.medium,
    marginLeft: mobileTokens.spacing.xs,
    flex: 1,
  },
  existingReportCard: {
    backgroundColor: mobileTokens.colors.gray[50],
    padding: mobileTokens.spacing.md,
    borderRadius: 8,
    marginBottom: mobileTokens.spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: mobileTokens.colors.warning,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: mobileTokens.spacing.sm,
  },
  reportAuthor: {
    fontSize: mobileTokens.typography.sizes.sm,
    fontWeight: mobileTokens.typography.weights.semibold,
    color: mobileTokens.colors.text.primary,
    marginLeft: mobileTokens.spacing.xs,
    flex: 1,
  },
  reportDate: {
    fontSize: mobileTokens.typography.sizes.xs,
    color: mobileTokens.colors.text.tertiary,
  },
  reportText: {
    fontSize: mobileTokens.typography.sizes.base,
    color: mobileTokens.colors.text.primary,
    lineHeight: 20,
  },
  noDamageContainer: {
    alignItems: 'center',
    paddingVertical: mobileTokens.spacing.lg,
    marginBottom: mobileTokens.spacing.md,
  },
  noDamageText: {
    fontSize: mobileTokens.typography.sizes.base,
    fontWeight: mobileTokens.typography.weights.semibold,
    color: mobileTokens.colors.success,
    marginTop: mobileTokens.spacing.sm,
    textAlign: 'center',
  },
  noDamageSubtext: {
    fontSize: mobileTokens.typography.sizes.sm,
    color: mobileTokens.colors.text.secondary,
    marginTop: mobileTokens.spacing.xs,
    textAlign: 'center',
  },
  reportDamageButton: {
    backgroundColor: mobileTokens.colors.warning,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: mobileTokens.spacing.md,
    paddingHorizontal: mobileTokens.spacing.lg,
    borderRadius: 8,
    marginBottom: mobileTokens.spacing.md,
  },
  reportDamageButtonText: {
    color: 'white',
    fontSize: mobileTokens.typography.sizes.base,
    fontWeight: mobileTokens.typography.weights.semibold,
    marginLeft: mobileTokens.spacing.sm,
  },
  draftReportContainer: {
    backgroundColor: '#FFF3CD',
    padding: mobileTokens.spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: mobileTokens.colors.warning,
  },
  draftReportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: mobileTokens.spacing.sm,
  },
  draftReportTitle: {
    fontSize: mobileTokens.typography.sizes.sm,
    fontWeight: mobileTokens.typography.weights.semibold,
    color: mobileTokens.colors.warning,
    marginLeft: mobileTokens.spacing.xs,
  },
  draftReportText: {
    fontSize: mobileTokens.typography.sizes.base,
    color: mobileTokens.colors.text.primary,
    lineHeight: 20,
    marginBottom: mobileTokens.spacing.sm,
  },
  draftReportNote: {
    fontSize: mobileTokens.typography.sizes.xs,
    color: mobileTokens.colors.text.secondary,
    fontStyle: 'italic',
  },
});
