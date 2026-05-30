import { GuildRank, QuestDifficulty } from '../types';

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

export function getMaxDailyGacha(level: number): number {
  if (level >= 30) return 5;
  if (level >= 20) return 4;
  if (level >= 10) return 3;
  if (level >= 5) return 2;
  return 1;
}

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
