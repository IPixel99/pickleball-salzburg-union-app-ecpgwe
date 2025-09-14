
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import Icon from './Icon';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { commonStyles, colors } from '../styles/commonStyles';

export default function EventRegistrationsDebug() {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addDebugInfo = (message: string) => {
    console.log(message);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testEventParticipantsTable = async () => {
    if (!user) {
      addDebugInfo('❌ Kein Benutzer angemeldet');
      return;
    }

    setLoading(true);
    setDebugInfo([]);
    addDebugInfo('🔍 Teste event_participants Tabelle...');
    addDebugInfo(`👤 Benutzer ID: ${user.id}`);

    try {
      // Test 1: Check if table exists and what columns it has
      addDebugInfo('📋 Teste Tabellenstruktur...');
      
      const { data: tableInfo, error: tableError } = await supabase
        .from('event_participants')
        .select('*')
        .limit(1);

      if (tableError) {
        addDebugInfo(`❌ Tabellenfehler: ${tableError.message}`);
        
        // Try to get more info about the error
        if (tableError.message.includes('does not exist')) {
          addDebugInfo('💡 Die Tabelle event_participants existiert nicht');
          addDebugInfo('📝 Erstelle die Tabelle manuell in der Supabase Console:');
          addDebugInfo(`
CREATE TABLE event_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text DEFAULT 'PENDING',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own registrations" 
ON event_participants FOR ALL 
USING (user_id = auth.uid());
          `);
        }
      } else {
        addDebugInfo('✅ Tabelle event_participants gefunden');
        addDebugInfo(`📊 Beispieldaten: ${JSON.stringify(tableInfo, null, 2)}`);
      }

      // Test 2: Try to fetch user's registrations with user_id
      addDebugInfo('🔍 Teste Abfrage mit user_id...');
      const { data: userIdData, error: userIdError } = await supabase
        .from('event_participants')
        .select('*')
        .eq('user_id', user.id);

      if (userIdError) {
        addDebugInfo(`❌ user_id Fehler: ${userIdError.message}`);
        
        // Test 3: Try with profile_id instead
        addDebugInfo('🔍 Teste Abfrage mit profile_id...');
        const { data: profileIdData, error: profileIdError } = await supabase
          .from('event_participants')
          .select('*')
          .eq('profile_id', user.id);

        if (profileIdError) {
          addDebugInfo(`❌ profile_id Fehler: ${profileIdError.message}`);
        } else {
          addDebugInfo('✅ profile_id funktioniert');
          addDebugInfo(`📊 Gefundene Registrierungen: ${profileIdData?.length || 0}`);
          if (profileIdData && profileIdData.length > 0) {
            addDebugInfo(`📋 Erste Registrierung: ${JSON.stringify(profileIdData[0], null, 2)}`);
          }
        }
      } else {
        addDebugInfo('✅ user_id funktioniert');
        addDebugInfo(`📊 Gefundene Registrierungen: ${userIdData?.length || 0}`);
        if (userIdData && userIdData.length > 0) {
          addDebugInfo(`📋 Erste Registrierung: ${JSON.stringify(userIdData[0], null, 2)}`);
        }
      }

      // Test 4: Try to join with events table
      addDebugInfo('🔗 Teste Join mit events Tabelle...');
      const { data: joinData, error: joinError } = await supabase
        .from('event_participants')
        .select(`
          id,
          event_id,
          user_id,
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
        .eq('user_id', user.id)
        .limit(3);

      if (joinError) {
        addDebugInfo(`❌ Join Fehler: ${joinError.message}`);
        
        // Try with profile_id
        const { data: joinProfileData, error: joinProfileError } = await supabase
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
          .eq('profile_id', user.id)
          .limit(3);

        if (joinProfileError) {
          addDebugInfo(`❌ Join mit profile_id Fehler: ${joinProfileError.message}`);
        } else {
          addDebugInfo('✅ Join mit profile_id funktioniert');
          addDebugInfo(`📊 Events mit Registrierungen: ${joinProfileData?.length || 0}`);
        }
      } else {
        addDebugInfo('✅ Join mit user_id funktioniert');
        addDebugInfo(`📊 Events mit Registrierungen: ${joinData?.length || 0}`);
      }

    } catch (error) {
      addDebugInfo(`💥 Unerwarteter Fehler: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const clearDebugInfo = () => {
    setDebugInfo([]);
  };

  return (
    <View style={[commonStyles.card, { marginBottom: 20 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <Icon name="bug" size={24} color={colors.primary} />
        <Text style={[commonStyles.text, { fontWeight: '600', marginLeft: 12 }]}>
          Event Registrations Debug
        </Text>
      </View>

      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        <TouchableOpacity
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 8,
            marginRight: 8,
            flexDirection: 'row',
            alignItems: 'center',
          }}
          onPress={testEventParticipantsTable}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Icon name="play" size={16} color={colors.white} />
          )}
          <Text style={[commonStyles.text, { color: colors.white, marginLeft: 8, fontWeight: '600' }]}>
            Test starten
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: colors.background,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
          }}
          onPress={clearDebugInfo}
        >
          <Icon name="trash" size={16} color={colors.text} />
          <Text style={[commonStyles.text, { marginLeft: 8, fontWeight: '600' }]}>
            Löschen
          </Text>
        </TouchableOpacity>
      </View>

      {debugInfo.length > 0 && (
        <ScrollView
          style={{
            backgroundColor: colors.background,
            borderRadius: 8,
            padding: 12,
            maxHeight: 300,
          }}
          showsVerticalScrollIndicator={true}
        >
          {debugInfo.map((info, index) => (
            <Text
              key={index}
              style={[
                commonStyles.text,
                {
                  fontSize: 12,
                  fontFamily: 'monospace',
                  marginBottom: 4,
                  color: info.includes('❌') ? colors.error : 
                        info.includes('✅') ? colors.success : 
                        info.includes('💡') ? colors.yellow : colors.text,
                }
              ]}
            >
              {info}
            </Text>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
