import { HexCoordinate } from '../types/game';

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