import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Item, ItemRarity, GuildRank } from '../types';
import { GACHA_ITEMS, GACHA_RATES_BY_RANK } from '../constants/gameData';

const STORAGE_KEY = '@taskquest_inventory';

const RARITY_ORDER: ItemRarity[] = ['common', 'rare', 'epic', 'legendary'];

const PITY_EPIC_THRESHOLD = 20;
const PITY_LEGENDARY_THRESHOLD = 50;

function generateId(): string {
  return `item_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

function rollGachaItem(rank: GuildRank, forceRarity?: ItemRarity): Omit<Item, 'id' | 'equipped' | 'obtainedAt'> {
  let rarity: ItemRarity;
  if (forceRarity) {
    rarity = forceRarity;
  } else {
    const rates = GACHA_RATES_BY_RANK[rank];
    const roll = Math.random() * 100;
    if (roll < rates.legendary) rarity = 'legendary';
    else if (roll < rates.legendary + rates.epic) rarity = 'epic';
    else if (roll < rates.legendary + rates.epic + rates.rare) rarity = 'rare';
    else rarity = 'common';
  }

  const pool = GACHA_ITEMS.filter(i => i.rarity === rarity);
  const base = pool[Math.floor(Math.random() * pool.length)];
  return base;
}

interface InventoryStore {
  items: Item[];
  gachaPityCount: number;
  gachaHardPityCount: number;
  isLoaded: boolean;
  load: () => Promise<void>;
  save: () => Promise<void>;
  rollGacha: (rank: GuildRank) => { item: Item; triggeredPity: 'epic' | 'legendary' | null };
  addItem: (data: Omit<Item, 'id' | 'equipped' | 'obtainedAt'>) => Item;
  equipItem: (id: string) => void;
  unequipItem: (id: string) => void;
  sellItem: (id: string) => number;
  synthesizeItems: (itemName: string, rarity: ItemRarity) => Item | null;
  getTotalAttack: () => number;
  getTotalDefense: () => number;
}

export const useInventoryStore = create<InventoryStore>((set, get) => ({
  items: [],
  gachaPityCount: 0,
  gachaHardPityCount: 0,
  isLoaded: false,

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // 旧形式（アイテム配列のみ）との後方互換
          set({ items: parsed, gachaPityCount: 0, gachaHardPityCount: 0, isLoaded: true });
        } else {
          set({
            items: parsed.items ?? [],
            gachaPityCount: parsed.gachaPityCount ?? 0,
            gachaHardPityCount: parsed.gachaHardPityCount ?? 0,
            isLoaded: true,
          });
        }
      } else {
        set({ isLoaded: true });
      }
    } catch {
      set({ isLoaded: true });
    }
  },

  save: async () => {
    try {
      const { items, gachaPityCount, gachaHardPityCount } = get();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ items, gachaPityCount, gachaHardPityCount }));
    } catch {}
  },

  addItem: (data: Omit<Item, 'id' | 'equipped' | 'obtainedAt'>): Item => {
    const { items, save } = get();
    const newItem: Item = {
      ...data,
      id: generateId(),
      equipped: false,
      obtainedAt: Date.now(),
    };
    const updated = [...items, newItem];
    set({ items: updated });
    save();
    return newItem;
  },

  rollGacha: (rank: GuildRank): { item: Item; triggeredPity: 'epic' | 'legendary' | null } => {
    const { items, save } = get();
    let { gachaPityCount, gachaHardPityCount } = get();
    gachaPityCount++;
    gachaHardPityCount++;

    let triggeredPity: 'epic' | 'legendary' | null = null;
    let forceRarity: ItemRarity | undefined;

    if (gachaHardPityCount >= PITY_LEGENDARY_THRESHOLD) {
      forceRarity = 'legendary';
      triggeredPity = 'legendary';
      gachaPityCount = 0;
      gachaHardPityCount = 0;
    } else if (gachaPityCount >= PITY_EPIC_THRESHOLD) {
      // 80% epic, 20% legendary
      forceRarity = Math.random() < 0.2 ? 'legendary' : 'epic';
      triggeredPity = 'epic';
      gachaPityCount = 0;
      if (forceRarity === 'legendary') gachaHardPityCount = 0;
    }

    const base = rollGachaItem(rank, forceRarity);

    // 通常ロールで legendary / epic が出た場合もカウンターリセット
    if (!triggeredPity) {
      if (base.rarity === 'legendary') {
        gachaPityCount = 0;
        gachaHardPityCount = 0;
      } else if (base.rarity === 'epic') {
        gachaPityCount = 0;
      }
    }

    const newItem: Item = {
      ...base,
      id: generateId(),
      equipped: false,
      obtainedAt: Date.now(),
    };
    const updated = [...items, newItem];
    set({ items: updated, gachaPityCount, gachaHardPityCount });
    save();
    return { item: newItem, triggeredPity };
  },

  equipItem: (id) => {
    const { items, save } = get();
    const target = items.find(i => i.id === id);
    if (!target) return;

    const updated = items.map(i => {
      if (i.type === target.type && i.id !== id) return { ...i, equipped: false };
      if (i.id === id) return { ...i, equipped: true };
      return i;
    });
    set({ items: updated });
    save();
  },

  unequipItem: (id) => {
    const { items, save } = get();
    const updated = items.map(i => i.id === id ? { ...i, equipped: false } : i);
    set({ items: updated });
    save();
  },

  sellItem: (id): number => {
    const { items, save } = get();
    const item = items.find(i => i.id === id);
    if (!item || item.equipped) return 0;

    const prices: Record<ItemRarity, number> = {
      common: 15,
      rare: 60,
      epic: 200,
      legendary: 800,
    };
    const price = prices[item.rarity];
    const updated = items.filter(i => i.id !== id);
    set({ items: updated });
    save();
    return price;
  },

  synthesizeItems: (itemName: string, rarity: ItemRarity): Item | null => {
    const { items, save } = get();
    const rarityIndex = RARITY_ORDER.indexOf(rarity);
    if (rarityIndex === RARITY_ORDER.length - 1) return null;

    const targets = items.filter(i => i.name === itemName && i.rarity === rarity && !i.equipped);
    if (targets.length < 4) return null;

    const nextRarity = RARITY_ORDER[rarityIndex + 1];
    const targetItem = targets[0];
    const pool = GACHA_ITEMS.filter(i => i.type === targetItem.type && i.rarity === nextRarity);
    if (pool.length === 0) return null;

    const base = pool[Math.floor(Math.random() * pool.length)];
    const newItem: Item = {
      ...base,
      id: generateId(),
      equipped: false,
      obtainedAt: Date.now(),
    };

    let removed = 0;
    const updated = items.filter(i => {
      if (i.name === itemName && i.rarity === rarity && !i.equipped && removed < 4) {
        removed++;
        return false;
      }
      return true;
    });
    updated.push(newItem);
    set({ items: updated });
    save();
    return newItem;
  },

  getTotalAttack: () => {
    return get().items
      .filter(i => i.equipped && i.attack)
      .reduce((sum, i) => sum + (i.attack ?? 0), 0);
  },

  getTotalDefense: () => {
    return get().items
      .filter(i => i.equipped && i.defense)
      .reduce((sum, i) => sum + (i.defense ?? 0), 0);
  },
}));
