import React, { useState, useEffect, useRef } from 'react';
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
  Modal,
  KeyboardAvoidingView,
  Platform,
  Keyboard
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useAuth } from '../../src/components/AuthProvider';
import { supabase } from '../../src/lib/supabase';
import { colors, spacing, typography, componentStyles } from '../../src/lib/design-system';
import { Header } from '../../src/components/Header';
import { useLocalSearchParams, useRouter } from 'expo-router';

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

// Categories (matches web database format and shared types)
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
  { id: 'excellent', name: 'Excellent', description: 'Minimal wear, excellent condition' },
  { id: 'good', name: 'Good', description: 'Normal wear, fully functional' },
  { id: 'fair', name: 'Fair', description: 'Well used, some wear visible' },
  { id: 'poor', name: 'Poor', description: 'Significant wear, may have issues' },
];

const AUSTRALIAN_STATES = [
  { code: 'NSW', name: 'New South Wales' },
  { code: 'VIC', name: 'Victoria' },
  { code: 'QLD', name: 'Queensland' },
  { code: 'WA', name: 'Western Australia' },
  { code: 'SA', name: 'South Australia' },
  { code: 'TAS', name: 'Tasmania' },
  { code: 'ACT', name: 'Australian Capital Territory' },
  { code: 'NT', name: 'Northern Territory' },
];

export default function CreateScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const router = useRouter();
  const { edit } = useLocalSearchParams();
  const isEditMode = !!edit;
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingListing, setIsLoadingListing] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRefs = useRef<{ [key: string]: TextInput }>({});
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    condition: '',
    brand: '',
    model: '',
    year: '',
    price_per_day: '',
    price_hourly: '',
    price_weekly: '',
    price_monthly: '',
    deposit: '',
    insurance_enabled: false,
    availability_type: 'always',
    available_from: '',
    available_to: '',
    images: [],
    address: '',
    unit_number: '',
    street_number: '',
    street_name: '',
    city: '',
    state: '',
    postal_code: '',
    delivery_methods: [],
    features: [],
  });

  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);
  const [newFeature, setNewFeature] = useState('');
  
  // Address search state
  const [searchAddress, setSearchAddress] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const searchTimeoutRef = useRef(null);

  // Load categories from database and existing listing if editing
  useEffect(() => {
    loadCategories();
    if (isEditMode && edit) {
      loadExistingListing(edit as string);
    }
  }, [isEditMode, edit]);

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

  const loadExistingListing = async (listingId: string) => {
    setIsLoadingListing(true);
    try {
      const { data: listing, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', listingId)
        .eq('owner_id', user?.id) // Ensure user owns this listing
        .single();

      if (error) {
        console.error('Error loading listing:', error);
        Alert.alert('Error', 'Failed to load listing for editing');
        router.back();
        return;
      }

      if (!listing) {
        Alert.alert('Error', 'Listing not found or you do not have permission to edit it');
        router.back();
        return;
      }

      // Parse address components from the full address
      const addressParts = listing.address?.split(', ') || [];
      let unitNumber = '';
      let streetNumber = '';
      let streetName = '';
      let city = listing.city || '';
      let state = listing.state || '';
      let postalCode = listing.postal_code || '';

      // Try to parse the first part for unit/street number and street name
      if (addressParts.length > 0) {
        const firstPart = addressParts[0];
        // Look for unit number (e.g., "5A/123 Main Street" or "Unit 12/123 Main Street")
        const unitMatch = firstPart.match(/^(.+?)\/(.+)$/);
        if (unitMatch) {
          unitNumber = unitMatch[1].trim();
          const streetPart = unitMatch[2].trim();
          const streetMatch = streetPart.match(/^(\d+)\s+(.+)$/);
          if (streetMatch) {
            streetNumber = streetMatch[1];
            streetName = streetMatch[2];
          } else {
            streetName = streetPart;
          }
        } else {
          // No unit number, just street number and name
          const streetMatch = firstPart.match(/^(\d+)\s+(.+)$/);
          if (streetMatch) {
            streetNumber = streetMatch[1];
            streetName = streetMatch[2];
          } else {
            streetName = firstPart;
          }
        }
      }

      // Pre-populate form with existing data
      setFormData({
        title: listing.title || '',
        description: listing.description || '',
        category: listing.category || '',
        condition: listing.condition || '',
        brand: listing.brand || '',
        model: listing.model || '',
        year: listing.year ? listing.year.toString() : '',
        price_per_day: listing.price_per_day ? listing.price_per_day.toString() : '',
        price_hourly: listing.price_hourly ? listing.price_hourly.toString() : '',
        price_weekly: listing.price_weekly ? listing.price_weekly.toString() : '',
        price_monthly: listing.price_monthly ? listing.price_monthly.toString() : '',
        deposit: listing.deposit ? listing.deposit.toString() : '',
        insurance_enabled: listing.insurance_enabled || false,
        availability_type: listing.available_from || listing.available_to ? 'partial' : 'always',
        available_from: listing.available_from || '',
        available_to: listing.available_to || '',
        images: (listing.images || []).map((url: string) => ({ uri: url })), // Convert URLs to image objects
        address: listing.address || '',
        unit_number: unitNumber,
        street_number: streetNumber,
        street_name: streetName,
        city: city,
        state: state,
        postal_code: postalCode,
        delivery_methods: [], // Will need to be determined from listing data if we add this field
        features: listing.features || [],
      });

      // Set search address for display
      setSearchAddress(listing.address || '');

    } catch (error) {
      console.error('Error loading listing:', error);
      Alert.alert('Error', 'Failed to load listing for editing');
      router.back();
    } finally {
      setIsLoadingListing(false);
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
      allowsEditing: false, // Disable editing to preserve original aspect ratio
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
      allowsMultipleSelection: true,
      selectionLimit: 10 - formData.images.length, // Allow up to 10 total images
      allowsEditing: false, // Disable editing for multiple selection
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...result.assets]
      }));
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const toggleDeliveryMethod = (method) => {
    setFormData(prev => ({
      ...prev,
      delivery_methods: prev.delivery_methods.includes(method)
        ? prev.delivery_methods.filter(m => m !== method)
        : [...prev.delivery_methods, method]
    }));
  };

  const getStateName = (code) => {
    const state = AUSTRALIAN_STATES.find(s => s.code === code);
    return state ? state.name : code;
  };

  // Helper function to scroll to input field when focused
  const scrollToInput = (inputKey: string) => {
    const input = inputRefs.current[inputKey];
    if (input && scrollViewRef.current) {
      input.measureInWindow((x, y, width, height) => {
        const scrollY = y - 100; // Offset to show field above keyboard
        scrollViewRef.current?.scrollTo({ y: Math.max(0, scrollY), animated: true });
      });
    }
  };

  // Helper function to focus next input field
  const focusNextInput = (currentKey: string, nextKey: string) => {
    const nextInput = inputRefs.current[nextKey];
    if (nextInput) {
      nextInput.focus();
    }
  };

  // Get return key type for input fields
  const getReturnKeyType = (inputKey: string, isLastField: boolean = false) => {
    if (isLastField) {
      return 'done';
    }
    return 'next';
  };

  // Debounced address search function
  const debouncedAddressSearch = (query: string) => {
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout
    searchTimeoutRef.current = setTimeout(() => {
      handleAddressSearch(query);
    }, 500); // 500ms delay
  };

  // Address search and auto-fill functions using Google Places API
  const handleAddressSearch = async (query: string) => {
    if (query.length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setIsLoadingLocation(true);
      console.log('🔍 Searching for address with Google Places API:', query);
      
      const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        throw new Error('Google Maps API key not found');
      }
      
      // Use Google Places Autocomplete API
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&types=address&components=country:au&key=${apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK' && data.predictions && data.predictions.length > 0) {
        console.log('✅ Found Google Places suggestions:', data.predictions.length);
        
        // Convert Google Places predictions to our suggestion format
        const suggestions = data.predictions.slice(0, 5).map((prediction: any) => ({
          description: prediction.description,
          formatted_address: prediction.description,
          secondary_text: prediction.structured_formatting?.secondary_text || '',
          place_id: prediction.place_id,
          terms: prediction.terms,
          types: prediction.types,
          // We'll get detailed address components when user selects this
        }));
        
        setAddressSuggestions(suggestions);
        setShowSuggestions(true);
      } else if (data.status === 'ZERO_RESULTS') {
        console.log('ℹ️ No Google Places results found');
        // Show a helpful message
        const helpSuggestions = [
          {
            description: `No results for "${query}"`,
            formatted_address: 'Try a more specific address (e.g., "123 Collins Street Melbourne")',
            secondary_text: 'Or use "Use My Location" button below',
            isHelpMessage: true
          }
        ];
        setAddressSuggestions(helpSuggestions);
        setShowSuggestions(true);
      } else {
        console.warn('Google Places API error:', data.status, data.error_message);
        throw new Error(`Google Places API error: ${data.status}`);
      }
    } catch (error) {
      console.error('Address search error:', error);
      // Show error message as suggestion
      const errorSuggestions = [
        {
          description: 'Address search unavailable',
          formatted_address: 'Please enter your address manually below',
          secondary_text: 'Or try "Use My Location" button',
          isHelpMessage: true
        }
      ];
      setAddressSuggestions(errorSuggestions);
      setShowSuggestions(true);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const selectAddressSuggestion = async (suggestion: any) => {
    // Don't auto-fill for help messages
    if (suggestion.isHelpMessage) {
      setShowSuggestions(false);
      return;
    }
    
    setSearchAddress(suggestion.description || suggestion.formatted_address);
    setShowSuggestions(false);
    setIsLoadingLocation(true);
    
    try {
      // If we have a place_id, get detailed information from Google Places Details API
      if (suggestion.place_id) {
        console.log('🔍 Getting place details for:', suggestion.place_id);
        
        const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          throw new Error('Google Maps API key not found');
        }
        
        // Use Google Places Details API to get address components
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${suggestion.place_id}&fields=address_components,geometry,formatted_address&key=${apiKey}`;
        
        const response = await fetch(detailsUrl);
        const data = await response.json();
        
        if (data.status === 'OK' && data.result) {
          const place = data.result;
          console.log('✅ Got place details:', place);
          
          // Extract address components
          let streetNumber = '';
          let streetName = '';
          let suburb = '';
          let state = '';
          let postcode = '';
          
          if (place.address_components) {
            place.address_components.forEach((component: any) => {
              const types = component.types;
              
              if (types.includes('street_number')) {
                streetNumber = component.long_name;
              } else if (types.includes('route')) {
                streetName = component.long_name;
              } else if (types.includes('locality') || types.includes('sublocality_level_1')) {
                suburb = component.long_name;
              } else if (types.includes('administrative_area_level_1')) {
                state = component.short_name;
              } else if (types.includes('postal_code')) {
                postcode = component.long_name;
              }
            });
          }
          
          // Auto-fill the form fields
          setFormData(prev => ({
            ...prev,
            street_number: streetNumber,
            street_name: streetName,
            city: suburb,
            state: state,
            postal_code: postcode,
          }));
          
          // Set selected location for visual feedback
          if (place.geometry && place.geometry.location) {
            setSelectedLocation({
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng,
            });
          }
          
          console.log('✅ Address auto-filled from Google Places:', {
            streetNumber,
            streetName,
            suburb,
            state,
            postcode,
          });
        } else {
          console.warn('Google Places Details API error:', data.status);
          throw new Error(`Failed to get place details: ${data.status}`);
        }
      } else {
        // Fallback: try to parse from the description
        console.log('⚠️ No place_id, parsing from description');
        const parts = suggestion.description.split(', ');
        
        // Basic parsing - this won't be as accurate as Google Places Details
        if (parts.length >= 2) {
          const streetPart = parts[0];
          const cityPart = parts[1];
          const statePart = parts[2];
          
          // Try to extract street number and name
          const streetMatch = streetPart.match(/^(\d+)\s+(.+)$/);
          if (streetMatch) {
            setFormData(prev => ({
              ...prev,
              street_number: streetMatch[1],
              street_name: streetMatch[2],
              city: cityPart,
              state: statePart || '',
            }));
          } else {
            setFormData(prev => ({
              ...prev,
              street_name: streetPart,
              city: cityPart,
              state: statePart || '',
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error processing address suggestion:', error);
      Alert.alert('Error', 'Failed to get address details. Please try again or enter manually.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    
    try {
      // Request location permission and get current position
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow location access to use this feature');
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      console.log('📍 Current location:', latitude, longitude);
      
      // Reverse geocode to get address
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      
      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        
        // Auto-fill form with current location
        setFormData(prev => ({
          ...prev,
          street_number: address.streetNumber || '',
          street_name: address.street || '',
          city: address.city || address.subregion || '',
          state: address.region || '',
          postal_code: address.postalCode || '',
        }));
        
        setSelectedLocation({ lat: latitude, lng: longitude });
        setSearchAddress(`${address.streetNumber || ''} ${address.street || ''}, ${address.city || ''}`);
        
        console.log('✅ Location auto-filled from GPS');
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Location Error', 'Unable to get your current location. Please try again.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const uploadImages = async (imagesToUpload = formData.images) => {
    const uploadedUrls = [];
    
    for (let i = 0; i < imagesToUpload.length; i++) {
      const image = imagesToUpload[i];
      const fileExt = image.uri.split('.').pop();
      const fileName = `${user.id}/${Date.now()}_${i}.${fileExt}`;
      
      try {
        // Create FormData for file upload
        const uploadFormData = new FormData();
        uploadFormData.append('file', {
          uri: image.uri,
          type: `image/${fileExt}`,
          name: fileName,
        } as any);

        const { data, error } = await supabase.storage
          .from('listing-images')
          .upload(fileName, uploadFormData);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('listing-images')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
        throw error; // Re-throw to handle in submitListing
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
      const fullAddressForGeocoding = `${formData.street_number} ${formData.street_name}, ${formData.city}, ${formData.state}`;
      const coordinates = await geocodeAddress(fullAddressForGeocoding, formData.city, formData.state);
      
      // Handle image uploads - only upload new images (those without http/https URLs)
      let imageUrls: string[] = [];
      const newImages = formData.images.filter(img => !img.uri.startsWith('http'));
      const existingImageUrls = formData.images.filter(img => img.uri.startsWith('http')).map(img => img.uri);
      
      if (newImages.length > 0) {
        const uploadedUrls = await uploadImages(newImages);
        imageUrls = [...existingImageUrls, ...uploadedUrls];
      } else {
        imageUrls = existingImageUrls;
      }

      // Prepare the full address string
      const fullAddress = `${formData.unit_number ? formData.unit_number + '/' : ''}${formData.street_number} ${formData.street_name}, ${formData.city}, ${formData.state} ${formData.postal_code}, Australia`;

      // Prepare listing data
      const listingData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        condition: formData.condition,
        brand: formData.brand || null,
        model: formData.model || null,
        year: formData.year ? parseInt(formData.year) : null,
        price_per_day: parseFloat(formData.price_per_day),
        price_weekly: formData.price_weekly ? parseFloat(formData.price_weekly) : null,
        deposit: formData.deposit ? parseFloat(formData.deposit) : 0,
        insurance_enabled: formData.insurance_enabled,
        address: fullAddress,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postal_code,
        country: 'Australia',
        currency: 'AUD',
        location: coordinates 
          ? `POINT(${coordinates.longitude} ${coordinates.latitude})`
          : 'POINT(151.2093 -33.8688)',
        images: imageUrls,
        features: formData.features.length > 0 ? formData.features : [],
        pickup_available: true,
        delivery_available: false,
        // Reset approval status when editing - requires re-approval
        approval_status: 'pending',
        is_active: false,
      };

      let result;
      if (isEditMode && edit) {
        // Update existing listing
        const { data: listing, error: listingError } = await supabase
          .from('listings')
          .update(listingData)
          .eq('id', edit)
          .eq('owner_id', user.id) // Ensure user owns this listing
          .select()
          .single();

        if (listingError) {
          console.error('Listing update error:', listingError);
          throw listingError;
        }
        result = listing;
      } else {
        // Create new listing
        const { data: listing, error: listingError } = await supabase
          .from('listings')
          .insert({
            ...listingData,
            owner_id: user.id,
          })
          .select()
          .single();

        if (listingError) {
          console.error('Listing creation error:', listingError);
          throw listingError;
        }
        result = listing;
      }

      const successTitle = isEditMode ? 'Listing Updated Successfully! 🎉' : 'Listing Created Successfully! 🎉';
      const successMessage = isEditMode 
        ? 'Your listing has been updated and is awaiting admin approval. You\'ll receive a notification once it\'s approved, typically within 24 hours.'
        : 'Your listing has been submitted and is awaiting admin approval. You\'ll receive a notification once it\'s approved, typically within 24 hours.';

      Alert.alert(
        successTitle, 
        successMessage, 
        [
          { text: 'OK', onPress: () => {
            if (!isEditMode) {
              // Reset form only for new listings
              setFormData({
                title: '',
                description: '',
                category: '',
                condition: '',
                brand: '',
                model: '',
                year: '',
                price_per_day: '',
                price_hourly: '',
                price_weekly: '',
                price_monthly: '',
                deposit: '',
                insurance_enabled: false,
                availability_type: 'always',
                available_from: '',
                available_to: '',
                images: [],
                address: '',
                unit_number: '',
                street_number: '',
                street_name: '',
                city: '',
                state: '',
                postal_code: '',
                delivery_methods: [],
                features: [],
              });
              setCurrentStep(1);
            } else {
              // Go back to My Listings for edit mode
              router.back();
            }
          }}
        ]
      );

    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} listing:`, error);
      
      // Provide more specific error messages
      let errorMessage = `Failed to ${isEditMode ? 'update' : 'create'} listing. Please try again.`;
      if (error.message) {
        if (error.message.includes('category')) {
          errorMessage = 'Invalid category selected. Please choose a different category.';
        } else if (error.message.includes('condition')) {
          errorMessage = 'Invalid condition selected. Please choose a different condition.';
        } else if (error.message.includes('images')) {
          errorMessage = 'Error uploading images. Please try different photos.';
        } else if (error.message.includes('address') || error.message.includes('location')) {
          errorMessage = 'Invalid address. Please check your location details.';
        } else if (error.message.includes('price')) {
          errorMessage = 'Invalid pricing. Please check your daily rate.';
        }
      }
      
      Alert.alert('Error', errorMessage);
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
        return formData.street_number.trim() && 
               formData.street_name.trim() && 
               formData.city.trim() && 
               formData.state.trim() &&
               formData.postal_code.trim();
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
          ref={(ref) => { if (ref) inputRefs.current['title'] = ref; }}
          style={styles.textInput}
          value={formData.title}
          onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
          placeholder="e.g., Professional Camera Lens"
          maxLength={100}
          returnKeyType={getReturnKeyType('title')}
          onFocus={() => scrollToInput('title')}
          onSubmitEditing={() => focusNextInput('title', 'description')}
          blurOnSubmit={false}
        />
      </View>

      {/* Description */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description *</Text>
        <TextInput
          ref={(ref) => { if (ref) inputRefs.current['description'] = ref; }}
          style={[styles.textInput, styles.textArea]}
          value={formData.description}
          onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
          placeholder="Describe your item, its features, what's included..."
          multiline
          numberOfLines={4}
          maxLength={2000}
          returnKeyType={getReturnKeyType('description')}
          onFocus={() => scrollToInput('description')}
          onSubmitEditing={() => focusNextInput('description', 'brand')}
          blurOnSubmit={false}
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
            ref={(ref) => { if (ref) inputRefs.current['brand'] = ref; }}
            style={styles.textInput}
            value={formData.brand}
            onChangeText={(text) => setFormData(prev => ({ ...prev, brand: text }))}
            placeholder="e.g., Canon"
            returnKeyType={getReturnKeyType('brand')}
            onFocus={() => scrollToInput('brand')}
            onSubmitEditing={() => focusNextInput('brand', 'model')}
            blurOnSubmit={false}
          />
        </View>
        
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
          <Text style={styles.label}>Model</Text>
          <TextInput
            ref={(ref) => { if (ref) inputRefs.current['model'] = ref; }}
            style={styles.textInput}
            value={formData.model}
            onChangeText={(text) => setFormData(prev => ({ ...prev, model: text }))}
            placeholder="e.g., EOS R5"
            returnKeyType={getReturnKeyType('model')}
            onFocus={() => scrollToInput('model')}
            onSubmitEditing={() => focusNextInput('model', 'year')}
            blurOnSubmit={false}
          />
        </View>
      </View>

      {/* Year */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Year</Text>
        <TextInput
          ref={(ref) => { if (ref) inputRefs.current['year'] = ref; }}
          style={styles.textInput}
          value={formData.year}
          onChangeText={(text) => setFormData(prev => ({ ...prev, year: text }))}
          placeholder="e.g., 2023"
          keyboardType="numeric"
          maxLength={4}
          returnKeyType={getReturnKeyType('year')}
          onFocus={() => scrollToInput('year')}
          onSubmitEditing={() => focusNextInput('year', 'newFeature')}
          blurOnSubmit={false}
        />
      </View>

      {/* Features */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Features</Text>
        <Text style={styles.helper}>Add specific features that make your item special (optional)</Text>
        
        {/* Add Feature Input */}
        <View style={styles.featureInputContainer}>
          <TextInput
            ref={(ref) => { if (ref) inputRefs.current['newFeature'] = ref; }}
            style={[styles.textInput, { flex: 1, marginRight: 10 }]}
            value={newFeature}
            onChangeText={setNewFeature}
            placeholder="e.g. Turbocharged engine, Premium audio"
            returnKeyType="done"
            onFocus={() => scrollToInput('newFeature')}
            onSubmitEditing={addFeature}
          />
          <TouchableOpacity
            style={styles.addFeatureButton}
            onPress={addFeature}
            disabled={!newFeature.trim() || formData.features.includes(newFeature.trim())}
          >
            <Text style={styles.addFeatureButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* Features List */}
        {formData.features.length > 0 && (
          <View style={styles.featuresList}>
            {formData.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureDot} />
                <Text style={styles.featureText}>{feature}</Text>
                <TouchableOpacity
                  style={styles.removeFeatureButton}
                  onPress={() => removeFeature(index)}
                >
                  <Ionicons name="close-circle" size={20} color="#FF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {formData.features.length === 0 && (
          <Text style={styles.helper}>
            No features added yet. Features help renters understand what makes your item special.
          </Text>
        )}
      </View>
    </View>
  );

  const renderPricingAvailability = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Pricing & Availability</Text>
      <Text style={styles.stepSubtitle}>Set your rental rates and availability</Text>
      
      {/* Rental Rates Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Rental Rates</Text>
      </View>
      
      {/* Daily Rate */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Daily Rate (AUD) *</Text>
        <TextInput
          ref={(ref) => { if (ref) inputRefs.current['price_per_day'] = ref; }}
          style={styles.textInput}
          value={formData.price_per_day}
          onChangeText={(text) => setFormData(prev => ({ ...prev, price_per_day: text }))}
          placeholder="25"
          keyboardType="decimal-pad"
          returnKeyType={getReturnKeyType('price_per_day')}
          onFocus={() => scrollToInput('price_per_day')}
          onSubmitEditing={() => focusNextInput('price_per_day', 'price_hourly')}
          blurOnSubmit={false}
        />
      </View>

      {/* Hourly, Weekly, Monthly Rates */}
      <View style={styles.inputRow}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 5 }]}>
          <Text style={styles.label}>Hourly Rate</Text>
          <Text style={styles.helper}>For short-term rentals</Text>
          <TextInput
            ref={(ref) => { if (ref) inputRefs.current['price_hourly'] = ref; }}
            style={styles.textInput}
            value={formData.price_hourly}
            onChangeText={(text) => setFormData(prev => ({ ...prev, price_hourly: text }))}
            placeholder="5"
            keyboardType="decimal-pad"
            returnKeyType={getReturnKeyType('price_hourly')}
            onFocus={() => scrollToInput('price_hourly')}
            onSubmitEditing={() => focusNextInput('price_hourly', 'price_weekly')}
            blurOnSubmit={false}
          />
        </View>
        
        <View style={[styles.inputGroup, { flex: 1, marginHorizontal: 5 }]}>
          <Text style={styles.label}>Weekly Rate</Text>
          <Text style={styles.helper}>20-30% discount</Text>
          <TextInput
            ref={(ref) => { if (ref) inputRefs.current['price_weekly'] = ref; }}
            style={styles.textInput}
            value={formData.price_weekly}
            onChangeText={(text) => setFormData(prev => ({ ...prev, price_weekly: text }))}
            placeholder="150"
            keyboardType="decimal-pad"
            returnKeyType={getReturnKeyType('price_weekly')}
            onFocus={() => scrollToInput('price_weekly')}
            onSubmitEditing={() => focusNextInput('price_weekly', 'price_monthly')}
            blurOnSubmit={false}
          />
        </View>
        
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 5 }]}>
          <Text style={styles.label}>Monthly Rate</Text>
          <Text style={styles.helper}>40-50% discount</Text>
          <TextInput
            ref={(ref) => { if (ref) inputRefs.current['price_monthly'] = ref; }}
            style={styles.textInput}
            value={formData.price_monthly}
            onChangeText={(text) => setFormData(prev => ({ ...prev, price_monthly: text }))}
            placeholder="500"
            keyboardType="decimal-pad"
            returnKeyType={getReturnKeyType('price_monthly')}
            onFocus={() => scrollToInput('price_monthly')}
            onSubmitEditing={() => focusNextInput('price_monthly', 'deposit')}
            blurOnSubmit={false}
          />
        </View>
      </View>

      {/* Security Deposit */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Security Deposit (AUD)</Text>
        <Text style={styles.helper}>Refundable deposit to protect against damage. Usually $50-$500 based on item value.</Text>
        <TextInput
          ref={(ref) => { if (ref) inputRefs.current['deposit'] = ref; }}
          style={styles.textInput}
          value={formData.deposit}
          onChangeText={(text) => setFormData(prev => ({ ...prev, deposit: text }))}
          placeholder="100"
          keyboardType="decimal-pad"
          returnKeyType={getReturnKeyType('deposit')}
          onFocus={() => scrollToInput('deposit')}
          onSubmitEditing={() => focusNextInput('deposit', 'available_from')}
          blurOnSubmit={false}
        />
      </View>

      {/* Availability Section */}
      <View style={styles.sectionDivider} />
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Availability</Text>
      </View>
      
      {/* Availability Type */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Availability Type *</Text>
        <TouchableOpacity 
          style={[styles.radioContainer, formData.availability_type === 'always' && styles.radioSelected]}
          onPress={() => setFormData(prev => ({ ...prev, availability_type: 'always' }))}
        >
          <View style={[styles.radio, formData.availability_type === 'always' && styles.radioChecked]}>
            {formData.availability_type === 'always' && <View style={styles.radioDot} />}
          </View>
          <View style={styles.radioTextContainer}>
            <Text style={styles.radioLabel}>Always Available</Text>
            <Text style={styles.radioDescription}>Item is available for rent at any time</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.radioContainer, formData.availability_type === 'partial' && styles.radioSelected]}
          onPress={() => setFormData(prev => ({ ...prev, availability_type: 'partial' }))}
        >
          <View style={[styles.radio, formData.availability_type === 'partial' && styles.radioChecked]}>
            {formData.availability_type === 'partial' && <View style={styles.radioDot} />}
          </View>
          <View style={styles.radioTextContainer}>
            <Text style={styles.radioLabel}>Partial Available</Text>
            <Text style={styles.radioDescription}>Item is only available during specific date ranges</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Date Range Selection - Only show when partial availability is selected */}
      {formData.availability_type === 'partial' && (
        <View style={styles.inputRow}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Available From</Text>
            <Text style={styles.helper}>When is your item first available?</Text>
            <TextInput
              ref={(ref) => { if (ref) inputRefs.current['available_from'] = ref; }}
              style={styles.textInput}
              value={formData.available_from}
              onChangeText={(text) => setFormData(prev => ({ ...prev, available_from: text }))}
              placeholder="YYYY-MM-DD"
              returnKeyType={getReturnKeyType('available_from')}
              onFocus={() => scrollToInput('available_from')}
              onSubmitEditing={() => focusNextInput('available_from', 'available_to')}
              blurOnSubmit={false}
            />
          </View>
          
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
            <Text style={styles.label}>Available Until</Text>
            <Text style={styles.helper}>When will you stop renting this item?</Text>
            <TextInput
              ref={(ref) => { if (ref) inputRefs.current['available_to'] = ref; }}
              style={styles.textInput}
              value={formData.available_to}
              onChangeText={(text) => setFormData(prev => ({ ...prev, available_to: text }))}
              placeholder="YYYY-MM-DD"
              returnKeyType="done"
              onFocus={() => scrollToInput('available_to')}
              onSubmitEditing={() => Keyboard.dismiss()}
            />
          </View>
        </View>
      )}

      {/* Insurance Option */}
      <TouchableOpacity 
        style={styles.checkboxContainer}
        onPress={() => setFormData(prev => ({ ...prev, insurance_enabled: !prev.insurance_enabled }))}
      >
        <View style={[styles.checkbox, formData.insurance_enabled && styles.checkboxChecked]}>
          {formData.insurance_enabled && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
        </View>
        <View style={styles.checkboxTextContainer}>
          <Text style={styles.checkboxLabel}>Enable Insurance Option</Text>
          <Text style={styles.checkboxDescription}>Allow renters to purchase insurance to cover potential damage</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderLocationDelivery = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Location & Delivery</Text>
      <Text style={styles.stepSubtitle}>Where and how will renters get the item</Text>
      
      {/* Find Your Address Section */}
      <View style={styles.addressSearchContainer}>
        <View style={styles.addressSearchHeader}>
          <Ionicons name="location" size={20} color="#44D62C" />
          <Text style={styles.addressSearchTitle}>Find Your Address</Text>
        </View>
        <Text style={styles.addressSearchDescription}>
          Search for your address to auto-fill location details, or use your current location.
        </Text>
        
        {/* Address Search Input */}
        <View style={styles.searchInputContainer}>
          <View style={styles.searchInputWrapper}>
            <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              ref={(ref) => { if (ref) inputRefs.current['searchAddress'] = ref; }}
              style={styles.searchInput}
              value={searchAddress}
              onChangeText={(text) => {
                setSearchAddress(text);
                debouncedAddressSearch(text);
              }}
              placeholder="Start typing your address... e.g. 123 Collins Street, Melbourne"
              returnKeyType="search"
              onFocus={() => scrollToInput('searchAddress')}
              onSubmitEditing={() => Keyboard.dismiss()}
            />
            {isLoadingLocation && (
              <ActivityIndicator 
                size="small" 
                color="#44D62C" 
                style={styles.searchLoader}
              />
            )}
          </View>
          
          {/* Address Suggestions */}
          {showSuggestions && addressSuggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              {addressSuggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.suggestionItem,
                    suggestion.isHelpMessage && styles.suggestionHelpItem
                  ]}
                  onPress={() => selectAddressSuggestion(suggestion)}
                >
                  <View style={styles.suggestionContent}>
                    <Text style={[
                      styles.suggestionAddress,
                      suggestion.isHelpMessage && styles.suggestionHelpText
                    ]}>
                      {suggestion.description || suggestion.formatted_address}
                    </Text>
                    {suggestion.secondary_text && (
                      <Text style={styles.suggestionSecondary}>
                        {suggestion.secondary_text}
                      </Text>
                    )}
                  </View>
                  {!suggestion.isHelpMessage && (
                    <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                  )}
                  {suggestion.isHelpMessage && (
                    <Ionicons name="information-circle" size={16} color="#6B7280" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        
        {/* Location Action Buttons */}
        <View style={styles.locationActionsContainer}>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={getCurrentLocation}
            disabled={isLoadingLocation}
          >
            <Ionicons name="navigate" size={16} color="#3B82F6" />
            <Text style={styles.locationButtonText}>
              {isLoadingLocation ? 'Getting Location...' : 'Use My Location'}
            </Text>
          </TouchableOpacity>
          
          {selectedLocation && (
            <View style={styles.locationSetIndicator}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.locationSetText}>Location Set</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.locationNote}>
          Note: Pickup is always available. These are additional services you can offer.
        </Text>
      </View>
      
      {/* Address Details Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Address Details</Text>
        <Text style={styles.sectionDescription}>
          {selectedLocation 
            ? "Confirm your address details below (auto-filled from your selection):" 
            : "Enter your address manually if you prefer:"}
        </Text>
      </View>
      
      {/* Unit Number, Street Number, and Postcode */}
      <View style={styles.inputRow}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 5 }]}>
          <Text style={styles.label}>Unit Number</Text>
          <Text style={styles.helper}>Apt, unit, suite, etc.</Text>
          <TextInput
            ref={(ref) => { if (ref) inputRefs.current['unit_number'] = ref; }}
            style={styles.textInput}
            value={formData.unit_number}
            onChangeText={(text) => setFormData(prev => ({ ...prev, unit_number: text }))}
            placeholder="5A, Unit 12"
            returnKeyType={getReturnKeyType('unit_number')}
            onFocus={() => scrollToInput('unit_number')}
            onSubmitEditing={() => focusNextInput('unit_number', 'street_number')}
            blurOnSubmit={false}
          />
        </View>
        
        <View style={[styles.inputGroup, { flex: 1, marginHorizontal: 5 }]}>
          <Text style={styles.label}>Street Number *</Text>
          <TextInput
            ref={(ref) => { if (ref) inputRefs.current['street_number'] = ref; }}
            style={styles.textInput}
            value={formData.street_number}
            onChangeText={(text) => setFormData(prev => ({ ...prev, street_number: text }))}
            placeholder="123"
            returnKeyType={getReturnKeyType('street_number')}
            onFocus={() => scrollToInput('street_number')}
            onSubmitEditing={() => focusNextInput('street_number', 'postal_code')}
            blurOnSubmit={false}
          />
        </View>
        
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 5 }]}>
          <Text style={styles.label}>Postcode *</Text>
          <TextInput
            ref={(ref) => { if (ref) inputRefs.current['postal_code'] = ref; }}
            style={styles.textInput}
            value={formData.postal_code}
            onChangeText={(text) => setFormData(prev => ({ ...prev, postal_code: text }))}
            placeholder="2026"
            keyboardType="numeric"
            maxLength={4}
            returnKeyType={getReturnKeyType('postal_code')}
            onFocus={() => scrollToInput('postal_code')}
            onSubmitEditing={() => focusNextInput('postal_code', 'street_name')}
            blurOnSubmit={false}
          />
        </View>
      </View>

      {/* Street Name and Suburb */}
      <View style={styles.inputRow}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
          <Text style={styles.label}>Street Name *</Text>
          <TextInput
            ref={(ref) => { if (ref) inputRefs.current['street_name'] = ref; }}
            style={styles.textInput}
            value={formData.street_name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, street_name: text }))}
            placeholder="Campbell Parade"
            returnKeyType={getReturnKeyType('street_name')}
            onFocus={() => scrollToInput('street_name')}
            onSubmitEditing={() => focusNextInput('street_name', 'city')}
            blurOnSubmit={false}
          />
        </View>
        
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
          <Text style={styles.label}>Suburb/City *</Text>
          <TextInput
            ref={(ref) => { if (ref) inputRefs.current['city'] = ref; }}
            style={styles.textInput}
            value={formData.city}
            onChangeText={(text) => setFormData(prev => ({ ...prev, city: text }))}
            placeholder="Bondi Beach"
            returnKeyType="done"
            onFocus={() => scrollToInput('city')}
            onSubmitEditing={() => Keyboard.dismiss()}
          />
        </View>
      </View>

      {/* State Selector */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>State *</Text>
        <TouchableOpacity 
          style={styles.selectButton}
          onPress={() => setShowStateModal(true)}
        >
          <Text style={[styles.selectButtonText, !formData.state && styles.selectButtonPlaceholder]}>
            {formData.state ? getStateName(formData.state) : 'Select your state'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Additional Delivery Options */}
      <View style={styles.sectionDivider} />
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Additional Delivery Options</Text>
        <Text style={styles.sectionDescription}>Select any additional delivery services you can provide (optional):</Text>
      </View>
      
      <View style={styles.deliveryOptionsContainer}>
        <TouchableOpacity 
          style={styles.checkboxContainer}
          onPress={() => toggleDeliveryMethod('delivery')}
        >
          <View style={[styles.checkbox, formData.delivery_methods.includes('delivery') && styles.checkboxChecked]}>
            {formData.delivery_methods.includes('delivery') && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
          </View>
          <View style={styles.checkboxTextContainer}>
            <Text style={styles.checkboxLabel}>Delivery Available</Text>
            <Text style={styles.checkboxDescription}>You can deliver within your area</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.checkboxContainer}
          onPress={() => toggleDeliveryMethod('shipping')}
        >
          <View style={[styles.checkbox, formData.delivery_methods.includes('shipping') && styles.checkboxChecked]}>
            {formData.delivery_methods.includes('shipping') && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
          </View>
          <View style={styles.checkboxTextContainer}>
            <Text style={styles.checkboxLabel}>Shipping</Text>
            <Text style={styles.checkboxDescription}>Can be shipped Australia-wide</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.deliveryNote}>
        Note: Pickup is always available. These are additional services you can offer.
      </Text>
    </View>
  );

  // Show loading screen while loading existing listing data
  if (isLoadingListing) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Header 
          title={isEditMode ? "Edit Your Item" : "List Your Item"} 
          showBackButton={true}
          showNotificationIcon={true}
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={{ marginTop: spacing.md, color: colors.text.secondary }}>
            Loading listing details...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <Header 
        title={isEditMode ? "Edit Your Item" : "List Your Item"} 
        showBackButton={true}
        showNotificationIcon={true}
      />
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.introSection}>
          <Text style={styles.headerSubtitle}>
            {isEditMode 
              ? "Update your item details - changes require approval" 
              : "Share your items with the community and earn money"
            }
          </Text>
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
                {currentStep === STEPS.length 
                  ? (isEditMode ? 'Update Listing' : 'Create Listing') 
                  : 'Next'
                }
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

      {/* State Modal */}
      <Modal visible={showStateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select State</Text>
            <ScrollView>
              {AUSTRALIAN_STATES.map((state) => (
                <TouchableOpacity
                  key={state.code}
                  style={styles.modalOption}
                  onPress={() => {
                    setFormData(prev => ({ ...prev, state: state.code }));
                    setShowStateModal(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{state.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowStateModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
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
  
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100, // Extra padding for keyboard
  },
  introSection: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    alignItems: 'center',
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
    resizeMode: 'cover', // Better handling for different aspect ratios
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
  featureInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  addFeatureButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    opacity: 0.7,
  },
  addFeatureButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  featuresList: {
    marginTop: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary.main,
    marginRight: 8,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: '#166534',
  },
  removeFeatureButton: {
    marginLeft: 8,
  },
  
  // New styles for enhanced UI
  sectionHeader: {
    marginBottom: 16,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  
  sectionDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 24,
  },
  
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  
  radioSelected: {
    borderColor: '#44D62C',
    backgroundColor: '#F0FDF4',
  },
  
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  radioChecked: {
    borderColor: '#44D62C',
  },
  
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#44D62C',
  },
  
  radioTextContainer: {
    flex: 1,
  },
  
  radioLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  
  radioDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
  },
  
  checkboxTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  
  checkboxDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
    lineHeight: 18,
  },
  
  deliveryOptionsContainer: {
    marginBottom: 16,
  },
  
  deliveryNote: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 8,
  },
  
  selectButtonText: {
    fontSize: 16,
    color: '#1F2937',
  },
  
  selectButtonPlaceholder: {
    color: '#9CA3AF',
  },
  
  // Address search styles
  addressSearchContainer: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  
  addressSearchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  addressSearchTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  
  addressSearchDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  
  searchInputContainer: {
    marginBottom: 16,
  },
  
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  
  searchIcon: {
    marginRight: 8,
  },
  
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    padding: 0,
  },
  
  searchLoader: {
    marginLeft: 8,
  },
  
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  
  suggestionContent: {
    flex: 1,
  },
  
  suggestionAddress: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  
  suggestionSecondary: {
    fontSize: 14,
    color: '#6B7280',
  },
  
  suggestionHelpItem: {
    backgroundColor: '#FEF3C7',
  },
  
  suggestionHelpText: {
    color: '#92400E',
    fontStyle: 'italic',
  },
  
  locationActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  
  locationButtonText: {
    fontSize: 14,
    color: '#3B82F6',
    marginLeft: 8,
    fontWeight: '500',
  },
  
  locationSetIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  
  locationSetText: {
    fontSize: 14,
    color: '#10B981',
    marginLeft: 6,
    fontWeight: '500',
  },
  
  locationNote: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});

