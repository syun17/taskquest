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
import { Item } from '../types';

const TYPE_LABELS: Record<string, string> = {
  weapon: '武器',
  armor: '防具',
  accessory: 'アクセ',
  consumable: '消耗品',
};

export function CharacterScreen() {
  const character = useCharacterStore(s => s.character);
  const items = useInventoryStore(s => s.items);
  const equipItem = useInventoryStore(s => s.equipItem);
  const unequipItem = useInventoryStore(s => s.unequipItem);
  const sellItem = useInventoryStore(s => s.sellItem);
  const gainGold = useCharacterStore(s => s.gainGold);
  const totalAttack = items.filter(i => i.equipped).reduce((sum, i) => sum + (i.attack ?? 0), 0);
  const totalDefense = items.filter(i => i.equipped).reduce((sum, i) => sum + (i.defense ?? 0), 0);

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

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
            { label: 'QUEST', value: `${character.completedQuests}件`, color: Colors.green },
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
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.xl,
    color: Colors.gold,
    textAlign: 'center',
    fontWeight: 'bold',
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
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.xl,
    color: Colors.white,
    fontWeight: 'bold',
  },
  charTitle: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.sm,
    color: Colors.gold,
  },
  rankBadge: {
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  rankText: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.xs,
    color: Colors.border,
    fontWeight: 'bold',
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
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.lg,
    fontWeight: 'bold',
    color: Colors.text,
  },
  sectionHeader: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.lg,
    color: Colors.text,
    fontWeight: 'bold',
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
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.xs,
    color: Colors.gold,
    fontWeight: 'bold',
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
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.lg,
    color: Colors.white,
    fontWeight: 'bold',
  },
  modalItemDesc: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.sm,
    color: Colors.textDim,
    lineHeight: 20,
  },
  modalStats: { flexDirection: 'row', gap: Spacing.lg },
  modalStat: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.lg,
    fontWeight: 'bold',
  },
  modalActions: { flexDirection: 'row', gap: Spacing.sm },
});
