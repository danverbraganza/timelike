import type { Level, Tile, Character, Pizza } from '../types/game';
import { TileType, PizzaType } from '../types/game';
import { createHex, hexToKey } from '../utils/hex';

/**
 * TRACER BULLETS / JIG CODE - This is temporary level generation code
 * TODO: This should be refactored into proper level generation system
 * with support for the different archetypes (Ancient, Present, Modern)
 * and proper static level loading for levels 1, 5, 10, 15, 20, 25, 30
 */

interface SimpleTestLevelOptions {
  width?: number;
  height?: number;
  addObstacles?: boolean;
  addPizzas?: boolean;
}

/**
 * TRACER BULLETS: Creates a simple test level for immediate visualization
 * This is temporary code to get basic gameplay working quickly
 */
export function createSimpleTestLevel(options: SimpleTestLevelOptions = {}): {
  level: Level;
  player: Character;
  pizzas: Pizza[];
} {
  const {
    width = 8,
    height = 8,
    addObstacles = true,
    addPizzas = true,
  } = options;

  const tiles = new Map<string, Tile>();
  
  // TRACER BULLETS: Generate basic hex grid with mixed tile types
  for (let q = 0; q < width; q++) {
    const qOffset = Math.floor(q / 2);
    for (let r = -qOffset; r < height - qOffset; r++) {
      const position = createHex(q, r);
      const key = hexToKey(position);
      
      let tileType: TileType = TileType.GRASS;
      
      // Add some variety to the tiles
      if (addObstacles) {
        const random = Math.random();
        if (random < 0.1) {
          tileType = TileType.WATER;
        } else if (random < 0.15) {
          tileType = TileType.STONE;
        } else if (random < 0.05) {
          tileType = TileType.BLOCKED;
        }
      }
      
      // Add character spawn at center-ish
      if (q === Math.floor(width / 2) && r === 0) {
        tileType = TileType.CHARACTER_SPAWN;
      }
      
      // Add some pizza spawns
      if (addPizzas && (
        (q === 1 && r === 0) ||
        (q === width - 2 && r === -1) ||
        (q === 2 && r === 2)
      )) {
        tileType = TileType.PIZZA_SPAWN;
      }
      
      tiles.set(key, {
        position,
        type: tileType,
      });
    }
  }

  // TRACER BULLETS: Create test level
  const level: Level = {
    id: 999, // Test level ID
    name: "TRACER BULLETS Test Level",
    width,
    height,
    tiles,
    timeLimit: undefined, // Infinite time as specified in Task 20
    isStatic: false,
  };

  // TRACER BULLETS: Create player character at spawn point
  const playerSpawnTile = Array.from(tiles.values())
    .find(tile => tile.type === TileType.CHARACTER_SPAWN);
  
  const playerPosition = playerSpawnTile ? playerSpawnTile.position : createHex(0, 0);
  
  const player: Character = {
    id: 'player-1',
    name: 'Test Player',
    position: playerPosition,
    movementSpeed: 1,
    type: 'player',
  };

  // TRACER BULLETS: Create some test pizzas at spawn points
  const pizzas: Pizza[] = [];
  if (addPizzas) {
    const pizzaSpawnTiles = Array.from(tiles.values())
      .filter(tile => tile.type === TileType.PIZZA_SPAWN);
    
    pizzaSpawnTiles.forEach((tile, index) => {
      const pizza: Pizza = {
        id: `pizza-${index + 1}`,
        position: tile.position,
        type: [PizzaType.CHEESE, PizzaType.PEPPERONI, PizzaType.SAUSAGE][index % 3],
        targetCharacterId: 'npc-1', // Would be actual NPC in real game
      };
      pizzas.push(pizza);
    });
  }

  return { level, player, pizzas };
}