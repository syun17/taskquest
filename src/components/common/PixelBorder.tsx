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
    // Outer wrapper: right+bottom black border = pixel drop shadow
    <View style={[styles.shadowWrapper, style]}>
      {/* Main box with 3px colored border */}
      <View style={[styles.outer, { borderColor: color }]}>
        {/* Inner bevel: top/left lighter, bottom/right darker */}
        <View style={[styles.bevel, { padding }]}>
          {children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    borderRightWidth: 4,
    borderBottomWidth: 4,
    borderRightColor: Colors.shadowDark,
    borderBottomColor: Colors.shadowDark,
  },
  outer: {
    borderWidth: 3,
    backgroundColor: Colors.bgCard,
  },
  bevel: {
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    borderLeftColor: 'rgba(255,255,255,0.15)',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.4)',
    borderRightColor: 'rgba(0,0,0,0.4)',
  },
});
