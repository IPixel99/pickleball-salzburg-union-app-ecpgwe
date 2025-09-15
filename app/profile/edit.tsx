
import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: ''
  });

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
        // Wenn kein Profil existiert, erstelle ein leeres
        if (error.code === 'PGRST116') {
          console.log('No profile found, will create one on save');
          setProfile({
            id: user.id,
            email: user.email,
            first_name: null,
            last_name: null,
            avatar_url: null,
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
        setProfile(data);
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || user.email || ''
        });

        // Versuche auch ein lokal gespeichertes Bild zu laden, falls Supabase nicht funktioniert
        if (!data.avatar_url) {
          const localImage = await getLocalImage(user.id);
          if (localImage) {
            console.log('Found local image:', localImage);
            setProfile(prev => prev ? { ...prev, avatar_url: localImage } : null);
          }
        }
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      Alert.alert('Fehler', 'Beim Laden des Profils ist ein Fehler aufgetreten.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpdate = async (imageUrl: string | null) => {
    if (!user) return;

    console.log('Updating profile image:', imageUrl);

    // Aktualisiere das lokale Profil sofort
    setProfile(prev => prev ? { ...prev, avatar_url: imageUrl } : null);

    // Wenn es ein lokales Bild ist, speichere es auch lokal
    if (imageUrl && (imageUrl.startsWith('file://') || imageUrl.startsWith('content://'))) {
      await saveImageLocally(imageUrl, user.id);
    }

    // Versuche auch die Datenbank zu aktualisieren (falls möglich)
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: imageUrl,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.warn('Could not update avatar in database:', error.message);
        // Nicht als Fehler behandeln, da lokale Speicherung funktioniert
      } else {
        console.log('Avatar updated in database successfully');
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
        avatar_url: profile?.avatar_url || null,
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
      <SafeAreaView style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[commonStyles.text, { marginTop: 16 }]}>
          Lade Profil...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      {/* Header */}
      <View style={[commonStyles.header, { paddingHorizontal: 20 }]}>
        <TouchableOpacity
          style={commonStyles.headerButton}
          onPress={handleBack}
        >
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={commonStyles.headerTitle}>
          Profil bearbeiten
        </Text>
        
        <TouchableOpacity
          style={[
            commonStyles.headerButton,
            saving && { opacity: 0.6 }
          ]}
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
        <View style={commonStyles.card}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 16 }]}>
            Persönliche Informationen
          </Text>

          <View style={{ marginBottom: 16 }}>
            <Text style={[commonStyles.label, { marginBottom: 8 }]}>
              Vorname
            </Text>
            <TextInput
              style={commonStyles.input}
              value={formData.first_name}
              onChangeText={(value) => updateFormData('first_name', value)}
              placeholder="Dein Vorname"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={[commonStyles.label, { marginBottom: 8 }]}>
              Nachname
            </Text>
            <TextInput
              style={commonStyles.input}
              value={formData.last_name}
              onChangeText={(value) => updateFormData('last_name', value)}
              placeholder="Dein Nachname"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={[commonStyles.label, { marginBottom: 8 }]}>
              E-Mail
            </Text>
            <TextInput
              style={[commonStyles.input, { backgroundColor: colors.background, color: colors.textSecondary }]}
              value={formData.email}
              editable={false}
              placeholder="E-Mail-Adresse"
              placeholderTextColor={colors.textSecondary}
            />
            <Text style={[commonStyles.caption, { marginTop: 4, color: colors.textSecondary }]}>
              Die E-Mail-Adresse kann nicht geändert werden
            </Text>
          </View>
        </View>

        {/* Info Card */}
        <View style={[commonStyles.card, { backgroundColor: colors.primary + '10', marginTop: 20 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Icon name="information-circle" size={20} color={colors.primary} />
            <Text style={[commonStyles.text, { fontWeight: '600', marginLeft: 8, color: colors.primary }]}>
              Hinweis zur Bildspeicherung
            </Text>
          </View>
          <Text style={[commonStyles.textLight, { lineHeight: 18 }]}>
            Falls Supabase Storage nicht funktioniert, werden Profilbilder temporär lokal gespeichert. 
            Diese gehen bei App-Updates verloren. Für eine dauerhafte Lösung sollte Supabase Storage 
            eingerichtet oder eine alternative Speicherlösung verwendet werden.
          </Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            buttonStyles.primary,
            { marginTop: 30, marginBottom: 20 },
            saving && { opacity: 0.6 }
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            {saving ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Icon name="checkmark-circle" size={18} color={colors.white} />
                <Text style={[commonStyles.buttonTextWhite, { marginLeft: 8 }]}>
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
