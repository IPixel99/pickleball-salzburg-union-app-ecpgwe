
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import Icon from '../../components/Icon';
import { Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();

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

  const settingsOptions = [
    {
      title: 'Benachrichtigungen',
      subtitle: 'Verwalte deine Benachrichtigungen',
      icon: 'notifications',
      type: 'action',
      onPress: () => router.push('/profile/notification-settings'),
    },
    {
      title: 'Design & Theme',
      subtitle: 'Farbschema und Darstellung anpassen',
      icon: 'color-palette',
      type: 'action',
      onPress: () => router.push('/profile/theme-settings'),
    },
    {
      title: 'Datenschutz',
      subtitle: 'Datenschutzrichtlinien und Einstellungen',
      icon: 'shield',
      type: 'action',
      onPress: () => router.push('/profile/datenschutz'),
    },
    {
      title: 'Über die App',
      subtitle: 'Version und Informationen',
      icon: 'information-circle',
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.surface,
      }}>
        <TouchableOpacity onPress={handleBack} style={{ padding: 8, marginRight: 12 }}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text }}>
          Einstellungen
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 20,
          marginTop: 20,
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 20,
          }}>
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
              onPress={option.onPress}
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
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                  {option.title}
                </Text>
                <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 2 }}>
                  {option.subtitle}
                </Text>
              </View>

              <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Account Actions */}
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 20,
          marginTop: 20,
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 20,
          }}>
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
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.error }}>
                Abmelden
              </Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 2 }}>
                Von deinem Account abmelden
              </Text>
            </View>

            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Version Info */}
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 20,
          marginTop: 20,
          marginBottom: 40,
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}>
          <Text style={{ fontSize: 14, textAlign: 'center', color: colors.textSecondary }}>
            Pickleball Salzburg Union
          </Text>
          <Text style={{ fontSize: 14, textAlign: 'center', color: colors.textSecondary, marginTop: 5 }}>
            Version 1.0.0
          </Text>
          <Text style={{ fontSize: 14, textAlign: 'center', color: colors.success, marginTop: 5 }}>
            📱 Lokale Bildspeicherung aktiv
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
