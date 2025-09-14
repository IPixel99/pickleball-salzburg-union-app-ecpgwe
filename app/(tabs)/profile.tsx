
import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import Icon from '../../components/Icon';
import QRCodeDisplay from '../../components/QRCodeDisplay';
import { commonStyles, colors, buttonStyles, buttonTextStyles } from '../../styles/commonStyles';
import { supabase } from '../../lib/supabase';
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

interface MembershipInfo {
  memberships: Array<{
    type: 'summer_season' | 'ten_block' | 'pay_by_play';
    credits?: number;
    displayName: string;
  }>;
  primaryMembership: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [membershipInfo, setMembershipInfo] = useState<MembershipInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        fetchProfile();
        fetchMembershipInfo();
      } else {
        setLoading(false);
      }
    }, [user])
  );

  const fetchProfile = async () => {
    if (!user) return;

    try {
      console.log('Fetching profile for profile screen');
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
        console.log('Profile fetched for profile screen:', data);
        setProfile(data);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembershipInfo = async () => {
    if (!user) return;

    try {
      console.log('Fetching membership info for user:', user.id);
      
      // Check all membership tables
      const [summerResult, tenBlockResult, payByPlayResult] = await Promise.all([
        supabase.from('summer_season_members').select('*').eq('id', user.id).single(),
        supabase.from('ten_block_membership').select('*').eq('id', user.id).single(),
        supabase.from('pay_by_play_members').select('*').eq('id', user.id).single()
      ]);

      const memberships = [];
      
      if (summerResult.data) {
        console.log('Found summer season membership:', summerResult.data);
        memberships.push({
          type: 'summer_season' as const,
          displayName: 'Wintermembership'
        });
      }
      
      if (tenBlockResult.data) {
        console.log('Found ten block membership:', tenBlockResult.data);
        memberships.push({
          type: 'ten_block' as const,
          credits: tenBlockResult.data.credits || 0,
          displayName: 'Zehner Block'
        });
      }
      
      if (payByPlayResult.data) {
        console.log('Found pay by play membership:', payByPlayResult.data);
        memberships.push({
          type: 'pay_by_play' as const,
          displayName: 'Pay by Play'
        });
      }

      if (memberships.length > 0) {
        const primaryMembership = memberships[0].displayName;
        setMembershipInfo({ memberships, primaryMembership });
        console.log('Membership info set:', { memberships, primaryMembership });
      } else {
        console.log('No memberships found');
        setMembershipInfo({ memberships: [], primaryMembership: 'Keine Mitgliedschaft' });
      }
    } catch (error) {
      console.error('Error fetching membership info:', error);
      setMembershipInfo({ memberships: [], primaryMembership: 'Fehler beim Laden' });
    }
  };

  const handleLogout = async () => {
    try {
      console.log('Logging out user');
      await signOut();
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Fehler', 'Beim Abmelden ist ein Fehler aufgetreten.');
    }
  };

  const handleLogin = () => {
    router.push('/auth/login');
  };

  const handleSignup = () => {
    router.push('/auth/signup');
  };

  const handleOptionPress = (option: string) => {
    console.log('Profile option pressed:', option);
    
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
      case 'help':
        router.push('/profile/help');
        break;
      case 'about':
        router.push('/profile/about');
        break;
      default:
        Alert.alert('Info', `${option} wird bald verfügbar sein!`);
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
      return profile.email.split('@')[0];
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
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: colors.background,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Icon name="person" size={50} color={colors.textLight} />
            </View>
            <Text style={[commonStyles.title, { textAlign: 'center' }]}>
              Nicht angemeldet
            </Text>
            <Text style={[commonStyles.textLight, { textAlign: 'center', marginTop: 8 }]}>
              Melde dich an, um dein Profil zu sehen
            </Text>
          </View>

          {/* Login/Signup Buttons */}
          <View style={[commonStyles.card, { marginBottom: 30 }]}>
            <TouchableOpacity
              style={[buttonStyles.primary, { marginBottom: 12 }]}
              onPress={handleLogin}
            >
              <Text style={buttonTextStyles.primary}>Anmelden</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={buttonStyles.secondary}
              onPress={handleSignup}
            >
              <Text style={buttonTextStyles.secondary}>Registrieren</Text>
            </TouchableOpacity>
          </View>

          {/* Info Card */}
          <View style={commonStyles.card}>
            <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 12 }]}>
              Warum anmelden?
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Icon name="checkmark-circle" size={20} color={colors.success} style={{ marginRight: 12 }} />
              <Text style={commonStyles.text}>Events anzeigen und beitreten</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Icon name="checkmark-circle" size={20} color={colors.success} style={{ marginRight: 12 }} />
              <Text style={commonStyles.text}>Profil personalisieren</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Icon name="checkmark-circle" size={20} color={colors.success} style={{ marginRight: 12 }} />
              <Text style={commonStyles.text}>Nachrichten erhalten</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="checkmark-circle" size={20} color={colors.success} style={{ marginRight: 12 }} />
              <Text style={commonStyles.text}>Mit anderen Spielern vernetzen</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <TouchableOpacity
            onPress={() => handleOptionPress('edit')}
            style={{ position: 'relative' }}
          >
            {profile?.avatar_url ? (
              <Image
                source={{ uri: profile.avatar_url }}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: colors.background,
                }}
                onError={(error) => {
                  console.error('Error loading profile avatar:', error);
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
                }}
              >
                <Text style={{ fontSize: 36, fontWeight: 'bold', color: colors.white }}>
                  {getInitials()}
                </Text>
              </View>
            )}
            
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: colors.primary,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 3,
                borderColor: colors.white,
              }}
            >
              <Icon name="camera" size={16} color={colors.white} />
            </View>
          </TouchableOpacity>
          
          <Text style={[commonStyles.title, { textAlign: 'center', marginTop: 16 }]}>
            {getDisplayName()}
          </Text>
          
          {profile?.email && (
            <Text style={[commonStyles.textLight, { textAlign: 'center', marginTop: 4 }]}>
              {profile.email}
            </Text>
          )}

          {/* Membership Info */}
          {membershipInfo && (
            <View style={{
              backgroundColor: colors.primaryLight,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              marginTop: 12,
            }}>
              <Text style={[commonStyles.text, { color: colors.primary, fontWeight: '600', fontSize: 14 }]}>
                {membershipInfo.primaryMembership}
              </Text>
              {membershipInfo.memberships.some(m => m.credits !== undefined) && (
                <Text style={[commonStyles.text, { color: colors.primary, fontSize: 12 }]}>
                  {membershipInfo.memberships.find(m => m.credits !== undefined)?.credits} Credits übrig
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Profile Options */}
        <View style={[commonStyles.card, { marginBottom: 30 }]}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 16 }]}>
            Profil
          </Text>
          
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
            onPress={() => handleOptionPress('edit')}
          >
            <Icon name="person" size={20} color={colors.primary} style={{ marginRight: 16 }} />
            <Text style={[commonStyles.text, { flex: 1 }]}>Profil bearbeiten</Text>
            <Icon name="chevron-forward" size={16} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
            onPress={() => handleOptionPress('registrations')}
          >
            <Icon name="calendar" size={20} color={colors.primary} style={{ marginRight: 16 }} />
            <Text style={[commonStyles.text, { flex: 1 }]}>Meine Event-Anmeldungen</Text>
            <Icon name="chevron-forward" size={16} color={colors.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 12,
            }}
            onPress={() => handleOptionPress('settings')}
          >
            <Icon name="settings" size={20} color={colors.primary} style={{ marginRight: 16 }} />
            <Text style={[commonStyles.text, { flex: 1 }]}>Einstellungen</Text>
            <Icon name="chevron-forward" size={16} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* QR Code Section */}
        <View style={[commonStyles.card, { marginBottom: 30 }]}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: showQR ? 16 : 0,
            }}
            onPress={() => setShowQR(!showQR)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="qr-code" size={20} color={colors.primary} style={{ marginRight: 12 }} />
              <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                Mein QR-Code
              </Text>
            </View>
            <Icon 
              name={showQR ? "chevron-up" : "chevron-down"} 
              size={16} 
              color={colors.textLight} 
            />
          </TouchableOpacity>
          
          {showQR && (
            <View>
              <Text style={[commonStyles.textLight, { marginBottom: 16, fontSize: 14 }]}>
                Teile diesen QR-Code mit anderen Spielern, um dich schnell zu vernetzen.
              </Text>
              <QRCodeDisplay userId={user.id} />
            </View>
          )}
        </View>

        {/* Support Section */}
        <View style={[commonStyles.card, { marginBottom: 30 }]}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 16 }]}>
            Support
          </Text>
          
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
            onPress={() => handleOptionPress('help')}
          >
            <Icon name="help-circle" size={20} color={colors.primary} style={{ marginRight: 16 }} />
            <Text style={[commonStyles.text, { flex: 1 }]}>Hilfe & FAQ</Text>
            <Icon name="chevron-forward" size={16} color={colors.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 12,
            }}
            onPress={() => handleOptionPress('about')}
          >
            <Icon name="information-circle" size={20} color={colors.primary} style={{ marginRight: 16 }} />
            <Text style={[commonStyles.text, { flex: 1 }]}>Über die App</Text>
            <Icon name="chevron-forward" size={16} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[
            buttonStyles.secondary,
            { 
              backgroundColor: colors.error,
              borderColor: colors.error,
              marginBottom: 30,
            }
          ]}
          onPress={handleLogout}
        >
          <Icon name="log-out" size={20} color={colors.white} style={{ marginRight: 8 }} />
          <Text style={[buttonTextStyles.secondary, { color: colors.white }]}>
            Abmelden
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
