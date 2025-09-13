
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';

interface StorageSetupProps {
  onComplete?: () => void;
}

export default function StorageSetup({ onComplete }: StorageSetupProps) {
  const [setting, setSetting] = useState(false);

  const setupStorage = async () => {
    setSetting(true);
    try {
      console.log('Setting up avatar storage...');
      
      // Try to create a test file to see if the bucket exists
      const testBlob = new Blob(['test'], { type: 'text/plain' });
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload('test/test.txt', testBlob);

      if (uploadError) {
        console.error('Storage setup error:', uploadError);
        
        if (uploadError.message.includes('Bucket not found')) {
          Alert.alert(
            'Storage Setup erforderlich',
            'Der Avatar-Speicher muss eingerichtet werden. Bitte kontaktiere den Administrator oder führe die manuelle Einrichtung durch.',
            [
              { text: 'OK', style: 'default' }
            ]
          );
        } else {
          Alert.alert('Fehler', 'Beim Einrichten des Speichers ist ein Fehler aufgetreten.');
        }
      } else {
        // Clean up test file
        await supabase.storage
          .from('avatars')
          .remove(['test/test.txt']);
          
        console.log('Storage setup completed successfully');
        Alert.alert('Erfolg', 'Avatar-Speicher wurde erfolgreich eingerichtet!');
        onComplete?.();
      }
    } catch (error) {
      console.error('Error in setupStorage:', error);
      Alert.alert('Fehler', 'Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setSetting(false);
    }
  };

  return (
    <View style={[commonStyles.card, { marginBottom: 20 }]}>
      <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
        Avatar-Speicher Setup
      </Text>
      <Text style={[commonStyles.textLight, { marginBottom: 16 }]}>
        Richte den Speicher für Profilbilder ein, falls noch nicht geschehen.
      </Text>
      
      <TouchableOpacity
        style={[
          buttonStyles.outline,
          { width: '100%' },
          setting && { opacity: 0.7 }
        ]}
        onPress={setupStorage}
        disabled={setting}
      >
        {setting ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Text style={[commonStyles.buttonText, { color: colors.primary }]}>
            Speicher einrichten
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
