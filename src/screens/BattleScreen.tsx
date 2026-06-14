import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useCharacterStore } from '../store/useCharacterStore';
import { useInventoryStore } from '../store/useInventoryStore';
import { useBattleStore } from '../store/useBattleStore';
import {
  calculatePlayerStats,
  executePlayerAction,
  simulateBattleWithSkills,
} from '../utils/battleCalculator';
import { findOpponentById } from '../constants/arenaData';
import { SKILLS } from '../constants/gameData';
import { Colors, Fonts, Spacing } from '../constants/theme';
import { ArenaStackParamList } from '../navigation/ArenaNavigator';
import { BattleLogEntry, BattleRecord, ManualBattleState, SkillId } from '../types';

type Nav = StackNavigationProp<ArenaStackParamList, 'Battle'>;
type Route = RouteProp<ArenaStackParamList, 'Battle'>;

function HpBar({ current, max, color }: { current: number; max: number; color: string }) {
  const pct = Math.max(0, Math.min(100, Math.round((current / max) * 100)));
  return (
    <View style={hpBarStyles.bg}>
      <View
        style={[
          hpBarStyles.fill,
          { width: `${pct}%` as `${number}%`, backgroundColor: pct > 50 ? Colors.green : pct > 25 ? Colors.orange : Colors.red },
        ]}
      />
      <View style={hpBarStyles.overlay}>
        <Text style={[hpBarStyles.text, { color }]}>{current}/{max}</Text>
      </View>
    </View>
  );
}

function MpBar({ current, max }: { current: number; max: number }) {
  const pct = Math.max(0, Math.min(100, Math.round((current / max) * 100)));
  return (
    <View style={hpBarStyles.bg}>
      <View style={[hpBarStyles.fill, { width: `${pct}%` as `${number}%`, backgroundColor: Colors.purple }]} />
      <View style={hpBarStyles.overlay}>
        <Text style={[hpBarStyles.text, { color: Colors.purple }]}>{current}/{max}</Text>
      </View>
    </View>
  );
}

const hpBarStyles = StyleSheet.create({
  bg: { height: 18, backgroundColor: Colors.bgSecondary, borderWidth: 1, borderColor: Colors.borderDim, position: 'relative' },
  fill: { height: '100%', position: 'absolute', left: 0, top: 0 },
  overlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  text: { fontFamily: Fonts.monoBold, fontSize: Fonts.size.xs },
});

function buildLogMessage(entry: BattleLogEntry, playerName: string, opponentName: string): string {
  if (!entry) return 'バトル開始！';
  if (entry.actionType === 'heal' && entry.healAmount) {
    return `${playerName} は回復！ HP +${entry.healAmount}`;
  }
  if (entry.actionType === 'defend') {
    return `${playerName} は防御の構えをとった！`;
  }
  if (entry.actionType === 'skill' && entry.skillUsed) {
    const skill = SKILLS[entry.skillUsed];
    if (entry.damage === 0) {
      return `${playerName} は「${skill?.name ?? entry.skillUsed}」を使った！`;
    }
    return `${playerName} の「${skill?.name ?? entry.skillUsed}」！ ${entry.damage} ダメージ！`;
  }
  if (entry.attacker === 'player') {
    return `${playerName} の攻撃！ ${entry.damage} ダメージ！`;
  }
  return `${opponentName} の攻撃！ ${entry.damage} ダメージ！`;
}

export function BattleScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { opponentId, mode } = route.params;

  const character = useCharacterStore(s => s.character);
  const totalAttack = useInventoryStore(s => s.getTotalAttack());
  const totalDefense = useInventoryStore(s => s.getTotalDefense());
  const gainExp = useCharacterStore(s => s.gainExp);
  const gainGold = useCharacterStore(s => s.gainGold);
  const recordBattle = useBattleStore(s => s.recordBattle);

  const opponent = useMemo(() => findOpponentById(opponentId), [opponentId]);

  const playerStats = useMemo(
    () => calculatePlayerStats(character.level, totalAttack, totalDefense, character.jobId, character.incarnationBonus),
    [character.level, totalAttack, totalDefense, character.jobId, character.incarnationBonus],
  );

  // ===== AUTO MODE =====
  const autoResult = useMemo(() => {
    if (mode !== 'auto' || !opponent) return { won: false, log: [] as BattleLogEntry[] };
    return simulateBattleWithSkills(playerStats, opponent, character.equippedSkills, character.jobId);
  }, [mode, playerStats, opponent, character.equippedSkills, character.jobId]);

  const [logIndex, setLogIndex] = useState(-1);
  const [displayPlayerHp, setDisplayPlayerHp] = useState(playerStats.maxHp);
  const [displayOpponentHp, setDisplayOpponentHp] = useState(opponent?.hp ?? 0);
  const [showResult, setShowResult] = useState(false);
  const rewardAppliedRef = useRef(false);

  useEffect(() => {
    if (mode !== 'auto' || showResult) return;
    const log = autoResult.log;
    const delay = logIndex === -1 ? 800 : 500;
    const timer = setTimeout(() => {
      const next = logIndex + 1;
      if (next >= log.length) { setShowResult(true); return; }
      setDisplayPlayerHp(log[next].playerHp);
      setDisplayOpponentHp(log[next].opponentHp);
      setLogIndex(next);
    }, delay);
    return () => clearTimeout(timer);
  }, [logIndex, showResult, autoResult.log, mode]);

  const handleSkip = () => {
    const log = autoResult.log;
    if (log.length > 0) {
      const last = log[log.length - 1];
      setDisplayPlayerHp(last.playerHp);
      setDisplayOpponentHp(last.opponentHp);
      setLogIndex(log.length - 1);
    }
    setShowResult(true);
  };

  // ===== MANUAL MODE =====
  const [manualState, setManualState] = useState<ManualBattleState>(() => ({
    playerHp: playerStats.maxHp,
    opponentHp: opponent?.hp ?? 0,
    playerMp: playerStats.maxMp,
    turn: 1,
    isPlayerDefending: false,
    log: [],
    isPlayerTurn: true,
    buffPlayerDef: 0,
    debuffOpponentDef: 0,
    poisonTurns: 0,
    hasteTurns: 0,
  }));
  const [showSkillMenu, setShowSkillMenu] = useState(false);
  const manualResultRef = useRef<boolean | null>(null);

  const manualDone = mode === 'manual' && (manualState.playerHp <= 0 || manualState.opponentHp <= 0 || manualState.turn > 30);

  const handleManualAction = useCallback((action: 'attack' | 'skill' | 'defend', skillId?: SkillId) => {
    if (!opponent || !manualState.isPlayerTurn || manualDone) return;
    setShowSkillMenu(false);
    const next = executePlayerAction(action, skillId ?? null, manualState, playerStats, opponent, character.jobId);
    manualResultRef.current = null;
    setManualState(next);
  }, [opponent, manualState, playerStats, character.jobId, manualDone]);

  // 相手ターン自動処理 (manual モード)
  useEffect(() => {
    if (mode !== 'manual' || manualState.isPlayerTurn || manualDone) return;
    // isPlayerTurn = false means opponent just attacked, now back to player
    // executePlayerAction already handles opponent turn and returns isPlayerTurn: true
  }, [mode, manualState.isPlayerTurn, manualDone]);

  const handleManualComplete = () => {
    if (manualDone && !showResult) {
      setShowResult(true);
    }
  };

  useEffect(() => {
    if (mode === 'manual' && manualDone && !showResult) {
      setShowResult(true);
    }
  }, [mode, manualDone, showResult]);

  const handleContinue = () => {
    if (rewardAppliedRef.current || !opponent) { navigation.goBack(); return; }
    rewardAppliedRef.current = true;

    const won = mode === 'auto' ? autoResult.won : manualState.playerHp > 0 && !manualDone || (manualState.opponentHp <= 0);
    const finalWon = mode === 'auto' ? autoResult.won : manualState.opponentHp <= 0;
    const log = mode === 'auto' ? autoResult.log : manualState.log;

    const earnedExp = finalWon ? opponent.reward.exp : 0;
    const earnedGold = finalWon ? opponent.reward.gold : 0;
    const earnedCoins = finalWon
      ? opponent.reward.arenaCoins
      : Math.max(1, Math.floor(opponent.reward.arenaCoins * 0.1));

    if (earnedExp > 0) gainExp(earnedExp);
    if (earnedGold > 0) gainGold(earnedGold);

    const record: BattleRecord = {
      id: `battle_${Date.now()}`,
      opponentId: opponent.id,
      opponentName: opponent.name,
      won: finalWon,
      earnedExp,
      earnedGold,
      earnedCoins,
      battleLog: log,
      createdAt: Date.now(),
    };
    recordBattle(record);
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

  const isAutoMode = mode === 'auto';
  const finalWon = isAutoMode ? autoResult.won : manualState.opponentHp <= 0;
  const finalPlayerHp = isAutoMode ? displayPlayerHp : manualState.playerHp;
  const finalOpponentHp = isAutoMode ? displayOpponentHp : manualState.opponentHp;
  const currentTurn = isAutoMode ? (logIndex >= 0 ? autoResult.log[logIndex]?.turn : 0) : manualState.turn;

  const autoEntry = isAutoMode && logIndex >= 0 ? autoResult.log[logIndex] : null;
  const manualLastEntry = !isAutoMode && manualState.log.length > 0 ? manualState.log[manualState.log.length - 1] : null;
  const logMessage = isAutoMode
    ? (autoEntry ? buildLogMessage(autoEntry, character.name, opponent.name) : 'バトル開始！')
    : (manualLastEntry ? buildLogMessage(manualLastEntry, character.name, opponent.name) : 'バトル開始！');

  return (
    <View style={styles.screen}>
      {/* Battle Field */}
      <View style={styles.field}>
        <View style={styles.fighter}>
          <Text style={styles.fighterIcon}>⚔</Text>
          <Text style={styles.fighterName} numberOfLines={1}>{character.name}</Text>
          <Text style={styles.fighterLevel}>Lv.{character.level}</Text>
          <HpBar current={finalPlayerHp} max={playerStats.maxHp} color={Colors.text} />
          {mode === 'manual' && <MpBar current={manualState.playerMp} max={playerStats.maxMp} />}
          <Text style={styles.statsText}>ATK {playerStats.attack} / DEF {playerStats.defense}</Text>
        </View>

        <View style={styles.vsBlock}>
          <Text style={styles.vsText}>VS</Text>
          <Text style={styles.turnText}>{currentTurn > 0 ? `T${currentTurn}` : ''}</Text>
          {mode === 'manual' && <Text style={styles.modeBadge}>MANUAL</Text>}
        </View>

        <View style={styles.fighter}>
          <Text style={styles.fighterIcon}>👹</Text>
          <Text style={styles.fighterName} numberOfLines={1}>{opponent.name}</Text>
          <Text style={styles.fighterLevel}>Lv.{opponent.level}</Text>
          <HpBar current={finalOpponentHp} max={opponent.hp} color={Colors.text} />
          <Text style={styles.statsText}>ATK {opponent.attack} / DEF {opponent.defense}</Text>
        </View>
      </View>

      {/* Battle Log */}
      <View style={styles.logBox}>
        <Text style={styles.logText}>{logMessage}</Text>
      </View>

      {/* AUTO: Skip button */}
      {isAutoMode && !showResult && (
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>▶▶ スキップ</Text>
        </TouchableOpacity>
      )}

      {/* MANUAL: Action buttons */}
      {!isAutoMode && !showResult && !manualDone && manualState.isPlayerTurn && (
        <View style={styles.actionArea}>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleManualAction('attack')}>
              <Text style={styles.actionBtnLabel}>通常攻撃</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleManualAction('defend')}>
              <Text style={styles.actionBtnLabel}>防御</Text>
              <Text style={styles.actionBtnSub}>(-50%被ダメ)</Text>
            </TouchableOpacity>
          </View>
          {character.equippedSkills.length > 0 && (
            <TouchableOpacity
              style={[styles.skillToggleBtn, showSkillMenu && styles.skillToggleBtnActive]}
              onPress={() => setShowSkillMenu(v => !v)}
            >
              <Text style={styles.skillToggleText}>スキル ▾</Text>
            </TouchableOpacity>
          )}
          {showSkillMenu && (
            <View style={styles.skillMenu}>
              {character.equippedSkills.map(skillId => {
                const skill = SKILLS[skillId];
                const canUse = manualState.playerMp >= skill.mpCost;
                return (
                  <TouchableOpacity
                    key={skillId}
                    style={[styles.skillMenuBtn, !canUse && styles.skillMenuBtnDisabled]}
                    onPress={() => canUse && handleManualAction('skill', skillId as SkillId)}
                    disabled={!canUse}
                  >
                    <Text style={[styles.skillMenuName, !canUse && styles.disabledText]}>{skill.name}</Text>
                    <Text style={[styles.skillMenuMp, !canUse && styles.disabledText]}>MP:{skill.mpCost}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      )}

      {!isAutoMode && !showResult && !manualDone && !manualState.isPlayerTurn && (
        <View style={styles.waitingBox}>
          <Text style={styles.waitingText}>相手のターン...</Text>
        </View>
      )}

      {/* Result Overlay */}
      {showResult && (
        <View style={styles.resultOverlay}>
          <View style={[styles.resultBox, { borderColor: finalWon ? Colors.gold : Colors.borderDim }]}>
            <Text style={[styles.resultTitle, { color: finalWon ? Colors.gold : Colors.textDim }]}>
              {finalWon ? '★ 勝　利 ★' : '　敗　北　'}
            </Text>
            {finalWon ? (
              <View style={styles.rewardBlock}>
                <Text style={styles.rewardTitle}>＝ 獲得報酬 ＝</Text>
                <Text style={[styles.rewardItem, { color: Colors.green }]}>EXP  +{opponent.reward.exp}</Text>
                <Text style={[styles.rewardItem, { color: Colors.gold }]}>GOLD  +{opponent.reward.gold}</Text>
                <Text style={[styles.rewardItem, { color: Colors.orange }]}>コイン  +{opponent.reward.arenaCoins}</Text>
              </View>
            ) : (
              <View style={styles.rewardBlock}>
                <Text style={styles.defeatNote}>装備を整えて再挑戦しよう</Text>
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
  screen: { flex: 1, backgroundColor: Colors.bg, padding: Spacing.lg, gap: Spacing.md },
  field: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginTop: Spacing.md },
  fighter: {
    flex: 1, backgroundColor: Colors.bgCard, borderWidth: 2, borderColor: Colors.borderDim,
    padding: Spacing.sm, gap: 4, alignItems: 'center',
  },
  fighterIcon: { fontSize: 36 },
  fighterName: { fontFamily: Fonts.monoBold, fontSize: Fonts.size.xs, color: Colors.text, textAlign: 'center' },
  fighterLevel: { fontFamily: Fonts.mono, fontSize: Fonts.size.xs, color: Colors.textDim },
  statsText: { fontFamily: Fonts.mono, fontSize: Fonts.size.xs, color: Colors.textDim, textAlign: 'center' },
  vsBlock: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, gap: 4 },
  vsText: { fontFamily: Fonts.monoBold, fontSize: Fonts.size.xl, color: Colors.border },
  turnText: { fontFamily: Fonts.mono, fontSize: Fonts.size.xs, color: Colors.textDim },
  modeBadge: { fontFamily: Fonts.mono, fontSize: Fonts.size.xs, color: Colors.blue },
  logBox: {
    backgroundColor: Colors.bgSecondary, borderWidth: 2, borderColor: Colors.borderDim,
    padding: Spacing.md, minHeight: 60, justifyContent: 'center', alignItems: 'center',
  },
  logText: { fontFamily: Fonts.mono, fontSize: Fonts.size.md, color: Colors.text, textAlign: 'center', lineHeight: 22 },
  skipBtn: { alignSelf: 'center', padding: Spacing.sm },
  skipText: { fontFamily: Fonts.mono, fontSize: Fonts.size.sm, color: Colors.textDim, letterSpacing: 1 },
  actionArea: { gap: Spacing.sm },
  actionRow: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: {
    flex: 1, backgroundColor: Colors.bgCard, borderWidth: 2, borderColor: Colors.border,
    padding: Spacing.sm, alignItems: 'center',
  },
  actionBtnLabel: { fontFamily: Fonts.monoBold, fontSize: Fonts.size.md, color: Colors.text },
  actionBtnSub: { fontFamily: Fonts.mono, fontSize: Fonts.size.xs, color: Colors.textDim },
  skillToggleBtn: {
    backgroundColor: Colors.bgSecondary, borderWidth: 1, borderColor: Colors.borderDim,
    padding: Spacing.sm, alignItems: 'center',
  },
  skillToggleBtnActive: { borderColor: Colors.blue },
  skillToggleText: { fontFamily: Fonts.mono, fontSize: Fonts.size.sm, color: Colors.text },
  skillMenu: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  skillMenuBtn: {
    flex: 1, minWidth: '30%', backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.blue,
    padding: Spacing.xs, alignItems: 'center',
  },
  skillMenuBtnDisabled: { borderColor: Colors.borderDim },
  skillMenuName: { fontFamily: Fonts.monoBold, fontSize: Fonts.size.xs, color: Colors.text },
  skillMenuMp: { fontFamily: Fonts.mono, fontSize: Fonts.size.xs, color: Colors.purple },
  disabledText: { color: Colors.textDim },
  waitingBox: { alignItems: 'center', padding: Spacing.md },
  waitingText: { fontFamily: Fonts.mono, fontSize: Fonts.size.sm, color: Colors.textDim },
  resultOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#000000cc', justifyContent: 'center', alignItems: 'center', padding: Spacing.xl,
  },
  resultBox: {
    backgroundColor: Colors.bgCard, borderWidth: 3, padding: Spacing.xl,
    alignItems: 'center', gap: Spacing.md, width: '100%',
  },
  resultTitle: { fontFamily: Fonts.monoBold, fontSize: Fonts.size.xxl, letterSpacing: 4 },
  rewardBlock: { alignItems: 'center', gap: Spacing.sm },
  rewardTitle: { fontFamily: Fonts.mono, fontSize: Fonts.size.sm, color: Colors.textDim, letterSpacing: 2 },
  rewardItem: { fontFamily: Fonts.monoBold, fontSize: Fonts.size.lg },
  defeatNote: { fontFamily: Fonts.mono, fontSize: Fonts.size.sm, color: Colors.textDim, textAlign: 'center' },
  continueBtn: {
    backgroundColor: Colors.border, borderWidth: 2, borderColor: Colors.border,
    paddingVertical: Spacing.sm, paddingHorizontal: Spacing.xl,
  },
  continueBtnText: { fontFamily: Fonts.monoBold, fontSize: Fonts.size.md, color: Colors.white, letterSpacing: 2 },
  errorText: { fontFamily: Fonts.mono, fontSize: Fonts.size.md, color: Colors.textDim, textAlign: 'center' },
  backText: { fontFamily: Fonts.mono, fontSize: Fonts.size.md, color: Colors.gold, textAlign: 'center', marginTop: Spacing.md },
});
