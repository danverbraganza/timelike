import { GameStateManager } from '../state/GameStateManager';
import type { Level } from '../../types/game';
import { TileType } from '../../types/game';

/**
 * Example demonstrating the bitemporal game state system with time travel
 */
export function runTimeTravelExample() {
  console.log('=== Time Travel Pizza Delivery Example ===\n');

  // Create a simple level
  const level: Level = {
    id: 1,
    name: 'Time Travel Demo',
    width: 5,
    height: 5,
    tiles: new Map([
      // Create a 5x5 grid with water at (2,2)
      ['0,0', { position: { q: 0, r: 0, s: 0 }, type: TileType.GRASS }],
      ['1,0', { position: { q: 1, r: 0, s: -1 }, type: TileType.GRASS }],
      ['2,0', { position: { q: 2, r: 0, s: -2 }, type: TileType.GRASS }],
      ['0,1', { position: { q: 0, r: 1, s: -1 }, type: TileType.GRASS }],
      ['1,1', { position: { q: 1, r: 1, s: -2 }, type: TileType.GRASS }],
      ['2,1', { position: { q: 2, r: 1, s: -3 }, type: TileType.GRASS }],
      ['2,2', { position: { q: 2, r: 2, s: -4 }, type: TileType.WATER }],
    ]),
    timeLimit: 10,
    isStatic: false
  };

  const gameManager = new GameStateManager(level);
  const grid = gameManager.getHexGrid();

  // Add player character
  grid.addCharacter({
    id: 'player1',
    name: 'Pizza Delivery Person',
    position: { q: 0, r: 0, s: 0 },
    movementSpeed: 1,
    type: 'player'
  });

  // Add NPC customer
  grid.addCharacter({
    id: 'npc1',
    name: 'Hungry Customer',
    position: { q: 2, r: 0, s: -2 },
    movementSpeed: 0,
    type: 'npc'
  });

  // Add pizza
  grid.addPizza({
    id: 'pizza1',
    position: { q: 1, r: 0, s: -1 },
    type: 'cheese' as any,
    targetCharacterId: 'npc1'
  });

  console.log('Turn 0: Initial state');
  console.log('- Player at (0,0)');
  console.log('- Pizza at (1,0)');
  console.log('- Customer at (2,0)');
  console.log('- Water at (2,2)\n');

  // Turn 1: Move player to pick up pizza
  gameManager.saveCurrentState();
  gameManager.advanceTurn();
  gameManager.moveCharacter('player1', { q: 1, r: 0 });
  console.log('Turn 1: Player moves to (1,0) and picks up pizza');

  // Turn 2: Move towards customer
  gameManager.saveCurrentState();
  gameManager.advanceTurn();
  gameManager.moveCharacter('player1', { q: 2, r: 0 });
  console.log('Turn 2: Player delivers pizza to customer at (2,0)');

  // Turn 3: Freeze water to ice
  gameManager.saveCurrentState();
  gameManager.advanceTurn();
  gameManager.changeTile({ q: 2, r: 2 }, TileType.BLOCKED); // Using BLOCKED as "ice"
  console.log('Turn 3: Water at (2,2) freezes to ice\n');

  // Start time reversal
  console.log('=== ACTIVATING TIME REVERSAL ===');
  gameManager.startTimeReversal();
  const timelines = gameManager.getTimelines();
  console.log(`Created new timeline. Total timelines: ${timelines.length}\n`);

  // Go back to turn 2
  gameManager.advanceTurn();
  console.log('Reversed to Turn 2:');
  console.log('- Ghost timeline 1: Player at (2,0) with pizza delivered');
  console.log('- Current timeline: Player can make different choices');

  // In the new timeline, heat the water instead
  gameManager.changeTile({ q: 2, r: 2 }, TileType.LAVA); // Using LAVA as "steam"
  console.log('- New timeline: Water at (2,2) turns to steam instead of ice\n');

  // Stop reversing and move forward
  gameManager.stopTimeReversal();
  gameManager.advanceTurn();
  console.log('Turn 3 (forward again):');
  console.log('- Timeline 1 (ghost): Water is ice');
  console.log('- Timeline 2 (active): Water is steam');
  console.log('- Merged state uses last-write-wins: Water is steam\n');

  // Check final state
  const finalState = gameManager.getGameState();
  console.log('=== FINAL STATE ===');
  console.log(`Current turn: ${finalState.currentTurn}`);
  console.log(`Total timelines: ${finalState.bitemporalState?.timelines.size}`);
  console.log(`Game status: ${finalState.gameStatus}`);
  console.log(`Remaining turns: ${gameManager.getRemainingTurns()}`);

  return gameManager;
}

// Run the example if this file is executed directly
if (require.main === module) {
  runTimeTravelExample();
}