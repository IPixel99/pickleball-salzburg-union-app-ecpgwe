
import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from '../../components/Icon';
import QRCodeDisplay from '../../components/QRCodeDisplay';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

interface Profile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const profileOptions = [
    { title: 'Persönliche Daten', subtitle: 'Name, E-Mail, Telefon', icon: 'person' as const },
    { title: 'Spielstatistiken', subtitle: 'Deine Leistungen im Überblick', icon: 'stats-chart' as const },
    { title: 'Event-Verlauf', subtitle: 'Vergangene Teilnahmen', icon: 'time' as const },
    { title: 'Einstellungen', subtitle: 'App-Einstellungen', icon: 'settings' as const },
    { title: 'Hilfe & Support', subtitle: 'FAQ und Kontakt', icon: 'help-circle' as const },
  ];

  const fetchProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching profile for user:', user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      console.log('Fetched profile:', data);
      setProfile(data);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchProfile();
    }
  }, [user, authLoading]);

  const handleLogin = () => {
    console.log('Navigating to login');
    router.push('/auth/login');
  };

  const handleSignup = () => {
    console.log('Navigating to signup');
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
          onPress: async () => {
            try {
              console.log('Logging out user');
              await signOut();
              Alert.alert('Erfolg', 'Du wurdest erfolgreich abgemeldet.');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Fehler', 'Beim Abmelden ist ein Fehler aufgetreten.');
            }
          }
        },
      ]
    );
  };

  const handleOptionPress = (option: string) => {
    console.log(`Selected option: ${option}`);
    Alert.alert('Funktion', `${option} wird bald verfügbar sein!`);
  };

  const getDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile?.first_name) {
      return profile.first_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Benutzer';
  };

  const getInitials = () => {
    const name = getDisplayName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (authLoading || loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={commonStyles.centerContent}>
          <Text style={commonStyles.text}>Profil wird geladen...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    // Not logged in view
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={commonStyles.centerContent}>
          {/* Logo */}
          <Image
            source={require('../../assets/images/c0025ffd-25dc-49f5-9153-918105ed49ee.png')}
            style={{
              width: 100,
              height: 100,
              marginBottom: 30,
              resizeMode: 'contain',
            }}
          />

          <Text style={[commonStyles.title, { color: colors.primary }]}>Willkommen!</Text>
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
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.white }}>
              {getInitials()}
            </Text>
          </View>
          <Text style={[commonStyles.text, { fontWeight: '600', fontSize: 18, marginBottom: 4 }]}>
            {getDisplayName()}
          </Text>
          <Text style={commonStyles.textLight}>{user.email}</Text>
          {profile?.created_at && (
            <Text style={[commonStyles.textLight, { fontSize: 12, marginTop: 4 }]}>
              Mitglied seit {new Date(profile.created_at).toLocaleDateString('de-DE', { 
                year: 'numeric', 
                month: 'long' 
              })}
            </Text>
          )}
        </View>

        {/* QR Code Section */}
        <View style={[commonStyles.card, { alignItems: 'center', marginBottom: 20, backgroundColor: colors.highlight }]}>
          <QRCodeDisplay userId={user.id} size={150} showLabel={true} />
        </View>

        {/* Profile Options */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.subtitle, { color: colors.primary }]}>Optionen</Text>
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
                  backgroundColor: colors.yellow,
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16,
                }}>
                  <Icon name={option.icon} size={20} color={colors.red} />
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
