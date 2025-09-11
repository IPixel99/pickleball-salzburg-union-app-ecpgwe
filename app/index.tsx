
import React from 'react';
import { Text, View, TouchableOpacity, Image } from 'react-native';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    console.log('Navigating to main app');
    router.push('/(tabs)');
  };

  const handleLogin = () => {
    console.log('Navigating to login');
    router.push('/auth/login');
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.centerContent}>
        {/* Logo placeholder - you can replace with actual logo */}
        <View style={{
          width: 120,
          height: 120,
          backgroundColor: colors.primary,
          borderRadius: 60,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 30,
        }}>
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text,
          }}>PSU</Text>
        </View>

        <Text style={commonStyles.title}>Pickleball Salzburg Union</Text>
        <Text style={[commonStyles.text, { textAlign: 'center', marginBottom: 40 }]}>
          Willkommen bei der offiziellen App des Pickleball Salzburg Union. 
          Bleibe auf dem Laufenden mit Events, Nachrichten und mehr!
        </Text>

        <TouchableOpacity
          style={[buttonStyles.primary, { width: '100%', marginBottom: 16 }]}
          onPress={handleGetStarted}
        >
          <Text style={commonStyles.buttonTextWhite}>Loslegen</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[buttonStyles.outline, { width: '100%' }]}
          onPress={handleLogin}
        >
          <Text style={[commonStyles.buttonText, { color: colors.primary }]}>Anmelden</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
