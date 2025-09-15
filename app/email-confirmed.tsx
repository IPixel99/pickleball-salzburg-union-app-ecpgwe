
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import Icon from '../components/Icon';

export default function EmailConfirmedScreen() {
  const router = useRouter();

  useEffect(() => {
    console.log('EmailConfirmedScreen: Email confirmation page loaded');
  }, []);

  const handleContinue = () => {
    console.log('EmailConfirmedScreen: Continuing to login');
    router.replace('/auth/login');
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={[commonStyles.content, { justifyContent: 'center', alignItems: 'center' }]}>
        {/* Success Icon */}
        <View style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: colors.success,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 30,
        }}>
          <Icon name="checkmark" size={40} color={colors.white} />
        </View>

        {/* Title */}
        <Text style={[commonStyles.title, { textAlign: 'center', marginBottom: 20 }]}>
          E-Mail bestätigt!
        </Text>

        {/* Description */}
        <Text style={[commonStyles.text, { textAlign: 'center', marginBottom: 40, paddingHorizontal: 20 }]}>
          Deine E-Mail-Adresse wurde erfolgreich bestätigt. Du kannst dich jetzt mit deinem Konto anmelden.
        </Text>

        {/* Logo */}
        <Image
          source={require('../assets/images/c0025ffd-25dc-49f5-9153-918105ed49ee.png')}
          style={{
            width: 60,
            height: 60,
            marginBottom: 40,
            resizeMode: 'contain',
          }}
        />

        {/* Continue Button */}
        <TouchableOpacity
          style={[buttonStyles.primary, { width: '100%', maxWidth: 300 }]}
          onPress={handleContinue}
        >
          <Text style={commonStyles.buttonTextWhite}>
            Zur Anmeldung
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
