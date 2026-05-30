import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Item, ItemRarity } from '../types';
import { GACHA_ITEMS } from '../constants/gameData';

const STORAGE_KEY = '@taskquest_inventory';

function generateId(): string {
  return `item_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

function rollGacha(): Omit<Item, 'id' | 'equipped' | 'obtainedAt'> {
  // Rarity weights: common 60%, rare 28%, epic 10%, legendary 2%
  const roll = Math.random() * 100;
  let rarity: ItemRarity;
  if (roll < 2) rarity = 'legendary';
  else if (roll < 12) rarity = 'epic';
  else if (roll < 40) rarity = 'rare';
  else rarity = 'common';

  const pool = GACHA_ITEMS.filter(i => i.rarity === rarity);
  const base = pool[Math.floor(Math.random() * pool.length)];
  return base;
}

interface InventoryStore {
  items: Item[];
  isLoaded: boolean;
  load: () => Promise<void>;
  save: (items: Item[]) => Promise<void>;
  rollGacha: () => Item;
  equipItem: (id: string) => void;
  unequipItem: (id: string) => void;
  sellItem: (id: string) => number;
  getTotalAttack: () => number;
  getTotalDefense: () => number;
}

export const useInventoryStore = create<InventoryStore>((set, get) => ({
  items: [],
  isLoaded: false,

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        set({ items: JSON.parse(raw), isLoaded: true });
      } else {
        set({ isLoaded: true });
      }
    } catch {
      set({ isLoaded: true });
    }
  },

  save: async (items: Item[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  },

  rollGacha: (): Item => {
    const { items, save } = get();
    const base = rollGacha();
    const newItem: Item = {
      ...base,
      id: generateId(),
      equipped: false,
      obtainedAt: Date.now(),
    };
    const updated = [...items, newItem];
    set({ items: updated });
    save(updated);
    return newItem;
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
    save(updated);
  },

  unequipItem: (id) => {
    const { items, save } = get();
    const updated = items.map(i => i.id === id ? { ...i, equipped: false } : i);
    set({ items: updated });
    save(updated);
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
    save(updated);
    return price;
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
