import { PayoutMode } from './types';

export const DEFAULT_BET = 500;
export const TARGET_PERCENTAGE = 0.04; // 4%
export const DURATION_DAYS = 28;

export const RULES_CONTENT = {
  title: "魔都甩肉合伙人 (Shanghai Weight Loss Partners)",
  mechanics: [
    "参与人数：4人最佳",
    "活动周期：4周 (28天)",
    "核心机制：痛感（损失厌恶）+ 奖励（正向激励）"
  ],
  money: [
    { label: "娱乐局", amount: 200, desc: "少吃一顿火锅" },
    { label: "标准局 (推荐)", amount: 500, desc: "失去一顿精致Omakase，痛感适中" },
    { label: "狠人局", amount: 1000, desc: "痛感强烈，必须全力以赴" }
  ],
  modes: [
    { 
      id: PayoutMode.HAPPY_TEAM_BUILDING, 
      name: "玩法B：快乐团建 (推荐)", 
      desc: "达标者拿回本金。未达标者本金充公，请大家吃顿好的！" 
    },
    { 
      id: PayoutMode.WINNER_TAKES_ALL, 
      name: "玩法A：赢家通吃", 
      desc: "达标的人平分未达标人的保证金。" 
    },
    { 
      id: PayoutMode.LADDER, 
      name: "玩法C：阶梯奖励", 
      desc: "达标拿回本金，第一名拿走剩余奖池一半。" 
    }
  ]
};