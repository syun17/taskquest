import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useQuestStore } from '../store/useQuestStore';
import { DifficultyBadge } from '../components/common/DifficultyBadge';
import { GuildButton } from '../components/common/GuildButton';
import { PixelBorder } from '../components/common/PixelBorder';
import { Colors, Fonts, Spacing } from '../constants/theme';
import { Quest, QuestDifficulty } from '../types';
import { DIFFICULTY_EXP, DIFFICULTY_GOLD } from '../constants/gameData';

const DIFFICULTIES: QuestDifficulty[] = ['F', 'E', 'D', 'C', 'B', 'A', 'S'];

export function QuestBoardScreen() {
  const quests = useQuestStore(s => s.quests);
  const availableQuests = quests.filter(q => q.status === 'available');
  const acceptQuest = useQuestStore(s => s.acceptQuest);
  const addQuest = useQuestStore(s => s.addQuest);
  const deleteQuest = useQuestStore(s => s.deleteQuest);

  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<QuestDifficulty>('E');

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
    addQuest(title.trim(), description.trim(), difficulty);
    setTitle('');
    setDescription('');
    setDifficulty('E');
    setShowCreate(false);
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.header}>【 クエスト掲示板 】</Text>

      {availableQuests.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>掲示板にクエストはない</Text>
          <Text style={styles.emptySubText}>新しいクエストを発注しよう</Text>
        </View>
      ) : (
        <FlatList
          data={availableQuests}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <PixelBorder style={styles.questCard}>
              <View style={styles.questHeader}>
                <DifficultyBadge difficulty={item.difficulty} />
                <Text style={styles.questTitle} numberOfLines={1}>
                  {item.title}
                </Text>
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
                    label="削除"
                    variant="ghost"
                    onPress={() => handleDelete(item)}
                    style={styles.smallBtn}
                  />
                  <GuildButton
                    label="受注"
                    onPress={() => handleAccept(item)}
                    style={styles.smallBtn}
                  />
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

      <Modal visible={showCreate} transparent animationType="slide">
        <View style={styles.modalBg}>
          <PixelBorder style={styles.modal} color={Colors.gold}>
            <Text style={styles.modalTitle}>クエスト発注</Text>

            <Text style={styles.inputLabel}>クエスト名</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="例: 30分ウォーキング"
              placeholderTextColor={Colors.textDim}
              maxLength={40}
            />

            <Text style={styles.inputLabel}>詳細（任意）</Text>
            <TextInput
              style={[styles.input, styles.inputMulti]}
              value={description}
              onChangeText={setDescription}
              placeholder="クエストの内容を入力"
              placeholderTextColor={Colors.textDim}
              multiline
              numberOfLines={3}
              maxLength={200}
            />

            <Text style={styles.inputLabel}>難易度</Text>
            <View style={styles.diffRow}>
              {DIFFICULTIES.map(d => (
                <TouchableOpacity
                  key={d}
                  onPress={() => setDifficulty(d)}
                  style={[
                    styles.diffBtn,
                    difficulty === d && styles.diffBtnSelected,
                  ]}
                >
                  <Text style={[
                    styles.diffBtnText,
                    difficulty === d && styles.diffBtnTextSelected,
                  ]}>
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.rewardPreview}>
              報酬: EXP +{DIFFICULTY_EXP[difficulty]}  Gold +{DIFFICULTY_GOLD[difficulty]}
            </Text>

            <View style={styles.modalActions}>
              <GuildButton
                label="キャンセル"
                variant="ghost"
                onPress={() => setShowCreate(false)}
                style={{ flex: 1 }}
              />
              <GuildButton
                label="発注する"
                variant="gold"
                onPress={handleCreate}
                style={{ flex: 1 }}
              />
            </View>
          </PixelBorder>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  header: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.xl,
    color: Colors.gold,
    textAlign: 'center',
    fontWeight: 'bold',
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
  questHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  questTitle: {
    flex: 1,
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.md,
    color: Colors.text,
    fontWeight: 'bold',
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
  createBtn: {
    margin: Spacing.lg,
    marginTop: Spacing.sm,
  },
  modalBg: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modal: { gap: Spacing.md },
  modalTitle: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.xl,
    color: Colors.gold,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  inputLabel: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.sm,
    color: Colors.textDim,
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
  inputMulti: { height: 72, textAlignVertical: 'top' },
  diffRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  diffBtn: {
    width: 36,
    height: 36,
    borderWidth: 2,
    borderColor: Colors.borderDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diffBtnSelected: { borderColor: Colors.gold, backgroundColor: Colors.gold + '33' },
  diffBtnText: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.md,
    color: Colors.textDim,
    fontWeight: 'bold',
  },
  diffBtnTextSelected: { color: Colors.gold },
  rewardPreview: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.sm,
    color: Colors.green,
    textAlign: 'center',
  },
  modalActions: { flexDirection: 'row', gap: Spacing.md },
});
