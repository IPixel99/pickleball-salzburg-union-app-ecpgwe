
import React, { useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import Icon from '../../components/Icon';
import EventRegistrations from '../../components/EventRegistrations';
import { commonStyles, colors } from '../../styles/commonStyles';

export default function RegistrationsScreen() {
  const router = useRouter();
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleBack = () => {
    router.back();
  };

  // Set up automatic refresh when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      console.log('Registrations screen focused - setting up auto refresh');
      
      // Set up automatic refresh every 30 seconds
      refreshIntervalRef.current = setInterval(() => {
        console.log('Auto-refreshing registrations page');
        // The EventRegistrations component handles its own refresh
      }, 30000);

      return () => {
        console.log('Registrations screen unfocused - clearing auto refresh');
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }, [])
  );

  return (
    <SafeAreaView style={commonStyles.container}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
        <TouchableOpacity
          onPress={handleBack}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.background,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 16,
          }}
        >
          <Icon name="chevron-back" size={20} color={colors.text} />
        </TouchableOpacity>
        
        <View style={{ flex: 1 }}>
          <Text style={[commonStyles.title, { color: colors.primary }]}>
            Meine Anmeldungen
          </Text>
          <Text style={commonStyles.textLight}>
            Alle deine registrierten Events
          </Text>
        </View>
      </View>

      {/* Content */}
      <EventRegistrations showAll={true} />
    </SafeAreaView>
  );
}
