// Hexagonal coordinate system
export interface HexCoordinate {
  q: number; // column
  r: number; // row
  s: number; // s = -q - r (for cube coordinates)
}

// Base entity interface
export interface Entity {
  id: string;
  position: HexCoordinate;
}

// Character types
export interface Character extends Entity {
  name: string;
  movementSpeed: number; // steps per turn
  type: 'player' | 'npc';
}

// Pizza types
export const PizzaType = {
  CHEESE: 'cheese',
  PEPPERONI: 'pepperoni',
  SAUSAGE: 'sausage',
  SUPREME: 'supreme'
} as const;

export type PizzaType = typeof PizzaType[keyof typeof PizzaType];

export interface Pizza extends Entity {
  type: PizzaType;
  targetCharacterId: string;
}

// Tile types
export const TileType = {
  STONE: 'stone',
  GRASS: 'grass', 
  WATER: 'water',
  LAVA: 'lava',
  SAND: 'sand',
  DIRT: 'dirt',
  STEEL: 'steel',
  VOID: 'void',
  BLOCKED: 'blocked',
  PIZZA_SPAWN: 'pizza_spawn',
  CHARACTER_SPAWN: 'character_spawn'
} as const;

export type TileType = typeof TileType[keyof typeof TileType];

export interface Tile {
  position: HexCoordinate;
  type: TileType;
}

// Level generation parameters
export interface LevelGenerationConfig {
  algorithm: 'perlin' | 'cellular' | 'simple';
  seed?: number;
  parameters?: {
    // Perlin noise parameters
    scale?: number;
    octaves?: number;
    persistence?: number;
    lacunarity?: number;
    
    // Cellular automata parameters
    initialDensity?: number;
    smoothingIterations?: number;
    
    // Common parameters
    biomeWeights?: Record<TileType, number>;
    spawnSafety?: number; // radius around spawns that must be walkable
  };
}

// Level structure
export interface Level {
  id: number;
  name: string;
  width: number;
  height: number;
  tiles: Map<string, Tile>; // key is "q,r"
  timeLimit?: number; // in turns, undefined for infinite time
  isStatic: boolean; // true for levels 1, 5, 10, 15, 20, 25, 30
  generationConfig?: LevelGenerationConfig; // for procedurally generated levels
}

// Turn data for bitemporal storage
export interface TurnState {
  turnNumber: number;
  timestamp: number;
  characters: Map<string, Character>;
  pizzas: Map<string, Pizza>;
  playerInventory?: Pizza;
  tiles: Map<string, Tile>; // Dynamic tile states (e.g., water->ice)
  timelineId: string; // Which timeline this turn belongs to
  parentTurnNumber?: number; // For branched timelines
}

// Timeline represents a branch in the bitemporal history
export interface Timeline {
  id: string;
  parentTimelineId?: string;
  branchPoint?: number; // Turn number where this timeline branched
  isPlayerControlled: boolean;
  turns: Map<number, TurnState>; // Turn number -> state
}

// Bitemporal game state with multiple timelines
export interface BitemporalGameState {
  timelines: Map<string, Timeline>; // Timeline ID -> Timeline
  activeTimelineId: string; // Currently player-controlled timeline
  mergedState: TurnState; // Last-write-wins merged state
  currentTurn: number;
  isReversing: boolean; // Are we going backwards in time?
}

// Game state
export interface GameState {
  currentLevel: number;
  currentTurn: number;
  isTimeTraveling: boolean;
  activeTurnIndex: number; // which turn we're viewing/playing
  turnHistory: TurnState[];
  bitemporalState?: BitemporalGameState;
  score: number;
  gameStatus: 'playing' | 'won' | 'lost' | 'cutscene';
}

// Event types for state changes
export const StateChangeType = {
  MOVE: 'move',
  PICKUP: 'pickup',
  DROP: 'drop',
  USE_ITEM: 'use_item',
  TILE_CHANGE: 'tile_change',
  TIME_REVERSE: 'time_reverse'
} as const;

export type StateChangeType = typeof StateChangeType[keyof typeof StateChangeType];

// Event for recording state changes
export interface StateChangeEvent {
  type: StateChangeType;
  turnNumber: number;
  timelineId: string;
  entityId?: string;
  data: any; // Type-specific data
  timestamp: number;
}

// Cutscene
export interface DialogueLine {
  speaker?: string;
  text: string;
}

export interface Cutscene {
  id: string;
  dialogues: DialogueLine[];
}