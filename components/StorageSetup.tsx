
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Linking, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import Icon from './Icon';

interface StorageSetupProps {
  onComplete?: () => void;
}

export default function StorageSetup({ onComplete }: StorageSetupProps) {
  const [testing, setTesting] = useState(false);
  const [creating, setCreating] = useState(false);

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
            'Der Avatar-Speicher (Bucket "avatars") existiert noch nicht.\n\nMöchtest du versuchen, ihn automatisch zu erstellen, oder die manuelle Anleitung befolgen?',
            [
              { text: 'Automatisch erstellen', onPress: () => createStorageBucket() },
              { text: 'Manuelle Anleitung', onPress: () => showSetupInstructions() },
              { text: 'Abbrechen', style: 'cancel' }
            ]
          );
        } else if (uploadError.message.includes('Policy')) {
          Alert.alert(
            'Berechtigungen fehlen',
            'Der Avatar-Speicher existiert, aber die RLS-Richtlinien sind nicht korrekt konfiguriert.\n\nBitte überprüfe die Storage-Richtlinien in der Supabase-Konsole.',
            [
              { text: 'Richtlinien erstellen', onPress: () => createStoragePolicies() },
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

  const createStorageBucket = async () => {
    setCreating(true);
    try {
      console.log('Attempting to create avatars bucket...');
      
      // Try to create the bucket using SQL
      const { error: bucketError } = await supabase.rpc('create_avatars_bucket');
      
      if (bucketError) {
        console.error('Error creating bucket:', bucketError);
        Alert.alert(
          'Automatische Erstellung fehlgeschlagen',
          'Der Bucket konnte nicht automatisch erstellt werden. Bitte folge der manuellen Anleitung.',
          [
            { text: 'Manuelle Anleitung', onPress: () => showSetupInstructions() },
            { text: 'OK', style: 'default' }
          ]
        );
      } else {
        console.log('Bucket created successfully');
        Alert.alert(
          'Bucket erstellt!',
          'Der Avatar-Speicher wurde erfolgreich erstellt. Teste ihn jetzt.',
          [{ text: 'Testen', onPress: () => testStorage() }]
        );
      }
    } catch (error) {
      console.error('Error in createStorageBucket:', error);
      Alert.alert(
        'Fehler',
        'Beim Erstellen des Buckets ist ein Fehler aufgetreten. Bitte folge der manuellen Anleitung.',
        [
          { text: 'Manuelle Anleitung', onPress: () => showSetupInstructions() },
          { text: 'OK', style: 'default' }
        ]
      );
    } finally {
      setCreating(false);
    }
  };

  const createStoragePolicies = async () => {
    try {
      console.log('Attempting to create storage policies...');
      
      const { error } = await supabase.rpc('create_avatar_policies');
      
      if (error) {
        console.error('Error creating policies:', error);
        Alert.alert(
          'Richtlinien-Erstellung fehlgeschlagen',
          'Die RLS-Richtlinien konnten nicht automatisch erstellt werden. Bitte erstelle sie manuell in der Supabase-Konsole.',
          [
            { text: 'Supabase öffnen', onPress: () => openSupabaseConsole() },
            { text: 'OK', style: 'default' }
          ]
        );
      } else {
        console.log('Policies created successfully');
        Alert.alert(
          'Richtlinien erstellt!',
          'Die RLS-Richtlinien wurden erfolgreich erstellt. Teste den Speicher jetzt.',
          [{ text: 'Testen', onPress: () => testStorage() }]
        );
      }
    } catch (error) {
      console.error('Error in createStoragePolicies:', error);
      Alert.alert(
        'Fehler',
        'Beim Erstellen der Richtlinien ist ein Fehler aufgetreten.',
        [{ text: 'OK', style: 'default' }]
      );
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
      'So richtest du den Avatar-Speicher manuell ein:\n\n1. Öffne die Supabase-Konsole\n2. Gehe zu "Storage"\n3. Klicke auf "New bucket"\n4. Name: "avatars"\n5. Setze "Public bucket" auf true\n6. File size limit: 5MB\n7. Allowed MIME types: image/jpeg, image/png, image/webp\n8. Erstelle RLS-Richtlinien für Upload, View, Update, Delete',
      [
        { text: 'Supabase öffnen', onPress: () => openSupabaseConsole() },
        { text: 'SQL-Befehle anzeigen', onPress: () => showSQLCommands() },
        { text: 'OK', style: 'default' }
      ]
    );
  };

  const showSQLCommands = () => {
    Alert.alert(
      'SQL-Befehle für Storage Setup',
      'Führe diese SQL-Befehle in der Supabase SQL-Konsole aus:\n\n-- Bucket erstellen\nINSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)\nVALUES (\n  \'avatars\',\n  \'avatars\',\n  true,\n  5242880,\n  ARRAY[\'image/jpeg\', \'image/png\', \'image/webp\']\n);\n\n-- RLS aktivieren\nALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;\n\n-- Richtlinien erstellen (siehe Dokumentation)',
      [
        { text: 'Supabase öffnen', onPress: () => openSupabaseConsole() },
        { text: 'OK', style: 'default' }
      ]
    );
  };

  return (
    <ScrollView style={[commonStyles.card, { marginBottom: 20 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Icon name="cloud-upload" size={24} color={colors.primary} />
        <Text style={[commonStyles.text, { fontWeight: '600', marginLeft: 12 }]}>
          Avatar-Speicher Setup
        </Text>
      </View>
      
      <Text style={[commonStyles.textLight, { marginBottom: 16, lineHeight: 20 }]}>
        Der Speicher für Profilbilder muss eingerichtet werden, bevor Bilder hochgeladen werden können.
      </Text>
      
      <View style={{ gap: 12 }}>
        <TouchableOpacity
          style={[
            buttonStyles.primary,
            testing && { opacity: 0.7 }
          ]}
          onPress={testStorage}
          disabled={testing || creating}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            {testing ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Icon name="checkmark-circle" size={18} color={colors.white} />
                <Text style={[commonStyles.buttonTextWhite, { marginLeft: 8 }]}>
                  Storage testen
                </Text>
              </>
            )}
          </View>
        </TouchableOpacity>
        
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            style={[buttonStyles.outline, { flex: 1 }]}
            onPress={createStorageBucket}
            disabled={testing || creating}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              {creating ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <>
                  <Icon name="add-circle" size={16} color={colors.primary} />
                  <Text style={[commonStyles.buttonText, { color: colors.primary, marginLeft: 6, fontSize: 14 }]}>
                    Auto-Setup
                  </Text>
                </>
              )}
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[buttonStyles.outline, { flex: 1 }]}
            onPress={showSetupInstructions}
            disabled={testing || creating}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="help-circle" size={16} color={colors.primary} />
              <Text style={[commonStyles.buttonText, { color: colors.primary, marginLeft: 6, fontSize: 14 }]}>
                Anleitung
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={{ 
        marginTop: 16, 
        padding: 12, 
        backgroundColor: colors.background, 
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary
      }}>
        <Text style={[commonStyles.textLight, { fontSize: 12, lineHeight: 16 }]}>
          💡 Tipp: Teste zuerst den Storage. Falls er nicht funktioniert, versuche das Auto-Setup oder folge der manuellen Anleitung.
        </Text>
      </View>
    </ScrollView>
  );
}
