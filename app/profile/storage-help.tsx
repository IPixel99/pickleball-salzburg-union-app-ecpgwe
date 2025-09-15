
import React, { useState } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import Icon from '../../components/Icon';
import AlternativeStorageOptions from '../../components/AlternativeStorageOptions';
import StorageSetup from '../../components/StorageSetup';
import AvatarUploadTest from '../../components/AvatarUploadTest';

export default function StorageHelpScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'options' | 'setup' | 'test'>('options');

  const handleBack = () => {
    router.back();
  };

  const tabs = [
    { id: 'options', label: 'Optionen', icon: 'list' },
    { id: 'setup', label: 'Setup', icon: 'settings' },
    { id: 'test', label: 'Test', icon: 'checkmark-circle' }
  ];

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
          Bildspeicher-Hilfe
        </Text>
        
        <View style={commonStyles.headerButton} />
      </View>

      {/* Tab Navigation */}
      <View style={{
        flexDirection: 'row',
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingHorizontal: 20
      }}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 16,
              borderBottomWidth: 2,
              borderBottomColor: activeTab === tab.id ? colors.primary : 'transparent'
            }}
            onPress={() => setActiveTab(tab.id as any)}
          >
            <Icon 
              name={tab.icon} 
              size={18} 
              color={activeTab === tab.id ? colors.primary : colors.textSecondary} 
            />
            <Text style={[
              commonStyles.text,
              { 
                marginLeft: 6,
                fontWeight: activeTab === tab.id ? '600' : '400',
                color: activeTab === tab.id ? colors.primary : colors.textSecondary
              }
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <View style={{ flex: 1 }}>
        {activeTab === 'options' && <AlternativeStorageOptions />}
        {activeTab === 'setup' && (
          <ScrollView style={{ flex: 1, padding: 20 }}>
            <StorageSetup onComplete={() => setActiveTab('test')} />
          </ScrollView>
        )}
        {activeTab === 'test' && <AvatarUploadTest />}
      </View>
    </SafeAreaView>
  );
}
