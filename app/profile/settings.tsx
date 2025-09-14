
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Icon from '../../components/Icon';
import SupabaseConnectionTest from '../../components/SupabaseConnectionTest';
import StorageSetup from '../../components/StorageSetup';
import AvatarUploadTest from '../../components/AvatarUploadTest';
import EventRegistrationsTest from '../../components/EventRegistrationsTest';
import { Text, View, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { commonStyles, colors } from '../../styles/commonStyles';

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleBack = () => {
    router.back();
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

  const handleTestAvatar = () => {
    router.push('/test-avatar');
  };

  const handleTestSupabase = () => {
    router.push('/test-supabase');
  };

  const handleTestMembership = () => {
    router.push('/test-membership');
  };

  const settingsOptions = [
    {
      title: 'Benachrichtigungen',
      subtitle: 'Push-Benachrichtigungen für Events und News',
      icon: 'bell',
      type: 'switch',
      value: notifications,
      onToggle: setNotifications,
    },
    {
      title: 'Dunkler Modus',
      subtitle: 'Dunkles Design verwenden',
      icon: 'moon',
      type: 'switch',
      value: darkMode,
      onToggle: setDarkMode,
    },
    {
      title: 'Avatar Test',
      subtitle: 'Teste die Avatar-Upload-Funktionalität',
      icon: 'camera',
      type: 'action',
      onPress: handleTestAvatar,
    },
    {
      title: 'Supabase Test',
      subtitle: 'Teste die Datenbankverbindung',
      icon: 'database',
      type: 'action',
      onPress: handleTestSupabase,
    },
    {
      title: 'Membership Test',
      subtitle: 'Teste die Mitgliedschafts-Funktionalität',
      icon: 'users',
      type: 'action',
      onPress: handleTestMembership,
    },
    {
      title: 'Datenschutz',
      subtitle: 'Datenschutzrichtlinien und Einstellungen',
      icon: 'shield',
      type: 'action',
      onPress: () => Alert.alert('Info', 'Datenschutzeinstellungen werden bald verfügbar sein'),
    },
    {
      title: 'Über die App',
      subtitle: 'Version und Informationen',
      icon: 'info',
      type: 'action',
      onPress: () => router.push('/profile/about'),
    },
    {
      title: 'Hilfe & Support',
      subtitle: 'Häufige Fragen und Kontakt',
      icon: 'help-circle',
      type: 'action',
      onPress: () => router.push('/profile/help'),
    },
  ];

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.header}>
        <TouchableOpacity onPress={handleBack} style={commonStyles.backButton}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={commonStyles.headerTitle}>Einstellungen</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Connection Test */}
        <SupabaseConnectionTest />

        {/* Storage Setup */}
        <StorageSetup />

        {/* Avatar Test */}
        <AvatarUploadTest />

        {/* Event Registrations Test */}
        <EventRegistrationsTest />

        <View style={commonStyles.card}>
          <Text style={[commonStyles.subtitle, { marginBottom: 20 }]}>
            App-Einstellungen
          </Text>

          {settingsOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 15,
                borderBottomWidth: index < settingsOptions.length - 1 ? 1 : 0,
                borderBottomColor: colors.border,
              }}
              onPress={option.type === 'action' ? option.onPress : undefined}
              disabled={option.type === 'switch'}
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

              {option.type === 'switch' ? (
                <Switch
                  value={option.value}
                  onValueChange={option.onToggle}
                  trackColor={{ false: colors.border, true: colors.primary + '40' }}
                  thumbColor={option.value ? colors.primary : colors.textSecondary}
                />
              ) : (
                <Icon name="chevron-right" size={20} color={colors.textSecondary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Account Actions */}
        <View style={[commonStyles.card, { marginTop: 20 }]}>
          <Text style={[commonStyles.subtitle, { marginBottom: 20 }]}>
            Account
          </Text>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 15,
            }}
            onPress={handleLogout}
          >
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.error + '20',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 15,
            }}>
              <Icon name="log-out" size={20} color={colors.error} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[commonStyles.text, { fontWeight: '600', color: colors.error }]}>
                Abmelden
              </Text>
              <Text style={[commonStyles.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                Von deinem Account abmelden
              </Text>
            </View>

            <Icon name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Version Info */}
        <View style={[commonStyles.card, { marginTop: 20, marginBottom: 40 }]}>
          <Text style={[commonStyles.caption, { textAlign: 'center', color: colors.textSecondary }]}>
            Pickleball Salzburg Union
          </Text>
          <Text style={[commonStyles.caption, { textAlign: 'center', color: colors.textSecondary, marginTop: 5 }]}>
            Version 1.0.0 - Debug Build
          </Text>
          <Text style={[commonStyles.caption, { textAlign: 'center', color: colors.success, marginTop: 5 }]}>
            ✅ Supabase konfiguriert
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
