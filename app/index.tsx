
import { Redirect } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '../styles/commonStyles';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_COMPLETED_KEY = 'onboarding_completed';

export default function Index() {
  const { user, authLoading } = useAuth();
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
      setOnboardingCompleted(completed === 'true');
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // Default to false if there's an error
      setOnboardingCompleted(false);
    }
  };

  // Show loading while checking auth and onboarding status
  if (authLoading || onboardingCompleted === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // If user is authenticated, go to main app
  if (user) {
    console.log('Index: User authenticated, redirecting to tabs');
    return <Redirect href="/(tabs)" />;
  }

  // If onboarding not completed, show onboarding
  if (!onboardingCompleted) {
    console.log('Index: Onboarding not completed, showing onboarding');
    return <Redirect href="/onboarding" />;
  }

  // Otherwise, show login
  console.log('Index: No user, showing login');
  return <Redirect href="/auth/login" />;
}
