
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

// Legacy colors for backward compatibility - will be replaced by theme context
export const colors = {
  primary: '#F20505',
  primaryLight: '#FF4444',
  secondary: '#F2B705',
  background: '#FFFFFF',
  backgroundSecondary: '#F8F9FA',
  surface: '#F8F9FA',
  card: '#FFFFFF',
  text: '#1A1A1A',
  textLight: '#999999',
  textSecondary: '#666666',
  border: '#E5E5E5',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#F20505',
  white: '#FFFFFF',
  black: '#000000',
  red: '#F20505',
  yellow: '#F2B705',
  pink: '#F20574',
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  } as ViewStyle,
  
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  } as ViewStyle,
  
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  } as ViewStyle,
  
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  } as TextStyle,
  
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  } as TextStyle,
  
  text: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  } as TextStyle,
  
  textLight: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
  } as TextStyle,
  
  caption: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  } as TextStyle,
  
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  } as ViewStyle,
  
  cardElevated: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  } as ViewStyle,
  
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  } as ViewStyle,
  
  inputFocused: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  } as ViewStyle,
  
  buttonTextWhite: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  } as TextStyle,
  
  buttonTextPrimary: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  } as TextStyle,
  
  border: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  } as ViewStyle,
  
  // Depth effect styles
  depth1: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  } as ViewStyle,
  
  depth2: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  } as ViewStyle,
  
  depth3: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 6,
  } as ViewStyle,
  
  depth4: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  } as ViewStyle,
});

export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  } as ViewStyle,
  
  secondary: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  } as ViewStyle,
  
  accent: {
    backgroundColor: colors.yellow,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: colors.yellow,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  } as ViewStyle,
  
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  } as ViewStyle,
  
  ghost: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  } as ViewStyle,
  
  danger: {
    backgroundColor: colors.error,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: colors.error,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  } as ViewStyle,
});

export const buttonTextStyles = StyleSheet.create({
  primaryText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  } as TextStyle,
  
  secondaryText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  } as TextStyle,
  
  accentText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  } as TextStyle,
  
  dangerText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  } as TextStyle,
});
