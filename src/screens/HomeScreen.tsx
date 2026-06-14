import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { useCharacterStore } from '../store/useCharacterStore';
import { useQuestStore } from '../store/useQuestStore';
import { useInventoryStore } from '../store/useInventoryStore';
import { PixelBorder } from '../components/common/PixelBorder';
import { ExpBar } from '../components/common/ExpBar';
import { Colors, Fonts, Spacing } from '../constants/theme';

export function HomeScreen() {
  const character = useCharacterStore(s => s.character);
  const quests = useQuestStore(s => s.quests);
  const activeQuests = quests.filter(q => q.status === 'active');
  const completedQuests = quests.filter(q => q.status === 'completed');

  const items = useInventoryStore(s => s.items);
  const totalAttack = items.filter(i => i.equipped).reduce((sum, i) => sum + (i.attack ?? 0), 0);
  const totalDefense = items.filter(i => i.equipped).reduce((sum, i) => sum + (i.defense ?? 0), 0);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.header}>【 ギルドホーム 】</Text>

      {/* Character Status */}
      <PixelBorder style={styles.card}>
        <View style={styles.characterNameRow}>
          <Image source={require('../assets/icons/sword.png')} style={styles.characterNameIcon} />
          <Text style={styles.characterName}>{character.name}</Text>
        </View>
        <Text style={styles.title}>{character.title}</Text>
        <View style={styles.divider} />
        <ExpBar
          exp={character.exp}
          expToNext={character.expToNext}
          level={character.level}
        />
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>GUILD</Text>
            <Text style={styles.statValue}>{character.guildRank}ランク</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>GOLD</Text>
            <Text style={[styles.statValue, { color: Colors.gold }]}>
              {character.gold.toLocaleString()}G
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>QUEST</Text>
            <Text style={styles.statValue}>{character.completedQuests}件</Text>
          </View>
        </View>
      </PixelBorder>

      {/* Battle Stats */}
      <PixelBorder style={styles.card} color={Colors.borderDim}>
        <Text style={styles.sectionTitle}>▶ 戦闘ステータス</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>ATK</Text>
            <Text style={[styles.statValue, { color: Colors.red }]}>
              {totalAttack}
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>DEF</Text>
            <Text style={[styles.statValue, { color: Colors.blue }]}>
              {totalDefense}
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>RANK</Text>
            <Text style={styles.statValue}>{character.guildRank}</Text>
          </View>
        </View>
      </PixelBorder>

      {/* Quest Summary */}
      <PixelBorder style={styles.card} color={Colors.borderDim}>
        <Text style={styles.sectionTitle}>▶ クエスト状況</Text>
        <View style={styles.questSummary}>
          <View style={styles.questStat}>
            <Text style={styles.questCount}>{activeQuests.length}</Text>
            <Text style={styles.questLabel}>進行中</Text>
          </View>
          <Text style={styles.questDivider}>|</Text>
          <View style={styles.questStat}>
            <Text style={styles.questCount}>{completedQuests.length}</Text>
            <Text style={styles.questLabel}>達成済み</Text>
          </View>
        </View>
      </PixelBorder>

      {/* Guild Notice Board */}
      <PixelBorder style={styles.card}>
        <View style={styles.noticeTitleRow}>
          <Image source={require('../assets/icons/scroll.png')} style={styles.noticeTitleIcon} />
          <Text style={styles.noticeBoardTitle}>ギルド掲示板からのお知らせ</Text>
        </View>
        <Text style={styles.noticeText}>
          {character.completedQuests === 0
            ? '冒険者よ、まずは手始めにクエストを受注してみよう！'
            : character.completedQuests < 5
            ? `クエスト${character.completedQuests}件達成！まだまだ始まりだ。`
            : character.completedQuests < 10
            ? 'ランクアップまでもう少し！クエストに励め！'
            : '優秀な冒険者よ！ギルドの誇りだ！'}
        </Text>
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
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: Spacing.xs,
  },
  card: { gap: Spacing.sm },
  characterNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  characterNameIcon: { width: 20, height: 20, resizeMode: 'contain' },
  characterName: {
    fontFamily: Fonts.monoBold,
    fontSize: Fonts.size.xl,
    color: Colors.white,
  },
  title: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.sm,
    color: Colors.gold,
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderDim,
    marginVertical: Spacing.xs,
  },
  sectionTitle: {
    fontFamily: Fonts.monoBold,
    fontSize: Fonts.size.md,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.sm,
  },
  stat: { alignItems: 'center', gap: 2 },
  statLabel: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.xs,
    color: Colors.textDim,
    letterSpacing: 1,
  },
  statValue: {
    fontFamily: Fonts.monoBold,
    fontSize: Fonts.size.lg,
    color: Colors.text,
  },
  questSummary: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  questStat: { alignItems: 'center', gap: 2 },
  questCount: {
    fontFamily: Fonts.monoBold,
    fontSize: Fonts.size.xxl,
    color: Colors.text,
  },
  questLabel: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.xs,
    color: Colors.textDim,
  },
  questDivider: {
    color: Colors.borderDim,
    fontSize: Fonts.size.xxl,
  },
  noticeTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.sm },
  noticeTitleIcon: { width: 18, height: 18, resizeMode: 'contain' },
  noticeBoardTitle: {
    fontFamily: Fonts.monoBold,
    fontSize: Fonts.size.sm,
    color: Colors.text,
  },
  noticeText: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.sm,
    color: Colors.text,
    lineHeight: 20,
  },
});
