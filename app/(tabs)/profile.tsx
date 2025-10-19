
import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import Icon from '../../components/Icon';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { getLocalImage } from '../../utils/localImageStorage';
import QRCodeDisplay from '../../components/QRCodeDisplay';
import { useTheme } from '../../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

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
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { colors, theme } = useTheme();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
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

      console.log('Profile data:', data);
      setProfile(data);

      // Load local avatar if exists
      const localAvatar = await getLocalImage(user.id);
      if (localAvatar) {
        console.log('Local avatar found');
        setLocalAvatarUrl(localAvatar);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      console.log('ProfileScreen focused, fetching profile');
      fetchProfile();
    }, [fetchProfile])
  );

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
              const { error } = await supabase.auth.signOut();
              if (error) {
                console.error('Error signing out:', error);
                Alert.alert('Fehler', 'Abmeldung fehlgeschlagen.');
                return;
              }
              console.log('User signed out successfully');
              router.replace('/');
            } catch (error) {
              console.error('Error in handleLogout:', error);
              Alert.alert('Fehler', 'Ein unerwarteter Fehler ist aufgetreten.');
            }
          },
        },
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
    console.log('Option pressed:', option);
    
    switch (option) {
      case 'edit':
        router.push('/profile/edit');
        break;
      case 'registrations':
        router.push('/profile/registrations');
        break;
      case 'notifications':
        router.push('/profile/notification-settings');
        break;
      case 'theme':
        router.push('/profile/theme-settings');
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

  const getDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile?.first_name) {
      return profile.first_name;
    }
    if (profile?.email) {
      return profile.email.split('@')[0];
    }
    return 'Benutzer';
  };

  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    if (profile?.first_name) {
      return profile.first_name.substring(0, 2).toUpperCase();
    }
    if (profile?.email) {
      return profile.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  if (authLoading || loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text, marginTop: 16, fontSize: 16 }}>
          Lade Profil...
        </Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 20 }} showsVerticalScrollIndicator={false}>
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <View style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: colors.backgroundSecondary,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
              shadowColor: colors.black,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}>
              <Icon name="person-outline" size={48} color={colors.textLight} />
            </View>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 8 }}>
              Nicht angemeldet
            </Text>
            <Text style={{ fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginBottom: 32 }}>
              Melde dich an, um dein Profil zu sehen
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: colors.primary,
                paddingVertical: 16,
                paddingHorizontal: 32,
                borderRadius: 12,
                marginBottom: 12,
                width: '100%',
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 8,
              }}
              onPress={handleLogin}
            >
              <Text style={{ color: colors.white, fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
                Anmelden
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: colors.surface,
                paddingVertical: 16,
                paddingHorizontal: 32,
                borderRadius: 12,
                width: '100%',
                borderWidth: 2,
                borderColor: colors.border,
              }}
              onPress={handleSignup}
            >
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
                Registrieren
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Profile Header with Gradient */}
        <LinearGradient
          colors={theme === 'dark' 
            ? ['#F20505', '#C00404'] 
            : ['#F20505', '#FF4444']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingHorizontal: 20,
            paddingTop: 40,
            paddingBottom: 80,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <View style={{ alignItems: 'center' }}>
            {localAvatarUrl || profile?.avatar_url ? (
              <Image
                source={{ uri: localAvatarUrl || profile?.avatar_url || undefined }}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  marginBottom: 16,
                  borderWidth: 4,
                  borderColor: colors.white,
                  shadowColor: colors.black,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 6,
                }}
              />
            ) : (
              <View style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                borderWidth: 4,
                borderColor: colors.white,
              }}>
                <Text style={{ fontSize: 36, fontWeight: 'bold', color: colors.white }}>
                  {getInitials()}
                </Text>
              </View>
            )}
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.white, marginBottom: 4 }}>
              {getDisplayName()}
            </Text>
            <Text style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.9)' }}>
              {profile?.email}
            </Text>
          </View>
        </LinearGradient>

        {/* QR Code Card */}
        <View style={{ paddingHorizontal: 20, marginTop: -60 }}>
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: 20,
            padding: 20,
            shadowColor: theme === 'dark' ? colors.primary : colors.black,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: theme === 'dark' ? 0.3 : 0.15,
            shadowRadius: 16,
            elevation: 8,
            borderWidth: theme === 'dark' ? 1 : 0,
            borderColor: colors.border,
          }}>
            <QRCodeDisplay userId={user.id} />
          </View>
        </View>

        {/* Options */}
        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          {/* Account Section */}
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textSecondary, marginBottom: 12, marginLeft: 4 }}>
            KONTO
          </Text>
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            marginBottom: 24,
            overflow: 'hidden',
            shadowColor: colors.black,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 4,
            borderWidth: theme === 'dark' ? 1 : 0,
            borderColor: colors.border,
          }}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
              onPress={() => handleOptionPress('edit')}
            >
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.backgroundSecondary,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}>
                <Icon name="person" size={20} color={colors.primary} />
              </View>
              <Text style={{ flex: 1, fontSize: 16, color: colors.text, fontWeight: '500' }}>
                Profil bearbeiten
              </Text>
              <Icon name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
              }}
              onPress={() => handleOptionPress('registrations')}
            >
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.backgroundSecondary,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}>
                <Icon name="calendar" size={20} color={colors.primary} />
              </View>
              <Text style={{ flex: 1, fontSize: 16, color: colors.text, fontWeight: '500' }}>
                Meine Anmeldungen
              </Text>
              <Icon name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>
          </View>

          {/* App Settings Section */}
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textSecondary, marginBottom: 12, marginLeft: 4 }}>
            EINSTELLUNGEN
          </Text>
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            marginBottom: 24,
            overflow: 'hidden',
            shadowColor: colors.black,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 4,
            borderWidth: theme === 'dark' ? 1 : 0,
            borderColor: colors.border,
          }}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
              onPress={() => handleOptionPress('theme')}
            >
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.backgroundSecondary,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}>
                <Icon name={theme === 'dark' ? 'moon' : 'sunny'} size={20} color={colors.accent} />
              </View>
              <Text style={{ flex: 1, fontSize: 16, color: colors.text, fontWeight: '500' }}>
                Design & Theme
              </Text>
              <Icon name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
              onPress={() => handleOptionPress('notifications')}
            >
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.backgroundSecondary,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}>
                <Icon name="notifications" size={20} color={colors.primary} />
              </View>
              <Text style={{ flex: 1, fontSize: 16, color: colors.text, fontWeight: '500' }}>
                Benachrichtigungen
              </Text>
              <Icon name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
              }}
              onPress={() => handleOptionPress('settings')}
            >
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.backgroundSecondary,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}>
                <Icon name="settings" size={20} color={colors.primary} />
              </View>
              <Text style={{ flex: 1, fontSize: 16, color: colors.text, fontWeight: '500' }}>
                Einstellungen
              </Text>
              <Icon name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>
          </View>

          {/* Support Section */}
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textSecondary, marginBottom: 12, marginLeft: 4 }}>
            SUPPORT
          </Text>
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            marginBottom: 24,
            overflow: 'hidden',
            shadowColor: colors.black,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 4,
            borderWidth: theme === 'dark' ? 1 : 0,
            borderColor: colors.border,
          }}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
              onPress={() => handleOptionPress('help')}
            >
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.backgroundSecondary,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}>
                <Icon name="help-circle" size={20} color={colors.primary} />
              </View>
              <Text style={{ flex: 1, fontSize: 16, color: colors.text, fontWeight: '500' }}>
                Hilfe & Support
              </Text>
              <Icon name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
              }}
              onPress={() => handleOptionPress('about')}
            >
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.backgroundSecondary,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}>
                <Icon name="information-circle" size={20} color={colors.primary} />
              </View>
              <Text style={{ flex: 1, fontSize: 16, color: colors.text, fontWeight: '500' }}>
                Über die App
              </Text>
              <Icon name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 40,
              borderWidth: 2,
              borderColor: colors.error,
              shadowColor: colors.error,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
            onPress={handleLogout}
          >
            <Icon name="log-out" size={20} color={colors.error} style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.error }}>
              Abmelden
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
