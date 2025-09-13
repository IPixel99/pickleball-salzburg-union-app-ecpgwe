
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { uploadProfileImage, deleteProfileImage, testStorageConnection, validateImageUri } from '../utils/imageUtils';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import Icon from './Icon';

interface TestResult {
  step: string;
  success: boolean;
  message: string;
  timestamp: string;
}

export default function AvatarUploadTest() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const addTestResult = (step: string, success: boolean, message: string) => {
    const result: TestResult = {
      step,
      success,
      message,
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [...prev, result]);
    console.log(`Test ${step}: ${success ? 'SUCCESS' : 'FAILED'} - ${message}`);
  };

  const clearResults = () => {
    setTestResults([]);
    setSelectedImage(null);
    setUploadedUrl(null);
  };

  const runFullTest = async () => {
    if (!user) {
      Alert.alert('Fehler', 'Du musst angemeldet sein, um den Test durchzuführen');
      return;
    }

    setIsLoading(true);
    clearResults();

    try {
      // Step 1: Test storage connection
      addTestResult('1. Storage-Verbindung', false, 'Teste Verbindung...');
      const connectionTest = await testStorageConnection();
      addTestResult('1. Storage-Verbindung', connectionTest.success, connectionTest.message);

      if (!connectionTest.success) {
        setIsLoading(false);
        return;
      }

      // Step 2: Test bucket access
      addTestResult('2. Bucket-Zugriff', false, 'Teste Bucket-Zugriff...');
      try {
        const { data, error } = await supabase.storage
          .from('avatars')
          .list('', { limit: 1 });

        if (error) {
          addTestResult('2. Bucket-Zugriff', false, `Fehler: ${error.message}`);
        } else {
          addTestResult('2. Bucket-Zugriff', true, 'Bucket-Zugriff erfolgreich');
        }
      } catch (error) {
        addTestResult('2. Bucket-Zugriff', false, `Unerwarteter Fehler: ${error}`);
      }

      // Step 3: Request camera permissions
      addTestResult('3. Kamera-Berechtigung', false, 'Fordere Berechtigung an...');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        addTestResult('3. Kamera-Berechtigung', false, 'Berechtigung verweigert');
        setIsLoading(false);
        return;
      }
      addTestResult('3. Kamera-Berechtigung', true, 'Berechtigung erteilt');

      // Step 4: Select image
      addTestResult('4. Bild-Auswahl', false, 'Öffne Bildauswahl...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) {
        addTestResult('4. Bild-Auswahl', false, 'Auswahl abgebrochen');
        setIsLoading(false);
        return;
      }

      const imageUri = result.assets[0].uri;
      setSelectedImage(imageUri);
      addTestResult('4. Bild-Auswahl', true, `Bild ausgewählt: ${imageUri.substring(0, 50)}...`);

      // Step 5: Validate image URI
      addTestResult('5. URI-Validierung', false, 'Validiere Bild-URI...');
      const isValidUri = validateImageUri(imageUri);
      addTestResult('5. URI-Validierung', isValidUri, isValidUri ? 'URI ist gültig' : 'URI ist ungültig');

      if (!isValidUri) {
        setIsLoading(false);
        return;
      }

      // Step 6: Upload image
      addTestResult('6. Bild-Upload', false, 'Lade Bild hoch...');
      const uploadResult = await uploadProfileImage(imageUri, user.id);
      
      if (uploadResult.success && uploadResult.url) {
        setUploadedUrl(uploadResult.url);
        addTestResult('6. Bild-Upload', true, `Upload erfolgreich: ${uploadResult.url}`);
      } else {
        addTestResult('6. Bild-Upload', false, uploadResult.error || 'Unbekannter Fehler');
        setIsLoading(false);
        return;
      }

      // Step 7: Verify uploaded image
      addTestResult('7. Upload-Verifikation', false, 'Überprüfe hochgeladenes Bild...');
      try {
        const response = await fetch(uploadResult.url!);
        if (response.ok) {
          addTestResult('7. Upload-Verifikation', true, `Bild erreichbar (${response.status})`);
        } else {
          addTestResult('7. Upload-Verifikation', false, `Bild nicht erreichbar (${response.status})`);
        }
      } catch (error) {
        addTestResult('7. Upload-Verifikation', false, `Fehler beim Abrufen: ${error}`);
      }

      // Step 8: Check profile update
      addTestResult('8. Profil-Update', false, 'Überprüfe Profil-Update...');
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single();

        if (error) {
          addTestResult('8. Profil-Update', false, `Fehler beim Abrufen des Profils: ${error.message}`);
        } else if (profile?.avatar_url === uploadResult.url) {
          addTestResult('8. Profil-Update', true, 'Profil erfolgreich aktualisiert');
        } else {
          addTestResult('8. Profil-Update', false, 'Profil nicht aktualisiert');
        }
      } catch (error) {
        addTestResult('8. Profil-Update', false, `Unerwarteter Fehler: ${error}`);
      }

      addTestResult('✅ Test abgeschlossen', true, 'Alle Tests durchgeführt');

    } catch (error) {
      addTestResult('❌ Test fehlgeschlagen', false, `Unerwarteter Fehler: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testDeleteImage = async () => {
    if (!uploadedUrl || !user) {
      Alert.alert('Fehler', 'Kein hochgeladenes Bild zum Löschen vorhanden');
      return;
    }

    setIsLoading(true);
    addTestResult('🗑️ Lösch-Test', false, 'Lösche hochgeladenes Bild...');

    try {
      const success = await deleteProfileImage(uploadedUrl, user.id);
      if (success) {
        addTestResult('🗑️ Lösch-Test', true, 'Bild erfolgreich gelöscht');
        setUploadedUrl(null);
      } else {
        addTestResult('🗑️ Lösch-Test', false, 'Fehler beim Löschen');
      }
    } catch (error) {
      addTestResult('🗑️ Lösch-Test', false, `Fehler: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getResultIcon = (success: boolean) => {
    return success ? '✅' : '❌';
  };

  const getResultColor = (success: boolean) => {
    return success ? colors.success : colors.error;
  };

  return (
    <ScrollView style={[commonStyles.container, { padding: 20 }]}>
      <View style={{ alignItems: 'center', marginBottom: 30 }}>
        <Icon name="camera" size={48} color={colors.primary} />
        <Text style={[commonStyles.title, { marginTop: 10 }]}>
          Avatar Upload Test
        </Text>
        <Text style={[commonStyles.subtitle, { textAlign: 'center', marginTop: 5 }]}>
          Teste die komplette Avatar-Upload-Funktionalität
        </Text>
      </View>

      {!user && (
        <View style={[commonStyles.card, { backgroundColor: colors.warning + '20', marginBottom: 20 }]}>
          <Text style={[commonStyles.text, { color: colors.warning, textAlign: 'center' }]}>
            Du musst angemeldet sein, um den Test durchzuführen
          </Text>
        </View>
      )}

      <View style={{ marginBottom: 20 }}>
        <TouchableOpacity
          style={[buttonStyles.primary, { marginBottom: 10 }]}
          onPress={runFullTest}
          disabled={isLoading || !user}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={buttonStyles.primaryText}>
              🧪 Vollständigen Test starten
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[buttonStyles.secondary, { marginBottom: 10 }]}
          onPress={clearResults}
          disabled={isLoading}
        >
          <Text style={buttonStyles.secondaryText}>
            🗑️ Ergebnisse löschen
          </Text>
        </TouchableOpacity>

        {uploadedUrl && (
          <TouchableOpacity
            style={[buttonStyles.danger, { marginBottom: 10 }]}
            onPress={testDeleteImage}
            disabled={isLoading}
          >
            <Text style={buttonStyles.dangerText}>
              🗑️ Hochgeladenes Bild löschen
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {selectedImage && (
        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          <Text style={[commonStyles.subtitle, { marginBottom: 10 }]}>
            Ausgewähltes Bild:
          </Text>
          <Image
            source={{ uri: selectedImage }}
            style={{
              width: 150,
              height: 150,
              borderRadius: 75,
              alignSelf: 'center',
              marginBottom: 10
            }}
          />
          <Text style={[commonStyles.caption, { textAlign: 'center' }]}>
            {selectedImage.substring(0, 50)}...
          </Text>
        </View>
      )}

      {uploadedUrl && (
        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          <Text style={[commonStyles.subtitle, { marginBottom: 10 }]}>
            Hochgeladenes Bild:
          </Text>
          <Image
            source={{ uri: uploadedUrl }}
            style={{
              width: 150,
              height: 150,
              borderRadius: 75,
              alignSelf: 'center',
              marginBottom: 10
            }}
          />
          <Text style={[commonStyles.caption, { textAlign: 'center' }]}>
            {uploadedUrl}
          </Text>
        </View>
      )}

      {testResults.length > 0 && (
        <View style={commonStyles.card}>
          <Text style={[commonStyles.subtitle, { marginBottom: 15 }]}>
            Test-Ergebnisse:
          </Text>
          
          {testResults.map((result, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                marginBottom: 10,
                padding: 10,
                backgroundColor: result.success ? colors.success + '10' : colors.error + '10',
                borderRadius: 8,
                borderLeftWidth: 3,
                borderLeftColor: result.success ? colors.success : colors.error,
              }}
            >
              <Text style={{ fontSize: 16, marginRight: 10 }}>
                {getResultIcon(result.success)}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={[commonStyles.text, { fontWeight: 'bold', marginBottom: 2 }]}>
                  {result.step}
                </Text>
                <Text style={[commonStyles.caption, { color: getResultColor(result.success) }]}>
                  {result.message}
                </Text>
                <Text style={[commonStyles.caption, { color: colors.textSecondary, fontSize: 10 }]}>
                  {result.timestamp}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
