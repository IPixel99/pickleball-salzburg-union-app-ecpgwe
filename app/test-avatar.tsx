
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TouchableOpacity, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from '../components/Icon';
import AvatarUploadTest from '../components/AvatarUploadTest';

export default function TestAvatarScreen() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.header}>
        <TouchableOpacity onPress={handleBack} style={commonStyles.backButton}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={commonStyles.headerTitle}>Avatar Test</Text>
        <View style={{ width: 24 }} />
      </View>

      <AvatarUploadTest />
    </SafeAreaView>
  );
}
