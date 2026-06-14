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
  deadline?: string;
  tags?: string[];
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

// スキル
export type SkillId = 'slash' | 'fireball' | 'heal' | 'shield' | 'poison' | 'haste' | 'rend' | 'divine_light';
export type SkillEffectType = 'damage' | 'heal' | 'buff' | 'debuff';

export interface SkillEffect {
  type: SkillEffectType;
  power: number;
  target: 'self' | 'opponent';
  stat?: 'attack' | 'defense' | 'speed';
  duration?: number;
}

export interface Skill {
  id: SkillId;
  name: string;
  description: string;
  mpCost: number;
  effect: SkillEffect;
}

export interface SkillTreeNode {
  skillId: SkillId;
  requiredLevel: number;
  prerequisite?: SkillId;
  spCost: number;
}

// 職業
export type JobId = 'warrior' | 'mage' | 'rogue' | 'priest';

export interface JobBonus {
  atkMult: number;
  defMult: number;
  spdMult: number;
  hpMult: number;
  mpMult: number;
  skillPowerMult: number;
}

export interface JobData {
  id: JobId;
  name: string;
  description: string;
  icon: string;
  changeCost: number;
  bonus: JobBonus;
}

// バトルモード
export type BattleMode = 'auto' | 'manual';

export interface ManualBattleState {
  playerHp: number;
  opponentHp: number;
  playerMp: number;
  turn: number;
  isPlayerDefending: boolean;
  log: BattleLogEntry[];
  isPlayerTurn: boolean;
  buffPlayerDef: number;
  debuffOpponentDef: number;
  poisonTurns: number;
  hasteTurns: number;
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
  mp: number;
  maxMp: number;
  skillPoints: number;
  unlockedSkills: SkillId[];
  equippedSkills: SkillId[];
  jobId: JobId | null;
  incarnationCount: number;
  incarnationBonus: { atkBonus: number; defBonus: number };
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
  skillUsed?: SkillId;
  actionType?: 'attack' | 'skill' | 'defend' | 'heal';
  healAmount?: number;
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
