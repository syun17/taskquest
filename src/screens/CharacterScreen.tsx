import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { useCharacterStore } from '../store/useCharacterStore';
import { useInventoryStore } from '../store/useInventoryStore';
import { PixelBorder } from '../components/common/PixelBorder';
import { ExpBar } from '../components/common/ExpBar';
import { RarityBadge } from '../components/common/RarityBadge';
import { GuildButton } from '../components/common/GuildButton';
import { Colors, Fonts, Spacing } from '../constants/theme';
import { Item, ItemRarity } from '../types';

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
  const items = useInventoryStore(s => s.items);
  const equipItem = useInventoryStore(s => s.equipItem);
  const unequipItem = useInventoryStore(s => s.unequipItem);
  const sellItem = useInventoryStore(s => s.sellItem);
  const synthesizeItems = useInventoryStore(s => s.synthesizeItems);
  const gainGold = useCharacterStore(s => s.gainGold);
  const totalAttack = items.filter(i => i.equipped).reduce((sum, i) => sum + (i.attack ?? 0), 0);
  const totalDefense = items.filter(i => i.equipped).reduce((sum, i) => sum + (i.defense ?? 0), 0);

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // 合成可能グループを計算 (same name + rarity, count >= 4, not legendary)
  const synthesisGroups: SynthesisGroup[] = React.useMemo(() => {
    const groupMap = new Map<string, SynthesisGroup>();
    for (const item of items) {
      if (item.rarity === 'legendary') continue;
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
              Alert.alert(
                '合成成功！',
                `${RARITY_LABELS[result.rarity]} 「${result.name}」 を入手した！`,
              );
            } else {
              Alert.alert('合成失敗', '合成できませんでした');
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.header}>【 キャラクター 】</Text>

      {/* Character Info */}
      <PixelBorder style={styles.card}>
        <View style={styles.charHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>⚔</Text>
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.charName}>{character.name}</Text>
            <Text style={styles.charTitle}>{character.title}</Text>
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>ギルドランク {character.guildRank}</Text>
            </View>
          </View>
        </View>

        <ExpBar
          exp={character.exp}
          expToNext={character.expToNext}
          level={character.level}
        />

        <View style={styles.statsGrid}>
          {[
            { label: 'GOLD', value: `${character.gold.toLocaleString()}G`, color: Colors.gold },
            { label: 'ATK', value: String(totalAttack), color: Colors.red },
            { label: 'DEF', value: String(totalDefense), color: Colors.blue },
            { label: 'QUEST', value: `${character.completedQuests}件`, color: Colors.text },
          ].map(stat => (
            <View key={stat.label} style={styles.statBox}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            </View>
          ))}
        </View>
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
            <Text style={styles.synthesisNote}>
              同じ装備を4個合成してレアリティアップ！
            </Text>
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
                  <Text style={[styles.modalStat, { color: Colors.red }]}>
                    ATK +{selectedItem.attack}
                  </Text>
                )}
                {selectedItem.defense !== undefined && selectedItem.defense > 0 && (
                  <Text style={[styles.modalStat, { color: Colors.blue }]}>
                    DEF +{selectedItem.defense}
                  </Text>
                )}
              </View>
              <View style={styles.modalActions}>
                <GuildButton
                  label="閉じる"
                  variant="ghost"
                  onPress={() => setSelectedItem(null)}
                  style={{ flex: 1 }}
                />
                <GuildButton
                  label={selectedItem.equipped ? '外す' : '装備する'}
                  variant="primary"
                  onPress={() => {
                    if (selectedItem.equipped) {
                      unequipItem(selectedItem.id);
                    } else {
                      equipItem(selectedItem.id);
                    }
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
  },
  card: { gap: Spacing.md },
  charHeader: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  avatar: {
    width: 64,
    height: 64,
    borderWidth: 2,
    borderColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgSecondary,
  },
  avatarText: { fontSize: 32 },
  charName: {
    fontFamily: Fonts.monoBold,
    fontSize: Fonts.size.xl,
    color: Colors.white,
  },
  charTitle: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.sm,
    color: Colors.textDim,
  },
  rankBadge: {
    borderWidth: 1,
    borderColor: Colors.borderDim,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  rankText: {
    fontFamily: Fonts.monoBold,
    fontSize: Fonts.size.xs,
    color: Colors.textDim,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statBox: {
    flex: 1,
    minWidth: '40%',
    backgroundColor: Colors.bgSecondary,
    padding: Spacing.sm,
    alignItems: 'center',
    gap: 2,
  },
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
  sectionHeader: {
    fontFamily: Fonts.monoBold,
    fontSize: Fonts.size.lg,
    color: Colors.text,
    letterSpacing: 2,
    textAlign: 'center',
  },
  emptyText: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.sm,
    color: Colors.textDim,
    textAlign: 'center',
    padding: Spacing.md,
  },
  itemGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  itemSlot: {
    width: '30%',
    borderWidth: 2,
    borderColor: Colors.borderDim,
    backgroundColor: Colors.bgCard,
    padding: Spacing.sm,
    alignItems: 'center',
    gap: 4,
    minHeight: 90,
    justifyContent: 'center',
  },
  itemSlotEquipped: {
    borderColor: Colors.gold,
    backgroundColor: Colors.gold + '11',
  },
  itemName: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.xs,
    color: Colors.text,
    textAlign: 'center',
  },
  itemType: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.xs,
    color: Colors.textDim,
  },
  equippedLabel: {
    fontFamily: Fonts.monoBold,
    fontSize: Fonts.size.xs,
    color: Colors.gold,
  },
  synthesisCard: { gap: Spacing.sm },
  synthesisNote: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.xs,
    color: Colors.textDim,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  synthesisRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.borderDim,
  },
  synthesisInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  synthesisTextBlock: { flex: 1, gap: 2 },
  synthesisItemName: {
    fontFamily: Fonts.monoBold,
    fontSize: Fonts.size.sm,
    color: Colors.text,
  },
  synthesisCount: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.xs,
    color: Colors.textDim,
  },
  synthesisBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  modalBg: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modal: { gap: Spacing.md },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  modalItemName: {
    flex: 1,
    fontFamily: Fonts.monoBold,
    fontSize: Fonts.size.lg,
    color: Colors.white,
  },
  modalItemDesc: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.sm,
    color: Colors.textDim,
    lineHeight: 20,
  },
  modalStats: { flexDirection: 'row', gap: Spacing.lg },
  modalStat: {
    fontFamily: Fonts.monoBold,
    fontSize: Fonts.size.lg,
  },
  modalActions: { flexDirection: 'row', gap: Spacing.sm },
});
