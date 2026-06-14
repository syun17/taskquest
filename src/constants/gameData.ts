import { GuildRank, JobBonus, JobData, JobId, QuestDifficulty, Skill, SkillId, SkillTreeNode } from '../types';

export const RANK_ORDER: GuildRank[] = ['F', 'E', 'D', 'C', 'B', 'A', 'S'];

export const GUILD_RANK_NAMES: Record<GuildRank, string> = {
  F: '見習い冒険者',
  E: '銅の盾士',
  D: '鉄の剣士',
  C: '銀の戦士',
  B: '金の勇者',
  A: '白金の英雄',
  S: '伝説の覇者',
};

export const DIFFICULTY_NAMES: Record<QuestDifficulty, string> = {
  F: 'Fランク',
  E: 'Eランク',
  D: 'Dランク',
  C: 'Cランク',
  B: 'Bランク',
  A: 'Aランク',
  S: 'Sランク',
};

// Exp required to reach each level
export const EXP_TABLE: number[] = [
  0,    // Lv1 -> Lv2: 100
  100,  // Lv2 -> Lv3: 200
  300,  // Lv3 -> Lv4: 350
  650,  // Lv4 -> Lv5: 500
  1150, // Lv5 -> Lv6: 700
  1850, // Lv6 -> Lv7: 1000
  2850, // Lv7 -> Lv8: 1400
  4250, // Lv8 -> Lv9: 1800
  6050, // Lv9 -> Lv10: 2500
  8550, // Lv10+
];

export function getExpToNext(level: number): number {
  if (level <= 0) return 100;
  const increments = [100, 200, 350, 500, 700, 1000, 1400, 1800, 2500, 3500];
  return increments[Math.min(level - 1, increments.length - 1)];
}

export function getRankForLevel(level: number): GuildRank {
  if (level >= 50) return 'S';
  if (level >= 30) return 'A';
  if (level >= 20) return 'B';
  if (level >= 12) return 'C';
  if (level >= 7) return 'D';
  if (level >= 3) return 'E';
  return 'F';
}

export const GACHA_RATES_BY_RANK: Record<GuildRank, { legendary: number; epic: number; rare: number }> = {
  F: { legendary: 2, epic: 10, rare: 28 },
  E: { legendary: 2, epic: 10, rare: 28 },
  D: { legendary: 3, epic: 14, rare: 38 },
  C: { legendary: 3, epic: 14, rare: 38 },
  B: { legendary: 8, epic: 24, rare: 38 },
  A: { legendary: 8, epic: 24, rare: 38 },
  S: { legendary: 15, epic: 35, rare: 35 },
};

export const DIFFICULTY_EXP: Record<QuestDifficulty, number> = {
  F: 20,
  E: 50,
  D: 120,
  C: 250,
  B: 500,
  A: 1000,
  S: 2500,
};

export const DIFFICULTY_GOLD: Record<QuestDifficulty, number> = {
  F: 10,
  E: 30,
  D: 80,
  C: 180,
  B: 400,
  A: 900,
  S: 2000,
};

export const SKILLS: Record<SkillId, Skill> = {
  slash: {
    id: 'slash', name: '斬撃', mpCost: 10,
    description: '力強い一撃。ダメージ1.5倍',
    effect: { type: 'damage', power: 1.5, target: 'opponent' },
  },
  fireball: {
    id: 'fireball', name: 'ファイアボール', mpCost: 20,
    description: '炎の弾を放つ。ダメージ2.2倍',
    effect: { type: 'damage', power: 2.2, target: 'opponent' },
  },
  heal: {
    id: 'heal', name: '回復魔法', mpCost: 15,
    description: 'HPを30回復する',
    effect: { type: 'heal', power: 30, target: 'self' },
  },
  shield: {
    id: 'shield', name: '鉄壁', mpCost: 8,
    description: '防御力を2ターン上昇させる',
    effect: { type: 'buff', power: 0.5, target: 'self', stat: 'defense', duration: 2 },
  },
  poison: {
    id: 'poison', name: '毒の刃', mpCost: 12,
    description: '敵を3ターン毒状態にする',
    effect: { type: 'debuff', power: 0.15, target: 'opponent', duration: 3 },
  },
  haste: {
    id: 'haste', name: '俊足', mpCost: 10,
    description: '速度を2ターン大幅上昇させる',
    effect: { type: 'buff', power: 1.0, target: 'self', stat: 'speed', duration: 2 },
  },
  rend: {
    id: 'rend', name: '鎧砕き', mpCost: 18,
    description: '敵の防御力を3ターン低下させる',
    effect: { type: 'debuff', power: 0.4, target: 'opponent', stat: 'defense', duration: 3 },
  },
  divine_light: {
    id: 'divine_light', name: '神聖光', mpCost: 25,
    description: 'HPを50回復する強力な魔法',
    effect: { type: 'heal', power: 50, target: 'self' },
  },
};

export const SKILL_TREE: SkillTreeNode[] = [
  { skillId: 'slash',        requiredLevel: 1,  spCost: 1 },
  { skillId: 'shield',       requiredLevel: 2,  spCost: 1 },
  { skillId: 'fireball',     requiredLevel: 3,  spCost: 1 },
  { skillId: 'heal',         requiredLevel: 3,  spCost: 1 },
  { skillId: 'rend',         requiredLevel: 5,  prerequisite: 'slash',    spCost: 2 },
  { skillId: 'haste',        requiredLevel: 6,  prerequisite: 'shield',   spCost: 2 },
  { skillId: 'poison',       requiredLevel: 8,  prerequisite: 'fireball', spCost: 2 },
  { skillId: 'divine_light', requiredLevel: 15, prerequisite: 'heal',     spCost: 3 },
];

export const JOB_DATA: Record<JobId, JobData> = {
  warrior: {
    id: 'warrior', name: '戦士', icon: '⚔️', changeCost: 500,
    description: 'HP・ATKに優れる近接戦闘のエキスパート',
    bonus: { atkMult: 1.3, defMult: 1.2, spdMult: 0.9, hpMult: 1.4, mpMult: 0.7, skillPowerMult: 1.0 } as JobBonus,
  },
  mage: {
    id: 'mage', name: '魔法使い', icon: '🔮', changeCost: 500,
    description: 'MP・スキル威力が高い。HPは低め',
    bonus: { atkMult: 0.8, defMult: 0.7, spdMult: 1.0, hpMult: 0.8, mpMult: 1.8, skillPowerMult: 1.5 } as JobBonus,
  },
  rogue: {
    id: 'rogue', name: '盗賊', icon: '🗡️', changeCost: 500,
    description: '速度特化。先制攻撃で優位に立つ',
    bonus: { atkMult: 1.1, defMult: 0.9, spdMult: 1.5, hpMult: 1.0, mpMult: 1.0, skillPowerMult: 1.1 } as JobBonus,
  },
  priest: {
    id: 'priest', name: '僧侶', icon: '✨', changeCost: 500,
    description: '回復スキルが強化される支援型',
    bonus: { atkMult: 0.9, defMult: 1.1, spdMult: 0.95, hpMult: 1.2, mpMult: 1.4, skillPowerMult: 1.3 } as JobBonus,
  },
};

export const GACHA_ITEMS = [
  { name: '錆びた短剣', type: 'weapon' as const, rarity: 'common' as const, attack: 5, defense: 0, description: '古びた冒険者の形見' },
  { name: '木の盾', type: 'armor' as const, rarity: 'common' as const, attack: 0, defense: 5, description: '粗削りだが丈夫な盾' },
  { name: '旅人のマント', type: 'armor' as const, rarity: 'common' as const, attack: 0, defense: 3, description: '軽くて動きやすい' },
  { name: '銀の剣', type: 'weapon' as const, rarity: 'rare' as const, attack: 18, defense: 0, description: '銀の輝きを持つ剣' },
  { name: '鉄の鎧', type: 'armor' as const, rarity: 'rare' as const, attack: 0, defense: 20, description: '堅牢な鉄製の鎧' },
  { name: '勇者のお守り', type: 'accessory' as const, rarity: 'rare' as const, attack: 5, defense: 5, description: '勇敢さを授ける護符' },
  { name: '魔剣オラクル', type: 'weapon' as const, rarity: 'epic' as const, attack: 45, defense: 0, description: '古代魔術で鍛えられた剣' },
  { name: '竜鱗の鎧', type: 'armor' as const, rarity: 'epic' as const, attack: 0, defense: 50, description: '竜の鱗で作られた最高の防具' },
  { name: '神器エクスカリバー', type: 'weapon' as const, rarity: 'legendary' as const, attack: 100, defense: 10, description: '伝説の聖剣' },
  { name: '不死の指輪', type: 'accessory' as const, rarity: 'legendary' as const, attack: 20, defense: 30, description: '着けた者に不死の力を与える' },
];
