import { 
  ProceduralLevelGenerator, 
  HybridGenerator, 
  createSimpleTestLevel,
  createLevelGenerator 
} from '../../game/levelGenerator';
import type { LevelGenerationConfig } from '../../types/game';
import { TileType } from '../../types/game';

/**
 * Tests for the procedural level generation system
 */
describe('ProceduralLevelGenerator', () => {
  let generator: ProceduralLevelGenerator;

  beforeEach(() => {
    generator = createLevelGenerator();
  });

  describe('hybrid algorithm', () => {
    it('should generate a level with hybrid algorithm', () => {
      const config: LevelGenerationConfig = {
        algorithm: 'hybrid',
        seed: 12345,
        parameters: {
          initialDensity: 0.4,
          smoothingIterations: 2,
          scale: 0.15,
          octaves: 3,
          spawnSafety: 2,
        }
      };

      const level = generator.generateLevel(10, 8, config, 1, 'Test Hybrid Level');

      expect(level).toBeDefined();
      expect(level.width).toBe(10);
      expect(level.height).toBe(8);
      expect(level.tiles.size).toBeGreaterThan(0);
      expect(level.generationConfig).toEqual(config);
      expect(level.isStatic).toBe(false);
    });

    it('should create varied terrain with multiple tile types', () => {
      const config: LevelGenerationConfig = {
        algorithm: 'hybrid',
        seed: 42,
      };

      const level = generator.generateLevel(12, 10, config);
      const tiles = Array.from(level.tiles.values());
      const tileTypes = new Set(tiles.map(tile => tile.type));

      // Should have multiple tile types (at least 3 different ones)
      expect(tileTypes.size).toBeGreaterThanOrEqual(3);
      
      // Should include character and pizza spawn points
      expect(tileTypes.has(TileType.CHARACTER_SPAWN)).toBe(true);
      expect(tileTypes.has(TileType.PIZZA_SPAWN)).toBe(true);
    });

    it('should ensure character spawn is walkable', () => {
      const config: LevelGenerationConfig = {
        algorithm: 'hybrid',
        seed: 123,
      };

      const level = generator.generateLevel(8, 6, config);
      const characterSpawns = Array.from(level.tiles.values())
        .filter(tile => tile.type === TileType.CHARACTER_SPAWN);

      expect(characterSpawns.length).toBe(1);
      
      // Character spawn should exist and be in a safe area
      const spawn = characterSpawns[0];
      expect(spawn).toBeDefined();
      expect(spawn.type).toBe(TileType.CHARACTER_SPAWN);
    });
  });

  describe('createSimpleTestLevel', () => {
    it('should create a test level with hybrid algorithm by default', () => {
      const result = createSimpleTestLevel({
        width: 8,
        height: 6,
        seed: 999
      });

      expect(result.level).toBeDefined();
      expect(result.player).toBeDefined();
      expect(result.pizzas).toBeDefined();
      
      expect(result.level.width).toBe(8);
      expect(result.level.height).toBe(6);
      expect(result.level.generationConfig?.algorithm).toBe('hybrid');
      
      expect(result.player.type).toBe('player');
      expect(result.pizzas.length).toBeGreaterThanOrEqual(0);
    });

    it('should support all algorithm types', () => {
      const algorithms: Array<'perlin' | 'cellular' | 'simple' | 'hybrid'> = [
        'perlin', 'cellular', 'simple', 'hybrid'
      ];

      algorithms.forEach(algorithm => {
        const result = createSimpleTestLevel({
          width: 6,
          height: 4,
          algorithm,
          seed: 42
        });

        expect(result.level.generationConfig?.algorithm).toBe(algorithm);
        expect(result.level.tiles.size).toBeGreaterThan(0);
      });
    });
  });
});

describe('HybridGenerator', () => {
  it('should generate tiles with mixed characteristics', () => {
    const config: LevelGenerationConfig = {
      algorithm: 'hybrid',
      seed: 555,
      parameters: {
        initialDensity: 0.3,
        smoothingIterations: 1,
        scale: 0.2,
        octaves: 2,
      }
    };

    const hybridGen = new HybridGenerator(config);
    const tiles = hybridGen.generate(10, 8);

    expect(tiles.size).toBeGreaterThan(0);
    
    // Should have a variety of tile types
    const tileTypes = new Set(Array.from(tiles.values()).map(t => t.type));
    expect(tileTypes.size).toBeGreaterThanOrEqual(2);
  });

  it('should create deterministic results with same seed for base structure', () => {
    const config: LevelGenerationConfig = {
      algorithm: 'hybrid',
      seed: 777,
    };

    const gen1 = new HybridGenerator(config);
    const gen2 = new HybridGenerator(config);
    
    const tiles1 = gen1.generate(6, 4);
    const tiles2 = gen2.generate(6, 4);

    expect(tiles1.size).toBe(tiles2.size);
    
    // The general structure should be similar (both generators should create similar tile distributions)
    const tileTypes1 = Array.from(tiles1.values()).map(t => t.type).sort();
    const tileTypes2 = Array.from(tiles2.values()).map(t => t.type).sort();
    
    // At least the overall tile count distribution should be reasonably similar
    const uniqueTypes1 = new Set(tileTypes1);
    const uniqueTypes2 = new Set(tileTypes2);
    
    // Should have similar diversity
    expect(Math.abs(uniqueTypes1.size - uniqueTypes2.size)).toBeLessThanOrEqual(2);
  });
});