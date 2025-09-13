
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Icon from '../../components/Icon';
import { Text, View, ScrollView, TouchableOpacity, Alert, TextInput, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { uploadProfileImage, deleteProfileImage, validateImageUri, cleanupOldAvatars } from '../../utils/imageUtils';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';

interface Profile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export default function EditProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });

  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      console.log('Fetching profile for user:', user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating new profile...');
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([
              {
                id: user.id,
                email: user.email,
                first_name: '',
                last_name: '',
                avatar_url: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }
            ])
            .select()
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
            Alert.alert('Fehler', 'Profil konnte nicht erstellt werden');
            return;
          }

          setProfile(newProfile);
          setFormData({
            first_name: newProfile.first_name || '',
            last_name: newProfile.last_name || '',
            email: newProfile.email || user.email || '',
          });
        } else {
          Alert.alert('Fehler', 'Profil konnte nicht geladen werden');
        }
      } else {
        console.log('Profile loaded:', data);
        setProfile(data);
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || user.email || '',
        });
      }
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      Alert.alert('Fehler', 'Unerwarteter Fehler beim Laden des Profils');
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      console.log('Starting image picker...');
      
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Berechtigung erforderlich', 'Wir benötigen Zugriff auf deine Fotos, um ein Profilbild auszuwählen.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        console.log('Image selected:', imageUri);
        await handleImageUpload(imageUri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Fehler', 'Fehler beim Auswählen des Bildes');
    }
  };

  const takePhoto = async () => {
    try {
      console.log('Starting camera...');
      
      // Request permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Berechtigung erforderlich', 'Wir benötigen Zugriff auf deine Kamera, um ein Foto zu machen.');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        console.log('Photo taken:', imageUri);
        await handleImageUpload(imageUri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Fehler', 'Fehler beim Aufnehmen des Fotos');
    }
  };

  const handleImageUpload = async (uri: string) => {
    if (!user || !profile) {
      Alert.alert('Fehler', 'Benutzer oder Profil nicht gefunden');
      return;
    }

    console.log('Starting image upload process...');
    setIsUploadingImage(true);

    try {
      // Validate URI
      if (!validateImageUri(uri)) {
        Alert.alert('Fehler', 'Ungültige Bild-URI');
        return;
      }

      console.log('Uploading image to avatars bucket...');
      const result = await uploadProfileImage(uri, user.id);

      if (result.success && result.url) {
        console.log('Image uploaded successfully:', result.url);
        
        // Update local profile state
        setProfile(prev => prev ? { ...prev, avatar_url: result.url! } : null);
        
        // Clean up old avatars
        await cleanupOldAvatars(user.id);
        
        Alert.alert('Erfolg', 'Profilbild wurde erfolgreich aktualisiert!');
      } else {
        console.error('Image upload failed:', result.error);
        Alert.alert('Upload fehlgeschlagen', result.error || 'Unbekannter Fehler beim Hochladen');
      }
    } catch (error) {
      console.error('Error in handleImageUpload:', error);
      Alert.alert('Fehler', 'Unerwarteter Fehler beim Hochladen des Bildes');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const removeProfilePicture = async () => {
    if (!user || !profile?.avatar_url) {
      Alert.alert('Fehler', 'Kein Profilbild zum Entfernen vorhanden');
      return;
    }

    Alert.alert(
      'Profilbild entfernen',
      'Möchtest du dein Profilbild wirklich entfernen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Entfernen',
          style: 'destructive',
          onPress: async () => {
            setIsUploadingImage(true);
            try {
              console.log('Deleting profile image:', profile.avatar_url);
              const success = await deleteProfileImage(profile.avatar_url, user.id);
              
              if (success) {
                setProfile(prev => prev ? { ...prev, avatar_url: null } : null);
                Alert.alert('Erfolg', 'Profilbild wurde entfernt');
              } else {
                Alert.alert('Fehler', 'Profilbild konnte nicht entfernt werden');
              }
            } catch (error) {
              console.error('Error removing profile picture:', error);
              Alert.alert('Fehler', 'Unerwarteter Fehler beim Entfernen des Profilbildes');
            } finally {
              setIsUploadingImage(false);
            }
          }
        }
      ]
    );
  };

  const showImageOptions = () => {
    Alert.alert(
      'Profilbild',
      'Wie möchtest du dein Profilbild ändern?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        { text: 'Foto aufnehmen', onPress: takePhoto },
        { text: 'Aus Galerie wählen', onPress: pickImage },
        ...(profile?.avatar_url ? [{ text: 'Entfernen', style: 'destructive', onPress: removeProfilePicture }] : [])
      ]
    );
  };

  const handleSave = async () => {
    if (!user || !profile) {
      Alert.alert('Fehler', 'Benutzer oder Profil nicht gefunden');
      return;
    }

    setIsSaving(true);

    try {
      console.log('Saving profile changes...');
      
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name.trim() || null,
          last_name: formData.last_name.trim() || null,
          email: formData.email.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        Alert.alert('Fehler', 'Profil konnte nicht gespeichert werden');
        return;
      }

      console.log('Profile updated successfully');
      Alert.alert('Erfolg', 'Profil wurde erfolgreich gespeichert!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Unexpected error saving profile:', error);
      Alert.alert('Fehler', 'Unerwarteter Fehler beim Speichern');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getInitials = () => {
    const firstName = formData.first_name || profile?.first_name || '';
    const lastName = formData.last_name || profile?.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || user?.email?.charAt(0).toUpperCase() || '?';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[commonStyles.container, commonStyles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[commonStyles.text, { marginTop: 10 }]}>Lade Profil...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.header}>
        <TouchableOpacity onPress={handleBack} style={commonStyles.backButton}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={commonStyles.headerTitle}>Profil bearbeiten</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Picture Section */}
        <View style={[commonStyles.card, { alignItems: 'center', marginBottom: 20 }]}>
          <TouchableOpacity onPress={showImageOptions} disabled={isUploadingImage}>
            <View style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: colors.surface,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 15,
              position: 'relative',
            }}>
              {profile?.avatar_url ? (
                <Image
                  source={{ uri: profile.avatar_url }}
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                  }}
                />
              ) : (
                <Text style={{
                  fontSize: 36,
                  fontWeight: 'bold',
                  color: colors.primary,
                }}>
                  {getInitials()}
                </Text>
              )}
              
              {isUploadingImage && (
                <View style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  borderRadius: 60,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <ActivityIndicator color="white" size="large" />
                </View>
              )}
              
              <View style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: colors.primary,
                width: 36,
                height: 36,
                borderRadius: 18,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 3,
                borderColor: colors.background,
              }}>
                <Icon name="camera" size={18} color="white" />
              </View>
            </View>
          </TouchableOpacity>
          
          <Text style={[commonStyles.text, { textAlign: 'center', color: colors.textSecondary }]}>
            Tippe auf das Bild, um es zu ändern
          </Text>
        </View>

        {/* Form Fields */}
        <View style={commonStyles.card}>
          <Text style={[commonStyles.subtitle, { marginBottom: 20 }]}>
            Persönliche Informationen
          </Text>

          <View style={{ marginBottom: 20 }}>
            <Text style={[commonStyles.label, { marginBottom: 8 }]}>Vorname</Text>
            <TextInput
              style={commonStyles.input}
              value={formData.first_name}
              onChangeText={(text) => updateFormData('first_name', text)}
              placeholder="Dein Vorname"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text style={[commonStyles.label, { marginBottom: 8 }]}>Nachname</Text>
            <TextInput
              style={commonStyles.input}
              value={formData.last_name}
              onChangeText={(text) => updateFormData('last_name', text)}
              placeholder="Dein Nachname"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text style={[commonStyles.label, { marginBottom: 8 }]}>E-Mail</Text>
            <TextInput
              style={commonStyles.input}
              value={formData.email}
              onChangeText={(text) => updateFormData('email', text)}
              placeholder="deine@email.com"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[buttonStyles.primary, { margin: 20 }]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={buttonStyles.primaryText}>Änderungen speichern</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
