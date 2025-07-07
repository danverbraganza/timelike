import type { HexCoordinate, Tile, Character, Pizza, Entity } from '../types/game';
import { TileType } from '../types/game';
import { 
  hexToKey, 
  createHex, 
  hexEquals, 
  getNeighbors, 
  hexRange, 
  hexPathfind, 
  isValidHex 
} from '../utils/hex';
import type { PathfindingOptions } from '../utils/hex';

// Tile properties defining behavior
export interface TileProperties {
  walkable: boolean;
  swimmingRequired: boolean;
  damagePerTurn?: number;
  movementCost: number;
}

// Define properties for each tile type
export const TILE_PROPERTIES: Record<TileType, TileProperties> = {
  [TileType.STONE]: { walkable: true, swimmingRequired: false, movementCost: 1 },
  [TileType.GRASS]: { walkable: true, swimmingRequired: false, movementCost: 1 },
  [TileType.WATER]: { walkable: true, swimmingRequired: true, movementCost: 2 },
  [TileType.LAVA]: { walkable: true, swimmingRequired: false, damagePerTurn: 1, movementCost: 2 },
  [TileType.SAND]: { walkable: true, swimmingRequired: false, movementCost: 1 },
  [TileType.DIRT]: { walkable: true, swimmingRequired: false, movementCost: 1 },
  [TileType.STEEL]: { walkable: true, swimmingRequired: false, movementCost: 1 },
  [TileType.VOID]: { walkable: false, swimmingRequired: false, movementCost: Infinity },
  [TileType.BLOCKED]: { walkable: false, swimmingRequired: false, movementCost: Infinity },
  [TileType.PIZZA_SPAWN]: { walkable: true, swimmingRequired: false, movementCost: 1 },
  [TileType.CHARACTER_SPAWN]: { walkable: true, swimmingRequired: false, movementCost: 1 }
};

// Options for hex grid creation
export interface HexGridOptions {
  width: number;
  height: number;
  defaultTileType?: TileType;
  allowOutOfBounds?: boolean;
}

// Hexagonal grid class
export class HexGrid {
  private tiles: Map<string, Tile>;
  private characters: Map<string, Character>;
  private pizzas: Map<string, Pizza>;
  private readonly width: number;
  private readonly height: number;
  private readonly allowOutOfBounds: boolean;
  private readonly defaultTileType: TileType;

  constructor(options: HexGridOptions) {
    this.width = options.width;
    this.height = options.height;
    this.allowOutOfBounds = options.allowOutOfBounds ?? false;
    this.defaultTileType = options.defaultTileType ?? TileType.GRASS;
    this.tiles = new Map();
    this.characters = new Map();
    this.pizzas = new Map();
    
    this.initializeGrid();
  }

  // Initialize grid with default tiles
  private initializeGrid(): void {
    for (let q = 0; q < this.width; q++) {
      const qOffset = Math.floor(q / 2);
      for (let r = -qOffset; r < this.height - qOffset; r++) {
        const position = createHex(q, r);
        const tile: Tile = {
          position,
          type: this.defaultTileType
        };
        this.tiles.set(hexToKey(position), tile);
      }
    }
  }

  // Check if a hex coordinate is within grid bounds
  isInBounds(hex: HexCoordinate): boolean {
    if (!isValidHex(hex)) return false;
    
    const qOffset = Math.floor(hex.q / 2);
    return hex.q >= 0 && 
           hex.q < this.width && 
           hex.r >= -qOffset && 
           hex.r < this.height - qOffset;
  }

  // Get tile at position
  getTile(hex: HexCoordinate): Tile | null {
    if (!this.isInBounds(hex) && !this.allowOutOfBounds) {
      return null;
    }
    
    const key = hexToKey(hex);
    return this.tiles.get(key) || null;
  }

  // Set tile at position
  setTile(hex: HexCoordinate, tileType: TileType): boolean {
    if (!this.isInBounds(hex) && !this.allowOutOfBounds) {
      return false;
    }
    
    const tile: Tile = { position: hex, type: tileType };
    this.tiles.set(hexToKey(hex), tile);
    return true;
  }

  // Get all tiles
  getAllTiles(): Tile[] {
    return Array.from(this.tiles.values());
  }

  // Get tiles in a specific area
  getTilesInRange(center: HexCoordinate, range: number): Tile[] {
    const hexes = hexRange(center, range);
    return hexes
      .map(hex => this.getTile(hex))
      .filter((tile): tile is Tile => tile !== null);
  }

  // Get tile properties
  getTileProperties(hex: HexCoordinate): TileProperties | null {
    const tile = this.getTile(hex);
    if (!tile) return null;
    return TILE_PROPERTIES[tile.type];
  }

  // Check if a tile is walkable (considering requirements)
  isTileWalkable(hex: HexCoordinate, character?: Character): boolean {
    const properties = this.getTileProperties(hex);
    if (!properties || !properties.walkable) return false;
    
    // For now, assume characters can't swim (this would be expanded with character abilities)
    if (properties.swimmingRequired && character) {
      // TODO: Check if character has swimming ability
      return false;
    }
    
    return true;
  }

  // Add character to grid
  addCharacter(character: Character): boolean {
    if (!this.isInBounds(character.position)) return false;
    if (this.getCharacterAt(character.position)) return false; // Position occupied
    
    this.characters.set(character.id, character);
    return true;
  }

  // Remove character from grid
  removeCharacter(characterId: string): boolean {
    return this.characters.delete(characterId);
  }

  // Get character by ID
  getCharacter(characterId: string): Character | null {
    return this.characters.get(characterId) || null;
  }

  // Get character at position
  getCharacterAt(hex: HexCoordinate): Character | null {
    for (const character of this.characters.values()) {
      if (hexEquals(character.position, hex)) {
        return character;
      }
    }
    return null;
  }

  // Get all characters
  getAllCharacters(): Character[] {
    return Array.from(this.characters.values());
  }

  // Move character to new position
  moveCharacter(characterId: string, newPosition: HexCoordinate): boolean {
    const character = this.getCharacter(characterId);
    if (!character) return false;
    
    if (!this.isTileWalkable(newPosition, character)) return false;
    if (this.getCharacterAt(newPosition)) return false; // Position occupied
    
    character.position = newPosition;
    return true;
  }

  // Add pizza to grid
  addPizza(pizza: Pizza): boolean {
    if (!this.isInBounds(pizza.position)) return false;
    
    this.pizzas.set(pizza.id, pizza);
    return true;
  }

  // Remove pizza from grid
  removePizza(pizzaId: string): boolean {
    return this.pizzas.delete(pizzaId);
  }

  // Get pizza by ID
  getPizza(pizzaId: string): Pizza | null {
    return this.pizzas.get(pizzaId) || null;
  }

  // Get pizza at position
  getPizzaAt(hex: HexCoordinate): Pizza | null {
    for (const pizza of this.pizzas.values()) {
      if (hexEquals(pizza.position, hex)) {
        return pizza;
      }
    }
    return null;
  }

  // Get all pizzas
  getAllPizzas(): Pizza[] {
    return Array.from(this.pizzas.values());
  }

  // Get all entities at a position
  getEntitiesAt(hex: HexCoordinate): Entity[] {
    const entities: Entity[] = [];
    
    const character = this.getCharacterAt(hex);
    if (character) entities.push(character);
    
    const pizza = this.getPizzaAt(hex);
    if (pizza) entities.push(pizza);
    
    return entities;
  }

  // Find path between two positions
  findPath(start: HexCoordinate, goal: HexCoordinate, character?: Character): HexCoordinate[] | null {
    const options: PathfindingOptions = {
      maxDistance: 50,
      isBlocked: (hex: HexCoordinate) => {
        // Check bounds
        if (!this.isInBounds(hex)) return true;
        
        // Check if tile is walkable
        if (!this.isTileWalkable(hex, character)) return true;
        
        // Check if another character is blocking (but allow goal)
        const characterAtHex = this.getCharacterAt(hex);
        if (characterAtHex && !hexEquals(hex, goal)) return true;
        
        return false;
      }
    };
    
    return hexPathfind(start, goal, options);
  }

  // Get valid neighbors for movement
  getValidNeighbors(hex: HexCoordinate, character?: Character): HexCoordinate[] {
    return getNeighbors(hex).filter(neighbor => {
      return this.isInBounds(neighbor) && 
             this.isTileWalkable(neighbor, character) &&
             !this.getCharacterAt(neighbor);
    });
  }

  // Get tiles of specific type
  getTilesByType(tileType: TileType): Tile[] {
    return this.getAllTiles().filter(tile => tile.type === tileType);
  }

  // Get spawn positions for characters
  getCharacterSpawnPositions(): HexCoordinate[] {
    return this.getTilesByType(TileType.CHARACTER_SPAWN).map(tile => tile.position);
  }

  // Get spawn positions for pizzas
  getPizzaSpawnPositions(): HexCoordinate[] {
    return this.getTilesByType(TileType.PIZZA_SPAWN).map(tile => tile.position);
  }

  // Clear all entities (characters and pizzas)
  clearEntities(): void {
    this.characters.clear();
    this.pizzas.clear();
  }

  // Get grid dimensions
  getDimensions(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }

  // Replace all tiles with new tiles from procedural generation
  setTiles(tiles: Map<string, Tile>): void {
    this.tiles = new Map(tiles);
  }

  // Generate grid statistics
  getGridStats(): { 
    totalTiles: number; 
    tileTypeCounts: Record<TileType, number>;
    characterCount: number;
    pizzaCount: number;
  } {
    const tileTypeCounts = {} as Record<TileType, number>;
    
    // Initialize counts
    Object.values(TileType).forEach(type => {
      tileTypeCounts[type] = 0;
    });
    
    // Count tiles by type
    this.getAllTiles().forEach(tile => {
      tileTypeCounts[tile.type]++;
    });
    
    return {
      totalTiles: this.tiles.size,
      tileTypeCounts,
      characterCount: this.characters.size,
      pizzaCount: this.pizzas.size
    };
  }
}