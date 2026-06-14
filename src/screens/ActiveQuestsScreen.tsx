import React from 'react';
import { View, Text, Image, FlatList, StyleSheet, Alert } from 'react-native';
import { useQuestStore } from '../store/useQuestStore';
import { useCharacterStore, getStreakMultiplier } from '../store/useCharacterStore';
import { useAchievementStore } from '../store/useAchievementStore';
import { useDailyQuestStore } from '../store/useDailyQuestStore';
import { ACHIEVEMENTS, AchievementId } from '../constants/achievementData';
import { DifficultyBadge } from '../components/common/DifficultyBadge';
import { GuildButton } from '../components/common/GuildButton';
import { PixelBorder } from '../components/common/PixelBorder';
import { Colors, Fonts, Spacing } from '../constants/theme';
import { Quest } from '../types';

function tryUnlock(id: AchievementId, titleSetter?: (t: string) => void) {
  const unlocked = useAchievementStore.getState().unlock(id);
  if (!unlocked) return;
  const ach = ACHIEVEMENTS[id];
  setTimeout(() => {
    Alert.alert('🏆 実績解除！', `「${ach.name}」\n${ach.description}`);
    if (ach.unlocksTitle && titleSetter) titleSetter(ach.unlocksTitle);
  }, 500);
}

function formatElapsed(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}日経過`;
  if (hours > 0) return `${hours}時間経過`;
  return `${minutes}分経過`;
}

export function ActiveQuestsScreen() {
  const quests = useQuestStore(s => s.quests);
  const activeQuests = quests.filter(q => q.status === 'active');
  const completeQuest = useQuestStore(s => s.completeQuest);
  const abandonQuest = useQuestStore(s => s.abandonQuest);
  const gainExp = useCharacterStore(s => s.gainExp);
  const gainGold = useCharacterStore(s => s.gainGold);
  const incrementCompletedQuests = useCharacterStore(s => s.incrementCompletedQuests);
  const incrementStreak = useCharacterStore(s => s.incrementStreak);
  const resetStreak = useCharacterStore(s => s.resetStreak);
  const setTitle = useCharacterStore(s => s.setTitle);
  const questStreak = useCharacterStore(s => s.character.questStreak);
  const completedQuests = useCharacterStore(s => s.character.completedQuests);

  const multiplier = getStreakMultiplier(questStreak);
  const bonusPct = Math.round((multiplier - 1) * 100);

  const handleComplete = (quest: Quest) => {
    const baseExp = quest.reward.exp;
    const baseGold = quest.reward.gold;
    const finalExp = Math.floor(baseExp * multiplier);
    const finalGold = Math.floor(baseGold * multiplier);

    const bonusNote = multiplier > 1
      ? `\n🔥 ストリーク x${questStreak + 1} ボーナス (+${bonusPct}%)`
      : '';

    Alert.alert(
      'クエスト完了報告',
      `「${quest.title}」を達成しましたか？\n\n報酬を受け取ります:\n EXP +${finalExp}\n Gold +${finalGold}${bonusNote}`,
      [
        { text: 'まだ', style: 'cancel' },
        {
          text: '報告する！',
          onPress: () => {
            const reward = completeQuest(quest.id);
            if (reward) {
              gainExp(finalExp);
              gainGold(finalGold);
              incrementCompletedQuests();
              incrementStreak();
              Alert.alert(
                '✨ クエスト達成！',
                `EXP +${finalExp}\nGold +${finalGold}${bonusNote}\n\nよくやった、冒険者よ！`,
              );
              // 実績チェック
              const newCount = completedQuests + 1;
              const newStreak = questStreak + 1;
              if (newCount === 1) tryUnlock('first_quest', setTitle);
              if (newCount === 10) tryUnlock('quest_10', setTitle);
              if (newCount === 50) tryUnlock('quest_50', setTitle);
              if (newCount === 100) tryUnlock('quest_100', setTitle);
              if (newStreak >= 3) tryUnlock('streak_3', setTitle);
              if (newStreak >= 10) tryUnlock('streak_10', setTitle);
              // デイリークエスト進捗
              const dailyStore = useDailyQuestStore.getState();
              const dailyRewards = [
                ...dailyStore.recordGoalEvent('complete_any_quest'),
                ...dailyStore.recordGoalEvent('complete_2_quests'),
                ...dailyStore.recordGoalEvent('complete_3_quests'),
                ...dailyStore.recordGoalEvent('complete_f_rank', { difficulty: quest.difficulty }),
                ...dailyStore.recordGoalEvent('complete_d_rank_or_higher', { difficulty: quest.difficulty }),
              ];
              for (const r of dailyRewards) {
                gainExp(r.exp);
                gainGold(r.gold);
                setTimeout(() => {
                  Alert.alert('📅 デイリークエスト達成！', `EXP +${r.exp}  Gold +${r.gold}`);
                }, 800);
              }
            }
          },
        },
      ],
    );
  };

  const handleAbandon = (quest: Quest) => {
    Alert.alert(
      'クエスト放棄',
      `「${quest.title}」を放棄しますか？\nクエストは掲示板に戻ります。`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '放棄する',
          style: 'destructive',
          onPress: () => {
            abandonQuest(quest.id);
            resetStreak();
          },
        },
      ],
    );
  };

  const now = Date.now();

  return (
    <View style={styles.screen}>
      <Text style={styles.header}>【 進行中クエスト 】</Text>

      {/* ストリークバナー */}
      {questStreak > 0 && (
        <View style={styles.streakBanner}>
          <Image source={require('../assets/icons/flame.png')} style={styles.streakFlameImg} />
          <Text style={styles.streakCount}>STREAK x{questStreak}</Text>
          {multiplier > 1 && (
            <Text style={styles.streakBonus}>+{bonusPct}% EXP/Gold</Text>
          )}
        </View>
      )}

      {activeQuests.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>進行中のクエストはない</Text>
          <Text style={styles.emptySubText}>掲示板からクエストを受注しよう</Text>
        </View>
      ) : (
        <FlatList
          data={activeQuests}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <PixelBorder style={styles.questCard}>
              <View style={styles.questHeader}>
                <DifficultyBadge difficulty={item.difficulty} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.questTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.elapsed}>
                    {item.acceptedAt ? formatElapsed(now - item.acceptedAt) : ''}
                  </Text>
                </View>
              </View>
              {item.description ? (
                <Text style={styles.questDesc} numberOfLines={2}>{item.description}</Text>
              ) : null}
              <View style={styles.questFooter}>
                <View style={styles.rewards}>
                  <Text style={styles.rewardText}>
                    EXP +{Math.floor(item.reward.exp * multiplier)}
                    {multiplier > 1 ? <Text style={styles.bonusTag}> x{multiplier}</Text> : null}
                  </Text>
                  <Text style={[styles.rewardText, { color: Colors.gold }]}>
                    Gold +{Math.floor(item.reward.gold * multiplier)}
                    {multiplier > 1 ? <Text style={styles.bonusTag}> x{multiplier}</Text> : null}
                  </Text>
                </View>
                <View style={styles.actions}>
                  <GuildButton
                    label="放棄"
                    variant="ghost"
                    onPress={() => handleAbandon(item)}
                    style={styles.smallBtn}
                  />
                  <GuildButton
                    label="報告！"
                    variant="primary"
                    onPress={() => handleComplete(item)}
                    style={styles.smallBtn}
                  />
                </View>
              </View>
            </PixelBorder>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  header: {
    fontFamily: Fonts.monoBold,
    fontSize: Fonts.size.xl,
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: 2,
    padding: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.orange + '22',
    borderWidth: 1,
    borderColor: Colors.orange + '66',
    paddingVertical: Spacing.xs,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  streakFlameImg: { width: 22, height: 22, resizeMode: 'contain' },
  streakCount: {
    fontFamily: Fonts.monoBold,
    fontSize: Fonts.size.md,
    color: Colors.orange,
    letterSpacing: 1,
  },
  streakBonus: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.sm,
    color: Colors.orange,
  },
  list: { padding: Spacing.lg, gap: Spacing.sm, paddingTop: 0 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  emptyText: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.lg,
    color: Colors.textDim,
  },
  emptySubText: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.sm,
    color: Colors.textDim,
  },
  questCard: { gap: Spacing.sm },
  questHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  questTitle: {
    fontFamily: Fonts.monoBold,
    fontSize: Fonts.size.md,
    color: Colors.text,
  },
  elapsed: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.xs,
    color: Colors.textDim,
  },
  questDesc: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.sm,
    color: Colors.textDim,
    lineHeight: 18,
  },
  questFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rewards: { gap: 2 },
  rewardText: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.xs,
    color: Colors.textDim,
  },
  bonusTag: {
    fontFamily: Fonts.monoBold,
    fontSize: Fonts.size.xs,
    color: Colors.orange,
  },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  smallBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
});
