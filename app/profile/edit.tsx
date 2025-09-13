
import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert, TextInput, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';
import Icon from '../../components/Icon';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import { useAuth } from '../../hooks/useAuth';
import { uploadProfileImage, deleteProfileImage, validateImageUri } from '../../utils/imageUtils';

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
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      console.log('Fetching profile for editing');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        Alert.alert('Fehler', 'Profil konnte nicht geladen werden.');
        router.back();
        return;
      }

      console.log('Profile fetched for editing:', data);
      setProfile(data);
      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
      });
      setAvatarUrl(data.avatar_url);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      Alert.alert('Fehler', 'Ein unerwarteter Fehler ist aufgetreten.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      console.log('Requesting image picker permissions');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Berechtigung erforderlich', 'Wir benötigen Zugriff auf deine Fotos, um ein Profilbild auszuwählen.');
        return;
      }

      console.log('Opening image picker');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        console.log('Image selected:', asset.uri);
        
        // Validate the image URI
        if (!validateImageUri(asset.uri)) {
          Alert.alert('Fehler', 'Das ausgewählte Bild ist ungültig.');
          return;
        }
        
        await handleImageUpload(asset.uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Fehler', 'Beim Auswählen des Bildes ist ein Fehler aufgetreten.');
    }
  };

  const takePhoto = async () => {
    try {
      console.log('Requesting camera permissions');
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Berechtigung erforderlich', 'Wir benötigen Zugriff auf deine Kamera, um ein Foto zu machen.');
        return;
      }

      console.log('Opening camera');
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        console.log('Photo taken:', asset.uri);
        
        // Validate the image URI
        if (!validateImageUri(asset.uri)) {
          Alert.alert('Fehler', 'Das aufgenommene Foto ist ungültig.');
          return;
        }
        
        await handleImageUpload(asset.uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Fehler', 'Beim Aufnehmen des Fotos ist ein Fehler aufgetreten.');
    }
  };

  const handleImageUpload = async (uri: string) => {
    if (!user) {
      Alert.alert('Fehler', 'Benutzer nicht angemeldet.');
      return;
    }

    if (!uri) {
      Alert.alert('Fehler', 'Kein Bild ausgewählt.');
      return;
    }

    setUploading(true);
    try {
      console.log('Starting image upload process');
      
      // Delete old avatar if exists
      if (avatarUrl) {
        console.log('Deleting old avatar');
        const deleteSuccess = await deleteProfileImage(avatarUrl, user.id);
        if (!deleteSuccess) {
          console.warn('Failed to delete old avatar, continuing with upload');
        }
      }

      // Upload new image
      console.log('Uploading new image');
      const result = await uploadProfileImage(uri, user.id);
      
      if (result.success && result.url) {
        console.log('Image upload successful:', result.url);
        setAvatarUrl(result.url);
        Alert.alert('Erfolg', 'Profilbild wurde erfolgreich hochgeladen!');
      } else {
        console.error('Image upload failed:', result.error);
        Alert.alert(
          'Upload-Fehler', 
          result.error || 'Bild konnte nicht hochgeladen werden.',
          [
            { text: 'OK', style: 'default' },
            { 
              text: 'Erneut versuchen', 
              onPress: () => handleImageUpload(uri),
              style: 'default'
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error in handleImageUpload:', error);
      Alert.alert(
        'Fehler', 
        'Beim Hochladen des Bildes ist ein unerwarteter Fehler aufgetreten.',
        [
          { text: 'OK', style: 'default' },
          { 
            text: 'Erneut versuchen', 
            onPress: () => handleImageUpload(uri),
            style: 'default'
          }
        ]
      );
    } finally {
      setUploading(false);
    }
  };

  const removeProfilePicture = async () => {
    if (!user || !avatarUrl) return;

    Alert.alert(
      'Profilbild entfernen',
      'Möchtest du dein Profilbild wirklich entfernen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Entfernen',
          style: 'destructive',
          onPress: async () => {
            setUploading(true);
            try {
              const success = await deleteProfileImage(avatarUrl, user.id);
              if (success) {
                setAvatarUrl(null);
                Alert.alert('Erfolg', 'Profilbild wurde entfernt.');
              } else {
                Alert.alert('Fehler', 'Profilbild konnte nicht entfernt werden.');
              }
            } catch (error) {
              console.error('Error removing profile picture:', error);
              Alert.alert('Fehler', 'Beim Entfernen des Profilbildes ist ein Fehler aufgetreten.');
            } finally {
              setUploading(false);
            }
          }
        }
      ]
    );
  };

  const showImageOptions = () => {
    const options = [
      { text: 'Abbrechen', style: 'cancel' as const },
      { text: 'Foto aufnehmen', onPress: takePhoto },
      { text: 'Aus Galerie wählen', onPress: pickImage },
    ];

    if (avatarUrl) {
      options.push({ text: 'Profilbild entfernen', onPress: removeProfilePicture });
    }

    Alert.alert('Profilbild ändern', 'Wie möchtest du dein Profilbild ändern?', options);
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    setSaving(true);
    try {
      console.log('Saving profile changes:', formData, 'Avatar URL:', avatarUrl);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name.trim() || null,
          last_name: formData.last_name.trim() || null,
          email: formData.email.trim() || null,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        Alert.alert('Fehler', 'Profil konnte nicht gespeichert werden.');
        return;
      }

      console.log('Profile updated successfully');
      Alert.alert('Erfolg', 'Profil wurde erfolgreich aktualisiert.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error in handleSave:', error);
      Alert.alert('Fehler', 'Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getInitials = (): string => {
    if (formData.first_name && formData.last_name) {
      return `${formData.first_name[0]}${formData.last_name[0]}`.toUpperCase();
    }
    if (formData.first_name) {
      return formData.first_name[0].toUpperCase();
    }
    if (formData.email) {
      return formData.email[0].toUpperCase();
    }
    return 'U';
  };

  if (loading) {
    return (
      <SafeAreaView style={[commonStyles.container, commonStyles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[commonStyles.text, { marginTop: 16 }]}>
          Profil wird geladen...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Header with Back Button */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 30 }}>
          <TouchableOpacity
            onPress={handleBack}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.white,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
              ...commonStyles.shadow,
            }}
          >
            <Icon name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={[commonStyles.title, { color: colors.primary, flex: 1 }]}>
            Profil bearbeiten
          </Text>
        </View>

        {/* Profile Picture Section */}
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <TouchableOpacity
            onPress={showImageOptions}
            disabled={uploading}
            style={{
              position: 'relative',
              marginBottom: 16,
            }}
          >
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  backgroundColor: colors.background,
                }}
                onError={(error) => {
                  console.error('Error loading avatar image:', error);
                  setAvatarUrl(null);
                }}
              />
            ) : (
              <View
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  backgroundColor: colors.primary,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 48, fontWeight: 'bold', color: colors.white }}>
                  {getInitials()}
                </Text>
              </View>
            )}
            
            {/* Camera Icon Overlay */}
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: colors.primary,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 3,
                borderColor: colors.white,
              }}
            >
              {uploading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Icon name="camera" size={18} color={colors.white} />
              )}
            </View>
          </TouchableOpacity>
          
          <Text style={[commonStyles.textLight, { textAlign: 'center' }]}>
            Tippe auf das Bild, um es zu ändern
          </Text>
          
          {uploading && (
            <Text style={[commonStyles.textLight, { textAlign: 'center', marginTop: 8, color: colors.primary }]}>
              Bild wird hochgeladen...
            </Text>
          )}
        </View>

        {/* Form */}
        <View style={[commonStyles.card, { marginBottom: 30 }]}>
          {/* First Name */}
          <View style={{ marginBottom: 20 }}>
            <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>
              Vorname
            </Text>
            <TextInput
              style={[
                commonStyles.input,
                {
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }
              ]}
              value={formData.first_name}
              onChangeText={(text) => updateFormData('first_name', text)}
              placeholder="Dein Vorname"
              placeholderTextColor={colors.textLight}
            />
          </View>

          {/* Last Name */}
          <View style={{ marginBottom: 20 }}>
            <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>
              Nachname
            </Text>
            <TextInput
              style={[
                commonStyles.input,
                {
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }
              ]}
              value={formData.last_name}
              onChangeText={(text) => updateFormData('last_name', text)}
              placeholder="Dein Nachname"
              placeholderTextColor={colors.textLight}
            />
          </View>

          {/* Email */}
          <View style={{ marginBottom: 20 }}>
            <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>
              E-Mail
            </Text>
            <TextInput
              style={[
                commonStyles.input,
                {
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }
              ]}
              value={formData.email}
              onChangeText={(text) => updateFormData('email', text)}
              placeholder="deine@email.com"
              placeholderTextColor={colors.textLight}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[
              buttonStyles.primary,
              { width: '100%' },
              (saving || uploading) && { opacity: 0.7 }
            ]}
            onPress={handleSave}
            disabled={saving || uploading}
          >
            {saving ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={commonStyles.buttonTextWhite}>
                Änderungen speichern
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
