import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useCharacterStore } from '../store/useCharacterStore';
import { useInventoryStore } from '../store/useInventoryStore';
import { useBattleStore } from '../store/useBattleStore';
import { calculatePlayerStats, simulateBattle } from '../utils/battleCalculator';
import { findOpponentById } from '../constants/arenaData';
import { Colors, Fonts, Spacing } from '../constants/theme';
import { ArenaStackParamList } from '../navigation/ArenaNavigator';
import { BattleRecord } from '../types';

type Nav = StackNavigationProp<ArenaStackParamList, 'Battle'>;
type Route = RouteProp<ArenaStackParamList, 'Battle'>;

function HpBar({ current, max, color }: { current: number; max: number; color: string }) {
  const pct = Math.max(0, Math.min(100, Math.round((current / max) * 100)));
  return (
    <View style={hpBarStyles.bg}>
      <View
        style={[
          hpBarStyles.fill,
          {
            width: `${pct}%` as `${number}%`,
            backgroundColor: pct > 50 ? Colors.green : pct > 25 ? Colors.orange : Colors.red,
          },
        ]}
      />
      <View style={hpBarStyles.overlay}>
        <Text style={[hpBarStyles.text, { color }]}>
          {current}/{max}
        </Text>
      </View>
    </View>
  );
}

const hpBarStyles = StyleSheet.create({
  bg: {
    height: 20,
    backgroundColor: Colors.bgSecondary,
    borderWidth: 1,
    borderColor: Colors.borderDim,
    position: 'relative',
  },
  fill: { height: '100%', position: 'absolute', left: 0, top: 0 },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontFamily: Fonts.monoBold,
    fontSize: Fonts.size.xs,
  },
});

export function BattleScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { opponentId } = route.params;

  const character = useCharacterStore(s => s.character);
  const totalAttack = useInventoryStore(s => s.getTotalAttack());
  const totalDefense = useInventoryStore(s => s.getTotalDefense());
  const gainExp = useCharacterStore(s => s.gainExp);
  const gainGold = useCharacterStore(s => s.gainGold);
  const recordBattle = useBattleStore(s => s.recordBattle);

  const opponent = useMemo(() => findOpponentById(opponentId), [opponentId]);

  const playerStats = useMemo(
    () => calculatePlayerStats(character.level, totalAttack, totalDefense),
    [character.level, totalAttack, totalDefense],
  );

  const { won, log } = useMemo(
    () => (opponent ? simulateBattle(playerStats, opponent) : { won: false, log: [] }),
    [playerStats, opponent],
  );

  const [logIndex, setLogIndex] = useState(-1);
  const [displayPlayerHp, setDisplayPlayerHp] = useState(playerStats.maxHp);
  const [displayOpponentHp, setDisplayOpponentHp] = useState(opponent?.hp ?? 0);
  const [showResult, setShowResult] = useState(false);
  const rewardAppliedRef = useRef(false);

  useEffect(() => {
    if (showResult) {
      return;
    }
    const delay = logIndex === -1 ? 800 : 500;
    const timer = setTimeout(() => {
      const next = logIndex + 1;
      if (next >= log.length) {
        setShowResult(true);
        return;
      }
      setDisplayPlayerHp(log[next].playerHp);
      setDisplayOpponentHp(log[next].opponentHp);
      setLogIndex(next);
    }, delay);
    return () => clearTimeout(timer);
  }, [logIndex, showResult, log]);

  const handleSkip = () => {
    if (log.length > 0) {
      const last = log[log.length - 1];
      setDisplayPlayerHp(last.playerHp);
      setDisplayOpponentHp(last.opponentHp);
      setLogIndex(log.length - 1);
    }
    setShowResult(true);
  };

  const handleContinue = () => {
    if (!rewardAppliedRef.current && opponent) {
      rewardAppliedRef.current = true;
      const earnedExp = won ? opponent.reward.exp : 0;
      const earnedGold = won ? opponent.reward.gold : 0;
      const earnedCoins = won
        ? opponent.reward.arenaCoins
        : Math.max(1, Math.floor(opponent.reward.arenaCoins * 0.1));

      if (earnedExp > 0) { gainExp(earnedExp); }
      if (earnedGold > 0) { gainGold(earnedGold); }

      const record: BattleRecord = {
        id: `battle_${Date.now()}`,
        opponentId: opponent.id,
        opponentName: opponent.name,
        won,
        earnedExp,
        earnedGold,
        earnedCoins,
        battleLog: log,
        createdAt: Date.now(),
      };
      recordBattle(record);
    }
    navigation.goBack();
  };

  if (!opponent) {
    return (
      <View style={styles.screen}>
        <Text style={styles.errorText}>対戦相手が見つかりません</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>戻る</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentEntry = logIndex >= 0 ? log[logIndex] : null;
  const attackMessage = currentEntry
    ? currentEntry.attacker === 'player'
      ? `${character.name} の攻撃！ ${currentEntry.damage} ダメージ！`
      : `${opponent.name} の攻撃！ ${currentEntry.damage} ダメージ！`
    : 'バトル開始！';

  return (
    <View style={styles.screen}>
      {/* Battle Field */}
      <View style={styles.field}>
        {/* Player Side */}
        <View style={styles.fighter}>
          <Text style={styles.fighterIcon}>⚔</Text>
          <Text style={styles.fighterName} numberOfLines={1}>
            {character.name}
          </Text>
          <Text style={styles.fighterLevel}>Lv.{character.level}</Text>
          <HpBar current={displayPlayerHp} max={playerStats.maxHp} color={Colors.text} />
          <Text style={styles.statsText}>
            ATK {playerStats.attack} / DEF {playerStats.defense}
          </Text>
        </View>

        <View style={styles.vsBlock}>
          <Text style={styles.vsText}>VS</Text>
          <Text style={styles.turnText}>
            {logIndex >= 0 ? `T${log[logIndex].turn}` : ''}
          </Text>
        </View>

        {/* Opponent Side */}
        <View style={styles.fighter}>
          <Text style={styles.fighterIcon}>👹</Text>
          <Text style={styles.fighterName} numberOfLines={1}>
            {opponent.name}
          </Text>
          <Text style={styles.fighterLevel}>Lv.{opponent.level}</Text>
          <HpBar current={displayOpponentHp} max={opponent.hp} color={Colors.text} />
          <Text style={styles.statsText}>
            ATK {opponent.attack} / DEF {opponent.defense}
          </Text>
        </View>
      </View>

      {/* Battle Log */}
      <View style={styles.logBox}>
        <Text style={styles.logText}>{attackMessage}</Text>
      </View>

      {/* Skip Button */}
      {!showResult && (
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>▶▶ スキップ</Text>
        </TouchableOpacity>
      )}

      {/* Result Overlay */}
      {showResult && (
        <View style={styles.resultOverlay}>
          <View style={[styles.resultBox, { borderColor: won ? Colors.gold : Colors.borderDim }]}>
            <Text style={[styles.resultTitle, { color: won ? Colors.gold : Colors.textDim }]}>
              {won ? '★ 勝　利 ★' : '　敗　北　'}
            </Text>

            {won ? (
              <View style={styles.rewardBlock}>
                <Text style={styles.rewardTitle}>＝ 獲得報酬 ＝</Text>
                <Text style={[styles.rewardItem, { color: Colors.green }]}>
                  EXP  +{opponent.reward.exp}
                </Text>
                <Text style={[styles.rewardItem, { color: Colors.gold }]}>
                  GOLD  +{opponent.reward.gold}
                </Text>
                <Text style={[styles.rewardItem, { color: Colors.orange }]}>
                  コイン  +{opponent.reward.arenaCoins}
                </Text>
              </View>
            ) : (
              <View style={styles.rewardBlock}>
                <Text style={styles.defeatNote}>
                  装備を整えて再挑戦しよう
                </Text>
                <Text style={[styles.rewardItem, { color: Colors.orange }]}>
                  コイン  +{Math.max(1, Math.floor(opponent.reward.arenaCoins * 0.1))}（慰め）
                </Text>
              </View>
            )}

            <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
              <Text style={styles.continueBtnText}>続ける</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  fighter: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderWidth: 2,
    borderColor: Colors.borderDim,
    padding: Spacing.sm,
    gap: 4,
    alignItems: 'center',
  },
  fighterIcon: { fontSize: 36 },
  fighterName: {
    fontFamily: Fonts.monoBold,
    fontSize: Fonts.size.xs,
    color: Colors.text,
    textAlign: 'center',
  },
  fighterLevel: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.xs,
    color: Colors.textDim,
  },
  statsText: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.xs,
    color: Colors.textDim,
    textAlign: 'center',
  },
  vsBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    gap: 4,
  },
  vsText: {
    fontFamily: Fonts.monoBold,
    fontSize: Fonts.size.xl,
    color: Colors.border,
  },
  turnText: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.xs,
    color: Colors.textDim,
  },
  logBox: {
    backgroundColor: Colors.bgSecondary,
    borderWidth: 2,
    borderColor: Colors.borderDim,
    padding: Spacing.md,
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logText: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.md,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 22,
  },
  skipBtn: {
    alignSelf: 'center',
    padding: Spacing.sm,
  },
  skipText: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.sm,
    color: Colors.textDim,
    letterSpacing: 1,
  },
  resultOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000cc',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  resultBox: {
    backgroundColor: Colors.bgCard,
    borderWidth: 3,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
    width: '100%',
  },
  resultTitle: {
    fontFamily: Fonts.monoBold,
    fontSize: Fonts.size.xxl,
    letterSpacing: 4,
  },
  rewardBlock: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  rewardTitle: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.sm,
    color: Colors.textDim,
    letterSpacing: 2,
  },
  rewardItem: {
    fontFamily: Fonts.monoBold,
    fontSize: Fonts.size.lg,
  },
  defeatNote: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.sm,
    color: Colors.textDim,
    textAlign: 'center',
  },
  continueBtn: {
    backgroundColor: Colors.border,
    borderWidth: 2,
    borderColor: Colors.border,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
  },
  continueBtnText: {
    fontFamily: Fonts.monoBold,
    fontSize: Fonts.size.md,
    color: Colors.white,
    letterSpacing: 2,
  },
  errorText: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.md,
    color: Colors.textDim,
    textAlign: 'center',
  },
  backText: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.md,
    color: Colors.gold,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});
