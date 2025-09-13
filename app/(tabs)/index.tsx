
import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { commonStyles, colors } from '../../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../../components/Icon';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
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
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user && !authLoading) {
      fetchData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchData = async () => {
    console.log('HomeScreen: Fetching user data and events');
    try {
      await Promise.all([fetchProfile(), fetchUpcomingEvents()]);
    } catch (error) {
      console.error('HomeScreen: Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    if (!user) return;

    try {
      console.log('HomeScreen: Fetching profile for user:', user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('HomeScreen: Error fetching profile:', error);
        // If profile doesn't exist, create a basic one from user data
        if (error.code === 'PGRST116') {
          console.log('HomeScreen: Profile not found, creating basic profile');
          const basicProfile: Profile = {
            id: user.id,
            email: user.email,
            first_name: user.user_metadata?.first_name || null,
            last_name: user.user_metadata?.last_name || null,
            avatar_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setProfile(basicProfile);
        }
        return;
      }

      console.log('HomeScreen: Profile fetched:', data);
      setProfile(data);
    } catch (error) {
      console.error('HomeScreen: Profile fetch failed:', error);
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
      console.error('HomeScreen: Events fetch failed:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const getDisplayName = () => {
    if (!profile) return 'Gast';
    
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    } else if (profile.first_name) {
      return profile.first_name;
    } else if (profile.email) {
      return profile.email.split('@')[0];
    }
    return 'Mitglied';
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'TOURNAMENT':
        return 'trophy';
      case 'GAME':
        return 'tennisball';
      case 'PRACTICE':
        return 'fitness';
      default:
        return 'calendar';
    }
  };

  const handleBookSession = () => {
    console.log('HomeScreen: Book Session pressed');
    router.push('/(tabs)/events');
  };

  const handleTournaments = () => {
    console.log('HomeScreen: Tournaments pressed');
    router.push('/(tabs)/events');
  };

  const handleViewAllEvents = () => {
    console.log('HomeScreen: View All Events pressed');
    router.push('/(tabs)/events');
  };

  const handleBookCourt = () => {
    console.log('HomeScreen: Book Court pressed');
    router.push('/(tabs)/events');
  };

  const handleEventPress = (eventId: string) => {
    console.log('HomeScreen: Event pressed:', eventId);
    router.push('/(tabs)/events');
  };

  if (authLoading || loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={[commonStyles.centerContent, { justifyContent: 'center' }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[commonStyles.text, { marginTop: 16, textAlign: 'center' }]}>
            Lade Daten...
          </Text>
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
        {/* Welcome Banner */}
        <View style={styles.welcomeBanner}>
          <View style={styles.logoContainer}>
            <Text style={styles.clubText}>CLUB</Text>
          </View>
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{getDisplayName()}</Text>
          </View>
        </View>

        {/* Quick Action Buttons */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleBookSession}>
            <View style={styles.actionIconContainer}>
              <Icon name="calendar" size={24} color={colors.primary} />
            </View>
            <Text style={styles.actionButtonText}>Book Session</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleTournaments}>
            <View style={styles.actionIconContainer}>
              <Icon name="trophy" size={24} color={colors.primary} />
            </View>
            <Text style={styles.actionButtonText}>Tournaments</Text>
          </TouchableOpacity>
        </View>

        {/* Upcoming Activities */}
        <View style={styles.upcomingSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Activities</Text>
            <TouchableOpacity onPress={handleViewAllEvents}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.activitiesContainer}>
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <TouchableOpacity 
                  key={event.id} 
                  style={[
                    styles.eventCard,
                    upcomingEvents.indexOf(event) === upcomingEvents.length - 1 && styles.lastEventCard
                  ]}
                  onPress={() => handleEventPress(event.id)}
                >
                  <View style={styles.eventIconContainer}>
                    <Icon 
                      name={getEventTypeIcon(event.type)} 
                      size={20} 
                      color={colors.primary} 
                    />
                  </View>
                  <View style={styles.eventDetails}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventTime}>
                      {formatDate(event.start_time)} • {formatTime(event.start_time)}
                    </Text>
                    {event.location && (
                      <Text style={styles.eventLocation}>{event.location}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noActivitiesContainer}>
                <Text style={styles.noActivitiesText}>No upcoming activities</Text>
                <TouchableOpacity style={styles.bookCourtButton} onPress={handleBookCourt}>
                  <Text style={styles.bookCourtButtonText}>Book a Court</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = {
  welcomeBanner: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  logoContainer: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 30,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 16,
  },
  clubText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    textAlign: 'center' as const,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  quickActionsContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 32,
    gap: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center' as const,
    ...commonStyles.shadow,
  },
  actionIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: colors.secondary,
    borderRadius: 30,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    textAlign: 'center' as const,
  },
  upcomingSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  activitiesContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    ...commonStyles.shadow,
  },
  eventCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lastEventCard: {
    borderBottomWidth: 0,
  },
  eventIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 12,
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 14,
    color: colors.textLight,
  },
  noActivitiesContainer: {
    alignItems: 'center' as const,
    paddingVertical: 32,
  },
  noActivitiesText: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 20,
    textAlign: 'center' as const,
  },
  bookCourtButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  bookCourtButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
};
