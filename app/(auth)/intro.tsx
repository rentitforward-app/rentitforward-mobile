import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const INTRO_SEEN_KEY = '@intro_seen';

interface IntroSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  emoji: string;
  backgroundColor: string;
}

const slides: IntroSlide[] = [
  {
    id: 1,
    title: 'Rent What You Need',
    subtitle: 'Access tools, electronics, sports gear, and more',
    description: 'Save money by renting items you need occasionally instead of buying them. From power tools to cameras, find everything in your community.',
    emoji: '🔧',
    backgroundColor: '#DCFCE7',
  },
  {
    id: 2,
    title: 'Share What You Have',
    subtitle: 'Make money from items you own',
    description: 'Turn your unused items into income. List anything from camping gear to kitchen appliances and start earning today.',
    emoji: '💰',
    backgroundColor: '#FEF3C7',
  },
  {
    id: 3,
    title: 'Build Community',
    subtitle: 'Connect with neighbors and share sustainably',
    description: 'Reduce waste and build stronger communities by sharing resources. Make sharing second nature.',
    emoji: '🌱',
    backgroundColor: '#DBEAFE',
  },
];

export default function IntroScreen() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  const markIntroAsSeen = async () => {
    try {
      await AsyncStorage.setItem(INTRO_SEEN_KEY, 'true');
    } catch (error) {
      console.error('Error marking intro as seen:', error);
    }
  };

  const goToSlide = (slideIndex: number) => {
    setCurrentSlide(slideIndex);
    scrollViewRef.current?.scrollTo({
      x: slideIndex * screenWidth,
      animated: true,
    });
  };

  const handleNext = async () => {
    if (currentSlide < slides.length - 1) {
      goToSlide(currentSlide + 1);
    } else {
      await markIntroAsSeen();
      router.push('/(auth)/welcome');
    }
  };

  const handleSkip = async () => {
    await markIntroAsSeen();
    router.push('/(auth)/welcome');
  };

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    setCurrentSlide(slideIndex);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      <View style={styles.mainContent}>
        {/* Slides */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
        >
          {slides.map((slide) => (
            <View key={slide.id} style={styles.slide}>
              <View style={styles.slideContent}>
                {/* Emoji Illustration */}
                <View style={[styles.emojiContainer, { backgroundColor: slide.backgroundColor }]}>
                  <Text style={styles.emoji}>{slide.emoji}</Text>
                </View>

                {/* Content */}
                <View style={styles.textContent}>
                  <Text style={styles.title}>{slide.title}</Text>
                  <Text style={styles.subtitle}>{slide.subtitle}</Text>
                  <Text style={styles.description}>{slide.description}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Page Indicators */}
        <View style={styles.indicators}>
          {slides.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => goToSlide(index)}
              style={[
                styles.indicator,
                currentSlide === index && styles.activeIndicator,
              ]}
            />
          ))}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleNext}
            style={styles.nextButton}
          >
            <Text style={styles.nextButtonText}>
              {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    minHeight: 60,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  mainContent: {
    flex: 1,
    minHeight: 0, // Important for flex to work properly
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  slide: {
    width: screenWidth,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  slideContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    maxWidth: '100%',
    minHeight: 0,
  },
  emojiContainer: {
    width: Math.min(200, screenWidth * 0.4),
    height: Math.min(200, screenWidth * 0.4),
    borderRadius: Math.min(100, screenWidth * 0.2),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  emoji: {
    fontSize: Math.min(80, screenWidth * 0.15),
  },
  textContent: {
    alignItems: 'center',
    paddingHorizontal: 16,
    flex: 1,
    justifyContent: 'center',
    maxWidth: '100%',
  },
  title: {
    fontSize: Math.min(32, screenWidth * 0.08),
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: Math.min(40, screenWidth * 0.1),
  },
  subtitle: {
    fontSize: Math.min(18, screenWidth * 0.045),
    fontWeight: '600',
    color: '#16A34A',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: Math.min(24, screenWidth * 0.06),
  },
  description: {
    fontSize: Math.min(16, screenWidth * 0.04),
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: Math.min(24, screenWidth * 0.06),
    paddingHorizontal: 8,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
    backgroundColor: 'white',
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#16A34A',
    width: 24,
  },
  buttonContainer: {
    marginTop: 8,
  },
  nextButton: {
    backgroundColor: '#16A34A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
}); 