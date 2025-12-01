export interface Player {
  id: number;
  name: string;
  initialWeight: number;
  currentWeight: number;
  targetWeight: number; // calculated as initial * 0.96 (4% loss)
  avatarSeed: string;
}

export interface GameState {
  isStarted: boolean;
  betAmount: number; // Default 500
  startDate: string;
  players: Player[];
}

export enum PayoutMode {
  WINNER_TAKES_ALL = 'A',
  HAPPY_TEAM_BUILDING = 'B', // Recommended
  LADDER = 'C'
}