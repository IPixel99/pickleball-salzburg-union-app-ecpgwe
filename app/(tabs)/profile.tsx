
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Icon from '../../components/Icon';
import { Text, View, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import QRCodeDisplay from '../../components/QRCodeDisplay';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';

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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);

  const { user, signOut } = useAuth();
  const router = useRouter();

  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        fetchProfile();
      } else {
        setIsLoading(false);
      }
    }, [user])
  );

  const fetchProfile = async () => {
    if (!user) return;

    try {
      console.log('Fetching profile for user:', user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating new profile...');
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([
              {
                id: user.id,
                email: user.email,
                first_name: '',
                last_name: '',
                avatar_url: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }
            ])
            .select()
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
          } else {
            console.log('Profile created successfully:', newProfile);
            setProfile(newProfile);
          }
        }
      } else {
        console.log('Profile loaded successfully:', data);
        setProfile(data);
      }
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
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
              await signOut();
              router.replace('/auth/login');
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Fehler', 'Fehler beim Abmelden');
            }
          }
        }
      ]
    );
  };

  const handleLogin = () => {
    router.push('/auth/login');
  };

  const handleSignup = () => {
    router.push('/auth/signup');
  };

  const handleOptionPress = (option: string) => {
    switch (option) {
      case 'edit':
        router.push('/profile/edit');
        break;
      case 'settings':
        router.push('/profile/settings');
        break;
      case 'help':
        router.push('/profile/help');
        break;
      case 'about':
        router.push('/profile/about');
        break;
      case 'qr':
        setShowQR(true);
        break;
      default:
        console.log('Unknown option:', option);
    }
  };

  const getDisplayName = () => {
    if (profile?.first_name || profile?.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    return user?.email || 'Benutzer';
  };

  const getInitials = () => {
    const firstName = profile?.first_name || '';
    const lastName = profile?.last_name || '';
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    return initials || user?.email?.charAt(0).toUpperCase() || '?';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[commonStyles.container, commonStyles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[commonStyles.text, { marginTop: 10 }]}>Lade Profil...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={[commonStyles.content, commonStyles.centered]}>
          <Icon name="user" size={80} color={colors.textSecondary} />
          <Text style={[commonStyles.title, { marginTop: 20, marginBottom: 10 }]}>
            Nicht angemeldet
          </Text>
          <Text style={[commonStyles.text, { textAlign: 'center', marginBottom: 30, color: colors.textSecondary }]}>
            Melde dich an, um dein Profil zu sehen und Events zu verwalten.
          </Text>
          
          <TouchableOpacity style={[buttonStyles.primary, { marginBottom: 15 }]} onPress={handleLogin}>
            <Text style={buttonStyles.primaryText}>Anmelden</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={buttonStyles.secondary} onPress={handleSignup}>
            <Text style={buttonStyles.secondaryText}>Registrieren</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const profileOptions = [
    { id: 'edit', title: 'Profil bearbeiten', icon: 'edit', subtitle: 'Name und Profilbild ändern' },
    { id: 'qr', title: 'QR-Code anzeigen', icon: 'qr-code', subtitle: 'Deinen QR-Code teilen' },
    { id: 'settings', title: 'Einstellungen', icon: 'settings', subtitle: 'App-Einstellungen und Tests' },
    { id: 'help', title: 'Hilfe & Support', icon: 'help-circle', subtitle: 'Häufige Fragen und Kontakt' },
    { id: 'about', title: 'Über die App', icon: 'info', subtitle: 'Version und Informationen' },
  ];

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={[commonStyles.card, { alignItems: 'center', marginBottom: 20 }]}>
          <View style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: colors.surface,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 15,
          }}>
            {profile?.avatar_url ? (
              <Image
                source={{ uri: profile.avatar_url }}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                }}
                onError={(error) => {
                  console.error('Error loading avatar image:', error);
                }}
              />
            ) : (
              <Text style={{
                fontSize: 32,
                fontWeight: 'bold',
                color: colors.primary,
              }}>
                {getInitials()}
              </Text>
            )}
          </View>
          
          <Text style={[commonStyles.title, { marginBottom: 5 }]}>
            {getDisplayName()}
          </Text>
          
          <Text style={[commonStyles.text, { color: colors.textSecondary }]}>
            {user.email}
          </Text>
        </View>

        {/* Profile Options */}
        <View style={commonStyles.card}>
          <Text style={[commonStyles.subtitle, { marginBottom: 20 }]}>
            Profil-Optionen
          </Text>

          {profileOptions.map((option, index) => (
            <TouchableOpacity
              key={option.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 15,
                borderBottomWidth: index < profileOptions.length - 1 ? 1 : 0,
                borderBottomColor: colors.border,
              }}
              onPress={() => handleOptionPress(option.id)}
            >
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.primary + '20',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 15,
              }}>
                <Icon name={option.icon} size={20} color={colors.primary} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                  {option.title}
                </Text>
                <Text style={[commonStyles.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                  {option.subtitle}
                </Text>
              </View>

              <Icon name="chevron-right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[buttonStyles.danger, { margin: 20, marginBottom: 40 }]}
          onPress={handleLogout}
        >
          <Icon name="log-out" size={20} color="white" style={{ marginRight: 10 }} />
          <Text style={buttonStyles.dangerText}>Abmelden</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* QR Code Modal */}
      {showQR && user && (
        <QRCodeDisplay
          visible={showQR}
          onClose={() => setShowQR(false)}
          userId={user.id}
          userName={getDisplayName()}
        />
      )}
    </SafeAreaView>
  );
}
