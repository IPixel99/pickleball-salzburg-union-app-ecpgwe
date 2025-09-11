
import React, { useState } from 'react';
import { Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { commonStyles, colors } from '../../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../../components/Icon';

export default function NewsScreen() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock data - will be replaced with Supabase data later
  const news = [
    {
      id: 1,
      title: 'Neue Trainingszeiten ab Februar',
      content: 'Ab Februar ändern sich unsere Trainingszeiten. Das wöchentliche Training findet nun jeden Freitag um 20:00 Uhr statt. Bitte merkt euch den neuen Termin vor!',
      category: 'announcement',
      date: '2024-01-20',
      author: 'Vereinsvorstand',
      isImportant: true,
    },
    {
      id: 2,
      title: 'Erfolgreiche Teilnahme am Landesturnier',
      content: 'Unser Team hat beim Landesturnier in Linz den 3. Platz erreicht! Herzlichen Glückwunsch an alle Teilnehmer für diese großartige Leistung.',
      category: 'results',
      date: '2024-01-18',
      author: 'Sportleiter',
      isImportant: false,
    },
    {
      id: 3,
      title: 'Neue Mitglieder willkommen',
      content: 'Wir freuen uns, 5 neue Mitglieder in unserem Verein begrüßen zu dürfen. Ein herzliches Willkommen an alle Neuzugänge!',
      category: 'general',
      date: '2024-01-15',
      author: 'Mitgliederverwaltung',
      isImportant: false,
    },
    {
      id: 4,
      title: 'Wartungsarbeiten an der Sporthalle',
      content: 'Am kommenden Mittwoch finden Wartungsarbeiten in der Sporthalle statt. Das Training entfällt an diesem Tag. Ersatztermin wird noch bekannt gegeben.',
      category: 'announcement',
      date: '2024-01-12',
      author: 'Hallenmanagement',
      isImportant: true,
    },
    {
      id: 5,
      title: 'Pickleball Grundlagen Workshop',
      content: 'Für alle Interessierten bieten wir am 3. Februar einen Grundlagen Workshop an. Perfekt für Einsteiger und alle, die ihre Technik verbessern möchten.',
      category: 'events',
      date: '2024-01-10',
      author: 'Trainer Team',
      isImportant: false,
    },
  ];

  const categories = [
    { key: 'all', label: 'Alle', icon: 'newspaper' as const },
    { key: 'announcement', label: 'Ankündigungen', icon: 'megaphone' as const },
    { key: 'results', label: 'Ergebnisse', icon: 'trophy' as const },
    { key: 'events', label: 'Events', icon: 'calendar' as const },
    { key: 'general', label: 'Allgemein', icon: 'information-circle' as const },
  ];

  const filteredNews = selectedCategory === 'all' 
    ? news 
    : news.filter(item => item.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'announcement': return colors.warning;
      case 'results': return colors.accent;
      case 'events': return colors.primary;
      case 'general': return colors.secondary;
      default: return colors.textLight;
    }
  };

  const handleReadMore = (newsId: number) => {
    console.log(`Reading news ${newsId} - will integrate with Supabase later`);
    // TODO: Navigate to detailed news view or expand content
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.content}>
        {/* Header */}
        <View style={{ marginBottom: 20 }}>
          <Text style={commonStyles.title}>Nachrichten</Text>
          <Text style={commonStyles.textLight}>
            Bleibe auf dem Laufenden mit den neuesten Vereinsnachrichten
          </Text>
        </View>

        {/* Category Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 20 }}
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.key}
              style={[
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  marginRight: 12,
                  borderWidth: 1,
                },
                selectedCategory === category.key
                  ? { backgroundColor: colors.primary, borderColor: colors.primary }
                  : { backgroundColor: 'transparent', borderColor: colors.border }
              ]}
              onPress={() => setSelectedCategory(category.key)}
            >
              <Icon 
                name={category.icon} 
                size={16} 
                color={selectedCategory === category.key ? '#FFFFFF' : colors.textLight}
                style={{ marginRight: 6 }}
              />
              <Text style={[
                { fontSize: 14, fontWeight: '500' },
                selectedCategory === category.key
                  ? { color: '#FFFFFF' }
                  : { color: colors.text }
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* News List */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {filteredNews.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[
                commonStyles.card,
                item.isImportant && { borderLeftWidth: 4, borderLeftColor: colors.warning }
              ]}
              onPress={() => handleReadMore(item.id)}
            >
              {/* News Header */}
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
                <View style={{
                  width: 8,
                  height: 8,
                  backgroundColor: getCategoryColor(item.category),
                  borderRadius: 4,
                  marginTop: 8,
                  marginRight: 12,
                }} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={[commonStyles.text, { fontWeight: '600', flex: 1 }]}>
                      {item.title}
                    </Text>
                    {item.isImportant && (
                      <Icon name="alert-circle" size={16} color={colors.warning} />
                    )}
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={[commonStyles.textLight, { fontSize: 12 }]}>
                      {new Date(item.date).toLocaleDateString('de-DE')} • {item.author}
                    </Text>
                  </View>
                </View>
              </View>

              {/* News Content */}
              <Text style={[commonStyles.textLight, { lineHeight: 22, marginBottom: 12 }]}>
                {item.content}
              </Text>

              {/* Read More */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[commonStyles.textLight, { color: colors.primary, fontSize: 14, fontWeight: '500' }]}>
                  Weiterlesen
                </Text>
                <Icon name="chevron-forward" size={16} color={colors.primary} style={{ marginLeft: 4 }} />
              </View>
            </TouchableOpacity>
          ))}

          {filteredNews.length === 0 && (
            <View style={[commonStyles.card, { alignItems: 'center', paddingVertical: 40 }]}>
              <Icon name="newspaper-outline" size={48} color={colors.textLight} style={{ marginBottom: 16 }} />
              <Text style={commonStyles.text}>Keine Nachrichten in dieser Kategorie</Text>
              <Text style={commonStyles.textLight}>Schau später noch einmal vorbei</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
