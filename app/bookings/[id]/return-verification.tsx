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
import { useQueryClient } from '@tanstack/react-query';
import { mobileTokens } from '../../../src/lib/design-system';
import { useAuth } from '../../../src/components/AuthProvider';
import { supabase } from '../../../src/lib/supabase';

const { width: screenWidth } = Dimensions.get('window');

interface ReturnPhoto {
  uri: string;
  timestamp: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  description?: string;
}

interface PickupPhoto {
  uri: string;
  timestamp: string;
  user_type: 'owner' | 'renter';
  photo_index: number;
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
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [photos, setPhotos] = useState<ReturnPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [showDamageModal, setShowDamageModal] = useState(false);
  const [damageReport, setDamageReport] = useState('');
  const [selectedPickupPhoto, setSelectedPickupPhoto] = useState<PickupPhoto | null>(null);

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
        
        // Load existing return photos if any
        if (data.return_images && Array.isArray(data.return_images)) {
          setPhotos(data.return_images);
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
        const newPhoto: ReturnPhoto = {
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

      if (!isRenter && !isOwner) {
        Alert.alert('Error', 'You are not authorized to verify this booking.');
        return;
      }


      // Process photos with metadata
      const processedPhotos = photos.map((photo, index) => ({
        ...photo,
        user_id: user.id,
        user_type: isRenter ? 'renter' : 'owner',
        photo_index: index,
        uploaded_at: new Date().toISOString(),
      }));

      // Get current return images
      const currentReturnImages = booking.return_images || [];
      
      // Add new photos to existing ones
      const updatedReturnImages = [
        ...currentReturnImages,
        ...processedPhotos,
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

      // Add damage report if provided
      if (damageReport.trim()) {
        updateData.damage_report = damageReport.trim();
        updateData.damage_reported_by = user.id;
        updateData.damage_reported_at = new Date().toISOString();
      }

      // Check if both parties have now confirmed return
      // Note: We need to check the current state from database first
      const { data: currentBooking } = await supabase
        .from('bookings')
        .select('return_confirmed_by_renter, return_confirmed_by_owner')
        .eq('id', bookingId)
        .single();

      const renterConfirmed = isRenter ? true : (currentBooking?.return_confirmed_by_renter || false);
      const ownerConfirmed = isOwner ? true : (currentBooking?.return_confirmed_by_owner || false);
      
      // If both parties have confirmed, update status to 'completed'
      const bothConfirmed = renterConfirmed && ownerConfirmed;
      if (bothConfirmed) {
        updateData.status = 'completed';
        updateData.completed_at = new Date().toISOString();
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
      
      Alert.alert(
        'Return Confirmed!',
        'Your return has been confirmed successfully.',
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
                    source={{ uri: photo.uri }}
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
            <View style={styles.photoActions}>
              <TouchableOpacity 
                style={styles.damageButton}
                onPress={reportDamage}
              >
                <Ionicons name="warning" size={16} color={mobileTokens.colors.warning} />
                <Text style={styles.damageButtonText}>Report Damage</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.addPhotoButton}
                onPress={takePhoto}
                disabled={photos.length >= 10}
              >
                <Ionicons name="camera-outline" size={20} color="white" />
                <Text style={styles.addPhotoText}>Take Photo</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.photoGrid}>
            {photos.map((photo, index) => (
              <View key={index} style={styles.photoContainer}>
                <Image source={{ uri: photo.uri }} style={styles.photoThumbnail} />
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={() => removePhoto(index)}
                >
                  <Ionicons name="close-circle" size={24} color={mobileTokens.colors.error} />
                </TouchableOpacity>
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
              <Text style={styles.emptyPhotoText}>No return photos taken yet</Text>
              <Text style={styles.emptyPhotoSubtext}>Take at least 2 verification photos</Text>
            </View>
          )}
        </View>

        {/* Damage Report Section */}
        {damageReport && (
          <View style={styles.damageReportSection}>
            <View style={styles.damageReportHeader}>
              <Ionicons name="warning" size={24} color={mobileTokens.colors.warning} />
              <Text style={styles.damageReportTitle}>Damage Report</Text>
            </View>
            <Text style={styles.damageReportText}>{damageReport}</Text>
          </View>
        )}

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

      {/* Damage Report Modal */}
      <Modal
        visible={showDamageModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowDamageModal(false)}>
              <Text style={styles.modalCancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Report Damage</Text>
            <TouchableOpacity onPress={submitDamageReport}>
              <Text style={styles.modalSubmitButton}>Submit</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalDescription}>
              Please describe any damage or issues you've found with the returned item. Be as specific as possible.
            </Text>
            
            <TextInput
              style={styles.damageInput}
              multiline
              numberOfLines={8}
              placeholder="Describe the damage or issue in detail..."
              value={damageReport}
              onChangeText={setDamageReport}
              textAlignVertical="top"
            />
            
            <Text style={styles.modalNote}>
              This report will be reviewed by our team and may affect the security deposit.
            </Text>
          </ScrollView>
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
                  source={{ uri: selectedPickupPhoto.uri }}
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
});
