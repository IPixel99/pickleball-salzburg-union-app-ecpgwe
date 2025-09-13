
import React, { useState } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import Icon from '../../components/Icon';
import StorageSetup from '../../components/StorageSetup';
import ImageUploadTest from '../../components/ImageUploadTest';
import SupabaseConnectionTest from '../../components/SupabaseConnectionTest';
import StorageFunctions from '../../components/StorageFunctions';
import StorageConnectionTest from '../../components/StorageConnectionTest';

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
              router.replace('/');
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
            <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
              Angemeldet als
            </Text>
            <Text style={[commonStyles.textLight]}>
              {user.email}
            </Text>
          </View>
        )}

        {/* Storage Connection Test */}
        <StorageConnectionTest />

        {/* Advanced Settings Toggle */}
        <TouchableOpacity
          style={[buttonStyles.secondary, { marginBottom: 20 }]}
          onPress={toggleAdvanced}
        >
          <Icon 
            name={showAdvanced ? "chevron-up" : "chevron-down"} 
            size={16} 
            color={colors.primary} 
          />
          <Text style={[commonStyles.buttonText, { marginLeft: 8 }]}>
            {showAdvanced ? 'Erweiterte Einstellungen ausblenden' : 'Erweiterte Einstellungen anzeigen'}
          </Text>
        </TouchableOpacity>

        {/* Advanced Settings */}
        {showAdvanced && (
          <View>
            {/* Supabase Connection Test */}
            <SupabaseConnectionTest />

            {/* Storage Setup */}
            <StorageSetup />

            {/* Image Upload Test */}
            <ImageUploadTest />

            {/* Storage Functions */}
            <StorageFunctions />
          </View>
        )}

        {/* Logout Button */}
        {user && (
          <TouchableOpacity
            style={[
              buttonStyles.primary,
              { 
                backgroundColor: colors.error,
                marginTop: 20,
                marginBottom: 40
              }
            ]}
            onPress={handleLogout}
          >
            <Icon name="log-out" size={16} color={colors.white} />
            <Text style={[commonStyles.buttonTextWhite, { marginLeft: 8 }]}>
              Abmelden
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
