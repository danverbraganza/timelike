import React from 'react';
import type { HexCoordinate, Tile, Character, Pizza } from '../types/game';
import { TileType } from '../types/game';
import { hexToPixel } from '../utils/hex';

/**
 * TRACER BULLETS / JIG CODE - This is temporary visualization code
 * TODO: This should be refactored into proper components with better styling
 * and separated concerns when we build the real UI system
 */

interface HexGridVisualizationProps {
  tiles: Tile[];
  characters: Character[];
  pizzas: Pizza[];
  onHexClick?: (position: HexCoordinate) => void;
  onHexHover?: (position: HexCoordinate | null) => void;
  selectedHex?: HexCoordinate | null;
  hoveredHex?: HexCoordinate | null;
  hexSize?: number;
}

// TRACER BULLETS: Simple color mapping for tiles
const getTileColor = (tileType: TileType): string => {
  switch (tileType) {
    case TileType.GRASS: return '#90EE90';
    case TileType.STONE: return '#808080';
    case TileType.WATER: return '#4169E1';
    case TileType.LAVA: return '#FF4500';
    case TileType.SAND: return '#F4A460';
    case TileType.DIRT: return '#8B4513';
    case TileType.STEEL: return '#B0C4DE';
    case TileType.VOID: return '#000000';
    case TileType.BLOCKED: return '#2F2F2F';
    case TileType.PIZZA_SPAWN: return '#FFD700';
    case TileType.CHARACTER_SPAWN: return '#98FB98';
    default: return '#FFFFFF';
  }
};

// TRACER BULLETS: Simple SVG hexagon component
const HexagonTile: React.FC<{
  tile: Tile;
  character?: Character;
  pizza?: Pizza;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  isSelected?: boolean;
  isHovered?: boolean;
  hexSize: number;
  pixelPosition: { x: number; y: number };
}> = ({ 
  tile, 
  character, 
  pizza, 
  onClick, 
  onMouseEnter, 
  onMouseLeave, 
  isSelected, 
  isHovered, 
  hexSize, 
  pixelPosition 
}) => {
  // TRACER BULLETS: Simple hexagon path calculation
  const hexPath = (() => {
    const angles = [0, 60, 120, 180, 240, 300];
    const points = angles.map(angle => {
      const radian = (angle * Math.PI) / 180;
      const x = hexSize * Math.cos(radian);
      const y = hexSize * Math.sin(radian);
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')} Z`;
  })();

  const fillColor = getTileColor(tile.type);
  const strokeColor = isSelected ? '#FF0000' : isHovered ? '#00FF00' : '#000000';
  const strokeWidth = isSelected ? 3 : isHovered ? 2 : 1;

  return (
    <g
      transform={`translate(${pixelPosition.x}, ${pixelPosition.y})`}
      style={{ cursor: 'pointer' }}
      onClick={() => {
        console.log('TRACER BULLETS: Hexagon clicked at:', tile.position);
        onClick?.();
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Tile background */}
      <path
        d={hexPath}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        style={{ pointerEvents: 'all' }}
      />
      
      {/* Character (simple circle) */}
      {character && (
        <circle
          cx={0}
          cy={0}
          r={hexSize * 0.3}
          fill={character.type === 'player' ? '#0000FF' : '#FF00FF'}
          stroke="#000000"
          strokeWidth={1}
          style={{ pointerEvents: 'none' }}
        />
      )}
      
      {/* Pizza (simple triangle) */}
      {pizza && (
        <polygon
          points={`0,${-hexSize * 0.2} ${hexSize * 0.2},${hexSize * 0.1} ${-hexSize * 0.2},${hexSize * 0.1}`}
          fill="#FFA500"
          stroke="#000000"
          strokeWidth={1}
          style={{ pointerEvents: 'none' }}
        />
      )}
      
      {/* TRACER BULLETS: Debug coordinate text */}
      <text
        x={0}
        y={hexSize * 0.6}
        textAnchor="middle"
        fontSize={hexSize * 0.15}
        fill="#000000"
        style={{ pointerEvents: 'none', fontFamily: 'monospace' }}
      >
        {tile.position.q},{tile.position.r}
      </text>
    </g>
  );
};

export const HexGridVisualization: React.FC<HexGridVisualizationProps> = ({
  tiles,
  characters,
  pizzas,
  onHexClick,
  onHexHover,
  selectedHex,
  hoveredHex,
  hexSize = 30,
}) => {
  // TRACER BULLETS: Calculate grid bounds for centering
  const minX = Math.min(...tiles.map(t => hexToPixel(t.position, hexSize).x));
  const maxX = Math.max(...tiles.map(t => hexToPixel(t.position, hexSize).x));
  const minY = Math.min(...tiles.map(t => hexToPixel(t.position, hexSize).y));
  const maxY = Math.max(...tiles.map(t => hexToPixel(t.position, hexSize).y));
  
  const width = maxX - minX + hexSize * 2;
  const height = maxY - minY + hexSize * 2;
  const offsetX = -minX + hexSize;
  const offsetY = -minY + hexSize;

  return (
    <div style={{ border: '2px solid #ccc', margin: '20px', padding: '20px' }}>
      <h3>TRACER BULLETS - Hex Grid Visualization</h3>
      <p style={{ fontSize: '12px', color: '#666' }}>
        This is temporary visualization code. Click hexes to move player.
      </p>
      
      <svg
        width={width}
        height={height}
        style={{ background: '#f0f0f0', border: '1px solid #ddd' }}
      >
        {tiles.map((tile) => {
          const pixelPos = hexToPixel(tile.position, hexSize);
          const character = characters.find(c => 
            c.position.q === tile.position.q && c.position.r === tile.position.r
          );
          const pizza = pizzas.find(p => 
            p.position.q === tile.position.q && p.position.r === tile.position.r
          );
          
          const isSelected = Boolean(selectedHex && 
            selectedHex.q === tile.position.q && selectedHex.r === tile.position.r);
          const isHovered = Boolean(hoveredHex && 
            hoveredHex.q === tile.position.q && hoveredHex.r === tile.position.r);

          return (
            <HexagonTile
              key={`${tile.position.q},${tile.position.r}`}
              tile={tile}
              character={character}
              pizza={pizza}
              onClick={() => onHexClick?.(tile.position)}
              onMouseEnter={() => onHexHover?.(tile.position)}
              onMouseLeave={() => onHexHover?.(null)}
              isSelected={isSelected}
              isHovered={isHovered}
              hexSize={hexSize}
              pixelPosition={{
                x: pixelPos.x + offsetX,
                y: pixelPos.y + offsetY,
              }}
            />
          );
        })}
      </svg>
    </div>
  );
};