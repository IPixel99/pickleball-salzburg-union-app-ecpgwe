
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import { useAuth } from '../hooks/useAuth';

export default function ImageUploadTest() {
  const { user } = useAuth();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string>('');
  const [testImageUrl, setTestImageUrl] = useState<string>('');

  const runImageUploadTest = async () => {
    if (!user) {
      Alert.alert('Fehler', 'Benutzer nicht angemeldet');
      return;
    }

    setTesting(true);
    setTestResult('');
    setTestImageUrl('');

    try {
      console.log('=== IMAGE UPLOAD TEST START ===');
      
      // Step 1: Request permissions
      console.log('1. Requesting permissions...');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setTestResult('❌ Berechtigung verweigert');
        return;
      }
      console.log('✅ Permissions granted');

      // Step 2: Pick image
      console.log('2. Opening image picker...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets || !result.assets[0]) {
        setTestResult('❌ Kein Bild ausgewählt');
        return;
      }

      const imageUri = result.assets[0].uri;
      console.log('✅ Image selected:', imageUri);

      // Step 3: Convert to blob
      console.log('3. Converting to blob...');
      const response = await fetch(imageUri);
      if (!response.ok) {
        setTestResult(`❌ Fetch failed: ${response.status}`);
        return;
      }

      const blob = await response.blob();
      console.log('✅ Blob created:', blob.size, 'bytes, type:', blob.type);

      if (blob.size === 0) {
        setTestResult('❌ Blob ist leer');
        return;
      }

      // Step 4: Test storage upload
      console.log('4. Testing storage upload...');
      const fileName = `test/${user.id}/test_${Date.now()}.jpg`;
      
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: true,
          contentType: blob.type || 'image/jpeg',
        });

      if (error) {
        console.error('❌ Upload error:', error);
        setTestResult(`❌ Upload-Fehler: ${error.message}`);
        return;
      }

      console.log('✅ Upload successful:', data);

      // Step 5: Get public URL
      console.log('5. Getting public URL...');
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      console.log('✅ Public URL:', publicUrl);
      setTestImageUrl(publicUrl);

      // Step 6: Clean up test file
      console.log('6. Cleaning up test file...');
      await supabase.storage
        .from('avatars')
        .remove([fileName]);

      console.log('✅ Test completed successfully');
      setTestResult('✅ Test erfolgreich! Bildupload funktioniert.');

      console.log('=== IMAGE UPLOAD TEST END ===');

    } catch (error) {
      console.error('❌ Test error:', error);
      setTestResult(`❌ Test-Fehler: ${error}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <View style={[commonStyles.card, { marginBottom: 20 }]}>
      <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
        Bildupload-Test
      </Text>
      <Text style={[commonStyles.textLight, { marginBottom: 16 }]}>
        Teste den kompletten Bildupload-Prozess um Probleme zu identifizieren.
      </Text>
      
      <TouchableOpacity
        style={[
          buttonStyles.primary,
          { width: '100%', marginBottom: 16 },
          testing && { opacity: 0.7 }
        ]}
        onPress={runImageUploadTest}
        disabled={testing || !user}
      >
        {testing ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <Text style={commonStyles.buttonTextWhite}>
            Test starten
          </Text>
        )}
      </TouchableOpacity>

      {testResult && (
        <View style={{ 
          padding: 12, 
          backgroundColor: testResult.includes('✅') ? '#e8f5e8' : '#ffeaea',
          borderRadius: 8,
          marginBottom: 12
        }}>
          <Text style={{ 
            color: testResult.includes('✅') ? '#2d5a2d' : '#8b0000',
            fontSize: 14
          }}>
            {testResult}
          </Text>
        </View>
      )}

      {testImageUrl && (
        <View style={{ alignItems: 'center' }}>
          <Text style={[commonStyles.textLight, { marginBottom: 8 }]}>
            Test-Bild:
          </Text>
          <Image
            source={{ uri: testImageUrl }}
            style={{
              width: 100,
              height: 100,
              borderRadius: 8,
              backgroundColor: colors.background,
            }}
            onError={(error) => {
              console.error('Error loading test image:', error);
            }}
          />
        </View>
      )}
    </View>
  );
}
