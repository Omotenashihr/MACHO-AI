export interface FoodAnalysis {
  isFood: boolean;
  name: string;
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  sugar_g: number; // Added to track excessive sugar
  isUnhealthy: boolean; // Flag for junk food/high additives/high sugar
  reasoning: string;
}

export interface DailyMacros {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface GameState {
  muscle: number; // Visual muscle scale
  health: number; // General wellness
  status: 'NORMAL' | 'PUMPED' | 'SICK' | 'CHUBBY';
  isPoisoned: boolean; // New: Poison state
  isEating: boolean; // New: Eating animation state
  isHappy: boolean; // New: Happy state for good PFC
  history: LogEntry[];
  loading: boolean;
  dailyTotals: DailyMacros;
}

export interface LogEntry {
  id: string;
  foodName: string;
  effect: string;
  timestamp: Date;
  macros: DailyMacros; // Snapshot of macros for this item
}