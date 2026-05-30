import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  color?: string;
  padding?: number;
}

export function PixelBorder({ children, style, color = Colors.border, padding = 12 }: Props) {
  return (
    <View style={[styles.outer, { borderColor: color, padding }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderWidth: 2,
    backgroundColor: Colors.bgCard,
  },
});
