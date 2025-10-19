
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from '../../components/Icon';
import { useTheme } from '../../contexts/ThemeContext';

export default function DatenschutzScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const handleBack = () => {
    router.back();
  };

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Fehler', 'Link konnte nicht geöffnet werden');
    });
  };

  const privacyOptions = [
    {
      title: 'Datenschutzrichtlinie',
      subtitle: 'Unsere vollständige Datenschutzerklärung',
      icon: 'document-text',
      onPress: () => Alert.alert('Info', 'Datenschutzrichtlinie wird bald verfügbar sein'),
    },
    {
      title: 'Nutzungsbedingungen',
      subtitle: 'Allgemeine Geschäftsbedingungen',
      icon: 'reader',
      onPress: () => Alert.alert('Info', 'Nutzungsbedingungen werden bald verfügbar sein'),
    },
    {
      title: 'Datenverarbeitung',
      subtitle: 'Welche Daten wir sammeln und wie wir sie verwenden',
      icon: 'analytics',
      onPress: () => Alert.alert('Info', 'Informationen zur Datenverarbeitung werden bald verfügbar sein'),
    },
    {
      title: 'Deine Rechte',
      subtitle: 'Auskunft, Berichtigung und Löschung deiner Daten',
      icon: 'shield-checkmark',
      onPress: () => Alert.alert('Info', 'Informationen zu deinen Rechten werden bald verfügbar sein'),
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.surface,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}>
        <TouchableOpacity style={{ padding: 8, marginRight: 12 }} onPress={handleBack}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text }}>
          Datenschutz
        </Text>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 20,
          marginTop: 20,
          borderLeftWidth: 4,
          borderLeftColor: colors.primary,
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Icon name="shield" size={24} color={colors.primary} />
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: colors.text,
              marginLeft: 12,
            }}>
              Deine Privatsphäre ist wichtig
            </Text>
          </View>
          <Text style={{
            fontSize: 14,
            color: colors.textSecondary,
            lineHeight: 20,
          }}>
            Wir nehmen den Schutz deiner persönlichen Daten sehr ernst. Hier findest du alle Informationen darüber, wie wir mit deinen Daten umgehen.
          </Text>
        </View>

        {/* Privacy Options */}
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
          {privacyOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 15,
                borderBottomWidth: index < privacyOptions.length - 1 ? 1 : 0,
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

        {/* Data Storage Info */}
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
            marginBottom: 12,
          }}>
            Datenspeicherung
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
            <Icon name="checkmark-circle" size={20} color={colors.success} style={{ marginRight: 10, marginTop: 2 }} />
            <Text style={{ flex: 1, fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>
              Deine Profildaten werden sicher in der Datenbank gespeichert
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
            <Icon name="checkmark-circle" size={20} color={colors.success} style={{ marginRight: 10, marginTop: 2 }} />
            <Text style={{ flex: 1, fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>
              Profilbilder werden lokal auf deinem Gerät gespeichert
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Icon name="checkmark-circle" size={20} color={colors.success} style={{ marginRight: 10, marginTop: 2 }} />
            <Text style={{ flex: 1, fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>
              Alle Datenübertragungen sind verschlüsselt
            </Text>
          </View>
        </View>

        {/* Contact Section */}
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
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 12,
          }}>
            Fragen zum Datenschutz?
          </Text>
          <Text style={{
            fontSize: 14,
            color: colors.textSecondary,
            lineHeight: 20,
            marginBottom: 16,
          }}>
            Bei Fragen oder Anliegen zum Datenschutz kannst du uns jederzeit kontaktieren.
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => Alert.alert('Info', 'Kontaktfunktion wird bald verfügbar sein')}
          >
            <Icon name="mail" size={20} color={colors.white} />
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.white,
              marginLeft: 8,
            }}>
              Kontakt aufnehmen
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
