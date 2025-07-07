import type { Level, Tile, Character, Pizza, HexCoordinate, TileType, LevelGenerationConfig } from '../types/game';
import { TileType as TileTypeEnum, PizzaType } from '../types/game';
import { createHex, hexToKey, getNeighbors, hexRange } from '../utils/hex';

/**
 * Procedural Level Generator for hex-based levels
 * 
 * Implements multiple generation algorithms:
 * 1. Perlin noise - for natural terrain generation
 * 2. Cellular automata - for cave/dungeon generation
 * 3. Simple random - for basic testing
 * 
 * Supports extensible architecture for adding new algorithms
 */

// Abstract base class for level generation algorithms
export abstract class LevelGenerationAlgorithm {
  protected seed: number;
  protected config: LevelGenerationConfig;
  
  constructor(config: LevelGenerationConfig) {
    this.config = config;
    this.seed = config.seed || Math.floor(Math.random() * 1000000);
  }
  
  abstract generate(width: number, height: number): Map<string, Tile>;
  
  // Simple seeded random number generator
  protected random(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  
  // Reset random seed for reproducible results
  protected resetSeed(): void {
    this.seed = this.config.seed || Math.floor(Math.random() * 1000000);
  }
}

/**
 * Perlin Noise Algorithm - adapted for hex grids
 * Good for natural terrain generation with smooth transitions
 */
export class PerlinNoiseGenerator extends LevelGenerationAlgorithm {
  private scale: number;
  private octaves: number;
  private persistence: number;
  private lacunarity: number;
  
  constructor(config: LevelGenerationConfig) {
    super(config);
    this.scale = config.parameters?.scale || 0.1;
    this.octaves = config.parameters?.octaves || 4;
    this.persistence = config.parameters?.persistence || 0.5;
    this.lacunarity = config.parameters?.lacunarity || 2.0;
  }
  
  generate(width: number, height: number): Map<string, Tile> {
    const tiles = new Map<string, Tile>();
    
    // Generate hex grid coordinates
    for (let q = 0; q < width; q++) {
      const qOffset = Math.floor(q / 2);
      for (let r = -qOffset; r < height - qOffset; r++) {
        const position = createHex(q, r);
        const key = hexToKey(position);
        
        // Calculate noise value for this position
        const noiseValue = this.octaveNoise(q, r);
        
        // Map noise value to tile type
        const tileType = this.noiseToTileType(noiseValue);
        
        tiles.set(key, {
          position,
          type: tileType,
        });
      }
    }
    
    return tiles;
  }
  
  private octaveNoise(x: number, y: number): number {
    let value = 0;
    let amplitude = 1;
    let frequency = this.scale;
    
    for (let i = 0; i < this.octaves; i++) {
      value += this.noise(x * frequency, y * frequency) * amplitude;
      amplitude *= this.persistence;
      frequency *= this.lacunarity;
    }
    
    return value;
  }
  
  private noise(x: number, y: number): number {
    // Simple 2D noise function based on sine waves
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return (n - Math.floor(n)) * 2 - 1; // normalize to [-1, 1]
  }
  
  private noiseToTileType(noiseValue: number): TileType {
    // Map noise values to different tile types
    if (noiseValue < -0.6) return TileTypeEnum.WATER;
    if (noiseValue < -0.3) return TileTypeEnum.SAND;
    if (noiseValue < -0.1) return TileTypeEnum.GRASS;
    if (noiseValue < 0.1) return TileTypeEnum.DIRT;
    if (noiseValue < 0.3) return TileTypeEnum.STONE;
    if (noiseValue < 0.6) return TileTypeEnum.LAVA;
    return TileTypeEnum.STEEL;
  }
}

/**
 * Cellular Automata Algorithm - adapted for hex grids
 * Good for cave/dungeon generation with organic structures
 */
export class CellularAutomataGenerator extends LevelGenerationAlgorithm {
  private initialDensity: number;
  private smoothingIterations: number;
  
  constructor(config: LevelGenerationConfig) {
    super(config);
    this.initialDensity = config.parameters?.initialDensity || 0.45;
    this.smoothingIterations = config.parameters?.smoothingIterations || 3;
  }
  
  generate(width: number, height: number): Map<string, Tile> {
    const tiles = new Map<string, Tile>();
    
    // Step 1: Generate initial random grid
    const initialGrid = this.generateInitialGrid(width, height);
    
    // Step 2: Apply cellular automata rules
    let currentGrid = initialGrid;
    for (let i = 0; i < this.smoothingIterations; i++) {
      currentGrid = this.smoothGrid(currentGrid, width, height);
    }
    
    // Step 3: Convert to tiles
    for (let q = 0; q < width; q++) {
      const qOffset = Math.floor(q / 2);
      for (let r = -qOffset; r < height - qOffset; r++) {
        const position = createHex(q, r);
        const key = hexToKey(position);
        
        const isWall = currentGrid.get(key) || false;
        const tileType = this.cellToTileType(isWall);
        
        tiles.set(key, {
          position,
          type: tileType,
        });
      }
    }
    
    return tiles;
  }
  
  private generateInitialGrid(width: number, height: number): Map<string, boolean> {
    const grid = new Map<string, boolean>();
    
    for (let q = 0; q < width; q++) {
      const qOffset = Math.floor(q / 2);
      for (let r = -qOffset; r < height - qOffset; r++) {
        const position = createHex(q, r);
        const key = hexToKey(position);
        
        // Border tiles are always walls
        if (q === 0 || q === width - 1 || r === -qOffset || r === height - qOffset - 1) {
          grid.set(key, true);
        } else {
          grid.set(key, this.random() < this.initialDensity);
        }
      }
    }
    
    return grid;
  }
  
  private smoothGrid(grid: Map<string, boolean>, width: number, height: number): Map<string, boolean> {
    const newGrid = new Map<string, boolean>();
    
    for (let q = 0; q < width; q++) {
      const qOffset = Math.floor(q / 2);
      for (let r = -qOffset; r < height - qOffset; r++) {
        const position = createHex(q, r);
        const key = hexToKey(position);
        
        const wallCount = this.countWallNeighbors(grid, position);
        
        // Cellular automata rule: if 4 or more neighbors are walls, become a wall
        newGrid.set(key, wallCount >= 4);
      }
    }
    
    return newGrid;
  }
  
  private countWallNeighbors(grid: Map<string, boolean>, position: HexCoordinate): number {
    const neighbors = getNeighbors(position);
    let count = 0;
    
    for (const neighbor of neighbors) {
      const key = hexToKey(neighbor);
      if (grid.get(key)) {
        count++;
      }
    }
    
    return count;
  }
  
  private cellToTileType(isWall: boolean): TileType {
    if (isWall) {
      // Add some variety to wall tiles
      const random = Math.random();
      if (random < 0.7) return TileTypeEnum.STONE;
      if (random < 0.85) return TileTypeEnum.STEEL;
      return TileTypeEnum.BLOCKED;
    } else {
      // Add some variety to floor tiles
      const random = Math.random();
      if (random < 0.6) return TileTypeEnum.DIRT;
      if (random < 0.8) return TileTypeEnum.GRASS;
      if (random < 0.9) return TileTypeEnum.SAND;
      return TileTypeEnum.VOID;
    }
  }
}

/**
 * Simple Random Algorithm - for basic testing and fallback
 */
export class SimpleRandomGenerator extends LevelGenerationAlgorithm {
  generate(width: number, height: number): Map<string, Tile> {
    const tiles = new Map<string, Tile>();
    
    for (let q = 0; q < width; q++) {
      const qOffset = Math.floor(q / 2);
      for (let r = -qOffset; r < height - qOffset; r++) {
        const position = createHex(q, r);
        const key = hexToKey(position);
        
        // Simple random tile assignment
        const random = this.random();
        let tileType: TileType;
        
        if (random < 0.6) tileType = TileTypeEnum.GRASS;
        else if (random < 0.75) tileType = TileTypeEnum.DIRT;
        else if (random < 0.85) tileType = TileTypeEnum.SAND;
        else if (random < 0.9) tileType = TileTypeEnum.WATER;
        else if (random < 0.95) tileType = TileTypeEnum.STONE;
        else tileType = TileTypeEnum.LAVA;
        
        tiles.set(key, {
          position,
          type: tileType,
        });
      }
    }
    
    return tiles;
  }
}

/**
 * Main Level Generator class that coordinates different algorithms
 */
export class ProceduralLevelGenerator {
  private algorithms: Map<string, new (config: LevelGenerationConfig) => LevelGenerationAlgorithm>;
  
  constructor() {
    this.algorithms = new Map([
      ['perlin', PerlinNoiseGenerator],
      ['cellular', CellularAutomataGenerator],
      ['simple', SimpleRandomGenerator],
    ]);
  }
  
  /**
   * Generate a level using the specified algorithm
   */
  generateLevel(
    width: number,
    height: number,
    config: LevelGenerationConfig,
    levelId: number = 0,
    levelName: string = 'Generated Level'
  ): Level {
    const AlgorithmClass = this.algorithms.get(config.algorithm);
    if (!AlgorithmClass) {
      throw new Error(`Unknown algorithm: ${config.algorithm}`);
    }
    
    const algorithm = new AlgorithmClass(config);
    let tiles = algorithm.generate(width, height);
    
    // Post-process: ensure spawn points are walkable
    tiles = this.ensureSpawnSafety(tiles, width, height, config);
    
    // Add spawn points
    tiles = this.addSpawnPoints(tiles, width, height);
    
    return {
      id: levelId,
      name: levelName,
      width,
      height,
      tiles,
      timeLimit: undefined,
      isStatic: false,
      generationConfig: config,
    };
  }
  
  /**
   * Add more generation algorithms
   */
  registerAlgorithm(name: string, algorithmClass: new (config: LevelGenerationConfig) => LevelGenerationAlgorithm): void {
    this.algorithms.set(name, algorithmClass);
  }
  
  /**
   * Ensure spawn points have walkable areas around them
   */
  private ensureSpawnSafety(
    tiles: Map<string, Tile>,
    width: number,
    _height: number,
    config: LevelGenerationConfig
  ): Map<string, Tile> {
    const safetyRadius = config.parameters?.spawnSafety || 2;
    
    // Find center for character spawn
    const centerQ = Math.floor(width / 2);
    const centerR = 0;
    const centerPos = createHex(centerQ, centerR);
    
    // Make area around center walkable
    const safeArea = hexRange(centerPos, safetyRadius);
    safeArea.forEach(pos => {
      const key = hexToKey(pos);
      if (tiles.has(key)) {
        tiles.set(key, {
          position: pos,
          type: TileTypeEnum.GRASS,
        });
      }
    });
    
    return tiles;
  }
  
  /**
   * Add character and pizza spawn points
   */
  private addSpawnPoints(tiles: Map<string, Tile>, width: number, _height: number): Map<string, Tile> {
    // Character spawn at center
    const centerQ = Math.floor(width / 2);
    const centerR = 0;
    const centerPos = createHex(centerQ, centerR);
    const centerKey = hexToKey(centerPos);
    
    if (tiles.has(centerKey)) {
      tiles.set(centerKey, {
        position: centerPos,
        type: TileTypeEnum.CHARACTER_SPAWN,
      });
    }
    
    // Pizza spawns at strategic locations
    const pizzaSpawns = [
      createHex(2, 0),
      createHex(width - 3, -1),
      createHex(centerQ, 3),
    ];
    
    pizzaSpawns.forEach(pos => {
      const key = hexToKey(pos);
      if (tiles.has(key)) {
        tiles.set(key, {
          position: pos,
          type: TileTypeEnum.PIZZA_SPAWN,
        });
      }
    });
    
    return tiles;
  }
}

// Factory function to create a level generator
export function createLevelGenerator(): ProceduralLevelGenerator {
  return new ProceduralLevelGenerator();
}

/**
 * TRACER BULLETS / JIG CODE - Updated simple test level creation
 * Uses the new procedural generation system with safe defaults
 */
export function createSimpleTestLevel(options: {
  width?: number;
  height?: number;
  algorithm?: 'perlin' | 'cellular' | 'simple';
  seed?: number;
} = {}): {
  level: Level;
  player: Character;
  pizzas: Pizza[];
} {
  const {
    width = 10,
    height = 8,
    algorithm = 'simple',
    seed = 12345,
  } = options;
  
  console.log('TRACER BULLETS: Creating test level with procedural generation...');
  console.log('Algorithm:', algorithm, 'Size:', width, 'x', height, 'Seed:', seed);
  
  // Create level generator
  const generator = createLevelGenerator();
  
  // Configuration with safe defaults for tracer bullet testing
  const config: LevelGenerationConfig = {
    algorithm,
    seed,
    parameters: {
      // Perlin noise parameters
      scale: 0.15,
      octaves: 3,
      persistence: 0.4,
      lacunarity: 2.0,
      
      // Cellular automata parameters
      initialDensity: 0.4,
      smoothingIterations: 2,
      
      // Common parameters
      spawnSafety: 2,
    },
  };
  
  // Generate level
  const level = generator.generateLevel(
    width,
    height,
    config,
    999,
    `TRACER BULLETS ${algorithm.toUpperCase()} Test Level`
  );
  
  // Create player character at spawn point
  const playerSpawnTile = Array.from(level.tiles.values())
    .find(tile => tile.type === TileTypeEnum.CHARACTER_SPAWN);
  
  const playerPosition = playerSpawnTile ? playerSpawnTile.position : createHex(Math.floor(width / 2), 0);
  
  const player: Character = {
    id: 'player-1',
    name: 'Test Player',
    position: playerPosition,
    movementSpeed: 1,
    type: 'player',
  };
  
  // Create test pizzas at spawn points
  const pizzas: Pizza[] = [];
  const pizzaSpawnTiles = Array.from(level.tiles.values())
    .filter(tile => tile.type === TileTypeEnum.PIZZA_SPAWN);
  
  pizzaSpawnTiles.forEach((tile, index) => {
    const pizza: Pizza = {
      id: `pizza-${index + 1}`,
      position: tile.position,
      type: [PizzaType.CHEESE, PizzaType.PEPPERONI, PizzaType.SAUSAGE][index % 3],
      targetCharacterId: 'npc-1',
    };
    pizzas.push(pizza);
  });
  
  console.log('TRACER BULLETS: Generated level with', level.tiles.size, 'tiles');
  console.log('TRACER BULLETS: Player at', playerPosition);
  console.log('TRACER BULLETS: Created', pizzas.length, 'pizzas');
  
  return { level, player, pizzas };
}