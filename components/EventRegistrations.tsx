
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import Icon from './Icon';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { commonStyles, colors } from '../styles/commonStyles';
import { formatDate, formatTime, isEventUpcoming } from '../utils/dateUtils';

interface EventRegistration {
  id: string;
  event_id: string;
  profile_id: string;
  status?: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  created_at: string;
  events: {
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
  compact?: boolean;
}

export default function EventRegistrations({ showAll = false, limit = 3, onViewAll, compact = false }: EventRegistrationsProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user) {
      fetchRegistrations();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Set up automatic refresh when component is focused
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        console.log('EventRegistrations focused - setting up auto refresh');
        
        // Set up automatic refresh every 30 seconds
        refreshIntervalRef.current = setInterval(() => {
          console.log('Auto-refreshing event registrations');
          fetchRegistrations();
        }, 30000);

        return () => {
          console.log('EventRegistrations unfocused - clearing auto refresh');
          if (refreshIntervalRef.current) {
            clearInterval(refreshIntervalRef.current);
          }
        };
      }
    }, [user])
  );

  const fetchRegistrations = async () => {
    if (!user) {
      console.log('No user found, skipping registration fetch');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching event registrations for user:', user.id);
      
      // Query using profile_id (which matches the user.id from auth)
      let query = supabase
        .from('event_participants')
        .select(`
          id,
          event_id,
          profile_id,
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
        .eq('profile_id', user.id);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching event registrations:', error);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      console.log('Fetched registrations:', data);
      processRegistrations(data || []);
    } catch (error) {
      console.error('Error in fetchRegistrations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const processRegistrations = (data: any[]) => {
    // Filter to show only upcoming events and sort by start_time
    const upcomingRegistrations = data
      .filter(reg => {
        const isUpcoming = isEventUpcoming(reg.events.start_time);
        console.log(`Event ${reg.events.title} (${reg.events.start_time}) is upcoming: ${isUpcoming}`);
        return isUpcoming;
      })
      .map(reg => ({
        id: reg.id,
        event_id: reg.event_id,
        profile_id: reg.profile_id,
        status: reg.status || 'PENDING',
        created_at: reg.created_at,
        events: reg.events
      }))
      .sort((a, b) => {
        // Sort by event start_time ascending
        return new Date(a.events.start_time).getTime() - new Date(b.events.start_time).getTime();
      });

    console.log('Processed upcoming registrations:', upcomingRegistrations);
    
    // Apply limit if not showing all
    const finalRegistrations = showAll ? upcomingRegistrations : upcomingRegistrations.slice(0, limit);
    setRegistrations(finalRegistrations);
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
        return '#FFD700';
      case 'PRACTICE':
        return colors.success;
      default:
        return colors.textLight;
    }
  };

  const getEventTypeLabel = (type: string): string => {
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

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'ACCEPTED':
        return colors.success;
      case 'DECLINED':
        return colors.error;
      case 'PENDING':
        return '#FFD700';
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

  const handleCancelRegistration = async (registrationId: string, eventTitle: string) => {
    Alert.alert(
      'Anmeldung stornieren',
      `Möchtest du deine Anmeldung für "${eventTitle}" wirklich stornieren?`,
      [
        {
          text: 'Abbrechen',
          style: 'cancel',
        },
        {
          text: 'Stornieren',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Cancelling registration:', registrationId);
              
              const { error } = await supabase
                .from('event_participants')
                .delete()
                .eq('id', registrationId);

              if (error) {
                console.error('Error cancelling registration:', error);
                Alert.alert('Fehler', 'Die Anmeldung konnte nicht storniert werden.');
                return;
              }

              Alert.alert('Erfolg', 'Deine Anmeldung wurde erfolgreich storniert.');
              // Refresh the list
              fetchRegistrations();
            } catch (error) {
              console.error('Error in handleCancelRegistration:', error);
              Alert.alert('Fehler', 'Ein unerwarteter Fehler ist aufgetreten.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[commonStyles.card, { alignItems: 'center', padding: compact ? 20 : 40 }]}>
        <ActivityIndicator size={compact ? "small" : "large"} color={colors.primary} />
        <Text style={[commonStyles.textLight, { marginTop: compact ? 8 : 16, fontSize: compact ? 14 : 16 }]}>
          Anmeldungen werden geladen...
        </Text>
      </View>
    );
  }

  if (registrations.length === 0) {
    return (
      <View style={[commonStyles.card, { alignItems: 'center', padding: compact ? 20 : 40 }]}>
        <View
          style={{
            width: compact ? 50 : 80,
            height: compact ? 50 : 80,
            borderRadius: compact ? 25 : 40,
            backgroundColor: colors.background,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: compact ? 12 : 20,
          }}
        >
          <Icon name="calendar" size={compact ? 24 : 40} color={colors.textLight} />
        </View>
        <Text style={[commonStyles.text, { fontSize: compact ? 16 : 18, fontWeight: '600', marginBottom: compact ? 4 : 8, textAlign: 'center' }]}>
          Keine Anmeldungen
        </Text>
        <Text style={[commonStyles.textLight, { textAlign: 'center', marginBottom: compact ? 16 : 24, lineHeight: compact ? 18 : 20, fontSize: compact ? 13 : 14 }]}>
          {compact ? 'Noch keine Events angemeldet.' : 'Du bist noch für keine kommenden Events angemeldet.\nEntdecke spannende Events und melde dich an!'}
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: compact ? 16 : 24,
            paddingVertical: compact ? 8 : 12,
            borderRadius: compact ? 8 : 12,
            flexDirection: 'row',
            alignItems: 'center',
          }}
          onPress={() => router.push('/(tabs)/events')}
        >
          <Icon name="search" size={compact ? 14 : 16} color={colors.white} style={{ marginRight: compact ? 6 : 8 }} />
          <Text style={[commonStyles.text, { color: colors.white, fontWeight: '600', fontSize: compact ? 13 : 14 }]}>
            Events entdecken
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderCompactRegistration = (registration: EventRegistration, index: number) => (
    <TouchableOpacity
      key={registration.id}
      style={{
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        borderLeftWidth: 3,
        borderLeftColor: getEventTypeColor(registration.events.type),
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        elevation: 2,
      }}
      onPress={() => handleEventPress(registration.events.id)}
      activeOpacity={0.7}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: getEventTypeColor(registration.events.type),
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 10,
          }}
        >
          <Icon name={getEventTypeIcon(registration.events.type)} size={16} color={colors.white} />
        </View>
        
        <View style={{ flex: 1 }}>
          <Text style={[commonStyles.text, { fontWeight: '600', fontSize: 14, marginBottom: 2 }]} numberOfLines={1}>
            {registration.events.title}
          </Text>
          <Text style={[commonStyles.textLight, { fontSize: 11 }]}>
            {formatDate(registration.events.start_time)} • {formatTime(registration.events.start_time)}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: getStatusColor(registration.status || 'PENDING'),
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 8,
          }}
        >
          <Text style={[commonStyles.text, { color: colors.white, fontSize: 9, fontWeight: '600' }]}>
            {getStatusText(registration.status || 'PENDING')}
          </Text>
        </View>
      </View>

      {registration.events.location && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Icon name="location" size={12} color={colors.textLight} style={{ marginRight: 6 }} />
          <Text style={[commonStyles.textLight, { fontSize: 11, flex: 1 }]} numberOfLines={1}>
            {registration.events.location}
          </Text>
        </View>
      )}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <TouchableOpacity
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 6,
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
            marginRight: 6,
          }}
          onPress={() => handleEventPress(registration.events.id)}
        >
          <Icon name="information-circle" size={12} color={colors.white} style={{ marginRight: 4 }} />
          <Text style={[commonStyles.text, { color: colors.white, fontSize: 11, fontWeight: '600' }]}>
            Details
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: colors.error,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 6,
            flexDirection: 'row',
            alignItems: 'center',
          }}
          onPress={() => handleCancelRegistration(registration.id, registration.events.title)}
        >
          <Icon name="close" size={12} color={colors.white} style={{ marginRight: 4 }} />
          <Text style={[commonStyles.text, { color: colors.white, fontSize: 11, fontWeight: '600' }]}>
            Abmelden
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderFullRegistration = (registration: EventRegistration, index: number) => (
    <TouchableOpacity
      key={registration.id}
      style={{
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: getEventTypeColor(registration.events.type),
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        elevation: 3,
      }}
      onPress={() => handleEventPress(registration.events.id)}
      activeOpacity={0.7}
    >
      {/* Event Header */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: getEventTypeColor(registration.events.type),
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 16,
          }}
        >
          <Icon name={getEventTypeIcon(registration.events.type)} size={24} color={colors.white} />
        </View>
        
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Text style={[commonStyles.text, { fontWeight: '700', fontSize: 16, flex: 1 }]}>
              {registration.events.title}
            </Text>
            <View
              style={{
                backgroundColor: getEventTypeColor(registration.events.type),
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 12,
                marginLeft: 8,
              }}
            >
              <Text style={[commonStyles.text, { color: colors.white, fontSize: 10, fontWeight: '600' }]}>
                {getEventTypeLabel(registration.events.type)}
              </Text>
            </View>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
            <View
              style={{
                backgroundColor: getStatusColor(registration.status || 'PENDING'),
                paddingHorizontal: 10,
                paddingVertical: 3,
                borderRadius: 12,
                marginRight: 8,
                marginBottom: 4,
              }}
            >
              <Text style={[commonStyles.text, { color: colors.white, fontSize: 11, fontWeight: '600' }]}>
                {getStatusText(registration.status || 'PENDING')}
              </Text>
            </View>
            <Text style={[commonStyles.textLight, { fontSize: 12 }]}>
              Angemeldet am {formatDate(registration.created_at)}
            </Text>
          </View>
        </View>
      </View>

      {/* Event Details */}
      <View style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: colors.background,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12,
            }}
          >
            <Icon name="calendar" size={16} color={colors.primary} />
          </View>
          <Text style={[commonStyles.text, { fontSize: 15, fontWeight: '600' }]}>
            {formatDate(registration.events.start_time)}
          </Text>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: colors.background,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12,
            }}
          >
            <Icon name="time" size={16} color={colors.primary} />
          </View>
          <Text style={[commonStyles.text, { fontSize: 15 }]}>
            {formatTime(registration.events.start_time)} - {formatTime(registration.events.end_time)}
          </Text>
        </View>
        
        {registration.events.location && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: colors.background,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}
            >
              <Icon name="location" size={16} color={colors.primary} />
            </View>
            <Text style={[commonStyles.text, { fontSize: 15, flex: 1 }]} numberOfLines={2}>
              {registration.events.location}
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <TouchableOpacity
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
            marginRight: 8,
          }}
          onPress={() => handleEventPress(registration.events.id)}
        >
          <Icon name="information-circle" size={16} color={colors.white} style={{ marginRight: 6 }} />
          <Text style={[commonStyles.text, { color: colors.white, fontSize: 14, fontWeight: '600' }]}>
            Details ansehen
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: colors.error,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
          }}
          onPress={() => handleCancelRegistration(registration.id, registration.events.title)}
        >
          <Icon name="close" size={16} color={colors.white} style={{ marginRight: 6 }} />
          <Text style={[commonStyles.text, { color: colors.white, fontSize: 14, fontWeight: '600' }]}>
            Abmelden
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const content = (
    <>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: compact ? 12 : 20 }}>
        <View>
          <Text style={[commonStyles.text, { fontWeight: '700', fontSize: compact ? 16 : 20, color: colors.primary }]}>
            Meine Anmeldungen
          </Text>
          <Text style={[commonStyles.textLight, { fontSize: compact ? 12 : 14, marginTop: 2 }]}>
            {registrations.length} kommende{registrations.length === 1 ? 's' : ''} Event{registrations.length === 1 ? '' : 's'}
          </Text>
        </View>
        {!showAll && onViewAll && registrations.length >= limit && (
          <TouchableOpacity
            onPress={onViewAll}
            style={{
              backgroundColor: colors.background,
              paddingHorizontal: compact ? 8 : 12,
              paddingVertical: compact ? 4 : 6,
              borderRadius: compact ? 6 : 8,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Text style={[commonStyles.text, { color: colors.primary, fontSize: compact ? 12 : 14, fontWeight: '600', marginRight: 4 }]}>
              Alle
            </Text>
            <Icon name="chevron-forward" size={compact ? 12 : 14} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Registrations List */}
      {registrations.map((registration, index) => 
        compact ? renderCompactRegistration(registration, index) : renderFullRegistration(registration, index)
      )}
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
    <View style={[commonStyles.card, compact && { padding: 16 }]}>
      {content}
    </View>
  );
}
