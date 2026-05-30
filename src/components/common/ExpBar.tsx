import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts, Spacing } from '../../constants/theme';

interface Props {
  exp: number;
  expToNext: number;
  level: number;
}

export function ExpBar({ exp, expToNext, level }: Props) {
  const pct = Math.min((exp / expToNext) * 100, 100);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Lv.{level}</Text>
        <Text style={styles.expText}>{exp} / {expToNext} EXP</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.xs },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  label: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.md,
    color: Colors.gold,
    fontWeight: 'bold',
  },
  expText: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.xs,
    color: Colors.textDim,
  },
  track: {
    height: 8,
    backgroundColor: Colors.bgSecondary,
    borderWidth: 1,
    borderColor: Colors.borderDim,
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.gold,
  },
});
