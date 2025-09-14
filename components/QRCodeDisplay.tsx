
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Icon from './Icon';
import { colors, commonStyles } from '../styles/commonStyles';

interface QRCodeDisplayProps {
  userId: string;
  size?: number;
  showLabel?: boolean;
  collapsible?: boolean;
}

export default function QRCodeDisplay({ userId, size = 200, showLabel = true, collapsible = true }: QRCodeDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  console.log('Generating QR code for user ID:', userId);

  const toggleExpanded = () => {
    const toValue = isExpanded ? 0 : 1;
    setIsExpanded(!isExpanded);
    
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const animatedHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, size + 80], // QR code size + padding
  });

  const animatedOpacity = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  if (!collapsible) {
    return (
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        {showLabel && (
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 16, textAlign: 'center' }]}>
            Mein QR-Code
          </Text>
        )}
        <View style={{
          padding: 20,
          backgroundColor: colors.background,
          borderRadius: 12,
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
          elevation: 4,
        }}>
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

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <TouchableOpacity
        onPress={toggleExpanded}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.primary,
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderRadius: 12,
          marginBottom: 16,
        }}
        activeOpacity={0.7}
      >
        <Icon 
          name="qr-code" 
          size={20} 
          color={colors.white} 
          style={{ marginRight: 8 }} 
        />
        <Text style={[commonStyles.text, { color: colors.white, fontWeight: '600', marginRight: 8 }]}>
          {isExpanded ? 'QR-Code ausblenden' : 'QR-Code anzeigen'}
        </Text>
        <Animated.View
          style={{
            transform: [{
              rotate: animation.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '180deg'],
              })
            }]
          }}
        >
          <Icon name="chevron-down" size={16} color={colors.white} />
        </Animated.View>
      </TouchableOpacity>

      <Animated.View
        style={{
          height: animatedHeight,
          opacity: animatedOpacity,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View style={{
          padding: 20,
          backgroundColor: colors.background,
          borderRadius: 12,
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
          elevation: 4,
          marginBottom: 12,
        }}>
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
          <Text style={[commonStyles.textLight, { textAlign: 'center', fontSize: 14 }]}>
            Teile diesen Code mit anderen Mitgliedern
          </Text>
        )}
      </Animated.View>
    </View>
  );
}
