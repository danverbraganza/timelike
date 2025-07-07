import { 
  hexToWorld, 
  worldToScreen, 
  hexToIsometric, 
  calculateDepth,
  createIsometricHexPath,
  createIsometric3DBlock,
  createIsometricCharacter
} from '../../utils/isometric';

describe('Isometric Utils', () => {
  const testHex = { q: 1, r: 1, s: -2 };
  const hexSize = 30;

  describe('hexToWorld', () => {
    it('should convert hex coordinates to world coordinates', () => {
      const result = hexToWorld(testHex, hexSize);
      expect(result.x).toBeCloseTo(45); // 30 * (3/2 * 1)
      expect(result.y).toBeCloseTo(77.94); // 30 * (sqrt(3)/2 * 1 + sqrt(3) * 1)
      expect(result.z).toBe(0);
    });

    it('should handle elevation', () => {
      const result = hexToWorld(testHex, hexSize, 10);
      expect(result.z).toBe(10);
    });
  });

  describe('worldToScreen', () => {
    it('should convert world coordinates to screen coordinates', () => {
      const worldPoint = { x: 45, y: 77.94, z: 0 };
      const result = worldToScreen(worldPoint);
      expect(result.x).toBeCloseTo(-28.5, 1); // Approximate isometric projection
      expect(result.y).toBeCloseTo(61.5, 1); // Approximate isometric projection
    });

    it('should handle elevation in screen conversion', () => {
      const worldPoint = { x: 45, y: 77.94, z: 10 };
      const result = worldToScreen(worldPoint);
      expect(result.y).toBeCloseTo(51.5, 1); // y should be offset by -z
    });
  });

  describe('hexToIsometric', () => {
    it('should convert hex coordinates directly to isometric screen coordinates', () => {
      const result = hexToIsometric(testHex, hexSize);
      expect(result.x).toBeCloseTo(-28.5, 1);
      expect(result.y).toBeCloseTo(61.5, 1);
    });
  });

  describe('calculateDepth', () => {
    it('should calculate proper depth for rendering order', () => {
      const depth1 = calculateDepth({ q: 0, r: 0, s: 0 });
      const depth2 = calculateDepth({ q: 1, r: 1, s: -2 });
      const depth3 = calculateDepth({ q: 2, r: 2, s: -4 });
      
      expect(depth1).toBe(0);
      expect(depth2).toBe(2);
      expect(depth3).toBe(4);
      
      // Verify increasing order
      expect(depth1 < depth2).toBe(true);
      expect(depth2 < depth3).toBe(true);
    });
  });

  describe('createIsometricHexPath', () => {
    it('should create a valid SVG path for a hexagon', () => {
      const path = createIsometricHexPath(0, 0, hexSize, 0);
      expect(path).toContain('M');
      expect(path).toContain('L');
      expect(path).toContain('Z');
      expect(path).toMatch(/^M\s+[-\d.]+\s+[-\d.]+(\s+L\s+[-\d.]+\s+[-\d.]+)*\s+Z$/);
    });
  });

  describe('createIsometric3DBlock', () => {
    it('should create 3D block with top, left, and right faces', () => {
      const block = createIsometric3DBlock(0, 0, hexSize, 20);
      
      expect(block.top).toContain('M');
      expect(block.top).toContain('Z');
      expect(block.left).toContain('M');
      expect(block.left).toContain('Z');
      expect(block.right).toContain('M');
      expect(block.right).toContain('Z');
    });
  });

  describe('createIsometricCharacter', () => {
    it('should create character with base, body, and shadow', () => {
      const character = createIsometricCharacter(0, 0, 15, 20);
      
      expect(character.base).toContain('M');
      expect(character.base).toContain('A'); // Arc for ellipse
      expect(character.body).toContain('M');
      expect(character.body).toContain('A');
      expect(character.shadow).toContain('M');
      expect(character.shadow).toContain('A');
    });
  });
});