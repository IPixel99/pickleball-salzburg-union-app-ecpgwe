
import React, { useState } from 'react';
import { Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../../components/Icon';

export default function EventsScreen() {
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Mock data - will be replaced with Supabase data later
  const events = [
    {
      id: 1,
      title: 'Wöchentliches Training',
      description: 'Regelmäßiges Training für alle Spielstärken. Anfänger willkommen!',
      date: '2024-01-26',
      time: '20:00',
      location: 'Sporthalle Salzburg',
      type: 'training',
      participants: 12,
      maxParticipants: 20,
    },
    {
      id: 2,
      title: 'Vereinsmeisterschaft 2024',
      description: 'Jährliche Vereinsmeisterschaft mit verschiedenen Kategorien.',
      date: '2024-02-15',
      time: '10:00',
      location: 'Hauptplatz Salzburg',
      type: 'tournament',
      participants: 8,
      maxParticipants: 16,
    },
    {
      id: 3,
      title: 'Anfänger Workshop',
      description: 'Grundlagen des Pickleball für neue Spieler.',
      date: '2024-02-03',
      time: '14:00',
      location: 'Tennisplatz Nord',
      type: 'workshop',
      participants: 5,
      maxParticipants: 10,
    },
    {
      id: 4,
      title: 'Freundschaftsspiel vs. Innsbruck',
      description: 'Freundschaftsspiel gegen den Pickleball Club Innsbruck.',
      date: '2024-02-20',
      time: '16:00',
      location: 'Auswärts - Innsbruck',
      type: 'match',
      participants: 6,
      maxParticipants: 8,
    },
  ];

  const filters = [
    { key: 'all', label: 'Alle' },
    { key: 'training', label: 'Training' },
    { key: 'tournament', label: 'Turniere' },
    { key: 'workshop', label: 'Workshops' },
    { key: 'match', label: 'Spiele' },
  ];

  const filteredEvents = selectedFilter === 'all' 
    ? events 
    : events.filter(event => event.type === selectedFilter);

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'training': return colors.primary;
      case 'tournament': return colors.accent;
      case 'workshop': return colors.secondary;
      case 'match': return colors.warning;
      default: return colors.textLight;
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'training': return 'fitness' as const;
      case 'tournament': return 'trophy' as const;
      case 'workshop': return 'school' as const;
      case 'match': return 'people' as const;
      default: return 'calendar' as const;
    }
  };

  const handleJoinEvent = (eventId: number) => {
    console.log(`Joining event ${eventId} - will integrate with Supabase later`);
    // TODO: Integrate with Supabase to handle event registration
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.content}>
        {/* Header */}
        <View style={{ marginBottom: 20 }}>
          <Text style={commonStyles.title}>Events</Text>
          <Text style={commonStyles.textLight}>
            Entdecke kommende Events und melde dich an
          </Text>
        </View>

        {/* Filter Buttons */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 20 }}
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                {
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  marginRight: 12,
                  borderWidth: 1,
                },
                selectedFilter === filter.key
                  ? { backgroundColor: colors.primary, borderColor: colors.primary }
                  : { backgroundColor: 'transparent', borderColor: colors.border }
              ]}
              onPress={() => setSelectedFilter(filter.key)}
            >
              <Text style={[
                { fontSize: 14, fontWeight: '500' },
                selectedFilter === filter.key
                  ? { color: '#FFFFFF' }
                  : { color: colors.text }
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Events List */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {filteredEvents.map((event) => (
            <View key={event.id} style={commonStyles.card}>
              {/* Event Header */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <View style={{
                  width: 40,
                  height: 40,
                  backgroundColor: getEventTypeColor(event.type),
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}>
                  <Icon name={getEventTypeIcon(event.type)} size={20} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 4 }]}>
                    {event.title}
                  </Text>
                  <Text style={commonStyles.textLight}>{event.description}</Text>
                </View>
              </View>

              {/* Event Details */}
              <View style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Icon name="calendar" size={16} color={colors.textLight} style={{ marginRight: 8 }} />
                  <Text style={commonStyles.textLight}>
                    {new Date(event.date).toLocaleDateString('de-DE', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Icon name="time" size={16} color={colors.textLight} style={{ marginRight: 8 }} />
                  <Text style={commonStyles.textLight}>{event.time}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Icon name="location" size={16} color={colors.textLight} style={{ marginRight: 8 }} />
                  <Text style={commonStyles.textLight}>{event.location}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="people" size={16} color={colors.textLight} style={{ marginRight: 8 }} />
                  <Text style={commonStyles.textLight}>
                    {event.participants}/{event.maxParticipants} Teilnehmer
                  </Text>
                </View>
              </View>

              {/* Join Button */}
              <TouchableOpacity
                style={[
                  buttonStyles.primary,
                  event.participants >= event.maxParticipants && { backgroundColor: colors.textLight }
                ]}
                onPress={() => handleJoinEvent(event.id)}
                disabled={event.participants >= event.maxParticipants}
              >
                <Text style={commonStyles.buttonTextWhite}>
                  {event.participants >= event.maxParticipants ? 'Ausgebucht' : 'Anmelden'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
