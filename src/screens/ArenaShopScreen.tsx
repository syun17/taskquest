import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useBattleStore } from '../store/useBattleStore';
import { useInventoryStore } from '../store/useInventoryStore';
import { useCharacterStore } from '../store/useCharacterStore';
import { ARENA_SHOP_ITEMS, ArenaShopItem } from '../constants/arenaData';
import { PixelBorder } from '../components/common/PixelBorder';
import { GuildButton } from '../components/common/GuildButton';
import { RarityBadge } from '../components/common/RarityBadge';
import { Colors, Fonts, Spacing } from '../constants/theme';

const TYPE_LABELS: Record<string, string> = {
  weapon: '武器',
  armor: '防具',
  accessory: 'アクセ',
};

function ShopItemCard({
  item,
  arenaCoins,
  onBuy,
}: {
  item: ArenaShopItem;
  arenaCoins: number;
  onBuy: (item: ArenaShopItem) => void;
}) {
  const canAfford = arenaCoins >= item.cost;

  return (
    <PixelBorder
      style={styles.itemCard}
      color={canAfford ? Colors.borderDim : Colors.bgSecondary}
    >
      <View style={styles.itemHeader}>
        {item.type === 'item' && item.itemData ? (
          <RarityBadge rarity={item.itemData.rarity} />
        ) : (
          <View style={styles.titleBadge}>
            <Text style={styles.titleBadgeText}>称号</Text>
          </View>
        )}
        <Text style={styles.itemName}>{item.name}</Text>
      </View>

      <Text style={styles.itemDesc}>{item.description}</Text>

      {item.type === 'item' && item.itemData && (
        <View style={styles.statsRow}>
          <Text style={styles.typeLabel}>{TYPE_LABELS[item.itemData.type]}</Text>
          {item.itemData.attack > 0 && (
            <Text style={[styles.statText, { color: Colors.red }]}>
              ATK +{item.itemData.attack}
            </Text>
          )}
          {item.itemData.defense > 0 && (
            <Text style={[styles.statText, { color: Colors.blue }]}>
              DEF +{item.itemData.defense}
            </Text>
          )}
        </View>
      )}

      {item.type === 'title' && item.titleData && (
        <Text style={styles.titlePreview}>「{item.titleData}」</Text>
      )}

      <View style={styles.buyRow}>
        <View style={styles.costBox}>
          <Text style={styles.costLabel}>コスト</Text>
          <Text style={[styles.costValue, { color: canAfford ? Colors.orange : Colors.textDim }]}>
            {item.cost} コイン
          </Text>
        </View>
        <GuildButton
          label="購入"
          variant="primary"
          disabled={!canAfford}
          onPress={() => onBuy(item)}
          style={styles.buyBtn}
        />
      </View>
    </PixelBorder>
  );
}

export function ArenaShopScreen() {
  const arenaCoins = useBattleStore(s => s.arenaCoins);
  const spendCoins = useBattleStore(s => s.spendCoins);
  const addItem = useInventoryStore(s => s.addItem);
  const setTitle = useCharacterStore(s => s.setTitle);

  const handleBuy = (shopItem: ArenaShopItem) => {
    Alert.alert(
      'アリーナショップ',
      `「${shopItem.name}」を ${shopItem.cost} コインで購入しますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '購入する',
          onPress: () => {
            const success = spendCoins(shopItem.cost);
            if (!success) {
              Alert.alert('コイン不足', 'アリーナコインが足りません');
              return;
            }

            if (shopItem.type === 'item' && shopItem.itemData) {
              const { type, rarity, attack, defense } = shopItem.itemData;
              addItem({
                name: shopItem.name,
                type,
                rarity,
                description: shopItem.description,
                attack: attack > 0 ? attack : undefined,
                defense: defense > 0 ? defense : undefined,
              });
              Alert.alert('購入完了！', `「${shopItem.name}」をインベントリに追加しました`);
            } else if (shopItem.type === 'title' && shopItem.titleData) {
              setTitle(shopItem.titleData);
              Alert.alert('称号取得！', `称号「${shopItem.titleData}」を設定しました`);
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.header}>【 アリーナショップ 】</Text>

      <PixelBorder style={styles.coinDisplay} color={Colors.orange}>
        <Text style={styles.coinLabel}>所持アリーナコイン</Text>
        <Text style={styles.coinValue}>{arenaCoins} コイン</Text>
        <Text style={styles.coinNote}>
          闘技場での勝利でコインを獲得できます
        </Text>
      </PixelBorder>

      <Text style={styles.sectionHeader}>【 アイテム一覧 】</Text>

      {ARENA_SHOP_ITEMS.map(item => (
        <ShopItemCard
          key={item.id}
          item={item}
          arenaCoins={arenaCoins}
          onBuy={handleBuy}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.lg, gap: Spacing.md },
  header: {
    fontFamily: Fonts.monoBold,
    fontSize: Fonts.size.xl,
    color: Colors.gold,
    textAlign: 'center',
    letterSpacing: 2,
  },
  coinDisplay: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  coinLabel: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.xs,
    color: Colors.textDim,
    letterSpacing: 1,
  },
  coinValue: {
    fontFamily: Fonts.monoBold,
    fontSize: Fonts.size.xxl,
    color: Colors.orange,
  },
  coinNote: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.xs,
    color: Colors.textDim,
    textAlign: 'center',
  },
  sectionHeader: {
    fontFamily: Fonts.monoBold,
    fontSize: Fonts.size.lg,
    color: Colors.text,
    letterSpacing: 2,
    textAlign: 'center',
  },
  itemCard: { gap: Spacing.sm },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  titleBadge: {
    backgroundColor: Colors.purple,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  titleBadgeText: {
    fontFamily: Fonts.monoBold,
    fontSize: Fonts.size.xs,
    color: Colors.white,
  },
  itemName: {
    flex: 1,
    fontFamily: Fonts.monoBold,
    fontSize: Fonts.size.md,
    color: Colors.white,
  },
  itemDesc: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.xs,
    color: Colors.textDim,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  typeLabel: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.xs,
    color: Colors.textDim,
    borderWidth: 1,
    borderColor: Colors.borderDim,
    paddingHorizontal: Spacing.xs,
  },
  statText: {
    fontFamily: Fonts.monoBold,
    fontSize: Fonts.size.sm,
  },
  titlePreview: {
    fontFamily: Fonts.monoBold,
    fontSize: Fonts.size.md,
    color: Colors.gold,
    textAlign: 'center',
    letterSpacing: 2,
  },
  buyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  costBox: { gap: 2 },
  costLabel: {
    fontFamily: Fonts.mono,
    fontSize: Fonts.size.xs,
    color: Colors.textDim,
  },
  costValue: {
    fontFamily: Fonts.monoBold,
    fontSize: Fonts.size.md,
  },
  buyBtn: {
    paddingHorizontal: Spacing.lg,
  },
});
