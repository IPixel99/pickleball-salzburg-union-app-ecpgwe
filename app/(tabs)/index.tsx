
import React from 'react';
import { Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { commonStyles, colors } from '../../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../../components/Icon';

export default function HomeScreen() {
  const quickActions = [
    { title: 'Nächstes Event', subtitle: 'Training am Freitag', icon: 'calendar' as const },
    { title: 'Neue Nachrichten', subtitle: '3 ungelesene', icon: 'mail' as const },
    { title: 'Mein Profil', subtitle: 'Profil bearbeiten', icon: 'person' as const },
  ];

  const upcomingEvents = [
    { title: 'Wöchentliches Training', date: 'Freitag, 20:00', location: 'Sporthalle Salzburg' },
    { title: 'Turnier Vorbereitung', date: 'Samstag, 14:00', location: 'Tennisplatz Nord' },
    { title: 'Vereinsmeisterschaft', date: 'Sonntag, 10:00', location: 'Hauptplatz' },
  ];

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ marginBottom: 30 }}>
          <Text style={commonStyles.title}>Willkommen zurück!</Text>
          <Text style={commonStyles.textLight}>
            Hier sind die neuesten Updates vom Pickleball Salzburg Union
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={commonStyles.section}>
          <Text style={commonStyles.subtitle}>Schnellzugriff</Text>
          {quickActions.map((action, index) => (
            <TouchableOpacity key={index} style={commonStyles.card}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 50,
                  height: 50,
                  backgroundColor: colors.highlight,
                  borderRadius: 25,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16,
                }}>
                  <Icon name={action.icon} size={24} color={colors.secondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 4 }]}>
                    {action.title}
                  </Text>
                  <Text style={commonStyles.textLight}>{action.subtitle}</Text>
                </View>
                <Icon name="chevron-forward" size={20} color={colors.textLight} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Upcoming Events */}
        <View style={commonStyles.section}>
          <Text style={commonStyles.subtitle}>Kommende Events</Text>
          {upcomingEvents.map((event, index) => (
            <View key={index} style={commonStyles.card}>
              <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
                {event.title}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Icon name="time" size={16} color={colors.textLight} style={{ marginRight: 8 }} />
                <Text style={commonStyles.textLight}>{event.date}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="location" size={16} color={colors.textLight} style={{ marginRight: 8 }} />
                <Text style={commonStyles.textLight}>{event.location}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Club Info */}
        <View style={[commonStyles.card, { backgroundColor: colors.highlight, marginBottom: 20 }]}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
            Über Pickleball Salzburg Union
          </Text>
          <Text style={commonStyles.textLight}>
            Wir sind ein dynamischer Pickleball-Verein in Salzburg, der sich der Förderung 
            dieses aufregenden Sports widmet. Schließe dich unserer Gemeinschaft an!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
