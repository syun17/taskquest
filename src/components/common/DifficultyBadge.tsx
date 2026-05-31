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
    // Pixel shadow wrapper
    <View style={[styles.shadow, { borderColor: Colors.shadowDark }]}>
      <View style={[styles.badge, { borderColor: color, backgroundColor: color + '22' }]}>
        <Text style={[styles.text, { color }]}>{difficulty}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRightWidth: 3,
    borderBottomWidth: 3,
    borderRightColor: Colors.shadowDark,
    borderBottomColor: Colors.shadowDark,
  },
  badge: {
    borderWidth: 2,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.sm,
    fontWeight: 'bold',
    letterSpacing: 0,
  },
});
