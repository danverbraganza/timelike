import type { HexCoordinate } from '../types/game';

/**
 * Utility functions for hexagonal grid calculations
 */

// Create a hex coordinate ensuring cube constraint
export function createHex(q: number, r: number): HexCoordinate {
  return { q, r, s: -q - r };
}

// Convert hex coordinate to string key for Map storage
export function hexToKey(hex: HexCoordinate): string {
  return `${hex.q},${hex.r}`;
}

// Parse string key back to hex coordinate
export function keyToHex(key: string): HexCoordinate {
  const [q, r] = key.split(',').map(Number);
  return createHex(q, r);
}

// Check if two hex coordinates are equal
export function hexEquals(a: HexCoordinate, b: HexCoordinate): boolean {
  return a.q === b.q && a.r === b.r && a.s === b.s;
}

// Get all six neighbors of a hex
export function getNeighbors(hex: HexCoordinate): HexCoordinate[] {
  const directions = [
    [+1, 0], [+1, -1], [0, -1],
    [-1, 0], [-1, +1], [0, +1]
  ];
  
  return directions.map(([dq, dr]) => 
    createHex(hex.q + dq, hex.r + dr)
  );
}

// Calculate distance between two hexes
export function hexDistance(a: HexCoordinate, b: HexCoordinate): number {
  return (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs(a.s - b.s)) / 2;
}

// Add two hex coordinates
export function hexAdd(a: HexCoordinate, b: HexCoordinate): HexCoordinate {
  return createHex(a.q + b.q, a.r + b.r);
}

// Subtract two hex coordinates
export function hexSubtract(a: HexCoordinate, b: HexCoordinate): HexCoordinate {
  return createHex(a.q - b.q, a.r - b.r);
}

// Scale a hex coordinate by a factor
export function hexScale(hex: HexCoordinate, factor: number): HexCoordinate {
  return createHex(Math.round(hex.q * factor), Math.round(hex.r * factor));
}

// Get hex coordinate in a specific direction (0-5)
export function hexDirection(direction: number): HexCoordinate {
  const directions = [
    createHex(+1, 0), createHex(+1, -1), createHex(0, -1),
    createHex(-1, 0), createHex(-1, +1), createHex(0, +1)
  ];
  return directions[direction % 6];
}

// Get neighbor in a specific direction
export function hexNeighbor(hex: HexCoordinate, direction: number): HexCoordinate {
  return hexAdd(hex, hexDirection(direction));
}

// Calculate all hexes in a straight line from a to b
export function hexLineDraw(a: HexCoordinate, b: HexCoordinate): HexCoordinate[] {
  const distance = hexDistance(a, b);
  if (distance === 0) return [a];
  
  const results: HexCoordinate[] = [];
  for (let i = 0; i <= distance; i++) {
    const t = i / distance;
    const lerp = hexLerp(a, b, t);
    results.push(hexRound(lerp));
  }
  return results;
}

// Linear interpolation between two hex coordinates
function hexLerp(a: HexCoordinate, b: HexCoordinate, t: number): HexCoordinate {
  return {
    q: a.q + (b.q - a.q) * t,
    r: a.r + (b.r - a.r) * t,
    s: a.s + (b.s - a.s) * t
  };
}

// Round fractional hex coordinates to nearest valid hex
function hexRound(hex: HexCoordinate): HexCoordinate {
  let roundedQ = Math.round(hex.q);
  let roundedR = Math.round(hex.r);
  let roundedS = Math.round(hex.s);
  
  const qDiff = Math.abs(roundedQ - hex.q);
  const rDiff = Math.abs(roundedR - hex.r);
  const sDiff = Math.abs(roundedS - hex.s);
  
  if (qDiff > rDiff && qDiff > sDiff) {
    roundedQ = -roundedR - roundedS;
  } else if (rDiff > sDiff) {
    roundedR = -roundedQ - roundedS;
  } else {
    roundedS = -roundedQ - roundedR;
  }
  
  return { q: roundedQ, r: roundedR, s: roundedS };
}

// Get all hexes within a certain range
export function hexRange(center: HexCoordinate, range: number): HexCoordinate[] {
  const results: HexCoordinate[] = [];
  for (let q = -range; q <= range; q++) {
    const r1 = Math.max(-range, -q - range);
    const r2 = Math.min(range, -q + range);
    for (let r = r1; r <= r2; r++) {
      results.push(hexAdd(center, createHex(q, r)));
    }
  }
  return results;
}

// Get all hexes at exactly a certain distance (ring)
export function hexRing(center: HexCoordinate, radius: number): HexCoordinate[] {
  if (radius === 0) return [center];
  
  const results: HexCoordinate[] = [];
  let hex = hexAdd(center, hexScale(hexDirection(4), radius));
  
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < radius; j++) {
      results.push(hex);
      hex = hexNeighbor(hex, i);
    }
  }
  return results;
}

// Simple pathfinding using A* algorithm
export interface PathfindingOptions {
  maxDistance?: number;
  isBlocked?: (hex: HexCoordinate) => boolean;
}

export function hexPathfind(
  start: HexCoordinate, 
  goal: HexCoordinate, 
  options: PathfindingOptions = {}
): HexCoordinate[] | null {
  const { maxDistance = 50, isBlocked = () => false } = options;
  
  if (hexEquals(start, goal)) return [start];
  if (isBlocked(goal)) return null;
  
  const openSet = new Set<string>();
  const cameFrom = new Map<string, HexCoordinate>();
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();
  
  const startKey = hexToKey(start);
  const goalKey = hexToKey(goal);
  
  openSet.add(startKey);
  gScore.set(startKey, 0);
  fScore.set(startKey, hexDistance(start, goal));
  
  while (openSet.size > 0) {
    // Find node with lowest fScore
    let current = '';
    let lowestF = Infinity;
    for (const node of openSet) {
      const f = fScore.get(node) || Infinity;
      if (f < lowestF) {
        lowestF = f;
        current = node;
      }
    }
    
    if (current === goalKey) {
      // Reconstruct path
      const path: HexCoordinate[] = [];
      let currentHex = goal;
      path.push(currentHex);
      
      while (cameFrom.has(hexToKey(currentHex))) {
        currentHex = cameFrom.get(hexToKey(currentHex))!;
        path.push(currentHex);
      }
      
      return path.reverse();
    }
    
    openSet.delete(current);
    const currentHex = keyToHex(current);
    const currentG = gScore.get(current) || 0;
    
    if (currentG >= maxDistance) continue;
    
    for (const neighbor of getNeighbors(currentHex)) {
      if (isBlocked(neighbor)) continue;
      
      const neighborKey = hexToKey(neighbor);
      const tentativeG = currentG + 1;
      const neighborG = gScore.get(neighborKey) || Infinity;
      
      if (tentativeG < neighborG) {
        cameFrom.set(neighborKey, currentHex);
        gScore.set(neighborKey, tentativeG);
        fScore.set(neighborKey, tentativeG + hexDistance(neighbor, goal));
        
        if (!openSet.has(neighborKey)) {
          openSet.add(neighborKey);
        }
      }
    }
  }
  
  return null; // No path found
}

// Convert hex coordinates to pixel coordinates for rendering
export function hexToPixel(hex: HexCoordinate, size: number): { x: number; y: number } {
  const x = size * (3/2 * hex.q);
  const y = size * (Math.sqrt(3)/2 * hex.q + Math.sqrt(3) * hex.r);
  return { x, y };
}

// Convert pixel coordinates to hex coordinates
export function pixelToHex(x: number, y: number, size: number): HexCoordinate {
  const q = (2/3 * x) / size;
  const r = (-1/3 * x + Math.sqrt(3)/3 * y) / size;
  return hexRound({ q, r, s: -q - r });
}

// Validate that a hex coordinate satisfies the cube constraint
export function isValidHex(hex: HexCoordinate): boolean {
  return Math.abs(hex.q + hex.r + hex.s) < 1e-10; // Account for floating point precision
}