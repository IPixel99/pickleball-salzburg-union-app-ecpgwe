
import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from '../../components/Icon';
import { useAuth } from '../../hooks/useAuth';

export default function SignupScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    skillLevel: 'Anfänger',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const skillLevels = ['Anfänger', 'Fortgeschritten', 'Experte'];

  const handleSignup = async () => {
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      Alert.alert('Fehler', 'Bitte fülle alle Pflichtfelder aus.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Fehler', 'Die Passwörter stimmen nicht überein.');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Fehler', 'Das Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Fehler', 'Bitte gib eine gültige E-Mail-Adresse ein.');
      return;
    }

    setIsLoading(true);
    console.log('SignupScreen: Attempting signup for:', formData.email);

    try {
      const result = await signUp(formData.email, formData.password, formData.firstName, formData.lastName);
      console.log('SignupScreen: Signup successful');
      
      Alert.alert(
        'Registrierung erfolgreich!',
        'Dein Konto wurde erstellt. Bitte überprüfe deine E-Mails und bestätige deine E-Mail-Adresse, bevor du dich anmeldest.',
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('SignupScreen: Redirecting to login');
              router.replace('/auth/login');
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('SignupScreen: Signup error:', error);
      let errorMessage = 'Ein unerwarteter Fehler ist aufgetreten.';
      
      if (error.message) {
        if (error.message.includes('User already registered')) {
          errorMessage = 'Ein Benutzer mit dieser E-Mail-Adresse existiert bereits.';
        } else if (error.message.includes('Password should be at least 6 characters')) {
          errorMessage = 'Das Passwort muss mindestens 6 Zeichen lang sein.';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Bitte gib eine gültige E-Mail-Adresse ein.';
        } else if (error.message.includes('Signup is disabled')) {
          errorMessage = 'Die Registrierung ist derzeit deaktiviert. Bitte kontaktiere den Administrator.';
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert('Registrierung fehlgeschlagen', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    console.log('SignupScreen: Navigating to login');
    router.push('/auth/login');
  };

  const handleBack = () => {
    console.log('SignupScreen: Going back');
    router.back();
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 30 }}>
          <TouchableOpacity onPress={handleBack} style={{ marginRight: 16 }} disabled={isLoading}>
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
          Erstelle dein Konto für den Pickleball Salzburg Union
        </Text>

        {/* Signup Form */}
        <View style={{ marginBottom: 30 }}>
          {/* Name Fields */}
          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={[commonStyles.textLight, { marginBottom: 8 }]}>Vorname *</Text>
              <TextInput
                style={commonStyles.input}
                value={formData.firstName}
                onChangeText={(value) => updateFormData('firstName', value)}
                placeholder="Max"
                placeholderTextColor={colors.textLight}
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={[commonStyles.textLight, { marginBottom: 8 }]}>Nachname *</Text>
              <TextInput
                style={commonStyles.input}
                value={formData.lastName}
                onChangeText={(value) => updateFormData('lastName', value)}
                placeholder="Mustermann"
                placeholderTextColor={colors.textLight}
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Email */}
          <Text style={[commonStyles.textLight, { marginBottom: 8 }]}>E-Mail *</Text>
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
          />

          {/* Phone */}
          <Text style={[commonStyles.textLight, { marginBottom: 8 }]}>Telefon (optional)</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.phone}
            onChangeText={(value) => updateFormData('phone', value)}
            placeholder="+43 123 456 7890"
            placeholderTextColor={colors.textLight}
            keyboardType="phone-pad"
            editable={!isLoading}
          />

          {/* Skill Level */}
          <Text style={[commonStyles.textLight, { marginBottom: 8 }]}>Spielstärke</Text>
          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            {skillLevels.map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  {
                    flex: 1,
                    paddingVertical: 12,
                    paddingHorizontal: 8,
                    borderRadius: 8,
                    borderWidth: 1,
                    marginHorizontal: 4,
                    alignItems: 'center',
                  },
                  formData.skillLevel === level
                    ? { backgroundColor: colors.primary, borderColor: colors.primary }
                    : { backgroundColor: 'transparent', borderColor: colors.border }
                ]}
                onPress={() => updateFormData('skillLevel', level)}
                disabled={isLoading}
              >
                <Text style={[
                  { fontSize: 14, fontWeight: '500' },
                  formData.skillLevel === level
                    ? { color: colors.white }
                    : { color: colors.text }
                ]}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Password */}
          <Text style={[commonStyles.textLight, { marginBottom: 8 }]}>Passwort *</Text>
          <View style={{ position: 'relative', marginBottom: 16 }}>
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

          {/* Confirm Password */}
          <Text style={[commonStyles.textLight, { marginBottom: 8 }]}>Passwort bestätigen *</Text>
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
            {isLoading ? 'Registrierung läuft...' : 'Registrieren'}
          </Text>
        </TouchableOpacity>

        {/* Login Link */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
          <Text style={commonStyles.textLight}>Bereits ein Konto? </Text>
          <TouchableOpacity onPress={handleLogin} disabled={isLoading}>
            <Text style={[commonStyles.textLight, { color: colors.primary, fontWeight: '600' }]}>
              Anmelden
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
