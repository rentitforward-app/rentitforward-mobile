import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  Modal
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../src/components/AuthProvider';
import { supabase } from '../../src/lib/supabase';
import { colors, spacing, typography, componentStyles } from '../../src/lib/design-system';

// Real geocoding utility function using the web API
const geocodeAddress = async (address: string, city: string, state: string): Promise<{ latitude: number; longitude: number } | null> => {
  try {
    console.log('📍 Geocoding address:', `${address}, ${city}, ${state}`);
    
    // Call the web API for geocoding - use environment-based URL
    const apiUrl = __DEV__ 
      ? 'http://localhost:3000/api/geocoding'  // Development
      : 'https://your-production-domain.com/api/geocoding';  // Production
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address,
        city,
        state,
        country: 'Australia',
      }),
    });

    if (!response.ok) {
      console.warn('🚫 Geocoding API error, falling back to city coordinates');
      return getFallbackCoordinates(city);
    }

    const data = await response.json();
    
    if (data.success && data.coordinates) {
      console.log('✅ Geocoding successful:', data.coordinates);
      return {
        latitude: data.coordinates.latitude,
        longitude: data.coordinates.longitude,
      };
    } else {
      console.warn('🚫 Geocoding failed, falling back to city coordinates:', data.error);
      return getFallbackCoordinates(city);
    }
  } catch (error) {
    console.error('🚨 Geocoding error:', error);
    return getFallbackCoordinates(city);
  }
};

// Fallback coordinates for major Australian cities
const getFallbackCoordinates = (city: string): { latitude: number; longitude: number } => {
  const cityCoordinates: Record<string, { latitude: number; longitude: number }> = {
    'sydney': { latitude: -33.8688, longitude: 151.2093 },
    'melbourne': { latitude: -37.8136, longitude: 144.9631 },
    'brisbane': { latitude: -27.4698, longitude: 153.0251 },
    'perth': { latitude: -31.9505, longitude: 115.8605 },
    'adelaide': { latitude: -34.9285, longitude: 138.6007 },
    'canberra': { latitude: -35.2809, longitude: 149.1300 },
    'hobart': { latitude: -42.8821, longitude: 147.3272 },
    'darwin': { latitude: -12.4634, longitude: 130.8456 },
  };
  
  const cityKey = city.toLowerCase();
  if (cityCoordinates[cityKey]) {
    console.log(`📍 Using fallback coordinates for ${city}:`, cityCoordinates[cityKey]);
    return cityCoordinates[cityKey];
  }
  
  // Default to Sydney coordinates
  console.log('📍 Using default Sydney coordinates');
  return { latitude: -33.8688, longitude: 151.2093 };
};

// Step definitions
const STEPS = [
  { id: 1, title: 'Basic Details', icon: 'information-circle' },
  { id: 2, title: 'Pricing & Availability', icon: 'pricetag' },
  { id: 3, title: 'Location & Delivery', icon: 'location' },
];

// Categories (matches your database)
const CATEGORIES = [
  { id: 'tools_diy_equipment', name: 'Tools & DIY Equipment', icon: '🔧' },
  { id: 'cameras_photography_gear', name: 'Cameras & Photography Gear', icon: '📷' },
  { id: 'event_party_equipment', name: 'Event & Party Equipment', icon: '🎉' },
  { id: 'camping_outdoor_gear', name: 'Camping & Outdoor Gear', icon: '🏕️' },
  { id: 'tech_electronics', name: 'Tech & Electronics', icon: '📱' },
  { id: 'vehicles_transport', name: 'Vehicles & Transport', icon: '🚗' },
  { id: 'home_garden_appliances', name: 'Home & Garden Appliances', icon: '🏡' },
  { id: 'sports_fitness_equipment', name: 'Sports & Fitness Equipment', icon: '🏃' },
  { id: 'musical_instruments_gear', name: 'Musical Instruments & Gear', icon: '🎸' },
  { id: 'costumes_props', name: 'Costumes & Props', icon: '🎭' },
  { id: 'maker_craft_supplies', name: 'Maker & Craft Supplies', icon: '✂️' },
  { id: 'clothing_shoes_accessories', name: 'Clothing, Shoes and Accessories', icon: '👕' },
];

const CONDITIONS = [
  { id: 'new', name: 'New', description: 'Brand new, unopened' },
  { id: 'like_new', name: 'Like New', description: 'Used once or twice' },
  { id: 'excellent', name: 'Excellent', description: 'Minor wear, great condition' },
  { id: 'good', name: 'Good', description: 'Normal wear, fully functional' },
  { id: 'fair', name: 'Fair', description: 'Well used, some wear visible' },
];

export default function CreateScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    condition: '',
    brand: '',
    model: '',
    price_per_day: '',
    price_weekly: '',
    deposit: '',
    insurance_enabled: false,
    images: [],
    address: '',
    city: '',
    state: '',
    postal_code: '',
  });

  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showConditionModal, setShowConditionModal] = useState(false);

  // Load categories from database
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const pickImage = async () => {
    // Show action sheet for camera or photo library
    Alert.alert(
      'Add Photo',
      'Choose how you want to add a photo',
      [
        {
          text: 'Camera',
          onPress: () => takePhoto(),
        },
        {
          text: 'Photo Library',
          onPress: () => selectFromLibrary(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission required', 'Please allow access to your camera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, result.assets[0]]
      }));
    }
  };

  const selectFromLibrary = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission required', 'Please allow access to your photo library');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, result.assets[0]]
      }));
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const uploadImages = async (listingId) => {
    const uploadedUrls = [];
    
    for (let i = 0; i < formData.images.length; i++) {
      const image = formData.images[i];
      const fileExt = image.uri.split('.').pop();
      const fileName = `${listingId}/${Date.now()}_${i}.${fileExt}`;
      
      try {
        const formData = new FormData();
        formData.append('file', {
          uri: image.uri,
          type: `image/${fileExt}`,
          name: fileName,
        } as any);

        const { data, error } = await supabase.storage
          .from('listing-images')
          .upload(fileName, formData);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('listing-images')
          .getPublicUrl(fileName);

        // Insert into listing_photos table
        await supabase
          .from('listing_photos')
          .insert({
            listing_id: listingId,
            url: publicUrl,
            order_index: i
          });

        uploadedUrls.push(publicUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
    
    return uploadedUrls;
  };

  const submitListing = async () => {
    if (!user) {
      Alert.alert('Error', 'Please log in to create a listing');
      return;
    }

    setIsLoading(true);
    
    try {
      // Geocode the address to get coordinates
      const coordinates = await geocodeAddress(formData.address, formData.city, formData.state);
      const locationPoint = coordinates 
        ? `POINT(${coordinates.longitude} ${coordinates.latitude})`
        : 'POINT(151.2093 -33.8688)'; // Default to Sydney coordinates

      // Create listing
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          condition: formData.condition,
          brand: formData.brand || null,
          model: formData.model || null,
          price_per_day: parseFloat(formData.price_per_day),
          price_weekly: formData.price_weekly ? parseFloat(formData.price_weekly) : null,
          deposit: formData.deposit ? parseFloat(formData.deposit) : null,
          insurance_enabled: formData.insurance_enabled,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postal_code,
          country: 'Australia',
          currency: 'AUD',
          owner_id: user.id,
          is_active: true,
          location: locationPoint,
        })
        .select()
        .single();

      if (listingError) throw listingError;

      // Upload images
      if (formData.images.length > 0) {
        await uploadImages(listing.id);
      }

      Alert.alert('Success!', 'Your listing has been created successfully and is awaiting admin approval.', [
        { text: 'OK', onPress: () => {
          // Reset form
          setFormData({
            title: '',
            description: '',
            category: '',
            condition: '',
            brand: '',
            model: '',
            price_per_day: '',
            price_weekly: '',
            deposit: '',
            insurance_enabled: false,
            images: [],
            address: '',
            city: '',
            state: '',
            postal_code: '',
          });
          setCurrentStep(1);
        }}
      ]);

    } catch (error) {
      console.error('Error creating listing:', error);
      Alert.alert('Error', 'Failed to create listing. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      submitListing();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.images.length >= 3 && formData.title && formData.description && formData.category && formData.condition;
      case 2:
        return formData.price_per_day;
      case 3:
        return formData.address && formData.city && formData.state;
      default:
        return false;
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      {STEPS.map((step, index) => (
        <View key={step.id} style={styles.progressStep}>
          <View style={[
            styles.progressCircle, 
            currentStep >= step.id && styles.progressCircleActive
          ]}>
            <Ionicons 
              name={step.icon as any} 
              size={16} 
              color={currentStep >= step.id ? '#FFFFFF' : '#6B7280'} 
            />
          </View>
          {index < STEPS.length - 1 && (
            <View style={[
              styles.progressLine,
              currentStep > step.id && styles.progressLineActive
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderBasicDetails();
      case 2:
        return renderPricingAvailability();
      case 3:
        return renderLocationDelivery();
      default:
        return null;
    }
  };

  const renderBasicDetails = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Basic Details</Text>
      <Text style={styles.stepSubtitle}>Tell us about your item, condition, and photos</Text>
      
      {/* Photos Section */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Photos *</Text>
        <Text style={styles.helper}>Add at least 3 photos to showcase your item</Text>
        
        <ScrollView horizontal style={styles.photosContainer}>
          {formData.images.map((image, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri: image.uri }} style={styles.image} />
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => removeImage(index)}
              >
                <Ionicons name="close-circle" size={24} color="#FF4444" />
              </TouchableOpacity>
            </View>
          ))}
          
          <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
            <Ionicons name="add-circle" size={32} color={colors.primary.main} />
            <Text style={styles.addPhotoText}>Add Photo</Text>
            <Text style={styles.addPhotoSubtext}>Camera or Library</Text>
          </TouchableOpacity>
        </ScrollView>
        
        {formData.images.length < 3 && (
          <Text style={styles.errorText}>
            Please add at least 3 photos ({formData.images.length}/3)
          </Text>
        )}
        
        <Text style={styles.helper}>
          Tap "Add Photo" to take a new photo with your camera or select from your photo library
        </Text>
      </View>

      {/* Title */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.title}
          onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
          placeholder="e.g., Professional Camera Lens"
          maxLength={100}
        />
      </View>

      {/* Description */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={formData.description}
          onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
          placeholder="Describe your item, its features, what's included..."
          multiline
          numberOfLines={4}
          maxLength={2000}
        />
      </View>

      {/* Category */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Category *</Text>
        <TouchableOpacity 
          style={styles.selectButton}
          onPress={() => setShowCategoryModal(true)}
        >
          <Text style={[styles.selectText, !formData.category && styles.placeholderText]}>
            {formData.category ? 
              CATEGORIES.find(c => c.id === formData.category)?.name || formData.category :
              'Select a category'
            }
          </Text>
          <Ionicons name="chevron-down" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Condition */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Condition *</Text>
        <TouchableOpacity 
          style={styles.selectButton}
          onPress={() => setShowConditionModal(true)}
        >
          <Text style={[styles.selectText, !formData.condition && styles.placeholderText]}>
            {formData.condition ? 
              CONDITIONS.find(c => c.id === formData.condition)?.name || formData.condition :
              'Select condition'
            }
          </Text>
          <Ionicons name="chevron-down" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Brand & Model */}
      <View style={styles.inputRow}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
          <Text style={styles.label}>Brand</Text>
          <TextInput
            style={styles.textInput}
            value={formData.brand}
            onChangeText={(text) => setFormData(prev => ({ ...prev, brand: text }))}
            placeholder="e.g., Canon"
          />
        </View>
        
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
          <Text style={styles.label}>Model</Text>
          <TextInput
            style={styles.textInput}
            value={formData.model}
            onChangeText={(text) => setFormData(prev => ({ ...prev, model: text }))}
            placeholder="e.g., EOS R5"
          />
        </View>
      </View>
    </View>
  );

  const renderPricingAvailability = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Pricing & Availability</Text>
      <Text style={styles.stepSubtitle}>Set your rental rates and availability</Text>
      
      {/* Daily Rate */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Daily Rate (AUD) *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.price_per_day}
          onChangeText={(text) => setFormData(prev => ({ ...prev, price_per_day: text }))}
          placeholder="25.00"
          keyboardType="decimal-pad"
        />
      </View>

      {/* Weekly Rate */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Weekly Rate (AUD)</Text>
        <Text style={styles.helper}>Optional discount for week-long rentals</Text>
        <TextInput
          style={styles.textInput}
          value={formData.price_weekly}
          onChangeText={(text) => setFormData(prev => ({ ...prev, price_weekly: text }))}
          placeholder="150.00"
          keyboardType="decimal-pad"
        />
      </View>

      {/* Security Deposit */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Security Deposit (AUD)</Text>
        <Text style={styles.helper}>Refundable deposit to protect your item</Text>
        <TextInput
          style={styles.textInput}
          value={formData.deposit}
          onChangeText={(text) => setFormData(prev => ({ ...prev, deposit: text }))}
          placeholder="50.00"
          keyboardType="decimal-pad"
        />
      </View>

      {/* Insurance Option */}
      <TouchableOpacity 
        style={styles.checkboxContainer}
        onPress={() => setFormData(prev => ({ ...prev, insurance_enabled: !prev.insurance_enabled }))}
      >
        <View style={[styles.checkbox, formData.insurance_enabled && styles.checkboxChecked]}>
          {formData.insurance_enabled && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
        </View>
        <Text style={styles.checkboxLabel}>Enable rental insurance</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLocationDelivery = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Location & Delivery</Text>
      <Text style={styles.stepSubtitle}>Where and how will renters get the item</Text>
      
      {/* Address */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Address *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.address}
          onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
          placeholder="123 Main Street"
        />
      </View>

      {/* City and State */}
      <View style={styles.inputRow}>
        <View style={[styles.inputGroup, { flex: 2, marginRight: 10 }]}>
          <Text style={styles.label}>City *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.city}
            onChangeText={(text) => setFormData(prev => ({ ...prev, city: text }))}
            placeholder="Sydney"
          />
        </View>
        
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
          <Text style={styles.label}>State *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.state}
            onChangeText={(text) => setFormData(prev => ({ ...prev, state: text }))}
            placeholder="NSW"
          />
        </View>
      </View>

      {/* Postal Code */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Postal Code</Text>
        <TextInput
          style={styles.textInput}
          value={formData.postal_code}
          onChangeText={(text) => setFormData(prev => ({ ...prev, postal_code: text }))}
          placeholder="2000"
          keyboardType="numeric"
        />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>List Your Item</Text>
          <Text style={styles.headerSubtitle}>Share your items with the community and earn money</Text>
        </View>
        
        {renderProgressBar()}
        
        <View style={styles.content}>
          {renderStep()}
        </View>
        
        <View style={styles.navigationContainer}>
          {currentStep > 1 && (
            <TouchableOpacity style={styles.backButton} onPress={prevStep}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.nextButton, !isStepValid() && styles.nextButtonDisabled]}
            onPress={nextStep}
            disabled={!isStepValid() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.nextButtonText}>
                {currentStep === STEPS.length ? 'Create Listing' : 'Next'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Category Modal */}
      <Modal visible={showCategoryModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <ScrollView>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.modalOption}
                  onPress={() => {
                    setFormData(prev => ({ ...prev, category: category.id }));
                    setShowCategoryModal(false);
                  }}
                >
                  <Text style={styles.modalOptionIcon}>{category.icon}</Text>
                  <Text style={styles.modalOptionText}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowCategoryModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Condition Modal */}
      <Modal visible={showConditionModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Condition</Text>
            <ScrollView>
              {CONDITIONS.map((condition) => (
                <TouchableOpacity
                  key={condition.id}
                  style={styles.modalOption}
                  onPress={() => {
                    setFormData(prev => ({ ...prev, condition: condition.id }));
                    setShowConditionModal(false);
                  }}
                >
                  <View>
                    <Text style={styles.modalOptionText}>{condition.name}</Text>
                    <Text style={styles.modalOptionDescription}>{condition.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowConditionModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  headerTitle: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.neutral.lightGray,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.neutral.mediumGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircleActive: {
    backgroundColor: colors.primary.main,
  },
  progressLine: {
    width: 24,
    height: 2,
    backgroundColor: colors.neutral.mediumGray,
    marginHorizontal: spacing.xs / 2,
  },
  progressLineActive: {
    backgroundColor: colors.primary.main,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  stepContainer: {
    paddingVertical: spacing.md,
  },
  stepTitle: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  stepSubtitle: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  label: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  helper: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.neutral.mediumGray,
    borderRadius: 8,
    padding: spacing.sm,
    fontSize: typography.sizes.base,
    backgroundColor: colors.white,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  selectButton: {
    borderWidth: 1,
    borderColor: colors.neutral.mediumGray,
    borderRadius: 8,
    padding: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  selectText: {
    fontSize: typography.sizes.base,
    color: colors.text.primary,
  },
  placeholderText: {
    color: colors.text.secondary,
  },
  photosContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  imageContainer: {
    marginRight: 12,
    position: 'relative',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#44D62C',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoText: {
    color: '#44D62C',
    fontSize: 12,
    marginTop: 4,
  },
  addPhotoSubtext: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#44D62C',
    borderColor: '#44D62C',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#343C3E',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    marginTop: spacing.md,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  backButtonText: {
    fontSize: 16,
    color: '#6B7280',
  },
  nextButton: {
    backgroundColor: colors.primary.main,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: colors.neutral.mediumGray,
  },
  nextButtonText: {
    color: colors.white,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#343C3E',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalOptionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#343C3E',
  },
  modalOptionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  modalCloseButton: {
    padding: 20,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 12,
    marginTop: 8,
  },
}); 