import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AchievementId } from '../constants/achievementData';

const STORAGE_KEY = '@taskquest_achievements';

interface AchievementStore {
  unlockedIds: AchievementId[];
  isLoaded: boolean;
  load: () => Promise<void>;
  unlock: (id: AchievementId) => boolean;
  isUnlocked: (id: AchievementId) => boolean;
}

export const useAchievementStore = create<AchievementStore>((set, get) => ({
  unlockedIds: [],
  isLoaded: false,

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        set({ unlockedIds: JSON.parse(raw), isLoaded: true });
      } else {
        set({ isLoaded: true });
      }
    } catch {
      set({ isLoaded: true });
    }
  },

  unlock: (id: AchievementId): boolean => {
    const { unlockedIds } = get();
    if (unlockedIds.includes(id)) return false;
    const updated = [...unlockedIds, id];
    set({ unlockedIds: updated });
    try {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    return true;
  },

  isUnlocked: (id: AchievementId): boolean => get().unlockedIds.includes(id),
}));
