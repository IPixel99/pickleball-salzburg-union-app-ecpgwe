
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { colors, commonStyles } from '../styles/commonStyles';

interface QRCodeDisplayProps {
  userId: string;
  size?: number;
  showLabel?: boolean;
}

export default function QRCodeDisplay({ userId, size = 200, showLabel = true }: QRCodeDisplayProps) {
  console.log('Generating QR code for user ID:', userId);

  return (
    <View style={styles.container}>
      {showLabel && (
        <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 16, textAlign: 'center' }]}>
          Mein QR-Code
        </Text>
      )}
      <View style={styles.qrContainer}>
        <QRCode
          value={userId}
          size={size}
          color={colors.text}
          backgroundColor={colors.background}
          logo={require('../assets/images/c0025ffd-25dc-49f5-9153-918105ed49ee.png')}
          logoSize={size * 0.2}
          logoBackgroundColor={colors.background}
          logoMargin={2}
          logoBorderRadius={10}
        />
      </View>
      {showLabel && (
        <Text style={[commonStyles.textLight, { marginTop: 12, textAlign: 'center' }]}>
          Teile diesen Code mit anderen Mitgliedern
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrContainer: {
    padding: 20,
    backgroundColor: colors.background,
    borderRadius: 12,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
});
