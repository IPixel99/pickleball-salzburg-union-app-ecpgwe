
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import Icon from './Icon';

interface TestResult {
  step: string;
  success: boolean;
  message: string;
  timestamp: string;
}

export default function SupabaseConnectionTest() {
  const { user } = useAuth();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const addTestResult = (step: string, success: boolean, message: string) => {
    const result: TestResult = {
      step,
      success,
      message,
      timestamp: new Date().toLocaleTimeString('de-DE')
    };
    setResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const runConnectionTest = async () => {
    setTesting(true);
    clearResults();

    try {
      // Test 1: Basic connection
      addTestResult('Verbindung', true, 'Supabase Client initialisiert');

      // Test 2: Database connection
      try {
        const { data, error } = await supabase
          .from('test_connection')
          .select('*')
          .limit(1);

        if (error) {
          addTestResult('Datenbankverbindung', false, `Fehler: ${error.message}`);
        } else {
          addTestResult('Datenbankverbindung', true, 'Erfolgreich verbunden');
        }
      } catch (error) {
        addTestResult('Datenbankverbindung', false, `Fehler: ${error}`);
      }

      // Test 3: Auth status
      if (user) {
        addTestResult('Authentifizierung', true, `Angemeldet als: ${user.email}`);
        
        // Test 4: Profile access
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error && error.code !== 'PGRST116') {
            addTestResult('Profil-Zugriff', false, `Fehler: ${error.message}`);
          } else {
            addTestResult('Profil-Zugriff', true, data ? 'Profil gefunden' : 'Profil nicht gefunden (normal bei neuen Benutzern)');
          }
        } catch (error) {
          addTestResult('Profil-Zugriff', false, `Fehler: ${error}`);
        }

        // Test 5: Events access
        try {
          const { data, error } = await supabase
            .from('events')
            .select('id, title')
            .limit(1);

          if (error) {
            addTestResult('Events-Zugriff', false, `Fehler: ${error.message}`);
          } else {
            addTestResult('Events-Zugriff', true, `${data?.length || 0} Events gefunden`);
          }
        } catch (error) {
          addTestResult('Events-Zugriff', false, `Fehler: ${error}`);
        }

        // Test 6: Event registrations access
        try {
          const { data, error } = await supabase
            .from('event_participants')
            .select('id, profile_id')
            .eq('profile_id', user.id)
            .limit(1);

          if (error) {
            addTestResult('Anmeldungen-Zugriff', false, `Fehler: ${error.message}`);
          } else {
            addTestResult('Anmeldungen-Zugriff', true, `${data?.length || 0} Anmeldungen gefunden`);
          }
        } catch (error) {
          addTestResult('Anmeldungen-Zugriff', false, `Fehler: ${error}`);
        }
      } else {
        addTestResult('Authentifizierung', false, 'Nicht angemeldet');
      }

    } catch (error) {
      addTestResult('Allgemeiner Test', false, `Unerwarteter Fehler: ${error}`);
    } finally {
      setTesting(false);
    }
  };

  const getResultIcon = (success: boolean) => {
    return success ? 'checkmark-circle' : 'close-circle';
  };

  const getResultColor = (success: boolean) => {
    return success ? colors.success : colors.error;
  };

  return (
    <View style={[commonStyles.card, { marginBottom: 20 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <Icon name="wifi" size={24} color={colors.primary} />
        <Text style={[commonStyles.text, { fontWeight: '600', marginLeft: 12 }]}>
          Supabase Verbindungstest
        </Text>
      </View>

      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        <TouchableOpacity
          style={[buttonStyles.primary, { flex: 1, marginRight: 8 }]}
          onPress={runConnectionTest}
          disabled={testing}
        >
          {testing ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={[commonStyles.text, { color: colors.white, fontWeight: '600' }]}>
              Test starten
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[buttonStyles.secondary, { flex: 1, marginLeft: 8 }]}
          onPress={clearResults}
          disabled={testing}
        >
          <Text style={[commonStyles.text, { color: colors.primary, fontWeight: '600' }]}>
            Löschen
          </Text>
        </TouchableOpacity>
      </View>

      {results.length > 0 && (
        <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
          {results.map((result, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 8,
                borderBottomWidth: index < results.length - 1 ? 1 : 0,
                borderBottomColor: colors.border,
              }}
            >
              <Icon
                name={getResultIcon(result.success)}
                size={20}
                color={getResultColor(result.success)}
                style={{ marginRight: 12 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={[commonStyles.text, { fontWeight: '600', fontSize: 14 }]}>
                  {result.step}
                </Text>
                <Text style={[commonStyles.textLight, { fontSize: 12 }]}>
                  {result.message}
                </Text>
              </View>
              <Text style={[commonStyles.textLight, { fontSize: 10 }]}>
                {result.timestamp}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}

      {results.length === 0 && !testing && (
        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
          <Icon name="information-circle" size={48} color={colors.textLight} />
          <Text style={[commonStyles.textLight, { marginTop: 12, textAlign: 'center' }]}>
            Klicke auf "Test starten", um die Verbindung zu überprüfen
          </Text>
        </View>
      )}
    </View>
  );
}
