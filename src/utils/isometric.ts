import type { HexCoordinate } from '../types/game';

/**
 * Isometric transformation utilities for 3D visualization
 * This module provides coordinate transformations for rendering hexagonal grids
 * in an isometric (2.5D) perspective
 */

export interface IsometricPoint {
  x: number;
  y: number;
  z: number;
}

export interface PixelPoint {
  x: number;
  y: number;
}

/**
 * Converts hex coordinates to 3D world coordinates
 * @param hex Hexagon coordinate (q, r, s)
 * @param hexSize Size of the hexagon
 * @param elevation Height offset (default 0)
 * @returns 3D world coordinates
 */
export function hexToWorld(hex: HexCoordinate, hexSize: number, elevation: number = 0): IsometricPoint {
  // Convert hex coordinates to world coordinates
  // Using flat-topped hexagons with x pointing right, y pointing up
  const x = hexSize * (3/2 * hex.q);
  const y = hexSize * (Math.sqrt(3)/2 * hex.q + Math.sqrt(3) * hex.r);
  const z = elevation;
  
  return { x, y, z };
}

/**
 * Converts 3D world coordinates to 2D screen coordinates using isometric projection
 * @param point 3D world coordinates
 * @returns 2D screen coordinates
 */
export function worldToScreen(point: IsometricPoint): PixelPoint {
  // Isometric projection matrix
  // This creates a 30-degree angle view (classic isometric)
  const cos30 = Math.cos(Math.PI / 6); // ~0.866
  const sin30 = Math.sin(Math.PI / 6); // 0.5
  
  const x = (point.x * cos30) - (point.y * cos30);
  const y = (point.x * sin30) + (point.y * sin30) - point.z;
  
  return { x, y };
}

/**
 * Converts hex coordinates directly to isometric screen coordinates
 * @param hex Hexagon coordinate
 * @param hexSize Size of the hexagon
 * @param elevation Height offset
 * @returns 2D screen coordinates
 */
export function hexToIsometric(hex: HexCoordinate, hexSize: number, elevation: number = 0): PixelPoint {
  const worldPoint = hexToWorld(hex, hexSize, elevation);
  return worldToScreen(worldPoint);
}

/**
 * Creates isometric hexagon vertices for SVG rendering
 * @param centerX Center X coordinate
 * @param centerY Center Y coordinate
 * @param hexSize Size of the hexagon
 * @param elevation Height for 3D effect
 * @returns Array of SVG path commands
 */
export function createIsometricHexPath(
  centerX: number, 
  centerY: number, 
  hexSize: number, 
  elevation: number = 0
): string {
  // Create flat hexagon vertices
  const vertices: IsometricPoint[] = [];
  
  // Generate hexagon vertices (flat-topped)
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60) * Math.PI / 180;
    const x = centerX + hexSize * Math.cos(angle);
    const y = centerY + hexSize * Math.sin(angle);
    vertices.push({ x, y, z: elevation });
  }
  
  // Convert to screen coordinates
  const screenVertices = vertices.map(v => worldToScreen(v));
  
  // Create SVG path
  const pathCommands = screenVertices.map((point, index) => {
    const command = index === 0 ? 'M' : 'L';
    return `${command} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
  });
  
  return `${pathCommands.join(' ')} Z`;
}


/**
 * Calculates the visual depth sorting order for tiles
 * @param hex Hexagon coordinate
 * @returns Depth value for sorting (higher = more in front)
 */
export function calculateDepth(hex: HexCoordinate): number {
  // In isometric view, tiles closer to bottom-right appear in front
  return hex.q + hex.r;
}

/**
 * Creates a simple 3D character shape (cylinder/cone)
 * @param centerX Center X coordinate
 * @param centerY Center Y coordinate
 * @param radius Base radius
 * @param height Character height
 * @returns SVG elements for character rendering
 */
export function createIsometricCharacter(
  centerX: number,
  centerY: number,
  radius: number,
  height: number
): {
  base: string;
  body: string;
  shadow: string;
} {
  // Base circle (ground shadow)
  const baseCircle = `M ${centerX - radius} ${centerY} 
                      A ${radius} ${radius * 0.3} 0 1 0 ${centerX + radius} ${centerY} 
                      A ${radius} ${radius * 0.3} 0 1 0 ${centerX - radius} ${centerY}`;
  
  // Character body (ellipse with height)
  const bodyPath = `M ${centerX - radius} ${centerY - height} 
                    A ${radius} ${radius * 0.3} 0 1 0 ${centerX + radius} ${centerY - height} 
                    L ${centerX + radius} ${centerY}
                    A ${radius} ${radius * 0.3} 0 1 0 ${centerX - radius} ${centerY}
                    Z`;
  
  // Shadow (darker ellipse on ground)
  const shadowPath = `M ${centerX - radius * 0.8} ${centerY} 
                      A ${radius * 0.8} ${radius * 0.2} 0 1 0 ${centerX + radius * 0.8} ${centerY} 
                      A ${radius * 0.8} ${radius * 0.2} 0 1 0 ${centerX - radius * 0.8} ${centerY}`;
  
  return {
    base: baseCircle,
    body: bodyPath,
    shadow: shadowPath
  };
}