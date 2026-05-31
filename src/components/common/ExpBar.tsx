import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts, Spacing } from '../../constants/theme';

const SEGMENTS = 20;

interface Props {
  exp: number;
  expToNext: number;
  level: number;
}

export function ExpBar({ exp, expToNext, level }: Props) {
  const pct = Math.min((exp / expToNext) * 100, 100);
  const filledSegments = Math.round((pct / 100) * SEGMENTS);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>LV.{level}</Text>
        <Text style={styles.expText}>{exp} / {expToNext} EXP</Text>
      </View>
      {/* Segmented block bar */}
      <View style={styles.track}>
        {Array.from({ length: SEGMENTS }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.segment,
              i < filledSegments ? styles.segmentFilled : styles.segmentEmpty,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.xs },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  label: {
    fontFamily: Fonts.monoBold,
    fontSize: Fonts.size.md,
    color: Colors.gold,
    letterSpacing: 1,
  },
  expText: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.xs,
    color: Colors.textDim,
  },
  track: {
    flexDirection: 'row',
    height: 14,
    borderWidth: 2,
    borderColor: Colors.borderDim,
    backgroundColor: Colors.bgSecondary,
    padding: 2,
    gap: 1,
  },
  segment: {
    flex: 1,
    height: '100%',
  },
  segmentFilled: {
    backgroundColor: Colors.gold,
  },
  segmentEmpty: {
    backgroundColor: Colors.bgCard,
  },
});
