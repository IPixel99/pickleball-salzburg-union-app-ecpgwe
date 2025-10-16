
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
  const { signIn, resetPassword } = useAuth();
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
      console.log('LoginScreen: Login successful, user:', result.user?.email);
      
      // Mark onboarding as completed
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
      
      // Show success message and redirect
      Alert.alert(
        'Anmeldung erfolgreich!', 
        'Du wurdest erfolgreich angemeldet.',
        [
          { 
            text: 'OK', 
            onPress: () => {
              console.log('LoginScreen: Redirecting to tabs');
              router.replace('/(tabs)');
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('LoginScreen: Login error:', error);
      console.error('LoginScreen: Error details:', JSON.stringify(error, null, 2));
      
      let errorTitle = 'Anmeldung fehlgeschlagen';
      let errorMessage = 'Ein unerwarteter Fehler ist aufgetreten.';
      
      if (error.message) {
        const errorMsg = error.message.toLowerCase();
        
        if (errorMsg.includes('invalid login credentials') || errorMsg.includes('invalid credentials')) {
          errorTitle = 'Anmeldung fehlgeschlagen';
          errorMessage = 'Die E-Mail-Adresse oder das Passwort ist falsch.\n\nMögliche Gründe:\n• Falsche E-Mail oder Passwort\n• E-Mail noch nicht bestätigt\n\nBitte überprüfe deine Anmeldedaten oder bestätige deine E-Mail-Adresse.';
        } else if (errorMsg.includes('email not confirmed')) {
          errorTitle = 'E-Mail nicht bestätigt';
          errorMessage = 'Bitte bestätige deine E-Mail-Adresse, bevor du dich anmeldest.\n\nÜberprüfe dein E-Mail-Postfach (auch den Spam-Ordner) und klicke auf den Bestätigungslink.';
        } else if (errorMsg.includes('too many requests')) {
          errorTitle = 'Zu viele Versuche';
          errorMessage = 'Zu viele Anmeldeversuche. Bitte warte einen Moment und versuche es erneut.';
        } else if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
          errorTitle = 'Verbindungsfehler';
          errorMessage = 'Es konnte keine Verbindung zum Server hergestellt werden. Bitte überprüfe deine Internetverbindung.';
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert(errorTitle, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('E-Mail erforderlich', 'Bitte gib deine E-Mail-Adresse ein, um dein Passwort zurückzusetzen.');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Ungültige E-Mail', 'Bitte gib eine gültige E-Mail-Adresse ein.');
      return;
    }

    try {
      console.log('LoginScreen: Resetting password for:', email.trim());
      await resetPassword(email.trim());
      Alert.alert(
        'Passwort zurücksetzen',
        'Eine E-Mail zum Zurücksetzen deines Passworts wurde an deine E-Mail-Adresse gesendet.\n\nBitte überprüfe auch deinen Spam-Ordner.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('LoginScreen: Password reset error:', error);
      Alert.alert('Fehler', 'Beim Zurücksetzen des Passworts ist ein Fehler aufgetreten. Bitte versuche es später erneut.');
    }
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
            Melde dich mit deinem Konto an
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

            <TouchableOpacity 
              onPress={handleForgotPassword} 
              style={{ alignSelf: 'flex-end', marginTop: 8 }}
              disabled={isLoading}
            >
              <Text style={[commonStyles.textLight, { color: colors.primary }]}>
                Passwort vergessen?
              </Text>
            </TouchableOpacity>
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

          {/* Debug Info (only visible in development) */}
          {__DEV__ && (
            <View style={{ 
              marginTop: 40, 
              padding: 16, 
              backgroundColor: colors.background, 
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border 
            }}>
              <Text style={[commonStyles.textLight, { fontSize: 12, marginBottom: 8 }]}>
                Debug-Info:
              </Text>
              <Text style={[commonStyles.textLight, { fontSize: 10 }]}>
                • Stelle sicher, dass deine E-Mail bestätigt ist{'\n'}
                • Überprüfe Groß-/Kleinschreibung{'\n'}
                • Prüfe auf Leerzeichen vor/nach der E-Mail
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
