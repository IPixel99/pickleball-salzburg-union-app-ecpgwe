
import React, { useState } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from '../../components/Icon';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import { useAuth } from '../../hooks/useAuth';
import StorageSetup from '../../components/StorageSetup';
import StorageFunctions from '../../components/StorageFunctions';
import ImageUploadTest from '../../components/ImageUploadTest';
import SupabaseConnectionTest from '../../components/SupabaseConnectionTest';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleLogout = async () => {
    Alert.alert(
      'Abmelden',
      'Möchtest du dich wirklich abmelden?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Abmelden',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/auth/login');
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Fehler', 'Beim Abmelden ist ein Fehler aufgetreten.');
            }
          }
        }
      ]
    );
  };

  const toggleAdvanced = () => {
    setShowAdvanced(!showAdvanced);
  };

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
            Einstellungen
          </Text>
        </View>

        {/* User Info */}
        {user && (
          <View style={[commonStyles.card, { marginBottom: 20 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Icon name="person" size={24} color={colors.primary} />
              <Text style={[commonStyles.text, { fontWeight: '600', marginLeft: 12 }]}>
                Benutzer-Info
              </Text>
            </View>
            <Text style={[commonStyles.textLight, { marginBottom: 4 }]}>
              E-Mail: {user.email}
            </Text>
            <Text style={[commonStyles.textLight]}>
              ID: {user.id}
            </Text>
          </View>
        )}

        {/* Storage Setup */}
        <StorageSetup onComplete={() => {
          Alert.alert('Setup abgeschlossen', 'Der Avatar-Speicher ist jetzt einsatzbereit!');
        }} />

        {/* Advanced Settings Toggle */}
        <TouchableOpacity
          style={[commonStyles.card, { marginBottom: 20 }]}
          onPress={toggleAdvanced}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="settings" size={24} color={colors.primary} />
              <Text style={[commonStyles.text, { fontWeight: '600', marginLeft: 12 }]}>
                Erweiterte Einstellungen
              </Text>
            </View>
            <Icon 
              name={showAdvanced ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={colors.textLight} 
            />
          </View>
        </TouchableOpacity>

        {/* Advanced Settings Content */}
        {showAdvanced && (
          <View style={{ marginBottom: 20 }}>
            {/* Storage Functions */}
            <StorageFunctions />

            {/* Connection Test */}
            <SupabaseConnectionTest />

            {/* Image Upload Test */}
            <ImageUploadTest />

            {/* Debug Info */}
            <View style={[commonStyles.card, { marginBottom: 20 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Icon name="bug" size={24} color={colors.primary} />
                <Text style={[commonStyles.text, { fontWeight: '600', marginLeft: 12 }]}>
                  Debug-Informationen
                </Text>
              </View>
              <Text style={[commonStyles.textLight, { fontSize: 12, lineHeight: 16 }]}>
                Supabase URL: https://asugynuigbnrsynczdhe.supabase.co{'\n'}
                Project ID: asugynuigbnrsynczdhe{'\n'}
                Storage Bucket: avatars{'\n'}
                Platform: {require('react-native').Platform.OS}
              </Text>
            </View>
          </View>
        )}

        {/* Settings Options */}
        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 16 }]}>
            App-Einstellungen
          </Text>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
            onPress={() => router.push('/profile/help')}
          >
            <Icon name="help-circle" size={20} color={colors.textLight} />
            <Text style={[commonStyles.text, { marginLeft: 12, flex: 1 }]}>
              Hilfe & Support
            </Text>
            <Icon name="chevron-forward" size={16} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
            onPress={() => router.push('/profile/about')}
          >
            <Icon name="information-circle" size={20} color={colors.textLight} />
            <Text style={[commonStyles.text, { marginLeft: 12, flex: 1 }]}>
              Über die App
            </Text>
            <Icon name="chevron-forward" size={16} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 12,
            }}
            onPress={() => {
              Alert.alert(
                'App-Version',
                'Pickleball Salzburg Union\nVersion 1.0.0\n\nEntwickelt mit React Native & Supabase',
                [{ text: 'OK', style: 'default' }]
              );
            }}
          >
            <Icon name="code" size={20} color={colors.textLight} />
            <Text style={[commonStyles.text, { marginLeft: 12, flex: 1 }]}>
              App-Version
            </Text>
            <Text style={[commonStyles.textLight]}>1.0.0</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[
            buttonStyles.outline,
            { 
              borderColor: colors.error,
              marginBottom: 40
            }
          ]}
          onPress={handleLogout}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="log-out" size={18} color={colors.error} />
            <Text style={[commonStyles.buttonText, { color: colors.error, marginLeft: 8 }]}>
              Abmelden
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
