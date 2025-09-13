
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import Icon from './Icon';

export default function StorageFunctions() {
  const [creating, setCreating] = useState(false);

  const createStorageFunction = async () => {
    setCreating(true);
    try {
      console.log('Creating storage setup function...');
      
      // Create a database function to set up storage
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          -- Function to create avatars bucket
          CREATE OR REPLACE FUNCTION create_avatars_bucket()
          RETURNS void
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          BEGIN
            -- Create the avatars bucket if it doesn't exist
            INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
            VALUES (
              'avatars',
              'avatars',
              true,
              5242880, -- 5MB limit
              ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
            )
            ON CONFLICT (id) DO NOTHING;
            
            -- Enable RLS on storage.objects if not already enabled
            ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
          END;
          $$;

          -- Function to create avatar policies
          CREATE OR REPLACE FUNCTION create_avatar_policies()
          RETURNS void
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          BEGIN
            -- Drop existing policies if they exist
            DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
            DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
            DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
            DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
            
            -- Create policy for users to upload their own avatars
            CREATE POLICY "Users can upload their own avatars" ON storage.objects
            FOR INSERT WITH CHECK (
              bucket_id = 'avatars' AND 
              auth.uid()::text = (storage.foldername(name))[1]
            );

            -- Create policy for users to view all avatars (public read)
            CREATE POLICY "Anyone can view avatars" ON storage.objects
            FOR SELECT USING (bucket_id = 'avatars');

            -- Create policy for users to update their own avatars
            CREATE POLICY "Users can update their own avatars" ON storage.objects
            FOR UPDATE USING (
              bucket_id = 'avatars' AND 
              auth.uid()::text = (storage.foldername(name))[1]
            ) WITH CHECK (
              bucket_id = 'avatars' AND 
              auth.uid()::text = (storage.foldername(name))[1]
            );

            -- Create policy for users to delete their own avatars
            CREATE POLICY "Users can delete their own avatars" ON storage.objects
            FOR DELETE USING (
              bucket_id = 'avatars' AND 
              auth.uid()::text = (storage.foldername(name))[1]
            );
          END;
          $$;
        `
      });

      if (error) {
        console.error('Error creating storage functions:', error);
        Alert.alert(
          'Fehler',
          'Die Storage-Funktionen konnten nicht erstellt werden.',
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        console.log('Storage functions created successfully');
        Alert.alert(
          'Funktionen erstellt!',
          'Die Storage-Setup-Funktionen wurden erfolgreich erstellt. Du kannst jetzt das Auto-Setup verwenden.',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('Error in createStorageFunction:', error);
      Alert.alert(
        'Fehler',
        'Beim Erstellen der Storage-Funktionen ist ein Fehler aufgetreten.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <View style={[commonStyles.card, { marginBottom: 20 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Icon name="construct" size={24} color={colors.primary} />
        <Text style={[commonStyles.text, { fontWeight: '600', marginLeft: 12 }]}>
          Storage-Funktionen
        </Text>
      </View>
      
      <Text style={[commonStyles.textLight, { marginBottom: 16, lineHeight: 20 }]}>
        Erstelle die notwendigen Datenbankfunktionen für das automatische Storage-Setup.
      </Text>
      
      <TouchableOpacity
        style={[
          buttonStyles.primary,
          creating && { opacity: 0.7 }
        ]}
        onPress={createStorageFunction}
        disabled={creating}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          {creating ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <>
              <Icon name="build" size={18} color={colors.white} />
              <Text style={[commonStyles.buttonTextWhite, { marginLeft: 8 }]}>
                Funktionen erstellen
              </Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}
