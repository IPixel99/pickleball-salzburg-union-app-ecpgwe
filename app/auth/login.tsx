
import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from '../../components/Icon';
import { useAuth } from '../../hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_COMPLETED_KEY = 'onboarding_completed';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Fehler', 'Bitte fülle alle Felder aus.');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Ungültige E-Mail', 'Bitte gib eine gültige E-Mail-Adresse ein.');
      return;
    }

    setIsLoading(true);
    console.log('LoginScreen: Attempting login for:', email.trim());

    try {
      const result = await signIn(email.trim(), password);
      
      console.log('LoginScreen: Login successful');
      
      // Mark onboarding as completed
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
      
      // Navigate to home
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('LoginScreen: Login error:', error);
      console.error('LoginScreen: Error details:', JSON.stringify(error, null, 2));
      
      let errorTitle = 'Anmeldung fehlgeschlagen';
      let errorMessage = 'Ein unerwarteter Fehler ist aufgetreten.';
      
      if (error.message) {
        const errorMsg = error.message.toLowerCase();
        
        if (errorMsg.includes('email not confirmed')) {
          errorTitle = 'E-Mail nicht bestätigt';
          errorMessage = '📧 Bitte bestätige zuerst deine E-Mail-Adresse!\n\nWir haben dir eine Bestätigungs-E-Mail gesendet. Bitte:\n\n1. Öffne dein E-Mail-Postfach\n2. Suche nach der Bestätigungs-E-Mail (auch im Spam-Ordner)\n3. Klicke auf den Bestätigungslink\n4. Versuche es dann erneut';
        } else if (errorMsg.includes('invalid login credentials') || 
                   errorMsg.includes('invalid credentials') ||
                   errorMsg.includes('wrong password') ||
                   errorMsg.includes('user not found')) {
          errorTitle = 'Falsche Anmeldedaten';
          errorMessage = 'Die E-Mail-Adresse oder das Passwort ist falsch.\n\nBitte überprüfe deine Eingaben und versuche es erneut.';
        } else if (errorMsg.includes('email')) {
          errorTitle = 'Ungültige E-Mail';
          errorMessage = 'Bitte gib eine gültige E-Mail-Adresse ein.';
        } else if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
          errorTitle = 'Verbindungsfehler';
          errorMessage = 'Es konnte keine Verbindung zum Server hergestellt werden.\n\nBitte überprüfe deine Internetverbindung und versuche es erneut.';
        } else if (errorMsg.includes('too many requests')) {
          errorTitle = 'Zu viele Versuche';
          errorMessage = 'Du hast zu viele Anmeldeversuche gemacht.\n\nBitte warte ein paar Minuten und versuche es dann erneut.';
        } else {
          // Show the actual error message if we don't have a specific handler
          errorMessage = error.message;
        }
      }
      
      Alert.alert(errorTitle, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    console.log('LoginScreen: Forgot password pressed');
    Alert.alert(
      'Passwort vergessen?',
      'Bitte kontaktiere den Administrator, um dein Passwort zurückzusetzen.',
      [{ text: 'OK' }]
    );
  };

  const handleSignup = () => {
    console.log('LoginScreen: Navigating to signup');
    router.push('/auth/signup');
  };

  const handleBack = () => {
    console.log('LoginScreen: Going back to onboarding');
    router.push('/onboarding');
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={commonStyles.content}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 30 }}>
            <TouchableOpacity onPress={handleBack} style={{ marginRight: 16 }}>
              <Icon name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[commonStyles.title, { color: colors.primary }]}>Anmelden</Text>
          </View>

          {/* Logo */}
          <Image
            source={require('../../assets/images/c0025ffd-25dc-49f5-9153-918105ed49ee.png')}
            style={{
              width: 80,
              height: 80,
              alignSelf: 'center',
              marginBottom: 30,
              resizeMode: 'contain',
            }}
          />

          <Text style={[commonStyles.text, { textAlign: 'center', marginBottom: 30 }]}>
            Willkommen zurück!
          </Text>

          {/* Login Form */}
          <View style={{ marginBottom: 30 }}>
            <Text style={[commonStyles.textLight, { marginBottom: 8 }]}>E-Mail</Text>
            <TextInput
              style={commonStyles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="deine@email.com"
              placeholderTextColor={colors.textLight}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
              autoComplete="email"
            />

            <Text style={[commonStyles.textLight, { marginBottom: 8, marginTop: 16 }]}>Passwort</Text>
            <View style={{ position: 'relative' }}>
              <TextInput
                style={commonStyles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Dein Passwort"
                placeholderTextColor={colors.textLight}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                autoComplete="password"
              />
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  right: 16,
                  top: 12,
                  padding: 4,
                }}
                onPress={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                <Icon 
                  name={showPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color={colors.textLight} 
                />
              </TouchableOpacity>
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity 
              onPress={handleForgotPassword} 
              style={{ alignSelf: 'flex-end', marginTop: 8 }}
              disabled={isLoading}
            >
              <Text style={[commonStyles.textLight, { color: colors.primary, fontSize: 14 }]}>
                Passwort vergessen?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Important Notice */}
          <View style={{
            backgroundColor: colors.primary + '20',
            padding: 16,
            borderRadius: 8,
            marginBottom: 20,
            borderLeftWidth: 4,
            borderLeftColor: colors.primary,
          }}>
            <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
              📧 E-Mail-Bestätigung erforderlich
            </Text>
            <Text style={[commonStyles.textLight, { fontSize: 14 }]}>
              Falls du dich gerade registriert hast, musst du zuerst deine E-Mail-Adresse bestätigen, bevor du dich anmelden kannst.
            </Text>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[
              buttonStyles.primary,
              { width: '100%', marginBottom: 20 },
              isLoading && { backgroundColor: colors.textLight }
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={commonStyles.buttonTextWhite}>
              {isLoading ? 'Anmelden...' : 'Anmelden'}
            </Text>
          </TouchableOpacity>

          {/* Signup Link */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={commonStyles.textLight}>Noch kein Konto? </Text>
            <TouchableOpacity onPress={handleSignup} disabled={isLoading}>
              <Text style={[commonStyles.textLight, { color: colors.primary, fontWeight: '600' }]}>
                Registrieren
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
