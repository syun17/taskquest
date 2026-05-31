import React from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { useQuestStore } from '../store/useQuestStore';
import { useCharacterStore } from '../store/useCharacterStore';
import { DifficultyBadge } from '../components/common/DifficultyBadge';
import { GuildButton } from '../components/common/GuildButton';
import { PixelBorder } from '../components/common/PixelBorder';
import { Colors, Fonts, Spacing } from '../constants/theme';
import { Quest } from '../types';

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
  const character = useCharacterStore(s => s.character);
  const save = useCharacterStore(s => s.save);

  const handleComplete = (quest: Quest) => {
    Alert.alert(
      'クエスト完了報告',
      `「${quest.title}」を達成しましたか？\n\n報酬を受け取ります:\n EXP +${quest.reward.exp}\n Gold +${quest.reward.gold}`,
      [
        { text: 'まだ', style: 'cancel' },
        {
          text: '報告する！',
          onPress: () => {
            const reward = completeQuest(quest.id);
            if (reward) {
              gainExp(reward.exp);
              gainGold(reward.gold);
              const updated = { ...character, completedQuests: character.completedQuests + 1 };
              save(updated);
              Alert.alert(
                '✨ クエスト達成！',
                `EXP +${reward.exp}\nGold +${reward.gold}\n\nよくやった、冒険者よ！`,
              );
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
        { text: '放棄する', style: 'destructive', onPress: () => abandonQuest(quest.id) },
      ],
    );
  };

  const now = Date.now();

  return (
    <View style={styles.screen}>
      <Text style={styles.header}>【 進行中クエスト 】</Text>

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
            <PixelBorder style={styles.questCard} color={Colors.orange}>
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
                  <Text style={styles.rewardText}>EXP +{item.reward.exp}</Text>
                  <Text style={[styles.rewardText, { color: Colors.gold }]}>
                    Gold +{item.reward.gold}
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
    color: Colors.gold,
    textAlign: 'center',
    letterSpacing: 2,
    padding: Spacing.lg,
    paddingBottom: Spacing.sm,
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
    color: Colors.orange,
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
    color: Colors.green,
  },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  smallBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
});
