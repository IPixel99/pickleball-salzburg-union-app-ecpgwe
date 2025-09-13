
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
        {/* Pickleball Salzburg Union Logo */}
        <Image
          source={require('../assets/images/c0025ffd-25dc-49f5-9153-918105ed49ee.png')}
          style={{
            width: 150,
            height: 150,
            marginBottom: 30,
            resizeMode: 'contain',
          }}
        />

        <Text style={[commonStyles.title, { color: colors.primary }]}>
          Pickleball Salzburg Union
        </Text>
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
