
import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../contexts/ThemeContext';
import Icon from '../../components/Icon';
import ProfileImageManager from '../../components/ProfileImageManager';
import { getLocalImage, saveImageLocally } from '../../utils/localImageStorage';

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
  const { user } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: ''
  });

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    try {
      console.log('Fetching profile for user:', user.id);
      
      // Zuerst versuchen, das lokale Bild zu laden
      const localImage = await getLocalImage(user.id);
      console.log('Local image found:', localImage);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // Wenn kein Profil existiert, erstelle ein leeres
        if (error.code === 'PGRST116') {
          console.log('No profile found, will create one on save');
          setProfile({
            id: user.id,
            email: user.email,
            first_name: null,
            last_name: null,
            avatar_url: localImage, // Verwende das lokale Bild
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          setFormData({
            first_name: '',
            last_name: '',
            email: user.email || ''
          });
        } else {
          Alert.alert('Fehler', 'Profil konnte nicht geladen werden.');
        }
      } else {
        console.log('Profile loaded:', data);
        setProfile({
          ...data,
          avatar_url: localImage || data.avatar_url // Bevorzuge lokales Bild
        });
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || user.email || ''
        });
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      Alert.alert('Fehler', 'Beim Laden des Profils ist ein Fehler aufgetreten.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  const handleImageUpdate = async (imageUrl: string | null) => {
    if (!user) return;

    console.log('Updating profile image:', imageUrl);

    // Aktualisiere das lokale Profil sofort
    setProfile(prev => prev ? { ...prev, avatar_url: imageUrl } : null);

    // Wenn es ein Bild gibt, speichere es lokal
    if (imageUrl) {
      const result = await saveImageLocally(imageUrl, user.id);
      if (!result.success) {
        console.error('Failed to save image locally:', result.error);
        Alert.alert('Warnung', 'Das Bild konnte nicht lokal gespeichert werden.');
      }
    }

    // Versuche auch die Datenbank zu aktualisieren (optional)
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: null, // Speichere keine URLs in der Datenbank, nur lokal
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.warn('Could not update avatar in database:', error.message);
        // Nicht als Fehler behandeln, da lokale Speicherung funktioniert
      } else {
        console.log('Profile updated in database (avatar cleared)');
      }
    } catch (error) {
      console.warn('Database update failed, but local storage succeeded:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);

    try {
      console.log('Saving profile:', formData);

      const profileData = {
        id: user.id,
        email: formData.email,
        first_name: formData.first_name || null,
        last_name: formData.last_name || null,
        avatar_url: null, // Keine Avatar-URLs in der Datenbank speichern
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData);

      if (error) {
        console.error('Error saving profile:', error);
        Alert.alert('Fehler', `Beim Speichern ist ein Fehler aufgetreten: ${error.message}`);
        return;
      }

      console.log('Profile saved successfully');
      Alert.alert(
        'Gespeichert!',
        'Dein Profil wurde erfolgreich aktualisiert.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );

    } catch (error) {
      console.error('Error in handleSave:', error);
      Alert.alert('Fehler', 'Beim Speichern ist ein unerwarteter Fehler aufgetreten.');
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

  const getInitials = () => {
    const firstName = formData.first_name || '';
    const lastName = formData.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <SafeAreaView style={{ 
        flex: 1, 
        backgroundColor: colors.background,
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ 
          marginTop: 16,
          fontSize: 16,
          color: colors.text,
        }}>
          Lade Profil...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.surface,
      }}>
        <TouchableOpacity
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.backgroundSecondary,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={handleBack}
        >
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={{
          fontSize: 18,
          fontWeight: '600',
          color: colors.text,
        }}>
          Profil bearbeiten
        </Text>
        
        <TouchableOpacity
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.backgroundSecondary,
            justifyContent: 'center',
            alignItems: 'center',
            opacity: saving ? 0.6 : 1,
          }}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Icon name="checkmark" size={24} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Image Manager */}
        <ProfileImageManager
          currentImageUrl={profile?.avatar_url}
          onImageUpdate={handleImageUpdate}
        />

        {/* Form Fields */}
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 20,
          marginTop: 20,
          borderWidth: 1,
          borderColor: colors.border,
        }}>
          <Text style={{ 
            fontSize: 16,
            fontWeight: '600', 
            marginBottom: 16,
            color: colors.text,
          }}>
            Persönliche Informationen
          </Text>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ 
              fontSize: 14,
              fontWeight: '500',
              marginBottom: 8,
              color: colors.textSecondary,
            }}>
              Vorname
            </Text>
            <TextInput
              style={{
                backgroundColor: colors.backgroundSecondary,
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                color: colors.text,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              value={formData.first_name}
              onChangeText={(value) => updateFormData('first_name', value)}
              placeholder="Dein Vorname"
              placeholderTextColor={colors.textLight}
            />
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ 
              fontSize: 14,
              fontWeight: '500',
              marginBottom: 8,
              color: colors.textSecondary,
            }}>
              Nachname
            </Text>
            <TextInput
              style={{
                backgroundColor: colors.backgroundSecondary,
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                color: colors.text,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              value={formData.last_name}
              onChangeText={(value) => updateFormData('last_name', value)}
              placeholder="Dein Nachname"
              placeholderTextColor={colors.textLight}
            />
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ 
              fontSize: 14,
              fontWeight: '500',
              marginBottom: 8,
              color: colors.textSecondary,
            }}>
              E-Mail
            </Text>
            <TextInput
              style={{
                backgroundColor: colors.backgroundSecondary,
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                color: colors.textLight,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              value={formData.email}
              editable={false}
              placeholder="E-Mail-Adresse"
              placeholderTextColor={colors.textLight}
            />
            <Text style={{ 
              marginTop: 4, 
              fontSize: 12,
              color: colors.textLight,
            }}>
              Die E-Mail-Adresse kann nicht geändert werden
            </Text>
          </View>
        </View>

        {/* Info Card */}
        <View style={{
          backgroundColor: colors.success + '15',
          borderRadius: 16,
          padding: 20,
          marginTop: 20,
          borderWidth: 1,
          borderColor: colors.success + '30',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Icon name="shield-checkmark" size={20} color={colors.success} />
            <Text style={{ 
              fontWeight: '600', 
              marginLeft: 8, 
              color: colors.success,
              fontSize: 16,
            }}>
              Datenschutz & Lokale Speicherung
            </Text>
          </View>
          <Text style={{ 
            lineHeight: 20,
            fontSize: 14,
            color: colors.textSecondary,
          }}>
            Deine Profilbilder werden ausschließlich lokal auf deinem Gerät gespeichert. 
            Dies gewährleistet maximalen Datenschutz und schnelle Ladezeiten. 
            Deine Bilder verlassen niemals dein Gerät.
          </Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={{
            backgroundColor: colors.primary,
            borderRadius: 12,
            padding: 16,
            marginTop: 30,
            marginBottom: 20,
            opacity: saving ? 0.6 : 1,
          }}
          onPress={handleSave}
          disabled={saving}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            {saving ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Icon name="checkmark-circle" size={18} color={colors.white} />
                <Text style={{ 
                  color: colors.white,
                  fontSize: 16,
                  fontWeight: '600',
                  marginLeft: 8,
                }}>
                  Änderungen speichern
                </Text>
              </>
            )}
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
