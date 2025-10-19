
import React from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from '../../components/Icon';
import { useTheme } from '../../contexts/ThemeContext';

export default function HelpScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const handleBack = () => {
    router.back();
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Support kontaktieren',
      'Wähle eine Kontaktmöglichkeit:',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'E-Mail',
          onPress: () => {
            Linking.openURL('mailto:support@pickleball-salzburg.at?subject=App Support');
          },
        },
        {
          text: 'Telefon',
          onPress: () => {
            Linking.openURL('tel:+43123456789');
          },
        },
      ]
    );
  };

  const handleWebsite = () => {
    Linking.openURL('https://pickleball-salzburg.at');
  };

  const faqItems = [
    {
      question: 'Wie melde ich mich für ein Event an?',
      answer: 'Gehe zu den Events, wähle ein Event aus und tippe auf "Teilnehmen". Du musst angemeldet sein, um an Events teilzunehmen.'
    },
    {
      question: 'Wie kann ich mein Profil bearbeiten?',
      answer: 'Gehe zu deinem Profil und tippe auf "Profil bearbeiten". Dort kannst du deine persönlichen Daten ändern.'
    },
    {
      question: 'Wie funktioniert der QR-Code?',
      answer: 'Der QR-Code zeigt deine eindeutige Benutzer-ID an. Andere können ihn scannen, um dich schnell zu finden oder hinzuzufügen.'
    },
    {
      question: 'Kann ich Benachrichtigungen deaktivieren?',
      answer: 'Ja, gehe zu den Einstellungen in deinem Profil und deaktiviere die gewünschten Benachrichtigungen.'
    },
    {
      question: 'Wie lösche ich meinen Account?',
      answer: 'Gehe zu den Einstellungen und wähle "Account löschen". Beachte, dass diese Aktion nicht rückgängig gemacht werden kann.'
    }
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Back Button */}
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
            <Icon name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ 
            fontSize: 28,
            fontWeight: 'bold',
            color: colors.primary, 
            flex: 1,
          }}>
            Hilfe & Support
          </Text>
        </View>

        {/* Contact Support */}
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 20,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: colors.border,
        }}>
          <Text style={{ 
            fontSize: 16,
            fontWeight: '600', 
            marginBottom: 16,
            color: colors.text,
          }}>
            Support kontaktieren
          </Text>
          
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 12,
              marginBottom: 12,
            }}
            onPress={handleContactSupport}
          >
            <Icon name="mail" size={20} color={colors.primary} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, color: colors.text }}>E-Mail Support</Text>
              <Text style={{ fontSize: 12, color: colors.textLight }}>
                support@pickleball-salzburg.at
              </Text>
            </View>
            <Icon name="chevron-forward" size={16} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 12,
            }}
            onPress={handleWebsite}
          >
            <Icon name="globe" size={20} color={colors.primary} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, color: colors.text }}>Website besuchen</Text>
              <Text style={{ fontSize: 12, color: colors.textLight }}>
                pickleball-salzburg.at
              </Text>
            </View>
            <Icon name="chevron-forward" size={16} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* FAQ */}
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 20,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: colors.border,
        }}>
          <Text style={{ 
            fontSize: 16,
            fontWeight: '600', 
            marginBottom: 16,
            color: colors.text,
          }}>
            Häufig gestellte Fragen
          </Text>
          
          {faqItems.map((item, index) => (
            <View key={index} style={{ marginBottom: index < faqItems.length - 1 ? 16 : 0 }}>
              <Text style={{ 
                fontSize: 15,
                fontWeight: '600', 
                marginBottom: 8,
                color: colors.text,
              }}>
                {item.question}
              </Text>
              <Text style={{ 
                lineHeight: 20,
                fontSize: 14,
                color: colors.textSecondary,
              }}>
                {item.answer}
              </Text>
              {index < faqItems.length - 1 && (
                <View style={{
                  height: 1,
                  backgroundColor: colors.border,
                  marginTop: 16,
                }} />
              )}
            </View>
          ))}
        </View>

        {/* App Features */}
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 20,
          borderWidth: 1,
          borderColor: colors.border,
        }}>
          <Text style={{ 
            fontSize: 16,
            fontWeight: '600', 
            marginBottom: 16,
            color: colors.text,
          }}>
            App-Features
          </Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Icon name="calendar" size={16} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 14, color: colors.textSecondary }}>
              Event-Verwaltung und Anmeldung
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Icon name="newspaper" size={16} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 14, color: colors.textSecondary }}>
              Aktuelle Nachrichten und Updates
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Icon name="qr-code" size={16} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 14, color: colors.textSecondary }}>
              QR-Code für schnelle Identifikation
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="person" size={16} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 14, color: colors.textSecondary }}>
              Persönliches Profil-Management
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
