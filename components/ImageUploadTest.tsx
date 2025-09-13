
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import { uploadProfileImage, validateImageUri } from '../utils/imageUtils';
import { useAuth } from '../hooks/useAuth';
import Icon from './Icon';

export default function ImageUploadTest() {
  const { user } = useAuth();
  const [testing, setTesting] = useState(false);
  const [testImageUri, setTestImageUri] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const selectTestImage = async () => {
    try {
      console.log('Selecting test image...');
      
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
        setTestImageUri(asset.uri);
        setUploadedUrl(null);
      }
    } catch (error) {
      console.error('Error selecting test image:', error);
      Alert.alert('Fehler', 'Beim Auswählen des Testbildes ist ein Fehler aufgetreten.');
    }
  };

  const testImageUpload = async () => {
    if (!user) {
      Alert.alert('Fehler', 'Du musst angemeldet sein, um den Upload zu testen.');
      return;
    }

    if (!testImageUri) {
      Alert.alert('Fehler', 'Bitte wähle zuerst ein Testbild aus.');
      return;
    }

    setTesting(true);
    try {
      console.log('Testing image upload...');
      console.log('Test image URI:', testImageUri);
      console.log('User ID:', user.id);

      // Validate URI first
      if (!validateImageUri(testImageUri)) {
        Alert.alert('Fehler', 'Die ausgewählte Bild-URI ist ungültig.');
        return;
      }

      // Test the upload
      const result = await uploadProfileImage(testImageUri, user.id);
      
      if (result.success && result.url) {
        console.log('Test upload successful:', result.url);
        setUploadedUrl(result.url);
        Alert.alert(
          'Upload erfolgreich!',
          'Das Testbild wurde erfolgreich hochgeladen. Du kannst es unten sehen.',
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        console.error('Test upload failed:', result.error);
        Alert.alert(
          'Upload fehlgeschlagen',
          `Fehler beim Hochladen des Testbildes:\n\n${result.error}`,
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('Error in testImageUpload:', error);
      Alert.alert(
        'Unerwarteter Fehler',
        'Beim Testen des Bildupload ist ein unerwarteter Fehler aufgetreten.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setTesting(false);
    }
  };

  const clearTest = () => {
    setTestImageUri(null);
    setUploadedUrl(null);
  };

  const showImageInfo = () => {
    if (!testImageUri) return;

    Alert.alert(
      'Bild-Informationen',
      `URI: ${testImageUri}\n\nValidierung: ${validateImageUri(testImageUri) ? 'Gültig' : 'Ungültig'}`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  return (
    <View style={[commonStyles.card, { marginBottom: 20 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Icon name="image" size={24} color={colors.primary} />
        <Text style={[commonStyles.text, { fontWeight: '600', marginLeft: 12 }]}>
          Bildupload-Test
        </Text>
      </View>
      
      <Text style={[commonStyles.textLight, { marginBottom: 16, lineHeight: 20 }]}>
        Teste den Bildupload-Prozess mit einem echten Bild.
      </Text>

      {/* Test Image Preview */}
      {testImageUri && (
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>
            Ausgewähltes Testbild:
          </Text>
          <TouchableOpacity onPress={showImageInfo}>
            <Image
              source={{ uri: testImageUri }}
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: colors.background,
                marginBottom: 8,
              }}
              onError={(error) => {
                console.error('Error loading test image:', error);
                Alert.alert('Fehler', 'Das Testbild konnte nicht geladen werden.');
              }}
            />
          </TouchableOpacity>
          <Text style={[commonStyles.textLight, { fontSize: 12, textAlign: 'center' }]}>
            Tippe auf das Bild für Details
          </Text>
        </View>
      )}

      {/* Uploaded Image Preview */}
      {uploadedUrl && (
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600', color: colors.success }]}>
            Hochgeladenes Bild:
          </Text>
          <Image
            source={{ uri: uploadedUrl }}
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: colors.background,
              marginBottom: 8,
            }}
            onError={(error) => {
              console.error('Error loading uploaded image:', error);
              setUploadedUrl(null);
            }}
          />
          <Text style={[commonStyles.textLight, { fontSize: 12, textAlign: 'center' }]}>
            Upload erfolgreich!
          </Text>
        </View>
      )}
      
      <View style={{ gap: 12 }}>
        <TouchableOpacity
          style={[buttonStyles.outline]}
          onPress={selectTestImage}
          disabled={testing}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="image" size={16} color={colors.primary} />
            <Text style={[commonStyles.buttonText, { color: colors.primary, marginLeft: 8 }]}>
              Testbild auswählen
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            buttonStyles.primary,
            (!testImageUri || testing) && { opacity: 0.7 }
          ]}
          onPress={testImageUpload}
          disabled={!testImageUri || testing}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            {testing ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Icon name="cloud-upload" size={16} color={colors.white} />
                <Text style={[commonStyles.buttonTextWhite, { marginLeft: 8 }]}>
                  Upload testen
                </Text>
              </>
            )}
          </View>
        </TouchableOpacity>

        {(testImageUri || uploadedUrl) && (
          <TouchableOpacity
            style={[buttonStyles.outline, { borderColor: colors.error }]}
            onPress={clearTest}
            disabled={testing}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="trash" size={16} color={colors.error} />
              <Text style={[commonStyles.buttonText, { color: colors.error, marginLeft: 8 }]}>
                Test zurücksetzen
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {!user && (
        <View style={{ 
          marginTop: 16, 
          padding: 12, 
          backgroundColor: colors.warning + '20', 
          borderRadius: 8,
          borderLeftWidth: 4,
          borderLeftColor: colors.warning
        }}>
          <Text style={[commonStyles.textLight, { fontSize: 12, lineHeight: 16, color: colors.warning }]}>
            ⚠️ Du musst angemeldet sein, um den Bildupload zu testen.
          </Text>
        </View>
      )}
    </View>
  );
}
