import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Fonts, Spacing } from '../../constants/theme';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'danger' | 'ghost' | 'gold';
  disabled?: boolean;
  style?: ViewStyle;
}

export function GuildButton({ label, onPress, variant = 'primary', disabled, style }: Props) {
  const bgColor = disabled
    ? Colors.textDim
    : variant === 'primary' ? Colors.border
    : variant === 'danger' ? Colors.red
    : variant === 'gold' ? Colors.gold
    : 'transparent';

  const textColor = variant === 'gold' ? Colors.textDark : Colors.white;
  const borderColor = variant === 'ghost' ? Colors.border : bgColor;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.btn, { backgroundColor: bgColor, borderColor }, style]}
      activeOpacity={0.7}
    >
      <Text style={[styles.label, { color: disabled ? Colors.white : textColor }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderWidth: 2,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.md,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
