
import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import Icon from '../../components/Icon';
import { 
  checkNotificationPermissions, 
  requestNotificationPermissions,
  getAllScheduledNotifications 
} from '../../utils/notificationUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_PREFS_KEY = 'notification_preferences';

interface NotificationPreferences {
  eventReminders: boolean;
  eventRegistrations: boolean;
  newsUpdates: boolean;
}

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [scheduledCount, setScheduledCount] = useState(0);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    eventReminders: true,
    eventRegistrations: true,
    newsUpdates: true,
  });

  useEffect(() => {
    loadPreferences();
    checkPermissions();
    loadScheduledNotifications();
  }, []);

  const loadPreferences = async () => {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATION_PREFS_KEY);
      if (stored) {
        setPreferences(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  };

  const savePreferences = async (newPrefs: NotificationPreferences) => {
    try {
      await AsyncStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(newPrefs));
      setPreferences(newPrefs);
    } catch (error) {
      console.error('Error saving notification preferences:', error);
    }
  };

  const checkPermissions = async () => {
    const granted = await checkNotificationPermissions();
    setPermissionsGranted(granted);
  };

  const loadScheduledNotifications = async () => {
    const notifications = await getAllScheduledNotifications();
    setScheduledCount(notifications.length);
  };

  const handleRequestPermissions = async () => {
    const granted = await requestNotificationPermissions();
    setPermissionsGranted(granted);
    
    if (granted) {
      Alert.alert('Benachrichtigungen aktiviert', 'Du erhältst jetzt Benachrichtigungen.');
    } else {
      Alert.alert(
        'Benachrichtigungen deaktiviert',
        'Bitte aktiviere Benachrichtigungen in den Systemeinstellungen.'
      );
    }
  };

  const handleTogglePreference = (key: keyof NotificationPreferences) => {
    const newPrefs = {
      ...preferences,
      [key]: !preferences[key],
    };
    savePreferences(newPrefs);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 30 }}>
          <TouchableOpacity
            onPress={handleBack}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.backgroundSecondary,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
            }}
          >
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={commonStyles.title}>Benachrichtigungen</Text>
            <Text style={commonStyles.textLight}>Verwalte deine Benachrichtigungen</Text>
          </View>
        </View>

        {/* Permission Status */}
        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: permissionsGranted ? colors.success : colors.error,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <Icon
                name={permissionsGranted ? 'checkmark-circle' : 'close-circle'}
                size={24}
                color={colors.white}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 4 }]}>
                {permissionsGranted ? 'Benachrichtigungen aktiviert' : 'Benachrichtigungen deaktiviert'}
              </Text>
              <Text style={commonStyles.textLight}>
                {permissionsGranted
                  ? `${scheduledCount} geplante Benachrichtigungen`
                  : 'Aktiviere Benachrichtigungen für Updates'}
              </Text>
            </View>
          </View>

          {!permissionsGranted && (
            <TouchableOpacity
              style={[buttonStyles.primary, { marginTop: 12 }]}
              onPress={handleRequestPermissions}
            >
              <Text style={commonStyles.buttonTextWhite}>Benachrichtigungen aktivieren</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Notification Preferences */}
        {permissionsGranted && (
          <>
            <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 16, fontSize: 18 }]}>
              Benachrichtigungstypen
            </Text>

            {/* Event Reminders */}
            <View style={[commonStyles.card, { marginBottom: 16 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, marginRight: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Icon name="notifications" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                    <Text style={[commonStyles.text, { fontWeight: '600' }]}>Event-Erinnerungen</Text>
                  </View>
                  <Text style={commonStyles.textLight}>
                    Erhalte Erinnerungen 1 Stunde vor Events
                  </Text>
                </View>
                <Switch
                  value={preferences.eventReminders}
                  onValueChange={() => handleTogglePreference('eventReminders')}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.white}
                />
              </View>
            </View>

            {/* Event Registrations */}
            <View style={[commonStyles.card, { marginBottom: 16 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, marginRight: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Icon name="checkmark-circle" size={20} color={colors.success} style={{ marginRight: 8 }} />
                    <Text style={[commonStyles.text, { fontWeight: '600' }]}>Anmeldebestätigungen</Text>
                  </View>
                  <Text style={commonStyles.textLight}>
                    Bestätigungen bei Event-Anmeldungen
                  </Text>
                </View>
                <Switch
                  value={preferences.eventRegistrations}
                  onValueChange={() => handleTogglePreference('eventRegistrations')}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.white}
                />
              </View>
            </View>

            {/* News Updates */}
            <View style={[commonStyles.card, { marginBottom: 16 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, marginRight: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Icon name="newspaper" size={20} color={colors.yellow} style={{ marginRight: 8 }} />
                    <Text style={[commonStyles.text, { fontWeight: '600' }]}>Nachrichten-Updates</Text>
                  </View>
                  <Text style={commonStyles.textLight}>
                    Benachrichtigungen bei neuen Nachrichten
                  </Text>
                </View>
                <Switch
                  value={preferences.newsUpdates}
                  onValueChange={() => handleTogglePreference('newsUpdates')}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.white}
                />
              </View>
            </View>
          </>
        )}

        {/* Info Card */}
        <View style={[commonStyles.card, { backgroundColor: colors.primaryLight, marginTop: 20 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Icon name="information-circle" size={24} color={colors.primary} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
                Über Benachrichtigungen
              </Text>
              <Text style={commonStyles.textLight}>
                Benachrichtigungen helfen dir, keine Events zu verpassen und über Neuigkeiten informiert zu bleiben.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
