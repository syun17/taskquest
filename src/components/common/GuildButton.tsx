import React, { useState } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Fonts, Spacing } from '../../constants/theme';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'danger' | 'ghost' | 'gold';
  disabled?: boolean;
  style?: ViewStyle;
}

export function GuildButton({ label, onPress, variant = 'primary', disabled, style }: Props) {
  const [pressed, setPressed] = useState(false);

  const bgColor = disabled
    ? Colors.textDim
    : variant === 'primary' ? Colors.border
    : variant === 'danger' ? Colors.red
    : variant === 'gold' ? Colors.gold
    : Colors.bgCard;

  const textColor = variant === 'gold'
    ? Colors.textDark
    : disabled ? Colors.white
    : Colors.white;

  const borderColor = variant === 'ghost' ? Colors.border : bgColor;

  return (
    // Shadow wrapper: shifts on press to simulate button depression
    <View style={[
      styles.shadowWrapper,
      pressed && styles.shadowWrapperPressed,
      style,
    ]}>
      <TouchableOpacity
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={1}
        style={[styles.btn, { backgroundColor: bgColor, borderColor }]}
      >
        {/* Top-left bevel highlight */}
        <View style={styles.bevelHighlight} />
        <Text style={[styles.label, { color: textColor }]}>
          {label}
        </Text>
      </TouchableOpacity>
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
  shadowWrapperPressed: {
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 4,
    marginLeft: 4,
  },
  btn: {
    borderWidth: 3,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bevelHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  label: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.md,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
