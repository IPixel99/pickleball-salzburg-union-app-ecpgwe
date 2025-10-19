
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
    title: 'Willkommen bei Pickleball!',
    description: 'Pickleball ist ein dynamischer Rückschlagsport, der Elemente aus Tennis, Badminton und Tischtennis vereint. Perfekt für alle Altersgruppen und Fitnesslevel!',
    image: require('../assets/images/057bd0da-9f85-41b0-afc8-77aaf54812b3.png'),
  },
  {
    id: 2,
    title: 'Pickleball Salzburg',
    description: 'Werde Teil unserer lebendigen Community! Wir bieten Training, Turniere und geselliges Spielen für Anfänger und Fortgeschrittene.',
    image: require('../assets/images/afaf55b7-8bc4-4484-ba5a-5d8e30858e75.png'),
  },
  {
    id: 3,
    title: 'Bereit zum Spielen?',
    description: 'Melde dich jetzt an und entdecke die Freude am Pickleball. Finde Spielpartner, nimm an Events teil und verbessere dein Spiel!',
    image: require('../assets/images/474ae733-3cc0-4d50-bb7c-53d07d96da23.png'),
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
          <Text style={styles.skipButtonText}>Überspringen</Text>
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
              <Image source={slide.image} style={styles.slideImage} resizeMode="cover" />
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
              <Text style={styles.registerButtonText}>Registrieren</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Anmelden</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Navigation buttons for other slides
          <View style={styles.navigationContainer}>
            {!isFirstSlide && (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backButtonText}>Zurück</Text>
              </TouchableOpacity>
            )}
            <View style={{ flex: 1 }} />
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>Weiter</Text>
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
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
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
    maxHeight: '55%',
    marginTop: 80,
    borderRadius: 20,
    overflow: 'hidden',
  },
  slideImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  contentContainer: {
    paddingTop: 40,
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
    backgroundColor: colors.primary,
    width: 24,
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
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
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
    borderWidth: 2,
    borderColor: colors.border,
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
    borderWidth: 1,
    borderColor: colors.border,
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
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  nextButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
});
