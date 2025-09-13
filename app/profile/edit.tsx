
import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import Icon from '../../components/Icon';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import { useAuth } from '../../hooks/useAuth';

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
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });

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
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      Alert.alert('Fehler', 'Ein unerwarteter Fehler ist aufgetreten.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    setSaving(true);
    try {
      console.log('Saving profile changes:', formData);
      
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
              saving && { opacity: 0.7 }
            ]}
            onPress={handleSave}
            disabled={saving}
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
