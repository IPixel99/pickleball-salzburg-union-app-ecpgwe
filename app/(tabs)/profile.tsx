
import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import Icon from '../../components/Icon';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import QRCodeDisplay from '../../components/QRCodeDisplay';

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
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        fetchProfile();
      } else {
        setLoading(false);
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
        // If profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating new profile');
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
          } else {
            console.log('New profile created:', newProfile);
            setProfile(newProfile);
          }
        }
      } else {
        console.log('Profile fetched:', data);
        setProfile(data);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
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
              Alert.alert('Fehler', 'Beim Abmelden ist ein Fehler aufgetreten.');
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
      default:
        console.log('Unknown option:', option);
    }
  };

  const getDisplayName = (): string => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile?.first_name) {
      return profile.first_name;
    }
    if (profile?.email) {
      return profile.email;
    }
    return 'Benutzer';
  };

  const getInitials = (): string => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    if (profile?.first_name) {
      return profile.first_name[0].toUpperCase();
    }
    if (profile?.email) {
      return profile.email[0].toUpperCase();
    }
    return 'U';
  };

  if (loading) {
    return (
      <SafeAreaView style={[commonStyles.container, commonStyles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[commonStyles.text, { marginTop: 16 }]}>
          Profil wird geladen...
        </Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Text style={[commonStyles.title, { color: colors.primary, marginBottom: 30 }]}>
            Profil
          </Text>

          {/* Login Prompt */}
          <View style={[commonStyles.card, { alignItems: 'center', marginBottom: 30 }]}>
            <Icon name="person-circle" size={80} color={colors.textLight} />
            <Text style={[commonStyles.text, { marginTop: 16, marginBottom: 8, textAlign: 'center' }]}>
              Nicht angemeldet
            </Text>
            <Text style={[commonStyles.textLight, { textAlign: 'center', marginBottom: 24 }]}>
              Melde dich an, um dein Profil zu verwalten und alle Funktionen zu nutzen.
            </Text>
            
            <TouchableOpacity
              style={[buttonStyles.primary, { width: '100%', marginBottom: 12 }]}
              onPress={handleLogin}
            >
              <Text style={commonStyles.buttonTextWhite}>Anmelden</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[buttonStyles.secondary, { width: '100%' }]}
              onPress={handleSignup}
            >
              <Text style={commonStyles.buttonText}>Registrieren</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={[commonStyles.title, { color: colors.primary, marginBottom: 30 }]}>
          Profil
        </Text>

        {/* Profile Card */}
        <View style={[commonStyles.card, { alignItems: 'center', marginBottom: 30 }]}>
          {/* Profile Picture */}
          {profile?.avatar_url ? (
            <Image
              source={{ uri: profile.avatar_url }}
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                marginBottom: 16,
                backgroundColor: colors.background,
              }}
              onError={(error) => {
                console.error('Error loading profile avatar:', error);
                // Don't set avatar_url to null here as it might cause infinite re-renders
              }}
            />
          ) : (
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: colors.primary,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Text style={{ fontSize: 40, fontWeight: 'bold', color: colors.white }}>
                {getInitials()}
              </Text>
            </View>
          )}

          {/* Name and Email */}
          <Text style={[commonStyles.text, { fontSize: 20, fontWeight: '600', marginBottom: 4 }]}>
            {getDisplayName()}
          </Text>
          {profile?.email && (
            <Text style={[commonStyles.textLight, { marginBottom: 16 }]}>
              {profile.email}
            </Text>
          )}

          {/* Edit Profile Button */}
          <TouchableOpacity
            style={[buttonStyles.primary, { paddingHorizontal: 24 }]}
            onPress={() => handleOptionPress('edit')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="create" size={18} color={colors.white} />
              <Text style={[commonStyles.buttonTextWhite, { marginLeft: 8 }]}>
                Profil bearbeiten
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* QR Code */}
        <View style={[commonStyles.card, { marginBottom: 30 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Icon name="qr-code" size={24} color={colors.primary} />
            <Text style={[commonStyles.text, { fontWeight: '600', marginLeft: 12 }]}>
              Mein QR-Code
            </Text>
          </View>
          <QRCodeDisplay userId={user.id} />
        </View>

        {/* Menu Options */}
        <View style={[commonStyles.card, { marginBottom: 30 }]}>
          {/* Settings */}
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
            onPress={() => handleOptionPress('settings')}
          >
            <Icon name="settings" size={24} color={colors.text} />
            <Text style={[commonStyles.text, { flex: 1, marginLeft: 16 }]}>
              Einstellungen
            </Text>
            <Icon name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>

          {/* Help */}
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
            onPress={() => handleOptionPress('help')}
          >
            <Icon name="help-circle" size={24} color={colors.text} />
            <Text style={[commonStyles.text, { flex: 1, marginLeft: 16 }]}>
              Hilfe & Support
            </Text>
            <Icon name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>

          {/* About */}
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 16,
            }}
            onPress={() => handleOptionPress('about')}
          >
            <Icon name="information-circle" size={24} color={colors.text} />
            <Text style={[commonStyles.text, { flex: 1, marginLeft: 16 }]}>
              Über die App
            </Text>
            <Icon name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[buttonStyles.secondary, { marginBottom: 30 }]}
          onPress={handleLogout}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="log-out" size={18} color={colors.text} />
            <Text style={[commonStyles.buttonText, { marginLeft: 8 }]}>
              Abmelden
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
