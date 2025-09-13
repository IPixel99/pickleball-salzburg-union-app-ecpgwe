
import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from '../../components/Icon';
import { useAuth } from '../../hooks/useAuth';

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

    setIsLoading(true);
    console.log('Login attempt with:', { email, password: '***' });

    try {
      await signIn(email, password);
      console.log('Login successful');
      Alert.alert('Erfolg', 'Du wurdest erfolgreich angemeldet!', [
        { text: 'OK', onPress: () => router.push('/(tabs)') }
      ]);
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Ein unerwarteter Fehler ist aufgetreten.';
      
      if (error.message) {
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Ungültige Anmeldedaten. Bitte überprüfe deine E-Mail und dein Passwort.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Bitte bestätige deine E-Mail-Adresse, bevor du dich anmeldest.';
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert('Anmeldung fehlgeschlagen', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('E-Mail erforderlich', 'Bitte gib deine E-Mail-Adresse ein, um dein Passwort zurückzusetzen.');
      return;
    }

    try {
      console.log('Resetting password for:', email);
      await resetPassword(email);
      Alert.alert(
        'Passwort zurücksetzen',
        'Eine E-Mail zum Zurücksetzen deines Passworts wurde an deine E-Mail-Adresse gesendet.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Password reset error:', error);
      Alert.alert('Fehler', 'Beim Zurücksetzen des Passworts ist ein Fehler aufgetreten.');
    }
  };

  const handleSignup = () => {
    router.push('/auth/signup');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={commonStyles.container}>
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
          />

          <Text style={[commonStyles.textLight, { marginBottom: 8 }]}>Passwort</Text>
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
            />
            <TouchableOpacity
              style={{
                position: 'absolute',
                right: 16,
                top: 12,
                padding: 4,
              }}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Icon 
                name={showPassword ? "eye-off" : "eye"} 
                size={20} 
                color={colors.textLight} 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleForgotPassword} style={{ alignSelf: 'flex-end', marginTop: 8 }}>
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
          <TouchableOpacity onPress={handleSignup}>
            <Text style={[commonStyles.textLight, { color: colors.primary, fontWeight: '600' }]}>
              Registrieren
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
