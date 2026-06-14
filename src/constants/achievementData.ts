export type AchievementId =
  | 'first_quest'
  | 'quest_10'
  | 'quest_50'
  | 'quest_100'
  | 'streak_3'
  | 'streak_10'
  | 'first_battle_win'
  | 'battle_10_wins'
  | 'arena_gold_rank'
  | 'arena_legend_rank'
  | 'get_legendary'
  | 'incarnate_once'
  | 'guild_rank_c'
  | 'guild_rank_a'
  | 'guild_rank_s';

export interface Achievement {
  id: AchievementId;
  name: string;
  description: string;
  icon: string;
  unlocksTitle?: string;
}

export const ACHIEVEMENTS: Record<AchievementId, Achievement> = {
  first_quest: {
    id: 'first_quest',
    name: '初依頼',
    description: 'クエストを初めて達成',
    icon: '📜',
  },
  quest_10: {
    id: 'quest_10',
    name: '依頼慣れ',
    description: 'クエストを10件達成',
    icon: '📋',
    unlocksTitle: '新人冒険者',
  },
  quest_50: {
    id: 'quest_50',
    name: '熟練依頼人',
    description: 'クエストを50件達成',
    icon: '📚',
    unlocksTitle: '熟練の冒険者',
  },
  quest_100: {
    id: 'quest_100',
    name: '伝説の依頼主',
    description: 'クエストを100件達成',
    icon: '🏆',
    unlocksTitle: '伝説の依頼人',
  },
  streak_3: {
    id: 'streak_3',
    name: '三連撃',
    description: '3連続クエスト達成',
    icon: '🔥',
  },
  streak_10: {
    id: 'streak_10',
    name: '連続達成王',
    description: '10連続クエスト達成',
    icon: '🌋',
    unlocksTitle: '連続達成王',
  },
  first_battle_win: {
    id: 'first_battle_win',
    name: '初陣',
    description: '闘技場で初勝利',
    icon: '⚔️',
  },
  battle_10_wins: {
    id: 'battle_10_wins',
    name: '歴戦の勇士',
    description: '闘技場で10勝',
    icon: '🛡️',
    unlocksTitle: '闘技場の戦士',
  },
  arena_gold_rank: {
    id: 'arena_gold_rank',
    name: '黄金の闘士',
    description: 'アリーナランク Goldに到達',
    icon: '🥇',
    unlocksTitle: '金の闘士',
  },
  arena_legend_rank: {
    id: 'arena_legend_rank',
    name: '伝説の覇者',
    description: 'アリーナランク Legendに到達',
    icon: '👑',
    unlocksTitle: '伝説の闘士',
  },
  get_legendary: {
    id: 'get_legendary',
    name: '神器保持者',
    description: 'Legendaryアイテムを入手',
    icon: '✨',
    unlocksTitle: '神器保持者',
  },
  incarnate_once: {
    id: 'incarnate_once',
    name: '転生者',
    description: '転生を1回経験',
    icon: '♾️',
    unlocksTitle: '転生者',
  },
  guild_rank_c: {
    id: 'guild_rank_c',
    name: 'Cランク昇格',
    description: 'ギルドランクCに到達',
    icon: '🔷',
  },
  guild_rank_a: {
    id: 'guild_rank_a',
    name: 'Aランク昇格',
    description: 'ギルドランクAに到達',
    icon: '💎',
  },
  guild_rank_s: {
    id: 'guild_rank_s',
    name: '最高峰',
    description: 'ギルドランクSに到達',
    icon: '⭐',
    unlocksTitle: '伝説の覇者',
  },
};

export const ACHIEVEMENT_LIST = Object.values(ACHIEVEMENTS);
