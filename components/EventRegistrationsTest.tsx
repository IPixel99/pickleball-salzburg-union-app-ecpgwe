
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from './Icon';

export default function EventRegistrationsTest() {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    console.log('EventRegistrationsTest:', message);
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testEventParticipantsTable = async () => {
    if (!user) {
      addResult('❌ No user logged in');
      return;
    }

    setLoading(true);
    addResult('🔍 Testing event_participants table...');

    try {
      // Test 1: Check if table exists by trying to select from it
      addResult('📋 Testing table access...');
      const { data, error } = await supabase
        .from('event_participants')
        .select('*')
        .limit(1);

      if (error) {
        addResult(`❌ Table access error: ${error.message}`);
        if (error.message.includes('relation "event_participants" does not exist')) {
          addResult('💡 The event_participants table needs to be created. Please run the SQL from sql/create_event_participants.sql');
        }
        return;
      }

      addResult('✅ Table exists and is accessible');

      // Test 2: Try to fetch user's registrations
      addResult('🔍 Fetching user registrations...');
      const { data: registrations, error: fetchError } = await supabase
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
            start_time,
            end_time,
            type
          )
        `)
        .eq('profile_id', user.id);

      if (fetchError) {
        addResult(`❌ Fetch error: ${fetchError.message}`);
        return;
      }

      addResult(`✅ Found ${registrations?.length || 0} registrations for user`);
      
      if (registrations && registrations.length > 0) {
        registrations.forEach((reg, index) => {
          addResult(`📅 Registration ${index + 1}: ${reg.events.title} (${reg.status})`);
        });
      }

      // Test 3: Check events table
      addResult('🔍 Testing events table...');
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('id, title, start_time')
        .limit(3);

      if (eventsError) {
        addResult(`❌ Events error: ${eventsError.message}`);
      } else {
        addResult(`✅ Found ${events?.length || 0} events`);
      }

    } catch (error: any) {
      addResult(`❌ Unexpected error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const createTestRegistration = async () => {
    if (!user) {
      addResult('❌ No user logged in');
      return;
    }

    setLoading(true);
    addResult('🔧 Creating test registration...');

    try {
      // First, get an event to register for
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('id, title')
        .limit(1);

      if (eventsError || !events || events.length === 0) {
        addResult('❌ No events found to register for');
        return;
      }

      const event = events[0];
      addResult(`📝 Registering for event: ${event.title}`);

      // Create registration
      const { data, error } = await supabase
        .from('event_participants')
        .insert({
          event_id: event.id,
          profile_id: user.id,
          status: 'PENDING'
        })
        .select();

      if (error) {
        addResult(`❌ Registration error: ${error.message}`);
        return;
      }

      addResult('✅ Test registration created successfully');
      addResult('🔄 Now testing fetch again...');
      
      // Test fetch again
      setTimeout(() => {
        testEventParticipantsTable();
      }, 1000);

    } catch (error: any) {
      addResult(`❌ Unexpected error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[commonStyles.card, { margin: 20 }]}>
      <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 16 }]}>
        Event Registrations Test
      </Text>

      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        <TouchableOpacity
          style={[
            {
              backgroundColor: colors.primary,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              marginRight: 8,
              opacity: loading ? 0.6 : 1,
            }
          ]}
          onPress={testEventParticipantsTable}
          disabled={loading}
        >
          <Text style={[commonStyles.text, { color: colors.white, fontSize: 12 }]}>
            Test Table
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            {
              backgroundColor: colors.success,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              marginRight: 8,
              opacity: loading ? 0.6 : 1,
            }
          ]}
          onPress={createTestRegistration}
          disabled={loading}
        >
          <Text style={[commonStyles.text, { color: colors.white, fontSize: 12 }]}>
            Create Test
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            {
              backgroundColor: colors.textLight,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
            }
          ]}
          onPress={clearResults}
        >
          <Text style={[commonStyles.text, { color: colors.white, fontSize: 12 }]}>
            Clear
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ maxHeight: 300 }}>
        {testResults.map((result, index) => (
          <Text key={index} style={[commonStyles.text, { fontSize: 11, marginBottom: 4, fontFamily: 'monospace' }]}>
            {result}
          </Text>
        ))}
        {testResults.length === 0 && (
          <Text style={[commonStyles.textLight, { fontSize: 12, textAlign: 'center', padding: 20 }]}>
            Click "Test Table" to run diagnostics
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
