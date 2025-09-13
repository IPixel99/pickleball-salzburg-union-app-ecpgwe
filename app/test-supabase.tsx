
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from '../components/Icon';
import SupabaseConnectionTest from '../components/SupabaseConnectionTest';

export default function TestSupabaseScreen() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[commonStyles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={{ flex: 1 }}>
        {/* Header */}
        <TouchableOpacity
          style={[commonStyles.backButton, { backgroundColor: colors.surface }]}
          onPress={handleBack}
        >
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>

        <SupabaseConnectionTest />
      </ScrollView>
    </SafeAreaView>
  );
}
