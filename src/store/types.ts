import type { 
  GameState, 
  Level, 
  Character, 
  HexCoordinate
} from '../types/game';

// UI State types
export interface UIState {
  // Modal states
  isPaused: boolean;
  showSettings: boolean;
  showHelp: boolean;
  showTimelineDebugger: boolean;
  
  // Game UI states
  selectedCharacter?: Character;
  selectedHex?: HexCoordinate;
  hoveredHex?: HexCoordinate;
  
  // Cutscene state
  cutsceneDialogIndex: number;
  
  // Error/feedback state
  errorMessage?: string;
  successMessage?: string;
  
  // UI preferences
  showGrid: boolean;
  showCoordinates: boolean;
  showMovementRange: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
}

// Actions for UI state
export interface UIActions {
  // Modal actions
  togglePause: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  toggleHelp: () => void;
  toggleTimelineDebugger: () => void;
  
  // Selection actions
  selectCharacter: (character?: Character) => void;
  selectHex: (hex?: HexCoordinate) => void;
  hoverHex: (hex?: HexCoordinate) => void;
  
  // Cutscene actions
  advanceDialog: () => void;
  resetDialog: () => void;
  
  // Feedback actions
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  clearMessages: () => void;
  
  // Preference actions
  toggleGrid: () => void;
  toggleCoordinates: () => void;
  toggleMovementRange: () => void;
  setAnimationSpeed: (speed: 'slow' | 'normal' | 'fast') => void;
}

// Combined UI store type
export type UIStore = UIState & UIActions;

// Temporal State types (for managing time travel UI)
export interface TemporalState {
  // Time travel UI state
  isTimeViewActive: boolean;
  viewingTurn: number;
  availableTimelines: Array<{
    id: string;
    name: string;
    branchPoint?: number;
    isActive: boolean;
  }>;
  
  // Temporal abilities
  availableTimeAbilities: {
    canReverse: boolean;
    canRestart: boolean;
    canSpeedUp: boolean;
    reverseTurnsRemaining: number;
  };
  
  // Ghost visualization
  showGhosts: boolean;
  ghostTimelines: string[];
}

// Actions for temporal state
export interface TemporalActions {
  // Time view actions
  enterTimeView: () => void;
  exitTimeView: () => void;
  viewTurn: (turnNumber: number) => void;
  
  // Timeline actions
  updateTimelines: (timelines: Array<{ id: string; isActive: boolean; branchPoint?: number }>) => void;
  
  // Ability actions
  updateTimeAbilities: (abilities: Partial<TemporalState['availableTimeAbilities']>) => void;
  
  // Ghost actions
  toggleGhosts: () => void;
  setGhostTimelines: (timelineIds: string[]) => void;
}

// Combined temporal store type
export type TemporalStore = TemporalState & TemporalActions;

// Game State for the store (wraps the core GameState)
export interface GameStoreState {
  // Core game state
  gameState: GameState | null;
  currentLevel: Level | null;
  
  // Game session state
  isInitialized: boolean;
  isLoading: boolean;
  error?: string;
  
  // Input state
  availableActions: {
    canMove: boolean;
    canPickup: boolean;
    canDrop: boolean;
    canUseAbility: boolean;
  };
  
  // Statistics
  stats: {
    totalTurns: number;
    pizzasDelivered: number;
    timeTravelUses: number;
    currentScore: number;
  };
}

// Actions for game store
export interface GameStoreActions {
  // Initialization
  initializeGame: (level: Level) => Promise<void>;
  resetGame: () => void;
  
  // Game flow
  advanceTurn: () => Promise<void>;
  pauseGame: () => void;
  resumeGame: () => void;
  
  // Game actions
  moveCharacter: (characterId: string, newPosition: HexCoordinate) => Promise<boolean>;
  pickupPizza: (pizzaId: string) => Promise<boolean>;
  dropPizza: () => Promise<boolean>;
  deliverPizza: (targetId: string) => Promise<boolean>;
  
  // Time manipulation
  useTimeAbility: (abilityType: 'reverse' | 'restart' | 'speedup') => Promise<boolean>;
  
  // State updates
  updateGameState: (gameState: GameState) => void;
  updateStats: (stats: Partial<GameStoreState['stats']>) => void;
  updateAvailableActions: (actions: Partial<GameStoreState['availableActions']>) => void;
  
  // Error handling
  setError: (error: string) => void;
  clearError: () => void;
}

// Combined game store type
export type GameStore = GameStoreState & GameStoreActions;