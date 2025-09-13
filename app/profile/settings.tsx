
import React, { useState } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from '../../components/Icon';
import StorageSetup from '../../components/StorageSetup';
import ImageUploadTest from '../../components/ImageUploadTest';
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
    // TODO: Implement notification settings
  };

  const handleEmailToggle = (value: boolean) => {
    setEmailNotifications(value);
    // TODO: Implement email notification settings
  };

  const handleDarkModeToggle = (value: boolean) => {
    setDarkMode(value);
    // TODO: Implement dark mode
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Account löschen',
      'Möchtest du deinen Account wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement account deletion
            Alert.alert('Info', 'Account-Löschung ist noch nicht implementiert.');
          }
        }
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

        {/* Storage Setup Section */}
        <StorageSetup />

        {/* Image Upload Test Section */}
        <ImageUploadTest />

        {/* Notification Settings */}
        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 16 }]}>
            Benachrichtigungen
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={commonStyles.text}>Push-Benachrichtigungen</Text>
            <Switch
              value={notifications}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={commonStyles.text}>E-Mail-Benachrichtigungen</Text>
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
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={commonStyles.text}>Dunkler Modus</Text>
            <Switch
              value={darkMode}
              onValueChange={handleDarkModeToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        {/* Danger Zone */}
        <View style={[commonStyles.card, { marginBottom: 30 }]}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 16, color: '#dc3545' }]}>
            Gefahrenbereich
          </Text>
          
          <TouchableOpacity
            style={[
              buttonStyles.outline,
              { 
                width: '100%',
                borderColor: '#dc3545',
              }
            ]}
            onPress={handleDeleteAccount}
          >
            <Text style={[commonStyles.buttonText, { color: '#dc3545' }]}>
              Account löschen
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
