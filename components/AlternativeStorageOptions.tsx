
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Linking, ScrollView } from 'react-native';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import Icon from './Icon';

interface StorageProvider {
  id: string;
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  setupComplexity: 'Einfach' | 'Mittel' | 'Schwer';
  cost: 'Kostenlos' | 'Günstig' | 'Mittel' | 'Teuer';
  icon: string;
  setupUrl?: string;
  docsUrl?: string;
}

export default function AlternativeStorageOptions() {
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);

  const storageProviders: StorageProvider[] = [
    {
      id: 'supabase',
      name: 'Supabase Storage',
      description: 'Integrierte Speicherlösung von Supabase',
      pros: [
        'Nahtlose Integration mit der App',
        'Automatische Authentifizierung',
        'Row Level Security (RLS)',
        'Kostenloser Tier verfügbar'
      ],
      cons: [
        'Erfordert Storage-Setup',
        'RLS-Policies müssen konfiguriert werden',
        'Begrenzte Speicherkapazität im kostenlosen Tier'
      ],
      setupComplexity: 'Mittel',
      cost: 'Kostenlos',
      icon: 'cloud-upload',
      setupUrl: 'https://supabase.com/dashboard/project/asugynuigbnrsynczdhe/storage/buckets',
      docsUrl: 'https://supabase.com/docs/guides/storage'
    },
    {
      id: 'cloudinary',
      name: 'Cloudinary',
      description: 'Cloud-basierte Bildverwaltung mit automatischer Optimierung',
      pros: [
        'Automatische Bildoptimierung',
        'Verschiedene Bildformate und -größen',
        'CDN-Integration',
        'Umfangreiche Transformations-APIs',
        'Kostenloser Tier mit 25 GB'
      ],
      cons: [
        'Zusätzliche Abhängigkeit',
        'Erfordert API-Schlüssel-Management',
        'Kosten bei höherem Verbrauch'
      ],
      setupComplexity: 'Einfach',
      cost: 'Kostenlos',
      icon: 'image',
      setupUrl: 'https://cloudinary.com/users/register/free',
      docsUrl: 'https://cloudinary.com/documentation'
    },
    {
      id: 'aws-s3',
      name: 'Amazon S3',
      description: 'Skalierbare Cloud-Speicherlösung von AWS',
      pros: [
        'Extrem skalierbar',
        'Sehr zuverlässig',
        'Günstige Preise bei großen Mengen',
        'Weltweite Verfügbarkeit'
      ],
      cons: [
        'Komplexere Einrichtung',
        'AWS-Kenntnisse erforderlich',
        'Zusätzliche Kosten für Datenübertragung'
      ],
      setupComplexity: 'Schwer',
      cost: 'Günstig',
      icon: 'server',
      setupUrl: 'https://aws.amazon.com/s3/',
      docsUrl: 'https://docs.aws.amazon.com/s3/'
    },
    {
      id: 'firebase',
      name: 'Firebase Storage',
      description: 'Google\'s Cloud-Speicherlösung',
      pros: [
        'Einfache Integration',
        'Automatische Skalierung',
        'Offline-Unterstützung',
        'Kostenloser Tier verfügbar'
      ],
      cons: [
        'Google-Abhängigkeit',
        'Begrenzte Anpassungsmöglichkeiten',
        'Vendor Lock-in'
      ],
      setupComplexity: 'Einfach',
      cost: 'Kostenlos',
      icon: 'flame',
      setupUrl: 'https://firebase.google.com/',
      docsUrl: 'https://firebase.google.com/docs/storage'
    },
    {
      id: 'imgur',
      name: 'Imgur API',
      description: 'Einfache Bildhosting-Lösung',
      pros: [
        'Sehr einfache API',
        'Kostenlos für moderate Nutzung',
        'Keine Registrierung für anonyme Uploads',
        'Schnelle Integration'
      ],
      cons: [
        'Begrenzte Kontrolle über Bilder',
        'Nicht für professionelle Apps geeignet',
        'Rate Limits'
      ],
      setupComplexity: 'Einfach',
      cost: 'Kostenlos',
      icon: 'images',
      setupUrl: 'https://api.imgur.com/',
      docsUrl: 'https://apidocs.imgur.com/'
    },
    {
      id: 'local',
      name: 'Lokale Speicherung',
      description: 'Bilder lokal auf dem Gerät speichern',
      pros: [
        'Keine externe Abhängigkeit',
        'Kostenlos',
        'Sofortige Verfügbarkeit',
        'Datenschutz'
      ],
      cons: [
        'Bilder gehen bei App-Updates verloren',
        'Nicht zwischen Geräten synchronisiert',
        'Begrenzte Speicherkapazität',
        'Keine Backup-Funktion'
      ],
      setupComplexity: 'Einfach',
      cost: 'Kostenlos',
      icon: 'phone-portrait'
    }
  ];

  const toggleProvider = (providerId: string) => {
    setExpandedProvider(expandedProvider === providerId ? null : providerId);
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => {
      console.error('Error opening URL:', err);
      Alert.alert('Fehler', 'Link konnte nicht geöffnet werden.');
    });
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Einfach': return colors.success;
      case 'Mittel': return colors.warning;
      case 'Schwer': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const getCostColor = (cost: string) => {
    switch (cost) {
      case 'Kostenlos': return colors.success;
      case 'Günstig': return colors.primary;
      case 'Mittel': return colors.warning;
      case 'Teuer': return colors.error;
      default: return colors.textSecondary;
    }
  };

  return (
    <ScrollView style={[commonStyles.container, { padding: 20 }]}>
      <View style={{ alignItems: 'center', marginBottom: 30 }}>
        <Icon name="cloud-upload" size={48} color={colors.primary} />
        <Text style={[commonStyles.title, { marginTop: 10 }]}>
          Speicheroptionen für Profilbilder
        </Text>
        <Text style={[commonStyles.subtitle, { textAlign: 'center', marginTop: 5 }]}>
          Verschiedene Lösungen für die Bildspeicherung
        </Text>
      </View>

      <View style={[commonStyles.card, { marginBottom: 20, backgroundColor: colors.primary + '10' }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Icon name="information-circle" size={20} color={colors.primary} />
          <Text style={[commonStyles.text, { fontWeight: '600', marginLeft: 8, color: colors.primary }]}>
            Warum funktioniert Supabase Storage nicht?
          </Text>
        </View>
        <Text style={[commonStyles.textLight, { lineHeight: 18 }]}>
          Supabase Storage erfordert eine einmalige Einrichtung von Storage-Buckets und RLS-Policies. 
          Ohne diese Konfiguration können keine Bilder hochgeladen werden.
        </Text>
      </View>

      {storageProviders.map((provider) => (
        <View key={provider.id} style={[commonStyles.card, { marginBottom: 12 }]}>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 4 }}
            onPress={() => toggleProvider(provider.id)}
          >
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.primary + '20',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12
            }}>
              <Icon name={provider.icon} size={20} color={colors.primary} />
            </View>
            
            <View style={{ flex: 1 }}>
              <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 2 }]}>
                {provider.name}
              </Text>
              <Text style={[commonStyles.textLight, { fontSize: 12 }]}>
                {provider.description}
              </Text>
            </View>
            
            <View style={{ alignItems: 'flex-end', marginLeft: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <View style={{
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  backgroundColor: getComplexityColor(provider.setupComplexity) + '20',
                  borderRadius: 4,
                  marginRight: 4
                }}>
                  <Text style={[
                    commonStyles.textLight, 
                    { fontSize: 10, color: getComplexityColor(provider.setupComplexity) }
                  ]}>
                    {provider.setupComplexity}
                  </Text>
                </View>
                <View style={{
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  backgroundColor: getCostColor(provider.cost) + '20',
                  borderRadius: 4
                }}>
                  <Text style={[
                    commonStyles.textLight, 
                    { fontSize: 10, color: getCostColor(provider.cost) }
                  ]}>
                    {provider.cost}
                  </Text>
                </View>
              </View>
              <Icon 
                name={expandedProvider === provider.id ? "chevron-up" : "chevron-down"} 
                size={16} 
                color={colors.textSecondary} 
              />
            </View>
          </TouchableOpacity>

          {expandedProvider === provider.id && (
            <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border }}>
              <View style={{ marginBottom: 16 }}>
                <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8, color: colors.success }]}>
                  ✅ Vorteile:
                </Text>
                {provider.pros.map((pro, index) => (
                  <Text key={index} style={[commonStyles.textLight, { fontSize: 12, marginBottom: 4, marginLeft: 8 }]}>
                    • {pro}
                  </Text>
                ))}
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8, color: colors.warning }]}>
                  ⚠️ Nachteile:
                </Text>
                {provider.cons.map((con, index) => (
                  <Text key={index} style={[commonStyles.textLight, { fontSize: 12, marginBottom: 4, marginLeft: 8 }]}>
                    • {con}
                  </Text>
                ))}
              </View>

              <View style={{ flexDirection: 'row', gap: 8 }}>
                {provider.setupUrl && (
                  <TouchableOpacity
                    style={[buttonStyles.primary, { flex: 1, paddingVertical: 8 }]}
                    onPress={() => openLink(provider.setupUrl!)}
                  >
                    <Text style={[commonStyles.buttonTextWhite, { fontSize: 12 }]}>
                      Setup starten
                    </Text>
                  </TouchableOpacity>
                )}
                
                {provider.docsUrl && (
                  <TouchableOpacity
                    style={[buttonStyles.outline, { flex: 1, paddingVertical: 8 }]}
                    onPress={() => openLink(provider.docsUrl!)}
                  >
                    <Text style={[commonStyles.buttonText, { color: colors.primary, fontSize: 12 }]}>
                      Dokumentation
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>
      ))}

      <View style={[commonStyles.card, { marginTop: 20, backgroundColor: colors.warning + '10' }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Icon name="bulb" size={20} color={colors.warning} />
          <Text style={[commonStyles.text, { fontWeight: '600', marginLeft: 8, color: colors.warning }]}>
            Empfehlung
          </Text>
        </View>
        <Text style={[commonStyles.textLight, { lineHeight: 18, marginBottom: 12 }]}>
          Für eine professionelle App empfehlen wir:
        </Text>
        <Text style={[commonStyles.textLight, { fontSize: 12, lineHeight: 16, marginBottom: 4 }]}>
          1. <Text style={{ fontWeight: '500' }}>Kurzfristig:</Text> Lokale Speicherung für sofortige Funktionalität
        </Text>
        <Text style={[commonStyles.textLight, { fontSize: 12, lineHeight: 16, marginBottom: 4 }]}>
          2. <Text style={{ fontWeight: '500' }}>Mittelfristig:</Text> Supabase Storage richtig einrichten
        </Text>
        <Text style={[commonStyles.textLight, { fontSize: 12, lineHeight: 16 }]}>
          3. <Text style={{ fontWeight: '500' }}>Langfristig:</Text> Cloudinary für optimale Bildverwaltung
        </Text>
      </View>
    </ScrollView>
  );
}
