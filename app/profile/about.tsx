
import React from 'react';
import { Text, View, ScrollView, TouchableOpacity, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from '../../components/Icon';
import { commonStyles, colors } from '../../styles/commonStyles';

export default function AboutScreen() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleWebsite = () => {
    Linking.openURL('https://pickleball-salzburg.at');
  };

  const handleSocialMedia = (platform: string) => {
    switch (platform) {
      case 'facebook':
        Linking.openURL('https://facebook.com/pickleballsalzburg');
        break;
      case 'instagram':
        Linking.openURL('https://instagram.com/pickleballsalzburg');
        break;
      case 'email':
        Linking.openURL('mailto:info@pickleball-salzburg.at');
        break;
    }
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
            Über die App
          </Text>
        </View>

        {/* App Logo and Info */}
        <View style={[commonStyles.card, { alignItems: 'center', marginBottom: 20 }]}>
          <Image
            source={require('../../assets/images/c0025ffd-25dc-49f5-9153-918105ed49ee.png')}
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              marginBottom: 16,
            }}
            resizeMode="contain"
          />
          <Text style={[commonStyles.title, { marginBottom: 8, textAlign: 'center' }]}>
            Pickleball Salzburg Union
          </Text>
          <Text style={[commonStyles.textLight, { textAlign: 'center', marginBottom: 16 }]}>
            Die offizielle App des Pickleball Salzburg Union Vereins
          </Text>
          <Text style={[commonStyles.textLight, { fontSize: 12, textAlign: 'center' }]}>
            Version 1.0.0
          </Text>
        </View>

        {/* About the Club */}
        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 16 }]}>
            Über den Verein
          </Text>
          <Text style={[commonStyles.textLight, { lineHeight: 22, marginBottom: 16 }]}>
            Der Pickleball Salzburg Union ist ein dynamischer Sportverein, der sich der Förderung 
            und Entwicklung des Pickleball-Sports in Salzburg und Umgebung widmet. Wir bieten 
            regelmäßige Trainings, Turniere und Events für Spieler aller Altersgruppen und 
            Fähigkeitsstufen.
          </Text>
          <Text style={[commonStyles.textLight, { lineHeight: 22 }]}>
            Unser Ziel ist es, eine freundliche und inklusive Gemeinschaft zu schaffen, in der 
            jeder die Freude am Pickleball entdecken und seine Fähigkeiten verbessern kann.
          </Text>
        </View>

        {/* Contact Information */}
        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 16 }]}>
            Kontakt
          </Text>
          
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 8,
              marginBottom: 12,
            }}
            onPress={() => handleSocialMedia('email')}
          >
            <Icon name="mail" size={20} color={colors.primary} style={{ marginRight: 12 }} />
            <Text style={commonStyles.text}>info@pickleball-salzburg.at</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 8,
              marginBottom: 12,
            }}
            onPress={handleWebsite}
          >
            <Icon name="globe" size={20} color={colors.primary} style={{ marginRight: 12 }} />
            <Text style={commonStyles.text}>pickleball-salzburg.at</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
            <Icon name="location" size={20} color={colors.primary} style={{ marginRight: 12 }} />
            <Text style={commonStyles.text}>Salzburg, Österreich</Text>
          </View>
        </View>

        {/* Social Media */}
        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 16 }]}>
            Folge uns
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <TouchableOpacity
              style={{
                alignItems: 'center',
                padding: 16,
              }}
              onPress={() => handleSocialMedia('facebook')}
            >
              <Icon name="logo-facebook" size={32} color={colors.primary} />
              <Text style={[commonStyles.textLight, { fontSize: 12, marginTop: 8 }]}>
                Facebook
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                alignItems: 'center',
                padding: 16,
              }}
              onPress={() => handleSocialMedia('instagram')}
            >
              <Icon name="logo-instagram" size={32} color={colors.primary} />
              <Text style={[commonStyles.textLight, { fontSize: 12, marginTop: 8 }]}>
                Instagram
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                alignItems: 'center',
                padding: 16,
              }}
              onPress={() => handleSocialMedia('email')}
            >
              <Icon name="mail" size={32} color={colors.primary} />
              <Text style={[commonStyles.textLight, { fontSize: 12, marginTop: 8 }]}>
                E-Mail
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* App Features */}
        <View style={[commonStyles.card]}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 16 }]}>
            App-Features
          </Text>
          
          <View style={{ marginBottom: 12 }}>
            <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 4 }]}>
              📅 Event-Management
            </Text>
            <Text style={[commonStyles.textLight, { fontSize: 14 }]}>
              Entdecke und melde dich für kommende Events an
            </Text>
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 4 }]}>
              📰 Aktuelle Nachrichten
            </Text>
            <Text style={[commonStyles.textLight, { fontSize: 14 }]}>
              Bleibe über Vereinsnachrichten und Updates informiert
            </Text>
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 4 }]}>
              📱 QR-Code Profil
            </Text>
            <Text style={[commonStyles.textLight, { fontSize: 14 }]}>
              Teile dein Profil schnell und einfach mit anderen
            </Text>
          </View>

          <View>
            <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 4 }]}>
              👤 Profil-Verwaltung
            </Text>
            <Text style={[commonStyles.textLight, { fontSize: 14 }]}>
              Verwalte deine persönlichen Daten und Einstellungen
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
