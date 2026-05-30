import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { QuestDifficulty } from '../../types';
import { Colors, Fonts } from '../../constants/theme';

const DIFF_COLORS: Record<QuestDifficulty, string> = {
  F: Colors.diffF,
  E: Colors.diffE,
  D: Colors.diffD,
  C: Colors.diffC,
  B: Colors.diffB,
  A: Colors.diffA,
  S: Colors.diffS,
};

interface Props {
  difficulty: QuestDifficulty;
}

export function DifficultyBadge({ difficulty }: Props) {
  const color = DIFF_COLORS[difficulty];
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{difficulty}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 2,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.sm,
    fontWeight: 'bold',
  },
});
