
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import Icon from './Icon';

const { width: screenWidth } = Dimensions.get('window');

interface SlideData {
  id: number;
  title: string;
  description: string;
  image: any;
  backgroundColor?: string;
}

const slides: SlideData[] = [
  {
    id: 1,
    title: 'Welcome to Pickleball!',
    description: 'Pickleball is a paddle sport that combines elements of tennis, badminton, and table tennis. Two or four players use solid paddles to hit a perforated polymer ball over a net.',
    image: require('../assets/images/965e2265-5ed8-46fe-80eb-ae51f9e5ad74.png'),
    backgroundColor: '#8FB5A0',
  },
  {
    id: 2,
    title: 'Pickleball Salzburg',
    description: 'Join our vibrant community and discover the joy of pickleball. We offer lessons, tournaments, and social play for all skill levels.',
    image: require('../assets/images/aaa928a6-eb9b-4e82-a66b-466198f4b519.png'),
  },
  {
    id: 3,
    title: 'Find your perfect match',
    description: 'Connect with players of similar skill levels and interests for exciting games.',
    image: require('../assets/images/96a7a51e-cacd-443e-a054-4afd5c79ad9d.png'),
  },
  {
    id: 4,
    title: 'Ready to play?',
    description: 'Join the community and start playing pickleball today!',
    image: require('../assets/images/88bb7085-7924-4b6e-935b-7db91d9919bc.png'),
    backgroundColor: '#D4D4AA',
  },
];

interface OnboardingSliderProps {
  onComplete: () => void;
}

export default function OnboardingSlider({ onComplete }: OnboardingSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      const nextSlide = currentSlide + 1;
      setCurrentSlide(nextSlide);
      scrollViewRef.current?.scrollTo({
        x: nextSlide * screenWidth,
        animated: true,
      });
    }
  };

  const handleBack = () => {
    if (currentSlide > 0) {
      const prevSlide = currentSlide - 1;
      setCurrentSlide(prevSlide);
      scrollViewRef.current?.scrollTo({
        x: prevSlide * screenWidth,
        animated: true,
      });
    }
  };

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    setCurrentSlide(slideIndex);
  };

  const handleRegister = () => {
    console.log('OnboardingSlider: Navigating to signup');
    router.push('/auth/signup');
  };

  const handleLogin = () => {
    console.log('OnboardingSlider: Navigating to login');
    router.push('/auth/login');
  };

  const handleSkip = () => {
    console.log('OnboardingSlider: Skipping onboarding');
    onComplete();
  };

  const isLastSlide = currentSlide === slides.length - 1;
  const isFirstSlide = currentSlide === 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip Button */}
      {!isLastSlide && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Icon name="help-circle-outline" size={24} color={colors.textLight} />
        </TouchableOpacity>
      )}

      {/* Slides */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {slides.map((slide, index) => (
          <View
            key={slide.id}
            style={[
              styles.slide,
              slide.backgroundColor && { backgroundColor: slide.backgroundColor },
            ]}
          >
            <View style={styles.imageContainer}>
              <Image source={slide.image} style={styles.slideImage} resizeMode="contain" />
            </View>

            <View style={styles.contentContainer}>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.description}>{slide.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Page Indicators */}
      <View style={styles.indicatorContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              index === currentSlide ? styles.activeIndicator : styles.inactiveIndicator,
            ]}
          />
        ))}
      </View>

      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        {isLastSlide ? (
          // Final slide - Show Register and Login buttons
          <View style={styles.finalButtonsContainer}>
            <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
              <Text style={styles.registerButtonText}>Register</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Navigation buttons for other slides
          <View style={styles.navigationContainer}>
            {!isFirstSlide && (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            <View style={{ flex: 1 }} />
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width: screenWidth,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    backgroundColor: colors.background,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    maxHeight: '60%',
  },
  slideImage: {
    width: '100%',
    height: '100%',
    maxWidth: 400,
    maxHeight: 400,
  },
  contentContainer: {
    paddingBottom: 120,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 38,
  },
  description: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: colors.text,
  },
  inactiveIndicator: {
    backgroundColor: colors.border,
  },
  buttonContainer: {
    paddingHorizontal: 30,
    paddingBottom: 30,
  },
  finalButtonsContainer: {
    gap: 16,
  },
  registerButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  registerButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: colors.backgroundSecondary,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  loginButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: colors.backgroundSecondary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  backButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  nextButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
});
