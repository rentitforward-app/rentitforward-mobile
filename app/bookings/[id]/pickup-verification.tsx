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
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useQueryClient } from '@tanstack/react-query';
import { mobileTokens } from '../../../src/lib/design-system';
import { useAuth } from '../../../src/components/AuthProvider';
import { supabase } from '../../../src/lib/supabase';

const { width: screenWidth } = Dimensions.get('window');

interface PickupPhoto {
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

interface BookingDetails {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  pickup_images?: PickupPhoto[];
  listing_images?: string[];
  owner_id: string;
  renter_id: string;
  status: string;
  listings?: {
    title: string;
    images: string[];
  };
}

export default function PickupVerificationScreen() {
  const router = useRouter();
  const { id: bookingId } = useLocalSearchParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [photos, setPhotos] = useState<PickupPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    loadBookingDetails();
    getCurrentLocation();
  }, [bookingId]);

  const loadBookingDetails = async () => {
    try {
      if (!bookingId || typeof bookingId !== 'string') {
        throw new Error('No booking ID provided');
      }
      
      // Fetch booking details from Supabase directly
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

      if (error) {
        console.error('Error loading booking:', error);
        Alert.alert('Error', 'Failed to load booking details');
        return;
      }

      if (data) {
        // Transform data to match expected structure
        const transformedBooking = {
          ...data,
          title: data.listings?.title || 'Unknown Item',
          listing_images: data.listings?.images || [],
        };
        
        setBooking(transformedBooking);
        
        // Load existing pickup photos if any
        if (data.pickup_images && Array.isArray(data.pickup_images)) {
          setPhotos(data.pickup_images);
        }
      }
    } catch (error) {
      console.error('Error loading booking:', error);
      Alert.alert('Error', 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

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
        const newPhoto: PickupPhoto = {
          uri: asset.uri,
          timestamp: new Date().toISOString(),
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

  const submitVerification = async () => {
    if (photos.length < 3) {
      Alert.alert('More Photos Required', 'Please take at least 3 verification photos to continue.');
      return;
    }

    if (photos.length > 8) {
      Alert.alert('Too Many Photos', 'Please limit to 8 photos maximum.');
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

      if (!isRenter && !isOwner) {
        Alert.alert('Error', 'You are not authorized to verify this booking.');
        return;
      }


      // Upload photos to Supabase Storage and get URLs
      const uploadedPhotos = [];
      
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        try {
          // Convert image to blob for upload
          const response = await fetch(photo.uri!);
          const blob = await response.blob();
          
          // Generate unique filename
          const fileExt = photo.uri?.split('.').pop() || 'jpg';
          const fileName = `pickup_${bookingId}_${user.id}_${Date.now()}_${i}.${fileExt}`;
          
          // Upload to Supabase Storage
          const { data, error } = await supabase.storage
            .from('booking-confirmations')
            .upload(fileName, blob);
          
          if (error) throw error;
          
          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('booking-confirmations')
            .getPublicUrl(fileName);
          
          // Create photo object with cloud URL
          uploadedPhotos.push({
            url: publicUrl,
            user_id: user.id,
            user_type: isRenter ? 'renter' : 'owner',
            photo_index: i,
            uploaded_at: new Date().toISOString(),
            metadata: {
              timestamp: photo.timestamp || new Date().toISOString(),
              location: photo.location,
            },
          });
        } catch (uploadError) {
          console.error('Error uploading photo:', uploadError);
          Alert.alert('Upload Failed', `Failed to upload photo ${i + 1}. Please try again.`);
          return;
        }
      }

      // Get current pickup images
      const currentPickupImages = booking.pickup_images || [];
      
      // Add new photos to existing ones
      const updatedPickupImages = [
        ...currentPickupImages,
        ...uploadedPhotos,
      ];

      // Update booking with pickup verification data
      const updateData: any = {
        pickup_images: updatedPickupImages,
        updated_at: new Date().toISOString(),
      };

      if (isRenter) {
        updateData.pickup_confirmed_by_renter = true;
        updateData.pickup_confirmed_at = new Date().toISOString();
      } else if (isOwner) {
        updateData.pickup_confirmed_by_owner = true;
        updateData.pickup_confirmed_at = new Date().toISOString();
      }

      // Check if both parties have now confirmed pickup
      // Note: We need to check the current state from database first
      const { data: currentBooking } = await supabase
        .from('bookings')
        .select('pickup_confirmed_by_renter, pickup_confirmed_by_owner')
        .eq('id', bookingId)
        .single();

      const renterConfirmed = isRenter ? true : (currentBooking?.pickup_confirmed_by_renter || false);
      const ownerConfirmed = isOwner ? true : (currentBooking?.pickup_confirmed_by_owner || false);
      
      // If both parties have confirmed, update status to 'in_progress'
      const bothConfirmed = renterConfirmed && ownerConfirmed;
      if (bothConfirmed) {
        updateData.status = 'in_progress';
      }

      const { error: updateError } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId);

      if (updateError) {
        console.error('Error updating booking with pickup verification:', updateError);
        Alert.alert('Error', 'Failed to save pickup verification. Please try again.');
        return;
      }

      // Handle notifications based on completion status
      const otherPartyConfirmed = (isRenter && ownerConfirmed) || (isOwner && renterConfirmed);
      
      if (bothConfirmed) {
        // Both parties confirmed - send pickup confirmation emails to both
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
            // Send pickup confirmation email to renter
            await emailService.sendEmail({
              to: fullBooking.renter_profile.email,
              subject: '🚀 Pickup Confirmed - Rental Started!',
              html: `
                <h2>Your rental has started!</h2>
                <p>Hi ${fullBooking.renter_profile.full_name},</p>
                <p>Great news! The pickup for "${fullBooking.listings.title}" has been confirmed by both parties.</p>
                <p><strong>Rental Details:</strong></p>
                <ul>
                  <li>Item: ${fullBooking.listings.title}</li>
                  <li>Rental Period: ${new Date(fullBooking.start_date).toLocaleDateString()} - ${new Date(fullBooking.end_date).toLocaleDateString()}</li>
                  <li>Status: Active</li>
                </ul>
                <p>Enjoy your rental! Remember to return the item by ${new Date(fullBooking.end_date).toLocaleDateString()}.</p>
                <p>Thank you for using Rent It Forward!</p>
              `,
              text: `Your rental of "${fullBooking.listings.title}" has started! The pickup has been confirmed by both parties. Please return by ${new Date(fullBooking.end_date).toLocaleDateString()}.`
            });

            // Send pickup confirmation email to owner
            await emailService.sendEmail({
              to: fullBooking.owner_profile.email,
              subject: '✅ Item Pickup Confirmed',
              html: `
                <h2>Your item has been picked up!</h2>
                <p>Hi ${fullBooking.owner_profile.full_name},</p>
                <p>Your item "${fullBooking.listings.title}" has been successfully picked up by ${fullBooking.renter_profile.full_name}.</p>
                <p><strong>Rental Details:</strong></p>
                <ul>
                  <li>Item: ${fullBooking.listings.title}</li>
                  <li>Renter: ${fullBooking.renter_profile.full_name}</li>
                  <li>Rental Period: ${new Date(fullBooking.start_date).toLocaleDateString()} - ${new Date(fullBooking.end_date).toLocaleDateString()}</li>
                  <li>Status: Active</li>
                </ul>
                <p>The rental is now active. You'll be notified when the item is returned.</p>
                <p>Thank you for using Rent It Forward!</p>
              `,
              text: `Your item "${fullBooking.listings.title}" has been picked up by ${fullBooking.renter_profile.full_name}. The rental is now active.`
            });
            
            console.log('✅ Pickup confirmation emails sent to both parties');
          }
        } catch (emailError) {
          console.log('❌ Email notifications failed but pickup verification saved:', emailError);
          // Don't fail the entire process if email fails
        }
      } else if (!otherPartyConfirmed) {
        // Only one party confirmed - notify the other party
        try {
          const { getNotificationApiService } = await import('../../../src/lib/notification-api');
          const notificationApi = getNotificationApiService();
          await notificationApi.notifyBookingAction({
            bookingId: bookingId as string,
            action: 'pickup',
            userId: user.id
          });
        } catch (notificationError) {
          console.log('Notification failed but pickup verification saved:', notificationError);
          // Don't fail the entire process if notification fails
        }
      }

      // Invalidate queries to refresh booking details
      queryClient.invalidateQueries({ queryKey: ['booking-details', bookingId] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      
      Alert.alert(
        'Pickup Confirmed!',
        'Your pickup has been confirmed successfully.',
        [
          {
            text: 'Continue',
            onPress: () => {
              router.back();
            },
          },
        ]
      );
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
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backIcon}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={mobileTokens.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Pickup Verification</Text>
      </View>

      {/* Booking Info */}
      <View style={styles.bookingCard}>
        <Text style={styles.bookingTitle}>{booking.title}</Text>
        <Text style={styles.bookingDates}>
          {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
        </Text>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsCard}>
        <View style={styles.instructionHeader}>
          <Ionicons name="camera" size={24} color={mobileTokens.colors.primary.main} />
          <Text style={styles.instructionTitle}>Verification Instructions</Text>
        </View>
        <Text style={styles.instructionText}>
          1. Take 3-8 clear photos of the item{'\n'}
          2. Include close-ups of any existing damage or wear{'\n'}
          3. Match the angles from the listing photos when possible{'\n'}
          4. Photos are automatically timestamped and location-tagged{'\n'}
          5. Both parties must complete verification to confirm pickup
        </Text>
      </View>

      {/* Original Listing Photos */}
      {booking.listing_images && booking.listing_images.length > 0 && (
        <View style={styles.referenceSection}>
          <Text style={styles.sectionTitle}>Reference Photos (From Listing)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.referencePhotos}>
            {booking.listing_images.map((imageUrl, index) => (
              <Image
                key={index}
                source={{ uri: imageUrl }}
                style={styles.referencePhoto}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Photo Grid */}
      <View style={styles.photoSection}>
        <View style={styles.photoHeader}>
          <Text style={styles.sectionTitle}>Verification Photos ({photos.length}/8)</Text>
          {/* Only allow renter to take photos */}
          {booking && user && booking.renter_id === user.id && (
            <TouchableOpacity 
              style={styles.addPhotoButton}
              onPress={takePhoto}
              disabled={photos.length >= 8}
            >
              <Ionicons name="camera-outline" size={20} color="white" />
              <Text style={styles.addPhotoText}>Take Photo</Text>
            </TouchableOpacity>
          )}
          {/* Show information for owner */}
          {booking && user && booking.owner_id === user.id && (
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>Photos taken by renter during pickup</Text>
            </View>
          )}
        </View>

        <View style={styles.photoGrid}>
          {photos.map((photo, index) => (
            <View key={index} style={styles.photoContainer}>
              <Image source={{ uri: photo.uri || photo.url }} style={styles.photoThumbnail} />
              {/* Only allow renter to delete photos */}
              {booking && user && booking.renter_id === user.id && (
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={() => removePhoto(index)}
                >
                  <Ionicons name="close-circle" size={24} color={mobileTokens.colors.error} />
                </TouchableOpacity>
              )}
              <View style={styles.photoInfo}>
                <Text style={styles.photoTimestamp}>
                  {new Date(photo.timestamp).toLocaleTimeString()}
                </Text>
                {photo.location && (
                  <Ionicons name="location" size={12} color={mobileTokens.colors.primary.main} />
                )}
              </View>
            </View>
          ))}
        </View>

        {photos.length === 0 && (
          <View style={styles.emptyPhotoState}>
            <Ionicons name="camera-outline" size={64} color={mobileTokens.colors.gray[400]} />
            <Text style={styles.emptyPhotoText}>No photos taken yet</Text>
            <Text style={styles.emptyPhotoSubtext}>Take at least 3 verification photos</Text>
          </View>
        )}
      </View>

      {/* Submit Button */}
      <View style={styles.submitSection}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            photos.length < 3 && styles.submitButtonDisabled,
            uploading && styles.submitButtonDisabled,
          ]}
          onPress={submitVerification}
          disabled={photos.length < 3 || uploading}
        >
          {uploading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <Text style={styles.submitButtonText}>
                Confirm Pickup ({photos.length}/8 photos)
              </Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.submitNote}>
          This will confirm that you have verified the item condition at pickup.
          {photos.length < 3 && ' You need at least 3 photos to continue.'}
        </Text>
      </View>
    </ScrollView>
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
  referenceSection: {
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
  infoContainer: {
    backgroundColor: mobileTokens.colors.gray[100],
    paddingHorizontal: mobileTokens.spacing.sm,
    paddingVertical: mobileTokens.spacing.xs,
    borderRadius: 8,
  },
  infoText: {
    fontSize: mobileTokens.typography.sizes.sm,
    color: mobileTokens.colors.text.secondary,
    fontStyle: 'italic',
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
});
