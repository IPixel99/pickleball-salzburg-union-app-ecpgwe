
import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import Icon from '../../components/Icon';
import QRCodeDisplay from '../../components/QRCodeDisplay';
import { commonStyles, colors } from '../../styles/commonStyles';
import { formatDate, formatTime } from '../../utils/dateUtils';
import { useAuth } from '../../hooks/useAuth';

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
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  console.log('HomeScreen: Auth state - loading:', authLoading, 'user:', user?.email || 'No user');

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [user, authLoading]);

  const fetchData = async () => {
    console.log('HomeScreen: Fetching data');
    setLoading(true);
    
    await Promise.all([
      fetchProfile(),
      fetchUpcomingEvents()
    ]);
    
    setLoading(false);
  };

  const fetchProfile = async () => {
    if (!user) {
      console.log('HomeScreen: No user to fetch profile for');
      return;
    }

    try {
      console.log('HomeScreen: Fetching profile');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('HomeScreen: Error fetching profile:', error);
        // If profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          console.log('HomeScreen: Profile not found, creating one');
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              first_name: user.user_metadata?.first_name || null,
              last_name: user.user_metadata?.last_name || null,
            });

          if (insertError) {
            console.error('HomeScreen: Error creating profile:', insertError);
          } else {
            console.log('HomeScreen: Profile created, fetching again');
            fetchProfile();
            return;
          }
        }
      } else {
        console.log('HomeScreen: Profile fetched successfully');
        setProfile(data);
      }
    } catch (error) {
      console.error('HomeScreen: Error in fetchProfile:', error);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      console.log('HomeScreen: Fetching upcoming events');
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('start_time', now)
        .order('start_time', { ascending: true })
        .limit(3);

      if (error) {
        console.error('HomeScreen: Error fetching events:', error);
        return;
      }

      console.log('HomeScreen: Events fetched:', data?.length || 0);
      setUpcomingEvents(data || []);
    } catch (error) {
      console.error('HomeScreen: Error in fetchUpcomingEvents:', error);
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
      return profile.email;
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
    console.log('HomeScreen: Book session pressed');
    // Navigate to booking or show info
    router.push('/(tabs)/events');
  };

  const handleTournaments = () => {
    console.log('HomeScreen: Tournaments pressed');
    router.push('/(tabs)/events');
  };

  const handleViewAllEvents = () => {
    console.log('HomeScreen: View all events pressed');
    router.push('/(tabs)/events');
  };

  const handleBookCourt = () => {
    console.log('HomeScreen: Book court pressed');
    // This could navigate to a court booking system
    router.push('/(tabs)/events');
  };

  const handleEventPress = (eventId: string) => {
    console.log('HomeScreen: Event pressed:', eventId);
    router.push(`/events/${eventId}`);
  };

  if (authLoading || loading) {
    return (
      <SafeAreaView style={[commonStyles.container, commonStyles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[commonStyles.text, { marginTop: 16 }]}>
          Lade Daten...
        </Text>
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
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 30 
        }}>
          <View style={{ flex: 1 }}>
            <Text style={[commonStyles.text, { color: colors.textLight }]}>
              Willkommen zurück
            </Text>
            <Text style={[commonStyles.title, { color: colors.primary }]}>
              {user ? getDisplayName() : 'Gast'}
            </Text>
          </View>
          
          {user && (
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
                    console.log('Error loading avatar image in home:', error);
                    // Fallback to initials if image fails to load
                    setProfile(prev => prev ? { ...prev, avatar_url: null } : null);
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
          )}
        </View>

        {/* Quick Actions */}
        <View style={{ marginBottom: 30 }}>
          <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>
            Schnellzugriff
          </Text>
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between',
            flexWrap: 'wrap'
          }}>
            <TouchableOpacity
              style={[commonStyles.card, { 
                width: '48%', 
                alignItems: 'center', 
                paddingVertical: 20,
                marginBottom: 12
              }]}
              onPress={handleBookSession}
            >
              <Icon name="add-circle" size={32} color={colors.primary} />
              <Text style={[commonStyles.text, { marginTop: 8, textAlign: 'center' }]}>
                Session buchen
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[commonStyles.card, { 
                width: '48%', 
                alignItems: 'center', 
                paddingVertical: 20,
                marginBottom: 12
              }]}
              onPress={handleTournaments}
            >
              <Icon name="trophy" size={32} color={colors.primary} />
              <Text style={[commonStyles.text, { marginTop: 8, textAlign: 'center' }]}>
                Turniere
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[commonStyles.card, { 
                width: '48%', 
                alignItems: 'center', 
                paddingVertical: 20,
                marginBottom: 12
              }]}
              onPress={handleViewAllEvents}
            >
              <Icon name="calendar" size={32} color={colors.primary} />
              <Text style={[commonStyles.text, { marginTop: 8, textAlign: 'center' }]}>
                Alle Events
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[commonStyles.card, { 
                width: '48%', 
                alignItems: 'center', 
                paddingVertical: 20,
                marginBottom: 12
              }]}
              onPress={handleBookCourt}
            >
              <Icon name="location" size={32} color={colors.primary} />
              <Text style={[commonStyles.text, { marginTop: 8, textAlign: 'center' }]}>
                Platz buchen
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Upcoming Events */}
        <View style={{ marginBottom: 30 }}>
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 16 
          }}>
            <Text style={commonStyles.subtitle}>Kommende Events</Text>
            <TouchableOpacity onPress={handleViewAllEvents}>
              <Text style={[commonStyles.text, { color: colors.primary }]}>
                Alle anzeigen
              </Text>
            </TouchableOpacity>
          </View>

          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event, index) => (
              <TouchableOpacity
                key={event.id}
                style={[
                  commonStyles.card,
                  { 
                    marginBottom: 12,
                    borderLeftWidth: 4,
                    borderLeftColor: index === 0 ? colors.primary : colors.secondary,
                  }
                ]}
                onPress={() => handleEventPress(event.id)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon 
                    name={getEventTypeIcon(event.type)} 
                    size={24} 
                    color={index === 0 ? colors.primary : colors.secondary} 
                  />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                      {event.title}
                    </Text>
                    <Text style={[commonStyles.textLight, { fontSize: 14 }]}>
                      {formatDate(event.start_time)} • {formatTime(event.start_time)}
                    </Text>
                    {event.location && (
                      <Text style={[commonStyles.textLight, { fontSize: 12 }]}>
                        📍 {event.location}
                      </Text>
                    )}
                  </View>
                  {index === 0 && (
                    <View style={{
                      backgroundColor: colors.primary,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 12,
                    }}>
                      <Text style={{ color: colors.white, fontSize: 12, fontWeight: '600' }}>
                        Nächstes
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={[commonStyles.card, { alignItems: 'center', paddingVertical: 30 }]}>
              <Icon name="calendar-outline" size={48} color={colors.textLight} />
              <Text style={[commonStyles.text, { marginTop: 16, textAlign: 'center' }]}>
                Keine kommenden Events
              </Text>
              <Text style={[commonStyles.textLight, { textAlign: 'center', marginTop: 8 }]}>
                Schau später wieder vorbei oder erstelle ein neues Event.
              </Text>
            </View>
          )}
        </View>

        {/* QR Code Section */}
        {user && (
          <View style={{ marginBottom: 30 }}>
            <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>
              Dein QR-Code
            </Text>
            <View style={[commonStyles.card, { alignItems: 'center', paddingVertical: 30 }]}>
              <QRCodeDisplay value={user.id} size={200} />
              <Text style={[commonStyles.textLight, { marginTop: 16, textAlign: 'center' }]}>
                Zeige diesen Code anderen Mitgliedern, um dich zu vernetzen.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
