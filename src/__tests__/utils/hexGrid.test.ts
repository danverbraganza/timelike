import { HexGrid, TILE_PROPERTIES } from '../../utils/hexGrid';
import { createHex, hexEquals } from '../../utils/hex';
import type { Character, Pizza } from '../../types/game';
import { TileType, PizzaType } from '../../types/game';

describe('HexGrid - Simple Tests', () => {
  let grid: HexGrid;

  beforeEach(() => {
    grid = new HexGrid({
      width: 3,  // Smaller grid to avoid memory issues
      height: 3,
      defaultTileType: TileType.GRASS
    });
  });

  describe('constructor', () => {
    it('should create grid with correct dimensions', () => {
      const dimensions = grid.getDimensions();
      expect(dimensions.width).toBe(3);
      expect(dimensions.height).toBe(3);
    });

    it('should initialize with default tile type', () => {
      const tile = grid.getTile(createHex(0, 0));
      expect(tile?.type).toBe(TileType.GRASS);
    });
  });

  describe('bounds checking', () => {
    it('should correctly identify in-bounds coordinates', () => {
      expect(grid.isInBounds(createHex(0, 0))).toBe(true);
      expect(grid.isInBounds(createHex(1, 0))).toBe(true);
    });

    it('should correctly identify out-of-bounds coordinates', () => {
      expect(grid.isInBounds(createHex(-1, 0))).toBe(false);
      expect(grid.isInBounds(createHex(5, 0))).toBe(false);
    });
  });

  describe('tile management', () => {
    it('should get and set tiles', () => {
      const position = createHex(1, 0);
      expect(grid.setTile(position, TileType.WATER)).toBe(true);
      
      const tile = grid.getTile(position);
      expect(tile?.type).toBe(TileType.WATER);
      expect(hexEquals(tile!.position, position)).toBe(true);
    });

    it('should not set tiles out of bounds', () => {
      const position = createHex(-1, 0);
      expect(grid.setTile(position, TileType.WATER)).toBe(false);
    });
  });

  describe('tile properties', () => {
    it('should have correct properties for each tile type', () => {
      expect(TILE_PROPERTIES[TileType.STONE].walkable).toBe(true);
      expect(TILE_PROPERTIES[TileType.GRASS].walkable).toBe(true);
      expect(TILE_PROPERTIES[TileType.WATER].swimmingRequired).toBe(true);
      expect(TILE_PROPERTIES[TileType.LAVA].damagePerTurn).toBe(1);
      expect(TILE_PROPERTIES[TileType.BLOCKED].walkable).toBe(false);
    });

    it('should check tile walkability', () => {
      grid.setTile(createHex(0, 0), TileType.BLOCKED);
      grid.setTile(createHex(1, 0), TileType.GRASS);
      
      expect(grid.isTileWalkable(createHex(0, 0))).toBe(false);
      expect(grid.isTileWalkable(createHex(1, 0))).toBe(true);
    });
  });

  describe('character management', () => {
    const mockCharacter: Character = {
      id: 'char1',
      name: 'Test Player',
      position: createHex(0, 0),
      movementSpeed: 1,
      type: 'player'
    };

    it('should add and retrieve characters', () => {
      expect(grid.addCharacter(mockCharacter)).toBe(true);
      
      const retrieved = grid.getCharacter('char1');
      expect(retrieved).toEqual(mockCharacter);
      
      const atPosition = grid.getCharacterAt(createHex(0, 0));
      expect(atPosition).toEqual(mockCharacter);
    });

    it('should move characters', () => {
      grid.addCharacter(mockCharacter);
      const newPosition = createHex(1, 0);
      
      expect(grid.moveCharacter('char1', newPosition)).toBe(true);
      
      const character = grid.getCharacter('char1');
      expect(hexEquals(character!.position, newPosition)).toBe(true);
    });
  });

  describe('pizza management', () => {
    const mockPizza: Pizza = {
      id: 'pizza1',
      position: createHex(0, 0),
      type: PizzaType.CHEESE,
      targetCharacterId: 'npc1'
    };

    it('should add and retrieve pizzas', () => {
      expect(grid.addPizza(mockPizza)).toBe(true);
      
      const retrieved = grid.getPizza('pizza1');
      expect(retrieved).toEqual(mockPizza);
      
      const atPosition = grid.getPizzaAt(createHex(0, 0));
      expect(atPosition).toEqual(mockPizza);
    });
  });

  describe('pathfinding', () => {
    const mockCharacter: Character = {
      id: 'char1',
      name: 'Test Player',
      position: createHex(0, 0),
      movementSpeed: 1,
      type: 'player'
    };

    it('should find path between adjacent tiles', () => {
      const start = createHex(0, 0);
      const goal = createHex(1, 0);
      
      const path = grid.findPath(start, goal, mockCharacter);
      expect(path).not.toBeNull();
      expect(path).toHaveLength(2);
    });
  });
});