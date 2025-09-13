
import React from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from '../../components/Icon';
import { commonStyles, colors } from '../../styles/commonStyles';

export default function HelpScreen() {
  const router = useRouter();

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
            Hilfe & Support
          </Text>
        </View>

        {/* Contact Support */}
        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 16 }]}>
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
              <Text style={commonStyles.text}>E-Mail Support</Text>
              <Text style={[commonStyles.textLight, { fontSize: 12 }]}>
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
              <Text style={commonStyles.text}>Website besuchen</Text>
              <Text style={[commonStyles.textLight, { fontSize: 12 }]}>
                pickleball-salzburg.at
              </Text>
            </View>
            <Icon name="chevron-forward" size={16} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* FAQ */}
        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 16 }]}>
            Häufig gestellte Fragen
          </Text>
          
          {faqItems.map((item, index) => (
            <View key={index} style={{ marginBottom: index < faqItems.length - 1 ? 16 : 0 }}>
              <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
                {item.question}
              </Text>
              <Text style={[commonStyles.textLight, { lineHeight: 20 }]}>
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
        <View style={[commonStyles.card]}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 16 }]}>
            App-Features
          </Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Icon name="calendar" size={16} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={commonStyles.textLight}>Event-Verwaltung und Anmeldung</Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Icon name="newspaper" size={16} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={commonStyles.textLight}>Aktuelle Nachrichten und Updates</Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Icon name="qr-code" size={16} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={commonStyles.textLight}>QR-Code für schnelle Identifikation</Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="person" size={16} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={commonStyles.textLight}>Persönliches Profil-Management</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
