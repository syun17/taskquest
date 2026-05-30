export type QuestDifficulty = 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
export type QuestStatus = 'available' | 'active' | 'completed' | 'failed';
export type GuildRank = 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
export type ItemType = 'weapon' | 'armor' | 'accessory' | 'consumable';
export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Quest {
  id: string;
  title: string;
  description: string;
  difficulty: QuestDifficulty;
  reward: {
    exp: number;
    gold: number;
  };
  status: QuestStatus;
  createdAt: number;
  acceptedAt?: number;
  completedAt?: number;
}

export interface Character {
  name: string;
  level: number;
  exp: number;
  expToNext: number;
  gold: number;
  guildRank: GuildRank;
  title: string;
  completedQuests: number;
  maxDailyGacha: number;
  dailyGachaUsed: number;
  lastGachaReset: number;
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  description: string;
  attack?: number;
  defense?: number;
  equipped: boolean;
  obtainedAt: number;
}
