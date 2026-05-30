import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Character } from '../types';
import { getExpToNext, getRankForLevel, getMaxDailyGacha, GUILD_RANK_NAMES } from '../constants/gameData';

const STORAGE_KEY = '@taskquest_character';

const initialCharacter: Character = {
  name: '冒険者',
  level: 1,
  exp: 0,
  expToNext: 100,
  gold: 50,
  guildRank: 'F',
  title: '見習い冒険者',
  completedQuests: 0,
  maxDailyGacha: 1,
  dailyGachaUsed: 0,
  lastGachaReset: Date.now(),
};

interface CharacterStore {
  character: Character;
  isLoaded: boolean;
  load: () => Promise<void>;
  save: (char: Character) => Promise<void>;
  gainExp: (amount: number) => void;
  gainGold: (amount: number) => void;
  spendGold: (amount: number) => boolean;
  useGacha: () => boolean;
  setName: (name: string) => void;
}

export const useCharacterStore = create<CharacterStore>((set, get) => ({
  character: initialCharacter,
  isLoaded: false,

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved: Character = JSON.parse(raw);
        // Reset daily gacha if it's a new day
        const now = Date.now();
        const lastReset = new Date(saved.lastGachaReset);
        const today = new Date(now);
        if (lastReset.toDateString() !== today.toDateString()) {
          saved.dailyGachaUsed = 0;
          saved.lastGachaReset = now;
        }
        set({ character: saved, isLoaded: true });
      } else {
        set({ isLoaded: true });
      }
    } catch {
      set({ isLoaded: true });
    }
  },

  save: async (char: Character) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(char));
    } catch {}
  },

  gainExp: (amount: number) => {
    const { character, save } = get();
    let { exp, level } = character;
    exp += amount;

    while (true) {
      const needed = getExpToNext(level);
      if (exp >= needed) {
        exp -= needed;
        level += 1;
      } else {
        break;
      }
    }

    const newRank = getRankForLevel(level);
    const updated: Character = {
      ...character,
      exp,
      level,
      expToNext: getExpToNext(level),
      guildRank: newRank,
      title: GUILD_RANK_NAMES[newRank],
      maxDailyGacha: getMaxDailyGacha(level),
    };
    set({ character: updated });
    save(updated);
  },

  gainGold: (amount: number) => {
    const { character, save } = get();
    const updated = { ...character, gold: character.gold + amount };
    set({ character: updated });
    save(updated);
  },

  spendGold: (amount: number): boolean => {
    const { character, save } = get();
    if (character.gold < amount) return false;
    const updated = { ...character, gold: character.gold - amount };
    set({ character: updated });
    save(updated);
    return true;
  },

  useGacha: (): boolean => {
    const { character, save } = get();
    if (character.dailyGachaUsed >= character.maxDailyGacha) return false;
    const updated = { ...character, dailyGachaUsed: character.dailyGachaUsed + 1 };
    set({ character: updated });
    save(updated);
    return true;
  },

  setName: (name: string) => {
    const { character, save } = get();
    const updated = { ...character, name };
    set({ character: updated });
    save(updated);
  },
}));
