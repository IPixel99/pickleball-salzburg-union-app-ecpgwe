
import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from '../../components/Icon';

export default function SignupScreen() {
  const router = useRouter();
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

    setIsLoading(true);
    console.log('Signup attempt with:', { 
      ...formData, 
      password: '***', 
      confirmPassword: '***' 
    });

    // TODO: Integrate with Supabase authentication
    // For now, simulate signup process
    setTimeout(() => {
      setIsLoading(false);
      console.log('Signup successful - will integrate with Supabase later');
      Alert.alert(
        'Registrierung erfolgreich!',
        'Dein Konto wurde erstellt. Du kannst dich jetzt anmelden.',
        [
          {
            text: 'OK',
            onPress: () => router.push('/auth/login')
          }
        ]
      );
    }, 2000);
  };

  const handleLogin = () => {
    router.push('/auth/login');
  };

  const handleBack = () => {
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
          <TouchableOpacity onPress={handleBack} style={{ marginRight: 16 }}>
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={commonStyles.title}>Registrieren</Text>
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
              >
                <Text style={[
                  { fontSize: 14, fontWeight: '500' },
                  formData.skillLevel === level
                    ? { color: '#FFFFFF' }
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
            />
            <TouchableOpacity
              style={{
                position: 'absolute',
                right: 16,
                top: 12,
                padding: 4,
              }}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
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
          <TouchableOpacity onPress={handleLogin}>
            <Text style={[commonStyles.textLight, { color: colors.primary, fontWeight: '600' }]}>
              Anmelden
            </Text>
          </TouchableOpacity>
        </View>

        {/* Supabase Integration Note */}
        <View style={[commonStyles.card, { backgroundColor: colors.highlight }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Icon name="information-circle" size={20} color={colors.secondary} style={{ marginRight: 8 }} />
            <Text style={[commonStyles.text, { fontWeight: '600' }]}>Supabase Integration</Text>
          </View>
          <Text style={commonStyles.textLight}>
            Die Registrierung wird später mit Supabase integriert. Derzeit ist dies eine Demo-Version.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
