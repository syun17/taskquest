import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuestDifficulty, GuildRank } from '../types';
import { DAILY_QUEST_TEMPLATES, DailyGoalType } from '../constants/dailyQuestTemplates';
import { DIFFICULTY_EXP, DIFFICULTY_GOLD } from '../constants/gameData';

const STORAGE_KEY = '@taskquest_daily_quests';
const DAILY_REFRESH_MS = 24 * 60 * 60 * 1000;
const DAILY_BONUS_MULTIPLIER = 1.5;
const DAILY_QUEST_COUNT = 3;

export interface DailyQuest {
  id: string;
  templateId: string;
  goalType: DailyGoalType;
  goalCount: number;
  title: string;
  description: string;
  difficulty: QuestDifficulty;
  reward: { exp: number; gold: number };
  progress: number;
  isCompleted: boolean;
}

interface DailyQuestStore {
  dailyQuests: DailyQuest[];
  lastRefreshAt: number;
  isLoaded: boolean;
  load: () => Promise<void>;
  save: () => Promise<void>;
  refreshIfNeeded: (guildRank: GuildRank) => void;
  recordGoalEvent: (goalType: DailyGoalType, context?: { difficulty?: QuestDifficulty }) => { exp: number; gold: number }[];
  getTimeUntilReset: () => number;
}

function generateDailyQuests(): DailyQuest[] {
  const shuffled = [...DAILY_QUEST_TEMPLATES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, DAILY_QUEST_COUNT).map(t => ({
    id: `daily_${t.templateId}_${Date.now()}`,
    templateId: t.templateId,
    goalType: t.goalType,
    goalCount: t.goalCount,
    title: t.title,
    description: t.description,
    difficulty: t.difficulty,
    reward: {
      exp: Math.floor(DIFFICULTY_EXP[t.difficulty] * DAILY_BONUS_MULTIPLIER),
      gold: Math.floor(DIFFICULTY_GOLD[t.difficulty] * DAILY_BONUS_MULTIPLIER),
    },
    progress: 0,
    isCompleted: false,
  }));
}

function difficultyRank(d: QuestDifficulty): number {
  return ['F', 'E', 'D', 'C', 'B', 'A', 'S'].indexOf(d);
}

export const useDailyQuestStore = create<DailyQuestStore>((set, get) => ({
  dailyQuests: [],
  lastRefreshAt: 0,
  isLoaded: false,

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        set({ dailyQuests: parsed.dailyQuests ?? [], lastRefreshAt: parsed.lastRefreshAt ?? 0, isLoaded: true });
      } else {
        set({ isLoaded: true });
      }
    } catch {
      set({ isLoaded: true });
    }
  },

  save: async () => {
    try {
      const { dailyQuests, lastRefreshAt } = get();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ dailyQuests, lastRefreshAt }));
    } catch {}
  },

  refreshIfNeeded: (_guildRank: GuildRank) => {
    const { lastRefreshAt, save } = get();
    if (Date.now() - lastRefreshAt < DAILY_REFRESH_MS && get().dailyQuests.length > 0) return;
    const dailyQuests = generateDailyQuests();
    const lastRefreshAt2 = Date.now();
    set({ dailyQuests, lastRefreshAt: lastRefreshAt2 });
    save();
  },

  recordGoalEvent: (goalType: DailyGoalType, context?: { difficulty?: QuestDifficulty }): { exp: number; gold: number }[] => {
    const { dailyQuests, save } = get();
    const rewards: { exp: number; gold: number }[] = [];

    const updated = dailyQuests.map(q => {
      if (q.isCompleted || q.goalType !== goalType) return q;

      // difficulty フィルタ
      if (goalType === 'complete_f_rank' && context?.difficulty !== 'F') return q;
      if (goalType === 'complete_d_rank_or_higher' && context?.difficulty !== undefined) {
        if (difficultyRank(context.difficulty) < difficultyRank('D')) return q;
      }

      const newProgress = q.progress + 1;
      const isCompleted = newProgress >= q.goalCount;
      if (isCompleted) rewards.push(q.reward);
      return { ...q, progress: newProgress, isCompleted };
    });

    set({ dailyQuests: updated });
    save();
    return rewards;
  },

  getTimeUntilReset: (): number => {
    const { lastRefreshAt } = get();
    return Math.max(0, lastRefreshAt + DAILY_REFRESH_MS - Date.now());
  },
}));
