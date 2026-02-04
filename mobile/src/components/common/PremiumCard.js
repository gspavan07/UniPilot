import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';

const PremiumCard = ({
  children,
  style,
  borderRadius = 20,
  backgroundColor = '#ffffff',
}) => {
  return (
    <View
      style={[
        styles.card,
        {
          borderRadius: borderRadius,
          backgroundColor: backgroundColor,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    // Combination of subtle border and modern shadow
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
});

export default PremiumCard;
