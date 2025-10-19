
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';
import { useAuth } from '../hooks/useAuth';
import Icon from '../components/Icon';

export default function EmailConfirmedScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    console.log('EmailConfirmedScreen: Mounted, user:', user?.email, 'loading:', loading);

    // Wait for auth to load
    if (loading) {
      return;
    }

    // If user is authenticated, redirect to home after countdown
    if (user) {
      console.log('EmailConfirmedScreen: User authenticated, starting countdown');
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            console.log('EmailConfirmedScreen: Redirecting to home');
            router.replace('/(tabs)');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    } else {
      // If no user after loading, redirect to login
      console.log('EmailConfirmedScreen: No user found, redirecting to login');
      setTimeout(() => {
        router.replace('/auth/login');
      }, 2000);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <SafeAreaView style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[commonStyles.text, { marginTop: 20 }]}>Lade...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
      <View style={{ alignItems: 'center', padding: 20 }}>
        {/* Success Icon */}
        <View style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: colors.primary + '20',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 30,
        }}>
          <Icon name="checkmark-circle" size={60} color={colors.primary} />
        </View>

        {/* Logo */}
        <Image
          source={require('../assets/images/c0025ffd-25dc-49f5-9153-918105ed49ee.png')}
          style={{
            width: 80,
            height: 80,
            marginBottom: 20,
            resizeMode: 'contain',
          }}
        />

        {user ? (
          <>
            <Text style={[commonStyles.title, { textAlign: 'center', marginBottom: 16, color: colors.primary }]}>
              E-Mail bestätigt! ✓
            </Text>
            <Text style={[commonStyles.text, { textAlign: 'center', marginBottom: 30 }]}>
              Deine E-Mail-Adresse wurde erfolgreich bestätigt.
            </Text>
            <Text style={[commonStyles.textLight, { textAlign: 'center', fontSize: 16 }]}>
              Du wirst in {countdown} Sekunden weitergeleitet...
            </Text>
          </>
        ) : (
          <>
            <Text style={[commonStyles.title, { textAlign: 'center', marginBottom: 16, color: colors.primary }]}>
              E-Mail bestätigt! ✓
            </Text>
            <Text style={[commonStyles.text, { textAlign: 'center', marginBottom: 30 }]}>
              Deine E-Mail-Adresse wurde erfolgreich bestätigt.
            </Text>
            <Text style={[commonStyles.textLight, { textAlign: 'center', fontSize: 16 }]}>
              Du kannst dich jetzt anmelden...
            </Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
