
import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from '../../components/Icon';
import { commonStyles, colors } from '../../styles/commonStyles';
import QRCodeDisplay from '../../components/QRCodeDisplay';
import EventRegistrations from '../../components/EventRegistrations';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { formatDate, formatTime } from '../../utils/dateUtils';

interface Profile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

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

export default function HomeScreen() {
  const router = useRouter();
  const { user, authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        fetchData();
      } else {
        setLoading(false);
      }
    }
  }, [user, authLoading]);

  const fetchData = async () => {
    await Promise.all([
      fetchProfile(),
      fetchUpcomingEvents()
    ]);
    setLoading(false);
  };

  const fetchProfile = async () => {
    if (!user) return;

    try {
      console.log('Fetching profile for home screen');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // If profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating new profile');
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
          } else {
            console.log('New profile created:', newProfile);
            setProfile(newProfile);
          }
        }
      } else {
        console.log('Profile fetched for home:', data);
        setProfile(data);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      console.log('Fetching upcoming events');
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('start_time', now)
        .order('start_time', { ascending: true })
        .limit(3);

      if (error) {
        console.error('Error fetching upcoming events:', error);
      } else {
        console.log('Upcoming events fetched:', data);
        setUpcomingEvents(data || []);
      }
    } catch (error) {
      console.error('Error in fetchUpcomingEvents:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const getDisplayName = (): string => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile?.first_name) {
      return profile.first_name;
    }
    if (profile?.email) {
      return profile.email.split('@')[0];
    }
    return 'Benutzer';
  };

  const getInitials = (): string => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    if (profile?.first_name) {
      return profile.first_name[0].toUpperCase();
    }
    if (profile?.email) {
      return profile.email[0].toUpperCase();
    }
    return 'U';
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

  const handleBookSession = () => {
    router.push('/(tabs)/events');
  };

  const handleTournaments = () => {
    router.push('/(tabs)/events');
  };

  const handleViewAllEvents = () => {
    router.push('/(tabs)/events');
  };

  const handleViewAllRegistrations = () => {
    router.push('/profile/registrations');
  };

  const handleEventPress = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  if (authLoading || loading) {
    return (
      <SafeAreaView style={[commonStyles.container, commonStyles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[commonStyles.text, { marginTop: 16 }]}>
          Wird geladen...
        </Text>
      </SafeAreaView>
    );
  }

  if (!user) {
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
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 30 }}>
            <View style={{ flex: 1 }}>
              <Text style={[commonStyles.title, { color: colors.primary }]}>
                Willkommen
              </Text>
              <Text style={commonStyles.textLight}>
                bei Pickleball Salzburg
              </Text>
            </View>
          </View>

          {/* Login Prompt */}
          <View style={[commonStyles.card, { alignItems: 'center', marginBottom: 30 }]}>
            <Icon name="person-circle" size={80} color={colors.textLight} />
            <Text style={[commonStyles.text, { marginTop: 16, marginBottom: 8, textAlign: 'center' }]}>
              Nicht angemeldet
            </Text>
            <Text style={[commonStyles.textLight, { textAlign: 'center', marginBottom: 24 }]}>
              Melde dich an, um Events zu sehen und teilzunehmen.
            </Text>
            
            <TouchableOpacity
              style={[
                {
                  backgroundColor: colors.primary,
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 12,
                  width: '100%',
                  alignItems: 'center',
                }
              ]}
              onPress={() => router.push('/auth/login')}
            >
              <Text style={[commonStyles.text, { color: colors.white, fontWeight: '600' }]}>
                Jetzt anmelden
              </Text>
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View style={[commonStyles.card, { marginBottom: 30 }]}>
            <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 16 }]}>
              Schnellzugriff
            </Text>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  alignItems: 'center',
                  padding: 16,
                  backgroundColor: colors.background,
                  borderRadius: 12,
                  marginRight: 8,
                }}
                onPress={handleBookSession}
              >
                <Icon name="calendar" size={32} color={colors.primary} />
                <Text style={[commonStyles.text, { marginTop: 8, fontSize: 12, textAlign: 'center' }]}>
                  Events
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  flex: 1,
                  alignItems: 'center',
                  padding: 16,
                  backgroundColor: colors.background,
                  borderRadius: 12,
                  marginLeft: 8,
                }}
                onPress={handleTournaments}
              >
                <Icon name="trophy" size={32} color={colors.primary} />
                <Text style={[commonStyles.text, { marginTop: 8, fontSize: 12, textAlign: 'center' }]}>
                  Turniere
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
        {/* Header with Profile */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
          <View style={{ flex: 1 }}>
            <Text style={[commonStyles.title, { color: colors.primary }]}>
              Hallo {getDisplayName()}!
            </Text>
            <Text style={commonStyles.textLight}>
              Willkommen zurück
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/profile')}
            style={{ marginLeft: 16 }}
          >
            {profile?.avatar_url ? (
              <Image
                source={{ uri: profile.avatar_url }}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: colors.background,
                }}
                onError={(error) => {
                  console.error('Error loading header avatar:', error);
                  // Don't set avatar_url to null here as it might cause infinite re-renders
                }}
              />
            ) : (
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: colors.primary,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.white }}>
                  {getInitials()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Event Registrations - Compact Version */}
        <View style={{ marginBottom: 20 }}>
          <EventRegistrations 
            showAll={false} 
            limit={2} 
            compact={true}
            onViewAll={handleViewAllRegistrations}
          />
        </View>

        {/* Quick Actions */}
        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 16 }]}>
            Schnellzugriff
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity
              style={{
                flex: 1,
                alignItems: 'center',
                padding: 16,
                backgroundColor: colors.background,
                borderRadius: 12,
                marginRight: 8,
              }}
              onPress={handleBookSession}
            >
              <Icon name="calendar" size={32} color={colors.primary} />
              <Text style={[commonStyles.text, { marginTop: 8, fontSize: 12, textAlign: 'center' }]}>
                Session buchen
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={{
                flex: 1,
                alignItems: 'center',
                padding: 16,
                backgroundColor: colors.background,
                borderRadius: 12,
                marginLeft: 8,
              }}
              onPress={handleTournaments}
            >
              <Icon name="trophy" size={32} color={colors.primary} />
              <Text style={[commonStyles.text, { marginTop: 8, fontSize: 12, textAlign: 'center' }]}>
                Turniere
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Upcoming Events */}
        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={[commonStyles.text, { fontWeight: '600' }]}>
              Kommende Events
            </Text>
            <TouchableOpacity onPress={handleViewAllEvents}>
              <Text style={[commonStyles.text, { color: colors.primary, fontSize: 14 }]}>
                Alle anzeigen
              </Text>
            </TouchableOpacity>
          </View>
          
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event, index) => (
              <TouchableOpacity
                key={event.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                  borderBottomWidth: index < upcomingEvents.length - 1 ? 1 : 0,
                  borderBottomColor: colors.border,
                }}
                onPress={() => handleEventPress(event.id)}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: colors.primary,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                  }}
                >
                  <Icon name={getEventTypeIcon(event.type)} size={20} color={colors.white} />
                </View>
                
                <View style={{ flex: 1 }}>
                  <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 2 }]}>
                    {event.title}
                  </Text>
                  <Text style={[commonStyles.textLight, { fontSize: 12 }]}>
                    {formatDate(event.start_time)} • {formatTime(event.start_time)}
                  </Text>
                  {event.location && (
                    <Text style={[commonStyles.textLight, { fontSize: 12 }]}>
                      📍 {event.location}
                    </Text>
                  )}
                </View>
                
                <Icon name="chevron-forward" size={16} color={colors.textLight} />
              </TouchableOpacity>
            ))
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <Icon name="calendar" size={48} color={colors.textLight} />
              <Text style={[commonStyles.textLight, { marginTop: 12, textAlign: 'center' }]}>
                Keine kommenden Events
              </Text>
            </View>
          )}
        </View>

        {/* QR Code - Collapsible */}
        <View style={[commonStyles.card, { marginBottom: 30 }]}>
          <QRCodeDisplay userId={user.id} collapsible={true} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
