import { QuestDifficulty } from '../types';

export type DailyGoalType =
  | 'complete_any_quest'
  | 'complete_f_rank'
  | 'complete_d_rank_or_higher'
  | 'complete_2_quests'
  | 'complete_3_quests'
  | 'battle_win';

export interface DailyQuestTemplate {
  templateId: string;
  goalType: DailyGoalType;
  goalCount: number;
  title: string;
  description: string;
  difficulty: QuestDifficulty;
}

export const DAILY_QUEST_TEMPLATES: DailyQuestTemplate[] = [
  {
    templateId: 'daily_any_1',
    goalType: 'complete_any_quest',
    goalCount: 1,
    title: '今日の依頼',
    description: 'クエストを1件完了する',
    difficulty: 'E',
  },
  {
    templateId: 'daily_f_rank',
    goalType: 'complete_f_rank',
    goalCount: 1,
    title: '基礎訓練',
    description: 'Fランククエストを1件完了する',
    difficulty: 'F',
  },
  {
    templateId: 'daily_d_rank',
    goalType: 'complete_d_rank_or_higher',
    goalCount: 1,
    title: '上級依頼',
    description: 'DランクD以上のクエストを1件完了する',
    difficulty: 'D',
  },
  {
    templateId: 'daily_any_2',
    goalType: 'complete_2_quests',
    goalCount: 2,
    title: 'ダブル達成',
    description: 'クエストを2件完了する',
    difficulty: 'D',
  },
  {
    templateId: 'daily_any_3',
    goalType: 'complete_3_quests',
    goalCount: 3,
    title: 'トリプル達成',
    description: 'クエストを3件完了する',
    difficulty: 'C',
  },
  {
    templateId: 'daily_battle',
    goalType: 'battle_win',
    goalCount: 1,
    title: '闘技場の試練',
    description: '闘技場で1勝する',
    difficulty: 'C',
  },
];
