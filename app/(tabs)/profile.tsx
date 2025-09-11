
import React, { useState } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from '../../components/Icon';

export default function ProfileScreen() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Will be managed by Supabase later

  // Mock user data - will be replaced with Supabase data later
  const userData = {
    name: 'Max Mustermann',
    email: 'max.mustermann@email.com',
    memberSince: '2023-06-15',
    skillLevel: 'Fortgeschritten',
    eventsAttended: 12,
    favoritePosition: 'Doppel',
  };

  const profileOptions = [
    { title: 'Persönliche Daten', subtitle: 'Name, E-Mail, Telefon', icon: 'person' as const },
    { title: 'Spielstatistiken', subtitle: 'Deine Leistungen im Überblick', icon: 'stats-chart' as const },
    { title: 'Event-Verlauf', subtitle: 'Vergangene Teilnahmen', icon: 'time' as const },
    { title: 'Einstellungen', subtitle: 'App-Einstellungen', icon: 'settings' as const },
    { title: 'Hilfe & Support', subtitle: 'FAQ und Kontakt', icon: 'help-circle' as const },
  ];

  const handleLogin = () => {
    console.log('Navigating to login - will integrate with Supabase later');
    router.push('/auth/login');
  };

  const handleSignup = () => {
    console.log('Navigating to signup - will integrate with Supabase later');
    router.push('/auth/signup');
  };

  const handleLogout = () => {
    Alert.alert(
      'Abmelden',
      'Möchtest du dich wirklich abmelden?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        { 
          text: 'Abmelden', 
          style: 'destructive',
          onPress: () => {
            console.log('Logging out - will integrate with Supabase later');
            setIsLoggedIn(false);
            // TODO: Integrate with Supabase logout
          }
        },
      ]
    );
  };

  const handleOptionPress = (option: string) => {
    console.log(`Selected option: ${option} - will implement navigation later`);
    // TODO: Navigate to specific screens based on option
  };

  if (!isLoggedIn) {
    // Not logged in view
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={commonStyles.centerContent}>
          {/* Profile Icon */}
          <View style={{
            width: 100,
            height: 100,
            backgroundColor: colors.backgroundAlt,
            borderRadius: 50,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 30,
          }}>
            <Icon name="person" size={48} color={colors.textLight} />
          </View>

          <Text style={commonStyles.title}>Willkommen!</Text>
          <Text style={[commonStyles.text, { textAlign: 'center', marginBottom: 40 }]}>
            Melde dich an oder erstelle ein Konto, um alle Funktionen der App zu nutzen.
          </Text>

          <TouchableOpacity
            style={[buttonStyles.primary, { width: '100%', marginBottom: 16 }]}
            onPress={handleLogin}
          >
            <Text style={commonStyles.buttonTextWhite}>Anmelden</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[buttonStyles.outline, { width: '100%' }]}
            onPress={handleSignup}
          >
            <Text style={[commonStyles.buttonText, { color: colors.primary }]}>Registrieren</Text>
          </TouchableOpacity>

          {/* Temporary login button for testing */}
          <TouchableOpacity
            style={[buttonStyles.secondary, { width: '100%', marginTop: 20 }]}
            onPress={() => setIsLoggedIn(true)}
          >
            <Text style={commonStyles.buttonTextWhite}>Demo Login (Test)</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Logged in view
  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={[commonStyles.card, { alignItems: 'center', marginBottom: 20 }]}>
          <View style={{
            width: 80,
            height: 80,
            backgroundColor: colors.primary,
            borderRadius: 40,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' }}>
              {userData.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
          <Text style={[commonStyles.text, { fontWeight: '600', fontSize: 18, marginBottom: 4 }]}>
            {userData.name}
          </Text>
          <Text style={commonStyles.textLight}>{userData.email}</Text>
        </View>

        {/* Stats Cards */}
        <View style={{ flexDirection: 'row', marginBottom: 20 }}>
          <View style={[commonStyles.card, { flex: 1, marginRight: 8, alignItems: 'center' }]}>
            <Text style={[commonStyles.text, { fontWeight: '600', fontSize: 20, color: colors.primary }]}>
              {userData.eventsAttended}
            </Text>
            <Text style={commonStyles.textLight}>Events</Text>
          </View>
          <View style={[commonStyles.card, { flex: 1, marginLeft: 8, alignItems: 'center' }]}>
            <Text style={[commonStyles.text, { fontWeight: '600', fontSize: 20, color: colors.primary }]}>
              {new Date().getFullYear() - new Date(userData.memberSince).getFullYear()}
            </Text>
            <Text style={commonStyles.textLight}>Jahre</Text>
          </View>
        </View>

        {/* Profile Info */}
        <View style={commonStyles.section}>
          <Text style={commonStyles.subtitle}>Profil Informationen</Text>
          <View style={commonStyles.card}>
            <View style={{ marginBottom: 16 }}>
              <Text style={commonStyles.textLight}>Mitglied seit</Text>
              <Text style={commonStyles.text}>
                {new Date(userData.memberSince).toLocaleDateString('de-DE', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
            </View>
            <View style={{ marginBottom: 16 }}>
              <Text style={commonStyles.textLight}>Spielstärke</Text>
              <Text style={commonStyles.text}>{userData.skillLevel}</Text>
            </View>
            <View>
              <Text style={commonStyles.textLight}>Bevorzugte Position</Text>
              <Text style={commonStyles.text}>{userData.favoritePosition}</Text>
            </View>
          </View>
        </View>

        {/* Profile Options */}
        <View style={commonStyles.section}>
          <Text style={commonStyles.subtitle}>Optionen</Text>
          {profileOptions.map((option, index) => (
            <TouchableOpacity 
              key={index} 
              style={commonStyles.card}
              onPress={() => handleOptionPress(option.title)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 40,
                  height: 40,
                  backgroundColor: colors.backgroundAlt,
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16,
                }}>
                  <Icon name={option.icon} size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 4 }]}>
                    {option.title}
                  </Text>
                  <Text style={commonStyles.textLight}>{option.subtitle}</Text>
                </View>
                <Icon name="chevron-forward" size={20} color={colors.textLight} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[buttonStyles.outline, { borderColor: colors.error, marginBottom: 20 }]}
          onPress={handleLogout}
        >
          <Text style={[commonStyles.buttonText, { color: colors.error }]}>Abmelden</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
