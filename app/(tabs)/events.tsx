
import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from '../../components/Icon';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { isEventUpcoming, getTimeUntilEvent } from '../../utils/dateUtils';
import { 
  scheduleEventReminderNotification, 
  scheduleEventRegistrationNotification,
  cancelScheduledNotification 
} from '../../utils/notificationUtils';
import { LinearGradient } from 'expo-linear-gradient';

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
  notificationId?: string;
}

export default function EventsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { theme, colors } = useTheme();
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
        return colors.accent;
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

      // Find the event to get details for notification
      const event = events.find(e => e.id === eventId);
      if (event) {
        // Send registration confirmation notification
        await scheduleEventRegistrationNotification(event.title);
        
        // Schedule reminder notification
        const eventStartTime = new Date(event.start_time);
        await scheduleEventReminderNotification(event.title, eventStartTime, eventId);
      }

      Alert.alert('Erfolgreich angemeldet! ✅', 'Du erhältst eine Erinnerung vor dem Event.');
      
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    centerContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    header: {
      marginBottom: 30,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    emptyCard: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      alignItems: 'center',
      padding: 40,
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyText: {
      fontSize: 16,
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
      fontWeight: '600',
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.textLight,
      textAlign: 'center',
    },
    eventCard: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: theme === 'dark' ? colors.shadowDark : colors.shadowLight,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: theme === 'dark' ? 0.3 : 0.1,
      shadowRadius: 12,
      elevation: 5,
    },
    nextEventCard: {
      borderWidth: 2,
      borderColor: colors.primary,
      backgroundColor: theme === 'dark' ? colors.surfaceElevated : colors.surface,
      shadowColor: colors.primary,
      shadowOpacity: theme === 'dark' ? 0.4 : 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
    badge: {
      position: 'absolute',
      top: -8,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      zIndex: 1,
      shadowColor: colors.black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    nextEventBadge: {
      right: 16,
      backgroundColor: colors.primary,
    },
    registrationBadge: {
      left: 16,
    },
    badgeText: {
      color: colors.white,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    eventHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
      shadowColor: colors.black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    eventInfo: {
      flex: 1,
    },
    eventTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
      letterSpacing: 0.3,
    },
    eventMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    eventType: {
      fontSize: 13,
      color: colors.textSecondary,
      marginRight: 12,
      fontWeight: '500',
    },
    eventTime: {
      fontSize: 13,
      color: colors.primary,
      fontWeight: '700',
    },
    eventDetails: {
      marginBottom: 16,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    detailText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginLeft: 10,
      flex: 1,
    },
    description: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
    },
    descriptionText: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 8,
    },
    readMoreButton: {
      marginTop: 4,
    },
    readMoreText: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '700',
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 10,
    },
    button: {
      flex: 1,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    secondaryButton: {
      backgroundColor: theme === 'dark' ? colors.surfaceElevated : colors.white,
      borderWidth: 2,
      borderColor: colors.primary,
    },
    primaryButton: {
      backgroundColor: colors.primary,
    },
    dangerButton: {
      backgroundColor: colors.error,
    },
    buttonText: {
      fontSize: 15,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    secondaryButtonText: {
      color: colors.primary,
    },
    primaryButtonText: {
      color: colors.white,
    },
    loadingText: {
      fontSize: 16,
      color: colors.text,
    },
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Events werden geladen...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Kommende Events</Text>
          <Text style={styles.subtitle}>
            Entdecke die nächsten Pickleball-Events
          </Text>
        </View>

        {/* Events List */}
        {events.length === 0 ? (
          <View style={styles.emptyCard}>
            <Icon name="calendar" size={56} color={colors.textLight} style={{ marginBottom: 20 }} />
            <Text style={styles.emptyText}>
              Keine kommenden Events
            </Text>
            <Text style={styles.emptySubtext}>
              Schau später wieder vorbei.
            </Text>
          </View>
        ) : (
          events.map((event, index) => (
            <View 
              key={event.id} 
              style={[
                styles.eventCard,
                isNextEvent(index) && styles.nextEventCard
              ]}
            >
              {/* Next Event Badge */}
              {isNextEvent(index) && (
                <View style={[styles.badge, styles.nextEventBadge]}>
                  <Text style={styles.badgeText}>
                    NÄCHSTES EVENT
                  </Text>
                </View>
              )}

              {/* Registration Status Badge */}
              {event.isRegistered && (
                <View style={[
                  styles.badge, 
                  styles.registrationBadge,
                  {
                    backgroundColor: event.registrationStatus === 'ACCEPTED' ? colors.success : 
                                   event.registrationStatus === 'DECLINED' ? colors.error : colors.accent
                  }
                ]}>
                  <Text style={styles.badgeText}>
                    {event.registrationStatus === 'ACCEPTED' ? 'BESTÄTIGT' : 
                     event.registrationStatus === 'DECLINED' ? 'ABGELEHNT' : 'ANGEMELDET'}
                  </Text>
                </View>
              )}

              {/* Event Header */}
              <View style={[styles.eventHeader, { marginTop: event.isRegistered || isNextEvent(index) ? 12 : 0 }]}>
                <LinearGradient
                  colors={[getEventTypeColor(event.type), getEventTypeColor(event.type) + 'CC']}
                  style={styles.iconContainer}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Icon 
                    name={getEventTypeIcon(event.type)} 
                    size={24} 
                    color={colors.white} 
                  />
                </LinearGradient>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>
                    {event.title}
                  </Text>
                  <View style={styles.eventMeta}>
                    <Text style={styles.eventType}>
                      {getEventTypeLabel(event.type)}
                    </Text>
                    <Text style={styles.eventTime}>
                      {getTimeUntilEvent(event.start_time)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Event Details */}
              <View style={styles.eventDetails}>
                <View style={styles.detailRow}>
                  <Icon name="calendar" size={18} color={colors.textLight} />
                  <Text style={styles.detailText}>
                    {formatDate(event.start_time)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="time" size={18} color={colors.textLight} />
                  <Text style={styles.detailText}>
                    {formatTime(event.start_time)} - {formatTime(event.end_time)}
                  </Text>
                </View>
                {event.location && (
                  <View style={styles.detailRow}>
                    <Icon name="location" size={18} color={colors.textLight} />
                    <Text style={styles.detailText}>{event.location}</Text>
                  </View>
                )}
                {event.description && (
                  <View style={styles.description}>
                    <Text style={styles.descriptionText}>
                      {truncateDescription(event.description)}
                    </Text>
                    {event.description.length > 100 && (
                      <TouchableOpacity 
                        style={styles.readMoreButton}
                        onPress={() => handleReadMore(event.id)}
                      >
                        <Text style={styles.readMoreText}>
                          Mehr lesen →
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={() => handleReadMore(event.id)}
                >
                  <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                    Details
                  </Text>
                </TouchableOpacity>

                {user && (
                  event.isRegistered ? (
                    <TouchableOpacity
                      style={[styles.button, styles.dangerButton]}
                      onPress={() => handleLeaveEvent(event.id)}
                    >
                      <Text style={[styles.buttonText, styles.primaryButtonText]}>
                        Abmelden
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.button, styles.primaryButton]}
                      onPress={() => handleJoinEvent(event.id)}
                    >
                      <Text style={[styles.buttonText, styles.primaryButtonText]}>
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
