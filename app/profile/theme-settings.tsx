
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from '../../components/Icon';
import { useTheme } from '../../contexts/ThemeContext';

export default function ThemeSettingsScreen() {
  const router = useRouter();
  const { colors, theme, themeMode, setThemeMode } = useTheme();

  const handleBack = () => {
    router.back();
  };

  const themeOptions = [
    { value: 'light' as const, label: 'Hell', icon: 'sunny', description: 'Heller Modus für bessere Sichtbarkeit bei Tag' },
    { value: 'dark' as const, label: 'Dunkel', icon: 'moon', description: 'Dunkler Modus für angenehmeres Sehen bei Nacht' },
    { value: 'auto' as const, label: 'Automatisch', icon: 'phone-portrait', description: 'Folgt den Systemeinstellungen' },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
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
    },
    backButton: {
      padding: 8,
      marginRight: 12,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 24,
    },
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
    },
    optionCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: colors.border,
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    optionCardActive: {
      borderColor: colors.primary,
      backgroundColor: theme === 'dark' ? colors.surfaceElevated : colors.surface,
      shadowColor: colors.primary,
      shadowOpacity: 0.2,
      elevation: 6,
    },
    optionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    optionIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.backgroundSecondary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    optionIconContainerActive: {
      backgroundColor: colors.primary,
    },
    optionTextContainer: {
      flex: 1,
    },
    optionLabel: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    optionDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    checkIcon: {
      marginLeft: 12,
    },
    previewSection: {
      marginTop: 24,
      padding: 20,
      backgroundColor: colors.surface,
      borderRadius: 16,
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    previewTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
    },
    previewCard: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    previewCardTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    previewCardText: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    colorPalette: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 12,
    },
    colorSwatch: {
      width: 40,
      height: 40,
      borderRadius: 20,
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Design & Theme</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Theme Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Farbschema wählen</Text>
          {themeOptions.map((option) => {
            const isActive = themeMode === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[styles.optionCard, isActive && styles.optionCardActive]}
                onPress={() => setThemeMode(option.value)}
                activeOpacity={0.7}
              >
                <View style={styles.optionHeader}>
                  <View style={[
                    styles.optionIconContainer,
                    isActive && styles.optionIconContainerActive
                  ]}>
                    <Icon 
                      name={option.icon} 
                      size={24} 
                      color={isActive ? colors.white : colors.text} 
                    />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionLabel}>{option.label}</Text>
                    <Text style={styles.optionDescription}>{option.description}</Text>
                  </View>
                  {isActive && (
                    <Icon name="checkmark-circle" size={28} color={colors.primary} style={styles.checkIcon} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Color Palette Preview */}
        <View style={styles.previewSection}>
          <Text style={styles.previewTitle}>Farbpalette</Text>
          <View style={styles.colorPalette}>
            <View style={[styles.colorSwatch, { backgroundColor: '#F20505' }]} />
            <View style={[styles.colorSwatch, { backgroundColor: '#F2B705' }]} />
            <View style={[styles.colorSwatch, { backgroundColor: '#F20574' }]} />
            <View style={[styles.colorSwatch, { backgroundColor: colors.text }]} />
          </View>
        </View>

        {/* Preview Card */}
        <View style={styles.previewSection}>
          <Text style={styles.previewTitle}>Vorschau</Text>
          <View style={styles.previewCard}>
            <Text style={styles.previewCardTitle}>Beispiel Karte</Text>
            <Text style={styles.previewCardText}>
              So sehen Karten und Inhalte in der App mit dem aktuellen Theme aus.
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
