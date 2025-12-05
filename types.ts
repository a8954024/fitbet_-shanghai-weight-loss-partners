export enum PayoutMode {
  WINNER_TAKES_ALL = 'WINNER_TAKES_ALL',
  LADDER = 'LADDER',
  HAPPY_TEAM_BUILDING = 'HAPPY_TEAM_BUILDING'
}

export interface ActivityLog {
  id: string;
  type: 'JOIN' | 'WEIGHT_UPDATE' | 'CHEER' | 'GAME_START';
  playerId?: number;
  playerName?: string;
  message: string;
  timestamp: string;
  avatarSeed?: string;
}

export interface WeightEntry {
  date: string;
  weight: number;
}

export interface Player {
  id: number;
  name: string;
  initialWeight: number;
  currentWeight: number;
  targetWeight: number;
  weightHistory: WeightEntry[];
  cheers: number;
  lastUpdateDate?: string;
  avatarSeed?: string;
  joinDate?: string;
  badges?: string[];
  streak?: number;
  betAmount: number;
}

export interface GameState {
  isStarted: boolean;
  startDate: string;
  endDate?: string;
  players: Player[];
  targetPercentage?: number;
  betAmount: number; // Kept for backward compatibility or default
  payoutMode: PayoutMode;
  logs: ActivityLog[];
}