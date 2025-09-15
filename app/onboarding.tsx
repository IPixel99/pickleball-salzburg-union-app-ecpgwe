
import React from 'react';
import OnboardingSlider from '../components/OnboardingSlider';
import { useRouter } from 'expo-router';

export default function OnboardingScreen() {
  const router = useRouter();

  const handleOnboardingComplete = () => {
    console.log('OnboardingScreen: Onboarding completed');
    // For now, just redirect to login - in a real app you might set a flag in AsyncStorage
    router.replace('/auth/login');
  };

  return <OnboardingSlider onComplete={handleOnboardingComplete} />;
}
