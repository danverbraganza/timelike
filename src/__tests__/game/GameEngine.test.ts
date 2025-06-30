import { GameEngine } from '../../game/GameEngine';
import { TileType } from '../../types/game';

describe('GameEngine', () => {
  let gameEngine: GameEngine;

  beforeEach(() => {
    gameEngine = new GameEngine({
      width: 5,
      height: 5,
      defaultTileType: TileType.GRASS
    });
  });

  describe('constructor', () => {
    it('should create a game engine with proper grid', () => {
      const grid = gameEngine.getGrid();
      expect(grid).toBeDefined();
      expect(grid.getDimensions()).toEqual({ width: 5, height: 5 });
    });
  });

  describe('initializeGame', () => {
    it('should initialize game without errors', () => {
      expect(() => gameEngine.initializeGame()).not.toThrow();
    });

    it('should clear existing entities', () => {
      const grid = gameEngine.getGrid();
      
      // Add some test entities first
      grid.addCharacter({
        id: 'test-char',
        position: { q: 0, r: 0, s: 0 },
        name: 'Test Character',
        movementSpeed: 1,
        type: 'player'
      });

      gameEngine.initializeGame();
      
      expect(grid.getAllCharacters()).toHaveLength(0);
    });
  });

  describe('getStats', () => {
    it('should return game statistics', () => {
      const stats = gameEngine.getStats();
      expect(stats).toHaveProperty('grid');
      expect(stats.grid).toHaveProperty('totalTiles');
      expect(stats.grid).toHaveProperty('characterCount');
      expect(stats.grid).toHaveProperty('pizzaCount');
    });
  });
});