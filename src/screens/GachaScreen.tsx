import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useCharacterStore } from '../store/useCharacterStore';
import { useInventoryStore } from '../store/useInventoryStore';
import { PixelBorder } from '../components/common/PixelBorder';
import { GuildButton } from '../components/common/GuildButton';
import { RarityBadge } from '../components/common/RarityBadge';
import { Colors, Fonts, Spacing } from '../constants/theme';
import { Item, GuildRank } from '../types';
import { GACHA_RATES_BY_RANK, RANK_ORDER } from '../constants/gameData';

const GACHA_COST = 100;

const TYPE_LABELS: Record<string, string> = {
  weapon: '武器',
  armor: '防具',
  accessory: 'アクセ',
  consumable: '消耗品',
};

export function GachaScreen() {
  const character = useCharacterStore(s => s.character);
  const spendGold = useCharacterStore(s => s.spendGold);
  const rollGachaFn = useInventoryStore(s => s.rollGacha);

  const [lastResult, setLastResult] = useState<Item | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const canRoll = character.gold >= GACHA_COST;
  const rates = GACHA_RATES_BY_RANK[character.guildRank];
  const commonRate = 100 - rates.legendary - rates.epic - rates.rare;

  const handleRoll = () => {
    if (character.gold < GACHA_COST) {
      Alert.alert('Goldが足りない', `ガチャには${GACHA_COST}Gが必要です。\nクエストを達成してGoldを稼ごう！`);
      return;
    }

    const consumed = spendGold(GACHA_COST);
    if (!consumed) return;

    setIsRolling(true);
    setTimeout(() => {
      const item = rollGachaFn(character.guildRank);
      setLastResult(item);
      setIsRolling(false);
    }, 600);
  };

  const rarityColors: Record<string, string> = {
    common: Colors.rarityCommon,
    rare: Colors.rarityRare,
    epic: Colors.rarityEpic,
    legendary: Colors.rarityLegendary,
  };

  const rateRows = [
    { label: 'LEGENDARY', rate: `${rates.legendary}%`, pct: rates.legendary, color: Colors.rarityLegendary },
    { label: 'EPIC', rate: `${rates.epic}%`, pct: rates.epic, color: Colors.rarityEpic },
    { label: 'RARE', rate: `${rates.rare}%`, pct: rates.rare, color: Colors.rarityRare },
    { label: 'COMMON', rate: `${commonRate}%`, pct: commonRate, color: Colors.rarityCommon },
  ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.header}>【 ガチャ 】</Text>
      <Text style={styles.subtitle}>～ 運命の一振り ～</Text>

      {/* Gacha Info */}
      <PixelBorder style={styles.infoCard} color={Colors.purple}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>ギルドランク</Text>
            <Text style={[styles.infoValue, { color: Colors.purple }]}>
              {character.guildRank}ランク
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>所持Gold</Text>
            <Text style={[styles.infoValue, { color: Colors.gold }]}>
              {character.gold.toLocaleString()}G
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>必要Gold</Text>
            <Text style={[styles.infoValue, { color: Colors.red }]}>{GACHA_COST}G</Text>
          </View>
        </View>
        <Text style={styles.infoNote}>
          ※ ランクが上がるほど高レアリティの排出率がアップ！
        </Text>
      </PixelBorder>

      {/* Gacha Machine */}
      <PixelBorder style={styles.machine} color={Colors.gold}>
        <Text style={styles.machineTitle}>★ ギルド宝箱 ★</Text>

        {isRolling ? (
          <View style={styles.rollingBox}>
            <Text style={styles.rollingText}>???</Text>
            <Text style={styles.rollingSubText}>運命が決まる...</Text>
          </View>
        ) : lastResult ? (
          <View style={styles.resultBox}>
            <RarityBadge rarity={lastResult.rarity} showLabel />
            <Text style={[styles.resultName, { color: rarityColors[lastResult.rarity] }]}>
              {lastResult.name}
            </Text>
            <Text style={styles.resultType}>{TYPE_LABELS[lastResult.type]}</Text>
            <View style={styles.resultStats}>
              {lastResult.attack !== undefined && lastResult.attack > 0 && (
                <Text style={[styles.resultStat, { color: Colors.red }]}>
                  ATK +{lastResult.attack}
                </Text>
              )}
              {lastResult.defense !== undefined && lastResult.defense > 0 && (
                <Text style={[styles.resultStat, { color: Colors.blue }]}>
                  DEF +{lastResult.defense}
                </Text>
              )}
            </View>
            <Text style={styles.resultDesc}>{lastResult.description}</Text>
          </View>
        ) : (
          <View style={styles.placeholderBox}>
            <Text style={styles.placeholderIcon}>🎲</Text>
            <Text style={styles.placeholderText}>ガチャを引いて装備を入手しよう！</Text>
          </View>
        )}

        <GuildButton
          label={isRolling ? 'ガチャ中...' : `ガチャを引く (${GACHA_COST}G)`}
          variant="gold"
          onPress={handleRoll}
          disabled={!canRoll || isRolling}
          style={styles.rollBtn}
        />
      </PixelBorder>

      {/* Rank Rate Table */}
      <PixelBorder style={styles.ratesCard} color={Colors.borderDim}>
        <Text style={styles.ratesTitle}>現在の排出率 ({character.guildRank}ランク)</Text>
        {rateRows.map(r => (
          <View key={r.label} style={styles.rateRow}>
            <Text style={[styles.rateLabel, { color: r.color }]}>{r.label}</Text>
            <View style={styles.rateBarBg}>
              <View style={[styles.rateBar, { width: `${Math.min(r.pct, 100)}%` as `${number}%`, backgroundColor: r.color }]} />
            </View>
            <Text style={[styles.rateValue, { color: r.color }]}>{r.rate}</Text>
          </View>
        ))}
        <Text style={styles.rankNote}>ランク別の排出率:</Text>
        {RANK_ORDER.map(rank => {
          const r = GACHA_RATES_BY_RANK[rank as GuildRank];
          const isCurrentRank = rank === character.guildRank;
          return (
            <View key={rank} style={[styles.rankRateRow, isCurrentRank && styles.rankRateRowActive]}>
              <Text style={[styles.rankRateRank, isCurrentRank && { color: Colors.gold }]}>
                {rank}
              </Text>
              <Text style={[styles.rankRateText, isCurrentRank && { color: Colors.text }]}>
                L:{r.legendary}% E:{r.epic}% R:{r.rare}% C:{100 - r.legendary - r.epic - r.rare}%
              </Text>
            </View>
          );
        })}
      </PixelBorder>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.lg, gap: Spacing.md },
  header: {
    fontFamily: Fonts.monoBold,
    fontSize: Fonts.size.xl,
    color: Colors.gold,
    textAlign: 'center',
    letterSpacing: 2,
  },
  subtitle: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.sm,
    color: Colors.textDim,
    textAlign: 'center',
    marginTop: -Spacing.sm,
  },
  infoCard: { gap: Spacing.sm },
  infoRow: { flexDirection: 'row', justifyContent: 'space-around' },
  infoItem: { alignItems: 'center', gap: 4 },
  infoLabel: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.xs,
    color: Colors.textDim,
    letterSpacing: 1,
  },
  infoValue: {
    fontFamily: Fonts.monoBold,
    fontSize: Fonts.size.lg,
  },
  infoNote: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.xs,
    color: Colors.textDim,
    textAlign: 'center',
  },
  machine: { gap: Spacing.lg, alignItems: 'center' },
  machineTitle: {
    fontFamily: Fonts.monoBold,
    fontSize: Fonts.size.lg,
    color: Colors.gold,
    letterSpacing: 2,
  },
  rollingBox: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  rollingText: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.title,
    color: Colors.textDim,
    letterSpacing: 8,
  },
  rollingSubText: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.sm,
    color: Colors.textDim,
  },
  resultBox: {
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 120,
    justifyContent: 'center',
  },
  resultName: {
    fontFamily: Fonts.monoBold,
    fontSize: Fonts.size.xl,
    textAlign: 'center',
  },
  resultType: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.sm,
    color: Colors.textDim,
  },
  resultStats: { flexDirection: 'row', gap: Spacing.lg },
  resultStat: {
    fontFamily: Fonts.monoBold,
    fontSize: Fonts.size.lg,
  },
  resultDesc: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.sm,
    color: Colors.textDim,
    textAlign: 'center',
  },
  placeholderBox: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  placeholderIcon: { fontSize: 48 },
  placeholderText: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.sm,
    color: Colors.textDim,
    textAlign: 'center',
  },
  rollBtn: { alignSelf: 'stretch' },
  ratesCard: { gap: Spacing.sm },
  ratesTitle: {
    fontFamily: Fonts.monoBold,
    fontSize: Fonts.size.md,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  rateRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  rateLabel: {
    fontFamily: Fonts.monoBold,
    fontSize: Fonts.size.xs,
    width: 80,
  },
  rateBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.bgSecondary,
    borderWidth: 1,
    borderColor: Colors.borderDim,
  },
  rateBar: { height: '100%' },
  rateValue: {
    fontFamily: Fonts.monoBold,
    fontSize: Fonts.size.xs,
    width: 36,
    textAlign: 'right',
  },
  rankNote: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.xs,
    color: Colors.textDim,
    marginTop: Spacing.sm,
  },
  rankRateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 2,
    paddingHorizontal: Spacing.xs,
  },
  rankRateRowActive: {
    backgroundColor: Colors.gold + '22',
    borderWidth: 1,
    borderColor: Colors.gold + '44',
  },
  rankRateRank: {
    fontFamily: Fonts.monoBold,
    fontSize: Fonts.size.xs,
    color: Colors.textDim,
    width: 16,
  },
  rankRateText: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.xs,
    color: Colors.textDim,
    flex: 1,
  },
});
