
import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import Icon from '../../components/Icon';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import { useAuth } from '../../hooks/useAuth';
import { formatDate, formatTime, getTimeUntilEvent } from '../../utils/dateUtils';

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

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id]);

  const fetchEvent = async () => {
    try {
      console.log('Fetching event details for ID:', id);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching event:', error);
        Alert.alert('Fehler', 'Event konnte nicht geladen werden.');
        router.back();
        return;
      }

      console.log('Event details fetched:', data);
      setEvent(data);
    } catch (error) {
      console.error('Error in fetchEvent:', error);
      Alert.alert('Fehler', 'Ein unerwarteter Fehler ist aufgetreten.');
      router.back();
    } finally {
      setLoading(false);
    }
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

  const handleJoinEvent = async () => {
    if (!user) {
      Alert.alert('Anmeldung erforderlich', 'Du musst angemeldet sein, um an Events teilzunehmen.');
      return;
    }

    console.log('Joining event:', event?.id);
    // TODO: Implement event participation logic
    Alert.alert('Event beitreten', 'Diese Funktion wird bald verfügbar sein!');
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={[commonStyles.container, commonStyles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[commonStyles.text, { marginTop: 16 }]}>
          Event wird geladen...
        </Text>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={[commonStyles.container, commonStyles.centerContent]}>
        <Icon name="alert-circle" size={48} color={colors.error} />
        <Text style={[commonStyles.text, { marginTop: 16, textAlign: 'center' }]}>
          Event nicht gefunden
        </Text>
        <TouchableOpacity
          style={[buttonStyles.primary, { marginTop: 20 }]}
          onPress={handleBack}
        >
          <Text style={commonStyles.buttonTextWhite}>Zurück</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

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
            Event Details
          </Text>
        </View>

        {/* Event Card */}
        <View style={[commonStyles.card, { marginBottom: 30 }]}>
          {/* Event Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <View style={{
              width: 60,
              height: 60,
              backgroundColor: getEventTypeColor(event.type),
              borderRadius: 30,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
            }}>
              <Icon 
                name={getEventTypeIcon(event.type)} 
                size={28} 
                color={colors.white} 
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[commonStyles.title, { marginBottom: 4 }]}>
                {event.title}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[commonStyles.textLight, { fontSize: 14, marginRight: 12 }]}>
                  {getEventTypeLabel(event.type)}
                </Text>
                <Text style={[commonStyles.textLight, { fontSize: 14, color: colors.primary, fontWeight: '600' }]}>
                  {getTimeUntilEvent(event.start_time)}
                </Text>
              </View>
            </View>
          </View>

          {/* Event Details */}
          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Icon name="calendar" size={20} color={colors.textLight} style={{ marginRight: 12 }} />
              <Text style={[commonStyles.text, { fontSize: 16 }]}>
                {formatDate(event.start_time)}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Icon name="time" size={20} color={colors.textLight} style={{ marginRight: 12 }} />
              <Text style={[commonStyles.text, { fontSize: 16 }]}>
                {formatTime(event.start_time)} - {formatTime(event.end_time)}
              </Text>
            </View>
            {event.location && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Icon name="location" size={20} color={colors.textLight} style={{ marginRight: 12 }} />
                <Text style={[commonStyles.text, { fontSize: 16 }]}>
                  {event.location}
                </Text>
              </View>
            )}
          </View>

          {/* Description */}
          {event.description && (
            <View style={{ marginBottom: 24 }}>
              <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 12 }]}>
                Beschreibung
              </Text>
              <Text style={[commonStyles.text, { lineHeight: 24 }]}>
                {event.description}
              </Text>
            </View>
          )}

          {/* Join Button */}
          <TouchableOpacity
            style={[buttonStyles.primary, { width: '100%' }]}
            onPress={handleJoinEvent}
          >
            <Text style={commonStyles.buttonTextWhite}>
              An Event teilnehmen
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
