
import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import QRCodeDisplay from '../../components/QRCodeDisplay';
import Icon from '../../components/Icon';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import { useAuth } from '../../hooks/useAuth';

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

  console.log('ProfileScreen: Auth state - loading:', authLoading, 'user:', user?.email || 'No user');

  useEffect(() => {
    if (!authLoading && user) {
      console.log('ProfileScreen: Fetching profile for user:', user.id);
      fetchProfile();
    } else if (!authLoading && !user) {
      console.log('ProfileScreen: No user, stopping loading');
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchProfile = async () => {
    if (!user) {
      console.log('ProfileScreen: No user to fetch profile for');
      setLoading(false);
      return;
    }

    try {
      console.log('ProfileScreen: Fetching profile from database');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('ProfileScreen: Error fetching profile:', error);
        // If profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          console.log('ProfileScreen: Profile not found, creating one');
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              first_name: user.user_metadata?.first_name || null,
              last_name: user.user_metadata?.last_name || null,
            });

          if (insertError) {
            console.error('ProfileScreen: Error creating profile:', insertError);
          } else {
            console.log('ProfileScreen: Profile created, fetching again');
            fetchProfile();
            return;
          }
        }
      } else {
        console.log('ProfileScreen: Profile fetched successfully');
        setProfile(data);
      }
    } catch (error) {
      console.error('ProfileScreen: Unexpected error:', error);
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
              console.log('ProfileScreen: Logging out user');
              await signOut();
              console.log('ProfileScreen: Logout successful');
              router.replace('/');
            } catch (error) {
              console.error('ProfileScreen: Logout error:', error);
              Alert.alert('Fehler', 'Beim Abmelden ist ein Fehler aufgetreten.');
            }
          },
        },
      ]
    );
  };

  const handleLogin = () => {
    console.log('ProfileScreen: Navigating to login');
    router.push('/auth/login');
  };

  const handleSignup = () => {
    console.log('ProfileScreen: Navigating to signup');
    router.push('/auth/signup');
  };

  const handleOptionPress = (option: string) => {
    console.log('ProfileScreen: Option pressed:', option);
    Alert.alert('Info', `${option} ist noch nicht verfügbar.`);
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

  // Show loading state
  if (authLoading || loading) {
    return (
      <SafeAreaView style={[commonStyles.container, commonStyles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[commonStyles.text, { marginTop: 16 }]}>
          Lade Profil...
        </Text>
      </SafeAreaView>
    );
  }

  // Show login/signup options if not authenticated
  if (!user) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={commonStyles.centerContent}>
          <Icon name="person-circle" size={80} color={colors.textLight} />
          <Text style={[commonStyles.title, { marginTop: 20, marginBottom: 10 }]}>
            Nicht angemeldet
          </Text>
          <Text style={[commonStyles.text, { textAlign: 'center', marginBottom: 40 }]}>
            Melde dich an oder registriere dich, um dein Profil zu sehen.
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
            <Text style={[commonStyles.buttonText, { color: colors.primary }]}>
              Registrieren
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <Text style={[commonStyles.title, { color: colors.primary }]}>Profil</Text>
        </View>

        {/* Profile Info */}
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          {profile?.avatar_url ? (
            <Image
              source={{ uri: profile.avatar_url }}
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                marginBottom: 16,
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
              <Text style={{ fontSize: 36, fontWeight: 'bold', color: colors.white }}>
                {getInitials()}
              </Text>
            </View>
          )}

          <Text style={[commonStyles.title, { marginBottom: 8 }]}>
            {getDisplayName()}
          </Text>
          
          {profile?.email && (
            <Text style={[commonStyles.textLight, { marginBottom: 16 }]}>
              {profile.email}
            </Text>
          )}

          {/* QR Code */}
          <View style={{ marginBottom: 20 }}>
            <Text style={[commonStyles.text, { textAlign: 'center', marginBottom: 16 }]}>
              Dein QR-Code
            </Text>
            <QRCodeDisplay value={user.id} size={150} />
          </View>
        </View>

        {/* Profile Options */}
        <View style={{ marginBottom: 30 }}>
          {[
            { title: 'Profil bearbeiten', icon: 'create' },
            { title: 'Einstellungen', icon: 'settings' },
            { title: 'Hilfe & Support', icon: 'help-circle' },
            { title: 'Über die App', icon: 'information-circle' },
          ].map((option, index) => (
            <TouchableOpacity
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 16,
                paddingHorizontal: 20,
                backgroundColor: colors.white,
                borderRadius: 12,
                marginBottom: 12,
                ...commonStyles.shadow,
              }}
              onPress={() => handleOptionPress(option.title)}
            >
              <Icon name={option.icon} size={24} color={colors.primary} />
              <Text style={[commonStyles.text, { marginLeft: 16, flex: 1 }]}>
                {option.title}
              </Text>
              <Icon name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[
            buttonStyles.outline,
            { 
              width: '100%', 
              borderColor: colors.error,
              marginBottom: 20,
            }
          ]}
          onPress={handleLogout}
        >
          <Text style={[commonStyles.buttonText, { color: colors.error }]}>
            Abmelden
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
