
import React from 'react';
import { Text, View, ScrollView, TouchableOpacity, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from '../../components/Icon';
import { useTheme } from '../../contexts/ThemeContext';

export default function AboutScreen() {
  const router = useRouter();
  const { colors } = useTheme();

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
            Über die App
          </Text>
        </View>

        {/* App Logo and Info */}
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 20,
          alignItems: 'center',
          marginBottom: 20,
          borderWidth: 1,
          borderColor: colors.border,
        }}>
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
          <Text style={{ 
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 8, 
            textAlign: 'center',
            color: colors.text,
          }}>
            Pickleball Salzburg Union
          </Text>
          <Text style={{ 
            textAlign: 'center', 
            marginBottom: 16,
            fontSize: 14,
            color: colors.textSecondary,
          }}>
            Die offizielle App des Pickleball Salzburg Union Vereins
          </Text>
          <Text style={{ 
            fontSize: 12, 
            textAlign: 'center',
            color: colors.textLight,
          }}>
            Version 1.0.0
          </Text>
        </View>

        {/* About the Club */}
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
            Über den Verein
          </Text>
          <Text style={{ 
            lineHeight: 22, 
            marginBottom: 16,
            fontSize: 14,
            color: colors.textSecondary,
          }}>
            Der Pickleball Salzburg Union ist ein dynamischer Sportverein, der sich der Förderung 
            und Entwicklung des Pickleball-Sports in Salzburg und Umgebung widmet. Wir bieten 
            regelmäßige Trainings, Turniere und Events für Spieler aller Altersgruppen und 
            Fähigkeitsstufen.
          </Text>
          <Text style={{ 
            lineHeight: 22,
            fontSize: 14,
            color: colors.textSecondary,
          }}>
            Unser Ziel ist es, eine freundliche und inklusive Gemeinschaft zu schaffen, in der 
            jeder die Freude am Pickleball entdecken und seine Fähigkeiten verbessern kann.
          </Text>
        </View>

        {/* Contact Information */}
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
            <Text style={{ fontSize: 15, color: colors.text }}>
              info@pickleball-salzburg.at
            </Text>
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
            <Text style={{ fontSize: 15, color: colors.text }}>
              pickleball-salzburg.at
            </Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
            <Icon name="location" size={20} color={colors.primary} style={{ marginRight: 12 }} />
            <Text style={{ fontSize: 15, color: colors.text }}>
              Salzburg, Österreich
            </Text>
          </View>
        </View>

        {/* Social Media */}
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
              <Text style={{ 
                fontSize: 12, 
                marginTop: 8,
                color: colors.textSecondary,
              }}>
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
              <Text style={{ 
                fontSize: 12, 
                marginTop: 8,
                color: colors.textSecondary,
              }}>
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
              <Text style={{ 
                fontSize: 12, 
                marginTop: 8,
                color: colors.textSecondary,
              }}>
                E-Mail
              </Text>
            </TouchableOpacity>
          </View>
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
          
          <View style={{ marginBottom: 12 }}>
            <Text style={{ 
              fontSize: 15,
              fontWeight: '600', 
              marginBottom: 4,
              color: colors.text,
            }}>
              📅 Event-Management
            </Text>
            <Text style={{ 
              fontSize: 14,
              color: colors.textSecondary,
            }}>
              Entdecke und melde dich für kommende Events an
            </Text>
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={{ 
              fontSize: 15,
              fontWeight: '600', 
              marginBottom: 4,
              color: colors.text,
            }}>
              📰 Aktuelle Nachrichten
            </Text>
            <Text style={{ 
              fontSize: 14,
              color: colors.textSecondary,
            }}>
              Bleibe über Vereinsnachrichten und Updates informiert
            </Text>
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={{ 
              fontSize: 15,
              fontWeight: '600', 
              marginBottom: 4,
              color: colors.text,
            }}>
              📱 QR-Code Profil
            </Text>
            <Text style={{ 
              fontSize: 14,
              color: colors.textSecondary,
            }}>
              Teile dein Profil schnell und einfach mit anderen
            </Text>
          </View>

          <View>
            <Text style={{ 
              fontSize: 15,
              fontWeight: '600', 
              marginBottom: 4,
              color: colors.text,
            }}>
              👤 Profil-Verwaltung
            </Text>
            <Text style={{ 
              fontSize: 14,
              color: colors.textSecondary,
            }}>
              Verwalte deine persönlichen Daten und Einstellungen
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
