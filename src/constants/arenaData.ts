import { ArenaRank, Opponent } from '../types';

export const ARENA_RANK_NAMES: Record<ArenaRank, string> = {
  novice: '新人',
  bronze: '銅剣士',
  silver: '銀剣士',
  gold: '金剣士',
  platinum: '白金剣士',
  legend: '伝説の闘士',
};

export const ARENA_RANK_ORDER: ArenaRank[] = ['novice', 'bronze', 'silver', 'gold', 'platinum', 'legend'];

export const ARENA_RANK_WIN_THRESHOLDS: Record<ArenaRank, number> = {
  novice: 0,
  bronze: 3,
  silver: 8,
  gold: 15,
  platinum: 25,
  legend: 40,
};

export const ARENA_RANK_COLORS: Record<ArenaRank, string> = {
  novice: '#9e9e9e',
  bronze: '#cd7f32',
  silver: '#c0c0c0',
  gold: '#f5c518',
  platinum: '#e5e4e2',
  legend: '#ff9800',
};

export const OPPONENTS_BY_RANK: Record<ArenaRank, Opponent[]> = {
  novice: [
    {
      id: 'opp_n1',
      name: 'スライム',
      level: 1,
      hp: 80,
      attack: 6,
      defense: 1,
      speed: 2,
      arenaRank: 'novice',
      reward: { exp: 15, gold: 8, arenaCoins: 3 },
    },
    {
      id: 'opp_n2',
      name: 'ゴブリン見習い',
      level: 3,
      hp: 120,
      attack: 11,
      defense: 3,
      speed: 5,
      arenaRank: 'novice',
      reward: { exp: 25, gold: 12, arenaCoins: 5 },
    },
    {
      id: 'opp_n3',
      name: 'コボルト戦士',
      level: 5,
      hp: 160,
      attack: 14,
      defense: 5,
      speed: 7,
      arenaRank: 'novice',
      reward: { exp: 35, gold: 15, arenaCoins: 8 },
    },
  ],
  bronze: [
    {
      id: 'opp_b1',
      name: 'オーク雑兵',
      level: 8,
      hp: 300,
      attack: 22,
      defense: 10,
      speed: 8,
      arenaRank: 'bronze',
      reward: { exp: 70, gold: 35, arenaCoins: 12 },
    },
    {
      id: 'opp_b2',
      name: '山賊の頭',
      level: 10,
      hp: 450,
      attack: 30,
      defense: 12,
      speed: 11,
      arenaRank: 'bronze',
      reward: { exp: 100, gold: 50, arenaCoins: 16 },
    },
    {
      id: 'opp_b3',
      name: '傭兵のロガン',
      level: 12,
      hp: 600,
      attack: 38,
      defense: 15,
      speed: 14,
      arenaRank: 'bronze',
      reward: { exp: 130, gold: 65, arenaCoins: 20 },
    },
  ],
  silver: [
    {
      id: 'opp_s1',
      name: '銀狼騎士',
      level: 16,
      hp: 900,
      attack: 55,
      defense: 25,
      speed: 16,
      arenaRank: 'silver',
      reward: { exp: 220, gold: 110, arenaCoins: 32 },
    },
    {
      id: 'opp_s2',
      name: '魔術師ヴァルム',
      level: 18,
      hp: 750,
      attack: 70,
      defense: 18,
      speed: 23,
      arenaRank: 'silver',
      reward: { exp: 280, gold: 140, arenaCoins: 40 },
    },
    {
      id: 'opp_s3',
      name: '不死鳥の戦士',
      level: 20,
      hp: 1200,
      attack: 50,
      defense: 35,
      speed: 14,
      arenaRank: 'silver',
      reward: { exp: 350, gold: 175, arenaCoins: 50 },
    },
  ],
  gold: [
    {
      id: 'opp_g1',
      name: '元A級冒険者',
      level: 25,
      hp: 1800,
      attack: 90,
      defense: 50,
      speed: 25,
      arenaRank: 'gold',
      reward: { exp: 550, gold: 275, arenaCoins: 65 },
    },
    {
      id: 'opp_g2',
      name: '竜族の若者',
      level: 28,
      hp: 2200,
      attack: 100,
      defense: 45,
      speed: 22,
      arenaRank: 'gold',
      reward: { exp: 700, gold: 350, arenaCoins: 80 },
    },
    {
      id: 'opp_g3',
      name: '魔剣士カーラン',
      level: 30,
      hp: 1500,
      attack: 115,
      defense: 40,
      speed: 35,
      arenaRank: 'gold',
      reward: { exp: 900, gold: 450, arenaCoins: 100 },
    },
  ],
  platinum: [
    {
      id: 'opp_p1',
      name: '白金の守護者',
      level: 38,
      hp: 3500,
      attack: 150,
      defense: 100,
      speed: 38,
      arenaRank: 'platinum',
      reward: { exp: 1300, gold: 650, arenaCoins: 130 },
    },
    {
      id: 'opp_p2',
      name: '伝説の傭兵ガイウス',
      level: 43,
      hp: 5000,
      attack: 170,
      defense: 90,
      speed: 43,
      arenaRank: 'platinum',
      reward: { exp: 1700, gold: 850, arenaCoins: 170 },
    },
    {
      id: 'opp_p3',
      name: '影の暗殺者',
      level: 40,
      hp: 3000,
      attack: 195,
      defense: 80,
      speed: 58,
      arenaRank: 'platinum',
      reward: { exp: 2000, gold: 1000, arenaCoins: 200 },
    },
  ],
  legend: [
    {
      id: 'opp_l1',
      name: '魔王の使者バアル',
      level: 55,
      hp: 7000,
      attack: 210,
      defense: 145,
      speed: 55,
      arenaRank: 'legend',
      reward: { exp: 3500, gold: 1750, arenaCoins: 350 },
    },
    {
      id: 'opp_l2',
      name: '竜王ファフニール',
      level: 65,
      hp: 10000,
      attack: 240,
      defense: 180,
      speed: 48,
      arenaRank: 'legend',
      reward: { exp: 5000, gold: 2500, arenaCoins: 500 },
    },
    {
      id: 'opp_l3',
      name: '滅亡の騎士ダリウス',
      level: 60,
      hp: 8500,
      attack: 260,
      defense: 160,
      speed: 68,
      arenaRank: 'legend',
      reward: { exp: 6000, gold: 3000, arenaCoins: 600 },
    },
  ],
};

export function findOpponentById(id: string): Opponent | undefined {
  for (const opponents of Object.values(OPPONENTS_BY_RANK)) {
    const found = opponents.find(o => o.id === id);
    if (found) return found;
  }
  return undefined;
}

export interface ArenaShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: 'item' | 'title';
  itemData?: {
    type: 'weapon' | 'armor' | 'accessory';
    rarity: 'rare' | 'epic' | 'legendary';
    attack: number;
    defense: number;
  };
  titleData?: string;
}

export const ARENA_SHOP_ITEMS: ArenaShopItem[] = [
  {
    id: 'shop_001',
    name: '闘技場の短剣',
    description: '闘技場の勝者だけが入手できる短剣',
    cost: 30,
    type: 'item',
    itemData: { type: 'weapon', rarity: 'rare', attack: 22, defense: 0 },
  },
  {
    id: 'shop_002',
    name: '鉄壁の盾',
    description: '無数の戦いをくぐり抜けた頑強な盾',
    cost: 30,
    type: 'item',
    itemData: { type: 'armor', rarity: 'rare', attack: 0, defense: 22 },
  },
  {
    id: 'shop_003',
    name: '称号「剣闘士」',
    description: '闘技場での戦いを経験した者の称号',
    cost: 80,
    type: 'title',
    titleData: '剣闘士',
  },
  {
    id: 'shop_004',
    name: '闘神の剣',
    description: '闘技場の神に選ばれた者だけが持てる剣',
    cost: 180,
    type: 'item',
    itemData: { type: 'weapon', rarity: 'epic', attack: 55, defense: 0 },
  },
  {
    id: 'shop_005',
    name: '英雄の鎧',
    description: '歴代チャンピオンが着用してきた鎧',
    cost: 180,
    type: 'item',
    itemData: { type: 'armor', rarity: 'epic', attack: 0, defense: 55 },
  },
  {
    id: 'shop_006',
    name: '称号「闘技場の覇者」',
    description: '闘技場を極めた者にのみ許される称号',
    cost: 400,
    type: 'title',
    titleData: '闘技場の覇者',
  },
  {
    id: 'shop_007',
    name: '神滅の剣',
    description: '伝説の闘士だけが手にできる究極の武器',
    cost: 800,
    type: 'item',
    itemData: { type: 'weapon', rarity: 'legendary', attack: 110, defense: 15 },
  },
  {
    id: 'shop_008',
    name: '神話の鎧',
    description: '神話の時代から伝わる不滅の鎧',
    cost: 800,
    type: 'item',
    itemData: { type: 'armor', rarity: 'legendary', attack: 0, defense: 90 },
  },
];
