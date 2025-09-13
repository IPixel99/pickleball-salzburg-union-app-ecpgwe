
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';

interface TestData {
  id: string;
  test_message: string;
  test_number: number;
  created_at: string;
}

const SupabaseConnectionTest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [testData, setTestData] = useState<TestData[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setLoading(true);
    try {
      console.log('Testing Supabase connection...');
      
      // Test 1: Read existing data
      const { data: existingData, error: readError } = await supabase
        .from('test_connection')
        .select('*')
        .order('created_at', { ascending: false });

      if (readError) {
        console.error('Read error:', readError);
        throw readError;
      }

      console.log('Existing test data:', existingData);
      setTestData(existingData || []);

      // Test 2: Insert new data
      const testMessage = `App Test - ${new Date().toLocaleString('de-DE')}`;
      const { data: insertData, error: insertError } = await supabase
        .from('test_connection')
        .insert([
          {
            test_message: testMessage,
            test_number: Math.floor(Math.random() * 100)
          }
        ])
        .select();

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }

      console.log('Inserted test data:', insertData);

      // Test 3: Read updated data
      const { data: updatedData, error: updateReadError } = await supabase
        .from('test_connection')
        .select('*')
        .order('created_at', { ascending: false });

      if (updateReadError) {
        console.error('Updated read error:', updateReadError);
        throw updateReadError;
      }

      setTestData(updatedData || []);
      setConnectionStatus('connected');
      
      Alert.alert(
        'Supabase Test Erfolgreich!',
        `Verbindung funktioniert perfekt!\n\nGefundene Einträge: ${updatedData?.length || 0}\nNeuer Eintrag erstellt: ${testMessage}`,
        [{ text: 'OK' }]
      );

    } catch (error: any) {
      console.error('Supabase connection test failed:', error);
      setConnectionStatus('error');
      
      Alert.alert(
        'Supabase Verbindungsfehler',
        `Fehler beim Testen der Verbindung:\n\n${error.message || error.toString()}`,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const clearTestData = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('test_connection')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) {
        throw error;
      }

      setTestData([]);
      Alert.alert('Erfolg', 'Test-Daten wurden gelöscht!');
    } catch (error: any) {
      console.error('Error clearing test data:', error);
      Alert.alert('Fehler', `Fehler beim Löschen: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      default:
        return colors.text;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return '✅ Verbunden';
      case 'error':
        return '❌ Fehler';
      default:
        return '⏳ Teste...';
    }
  };

  return (
    <View style={[commonStyles.container, { padding: 20 }]}>
      <Text style={[commonStyles.title, { textAlign: 'center', marginBottom: 20 }]}>
        Supabase Verbindungstest
      </Text>

      <View style={{
        backgroundColor: colors.surface,
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        alignItems: 'center'
      }}>
        <Text style={[commonStyles.subtitle, { color: getStatusColor(), marginBottom: 10 }]}>
          Status: {getStatusText()}
        </Text>
        
        {loading && <ActivityIndicator size="small" color={colors.primary} />}
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={[commonStyles.subtitle, { marginBottom: 10 }]}>
          Test-Daten ({testData.length} Einträge):
        </Text>
        
        {testData.length > 0 ? (
          testData.slice(0, 3).map((item, index) => (
            <View key={item.id} style={{
              backgroundColor: colors.surface,
              padding: 10,
              borderRadius: 8,
              marginBottom: 8
            }}>
              <Text style={[commonStyles.text, { fontSize: 12, color: colors.textSecondary }]}>
                #{index + 1} - {new Date(item.created_at).toLocaleString('de-DE')}
              </Text>
              <Text style={commonStyles.text}>
                {item.test_message}
              </Text>
              <Text style={[commonStyles.text, { fontSize: 12, color: colors.textSecondary }]}>
                Nummer: {item.test_number}
              </Text>
            </View>
          ))
        ) : (
          <Text style={[commonStyles.text, { color: colors.textSecondary, textAlign: 'center' }]}>
            Keine Test-Daten vorhanden
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={[buttonStyles.primary, { marginBottom: 10 }]}
        onPress={testConnection}
        disabled={loading}
      >
        <Text style={buttonStyles.primaryText}>
          {loading ? 'Teste...' : 'Verbindung Testen'}
        </Text>
      </TouchableOpacity>

      {testData.length > 0 && (
        <TouchableOpacity
          style={[buttonStyles.secondary]}
          onPress={clearTestData}
          disabled={loading}
        >
          <Text style={buttonStyles.secondaryText}>
            Test-Daten Löschen
          </Text>
        </TouchableOpacity>
      )}

      <View style={{ marginTop: 20, padding: 15, backgroundColor: colors.surface, borderRadius: 10 }}>
        <Text style={[commonStyles.subtitle, { marginBottom: 10 }]}>
          Verbindungsdetails:
        </Text>
        <Text style={[commonStyles.text, { fontSize: 12, color: colors.textSecondary }]}>
          Projekt: asugynuigbnrsynczdhe
        </Text>
        <Text style={[commonStyles.text, { fontSize: 12, color: colors.textSecondary }]}>
          Region: eu-central-1
        </Text>
        <Text style={[commonStyles.text, { fontSize: 12, color: colors.textSecondary }]}>
          Status: ACTIVE_HEALTHY
        </Text>
      </View>
    </View>
  );
};

export default SupabaseConnectionTest;
