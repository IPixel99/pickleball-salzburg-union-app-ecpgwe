
import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from '../../components/Icon';
import { useAuth } from '../../hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_COMPLETED_KEY = 'onboarding_completed';

export default function SignupScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignup = async () => {
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      Alert.alert('Fehler', 'Bitte fülle alle Felder aus.');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      Alert.alert('Ungültige E-Mail', 'Bitte gib eine gültige E-Mail-Adresse ein.');
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      Alert.alert('Passwort zu kurz', 'Das Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Fehler', 'Die Passwörter stimmen nicht überein.');
      return;
    }

    setIsLoading(true);
    console.log('SignupScreen: Attempting signup for:', formData.email.trim());

    try {
      const result = await signUp(
        formData.email.trim(),
        formData.password,
        formData.firstName.trim(),
        formData.lastName.trim()
      );

      console.log('SignupScreen: Signup successful');
      
      // Mark onboarding as completed
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');

      // Show success message with email confirmation instructions
      Alert.alert(
        'Registrierung erfolgreich!',
        'Dein Konto wurde erstellt.\n\n📧 WICHTIG: Bitte bestätige deine E-Mail-Adresse!\n\nWir haben dir eine Bestätigungs-E-Mail an ' + formData.email + ' gesendet.\n\nBitte:\n1. Öffne dein E-Mail-Postfach\n2. Suche nach der Bestätigungs-E-Mail (auch im Spam-Ordner)\n3. Klicke auf den Bestätigungslink\n4. Danach kannst du dich anmelden',
        [
          {
            text: 'Verstanden',
            onPress: () => {
              console.log('SignupScreen: Redirecting to login');
              router.replace('/auth/login');
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('SignupScreen: Signup error:', error);
      console.error('SignupScreen: Error details:', JSON.stringify(error, null, 2));
      
      let errorTitle = 'Registrierung fehlgeschlagen';
      let errorMessage = 'Ein unerwarteter Fehler ist aufgetreten.';
      
      if (error.message) {
        const errorMsg = error.message.toLowerCase();
        
        if (errorMsg.includes('user already registered') || errorMsg.includes('already exists')) {
          errorTitle = 'E-Mail bereits registriert';
          errorMessage = 'Diese E-Mail-Adresse ist bereits registriert.\n\nBitte melde dich an oder verwende eine andere E-Mail-Adresse.';
        } else if (errorMsg.includes('password')) {
          errorTitle = 'Ungültiges Passwort';
          errorMessage = 'Das Passwort erfüllt nicht die Anforderungen. Es muss mindestens 6 Zeichen lang sein.';
        } else if (errorMsg.includes('email')) {
          errorTitle = 'Ungültige E-Mail';
          errorMessage = 'Bitte gib eine gültige E-Mail-Adresse ein.';
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

  const handleLogin = () => {
    console.log('SignupScreen: Navigating to login');
    router.push('/auth/login');
  };

  const handleBack = () => {
    console.log('SignupScreen: Going back to onboarding');
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
            <Text style={[commonStyles.title, { color: colors.primary }]}>Registrieren</Text>
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
            Erstelle dein Konto
          </Text>

          {/* Signup Form */}
          <View style={{ marginBottom: 30 }}>
            <Text style={[commonStyles.textLight, { marginBottom: 8 }]}>Vorname</Text>
            <TextInput
              style={commonStyles.input}
              value={formData.firstName}
              onChangeText={(value) => updateFormData('firstName', value)}
              placeholder="Max"
              placeholderTextColor={colors.textLight}
              autoCapitalize="words"
              editable={!isLoading}
              autoComplete="given-name"
            />

            <Text style={[commonStyles.textLight, { marginBottom: 8, marginTop: 16 }]}>Nachname</Text>
            <TextInput
              style={commonStyles.input}
              value={formData.lastName}
              onChangeText={(value) => updateFormData('lastName', value)}
              placeholder="Mustermann"
              placeholderTextColor={colors.textLight}
              autoCapitalize="words"
              editable={!isLoading}
              autoComplete="family-name"
            />

            <Text style={[commonStyles.textLight, { marginBottom: 8, marginTop: 16 }]}>E-Mail</Text>
            <TextInput
              style={commonStyles.input}
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
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
                value={formData.password}
                onChangeText={(value) => updateFormData('password', value)}
                placeholder="Mindestens 6 Zeichen"
                placeholderTextColor={colors.textLight}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                autoComplete="password-new"
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

            <Text style={[commonStyles.textLight, { marginBottom: 8, marginTop: 16 }]}>Passwort bestätigen</Text>
            <View style={{ position: 'relative' }}>
              <TextInput
                style={commonStyles.input}
                value={formData.confirmPassword}
                onChangeText={(value) => updateFormData('confirmPassword', value)}
                placeholder="Passwort wiederholen"
                placeholderTextColor={colors.textLight}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                autoComplete="password-new"
              />
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  right: 16,
                  top: 12,
                  padding: 4,
                }}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                <Icon 
                  name={showConfirmPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color={colors.textLight} 
                />
              </TouchableOpacity>
            </View>
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
              📧 Wichtig: E-Mail-Bestätigung
            </Text>
            <Text style={[commonStyles.textLight, { fontSize: 14 }]}>
              Nach der Registrierung erhältst du eine Bestätigungs-E-Mail. Du musst deine E-Mail-Adresse bestätigen, bevor du dich anmelden kannst.
            </Text>
          </View>

          {/* Signup Button */}
          <TouchableOpacity
            style={[
              buttonStyles.primary,
              { width: '100%', marginBottom: 20 },
              isLoading && { backgroundColor: colors.textLight }
            ]}
            onPress={handleSignup}
            disabled={isLoading}
          >
            <Text style={commonStyles.buttonTextWhite}>
              {isLoading ? 'Registrieren...' : 'Registrieren'}
            </Text>
          </TouchableOpacity>

          {/* Login Link */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={commonStyles.textLight}>Bereits ein Konto? </Text>
            <TouchableOpacity onPress={handleLogin} disabled={isLoading}>
              <Text style={[commonStyles.textLight, { color: colors.primary, fontWeight: '600' }]}>
                Anmelden
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
