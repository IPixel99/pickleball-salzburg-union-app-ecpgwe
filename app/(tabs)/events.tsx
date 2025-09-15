
import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from '../../components/Icon';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { isEventUpcoming, getTimeUntilEvent } from '../../utils/dateUtils';

interface Event {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  type: 'GAME' | 'TOURNAMENT' | 'PRACTICE';
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface EventWithRegistration extends Event {
  isRegistered: boolean;
  registrationStatus?: 'PENDING' | 'ACCEPTED' | 'DECLINED';
}

export default function EventsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<EventWithRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      console.log('Fetching events from Supabase...');
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        Alert.alert('Fehler', 'Events konnten nicht geladen werden.');
        return;
      }

      console.log('Fetched events:', data);
      
      // Filter to show only upcoming events
      const upcomingEvents = (data || []).filter(event => isEventUpcoming(event.start_time));
      console.log('Filtered upcoming events:', upcomingEvents);
      
      // Check registration status for each event if user is logged in
      if (user) {
        const eventsWithRegistration = await Promise.all(
          upcomingEvents.map(async (event) => {
            const { data: registration } = await supabase
              .from('event_participants')
              .select('status')
              .eq('event_id', event.id)
              .eq('profile_id', user.id)
              .single();

            return {
              ...event,
              isRegistered: !!registration,
              registrationStatus: registration?.status
            };
          })
        );
        
        setEvents(eventsWithRegistration);
      } else {
        setEvents(upcomingEvents.map(event => ({ ...event, isRegistered: false })));
      }
    } catch (error) {
      console.error('Error in fetchEvents:', error);
      Alert.alert('Fehler', 'Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'GAME':
        return colors.primary;
      case 'TOURNAMENT':
        return colors.yellow;
      case 'PRACTICE':
        return colors.success;
      default:
        return colors.textLight;
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'GAME':
        return 'game-controller' as const;
      case 'TOURNAMENT':
        return 'trophy' as const;
      case 'PRACTICE':
        return 'fitness' as const;
      default:
        return 'calendar' as const;
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'GAME':
        return 'Spiel';
      case 'TOURNAMENT':
        return 'Turnier';
      case 'PRACTICE':
        return 'Training';
      default:
        return type;
    }
  };

  const handleJoinEvent = async (eventId: string) => {
    if (!user) {
      Alert.alert('Anmeldung erforderlich', 'Du musst angemeldet sein, um an Events teilzunehmen.');
      return;
    }

    try {
      console.log('Joining event:', eventId);
      
      // Check if already registered
      const { data: existingRegistration } = await supabase
        .from('event_participants')
        .select('id')
        .eq('event_id', eventId)
        .eq('profile_id', user.id)
        .single();

      if (existingRegistration) {
        Alert.alert('Bereits angemeldet', 'Du bist bereits für dieses Event angemeldet.');
        return;
      }

      // Create new registration
      const { error } = await supabase
        .from('event_participants')
        .insert({
          event_id: eventId,
          profile_id: user.id,
          status: 'PENDING'
        });

      if (error) {
        console.error('Error joining event:', error);
        Alert.alert('Fehler', 'Anmeldung fehlgeschlagen. Bitte versuche es erneut.');
        return;
      }

      Alert.alert('Erfolgreich angemeldet!', 'Du hast dich erfolgreich für das Event angemeldet.');
      
      // Refresh events to update registration status
      fetchEvents();
    } catch (error) {
      console.error('Error in handleJoinEvent:', error);
      Alert.alert('Fehler', 'Ein unerwarteter Fehler ist aufgetreten.');
    }
  };

  const handleLeaveEvent = async (eventId: string) => {
    if (!user) return;

    try {
      console.log('Leaving event:', eventId);
      
      const { error } = await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', eventId)
        .eq('profile_id', user.id);

      if (error) {
        console.error('Error leaving event:', error);
        Alert.alert('Fehler', 'Abmeldung fehlgeschlagen. Bitte versuche es erneut.');
        return;
      }

      Alert.alert('Erfolgreich abgemeldet!', 'Du hast dich erfolgreich vom Event abgemeldet.');
      
      // Refresh events to update registration status
      fetchEvents();
    } catch (error) {
      console.error('Error in handleLeaveEvent:', error);
      Alert.alert('Fehler', 'Ein unerwarteter Fehler ist aufgetreten.');
    }
  };

  const handleReadMore = (eventId: string) => {
    console.log('Navigating to event details:', eventId);
    router.push(`/events/${eventId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isNextEvent = (index: number) => {
    return index === 0 && events.length > 0;
  };

  const truncateDescription = (description: string | null, maxLength: number = 100) => {
    if (!description) return null;
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={commonStyles.centerContent}>
          <Text style={commonStyles.text}>Events werden geladen...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView 
        style={commonStyles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={{ marginBottom: 30 }}>
          <Text style={[commonStyles.title, { color: colors.primary }]}>Kommende Events</Text>
          <Text style={commonStyles.textLight}>
            Entdecke die nächsten Pickleball-Events und melde dich an
          </Text>
        </View>

        {/* Events List */}
        {events.length === 0 ? (
          <View style={[commonStyles.card, { alignItems: 'center', padding: 40 }]}>
            <Icon name="calendar" size={48} color={colors.textLight} style={{ marginBottom: 16 }} />
            <Text style={[commonStyles.text, { textAlign: 'center', marginBottom: 8 }]}>
              Keine kommenden Events
            </Text>
            <Text style={[commonStyles.textLight, { textAlign: 'center' }]}>
              Schau später wieder vorbei oder kontaktiere den Verein für weitere Informationen.
            </Text>
          </View>
        ) : (
          events.map((event, index) => (
            <View 
              key={event.id} 
              style={[
                commonStyles.card,
                isNextEvent(index) && {
                  borderWidth: 2,
                  borderColor: colors.primary,
                  backgroundColor: colors.primaryLight,
                }
              ]}
            >
              {/* Next Event Badge */}
              {isNextEvent(index) && (
                <View style={{
                  position: 'absolute',
                  top: -8,
                  right: 16,
                  backgroundColor: colors.primary,
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: 12,
                  zIndex: 1,
                }}>
                  <Text style={[commonStyles.text, { color: colors.white, fontSize: 12, fontWeight: '600' }]}>
                    Nächstes Event
                  </Text>
                </View>
              )}

              {/* Registration Status Badge */}
              {event.isRegistered && (
                <View style={{
                  position: 'absolute',
                  top: -8,
                  left: 16,
                  backgroundColor: event.registrationStatus === 'ACCEPTED' ? colors.success : 
                                 event.registrationStatus === 'DECLINED' ? colors.error : colors.yellow,
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: 12,
                  zIndex: 1,
                }}>
                  <Text style={[commonStyles.text, { color: colors.white, fontSize: 12, fontWeight: '600' }]}>
                    {event.registrationStatus === 'ACCEPTED' ? 'Bestätigt' : 
                     event.registrationStatus === 'DECLINED' ? 'Abgelehnt' : 'Angemeldet'}
                  </Text>
                </View>
              )}

              {/* Event Header */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: event.isRegistered ? 12 : 0 }}>
                <View style={{
                  width: 40,
                  height: 40,
                  backgroundColor: getEventTypeColor(event.type),
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}>
                  <Icon 
                    name={getEventTypeIcon(event.type)} 
                    size={20} 
                    color={colors.white} 
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 2 }]}>
                    {event.title}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[commonStyles.textLight, { fontSize: 12, marginRight: 8 }]}>
                      {getEventTypeLabel(event.type)}
                    </Text>
                    <Text style={[commonStyles.textLight, { fontSize: 12, color: colors.primary, fontWeight: '600' }]}>
                      {getTimeUntilEvent(event.start_time)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Event Details */}
              <View style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Icon name="calendar" size={16} color={colors.textLight} style={{ marginRight: 8 }} />
                  <Text style={commonStyles.textLight}>
                    {formatDate(event.start_time)}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Icon name="time" size={16} color={colors.textLight} style={{ marginRight: 8 }} />
                  <Text style={commonStyles.textLight}>
                    {formatTime(event.start_time)} - {formatTime(event.end_time)}
                  </Text>
                </View>
                {event.location && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Icon name="location" size={16} color={colors.textLight} style={{ marginRight: 8 }} />
                    <Text style={commonStyles.textLight}>{event.location}</Text>
                  </View>
                )}
                {event.description && (
                  <View style={{ marginTop: 8 }}>
                    <Text style={[commonStyles.textLight, { marginBottom: 8 }]}>
                      {truncateDescription(event.description)}
                    </Text>
                    {event.description.length > 100 && (
                      <TouchableOpacity onPress={() => handleReadMore(event.id)}>
                        <Text style={[commonStyles.text, { color: colors.primary, fontWeight: '600', fontSize: 14 }]}>
                          Mehr lesen
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>

              {/* Action Buttons */}
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  style={[
                    buttonStyles.secondary,
                    { flex: 1 }
                  ]}
                  onPress={() => handleReadMore(event.id)}
                >
                  <Text style={[commonStyles.text, { color: colors.primary, fontWeight: '600' }]}>
                    Details
                  </Text>
                </TouchableOpacity>

                {user && (
                  event.isRegistered ? (
                    <TouchableOpacity
                      style={[
                        buttonStyles.primary,
                        { 
                          flex: 1,
                          backgroundColor: colors.error,
                          borderColor: colors.error,
                        }
                      ]}
                      onPress={() => handleLeaveEvent(event.id)}
                    >
                      <Text style={[commonStyles.buttonTextWhite]}>
                        Abmelden
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[
                        buttonStyles.primary, 
                        { flex: 1 },
                        isNextEvent(index) && { backgroundColor: colors.primary }
                      ]}
                      onPress={() => handleJoinEvent(event.id)}
                    >
                      <Text style={commonStyles.buttonTextWhite}>
                        {isNextEvent(index) ? 'Jetzt teilnehmen' : 'Teilnehmen'}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
