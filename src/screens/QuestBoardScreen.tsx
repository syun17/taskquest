import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useQuestStore } from '../store/useQuestStore';
import { useCharacterStore } from '../store/useCharacterStore';
import { useDailyQuestStore } from '../store/useDailyQuestStore';
import { DifficultyBadge } from '../components/common/DifficultyBadge';
import { GuildButton } from '../components/common/GuildButton';
import { PixelBorder } from '../components/common/PixelBorder';
import { Colors, Fonts, Spacing } from '../constants/theme';
import { Quest, QuestDifficulty } from '../types';
import { DIFFICULTY_EXP, DIFFICULTY_GOLD } from '../constants/gameData';

const DIFFICULTIES: QuestDifficulty[] = ['F', 'E', 'D', 'C', 'B', 'A', 'S'];
type SortOrder = 'new' | 'old' | 'diffHigh' | 'diffLow';

const DIFF_RANK: Record<QuestDifficulty, number> = { F: 0, E: 1, D: 2, C: 3, B: 4, A: 5, S: 6 };

function formatTimeLeft(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function QuestBoardScreen() {
  const quests = useQuestStore(s => s.quests);
  const availableQuests = quests.filter(q => q.status === 'available');
  const acceptQuest = useQuestStore(s => s.acceptQuest);
  const addQuest = useQuestStore(s => s.addQuest);
  const editQuest = useQuestStore(s => s.editQuest);
  const deleteQuest = useQuestStore(s => s.deleteQuest);

  const guildRank = useCharacterStore(s => s.character.guildRank);
  const dailyQuests = useDailyQuestStore(s => s.dailyQuests);
  const refreshIfNeeded = useDailyQuestStore(s => s.refreshIfNeeded);
  const getTimeUntilReset = useDailyQuestStore(s => s.getTimeUntilReset);
  const [timeLeft, setTimeLeft] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    refreshIfNeeded(guildRank);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft(formatTimeLeft(getTimeUntilReset()));
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // フィルタ・ソート
  const [filterDiff, setFilterDiff] = useState<QuestDifficulty | null>(null);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('new');

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    availableQuests.forEach(q => q.tags?.forEach(t => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [availableQuests]);

  const displayedQuests = useMemo(() => {
    let list = filterDiff ? availableQuests.filter(q => q.difficulty === filterDiff) : availableQuests;
    if (filterTag) list = list.filter(q => q.tags?.includes(filterTag));
    return [...list].sort((a, b) => {
      switch (sortOrder) {
        case 'new': return b.createdAt - a.createdAt;
        case 'old': return a.createdAt - b.createdAt;
        case 'diffHigh': return DIFF_RANK[b.difficulty] - DIFF_RANK[a.difficulty];
        case 'diffLow': return DIFF_RANK[a.difficulty] - DIFF_RANK[b.difficulty];
      }
    });
  }, [availableQuests, filterDiff, filterTag, sortOrder]);

  // 新規作成
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [conditions, setConditions] = useState('');
  const [deadlineInput, setDeadlineInput] = useState('');
  const [difficulty, setDifficulty] = useState<QuestDifficulty>('E');
  const [tagsInput, setTagsInput] = useState('');

  // 編集
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editConditions, setEditConditions] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [editDifficulty, setEditDifficulty] = useState<QuestDifficulty>('E');
  const [editTagsInput, setEditTagsInput] = useState('');

  const openEdit = (quest: Quest) => {
    setEditingQuest(quest);
    setEditTitle(quest.title);
    setEditDescription(quest.description ?? '');
    setEditConditions(quest.conditions ?? '');
    setEditDeadline(quest.deadline ?? '');
    setEditDifficulty(quest.difficulty);
    setEditTagsInput(quest.tags?.join(' ') ?? '');
  };

  const parseTags = (input: string): string[] =>
    input.split(/[\s,、]+/).map(t => t.trim()).filter(t => t.length > 0);

  const handleSaveEdit = () => {
    if (!editingQuest) return;
    if (!editTitle.trim()) {
      Alert.alert('エラー', 'クエスト名を入力してください');
      return;
    }
    const tags = parseTags(editTagsInput);
    editQuest(editingQuest.id, {
      title: editTitle.trim(),
      description: editDescription.trim(),
      difficulty: editDifficulty,
      conditions: editConditions.trim() || undefined,
      deadline: editDeadline.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
    });
    setEditingQuest(null);
  };

  const handleAccept = (quest: Quest) => {
    Alert.alert(
      'クエスト受注',
      `「${quest.title}」を受注しますか？\n\n報酬: ${quest.reward.exp}EXP / ${quest.reward.gold}G`,
      [
        { text: 'キャンセル', style: 'cancel' },
        { text: '受注する', onPress: () => acceptQuest(quest.id) },
      ],
    );
  };

  const handleDelete = (quest: Quest) => {
    Alert.alert('クエスト削除', `「${quest.title}」を削除しますか？`, [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: () => deleteQuest(quest.id) },
    ]);
  };

  const handleCreate = () => {
    if (!title.trim()) {
      Alert.alert('エラー', 'クエスト名を入力してください');
      return;
    }
    const tags = parseTags(tagsInput);
    addQuest(title.trim(), description.trim(), difficulty, conditions.trim() || undefined, deadlineInput.trim() || undefined, tags.length > 0 ? tags : undefined);
    setTitle('');
    setDescription('');
    setConditions('');
    setDeadlineInput('');
    setDifficulty('E');
    setTagsInput('');
    setShowCreate(false);
  };

  const handleCloseCreate = () => {
    setTitle('');
    setDescription('');
    setConditions('');
    setDeadlineInput('');
    setDifficulty('E');
    setTagsInput('');
    setShowCreate(false);
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.header}>【 クエスト掲示板 】</Text>

      {/* デイリークエスト */}
      {dailyQuests.length > 0 && (
        <PixelBorder style={styles.dailySection} color={Colors.gold}>
          <View style={styles.dailyHeader}>
            <Text style={styles.dailyTitle}>【 デイリークエスト 】</Text>
            <Text style={styles.dailyReset}>リセット: {timeLeft}</Text>
          </View>
          <View style={styles.dailyCards}>
            {dailyQuests.map(dq => (
              <View
                key={dq.id}
                style={[styles.dailyCard, dq.isCompleted && styles.dailyCardDone]}
              >
                <DifficultyBadge difficulty={dq.difficulty} />
                <Text style={[styles.dailyCardTitle, dq.isCompleted && styles.dailyCardTitleDone]} numberOfLines={1}>
                  {dq.isCompleted ? '✓ ' : ''}{dq.title}
                </Text>
                <Text style={styles.dailyCardDesc} numberOfLines={2}>{dq.description}</Text>
                <Text style={styles.dailyCardProgress}>
                  {dq.progress}/{dq.goalCount}
                </Text>
                <Text style={[styles.dailyCardReward, { color: Colors.green }]}>EXP +{dq.reward.exp}</Text>
                <Text style={[styles.dailyCardReward, { color: Colors.gold }]}>G +{dq.reward.gold}</Text>
              </View>
            ))}
          </View>
        </PixelBorder>
      )}

      {/* フィルタ・ソートバー */}
      <View style={styles.controlBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterBtn, filterDiff === null && styles.filterBtnActive]}
            onPress={() => setFilterDiff(null)}
          >
            <Text style={[styles.filterBtnText, filterDiff === null && styles.filterBtnTextActive]}>全難易度</Text>
          </TouchableOpacity>
          {DIFFICULTIES.map(d => (
            <TouchableOpacity
              key={d}
              style={[styles.filterBtn, filterDiff === d && styles.filterBtnActive]}
              onPress={() => setFilterDiff(filterDiff === d ? null : d)}
            >
              <Text style={[styles.filterBtnText, filterDiff === d && styles.filterBtnTextActive]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {allTags.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <TouchableOpacity
              style={[styles.filterBtn, filterTag === null && styles.tagBtnActive]}
              onPress={() => setFilterTag(null)}
            >
              <Text style={[styles.filterBtnText, filterTag === null && styles.tagBtnTextActive]}>全タグ</Text>
            </TouchableOpacity>
            {allTags.map(tag => (
              <TouchableOpacity
                key={tag}
                style={[styles.filterBtn, filterTag === tag && styles.tagBtnActive]}
                onPress={() => setFilterTag(filterTag === tag ? null : tag)}
              >
                <Text style={[styles.filterBtnText, filterTag === tag && styles.tagBtnTextActive]}>#{tag}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortScroll}>
          {([['new', '新↓'], ['old', '古↓'], ['diffHigh', '難易度↑'], ['diffLow', '難易度↓']] as [SortOrder, string][]).map(([key, label]) => (
            <TouchableOpacity
              key={key}
              style={[styles.sortBtn, sortOrder === key && styles.sortBtnActive]}
              onPress={() => setSortOrder(key)}
            >
              <Text style={[styles.sortBtnText, sortOrder === key && styles.sortBtnTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {displayedQuests.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>クエストはない</Text>
          <Text style={styles.emptySubText}>新しいクエストを発注しよう</Text>
        </View>
      ) : (
        <FlatList
          data={displayedQuests}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <PixelBorder style={styles.questCard}>
              <View style={styles.questHeader}>
                <DifficultyBadge difficulty={item.difficulty} />
                <Text style={styles.questTitle} numberOfLines={1}>{item.title}</Text>
              </View>
              {item.description ? (
                <Text style={styles.questDesc} numberOfLines={2}>{item.description}</Text>
              ) : null}
              {item.conditions ? (
                <Text style={styles.questConditions} numberOfLines={1}>▶ 達成条件: {item.conditions}</Text>
              ) : null}
              {item.deadline ? (
                <Text style={styles.questDeadline}>⏰ 期限: {item.deadline}</Text>
              ) : null}
              {item.tags && item.tags.length > 0 && (
                <View style={styles.tagRow}>
                  {item.tags.map(tag => (
                    <TouchableOpacity key={tag} onPress={() => setFilterTag(filterTag === tag ? null : tag)}>
                      <Text style={[styles.tagChip, filterTag === tag && styles.tagChipActive]}>#{tag}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <View style={styles.questFooter}>
                <View style={styles.rewards}>
                  <Text style={styles.rewardText}>EXP +{item.reward.exp}</Text>
                  <Text style={[styles.rewardText, { color: Colors.gold }]}>Gold +{item.reward.gold}</Text>
                </View>
                <View style={styles.actions}>
                  <GuildButton label="削除" variant="ghost" onPress={() => handleDelete(item)} style={styles.smallBtn} />
                  <GuildButton label="編集" variant="ghost" onPress={() => openEdit(item)} style={styles.smallBtn} />
                  <GuildButton label="受注" onPress={() => handleAccept(item)} style={styles.smallBtn} />
                </View>
              </View>
            </PixelBorder>
          )}
        />
      )}

      <GuildButton
        label="＋ クエスト発注"
        variant="gold"
        onPress={() => setShowCreate(true)}
        style={styles.createBtn}
      />

      {/* 新規作成モーダル */}
      <Modal visible={showCreate} transparent animationType="slide">
        <View style={styles.modalBg}>
          <PixelBorder style={styles.modal} color={Colors.gold}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>クエスト発注</Text>
              <QuestForm
                title={title} setTitle={setTitle}
                description={description} setDescription={setDescription}
                conditions={conditions} setConditions={setConditions}
                deadlineInput={deadlineInput} setDeadlineInput={setDeadlineInput}
                difficulty={difficulty} setDifficulty={setDifficulty}
                tagsInput={tagsInput} setTagsInput={setTagsInput}
              />
              <View style={styles.modalActions}>
                <GuildButton label="キャンセル" variant="ghost" onPress={handleCloseCreate} style={{ flex: 1 }} />
                <GuildButton label="発注する" variant="gold" onPress={handleCreate} style={{ flex: 1 }} />
              </View>
            </ScrollView>
          </PixelBorder>
        </View>
      </Modal>

      {/* 編集モーダル */}
      <Modal visible={!!editingQuest} transparent animationType="slide">
        <View style={styles.modalBg}>
          <PixelBorder style={styles.modal} color={Colors.border}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>クエスト編集</Text>
              <QuestForm
                title={editTitle} setTitle={setEditTitle}
                description={editDescription} setDescription={setEditDescription}
                conditions={editConditions} setConditions={setEditConditions}
                deadlineInput={editDeadline} setDeadlineInput={setEditDeadline}
                difficulty={editDifficulty} setDifficulty={setEditDifficulty}
                tagsInput={editTagsInput} setTagsInput={setEditTagsInput}
              />
              <View style={styles.modalActions}>
                <GuildButton label="キャンセル" variant="ghost" onPress={() => setEditingQuest(null)} style={{ flex: 1 }} />
                <GuildButton label="保存する" onPress={handleSaveEdit} style={{ flex: 1 }} />
              </View>
            </ScrollView>
          </PixelBorder>
        </View>
      </Modal>
    </View>
  );
}

interface FormProps {
  title: string; setTitle: (v: string) => void;
  description: string; setDescription: (v: string) => void;
  conditions: string; setConditions: (v: string) => void;
  deadlineInput: string; setDeadlineInput: (v: string) => void;
  difficulty: QuestDifficulty; setDifficulty: (d: QuestDifficulty) => void;
  tagsInput: string; setTagsInput: (v: string) => void;
}

function QuestForm({ title, setTitle, description, setDescription, conditions, setConditions, deadlineInput, setDeadlineInput, difficulty, setDifficulty, tagsInput, setTagsInput }: FormProps) {
  return (
    <>
      <Text style={styles.inputLabel}>クエスト名 *</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="例: 30分ウォーキング"
        placeholderTextColor={Colors.textDim}
        maxLength={40}
      />
      <Text style={styles.inputLabel}>難易度</Text>
      <View style={styles.diffRow}>
        {DIFFICULTIES.map(d => (
          <TouchableOpacity
            key={d}
            onPress={() => setDifficulty(d)}
            style={[styles.diffBtn, difficulty === d && styles.diffBtnSelected]}
          >
            <Text style={[styles.diffBtnText, difficulty === d && styles.diffBtnTextSelected]}>{d}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.rewardPreview}>
        報酬: EXP +{DIFFICULTY_EXP[difficulty]}  Gold +{DIFFICULTY_GOLD[difficulty]}
      </Text>
      <Text style={styles.inputLabel}>クエスト内容（任意）</Text>
      <TextInput
        style={[styles.input, styles.inputMulti]}
        value={description}
        onChangeText={setDescription}
        placeholder="クエストの詳細を入力"
        placeholderTextColor={Colors.textDim}
        multiline
        numberOfLines={3}
        maxLength={200}
      />
      <Text style={styles.inputLabel}>達成条件（任意）</Text>
      <TextInput
        style={[styles.input, styles.inputMulti]}
        value={conditions}
        onChangeText={setConditions}
        placeholder="例: 5km走り切る / 10問全問正解"
        placeholderTextColor={Colors.textDim}
        multiline
        numberOfLines={2}
        maxLength={150}
      />
      <Text style={styles.inputLabel}>期限（任意）</Text>
      <TextInput
        style={styles.input}
        value={deadlineInput}
        onChangeText={setDeadlineInput}
        placeholder="例: 2026/12/31 または「来週中」など"
        placeholderTextColor={Colors.textDim}
      />
      <Text style={styles.inputLabel}>タグ（任意）</Text>
      <TextInput
        style={styles.input}
        value={tagsInput}
        onChangeText={setTagsInput}
        placeholder="例: 健康 勉強 運動（スペース・カンマ区切り）"
        placeholderTextColor={Colors.textDim}
        maxLength={100}
      />
    </>
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
  dailySection: { marginHorizontal: Spacing.lg, marginBottom: Spacing.sm, gap: Spacing.sm },
  dailyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dailyTitle: { fontFamily: Fonts.monoBold, fontSize: Fonts.size.sm, color: Colors.gold, letterSpacing: 1 },
  dailyReset: { fontFamily: Fonts.mono, fontSize: Fonts.size.xs, color: Colors.textDim },
  dailyCards: { flexDirection: 'row', gap: Spacing.xs },
  dailyCard: {
    flex: 1, borderWidth: 1, borderColor: Colors.borderDim,
    padding: Spacing.xs, gap: 2, alignItems: 'center',
    backgroundColor: Colors.bgSecondary,
  },
  dailyCardDone: { borderColor: Colors.green + '66', backgroundColor: Colors.green + '11' },
  dailyCardTitle: { fontFamily: Fonts.monoBold, fontSize: Fonts.size.xs, color: Colors.text, textAlign: 'center' },
  dailyCardTitleDone: { color: Colors.textDim },
  dailyCardDesc: { fontFamily: Fonts.mono, fontSize: 9, color: Colors.textDim, textAlign: 'center', lineHeight: 12 },
  dailyCardProgress: { fontFamily: Fonts.monoBold, fontSize: Fonts.size.xs, color: Colors.orange },
  dailyCardReward: { fontFamily: Fonts.mono, fontSize: 9 },
  controlBar: { paddingHorizontal: Spacing.sm, paddingBottom: Spacing.xs },
  filterScroll: { marginBottom: 4 },
  filterBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    marginRight: 4,
    borderWidth: 1,
    borderColor: Colors.borderDim,
  },
  filterBtnActive: { borderColor: Colors.gold, backgroundColor: Colors.gold + '22' },
  filterBtnText: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.xs,
    color: Colors.textDim,
  },
  filterBtnTextActive: { color: Colors.gold },
  sortScroll: {},
  sortBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    marginRight: 4,
    borderWidth: 1,
    borderColor: Colors.borderDim,
  },
  sortBtnActive: { borderColor: Colors.blue, backgroundColor: Colors.blue + '22' },
  sortBtnText: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.xs,
    color: Colors.textDim,
  },
  sortBtnTextActive: { color: Colors.blue },
  list: { padding: Spacing.lg, gap: Spacing.sm, paddingTop: 0 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  emptyText: { fontFamily: Fonts.mono, fontSize: Fonts.size.lg, color: Colors.textDim },
  emptySubText: { fontFamily: Fonts.mono, fontSize: Fonts.size.sm, color: Colors.textDim },
  questCard: { gap: Spacing.sm },
  questHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  questTitle: { flex: 1, fontFamily: Fonts.monoBold, fontSize: Fonts.size.md, color: Colors.text },
  questDesc: { fontFamily: Fonts.mono, fontSize: Fonts.size.sm, color: Colors.textDim, lineHeight: 18 },
  questConditions: { fontFamily: Fonts.mono, fontSize: Fonts.size.xs, color: Colors.textDim, lineHeight: 16 },
  questDeadline: { fontFamily: Fonts.mono, fontSize: Fonts.size.xs, color: Colors.textDim },
  questFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rewards: { gap: 2 },
  rewardText: { fontFamily: Fonts.mono, fontSize: Fonts.size.xs, color: Colors.textDim },
  actions: { flexDirection: 'row', gap: Spacing.xs },
  smallBtn: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs },
  createBtn: { margin: Spacing.lg, marginTop: Spacing.sm },
  modalBg: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'center', padding: Spacing.lg },
  modal: { maxHeight: '90%' },
  modalTitle: {
    fontFamily: Fonts.monoBold,
    fontSize: Fonts.size.xl,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.sm,
    color: Colors.textDim,
    marginBottom: 4,
    marginTop: Spacing.sm,
  },
  input: {
    borderWidth: 2,
    borderColor: Colors.borderDim,
    color: Colors.text,
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.md,
    padding: Spacing.sm,
    backgroundColor: Colors.bgSecondary,
  },
  inputMulti: { height: 64, textAlignVertical: 'top' },
  diffRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap', marginBottom: 4 },
  diffBtn: {
    width: 36, height: 36, borderWidth: 2, borderColor: Colors.borderDim,
    alignItems: 'center', justifyContent: 'center',
  },
  diffBtnSelected: { borderColor: Colors.gold, backgroundColor: Colors.gold + '33' },
  diffBtnText: { fontFamily: Fonts.monoBold, fontSize: Fonts.size.md, color: Colors.textDim },
  diffBtnTextSelected: { color: Colors.gold },
  rewardPreview: {
    fontFamily: Fonts.mono, fontSize: Fonts.size.sm, color: Colors.textDim,
    textAlign: 'center', marginBottom: Spacing.xs,
  },
  modalActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  tagChip: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.xs,
    color: Colors.textDim,
    borderWidth: 1,
    borderColor: Colors.borderDim,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagChipActive: { color: Colors.green, borderColor: Colors.green },
  tagBtnActive: { borderColor: Colors.green, backgroundColor: Colors.green + '22' },
  tagBtnTextActive: { color: Colors.green },
});
