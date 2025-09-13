
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Linking } from 'react-native';
import { supabase } from '../lib/supabase';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';

interface StorageSetupProps {
  onComplete?: () => void;
}

export default function StorageSetup({ onComplete }: StorageSetupProps) {
  const [testing, setTesting] = useState(false);

  const testStorage = async () => {
    setTesting(true);
    try {
      console.log('Testing avatar storage...');
      
      // Try to create a test file to see if the bucket exists and is accessible
      const testBlob = new Blob(['test'], { type: 'text/plain' });
      const testFileName = `test/storage_test_${Date.now()}.txt`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(testFileName, testBlob);

      if (uploadError) {
        console.error('Storage test error:', uploadError);
        
        if (uploadError.message.includes('Bucket not found')) {
          Alert.alert(
            'Storage Setup erforderlich',
            'Der Avatar-Speicher (Bucket "avatars") existiert noch nicht.\n\nBitte führe folgende Schritte in der Supabase-Konsole aus:\n\n1. Gehe zu Storage\n2. Erstelle einen neuen Bucket namens "avatars"\n3. Setze ihn auf "Public"\n4. Füge RLS-Richtlinien hinzu',
            [
              { text: 'Supabase öffnen', onPress: () => openSupabaseConsole() },
              { text: 'OK', style: 'default' }
            ]
          );
        } else if (uploadError.message.includes('Policy')) {
          Alert.alert(
            'Berechtigungen fehlen',
            'Der Avatar-Speicher existiert, aber die RLS-Richtlinien sind nicht korrekt konfiguriert.\n\nBitte überprüfe die Storage-Richtlinien in der Supabase-Konsole.',
            [
              { text: 'Supabase öffnen', onPress: () => openSupabaseConsole() },
              { text: 'OK', style: 'default' }
            ]
          );
        } else {
          Alert.alert(
            'Storage-Fehler',
            `Beim Testen des Speichers ist ein Fehler aufgetreten:\n\n${uploadError.message}`,
            [{ text: 'OK', style: 'default' }]
          );
        }
      } else {
        // Clean up test file
        await supabase.storage
          .from('avatars')
          .remove([testFileName]);
          
        console.log('Storage test completed successfully');
        Alert.alert(
          'Storage funktioniert!',
          'Der Avatar-Speicher ist korrekt eingerichtet und funktioniert.',
          [{ text: 'OK', style: 'default' }]
        );
        onComplete?.();
      }
    } catch (error) {
      console.error('Error in testStorage:', error);
      Alert.alert(
        'Unerwarteter Fehler',
        'Beim Testen des Speichers ist ein unerwarteter Fehler aufgetreten.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setTesting(false);
    }
  };

  const openSupabaseConsole = () => {
    const url = 'https://supabase.com/dashboard/project/asugynuigbnrsynczdhe/storage/buckets';
    Linking.openURL(url).catch(err => {
      console.error('Error opening Supabase console:', err);
      Alert.alert('Fehler', 'Konnte Supabase-Konsole nicht öffnen.');
    });
  };

  const showSetupInstructions = () => {
    Alert.alert(
      'Storage Setup Anleitung',
      'So richtest du den Avatar-Speicher ein:\n\n1. Öffne die Supabase-Konsole\n2. Gehe zu "Storage"\n3. Erstelle einen neuen Bucket namens "avatars"\n4. Setze den Bucket auf "Public"\n5. Füge folgende RLS-Richtlinien hinzu:\n\n• INSERT: Users can upload their own avatars\n• SELECT: Anyone can view avatars\n• UPDATE: Users can update their own avatars\n• DELETE: Users can delete their own avatars',
      [
        { text: 'Supabase öffnen', onPress: () => openSupabaseConsole() },
        { text: 'OK', style: 'default' }
      ]
    );
  };

  return (
    <View style={[commonStyles.card, { marginBottom: 20 }]}>
      <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
        Avatar-Speicher Setup
      </Text>
      <Text style={[commonStyles.textLight, { marginBottom: 16 }]}>
        Teste den Speicher für Profilbilder oder richte ihn ein, falls noch nicht geschehen.
      </Text>
      
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <TouchableOpacity
          style={[
            buttonStyles.primary,
            { flex: 1 },
            testing && { opacity: 0.7 }
          ]}
          onPress={testStorage}
          disabled={testing}
        >
          {testing ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={commonStyles.buttonTextWhite}>
              Testen
            </Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[buttonStyles.outline, { flex: 1 }]}
          onPress={showSetupInstructions}
        >
          <Text style={[commonStyles.buttonText, { color: colors.primary }]}>
            Anleitung
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
