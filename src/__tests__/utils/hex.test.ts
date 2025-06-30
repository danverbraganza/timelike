import {
  createHex,
  hexToKey,
  keyToHex,
  hexEquals,
  getNeighbors,
  hexDistance
} from '../../utils/hex';

describe('Hex Utilities', () => {
  describe('createHex', () => {
    it('should create valid hex coordinates', () => {
      const hex = createHex(2, -1);
      expect(hex.q).toBe(2);
      expect(hex.r).toBe(-1);
      expect(hex.s).toBe(-1);
      expect(hex.q + hex.r + hex.s).toBe(0);
    });
  });

  describe('hexToKey and keyToHex', () => {
    it('should convert between hex and string representation', () => {
      const hex = createHex(3, -2);
      const key = hexToKey(hex);
      expect(key).toBe('3,-2');
      
      const restored = keyToHex(key);
      expect(hexEquals(hex, restored)).toBe(true);
    });
  });

  describe('hexEquals', () => {
    it('should correctly compare hex coordinates', () => {
      const hex1 = createHex(1, 2);
      const hex2 = createHex(1, 2);
      const hex3 = createHex(2, 1);
      
      expect(hexEquals(hex1, hex2)).toBe(true);
      expect(hexEquals(hex1, hex3)).toBe(false);
    });
  });

  describe('getNeighbors', () => {
    it('should return six neighbors', () => {
      const hex = createHex(0, 0);
      const neighbors = getNeighbors(hex);
      
      expect(neighbors).toHaveLength(6);
      neighbors.forEach(neighbor => {
        expect(neighbor.q + neighbor.r + neighbor.s).toBe(0);
      });
    });
  });

  describe('hexDistance', () => {
    it('should calculate correct distances', () => {
      const hex1 = createHex(0, 0);
      const hex2 = createHex(2, -1);
      const hex3 = createHex(0, 3);
      
      expect(hexDistance(hex1, hex1)).toBe(0);
      expect(hexDistance(hex1, hex2)).toBe(2);
      expect(hexDistance(hex1, hex3)).toBe(3);
    });
  });
});