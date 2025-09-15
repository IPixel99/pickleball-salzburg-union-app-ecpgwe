
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../hooks/useAuth';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import Icon from './Icon';

interface ProfileImageManagerProps {
  currentImageUrl?: string | null;
  onImageUpdate?: (imageUrl: string | null) => void;
}

interface StorageOption {
  id: string;
  name: string;
  description: string;
  available: boolean;
  icon: string;
}

export default function ProfileImageManager({ currentImageUrl, onImageUpdate }: ProfileImageManagerProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [storageOptions] = useState<StorageOption[]>([
    {
      id: 'supabase',
      name: 'Supabase Storage',
      description: 'Empfohlene Lösung - integriert mit der App',
      available: true,
      icon: 'cloud-upload'
    },
    {
      id: 'cloudinary',
      name: 'Cloudinary',
      description: 'Cloud-basierte Bildverwaltung mit automatischer Optimierung',
      available: false,
      icon: 'image'
    },
    {
      id: 'aws-s3',
      name: 'Amazon S3',
      description: 'Skalierbare Cloud-Speicherlösung',
      available: false,
      icon: 'server'
    },
    {
      id: 'local',
      name: 'Lokale Speicherung',
      description: 'Temporäre Lösung - Bilder gehen bei App-Update verloren',
      available: true,
      icon: 'phone-portrait'
    }
  ]);

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
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Fehler', 'Beim Aufnehmen des Fotos ist ein Fehler aufgetreten.');
    }
  };

  const uploadWithSupabase = async (imageUri: string) => {
    if (!user) {
      throw new Error('Benutzer nicht angemeldet');
    }

    console.log('Uploading to Supabase Storage...');
    
    // Import the upload function dynamically to avoid circular dependencies
    const { uploadProfileImage } = await import('../utils/imageUtils');
    
    const result = await uploadProfileImage(imageUri, user.id);
    
    if (!result.success) {
      throw new Error(result.error || 'Upload fehlgeschlagen');
    }
    
    return result.url!;
  };

  const uploadWithCloudinary = async (imageUri: string) => {
    // Placeholder for Cloudinary implementation
    throw new Error('Cloudinary-Integration noch nicht implementiert');
  };

  const uploadWithAWS = async (imageUri: string) => {
    // Placeholder for AWS S3 implementation
    throw new Error('AWS S3-Integration noch nicht implementiert');
  };

  const saveLocally = async (imageUri: string) => {
    // For local storage, we just return the URI
    // In a real app, you might want to copy the file to a permanent location
    console.log('Saving image locally:', imageUri);
    return imageUri;
  };

  const handleUpload = async (storageType: string) => {
    if (!selectedImage) {
      Alert.alert('Fehler', 'Bitte wähle zuerst ein Bild aus.');
      return;
    }

    setIsLoading(true);

    try {
      let uploadedUrl: string;

      switch (storageType) {
        case 'supabase':
          uploadedUrl = await uploadWithSupabase(selectedImage);
          break;
        case 'cloudinary':
          uploadedUrl = await uploadWithCloudinary(selectedImage);
          break;
        case 'aws-s3':
          uploadedUrl = await uploadWithAWS(selectedImage);
          break;
        case 'local':
          uploadedUrl = await saveLocally(selectedImage);
          break;
        default:
          throw new Error('Unbekannter Speichertyp');
      }

      console.log('Image uploaded successfully:', uploadedUrl);
      onImageUpdate?.(uploadedUrl);
      setSelectedImage(null);

      Alert.alert(
        'Erfolg!',
        'Dein Profilbild wurde erfolgreich gespeichert.',
        [{ text: 'OK', style: 'default' }]
      );

    } catch (error) {
      console.error('Upload error:', error);
      
      let errorMessage = 'Beim Hochladen ist ein Fehler aufgetreten.';
      
      if (error instanceof Error) {
        if (error.message.includes('Bucket not found')) {
          errorMessage = 'Supabase Storage ist nicht eingerichtet. Bitte verwende eine alternative Speicheroption oder richte Supabase Storage ein.';
        } else if (error.message.includes('Policy') || error.message.includes('permission')) {
          errorMessage = 'Keine Berechtigung zum Hochladen. Bitte überprüfe die Supabase-Einstellungen.';
        } else {
          errorMessage = error.message;
        }
      }

      Alert.alert('Upload-Fehler', errorMessage);
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

      {/* Image Selection Buttons */}
      <View style={{ marginBottom: 20 }}>
        <TouchableOpacity
          style={[buttonStyles.primary, { marginBottom: 12 }]}
          onPress={showImageOptions}
          disabled={isLoading}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="camera" size={18} color={colors.white} />
            <Text style={[commonStyles.buttonTextWhite, { marginLeft: 8 }]}>
              {selectedImage ? 'Anderes Bild wählen' : 'Bild auswählen'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Storage Options */}
      {selectedImage && (
        <View>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 12 }]}>
            Speicheroptionen:
          </Text>
          
          {storageOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 16,
                  marginBottom: 8,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: option.available ? colors.border : colors.textSecondary + '40',
                  backgroundColor: option.available ? colors.white : colors.background
                },
                !option.available && { opacity: 0.6 }
              ]}
              onPress={() => option.available && handleUpload(option.id)}
              disabled={!option.available || isLoading}
            >
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: option.available ? colors.primary + '20' : colors.textSecondary + '20',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12
              }}>
                <Icon 
                  name={option.icon} 
                  size={20} 
                  color={option.available ? colors.primary : colors.textSecondary} 
                />
              </View>
              
              <View style={{ flex: 1 }}>
                <Text style={[
                  commonStyles.text, 
                  { fontWeight: '500', marginBottom: 2 },
                  !option.available && { color: colors.textSecondary }
                ]}>
                  {option.name}
                </Text>
                <Text style={[
                  commonStyles.textLight, 
                  { fontSize: 12, lineHeight: 16 },
                  !option.available && { color: colors.textSecondary }
                ]}>
                  {option.description}
                </Text>
              </View>
              
              {option.available && (
                <View style={{ marginLeft: 8 }}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Icon name="chevron-forward" size={16} color={colors.textSecondary} />
                  )}
                </View>
              )}
              
              {!option.available && (
                <View style={{
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  backgroundColor: colors.warning + '20',
                  borderRadius: 4,
                  marginLeft: 8
                }}>
                  <Text style={[commonStyles.textLight, { fontSize: 10, color: colors.warning }]}>
                    Bald verfügbar
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Help Section */}
      <View style={{
        marginTop: 20,
        padding: 16,
        backgroundColor: colors.background,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary
      }}>
        <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
          💡 Speicheroptionen erklärt:
        </Text>
        <Text style={[commonStyles.textLight, { fontSize: 12, lineHeight: 18, marginBottom: 8 }]}>
          • <Text style={{ fontWeight: '500' }}>Supabase Storage:</Text> Beste Integration, aber erfordert Setup
        </Text>
        <Text style={[commonStyles.textLight, { fontSize: 12, lineHeight: 18, marginBottom: 8 }]}>
          • <Text style={{ fontWeight: '500' }}>Cloudinary/AWS:</Text> Professionelle Lösungen (in Entwicklung)
        </Text>
        <Text style={[commonStyles.textLight, { fontSize: 12, lineHeight: 18 }]}>
          • <Text style={{ fontWeight: '500' }}>Lokal:</Text> Temporäre Lösung, Bilder gehen bei Updates verloren
        </Text>
      </View>
    </ScrollView>
  );
}
