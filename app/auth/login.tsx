
import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from '../../components/Icon';

export default function LoginScreen() {
  const router = useRouter();
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

    // TODO: Integrate with Supabase authentication
    // For now, simulate login process
    setTimeout(() => {
      setIsLoading(false);
      console.log('Login successful - will integrate with Supabase later');
      router.push('/(tabs)');
    }, 1500);
  };

  const handleForgotPassword = () => {
    console.log('Forgot password - will integrate with Supabase later');
    Alert.alert(
      'Passwort zurücksetzen',
      'Diese Funktion wird mit Supabase integriert. Du erhältst dann eine E-Mail zum Zurücksetzen deines Passworts.',
      [{ text: 'OK' }]
    );
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
          <Text style={commonStyles.title}>Anmelden</Text>
        </View>

        {/* Logo */}
        <View style={{
          width: 80,
          height: 80,
          backgroundColor: colors.primary,
          borderRadius: 40,
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'center',
          marginBottom: 30,
        }}>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text,
          }}>PSU</Text>
        </View>

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

        {/* Supabase Integration Note */}
        <View style={[commonStyles.card, { marginTop: 30, backgroundColor: colors.highlight }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Icon name="information-circle" size={20} color={colors.secondary} style={{ marginRight: 8 }} />
            <Text style={[commonStyles.text, { fontWeight: '600' }]}>Supabase Integration</Text>
          </View>
          <Text style={commonStyles.textLight}>
            Die Authentifizierung wird später mit Supabase integriert. Derzeit ist dies eine Demo-Version.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
