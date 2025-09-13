
import React, { useState } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from '../../components/Icon';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';

export default function SettingsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleNotificationToggle = (value: boolean) => {
    setNotifications(value);
    console.log('Notifications toggled:', value);
    // TODO: Implement notification settings
  };

  const handleEmailToggle = (value: boolean) => {
    setEmailUpdates(value);
    console.log('Email updates toggled:', value);
    // TODO: Implement email settings
  };

  const handleDarkModeToggle = (value: boolean) => {
    setDarkMode(value);
    console.log('Dark mode toggled:', value);
    // TODO: Implement dark mode
    Alert.alert('Info', 'Dark Mode wird in einer zukünftigen Version verfügbar sein.');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Account löschen',
      'Bist du sicher, dass du deinen Account löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement account deletion
            Alert.alert('Info', 'Account-Löschung wird in einer zukünftigen Version verfügbar sein.');
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

        {/* Notifications Section */}
        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 16 }]}>
            Benachrichtigungen
          </Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
              <Text style={commonStyles.text}>Push-Benachrichtigungen</Text>
              <Text style={[commonStyles.textLight, { fontSize: 12 }]}>
                Erhalte Benachrichtigungen über neue Events
              </Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={notifications ? colors.primary : colors.textLight}
            />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={commonStyles.text}>E-Mail Updates</Text>
              <Text style={[commonStyles.textLight, { fontSize: 12 }]}>
                Erhalte E-Mails über wichtige Updates
              </Text>
            </View>
            <Switch
              value={emailUpdates}
              onValueChange={handleEmailToggle}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={emailUpdates ? colors.primary : colors.textLight}
            />
          </View>
        </View>

        {/* Appearance Section */}
        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 16 }]}>
            Darstellung
          </Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={commonStyles.text}>Dark Mode</Text>
              <Text style={[commonStyles.textLight, { fontSize: 12 }]}>
                Dunkles Design verwenden
              </Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={handleDarkModeToggle}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={darkMode ? colors.primary : colors.textLight}
            />
          </View>
        </View>

        {/* Account Section */}
        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 16 }]}>
            Account
          </Text>
          
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 12,
            }}
            onPress={handleDeleteAccount}
          >
            <Icon name="trash" size={20} color={colors.error} style={{ marginRight: 12 }} />
            <Text style={[commonStyles.text, { color: colors.error }]}>
              Account löschen
            </Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={[commonStyles.card, { alignItems: 'center' }]}>
          <Text style={[commonStyles.textLight, { fontSize: 12, textAlign: 'center' }]}>
            Pickleball Salzburg Union App{'\n'}
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
