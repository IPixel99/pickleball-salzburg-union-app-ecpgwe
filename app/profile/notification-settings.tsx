
import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
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
  const { colors } = useTheme();
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
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
            <Text style={{ 
              fontSize: 28,
              fontWeight: 'bold',
              color: colors.text,
            }}>
              Benachrichtigungen
            </Text>
            <Text style={{ 
              fontSize: 14,
              color: colors.textSecondary,
            }}>
              Verwalte deine Benachrichtigungen
            </Text>
          </View>
        </View>

        {/* Permission Status */}
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 20,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: colors.border,
        }}>
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
              <Text style={{ 
                fontSize: 16,
                fontWeight: '600', 
                marginBottom: 4,
                color: colors.text,
              }}>
                {permissionsGranted ? 'Benachrichtigungen aktiviert' : 'Benachrichtigungen deaktiviert'}
              </Text>
              <Text style={{ 
                fontSize: 14,
                color: colors.textSecondary,
              }}>
                {permissionsGranted
                  ? `${scheduledCount} geplante Benachrichtigungen`
                  : 'Aktiviere Benachrichtigungen für Updates'}
              </Text>
            </View>
          </View>

          {!permissionsGranted && (
            <TouchableOpacity
              style={{
                backgroundColor: colors.primary,
                borderRadius: 12,
                padding: 16,
                marginTop: 12,
              }}
              onPress={handleRequestPermissions}
            >
              <Text style={{ 
                color: colors.white,
                fontSize: 16,
                fontWeight: '600',
                textAlign: 'center',
              }}>
                Benachrichtigungen aktivieren
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Notification Preferences */}
        {permissionsGranted && (
          <>
            <Text style={{ 
              fontSize: 18,
              fontWeight: '600', 
              marginBottom: 16,
              color: colors.text,
            }}>
              Benachrichtigungstypen
            </Text>

            {/* Event Reminders */}
            <View style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 20,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, marginRight: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Icon name="notifications" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                    <Text style={{ 
                      fontSize: 16,
                      fontWeight: '600',
                      color: colors.text,
                    }}>
                      Event-Erinnerungen
                    </Text>
                  </View>
                  <Text style={{ 
                    fontSize: 14,
                    color: colors.textSecondary,
                  }}>
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
            <View style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 20,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, marginRight: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Icon name="checkmark-circle" size={20} color={colors.success} style={{ marginRight: 8 }} />
                    <Text style={{ 
                      fontSize: 16,
                      fontWeight: '600',
                      color: colors.text,
                    }}>
                      Anmeldebestätigungen
                    </Text>
                  </View>
                  <Text style={{ 
                    fontSize: 14,
                    color: colors.textSecondary,
                  }}>
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
            <View style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 20,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, marginRight: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Icon name="newspaper" size={20} color={colors.accent} style={{ marginRight: 8 }} />
                    <Text style={{ 
                      fontSize: 16,
                      fontWeight: '600',
                      color: colors.text,
                    }}>
                      Nachrichten-Updates
                    </Text>
                  </View>
                  <Text style={{ 
                    fontSize: 14,
                    color: colors.textSecondary,
                  }}>
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
        <View style={{
          backgroundColor: colors.primary + '15',
          borderRadius: 16,
          padding: 20,
          marginTop: 20,
          borderWidth: 1,
          borderColor: colors.primary + '30',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Icon name="information-circle" size={24} color={colors.primary} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ 
                fontSize: 16,
                fontWeight: '600', 
                marginBottom: 8,
                color: colors.text,
              }}>
                Über Benachrichtigungen
              </Text>
              <Text style={{ 
                fontSize: 14,
                color: colors.textSecondary,
              }}>
                Benachrichtigungen helfen dir, keine Events zu verpassen und über Neuigkeiten informiert zu bleiben.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
