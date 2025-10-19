
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
  bulletPoints?: string[];
  image?: any;
  showImage?: boolean;
  backgroundColor?: string;
}

const slides: SlideData[] = [
  {
    id: 1,
    title: 'Willkommen bei Pickleball!',
    description: 'Pickleball ist der am schnellsten wachsende Sport der Welt! Eine perfekte Mischung aus Tennis, Badminton und Tischtennis, die Menschen jeden Alters und Fitnesslevels begeistert.',
    bulletPoints: [
      '🎾 Einfach zu erlernen, schwer zu meistern',
      '👥 Sozial und gemeinschaftsorientiert',
      '💪 Großartiges Workout für Körper und Geist',
      '🏆 Wettkampf oder Freizeitspaß - du entscheidest',
      '❤️ Schonend für die Gelenke',
    ],
    showImage: false,
  },
  {
    id: 2,
    title: 'Pickleball Salzburg Union',
    description: 'Werde Teil der aktivsten Pickleball-Community in Salzburg! Wir sind mehr als nur ein Sportverein - wir sind eine Familie von Pickleball-Enthusiasten.',
    bulletPoints: [
      '🏅 Professionelles Training für alle Levels',
      '🎯 Regelmäßige Turniere und Events',
      '🤝 Freundliche und einladende Community',
      '📍 Moderne Spielstätten in Salzburg',
      '📅 Flexible Trainingszeiten',
      '🎉 Soziale Events und Teambuilding',
    ],
    image: require('../assets/images/f20db83f-0ba2-457f-99a4-dca9816f4437.png'),
    showImage: true,
  },
  {
    id: 3,
    title: 'Bereit zum Spielen?',
    description: 'Starte jetzt deine Pickleball-Reise mit uns!',
    bulletPoints: [
      '📱 Event-Anmeldung über die App',
      '👫 Finde Spielpartner',
      '🏆 Nimm an Turnieren teil',
    ],
    image: require('../assets/images/474ae733-3cc0-4d50-bb7c-53d07d96da23.png'),
    showImage: true,
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
    if (slideIndex !== currentSlide) {
      setCurrentSlide(slideIndex);
    }
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
            {/* Content */}
            <View style={styles.content}>
              {/* Image Container - Only show if showImage is true */}
              {slide.showImage && slide.image && (
                <View style={styles.imageContainer}>
                  <Image source={slide.image} style={styles.slideImage} resizeMode="contain" />
                </View>
              )}

              {/* Content Container */}
              <View style={[
                styles.contentContainer,
                !slide.showImage && styles.contentContainerNoImage
              ]}>
                <Text style={styles.title}>{slide.title}</Text>
                <Text style={styles.description}>{slide.description}</Text>

                {/* Bullet Points */}
                {slide.bulletPoints && (
                  <View style={styles.bulletPointsContainer}>
                    {slide.bulletPoints.map((point, idx) => (
                      <View key={idx} style={styles.bulletPoint}>
                        <Text style={styles.bulletPointText}>{point}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
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
              <Icon name="arrow-forward" size={20} color={colors.white} />
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
                <Icon name="arrow-back" size={20} color={colors.text} />
                <Text style={styles.backButtonText}>Zurück</Text>
              </TouchableOpacity>
            )}
            <View style={{ flex: 1 }} />
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>Weiter</Text>
              <Icon name="arrow-forward" size={20} color={colors.white} />
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  content: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: 200,
    marginTop: 80,
    marginBottom: 30,
  },
  slideImage: {
    width: '80%',
    height: '100%',
  },
  contentContainer: {
    paddingBottom: 120,
    alignItems: 'center',
    width: '100%',
  },
  contentContainerNoImage: {
    paddingTop: 60,
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
    marginBottom: 30,
  },
  bulletPointsContainer: {
    width: '100%',
    paddingHorizontal: 10,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  bulletPointText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    flex: 1,
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
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
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
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nextButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
});
