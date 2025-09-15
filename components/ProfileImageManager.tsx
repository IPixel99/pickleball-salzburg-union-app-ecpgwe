
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../hooks/useAuth';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import { saveImageLocally } from '../utils/localImageStorage';
import Icon from './Icon';

interface ProfileImageManagerProps {
  currentImageUrl?: string | null;
  onImageUpdate?: (imageUrl: string | null) => void;
}

export default function ProfileImageManager({ currentImageUrl, onImageUpdate }: ProfileImageManagerProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const pickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Berechtigung erforderlich',
          'Bitte erlaube den Zugriff auf deine Fotos, um ein Profilbild auszuwählen.'
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
        await handleUpload(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Fehler', 'Beim Auswählen des Bildes ist ein Fehler aufgetreten.');
    }
  };

  const takePhoto = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Berechtigung erforderlich',
          'Bitte erlaube den Zugriff auf die Kamera, um ein Foto zu machen.'
        );
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
        await handleUpload(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Fehler', 'Beim Aufnehmen des Fotos ist ein Fehler aufgetreten.');
    }
  };

  const handleUpload = async (imageUri: string) => {
    if (!user) {
      Alert.alert('Fehler', 'Benutzer nicht angemeldet');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Saving image locally:', imageUri);
      
      const result = await saveImageLocally(imageUri, user.id);
      
      if (!result.success) {
        throw new Error(result.error || 'Lokale Speicherung fehlgeschlagen');
      }

      console.log('Image saved locally successfully:', result.url);
      onImageUpdate?.(result.url!);
      setSelectedImage(null);

      Alert.alert(
        'Erfolg!',
        'Dein Profilbild wurde erfolgreich lokal gespeichert.',
        [{ text: 'OK', style: 'default' }]
      );

    } catch (error) {
      console.error('Upload error:', error);
      
      let errorMessage = 'Beim Speichern ist ein Fehler aufgetreten.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      Alert.alert('Speicher-Fehler', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = () => {
    Alert.alert(
      'Profilbild entfernen',
      'Möchtest du dein Profilbild wirklich entfernen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Entfernen',
          style: 'destructive',
          onPress: () => {
            onImageUpdate?.(null);
            setSelectedImage(null);
          }
        }
      ]
    );
  };

  const showImageOptions = () => {
    Alert.alert(
      'Profilbild auswählen',
      'Wie möchtest du dein Profilbild hinzufügen?',
      [
        { text: 'Foto aufnehmen', onPress: takePhoto },
        { text: 'Aus Galerie wählen', onPress: pickImage },
        { text: 'Abbrechen', style: 'cancel' }
      ]
    );
  };

  return (
    <ScrollView style={[commonStyles.card, { marginBottom: 20 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <Icon name="person-circle" size={24} color={colors.primary} />
        <Text style={[commonStyles.text, { fontWeight: '600', marginLeft: 12 }]}>
          Profilbild verwalten
        </Text>
      </View>

      {/* Current Image Display */}
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        {currentImageUrl ? (
          <View style={{ alignItems: 'center' }}>
            <Image
              source={{ uri: currentImageUrl }}
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                marginBottom: 12,
                borderWidth: 3,
                borderColor: colors.primary + '20'
              }}
            />
            <TouchableOpacity
              style={[buttonStyles.outline, { paddingHorizontal: 16, paddingVertical: 8 }]}
              onPress={removeImage}
            >
              <Text style={[commonStyles.buttonText, { color: colors.error, fontSize: 14 }]}>
                Bild entfernen
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: colors.background,
            borderWidth: 2,
            borderColor: colors.border,
            borderStyle: 'dashed',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12
          }}>
            <Icon name="person" size={40} color={colors.textSecondary} />
          </View>
        )}
      </View>

      {/* Selected Image Preview */}
      {selectedImage && (
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <Text style={[commonStyles.text, { marginBottom: 12, fontWeight: '500' }]}>
            Ausgewähltes Bild:
          </Text>
          <Image
            source={{ uri: selectedImage }}
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              marginBottom: 12,
              borderWidth: 2,
              borderColor: colors.primary
            }}
          />
        </View>
      )}

      {/* Image Selection Button */}
      <View style={{ marginBottom: 20 }}>
        <TouchableOpacity
          style={[buttonStyles.primary, { marginBottom: 12 }]}
          onPress={showImageOptions}
          disabled={isLoading}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Icon name="camera" size={18} color={colors.white} />
                <Text style={[commonStyles.buttonTextWhite, { marginLeft: 8 }]}>
                  {currentImageUrl ? 'Bild ändern' : 'Bild hinzufügen'}
                </Text>
              </>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Info Section */}
      <View style={{
        marginTop: 20,
        padding: 16,
        backgroundColor: colors.success + '10',
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: colors.success
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Icon name="phone-portrait" size={20} color={colors.success} />
          <Text style={[commonStyles.text, { fontWeight: '600', marginLeft: 8, color: colors.success }]}>
            Lokale Speicherung aktiv
          </Text>
        </View>
        <Text style={[commonStyles.textLight, { fontSize: 12, lineHeight: 18 }]}>
          Deine Profilbilder werden sicher auf deinem Gerät gespeichert. 
          Dies gewährleistet Datenschutz und schnelle Ladezeiten.
        </Text>
      </View>
    </ScrollView>
  );
}
