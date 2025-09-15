
import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { commonStyles, colors, buttonStyles, buttonTextStyles } from '../../styles/commonStyles';
import { useFocusEffect } from '@react-navigation/native';
import Icon from '../../components/Icon';
import QRCodeDisplay from '../../components/QRCodeDisplay';
import { getLocalImage } from '../../utils/localImageStorage';

interface Profile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface MembershipInfo {
  memberships: {
    type: 'summer_season' | 'ten_block' | 'pay_by_play';
    credits?: number;
    displayName: string;
  }[];
  primaryMembership: string;
}

export default function ProfileScreen() {
  const { user, authLoading, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [membershipInfo, setMembershipInfo] = useState<MembershipInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    try {
      console.log('Fetching profile for user:', user.id);
      
      // Zuerst das lokale Bild laden
      const localImage = await getLocalImage(user.id);
      console.log('Local image found:', localImage);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        if (error.code === 'PGRST116') {
          // Kein Profil gefunden, erstelle ein Standard-Profil
          setProfile({
            id: user.id,
            email: user.email,
            first_name: null,
            last_name: null,
            avatar_url: localImage, // Verwende das lokale Bild
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      } else {
        console.log('Profile loaded:', data);
        setProfile({
          ...data,
          avatar_url: localImage || data.avatar_url // Bevorzuge lokales Bild
        });
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchMembershipInfo = useCallback(async () => {
    // Mock-Daten für Mitgliedschaftsinformationen
    // In einer echten App würde dies von der Datenbank kommen
    setMembershipInfo({
      memberships: [
        {
          type: 'summer_season',
          displayName: 'Sommersaison 2024'
        }
      ],
      primaryMembership: 'Sommersaison 2024'
    });
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        fetchProfile();
        fetchMembershipInfo();
      }
    }, [user, fetchProfile, fetchMembershipInfo])
  );

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
      case 'registrations':
        router.push('/profile/registrations');
        break;
      case 'settings':
        router.push('/profile/settings');
        break;
      case 'about':
        router.push('/profile/about');
        break;
      case 'help':
        router.push('/profile/help');
        break;
      default:
        console.log('Unknown option:', option);
    }
  };

  const getDisplayName = () => {
    if (!profile) return 'Gast';
    
    const firstName = profile.first_name || '';
    const lastName = profile.last_name || '';
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (lastName) {
      return lastName;
    } else if (profile.email) {
      return profile.email.split('@')[0];
    }
    
    return 'Benutzer';
  };

  const getInitials = () => {
    if (!profile) return 'G';
    
    const firstName = profile.first_name || '';
    const lastName = profile.last_name || '';
    
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (lastName) {
      return lastName.charAt(0).toUpperCase();
    } else if (profile.email) {
      return profile.email.charAt(0).toUpperCase();
    }
    
    return 'B';
  };

  if (authLoading || loading) {
    return (
      <SafeAreaView style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[commonStyles.text, { marginTop: 16 }]}>
          Lade Profil...
        </Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={[commonStyles.content, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
          <View style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: colors.background,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
            borderWidth: 2,
            borderColor: colors.border
          }}>
            <Icon name="person" size={48} color={colors.textSecondary} />
          </View>

          <Text style={[commonStyles.title, { textAlign: 'center', marginBottom: 8 }]}>
            Willkommen!
          </Text>
          
          <Text style={[commonStyles.text, { textAlign: 'center', marginBottom: 32, color: colors.textSecondary }]}>
            Melde dich an, um dein Profil zu verwalten und Events zu buchen.
          </Text>

          <TouchableOpacity
            style={[buttonStyles.primary, { marginBottom: 12, width: '100%' }]}
            onPress={handleLogin}
          >
            <Text style={buttonTextStyles.primary}>
              Anmelden
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[buttonStyles.outline, { width: '100%' }]}
            onPress={handleSignup}
          >
            <Text style={buttonTextStyles.outline}>
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
        {/* Profile Header */}
        <View style={[commonStyles.card, { alignItems: 'center', marginBottom: 20 }]}>
          {profile?.avatar_url ? (
            <Image
              source={{ uri: profile.avatar_url }}
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                marginBottom: 16,
                borderWidth: 3,
                borderColor: colors.primary + '20'
              }}
            />
          ) : (
            <View style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: colors.primary + '20',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16
            }}>
              <Text style={[commonStyles.title, { color: colors.primary, fontSize: 32 }]}>
                {getInitials()}
              </Text>
            </View>
          )}

          <Text style={[commonStyles.title, { marginBottom: 4 }]}>
            {getDisplayName()}
          </Text>
          
          <Text style={[commonStyles.text, { color: colors.textSecondary, marginBottom: 16 }]}>
            {profile?.email}
          </Text>

          {membershipInfo && (
            <View style={{
              backgroundColor: colors.success + '20',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
              marginBottom: 16
            }}>
              <Text style={[commonStyles.textLight, { color: colors.success, fontWeight: '600' }]}>
                {membershipInfo.primaryMembership}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[buttonStyles.outline, { paddingHorizontal: 24 }]}
            onPress={() => handleOptionPress('edit')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="create" size={16} color={colors.primary} />
              <Text style={[buttonTextStyles.outline, { marginLeft: 8 }]}>
                Profil bearbeiten
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* QR Code */}
        <QRCodeDisplay />

        {/* Menu Options */}
        <View style={commonStyles.card}>
          <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>
            Mein Account
          </Text>

          {[
            { key: 'registrations', title: 'Meine Anmeldungen', icon: 'calendar', subtitle: 'Events und Turniere' },
            { key: 'settings', title: 'Einstellungen', icon: 'settings', subtitle: 'App-Einstellungen' },
            { key: 'about', title: 'Über die App', icon: 'information-circle', subtitle: 'Version und Infos' },
            { key: 'help', title: 'Hilfe & Support', icon: 'help-circle', subtitle: 'FAQ und Kontakt' }
          ].map((option, index) => (
            <TouchableOpacity
              key={option.key}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 16,
                borderBottomWidth: index < 3 ? 1 : 0,
                borderBottomColor: colors.border
              }}
              onPress={() => handleOptionPress(option.key)}
            >
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.primary + '20',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16
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

              <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[
            buttonStyles.outline,
            { 
              marginTop: 20, 
              marginBottom: 40,
              borderColor: colors.error,
              backgroundColor: colors.error + '10'
            }
          ]}
          onPress={handleLogout}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="log-out" size={18} color={colors.error} />
            <Text style={[commonStyles.buttonText, { marginLeft: 8, color: colors.error }]}>
              Abmelden
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
