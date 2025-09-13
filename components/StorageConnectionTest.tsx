
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import { testStorageConnection, uploadProfileImage, validateImageUri } from '../utils/imageUtils';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import * as ImagePicker from 'expo-image-picker';
import Icon from './Icon';

export default function StorageConnectionTest() {
  const [testing, setTesting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testImage, setTestImage] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const { user } = useAuth();

  const runConnectionTest = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      console.log('Running storage connection test...');
      const result = await testStorageConnection();
      
      setTestResult(result.message);
      
      if (result.success) {
        Alert.alert('Test erfolgreich', result.message);
      } else {
        Alert.alert('Test fehlgeschlagen', result.message);
      }
    } catch (error) {
      console.error('Error running connection test:', error);
      setTestResult('Unerwarteter Fehler beim Testen');
      Alert.alert('Fehler', 'Unerwarteter Fehler beim Testen der Verbindung');
    } finally {
      setTesting(false);
    }
  };

  const selectTestImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Berechtigung erforderlich', 'Wir benötigen Zugriff auf deine Fotos für den Test.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        console.log('Test image selected:', asset.uri);
        setTestImage(asset.uri);
        setUploadResult(null);
      }
    } catch (error) {
      console.error('Error selecting test image:', error);
      Alert.alert('Fehler', 'Beim Auswählen des Testbildes ist ein Fehler aufgetreten.');
    }
  };

  const testImageUpload = async () => {
    if (!testImage || !user) {
      Alert.alert('Fehler', 'Bitte wähle zuerst ein Testbild aus und stelle sicher, dass du angemeldet bist.');
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      console.log('Testing image upload...');
      const result = await uploadProfileImage(testImage, user.id);
      
      if (result.success && result.url) {
        setUploadResult(`Upload erfolgreich! URL: ${result.url}`);
        Alert.alert('Upload erfolgreich', 'Das Testbild wurde erfolgreich hochgeladen!');
      } else {
        setUploadResult(`Upload fehlgeschlagen: ${result.error}`);
        Alert.alert('Upload fehlgeschlagen', result.error || 'Unbekannter Fehler');
      }
    } catch (error) {
      console.error('Error testing image upload:', error);
      setUploadResult('Unerwarteter Fehler beim Upload-Test');
      Alert.alert('Fehler', 'Unerwarteter Fehler beim Testen des Uploads');
    } finally {
      setUploading(false);
    }
  };

  const clearTest = () => {
    setTestImage(null);
    setUploadResult(null);
    setTestResult(null);
  };

  return (
    <View style={[commonStyles.card, { marginBottom: 20 }]}>
      <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 16 }]}>
        Storage-Verbindungstest
      </Text>

      {/* Connection Test */}
      <TouchableOpacity
        style={[buttonStyles.secondary, { marginBottom: 12 }]}
        onPress={runConnectionTest}
        disabled={testing}
      >
        {testing ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <>
            <Icon name="cloud" size={16} color={colors.primary} />
            <Text style={[commonStyles.buttonText, { marginLeft: 8 }]}>
              Verbindung testen
            </Text>
          </>
        )}
      </TouchableOpacity>

      {testResult && (
        <View style={{
          padding: 12,
          backgroundColor: colors.background,
          borderRadius: 8,
          marginBottom: 12
        }}>
          <Text style={[commonStyles.textSmall, { color: colors.textLight }]}>
            {testResult}
          </Text>
        </View>
      )}

      {/* Image Upload Test */}
      <View style={{ marginTop: 16 }}>
        <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 12 }]}>
          Bild-Upload-Test
        </Text>

        <TouchableOpacity
          style={[buttonStyles.secondary, { marginBottom: 12 }]}
          onPress={selectTestImage}
        >
          <Icon name="image" size={16} color={colors.primary} />
          <Text style={[commonStyles.buttonText, { marginLeft: 8 }]}>
            Testbild auswählen
          </Text>
        </TouchableOpacity>

        {testImage && (
          <View style={{ marginBottom: 12, alignItems: 'center' }}>
            <Image
              source={{ uri: testImage }}
              style={{
                width: 80,
                height: 80,
                borderRadius: 8,
                marginBottom: 8
              }}
            />
            <Text style={[commonStyles.textSmall, { color: colors.textLight }]}>
              Testbild ausgewählt
            </Text>
          </View>
        )}

        {testImage && (
          <TouchableOpacity
            style={[buttonStyles.primary, { marginBottom: 12 }]}
            onPress={testImageUpload}
            disabled={uploading || !user}
          >
            {uploading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Icon name="cloud-upload" size={16} color={colors.white} />
                <Text style={[commonStyles.buttonTextWhite, { marginLeft: 8 }]}>
                  Upload testen
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {uploadResult && (
          <View style={{
            padding: 12,
            backgroundColor: colors.background,
            borderRadius: 8,
            marginBottom: 12
          }}>
            <Text style={[commonStyles.textSmall, { color: colors.textLight }]}>
              {uploadResult}
            </Text>
          </View>
        )}

        {(testImage || testResult || uploadResult) && (
          <TouchableOpacity
            style={[buttonStyles.secondary, { backgroundColor: colors.background }]}
            onPress={clearTest}
          >
            <Icon name="refresh" size={16} color={colors.textLight} />
            <Text style={[commonStyles.buttonText, { marginLeft: 8, color: colors.textLight }]}>
              Test zurücksetzen
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {!user && (
        <View style={{
          padding: 12,
          backgroundColor: colors.warning + '20',
          borderRadius: 8,
          marginTop: 12
        }}>
          <Text style={[commonStyles.textSmall, { color: colors.warning }]}>
            Du musst angemeldet sein, um den Upload-Test durchzuführen.
          </Text>
        </View>
      )}
    </View>
  );
}
