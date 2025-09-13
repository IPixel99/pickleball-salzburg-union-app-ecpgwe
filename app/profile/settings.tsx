
import React, { useState } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from '../../components/Icon';
import StorageSetup from '../../components/StorageSetup';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';

export default function SettingsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleNotificationToggle = (value: boolean) => {
    setNotifications(value);
    console.log('Notifications toggled:', value);
    // Here you would typically save this setting to your backend or local storage
  };

  const handleEmailToggle = (value: boolean) => {
    setEmailNotifications(value);
    console.log('Email notifications toggled:', value);
    // Here you would typically save this setting to your backend or local storage
  };

  const handleDarkModeToggle = (value: boolean) => {
    setDarkMode(value);
    console.log('Dark mode toggled:', value);
    // Here you would typically implement dark mode theme switching
    Alert.alert('Info', 'Dark Mode wird in einer zukünftigen Version verfügbar sein.');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Konto löschen',
      'Bist du sicher, dass du dein Konto löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: () => {
            // Here you would implement account deletion
            Alert.alert('Info', 'Konto-Löschung wird in einer zukünftigen Version verfügbar sein.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Header with Back Button */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 30 }}>
          <TouchableOpacity
            onPress={handleBack}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.white,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
              ...commonStyles.shadow,
            }}
          >
            <Icon name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={[commonStyles.title, { color: colors.primary, flex: 1 }]}>
            Einstellungen
          </Text>
        </View>

        {/* Storage Setup */}
        <StorageSetup />

        {/* Notification Settings */}
        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 16 }]}>
            Benachrichtigungen
          </Text>

          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 16
          }}>
            <View style={{ flex: 1 }}>
              <Text style={commonStyles.text}>Push-Benachrichtigungen</Text>
              <Text style={[commonStyles.textLight, { fontSize: 14 }]}>
                Erhalte Benachrichtigungen über neue Events und Nachrichten
              </Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center'
          }}>
            <View style={{ flex: 1 }}>
              <Text style={commonStyles.text}>E-Mail-Benachrichtigungen</Text>
              <Text style={[commonStyles.textLight, { fontSize: 14 }]}>
                Erhalte wichtige Updates per E-Mail
              </Text>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={handleEmailToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        {/* Appearance Settings */}
        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 16 }]}>
            Darstellung
          </Text>

          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center'
          }}>
            <View style={{ flex: 1 }}>
              <Text style={commonStyles.text}>Dark Mode</Text>
              <Text style={[commonStyles.textLight, { fontSize: 14 }]}>
                Verwende ein dunkles Design
              </Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={handleDarkModeToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        {/* Privacy Settings */}
        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 16 }]}>
            Privatsphäre & Sicherheit
          </Text>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 12,
            }}
            onPress={() => Alert.alert('Info', 'Datenschutz-Einstellungen werden in einer zukünftigen Version verfügbar sein.')}
          >
            <Icon name="shield-checkmark" size={24} color={colors.primary} />
            <Text style={[commonStyles.text, { marginLeft: 12, flex: 1 }]}>
              Datenschutz-Einstellungen
            </Text>
            <Icon name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 12,
            }}
            onPress={() => Alert.alert('Info', 'Sicherheits-Einstellungen werden in einer zukünftigen Version verfügbar sein.')}
          >
            <Icon name="lock-closed" size={24} color={colors.primary} />
            <Text style={[commonStyles.text, { marginLeft: 12, flex: 1 }]}>
              Sicherheit
            </Text>
            <Icon name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Account Management */}
        <View style={[commonStyles.card, { marginBottom: 30 }]}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 16 }]}>
            Konto-Verwaltung
          </Text>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 12,
              marginBottom: 12,
            }}
            onPress={() => Alert.alert('Info', 'Daten-Export wird in einer zukünftigen Version verfügbar sein.')}
          >
            <Icon name="download" size={24} color={colors.primary} />
            <Text style={[commonStyles.text, { marginLeft: 12, flex: 1 }]}>
              Daten exportieren
            </Text>
            <Icon name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 12,
            }}
            onPress={handleDeleteAccount}
          >
            <Icon name="trash" size={24} color={colors.error} />
            <Text style={[commonStyles.text, { marginLeft: 12, flex: 1, color: colors.error }]}>
              Konto löschen
            </Text>
            <Icon name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
