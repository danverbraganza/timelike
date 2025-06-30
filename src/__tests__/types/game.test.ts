import type { HexCoordinate } from '../../types/game';
import { PizzaType, TileType } from '../../types/game';

describe('Game Types', () => {
  describe('HexCoordinate', () => {
    it('should satisfy cube coordinate constraint', () => {
      const coord: HexCoordinate = { q: 2, r: -1, s: -1 };
      expect(coord.q + coord.r + coord.s).toBe(0);
    });
  });

  describe('PizzaType', () => {
    it('should have all pizza types defined', () => {
      expect(PizzaType.CHEESE).toBe('cheese');
      expect(PizzaType.PEPPERONI).toBe('pepperoni');
      expect(PizzaType.SAUSAGE).toBe('sausage');
      expect(PizzaType.SUPREME).toBe('supreme');
    });
  });

  describe('TileType', () => {
    it('should have all tile types defined', () => {
      expect(TileType.STONE).toBe('stone');
      expect(TileType.GRASS).toBe('grass');
      expect(TileType.WATER).toBe('water');
      expect(TileType.LAVA).toBe('lava');
      expect(TileType.BLOCKED).toBe('blocked');
      expect(TileType.PIZZA_SPAWN).toBe('pizza_spawn');
      expect(TileType.CHARACTER_SPAWN).toBe('character_spawn');
    });
  });
});