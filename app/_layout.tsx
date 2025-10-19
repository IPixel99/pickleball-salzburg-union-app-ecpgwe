
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, StatusBar } from 'react-native';
import { useEffect } from 'react';
import { setupErrorLogging } from '../utils/errorLogger';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNotifications } from '../hooks/useNotifications';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';

function RootLayoutContent() {
  // Initialize notifications
  useNotifications();
  const { theme } = useTheme();

  return (
    <>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'default',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="email-confirmed" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/signup" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    // Set up global error logging
    setupErrorLogging();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <RootLayoutContent />
        </GestureHandlerRootView>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
