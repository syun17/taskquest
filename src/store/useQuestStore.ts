import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Quest, QuestDifficulty } from '../types';
import { DIFFICULTY_EXP, DIFFICULTY_GOLD } from '../constants/gameData';

const STORAGE_KEY = '@taskquest_quests';

function generateId(): string {
  return `quest_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

const SAMPLE_QUESTS: Quest[] = [
  {
    id: generateId(),
    title: '水を1杯飲む',
    description: '水分補給は冒険者の基本！今すぐ水を1杯飲もう。',
    difficulty: 'F',
    reward: { exp: DIFFICULTY_EXP.F, gold: DIFFICULTY_GOLD.F },
    status: 'available',
    createdAt: Date.now(),
  },
  {
    id: generateId(),
    title: '30分間勉強する',
    description: '知識は冒険者の武器。集中して30分間勉強せよ。',
    difficulty: 'E',
    reward: { exp: DIFFICULTY_EXP.E, gold: DIFFICULTY_GOLD.E },
    status: 'available',
    createdAt: Date.now(),
  },
  {
    id: generateId(),
    title: '1時間運動する',
    description: '肉体を鍛えることで、より強い冒険者になれる。',
    difficulty: 'D',
    reward: { exp: DIFFICULTY_EXP.D, gold: DIFFICULTY_GOLD.D },
    status: 'available',
    createdAt: Date.now(),
  },
];

interface QuestStore {
  quests: Quest[];
  isLoaded: boolean;
  load: () => Promise<void>;
  save: (quests: Quest[]) => Promise<void>;
  addQuest: (title: string, description: string, difficulty: QuestDifficulty, conditions?: string, deadline?: number) => void;
  acceptQuest: (id: string) => void;
  completeQuest: (id: string) => { exp: number; gold: number } | null;
  abandonQuest: (id: string) => void;
  deleteQuest: (id: string) => void;
  getAvailableQuests: () => Quest[];
  getActiveQuests: () => Quest[];
  getCompletedQuests: () => Quest[];
}

export const useQuestStore = create<QuestStore>((set, get) => ({
  quests: [],
  isLoaded: false,

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        set({ quests: JSON.parse(raw), isLoaded: true });
      } else {
        set({ quests: SAMPLE_QUESTS, isLoaded: true });
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_QUESTS));
      }
    } catch {
      set({ quests: SAMPLE_QUESTS, isLoaded: true });
    }
  },

  save: async (quests: Quest[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(quests));
    } catch {}
  },

  addQuest: (title, description, difficulty, conditions, deadline) => {
    const { quests, save } = get();
    const quest: Quest = {
      id: generateId(),
      title,
      description,
      conditions,
      deadline,
      difficulty,
      reward: { exp: DIFFICULTY_EXP[difficulty], gold: DIFFICULTY_GOLD[difficulty] },
      status: 'available',
      createdAt: Date.now(),
    };
    const updated = [...quests, quest];
    set({ quests: updated });
    save(updated);
  },

  acceptQuest: (id) => {
    const { quests, save } = get();
    const updated = quests.map(q =>
      q.id === id ? { ...q, status: 'active' as const, acceptedAt: Date.now() } : q,
    );
    set({ quests: updated });
    save(updated);
  },

  completeQuest: (id) => {
    const { quests, save } = get();
    const quest = quests.find(q => q.id === id);
    if (!quest || quest.status !== 'active') return null;

    const updated = quests.map(q =>
      q.id === id ? { ...q, status: 'completed' as const, completedAt: Date.now() } : q,
    );
    set({ quests: updated });
    save(updated);
    return quest.reward;
  },

  abandonQuest: (id) => {
    const { quests, save } = get();
    const updated = quests.map(q =>
      q.id === id ? { ...q, status: 'available' as const, acceptedAt: undefined } : q,
    );
    set({ quests: updated });
    save(updated);
  },

  deleteQuest: (id) => {
    const { quests, save } = get();
    const updated = quests.filter(q => q.id !== id);
    set({ quests: updated });
    save(updated);
  },

  getAvailableQuests: () => get().quests.filter(q => q.status === 'available'),
  getActiveQuests: () => get().quests.filter(q => q.status === 'active'),
  getCompletedQuests: () => get().quests.filter(q => q.status === 'completed'),
}));
