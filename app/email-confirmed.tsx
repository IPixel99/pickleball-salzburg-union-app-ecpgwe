
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import Icon from '../components/Icon';
import { supabase } from '../lib/supabase';

export default function EmailConfirmedScreen() {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    checkEmailVerification();
  }, []);

  const checkEmailVerification = async () => {
    try {
      console.log('EmailConfirmedScreen: Checking email verification status');
      
      // Get the current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('EmailConfirmedScreen: Error getting session:', error);
        setErrorMessage('Fehler beim Überprüfen der E-Mail-Bestätigung.');
        setIsVerifying(false);
        return;
      }

      if (session && session.user) {
        console.log('EmailConfirmedScreen: User session found:', session.user.email);
        console.log('EmailConfirmedScreen: Email confirmed at:', session.user.email_confirmed_at);
        
        if (session.user.email_confirmed_at) {
          setIsVerified(true);
        } else {
          setErrorMessage('Deine E-Mail-Adresse wurde noch nicht bestätigt.');
        }
      } else {
        console.log('EmailConfirmedScreen: No active session found');
        setErrorMessage('Keine aktive Sitzung gefunden. Bitte melde dich an.');
      }
    } catch (error) {
      console.error('EmailConfirmedScreen: Unexpected error:', error);
      setErrorMessage('Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleContinue = () => {
    if (isVerified) {
      console.log('EmailConfirmedScreen: Redirecting to tabs');
      router.replace('/(tabs)');
    } else {
      console.log('EmailConfirmedScreen: Redirecting to login');
      router.replace('/auth/login');
    }
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={[commonStyles.content, { justifyContent: 'center', alignItems: 'center' }]}>
        {/* Logo */}
        <Image
          source={require('../assets/images/c0025ffd-25dc-49f5-9153-918105ed49ee.png')}
          style={{
            width: 100,
            height: 100,
            marginBottom: 40,
            resizeMode: 'contain',
          }}
        />

        {isVerifying ? (
          <>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[commonStyles.text, { marginTop: 20, textAlign: 'center' }]}>
              E-Mail-Bestätigung wird überprüft...
            </Text>
          </>
        ) : isVerified ? (
          <>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: colors.success + '20',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 30,
            }}>
              <Icon name="checkmark-circle" size={50} color={colors.success} />
            </View>
            
            <Text style={[commonStyles.title, { textAlign: 'center', marginBottom: 16 }]}>
              E-Mail bestätigt!
            </Text>
            
            <Text style={[commonStyles.text, { textAlign: 'center', marginBottom: 40 }]}>
              Deine E-Mail-Adresse wurde erfolgreich bestätigt. Du kannst dich jetzt anmelden und die App nutzen.
            </Text>

            <TouchableOpacity
              style={[buttonStyles.primary, { width: '100%' }]}
              onPress={handleContinue}
            >
              <Text style={commonStyles.buttonTextWhite}>
                Zur App
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: colors.error + '20',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 30,
            }}>
              <Icon name="alert-circle" size={50} color={colors.error} />
            </View>
            
            <Text style={[commonStyles.title, { textAlign: 'center', marginBottom: 16 }]}>
              Bestätigung fehlgeschlagen
            </Text>
            
            <Text style={[commonStyles.text, { textAlign: 'center', marginBottom: 40 }]}>
              {errorMessage || 'Die E-Mail-Bestätigung konnte nicht abgeschlossen werden.'}
            </Text>

            <TouchableOpacity
              style={[buttonStyles.primary, { width: '100%', marginBottom: 12 }]}
              onPress={checkEmailVerification}
            >
              <Text style={commonStyles.buttonTextWhite}>
                Erneut versuchen
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[buttonStyles.secondary, { width: '100%' }]}
              onPress={handleContinue}
            >
              <Text style={[commonStyles.text, { color: colors.primary }]}>
                Zur Anmeldung
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
