import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { useCharacterStore } from '../store/useCharacterStore';
import { useInventoryStore } from '../store/useInventoryStore';
import { useAchievementStore } from '../store/useAchievementStore';
import { ACHIEVEMENTS, ACHIEVEMENT_LIST, AchievementId } from '../constants/achievementData';
import { PixelBorder } from '../components/common/PixelBorder';
import { ExpBar } from '../components/common/ExpBar';
import { RarityBadge } from '../components/common/RarityBadge';
import { GuildButton } from '../components/common/GuildButton';
import { Colors, Fonts, Spacing } from '../constants/theme';
import { Item, ItemRarity, JobId, SkillId } from '../types';
import { calculatePlayerStats } from '../utils/battleCalculator';
import { JOB_DATA, SKILLS } from '../constants/gameData';
import { JobSelectScreen } from './JobSelectScreen';
import { SkillTreeScreen } from './SkillTreeScreen';

const JOB_ICONS: Record<JobId, ReturnType<typeof require>> = {
  warrior: require('../assets/icons/sword.png'),
  mage:    require('../assets/icons/orb.png'),
  rogue:   require('../assets/icons/dagger.png'),
  priest:  require('../assets/icons/star.png'),
};

const ACH_ICONS: Record<AchievementId, ReturnType<typeof require>> = {
  first_quest:       require('../assets/icons/scroll.png'),
  quest_10:          require('../assets/icons/scroll.png'),
  quest_50:          require('../assets/icons/scroll.png'),
  quest_100:         require('../assets/icons/arena.png'),
  streak_3:          require('../assets/icons/flame.png'),
  streak_10:         require('../assets/icons/flame.png'),
  first_battle_win:  require('../assets/icons/sword.png'),
  battle_10_wins:    require('../assets/icons/shield.png'),
  arena_gold_rank:   require('../assets/icons/crown.png'),
  arena_legend_rank: require('../assets/icons/crown.png'),
  get_legendary:     require('../assets/icons/star.png'),
  incarnate_once:    require('../assets/icons/gem.png'),
  guild_rank_c:      require('../assets/icons/gem.png'),
  guild_rank_a:      require('../assets/icons/gem.png'),
  guild_rank_s:      require('../assets/icons/star.png'),
};

const TYPE_LABELS: Record<string, string> = {
  weapon: '武器',
  armor: '防具',
  accessory: 'アクセ',
  consumable: '消耗品',
};

const RARITY_LABELS: Record<ItemRarity, string> = {
  common: 'COMMON',
  rare: 'RARE',
  epic: 'EPIC',
  legendary: 'LEGENDARY',
};

const RARITY_NEXT: Partial<Record<ItemRarity, ItemRarity>> = {
  common: 'rare',
  rare: 'epic',
  epic: 'legendary',
};

interface SynthesisGroup {
  itemName: string;
  rarity: ItemRarity;
  count: number;
  type: string;
}

export function CharacterScreen() {
  const character = useCharacterStore(s => s.character);
  const isLoaded = useCharacterStore(s => s.isLoaded);
  const items = useInventoryStore(s => s.items);
  const equipItem = useInventoryStore(s => s.equipItem);
  const unequipItem = useInventoryStore(s => s.unequipItem);
  const sellItem = useInventoryStore(s => s.sellItem);
  const synthesizeItems = useInventoryStore(s => s.synthesizeItems);
  const gainGold = useCharacterStore(s => s.gainGold);
  const unlockSkill = useCharacterStore(s => s.unlockSkill);
  const equipSkill = useCharacterStore(s => s.equipSkill);
  const unequipSkill = useCharacterStore(s => s.unequipSkill);
  const setJob = useCharacterStore(s => s.setJob);
  const setTitle = useCharacterStore(s => s.setTitle);
  const incarnate = useCharacterStore(s => s.incarnate);

  function tryUnlockChar(id: AchievementId) {
    const unlocked = useAchievementStore.getState().unlock(id);
    if (!unlocked) return;
    const ach = ACHIEVEMENTS[id];
    setTimeout(() => {
      Alert.alert('🏆 実績解除！', `「${ach.name}」\n${ach.description}`);
      if (ach.unlocksTitle) setTitle(ach.unlocksTitle);
    }, 500);
  }

  const totalAttack = items.filter(i => i.equipped).reduce((sum, i) => sum + (i.attack ?? 0), 0);
  const totalDefense = items.filter(i => i.equipped).reduce((sum, i) => sum + (i.defense ?? 0), 0);
  const battleStats = calculatePlayerStats(character.level, totalAttack, totalDefense, character.jobId, character.incarnationBonus);

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showSkillTree, setShowSkillTree] = useState(false);
  const [showJobSelect, setShowJobSelect] = useState(false);
  const [showReincarnateConfirm, setShowReincarnateConfirm] = useState(false);

  // ギルドランク実績チェック
  useEffect(() => {
    if (!isLoaded) return;
    if (character.guildRank === 'C') tryUnlockChar('guild_rank_c');
    if (character.guildRank === 'A') tryUnlockChar('guild_rank_a');
    if (character.guildRank === 'S') tryUnlockChar('guild_rank_s');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character.guildRank, isLoaded]);

  // 初回: 職業が未選択の場合に自動的に選択モーダルを開く
  useEffect(() => {
    if (isLoaded && character.jobId === null) {
      setShowJobSelect(true);
    }
  }, [isLoaded]);

  const synthesisGroups: SynthesisGroup[] = React.useMemo(() => {
    const groupMap = new Map<string, SynthesisGroup>();
    for (const item of items) {
      if (item.rarity === 'legendary') continue;
      if (item.equipped) continue;
      const key = `${item.name}__${item.rarity}`;
      const existing = groupMap.get(key);
      if (existing) {
        existing.count++;
      } else {
        groupMap.set(key, { itemName: item.name, rarity: item.rarity, count: 1, type: item.type });
      }
    }
    return Array.from(groupMap.values()).filter(g => g.count >= 4);
  }, [items]);

  const handleSell = (item: Item) => {
    if (item.equipped) {
      Alert.alert('エラー', '装備中のアイテムは売却できません');
      return;
    }
    const SELL_PRICES: Record<string, number> = {
      common: 15, rare: 60, epic: 200, legendary: 800,
    };
    const price = SELL_PRICES[item.rarity];
    Alert.alert(
      'アイテム売却',
      `「${item.name}」を${price}Gで売却しますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '売却',
          onPress: () => {
            const gold = sellItem(item.id);
            gainGold(gold);
            setSelectedItem(null);
            Alert.alert('売却完了', `${gold}G を入手した！`);
          },
        },
      ],
    );
  };

  const handleSynthesize = (group: SynthesisGroup) => {
    const nextRarity = RARITY_NEXT[group.rarity];
    if (!nextRarity) return;
    Alert.alert(
      '装備合成',
      `「${group.itemName}」(${RARITY_LABELS[group.rarity]}) を4個合成して\n${RARITY_LABELS[nextRarity]}アイテムを作成しますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '合成する',
          onPress: () => {
            const result = synthesizeItems(group.itemName, group.rarity);
            if (result) {
              Alert.alert('合成成功！', `${RARITY_LABELS[result.rarity]} 「${result.name}」 を入手した！`);
            } else {
              Alert.alert('合成失敗', '合成できませんでした');
            }
          },
        },
      ],
    );
  };

  const handleSelectJob = (jobId: JobId) => {
    const isInitial = character.jobId === null;
    if (!isInitial && character.gold < JOB_DATA[jobId].changeCost) {
      Alert.alert('ゴールド不足', '500G が必要です');
      return;
    }
    Alert.alert(
      '職業選択',
      isInitial
        ? `「${JOB_DATA[jobId].name}」を選びますか？`
        : `「${JOB_DATA[jobId].name}」に変更しますか？(500G消費)`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '確定',
          onPress: () => {
            setJob(jobId);
            setShowJobSelect(false);
          },
        },
      ],
    );
  };

  const handleIncarnate = () => {
    if (character.level < 50) {
      Alert.alert('転生不可', 'レベル50以上で転生できます');
      return;
    }
    Alert.alert(
      '転生確認',
      `転生するとLv1に戻り、ゴールドがリセットされます。\n装備・スキルは維持されます。\n\n転生ボーナス: ATK+5, DEF+3 が永続的に加算されます。\n\n(転生回数: ${character.incarnationCount}回 → ${character.incarnationCount + 1}回)\n\n本当に転生しますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '転生する',
          style: 'destructive',
          onPress: () => {
            incarnate();
            Alert.alert('転生成功！', '新たな冒険の始まりです！');
            tryUnlockChar('incarnate_once');
          },
        },
      ],
    );
  };

  const currentJob = character.jobId ? JOB_DATA[character.jobId] : null;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.header}>【 キャラクター 】</Text>

      {/* Character Info */}
      <PixelBorder style={styles.card}>
        <View style={styles.charHeader}>
          <View style={styles.avatar}>
            <Image source={JOB_ICONS[character.jobId ?? 'warrior']} style={styles.avatarImage} />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.charName}>{character.name}</Text>
            <Text style={styles.charTitle}>{character.title}</Text>
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>ギルドランク {character.guildRank}</Text>
            </View>
          </View>
        </View>

        <ExpBar exp={character.exp} expToNext={character.expToNext} level={character.level} />

        <View style={styles.goldQuestRow}>
          <View style={styles.infoChip}>
            <Text style={styles.infoChipLabel}>GOLD</Text>
            <Text style={[styles.infoChipValue, { color: Colors.gold }]}>{character.gold.toLocaleString()}G</Text>
          </View>
          <View style={styles.infoChip}>
            <Text style={styles.infoChipLabel}>QUEST</Text>
            <Text style={styles.infoChipValue}>{character.completedQuests}件</Text>
          </View>
          <View style={styles.infoChip}>
            <Text style={styles.infoChipLabel}>転生</Text>
            <Text style={styles.infoChipValue}>{character.incarnationCount}回</Text>
          </View>
        </View>
        <View style={styles.goldQuestRow}>
          <View style={styles.infoChip}>
            <Text style={styles.infoChipLabel}>STREAK</Text>
            <Text style={[styles.infoChipValue, { color: Colors.orange }]}>{character.questStreak}連</Text>
          </View>
          <View style={styles.infoChip}>
            <Text style={styles.infoChipLabel}>BEST</Text>
            <Text style={[styles.infoChipValue, { color: Colors.textDim }]}>{character.maxQuestStreak}連</Text>
          </View>
        </View>

        <Text style={styles.statsTitle}>◆ BATTLE STATUS ◆</Text>
        <View style={styles.statsGrid}>
          {[
            { label: 'HP', value: String(battleStats.maxHp), color: Colors.green },
            { label: 'MP', value: String(battleStats.maxMp), color: Colors.purple },
            { label: 'ATK', value: String(battleStats.attack), color: Colors.red },
            { label: 'DEF', value: String(battleStats.defense), color: Colors.blue },
            { label: 'SPD', value: String(battleStats.speed), color: Colors.gold },
            { label: 'SP', value: String(character.skillPoints), color: Colors.green },
          ].map(stat => (
            <View key={stat.label} style={styles.statBox}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            </View>
          ))}
        </View>

        {character.incarnationBonus.atkBonus > 0 && (
          <Text style={styles.incarnationBonusText}>
            転生ボーナス: ATK+{character.incarnationBonus.atkBonus} DEF+{character.incarnationBonus.defBonus}
          </Text>
        )}
      </PixelBorder>

      {/* Job Section */}
      <Text style={styles.sectionHeader}>【 職業 】</Text>
      <PixelBorder style={styles.card}>
        {currentJob ? (
          <View style={styles.jobRow}>
            <Image source={JOB_ICONS[currentJob.id]} style={styles.jobIconImage} />
            <View style={{ flex: 1 }}>
              <Text style={styles.jobName}>{currentJob.name}</Text>
              <Text style={styles.jobDesc}>{currentJob.description}</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.noJobText}>職業未選択</Text>
        )}
        <GuildButton
          label={currentJob ? '職業を変更する (500G)' : '職業を選ぶ（無料）'}
          onPress={() => setShowJobSelect(true)}
          variant="ghost"
        />
      </PixelBorder>

      {/* Skills Section */}
      <Text style={styles.sectionHeader}>【 スキル 】</Text>
      <PixelBorder style={styles.card}>
        <View style={styles.skillSlots}>
          {[0, 1, 2].map(i => {
            const skillId = character.equippedSkills[i] as SkillId | undefined;
            const skill = skillId ? SKILLS[skillId] : null;
            return (
              <View key={i} style={[styles.skillSlot, skill && styles.skillSlotFilled]}>
                {skill ? (
                  <>
                    <Text style={styles.skillSlotName}>{skill.name}</Text>
                    <Text style={styles.skillSlotMp}>MP:{skill.mpCost}</Text>
                  </>
                ) : (
                  <Text style={styles.skillSlotEmpty}>---</Text>
                )}
              </View>
            );
          })}
        </View>
        <GuildButton
          label="スキルツリーを開く"
          onPress={() => setShowSkillTree(true)}
          variant="primary"
        />
      </PixelBorder>

      {/* Reincarnation */}
      <Text style={styles.sectionHeader}>【 転生 】</Text>
      <PixelBorder style={styles.card}>
        <Text style={styles.incarnateDesc}>
          Lv50 に達すると転生できます。{'\n'}
          転生後はLv1に戻りますが、永続的なステータスボーナスを得ます。
        </Text>
        <GuildButton
          label={character.level >= 50 ? '転生する' : `転生まで: Lv${50 - character.level}不足`}
          onPress={handleIncarnate}
          disabled={character.level < 50}
          variant={character.level >= 50 ? 'danger' : 'ghost'}
        />
      </PixelBorder>

      {/* Inventory */}
      <Text style={styles.sectionHeader}>【 所持アイテム 】</Text>
      {items.length === 0 ? (
        <PixelBorder color={Colors.borderDim}>
          <Text style={styles.emptyText}>アイテムなし。ガチャで入手しよう！</Text>
        </PixelBorder>
      ) : (
        <View style={styles.itemGrid}>
          {items.map(item => (
            <TouchableOpacity
              key={item.id}
              onPress={() => setSelectedItem(item)}
              style={[styles.itemSlot, item.equipped && styles.itemSlotEquipped]}
            >
              <RarityBadge rarity={item.rarity} />
              <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.itemType}>{TYPE_LABELS[item.type]}</Text>
              {item.equipped && <Text style={styles.equippedLabel}>装備中</Text>}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Synthesis */}
      {synthesisGroups.length > 0 && (
        <>
          <Text style={styles.sectionHeader}>【 装備合成 】</Text>
          <PixelBorder style={styles.synthesisCard}>
            <Text style={styles.synthesisNote}>同じ装備を4個合成してレアリティアップ！</Text>
            {synthesisGroups.map(group => {
              const nextRarity = RARITY_NEXT[group.rarity];
              return (
                <View key={`${group.itemName}__${group.rarity}`} style={styles.synthesisRow}>
                  <View style={styles.synthesisInfo}>
                    <RarityBadge rarity={group.rarity} />
                    <View style={styles.synthesisTextBlock}>
                      <Text style={styles.synthesisItemName}>{group.itemName}</Text>
                      <Text style={styles.synthesisCount}>
                        {group.count}個所持 → {nextRarity ? RARITY_LABELS[nextRarity] : ''}へ
                      </Text>
                    </View>
                  </View>
                  <GuildButton
                    label="合成"
                    variant="primary"
                    onPress={() => handleSynthesize(group)}
                    style={styles.synthesisBtn}
                    disabled={group.count < 4}
                  />
                </View>
              );
            })}
          </PixelBorder>
        </>
      )}

      {/* Item Detail Modal */}
      <Modal visible={!!selectedItem} transparent animationType="fade">
        <View style={styles.modalBg}>
          {selectedItem && (
            <PixelBorder style={styles.modal} color={Colors.gold}>
              <View style={styles.modalHeader}>
                <RarityBadge rarity={selectedItem.rarity} showLabel />
                <Text style={styles.modalItemName}>{selectedItem.name}</Text>
              </View>
              <Text style={styles.modalItemDesc}>{selectedItem.description}</Text>
              <View style={styles.modalStats}>
                {selectedItem.attack !== undefined && selectedItem.attack > 0 && (
                  <Text style={[styles.modalStat, { color: Colors.red }]}>ATK +{selectedItem.attack}</Text>
                )}
                {selectedItem.defense !== undefined && selectedItem.defense > 0 && (
                  <Text style={[styles.modalStat, { color: Colors.blue }]}>DEF +{selectedItem.defense}</Text>
                )}
              </View>
              <View style={styles.modalActions}>
                <GuildButton label="閉じる" variant="ghost" onPress={() => setSelectedItem(null)} style={{ flex: 1 }} />
                <GuildButton
                  label={selectedItem.equipped ? '外す' : '装備する'}
                  variant="primary"
                  onPress={() => {
                    if (selectedItem.equipped) unequipItem(selectedItem.id);
                    else equipItem(selectedItem.id);
                    setSelectedItem(null);
                  }}
                  style={{ flex: 1 }}
                />
                <GuildButton
                  label="売却"
                  variant="danger"
                  onPress={() => handleSell(selectedItem)}
                  disabled={selectedItem.equipped}
                  style={{ flex: 1 }}
                />
              </View>
            </PixelBorder>
          )}
        </View>
      </Modal>

      {/* Job Select Modal */}
      <Modal visible={showJobSelect} transparent={false} animationType="slide">
        <JobSelectScreen
          onSelect={handleSelectJob}
          onClose={() => {
            if (character.jobId !== null) setShowJobSelect(false);
          }}
          isInitial={character.jobId === null}
          currentGold={character.gold}
          currentJobId={character.jobId}
        />
      </Modal>

      {/* Skill Tree Modal */}
      <Modal visible={showSkillTree} transparent={false} animationType="slide">
        <SkillTreeScreen
          level={character.level}
          skillPoints={character.skillPoints}
          unlockedSkills={character.unlockedSkills}
          equippedSkills={character.equippedSkills}
          onUnlock={unlockSkill}
          onEquip={equipSkill}
          onUnequip={unequipSkill}
          onClose={() => setShowSkillTree(false)}
        />
      </Modal>

      {/* Achievements */}
      <AchievementsSection />
    </ScrollView>
  );
}

function AchievementsSection() {
  const unlockedIds = useAchievementStore(s => s.unlockedIds);
  return (
    <>
      <Text style={achStyles.header}>【 実績 】</Text>
      <View style={achStyles.grid}>
        {ACHIEVEMENT_LIST.map(ach => {
          const unlocked = unlockedIds.includes(ach.id);
          return (
            <View
              key={ach.id}
              style={[achStyles.badge, unlocked ? achStyles.badgeUnlocked : achStyles.badgeLocked]}
            >
              <Image source={ACH_ICONS[ach.id]} style={[achStyles.iconImg, !unlocked && achStyles.dimmed]} />
              <Text style={[achStyles.name, !unlocked && achStyles.dimmed]} numberOfLines={2}>
                {unlocked ? ach.name : '???'}
              </Text>
            </View>
          );
        })}
      </View>
    </>
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
  },
  card: { gap: Spacing.md },
  charHeader: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  avatar: {
    width: 64, height: 64, borderWidth: 2, borderColor: Colors.gold,
    alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bgSecondary,
  },
  avatarImage: { width: 48, height: 48, resizeMode: 'contain' },
  charName: { fontFamily: Fonts.monoBold, fontSize: Fonts.size.xl, color: Colors.white },
  charTitle: { fontFamily: Fonts.mono, fontSize: Fonts.size.sm, color: Colors.textDim },
  rankBadge: {
    borderWidth: 1, borderColor: Colors.borderDim,
    paddingHorizontal: Spacing.sm, paddingVertical: 2, alignSelf: 'flex-start',
  },
  rankText: { fontFamily: Fonts.monoBold, fontSize: Fonts.size.xs, color: Colors.textDim },
  goldQuestRow: { flexDirection: 'row', gap: Spacing.sm },
  infoChip: {
    flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.bgSecondary, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs,
  },
  infoChipLabel: { fontFamily: Fonts.mono, fontSize: Fonts.size.xs, color: Colors.textDim, letterSpacing: 1 },
  infoChipValue: { fontFamily: Fonts.monoBold, fontSize: Fonts.size.sm, color: Colors.text },
  statsTitle: {
    fontFamily: Fonts.mono, fontSize: Fonts.size.xs, color: Colors.textDim,
    textAlign: 'center', letterSpacing: 2, marginTop: Spacing.xs,
  },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  statBox: {
    flex: 1, minWidth: '30%', backgroundColor: Colors.bgSecondary,
    padding: Spacing.sm, alignItems: 'center', gap: 2,
  },
  statLabel: { fontFamily: Fonts.mono, fontSize: Fonts.size.xs, color: Colors.textDim, letterSpacing: 1 },
  statValue: { fontFamily: Fonts.monoBold, fontSize: Fonts.size.lg, color: Colors.text },
  incarnationBonusText: {
    fontFamily: Fonts.mono, fontSize: Fonts.size.xs, color: Colors.purple,
    textAlign: 'center', marginTop: Spacing.xs,
  },
  sectionHeader: {
    fontFamily: Fonts.monoBold, fontSize: Fonts.size.lg, color: Colors.text,
    letterSpacing: 2, textAlign: 'center',
  },
  jobRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  jobIconImage: { width: 32, height: 32, resizeMode: 'contain' },
  jobName: { fontFamily: Fonts.monoBold, fontSize: Fonts.size.md, color: Colors.text },
  jobDesc: { fontFamily: Fonts.mono, fontSize: Fonts.size.xs, color: Colors.textDim },
  noJobText: {
    fontFamily: Fonts.mono, fontSize: Fonts.size.sm, color: Colors.textDim,
    textAlign: 'center', marginBottom: Spacing.sm,
  },
  skillSlots: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  skillSlot: {
    flex: 1, borderWidth: 1, borderColor: Colors.borderDim,
    padding: Spacing.xs, alignItems: 'center', minHeight: 50, justifyContent: 'center',
  },
  skillSlotFilled: { borderColor: Colors.blue },
  skillSlotName: { fontFamily: Fonts.mono, fontSize: Fonts.size.xs, color: Colors.text, textAlign: 'center' },
  skillSlotMp: { fontFamily: Fonts.mono, fontSize: Fonts.size.xs, color: Colors.purple },
  skillSlotEmpty: { fontFamily: Fonts.mono, fontSize: Fonts.size.sm, color: Colors.borderDim },
  incarnateDesc: {
    fontFamily: Fonts.mono, fontSize: Fonts.size.sm, color: Colors.textDim,
    lineHeight: 20, marginBottom: Spacing.sm,
  },
  emptyText: {
    fontFamily: Fonts.mono, fontSize: Fonts.size.sm, color: Colors.textDim,
    textAlign: 'center', padding: Spacing.md,
  },
  itemGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  itemSlot: {
    width: '30%', borderWidth: 2, borderColor: Colors.borderDim,
    backgroundColor: Colors.bgCard, padding: Spacing.sm, alignItems: 'center',
    gap: 4, minHeight: 90, justifyContent: 'center',
  },
  itemSlotEquipped: { borderColor: Colors.gold, backgroundColor: Colors.gold + '11' },
  itemName: { fontFamily: Fonts.mono, fontSize: Fonts.size.xs, color: Colors.text, textAlign: 'center' },
  itemType: { fontFamily: Fonts.mono, fontSize: Fonts.size.xs, color: Colors.textDim },
  equippedLabel: { fontFamily: Fonts.monoBold, fontSize: Fonts.size.xs, color: Colors.gold },
  synthesisCard: { gap: Spacing.sm },
  synthesisNote: {
    fontFamily: Fonts.mono, fontSize: Fonts.size.xs, color: Colors.textDim,
    textAlign: 'center', marginBottom: Spacing.xs,
  },
  synthesisRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    gap: Spacing.sm, paddingVertical: Spacing.xs,
    borderTopWidth: 1, borderTopColor: Colors.borderDim,
  },
  synthesisInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  synthesisTextBlock: { flex: 1, gap: 2 },
  synthesisItemName: { fontFamily: Fonts.monoBold, fontSize: Fonts.size.sm, color: Colors.text },
  synthesisCount: { fontFamily: Fonts.mono, fontSize: Fonts.size.xs, color: Colors.textDim },
  synthesisBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
  modalBg: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'center', padding: Spacing.lg },
  modal: { gap: Spacing.md },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  modalItemName: { flex: 1, fontFamily: Fonts.monoBold, fontSize: Fonts.size.lg, color: Colors.white },
  modalItemDesc: { fontFamily: Fonts.mono, fontSize: Fonts.size.sm, color: Colors.textDim, lineHeight: 20 },
  modalStats: { flexDirection: 'row', gap: Spacing.lg },
  modalStat: { fontFamily: Fonts.monoBold, fontSize: Fonts.size.lg },
  modalActions: { flexDirection: 'row', gap: Spacing.sm },
});

const achStyles = StyleSheet.create({
  header: {
    fontFamily: Fonts.monoBold, fontSize: Fonts.size.lg, color: Colors.text,
    letterSpacing: 2, textAlign: 'center', marginTop: Spacing.md,
  },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm,
    paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl,
  },
  badge: {
    width: '30%', borderWidth: 2, borderRadius: 2,
    padding: Spacing.sm, alignItems: 'center', gap: 4, minHeight: 72, justifyContent: 'center',
  },
  badgeUnlocked: { borderColor: Colors.gold, backgroundColor: Colors.gold + '18' },
  badgeLocked: { borderColor: Colors.borderDim, backgroundColor: Colors.bgSecondary },
  iconImg: { width: 28, height: 28, resizeMode: 'contain' },
  name: { fontFamily: Fonts.mono, fontSize: Fonts.size.xs, color: Colors.text, textAlign: 'center', lineHeight: 14 },
  dimmed: { opacity: 0.4 },
});
