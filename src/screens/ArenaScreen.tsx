import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useBattleStore } from '../store/useBattleStore';
import { useCharacterStore } from '../store/useCharacterStore';
import {
  OPPONENTS_BY_RANK,
  ARENA_RANK_NAMES,
  ARENA_RANK_ORDER,
  ARENA_RANK_WIN_THRESHOLDS,
  ARENA_RANK_COLORS,
} from '../constants/arenaData';
import { PixelBorder } from '../components/common/PixelBorder';
import { GuildButton } from '../components/common/GuildButton';
import { Colors, Fonts, Spacing } from '../constants/theme';
import { ArenaStackParamList } from '../navigation/ArenaNavigator';
import { Opponent } from '../types';

type Nav = StackNavigationProp<ArenaStackParamList, 'ArenaHome'>;

function OpponentCard({ opponent, onFight }: { opponent: Opponent; onFight: () => void }) {
  return (
    <PixelBorder style={styles.opponentCard} color={Colors.borderDim}>
      <View style={styles.opponentHeader}>
        <Text style={styles.opponentName}>{opponent.name}</Text>
        <Text style={styles.opponentLevel}>Lv.{opponent.level}</Text>
      </View>
      <View style={styles.opponentStats}>
        {[
          { label: 'HP', value: opponent.hp, color: Colors.green },
          { label: 'ATK', value: opponent.attack, color: Colors.red },
          { label: 'DEF', value: opponent.defense, color: Colors.blue },
          { label: 'SPD', value: opponent.speed, color: Colors.orange },
        ].map(stat => (
          <View key={stat.label} style={styles.statChip}>
            <Text style={styles.statChipLabel}>{stat.label}</Text>
            <Text style={[styles.statChipValue, { color: stat.color }]}>{stat.value}</Text>
          </View>
        ))}
      </View>
      <View style={styles.rewardRow}>
        <Text style={styles.rewardLabel}>勝利報酬:</Text>
        <Text style={[styles.rewardValue, { color: Colors.green }]}>{opponent.reward.exp}EXP</Text>
        <Text style={[styles.rewardValue, { color: Colors.gold }]}>{opponent.reward.gold}G</Text>
        <Text style={[styles.rewardValue, { color: Colors.orange }]}>{opponent.reward.arenaCoins}コイン</Text>
      </View>
      <GuildButton label="挑戦する" variant="primary" onPress={onFight} />
    </PixelBorder>
  );
}

export function ArenaScreen() {
  const navigation = useNavigation<Nav>();
  const arenaRank = useBattleStore(s => s.arenaRank);
  const wins = useBattleStore(s => s.wins);
  const losses = useBattleStore(s => s.losses);
  const arenaCoins = useBattleStore(s => s.arenaCoins);
  const character = useCharacterStore(s => s.character);

  const opponents = OPPONENTS_BY_RANK[arenaRank];
  const rankIndex = ARENA_RANK_ORDER.indexOf(arenaRank);
  const nextRank = ARENA_RANK_ORDER[rankIndex + 1];
  const nextThreshold = nextRank ? ARENA_RANK_WIN_THRESHOLDS[nextRank] : null;
  const currentThreshold = ARENA_RANK_WIN_THRESHOLDS[arenaRank];
  const rankProgress = nextThreshold
    ? (wins - currentThreshold) / (nextThreshold - currentThreshold)
    : 1;
  const rankColor = ARENA_RANK_COLORS[arenaRank];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.header}>【 闘技場 】</Text>

      {/* Arena Rank Card */}
      <PixelBorder style={styles.rankCard} color={rankColor}>
        <View style={styles.rankHeader}>
          <Text style={styles.rankIcon}>⚔️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.rankLabel}>アリーナランク</Text>
            <Text style={[styles.rankName, { color: rankColor }]}>
              {ARENA_RANK_NAMES[arenaRank]}
            </Text>
          </View>
          <View style={styles.coinBox}>
            <Text style={styles.coinLabel}>コイン</Text>
            <Text style={styles.coinValue}>{arenaCoins}</Text>
          </View>
        </View>

        <View style={styles.wlRow}>
          <Text style={[styles.wlText, { color: Colors.green }]}>勝: {wins}</Text>
          <Text style={styles.wlSep}>/</Text>
          <Text style={[styles.wlText, { color: Colors.red }]}>負: {losses}</Text>
          <Text style={styles.wlSep}>|</Text>
          <Text style={styles.wlText}>
            {character.level}Lv · ATK {character.level * 3 + 5}+
          </Text>
        </View>

        {nextRank && (
          <View style={styles.progressSection}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>
                次のランク: {ARENA_RANK_NAMES[nextRank]}
              </Text>
              <Text style={styles.progressLabel}>
                {wins - currentThreshold}/{nextThreshold! - currentThreshold}勝
              </Text>
            </View>
            <View style={styles.progressBg}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.round(rankProgress * 100)}%` as `${number}%`, backgroundColor: rankColor },
                ]}
              />
            </View>
          </View>
        )}
        {!nextRank && (
          <Text style={[styles.maxRankText, { color: rankColor }]}>
            ★ 最高ランク達成！ ★
          </Text>
        )}
      </PixelBorder>

      {/* Shop Link */}
      <GuildButton
        label="⚒ アリーナショップ"
        variant="gold"
        onPress={() => navigation.navigate('ArenaShop')}
      />

      {/* Opponents */}
      <Text style={styles.sectionHeader}>【 対戦相手を選ぶ 】</Text>
      <Text style={styles.sectionNote}>
        現在のランク帯の相手と戦えます。勝利でランクアップ！
      </Text>

      {opponents.map(opponent => (
        <OpponentCard
          key={opponent.id}
          opponent={opponent}
          onFight={() => navigation.navigate('Battle', { opponentId: opponent.id })}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.lg, gap: Spacing.md },
  header: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.xl,
    color: Colors.gold,
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  rankCard: { gap: Spacing.sm },
  rankHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  rankIcon: { fontSize: 32 },
  rankLabel: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.xs,
    color: Colors.textDim,
    letterSpacing: 1,
  },
  rankName: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.xl,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  coinBox: {
    alignItems: 'center',
    backgroundColor: Colors.bgSecondary,
    padding: Spacing.sm,
    minWidth: 64,
  },
  coinLabel: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.xs,
    color: Colors.textDim,
  },
  coinValue: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.lg,
    color: Colors.orange,
    fontWeight: 'bold',
  },
  wlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  wlText: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.sm,
    color: Colors.text,
    fontWeight: 'bold',
  },
  wlSep: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.sm,
    color: Colors.textDim,
  },
  progressSection: { gap: 4 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.xs,
    color: Colors.textDim,
  },
  progressBg: {
    height: 8,
    backgroundColor: Colors.bgSecondary,
    borderWidth: 1,
    borderColor: Colors.borderDim,
  },
  progressFill: { height: '100%' },
  maxRankText: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.sm,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 2,
  },
  sectionHeader: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.lg,
    color: Colors.text,
    fontWeight: 'bold',
    letterSpacing: 2,
    textAlign: 'center',
  },
  sectionNote: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.xs,
    color: Colors.textDim,
    textAlign: 'center',
  },
  opponentCard: { gap: Spacing.sm },
  opponentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  opponentName: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.lg,
    color: Colors.white,
    fontWeight: 'bold',
  },
  opponentLevel: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.sm,
    color: Colors.textDim,
  },
  opponentStats: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  statChip: {
    backgroundColor: Colors.bgSecondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  statChipLabel: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.xs,
    color: Colors.textDim,
  },
  statChipValue: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.sm,
    fontWeight: 'bold',
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  rewardLabel: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.xs,
    color: Colors.textDim,
  },
  rewardValue: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.xs,
    fontWeight: 'bold',
  },
});
