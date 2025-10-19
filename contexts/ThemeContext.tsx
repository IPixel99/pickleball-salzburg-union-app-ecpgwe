
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: 'light' | 'dark';
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  colors: typeof lightColors;
}

const lightColors = {
  // Primary brand colors
  primary: '#F20505',
  primaryLight: '#FF4444',
  primaryDark: '#C00404',
  
  // Accent colors
  accent: '#F2B705',
  accentLight: '#FFD54F',
  accentPink: '#F20574',
  
  // Background colors
  background: '#FFFFFF',
  backgroundSecondary: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  
  // Text colors
  text: '#1A1A1A',
  textSecondary: '#666666',
  textLight: '#999999',
  
  // Border colors
  border: '#E5E5E5',
  borderLight: '#F0F0F0',
  
  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#F20505',
  info: '#3B82F6',
  
  // Utility colors
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Shadow colors
  shadowLight: 'rgba(242, 5, 5, 0.1)',
  shadowMedium: 'rgba(242, 5, 5, 0.2)',
  shadowDark: 'rgba(0, 0, 0, 0.3)',
};

const darkColors = {
  // Primary brand colors
  primary: '#F20505',
  primaryLight: '#FF4444',
  primaryDark: '#C00404',
  
  // Accent colors
  accent: '#F2B705',
  accentLight: '#FFD54F',
  accentPink: '#F20574',
  
  // Background colors
  background: '#121212',
  backgroundSecondary: '#1E1E1E',
  surface: '#252525',
  surfaceElevated: '#2D2D2D',
  
  // Text colors
  text: '#FFFFFF',
  textSecondary: '#CCCCCC',
  textLight: '#999999',
  
  // Border colors
  border: '#3A3A3A',
  borderLight: '#2D2D2D',
  
  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#F20505',
  info: '#3B82F6',
  
  // Utility colors
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.7)',
  
  // Shadow colors
  shadowLight: 'rgba(242, 5, 5, 0.3)',
  shadowMedium: 'rgba(242, 5, 5, 0.4)',
  shadowDark: 'rgba(0, 0, 0, 0.6)',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@pickleball_theme_mode';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');
  const [theme, setTheme] = useState<'light' | 'dark'>(systemColorScheme || 'light');

  // Load saved theme preference
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Update theme when mode or system preference changes
  useEffect(() => {
    if (themeMode === 'auto') {
      setTheme(systemColorScheme || 'light');
    } else {
      setTheme(themeMode);
    }
  }, [themeMode, systemColorScheme]);

  const loadThemePreference = async () => {
    try {
      const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedMode && (savedMode === 'light' || savedMode === 'dark' || savedMode === 'auto')) {
        setThemeModeState(savedMode as ThemeMode);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
