import React from 'react';
import type { HexCoordinate, Tile, Character, Pizza } from '../types/game';
import { TileType } from '../types/game';
import { 
  hexToIsometric, 
  createIsometricCharacter, 
  createIsometricHexPath,
  calculateDepth 
} from '../utils/isometric';

/**
 * Isometric 3D visualization component for the hex grid
 * Features mystic/neon styling with glow effects and 3D perspective
 */

interface IsometricHexGridVisualizationProps {
  tiles: Tile[];
  characters: Character[];
  pizzas: Pizza[];
  onHexClick?: (position: HexCoordinate) => void;
  onHexHover?: (position: HexCoordinate | null) => void;
  selectedHex?: HexCoordinate | null;
  hoveredHex?: HexCoordinate | null;
  hexSize?: number;
}

// Mystic/neon color palette for tiles - all tiles at same height
const getTileStyle = (tileType: TileType): { 
  color: string; 
  glowColor: string; 
  opacity: number 
} => {
  switch (tileType) {
    case TileType.GRASS:
      return { color: '#00ff88', glowColor: '#44ffaa', opacity: 0.8 };
    case TileType.STONE:
      return { color: '#8888ff', glowColor: '#aaaaff', opacity: 0.9 };
    case TileType.WATER:
      return { color: '#00ccff', glowColor: '#44ddff', opacity: 0.7 };
    case TileType.LAVA:
      return { color: '#ff3300', glowColor: '#ff8844', opacity: 0.9 };
    case TileType.SAND:
      return { color: '#ffcc00', glowColor: '#ffdd44', opacity: 0.8 };
    case TileType.DIRT:
      return { color: '#cc8844', glowColor: '#dd9955', opacity: 0.8 };
    case TileType.STEEL:
      return { color: '#ccccff', glowColor: '#ddddff', opacity: 0.9 };
    case TileType.VOID:
      return { color: '#330033', glowColor: '#660066', opacity: 0.6 };
    case TileType.BLOCKED:
      return { color: '#ff0044', glowColor: '#ff4477', opacity: 0.9 };
    case TileType.PIZZA_SPAWN:
      return { color: '#ffff00', glowColor: '#ffff44', opacity: 0.8 };
    case TileType.CHARACTER_SPAWN:
      return { color: '#88ff88', glowColor: '#aaffaa', opacity: 0.8 };
    default:
      return { color: '#666666', glowColor: '#888888', opacity: 0.8 };
  }
};

// Character colors with neon glow - consistent height
const getCharacterStyle = (character: Character): { 
  bodyColor: string; 
  glowColor: string; 
  height: number 
} => {
  switch (character.type) {
    case 'player':
      return { bodyColor: '#00ffff', glowColor: '#44ffff', height: 20 };
    case 'npc':
      return { bodyColor: '#ff00ff', glowColor: '#ff44ff', height: 20 };
    default:
      return { bodyColor: '#ffffff', glowColor: '#cccccc', height: 20 };
  }
};

// Isometric Tile Component
const IsometricTile: React.FC<{
  tile: Tile;
  character?: Character;
  pizza?: Pizza;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  isSelected?: boolean;
  isHovered?: boolean;
  hexSize: number;
  screenPosition: { x: number; y: number };
  pulseOffset: number;
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
  screenPosition,
  pulseOffset
}) => {
  const tileStyle = getTileStyle(tile.type);
  
  // Create isometric hexagon shape at consistent height
  const tileHeight = 10; // Uniform height for all tiles
  const hexPath = createIsometricHexPath(0, 0, hexSize * 0.9, tileHeight);
  
  // Enhanced glow effect for selected/hovered tiles
  const glowIntensity = isSelected ? 8 : isHovered ? 4 : 2;
  const strokeWidth = isSelected ? 3 : isHovered ? 2 : 1;
  
  return (
    <g
      transform={`translate(${screenPosition.x}, ${screenPosition.y})`}
      style={{ cursor: 'pointer' }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Glow effect filter and pulse animation */}
      <defs>
        <filter id={`glow-${tile.position.q}-${tile.position.r}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={glowIntensity} result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Rounded hexagon tile */}
      <path
        d={hexPath}
        fill={tileStyle.color}
        opacity={tileStyle.opacity}
        stroke={tileStyle.glowColor}
        strokeWidth={strokeWidth + 1}
        filter={`url(#glow-${tile.position.q}-${tile.position.r})`}
        style={{ pointerEvents: 'all' }}
      >
        <animate
          attributeName="opacity"
          values="0.8;0.95;0.8"
          dur="3s"
          repeatCount="indefinite"
          begin={`${pulseOffset}s`}
        />
      </path>
      
      {/* Enhanced border glow */}
      <path
        d={hexPath}
        fill="none"
        stroke={tileStyle.glowColor}
        strokeWidth={strokeWidth + 2}
        opacity={0.6}
        filter={`url(#glow-${tile.position.q}-${tile.position.r})`}
        style={{ pointerEvents: 'none' }}
      >
        <animate
          attributeName="stroke-width"
          values={`${strokeWidth + 1};${strokeWidth + 1.5};${strokeWidth + 1}`}
          dur="3s"
          repeatCount="indefinite"
          begin={`${pulseOffset}s`}
        />
      </path>
      
      {/* Tile center glow */}
      {(isSelected || isHovered) && (
        <circle
          cx={0}
          cy={0}
          r={hexSize * 0.3}
          fill={tileStyle.glowColor}
          opacity={0.4}
          filter={`url(#glow-${tile.position.q}-${tile.position.r})`}
        />
      )}
      
      {/* Character rendering */}
      {character && (
        <IsometricCharacterSprite
          character={character}
          hexSize={hexSize}
          tileHeight={tileHeight}
        />
      )}
      
      {/* Pizza rendering */}
      {pizza && (
        <IsometricPizzaSprite
          pizza={pizza}
          hexSize={hexSize}
          tileHeight={tileHeight}
        />
      )}
      
      {/* Coordinate text (subtle) */}
      <text
        x={0}
        y={hexSize * 0.8}
        textAnchor="middle"
        fontSize={hexSize * 0.12}
        fill="#ffffff"
        fillOpacity={0.5}
        style={{ pointerEvents: 'none', fontFamily: 'monospace' }}
      >
        {tile.position.q},{tile.position.r}
      </text>
    </g>
  );
};

// Isometric Character Sprite Component
const IsometricCharacterSprite: React.FC<{
  character: Character;
  hexSize: number;
  tileHeight: number;
}> = ({ character, hexSize, tileHeight }) => {
  const characterStyle = getCharacterStyle(character);
  const characterShape = createIsometricCharacter(0, -tileHeight, hexSize * 0.3, characterStyle.height);
  
  return (
    <g>
      {/* Character glow effect */}
      <defs>
        <filter id={`char-glow-${character.id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Ground shadow */}
      <path
        d={characterShape.shadow}
        fill="#000000"
        opacity={0.3}
        style={{ pointerEvents: 'none' }}
      />
      
      {/* Character body */}
      <path
        d={characterShape.body}
        fill={characterStyle.bodyColor}
        stroke={characterStyle.glowColor}
        strokeWidth={1}
        opacity={0.9}
        filter={`url(#char-glow-${character.id})`}
        style={{ pointerEvents: 'none' }}
      />
      
      {/* Character highlight */}
      <circle
        cx={0}
        cy={-tileHeight - characterStyle.height * 0.7}
        r={hexSize * 0.15}
        fill={characterStyle.glowColor}
        opacity={0.8}
        filter={`url(#char-glow-${character.id})`}
        style={{ pointerEvents: 'none' }}
      />
    </g>
  );
};

// Isometric Pizza Sprite Component
const IsometricPizzaSprite: React.FC<{
  pizza: Pizza;
  hexSize: number;
  tileHeight: number;
}> = ({ pizza, hexSize, tileHeight }) => {
  const pizzaHeight = 8;
  const pizzaRadius = hexSize * 0.2;
  
  return (
    <g>
      {/* Pizza glow effect */}
      <defs>
        <filter id={`pizza-glow-${pizza.id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Pizza base (3D cylinder) */}
      <ellipse
        cx={0}
        cy={-tileHeight - pizzaHeight * 0.5}
        rx={pizzaRadius}
        ry={pizzaRadius * 0.3}
        fill="#ff8800"
        stroke="#ffaa00"
        strokeWidth={1}
        opacity={0.9}
        filter={`url(#pizza-glow-${pizza.id})`}
        style={{ pointerEvents: 'none' }}
      />
      
      {/* Pizza top */}
      <ellipse
        cx={0}
        cy={-tileHeight - pizzaHeight}
        rx={pizzaRadius}
        ry={pizzaRadius * 0.3}
        fill="#ffaa00"
        stroke="#ffcc00"
        strokeWidth={1}
        opacity={0.9}
        filter={`url(#pizza-glow-${pizza.id})`}
        style={{ pointerEvents: 'none' }}
      />
      
      {/* Pizza glow */}
      <circle
        cx={0}
        cy={-tileHeight - pizzaHeight * 0.5}
        r={pizzaRadius * 1.5}
        fill="#ffaa00"
        opacity={0.3}
        filter={`url(#pizza-glow-${pizza.id})`}
        style={{ pointerEvents: 'none' }}
      />
    </g>
  );
};

export const IsometricHexGridVisualization: React.FC<IsometricHexGridVisualizationProps> = ({
  tiles,
  characters,
  pizzas,
  onHexClick,
  onHexHover,
  selectedHex,
  hoveredHex,
  hexSize = 35,
}) => {
  // Sort tiles by depth for proper rendering order
  const sortedTiles = [...tiles].sort((a, b) => calculateDepth(a.position) - calculateDepth(b.position));
  
  // Calculate screen positions for all tiles
  const tilePositions = sortedTiles.map(tile => ({
    tile,
    screenPos: hexToIsometric(tile.position, hexSize)
  }));
  
  // Calculate grid bounds for centering
  const minX = Math.min(...tilePositions.map(t => t.screenPos.x));
  const maxX = Math.max(...tilePositions.map(t => t.screenPos.x));
  const minY = Math.min(...tilePositions.map(t => t.screenPos.y));
  const maxY = Math.max(...tilePositions.map(t => t.screenPos.y));
  
  const width = maxX - minX + hexSize * 4;
  const height = maxY - minY + hexSize * 4;
  const offsetX = -minX + hexSize * 2;
  const offsetY = -minY + hexSize * 2;

  return (
    <div style={{ 
      border: '2px solid #333', 
      margin: '20px', 
      padding: '20px',
      backgroundColor: '#001122',
      borderRadius: '10px',
      boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)'
    }}>
      <h3 style={{ color: '#00ffff', textAlign: 'center', marginBottom: '10px' }}>
        ✨ Isometric Timelike Universe ✨
      </h3>
      <p style={{ 
        fontSize: '12px', 
        color: '#88ccff', 
        textAlign: 'center',
        marginBottom: '15px'
      }}>
        Navigate through the mystic hex dimensions. Click tiles to move your character.
      </p>
      
      <svg
        width={width}
        height={height}
        style={{ 
          background: 'linear-gradient(135deg, #001122 0%, #002244 50%, #001133 100%)',
          border: '1px solid #004466',
          borderRadius: '5px',
          filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.2))'
        }}
      >
        {/* Background stars effect */}
        <defs>
          <pattern id="stars" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1" fill="#ffffff" opacity="0.3"/>
            <circle cx="70" cy="30" r="0.5" fill="#00ffff" opacity="0.5"/>
            <circle cx="30" cy="70" r="0.8" fill="#ff00ff" opacity="0.4"/>
            <circle cx="90" cy="80" r="0.6" fill="#ffff00" opacity="0.3"/>
          </pattern>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#stars)" opacity="0.6"/>
        
        {/* Render tiles in depth order */}
        {tilePositions.map(({ tile, screenPos }, index) => {
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

          // Create staggered pulse timing for tiles
          const pulseOffset = (index * 0.1) % 3;

          return (
            <IsometricTile
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
              screenPosition={{
                x: screenPos.x + offsetX,
                y: screenPos.y + offsetY,
              }}
              pulseOffset={pulseOffset}
            />
          );
        })}
      </svg>
      
      <div style={{ 
        marginTop: '15px', 
        fontSize: '11px', 
        color: '#66aacc',
        textAlign: 'center'
      }}>
        <strong>🎮 Mystic Controls:</strong> Click any glowing tile to move • Hover for enhanced glow effects
      </div>
    </div>
  );
};