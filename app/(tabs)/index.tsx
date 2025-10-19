
import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from '../../components/Icon';
import QRCodeDisplay from '../../components/QRCodeDisplay';
import EventRegistrations from '../../components/EventRegistrations';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
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
  const { colors, theme } = useTheme();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = useCallback(async () => {
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
  }, [user]);

  const fetchUpcomingEvents = useCallback(async () => {
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
  }, []);

  const fetchData = useCallback(async () => {
    await Promise.all([
      fetchProfile(),
      fetchUpcomingEvents()
    ]);
    setLoading(false);
  }, [fetchProfile, fetchUpcomingEvents]);

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        fetchData();
      } else {
        setLoading(false);
      }
    }
  }, [user, authLoading, fetchData]);

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

  const handleMyRegistrations = () => {
    router.push('/profile/registrations');
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
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text, marginTop: 16, fontSize: 16 }}>
          Wird geladen...
        </Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView 
          style={{ flex: 1, paddingHorizontal: 20, paddingTop: 20 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 30 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 32, fontWeight: 'bold', color: colors.primary, marginBottom: 8 }}>
                Willkommen
              </Text>
              <Text style={{ fontSize: 14, color: colors.textLight, lineHeight: 20 }}>
                bei Pickleball Salzburg
              </Text>
            </View>
          </View>

          {/* Login Prompt */}
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 20,
            marginBottom: 30,
            alignItems: 'center',
            shadowColor: theme === 'dark' ? colors.primary : colors.black,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: theme === 'dark' ? 0.3 : 0.1,
            shadowRadius: 12,
            elevation: 5,
          }}>
            <Icon name="person-circle" size={80} color={colors.textLight} />
            <Text style={{ color: colors.text, fontSize: 16, marginTop: 16, marginBottom: 8, textAlign: 'center' }}>
              Nicht angemeldet
            </Text>
            <Text style={{ color: colors.textLight, fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
              Melde dich an, um Events zu sehen und teilzunehmen.
            </Text>
            
            <TouchableOpacity
              style={{
                backgroundColor: colors.primary,
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 12,
                width: '100%',
                alignItems: 'center',
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 8,
              }}
              onPress={() => router.push('/auth/login')}
            >
              <Text style={{ color: colors.white, fontSize: 16, fontWeight: '600' }}>
                Jetzt anmelden
              </Text>
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 20,
            marginBottom: 30,
            shadowColor: theme === 'dark' ? colors.primary : colors.black,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: theme === 'dark' ? 0.3 : 0.1,
            shadowRadius: 12,
            elevation: 5,
          }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: 16 }}>
              Schnellzugriff
            </Text>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  alignItems: 'center',
                  padding: 16,
                  backgroundColor: colors.backgroundSecondary,
                  borderRadius: 12,
                  marginRight: 8,
                }}
                onPress={handleBookSession}
              >
                <Icon name="calendar" size={32} color={colors.primary} />
                <Text style={{ color: colors.text, fontSize: 12, marginTop: 8, textAlign: 'center' }}>
                  Events
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  flex: 1,
                  alignItems: 'center',
                  padding: 16,
                  backgroundColor: colors.backgroundSecondary,
                  borderRadius: 12,
                  marginLeft: 8,
                }}
                onPress={handleMyRegistrations}
              >
                <Icon name="list" size={32} color={colors.primary} />
                <Text style={{ color: colors.text, fontSize: 12, marginTop: 8, textAlign: 'center' }}>
                  Meine Anmeldungen
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView 
        style={{ flex: 1, paddingHorizontal: 20, paddingTop: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Header with Profile */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: colors.primary, marginBottom: 8 }}>
              Hallo {getDisplayName()}!
            </Text>
            <Text style={{ fontSize: 14, color: colors.textLight, lineHeight: 20 }}>
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
                  backgroundColor: colors.backgroundSecondary,
                }}
                onError={(error) => {
                  console.error('Error loading header avatar:', error);
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

        {/* My Registrations Quick Access - Show max 2 upcoming events */}
        <View style={{ marginBottom: 20 }}>
          <EventRegistrations 
            showAll={false} 
            limit={2} 
            compact={true}
            onViewAll={handleViewAllRegistrations}
          />
        </View>

        {/* Quick Actions */}
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 20,
          marginBottom: 20,
          shadowColor: theme === 'dark' ? colors.primary : colors.black,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: theme === 'dark' ? 0.3 : 0.1,
          shadowRadius: 12,
          elevation: 5,
        }}>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: 16 }}>
            Schnellzugriff
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity
              style={{
                flex: 1,
                alignItems: 'center',
                padding: 16,
                backgroundColor: colors.backgroundSecondary,
                borderRadius: 12,
                marginRight: 8,
              }}
              onPress={handleBookSession}
            >
              <Icon name="calendar" size={32} color={colors.primary} />
              <Text style={{ color: colors.text, fontSize: 12, marginTop: 8, textAlign: 'center' }}>
                Events
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={{
                flex: 1,
                alignItems: 'center',
                padding: 16,
                backgroundColor: colors.backgroundSecondary,
                borderRadius: 12,
                marginLeft: 8,
              }}
              onPress={handleMyRegistrations}
            >
              <Icon name="list" size={32} color={colors.primary} />
              <Text style={{ color: colors.text, fontSize: 12, marginTop: 8, textAlign: 'center' }}>
                Meine Anmeldungen
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Upcoming Events */}
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 20,
          marginBottom: 20,
          shadowColor: theme === 'dark' ? colors.primary : colors.black,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: theme === 'dark' ? 0.3 : 0.1,
          shadowRadius: 12,
          elevation: 5,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>
              Kommende Events
            </Text>
            <TouchableOpacity onPress={handleViewAllEvents}>
              <Text style={{ color: colors.primary, fontSize: 14 }}>
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
                  <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: 2 }}>
                    {event.title}
                  </Text>
                  <Text style={{ color: colors.textLight, fontSize: 12 }}>
                    {formatDate(event.start_time)} • {formatTime(event.start_time)}
                  </Text>
                  {event.location && (
                    <Text style={{ color: colors.textLight, fontSize: 12 }}>
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
              <Text style={{ color: colors.textLight, fontSize: 14, marginTop: 12, textAlign: 'center' }}>
                Keine kommenden Events
              </Text>
            </View>
          )}
        </View>

        {/* QR Code - Collapsible */}
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 20,
          marginBottom: 30,
          shadowColor: theme === 'dark' ? colors.primary : colors.black,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: theme === 'dark' ? 0.3 : 0.1,
          shadowRadius: 12,
          elevation: 5,
        }}>
          <QRCodeDisplay userId={user.id} collapsible={true} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
