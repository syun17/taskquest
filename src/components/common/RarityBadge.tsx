import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ItemRarity } from '../../types';
import { Colors, Fonts, Spacing } from '../../constants/theme';

const RARITY_COLORS: Record<ItemRarity, string> = {
  common: Colors.rarityCommon,
  rare: Colors.rarityRare,
  epic: Colors.rarityEpic,
  legendary: Colors.rarityLegendary,
};

const RARITY_LABELS: Record<ItemRarity, string> = {
  common: 'C',
  rare: 'R',
  epic: 'E',
  legendary: 'L',
};

interface Props {
  rarity: ItemRarity;
  showLabel?: boolean;
}

export function RarityBadge({ rarity, showLabel = false }: Props) {
  const color = RARITY_COLORS[rarity];
  return (
    <View style={[styles.badge, { borderColor: color, backgroundColor: color + '33' }]}>
      <Text style={[styles.text, { color }]}>
        {showLabel ? rarity.toUpperCase() : RARITY_LABELS[rarity]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 2,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: Fonts.monoBold,
    fontSize: Fonts.size.xs,
    letterSpacing: 1,
  },
});
