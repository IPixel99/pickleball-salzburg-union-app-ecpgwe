
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from './Icon';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { commonStyles, colors } from '../styles/commonStyles';
import { formatDate, formatTime, isEventUpcoming } from '../utils/dateUtils';

interface EventRegistration {
  id: string;
  event_id: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  created_at: string;
  event: {
    id: string;
    title: string;
    description: string | null;
    start_time: string;
    end_time: string;
    location: string | null;
    type: 'GAME' | 'TOURNAMENT' | 'PRACTICE';
  };
}

interface EventRegistrationsProps {
  showAll?: boolean;
  limit?: number;
  onViewAll?: () => void;
}

export default function EventRegistrations({ showAll = false, limit = 3, onViewAll }: EventRegistrationsProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchRegistrations();
    }
  }, [user]);

  const fetchRegistrations = async () => {
    if (!user) return;

    try {
      console.log('Fetching event registrations for user:', user.id);
      
      let query = supabase
        .from('event_participants')
        .select(`
          id,
          event_id,
          status,
          created_at,
          events!inner (
            id,
            title,
            description,
            start_time,
            end_time,
            location,
            type
          )
        `)
        .eq('profile_id', user.id)
        .order('events.start_time', { ascending: true });

      if (!showAll) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching event registrations:', error);
        return;
      }

      console.log('Fetched registrations:', data);
      
      // Filter to show only upcoming events
      const upcomingRegistrations = (data || [])
        .filter(reg => isEventUpcoming(reg.events.start_time))
        .map(reg => ({
          id: reg.id,
          event_id: reg.event_id,
          status: reg.status,
          created_at: reg.created_at,
          event: reg.events
        }));

      setRegistrations(upcomingRegistrations);
    } catch (error) {
      console.error('Error in fetchRegistrations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRegistrations();
  };

  const getEventTypeIcon = (type: string): string => {
    switch (type) {
      case 'GAME':
        return 'tennisball';
      case 'TOURNAMENT':
        return 'trophy';
      case 'PRACTICE':
        return 'fitness';
      default:
        return 'calendar';
    }
  };

  const getEventTypeColor = (type: string): string => {
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

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'ACCEPTED':
        return colors.success;
      case 'DECLINED':
        return colors.error;
      case 'PENDING':
        return colors.yellow;
      default:
        return colors.textLight;
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'ACCEPTED':
        return 'Bestätigt';
      case 'DECLINED':
        return 'Abgelehnt';
      case 'PENDING':
        return 'Ausstehend';
      default:
        return status;
    }
  };

  const handleEventPress = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  const handleCancelRegistration = async (registrationId: string) => {
    try {
      console.log('Cancelling registration:', registrationId);
      
      const { error } = await supabase
        .from('event_participants')
        .delete()
        .eq('id', registrationId)
        .eq('profile_id', user?.id);

      if (error) {
        console.error('Error cancelling registration:', error);
        return;
      }

      // Refresh the list
      fetchRegistrations();
    } catch (error) {
      console.error('Error in handleCancelRegistration:', error);
    }
  };

  if (loading) {
    return (
      <View style={[commonStyles.card, { alignItems: 'center', padding: 20 }]}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[commonStyles.textLight, { marginTop: 8 }]}>
          Anmeldungen werden geladen...
        </Text>
      </View>
    );
  }

  if (registrations.length === 0) {
    return (
      <View style={[commonStyles.card, { alignItems: 'center', padding: 30 }]}>
        <Icon name="calendar" size={48} color={colors.textLight} />
        <Text style={[commonStyles.text, { marginTop: 16, marginBottom: 8, textAlign: 'center' }]}>
          Keine Event-Anmeldungen
        </Text>
        <Text style={[commonStyles.textLight, { textAlign: 'center' }]}>
          Du bist noch für keine kommenden Events angemeldet.
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 8,
            marginTop: 16,
          }}
          onPress={() => router.push('/(tabs)/events')}
        >
          <Text style={[commonStyles.text, { color: colors.white, fontWeight: '600' }]}>
            Events entdecken
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const content = (
    <>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text style={[commonStyles.text, { fontWeight: '600', fontSize: 18 }]}>
          Meine Anmeldungen
        </Text>
        {!showAll && onViewAll && registrations.length >= limit && (
          <TouchableOpacity onPress={onViewAll}>
            <Text style={[commonStyles.text, { color: colors.primary, fontSize: 14 }]}>
              Alle anzeigen
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Registrations List */}
      {registrations.map((registration, index) => (
        <TouchableOpacity
          key={registration.id}
          style={{
            backgroundColor: colors.white,
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            borderLeftWidth: 4,
            borderLeftColor: getEventTypeColor(registration.event.type),
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
          onPress={() => handleEventPress(registration.event.id)}
        >
          {/* Event Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: getEventTypeColor(registration.event.type),
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}
            >
              <Icon name={getEventTypeIcon(registration.event.type)} size={20} color={colors.white} />
            </View>
            
            <View style={{ flex: 1 }}>
              <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 2 }]}>
                {registration.event.title}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    backgroundColor: getStatusColor(registration.status),
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 10,
                    marginRight: 8,
                  }}
                >
                  <Text style={[commonStyles.text, { color: colors.white, fontSize: 10, fontWeight: '600' }]}>
                    {getStatusText(registration.status)}
                  </Text>
                </View>
                <Text style={[commonStyles.textLight, { fontSize: 12 }]}>
                  Angemeldet am {formatDate(registration.created_at)}
                </Text>
              </View>
            </View>
          </View>

          {/* Event Details */}
          <View style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Icon name="calendar" size={14} color={colors.textLight} style={{ marginRight: 8 }} />
              <Text style={[commonStyles.textLight, { fontSize: 14 }]}>
                {formatDate(registration.event.start_time)}
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Icon name="time" size={14} color={colors.textLight} style={{ marginRight: 8 }} />
              <Text style={[commonStyles.textLight, { fontSize: 14 }]}>
                {formatTime(registration.event.start_time)} - {formatTime(registration.event.end_time)}
              </Text>
            </View>
            
            {registration.event.location && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="location" size={14} color={colors.textLight} style={{ marginRight: 8 }} />
                <Text style={[commonStyles.textLight, { fontSize: 14, flex: 1 }]} numberOfLines={2}>
                  {registration.event.location}
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <TouchableOpacity
              style={{
                backgroundColor: colors.background,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 6,
                flexDirection: 'row',
                alignItems: 'center',
              }}
              onPress={() => handleEventPress(registration.event.id)}
            >
              <Icon name="information-circle" size={14} color={colors.primary} style={{ marginRight: 4 }} />
              <Text style={[commonStyles.text, { color: colors.primary, fontSize: 12, fontWeight: '600' }]}>
                Details
              </Text>
            </TouchableOpacity>

            {registration.status === 'PENDING' && (
              <TouchableOpacity
                style={{
                  backgroundColor: colors.error,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 6,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                onPress={() => handleCancelRegistration(registration.id)}
              >
                <Icon name="close" size={14} color={colors.white} style={{ marginRight: 4 }} />
                <Text style={[commonStyles.text, { color: colors.white, fontSize: 12, fontWeight: '600' }]}>
                  Abmelden
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </>
  );

  if (showAll) {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={commonStyles.content}>
          {content}
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={commonStyles.card}>
      {content}
    </View>
  );
}
