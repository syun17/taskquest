import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArenaRank, BattleRecord } from '../types';
import { ARENA_RANK_ORDER, ARENA_RANK_WIN_THRESHOLDS } from '../constants/arenaData';

const STORAGE_KEY = '@taskquest_arena';

function calcArenaRank(wins: number): ArenaRank {
  let rank: ArenaRank = 'novice';
  for (const r of ARENA_RANK_ORDER) {
    if (wins >= ARENA_RANK_WIN_THRESHOLDS[r]) {
      rank = r;
    } else {
      break;
    }
  }
  return rank;
}

interface BattleStoreState {
  arenaRank: ArenaRank;
  wins: number;
  losses: number;
  arenaCoins: number;
  battleHistory: BattleRecord[];
}

interface BattleStore extends BattleStoreState {
  isLoaded: boolean;
  load: () => Promise<void>;
  save: () => Promise<void>;
  recordBattle: (result: BattleRecord) => void;
  spendCoins: (amount: number) => boolean;
}

export const useBattleStore = create<BattleStore>((set, get) => ({
  arenaRank: 'novice',
  wins: 0,
  losses: 0,
  arenaCoins: 0,
  battleHistory: [],
  isLoaded: false,

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data: BattleStoreState = JSON.parse(raw);
        set({ ...data, isLoaded: true });
      } else {
        set({ isLoaded: true });
      }
    } catch {
      set({ isLoaded: true });
    }
  },

  save: async () => {
    try {
      const { arenaRank, wins, losses, arenaCoins, battleHistory } = get();
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ arenaRank, wins, losses, arenaCoins, battleHistory }),
      );
    } catch {}
  },

  recordBattle: (result: BattleRecord) => {
    set(state => {
      const wins = state.wins + (result.won ? 1 : 0);
      const losses = state.losses + (result.won ? 0 : 1);
      const arenaCoins = state.arenaCoins + result.earnedCoins;
      const arenaRank = calcArenaRank(wins);
      const battleHistory = [result, ...state.battleHistory].slice(0, 30);
      return { wins, losses, arenaCoins, arenaRank, battleHistory };
    });
    get().save();
  },

  spendCoins: (amount: number): boolean => {
    const { arenaCoins } = get();
    if (arenaCoins < amount) {
      return false;
    }
    set(state => ({ arenaCoins: state.arenaCoins - amount }));
    get().save();
    return true;
  },
}));
