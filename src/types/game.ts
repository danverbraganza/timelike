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
  WALKABLE: 'walkable',
  BLOCKED: 'blocked',
  WATER: 'water',
  PIZZA_SPAWN: 'pizza_spawn',
  CHARACTER_SPAWN: 'character_spawn'
} as const;

export type TileType = typeof TileType[keyof typeof TileType];

export interface Tile {
  position: HexCoordinate;
  type: TileType;
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
}

// Turn data for bitemporal storage
export interface TurnState {
  turnNumber: number;
  timestamp: number;
  characters: Map<string, Character>;
  pizzas: Map<string, Pizza>;
  playerInventory?: Pizza;
}

// Game state
export interface GameState {
  currentLevel: number;
  currentTurn: number;
  isTimeTraveling: boolean;
  activeTurnIndex: number; // which turn we're viewing/playing
  turnHistory: TurnState[];
  score: number;
  gameStatus: 'playing' | 'won' | 'lost' | 'cutscene';
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