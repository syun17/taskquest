import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Character, JobId, SkillId } from '../types';
import { getExpToNext, getRankForLevel, GUILD_RANK_NAMES, SKILL_TREE, JOB_DATA } from '../constants/gameData';

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
  mp: 50,
  maxMp: 50,
  skillPoints: 0,
  unlockedSkills: [],
  equippedSkills: [],
  jobId: null,
  incarnationCount: 0,
  incarnationBonus: { atkBonus: 0, defBonus: 0 },
};

interface CharacterStore {
  character: Character;
  isLoaded: boolean;
  load: () => Promise<void>;
  save: (char: Character) => Promise<void>;
  gainExp: (amount: number) => void;
  gainGold: (amount: number) => void;
  spendGold: (amount: number) => boolean;
  setName: (name: string) => void;
  setTitle: (title: string) => void;
  incrementCompletedQuests: () => void;
  unlockSkill: (skillId: SkillId) => boolean;
  equipSkill: (skillId: SkillId) => boolean;
  unequipSkill: (skillId: SkillId) => void;
  setJob: (jobId: JobId) => boolean;
  incarnate: () => boolean;
}

export const useCharacterStore = create<CharacterStore>((set, get) => ({
  character: initialCharacter,
  isLoaded: false,

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        const character: Character = {
          ...initialCharacter,
          ...saved,
          completedQuests: typeof saved.completedQuests === 'number' && !isNaN(saved.completedQuests)
            ? saved.completedQuests : 0,
          mp: saved.mp ?? initialCharacter.mp,
          maxMp: saved.maxMp ?? initialCharacter.maxMp,
          skillPoints: saved.skillPoints ?? 0,
          unlockedSkills: saved.unlockedSkills ?? [],
          equippedSkills: saved.equippedSkills ?? [],
          jobId: saved.jobId ?? null,
          incarnationCount: saved.incarnationCount ?? 0,
          incarnationBonus: saved.incarnationBonus ?? { atkBonus: 0, defBonus: 0 },
        };
        set({ character, isLoaded: true });
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
    let { exp, level, skillPoints } = character;
    const prevLevel = level;
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

    // 2レベルごとにSP+1
    const levelsGained = level - prevLevel;
    const newSp = skillPoints + Math.floor(levelsGained / 2);

    const newRank = getRankForLevel(level);
    const newMaxMp = 50 + level * 5;
    const updated: Character = {
      ...character,
      exp,
      level,
      expToNext: getExpToNext(level),
      guildRank: newRank,
      title: character.jobId ? character.title : GUILD_RANK_NAMES[newRank],
      skillPoints: newSp,
      maxMp: newMaxMp,
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

  setName: (name: string) => {
    const { character, save } = get();
    const updated = { ...character, name };
    set({ character: updated });
    save(updated);
  },

  setTitle: (title: string) => {
    const { character, save } = get();
    const updated = { ...character, title };
    set({ character: updated });
    save(updated);
  },

  incrementCompletedQuests: () => {
    const { character, save } = get();
    const updated = { ...character, completedQuests: character.completedQuests + 1 };
    set({ character: updated });
    save(updated);
  },

  unlockSkill: (skillId: SkillId): boolean => {
    const { character, save } = get();
    const node = SKILL_TREE.find(n => n.skillId === skillId);
    if (!node) return false;
    if (character.level < node.requiredLevel) return false;
    if (character.skillPoints < node.spCost) return false;
    if (node.prerequisite && !character.unlockedSkills.includes(node.prerequisite)) return false;
    if (character.unlockedSkills.includes(skillId)) return false;

    const updated: Character = {
      ...character,
      skillPoints: character.skillPoints - node.spCost,
      unlockedSkills: [...character.unlockedSkills, skillId],
    };
    set({ character: updated });
    save(updated);
    return true;
  },

  equipSkill: (skillId: SkillId): boolean => {
    const { character, save } = get();
    if (!character.unlockedSkills.includes(skillId)) return false;
    if (character.equippedSkills.includes(skillId)) return false;
    if (character.equippedSkills.length >= 3) return false;

    const updated: Character = {
      ...character,
      equippedSkills: [...character.equippedSkills, skillId],
    };
    set({ character: updated });
    save(updated);
    return true;
  },

  unequipSkill: (skillId: SkillId) => {
    const { character, save } = get();
    const updated: Character = {
      ...character,
      equippedSkills: character.equippedSkills.filter(id => id !== skillId),
    };
    set({ character: updated });
    save(updated);
  },

  setJob: (jobId: JobId): boolean => {
    const { character, save } = get();
    const isInitial = character.jobId === null;
    if (!isInitial) {
      const cost = JOB_DATA[jobId].changeCost;
      if (character.gold < cost) return false;
    }
    const cost = isInitial ? 0 : JOB_DATA[jobId].changeCost;
    const updated: Character = {
      ...character,
      jobId,
      gold: character.gold - cost,
    };
    set({ character: updated });
    save(updated);
    return true;
  },

  incarnate: (): boolean => {
    const { character, save } = get();
    if (character.level < 50) return false;

    const newBonus = {
      atkBonus: character.incarnationBonus.atkBonus + 5,
      defBonus: character.incarnationBonus.defBonus + 3,
    };
    const updated: Character = {
      ...character,
      level: 1,
      exp: 0,
      expToNext: getExpToNext(1),
      gold: 0,
      guildRank: 'F',
      title: GUILD_RANK_NAMES['F'],
      incarnationCount: character.incarnationCount + 1,
      incarnationBonus: newBonus,
      skillPoints: 0,
    };
    set({ character: updated });
    save(updated);
    return true;
  },
}));
