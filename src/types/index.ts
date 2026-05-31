export type QuestDifficulty = 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
export type QuestStatus = 'available' | 'active' | 'completed' | 'failed';
export type GuildRank = 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
export type ItemType = 'weapon' | 'armor' | 'accessory' | 'consumable';
export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Quest {
  id: string;
  title: string;
  description: string;
  conditions?: string;
  deadline?: number;
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

export type ArenaRank = 'novice' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'legend';

export interface Opponent {
  id: string;
  name: string;
  level: number;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  arenaRank: ArenaRank;
  reward: {
    exp: number;
    gold: number;
    arenaCoins: number;
  };
}

export interface BattleLogEntry {
  turn: number;
  attacker: 'player' | 'opponent';
  damage: number;
  playerHp: number;
  opponentHp: number;
}

export interface BattleRecord {
  id: string;
  opponentId: string;
  opponentName: string;
  won: boolean;
  earnedExp: number;
  earnedGold: number;
  earnedCoins: number;
  battleLog: BattleLogEntry[];
  createdAt: number;
}
