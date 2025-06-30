import {
  createHex,
  hexToKey,
  keyToHex,
  hexEquals,
  getNeighbors,
  hexDistance,
  hexAdd,
  hexSubtract,
  hexScale,
  hexDirection,
  hexNeighbor,
  hexLineDraw,
  hexRange,
  hexRing,
  hexPathfind,
  hexToPixel,
  pixelToHex,
  isValidHex
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
      // Check just first neighbor
      expect(neighbors[0].q + neighbors[0].r + neighbors[0].s).toBe(0);
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

  describe('hexAdd', () => {
    it('should add hex coordinates correctly', () => {
      const hex1 = createHex(1, 2);
      const hex2 = createHex(3, -1);
      const result = hexAdd(hex1, hex2);
      
      expect(result.q).toBe(4);
      expect(result.r).toBe(1);
      expect(result.s).toBe(-5);
      expect(result.q + result.r + result.s).toBe(0);
    });
  });

  describe('hexSubtract', () => {
    it('should subtract hex coordinates correctly', () => {
      const hex1 = createHex(3, -1);
      const hex2 = createHex(1, 2);
      const result = hexSubtract(hex1, hex2);
      
      expect(result.q).toBe(2);
      expect(result.r).toBe(-3);
      expect(result.s).toBe(1);
      expect(result.q + result.r + result.s).toBe(0);
    });
  });

  describe('hexScale', () => {
    it('should scale hex coordinates correctly', () => {
      const hex = createHex(2, -1);
      const result = hexScale(hex, 3);
      
      expect(result.q).toBe(6);
      expect(result.r).toBe(-3);
      expect(result.s).toBe(-3);
    });
  });

  describe('hexDirection', () => {
    it('should return correct direction vectors', () => {
      const dir0 = hexDirection(0);
      const dir3 = hexDirection(3);
      
      expect(dir0).toEqual(createHex(1, 0));
      expect(dir3).toEqual(createHex(-1, 0));
    });
  });

  describe('hexNeighbor', () => {
    it('should return correct neighbor', () => {
      const hex = createHex(0, 0);
      const neighbor = hexNeighbor(hex, 0);
      
      expect(neighbor).toEqual(createHex(1, 0));
    });
  });

  describe('hexLineDraw', () => {
    it('should draw line between two hexes', () => {
      const start = createHex(0, 0);
      const end = createHex(2, -1);
      const line = hexLineDraw(start, end);
      
      expect(line).toHaveLength(3);
      expect(line[0]).toEqual(start);
      expect(line[line.length - 1]).toEqual(end);
    });

    it('should handle same start and end', () => {
      const hex = createHex(1, 1);
      const line = hexLineDraw(hex, hex);
      
      expect(line).toHaveLength(1);
      expect(line[0]).toEqual(hex);
    });
  });

  describe('hexRange', () => {
    it('should return hexes within range', () => {
      const center = createHex(0, 0);
      const range1 = hexRange(center, 1);
      const range2 = hexRange(center, 2);
      
      expect(range1).toHaveLength(7); // Center + 6 neighbors
      expect(range2).toHaveLength(19); // 1 + 6 + 12
      
      // Check just first few hexes are valid
      expect(range1[0].q + range1[0].r + range1[0].s).toBe(0);
      expect(range2[0].q + range2[0].r + range2[0].s).toBe(0);
    });
  });

  describe('hexRing', () => {
    it('should return hexes at exact distance', () => {
      const center = createHex(0, 0);
      const ring0 = hexRing(center, 0);
      const ring1 = hexRing(center, 1);
      const ring2 = hexRing(center, 2);
      
      expect(ring0).toHaveLength(1);
      expect(ring1).toHaveLength(6);
      expect(ring2).toHaveLength(12);
      
      // Check distance for first hex in ring
      expect(hexDistance(center, ring2[0])).toBe(2);
    });
  });

  describe('hexPathfind', () => {
    it('should find path between adjacent hexes', () => {
      const start = createHex(0, 0);
      const goal = createHex(1, 0);
      const path = hexPathfind(start, goal);
      
      expect(path).not.toBeNull();
      expect(path).toHaveLength(2);
      expect(path?.[0]).toEqual(start);
      expect(path?.[1]).toEqual(goal);
    });

    it('should handle same start and goal', () => {
      const hex = createHex(0, 0);
      const path = hexPathfind(hex, hex);
      
      expect(path).toHaveLength(1);
      expect(path?.[0]).toEqual(hex);
    });
  });

  describe('hexToPixel and pixelToHex', () => {
    it('should convert between hex and pixel coordinates', () => {
      const hex = createHex(2, -1);
      const size = 30;
      const pixel = hexToPixel(hex, size);
      const backToHex = pixelToHex(pixel.x, pixel.y, size);
      
      expect(hexEquals(hex, backToHex)).toBe(true);
    });

    it('should handle origin correctly', () => {
      const origin = createHex(0, 0);
      const size = 30;
      const pixel = hexToPixel(origin, size);
      
      expect(pixel.x).toBeCloseTo(0);
      expect(pixel.y).toBeCloseTo(0);
    });
  });

  describe('isValidHex', () => {
    it('should validate correct hex coordinates', () => {
      const validHex = createHex(2, -1);
      const invalidHex = { q: 1, r: 1, s: 1 };
      
      expect(isValidHex(validHex)).toBe(true);
      expect(isValidHex(invalidHex)).toBe(false);
    });
  });
});