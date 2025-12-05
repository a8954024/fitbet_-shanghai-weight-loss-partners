export interface Player {
  id: number;
  name: string;
  initialWeight: number;
  currentWeight: number;
  targetWeight: number;
  weightHistory: Array<{ date: string; weight: number }>;
  lastUpdateDate: string;
  cheers: number;
  badges: string[];
  avatarSeed: string;
  joinDate: string; // New: Track when user joined
}

export interface ActivityLog {
  id: string;
  type: 'WEIGHT_UPDATE' | 'JOIN' | 'CHEER' | 'GAME_START';
  playerId?: number;
  playerName?: string;
  message: string;
  timestamp: string;
  data?: any;
}

export interface GameState {
  isStarted: boolean;
  betAmount: number; // Default 500
  startDate: string;
  players: Player[];
  payoutMode: PayoutMode | null; // Changed: Can be null initially
  logs: ActivityLog[]; // New: Activity feed
}

export enum PayoutMode {
  WINNER_TAKES_ALL = 'A',
  HAPPY_TEAM_BUILDING = 'B', // Recommended
  LADDER = 'C'
}