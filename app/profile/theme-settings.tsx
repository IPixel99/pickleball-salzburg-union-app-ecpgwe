
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from '../../components/Icon';
import { useTheme } from '../../contexts/ThemeContext';

export default function ThemeSettingsScreen() {
  const router = useRouter();
  const { colors, themeMode, setThemeMode } = useTheme();

  const handleBack = () => {
    router.back();
  };

  const themeOptions = [
    { value: 'light' as const, label: 'Hell', icon: 'sunny', description: 'Heller Modus für bessere Sichtbarkeit bei Tag' },
    { value: 'dark' as const, label: 'Dunkel', icon: 'moon', description: 'Dunkler Modus für angenehmeres Sehen bei Nacht' },
    { value: 'auto' as const, label: 'Automatisch', icon: 'phone-portrait', description: 'Folgt den Systemeinstellungen' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.surface,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}>
        <TouchableOpacity style={{ padding: 8, marginRight: 12 }} onPress={handleBack}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text }}>
          Design & Theme
        </Text>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 24 }} showsVerticalScrollIndicator={false}>
        {/* Theme Options */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 16,
          }}>
            Farbschema wählen
          </Text>
          {themeOptions.map((option) => {
            const isActive = themeMode === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 12,
                  borderWidth: 2,
                  borderColor: isActive ? colors.primary : colors.border,
                  shadowColor: isActive ? colors.primary : colors.black,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: isActive ? 0.2 : 0.08,
                  shadowRadius: 8,
                  elevation: isActive ? 6 : 4,
                }}
                onPress={() => setThemeMode(option.value)}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: isActive ? colors.primary : colors.backgroundSecondary,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 16,
                  }}>
                    <Icon 
                      name={option.icon} 
                      size={24} 
                      color={isActive ? colors.white : colors.text} 
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: 18,
                      fontWeight: '600',
                      color: colors.text,
                      marginBottom: 4,
                    }}>
                      {option.label}
                    </Text>
                    <Text style={{
                      fontSize: 14,
                      color: colors.textSecondary,
                      lineHeight: 20,
                    }}>
                      {option.description}
                    </Text>
                  </View>
                  {isActive && (
                    <Icon name="checkmark-circle" size={28} color={colors.primary} style={{ marginLeft: 12 }} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
