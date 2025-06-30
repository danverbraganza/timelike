import { BitemporalStore } from './BitemporalStore';
import { HexGrid } from '../../utils/hexGrid';
import type { 
  GameState, 
  Level, 
  TurnState,
  Tile,
  StateChangeEvent,
  StateChangeType
} from '../../types/game';

/**
 * GameStateManager orchestrates the game state, managing levels,
 * turns, and the bitemporal store for time travel mechanics.
 */
export class GameStateManager {
  private bitemporalStore: BitemporalStore;
  private currentLevel: Level;
  private hexGrid: HexGrid;
  private gameState: GameState;
  private turnStartCallbacks: Array<(turn: number) => void> = [];
  private turnEndCallbacks: Array<(turn: number) => void> = [];

  constructor(level: Level) {
    this.bitemporalStore = new BitemporalStore();
    this.currentLevel = level;
    this.hexGrid = new HexGrid({
      width: level.width,
      height: level.height
    });

    // Initialize hex grid with level tiles
    this.initializeGrid();

    // Initialize game state
    this.gameState = {
      currentLevel: level.id,
      currentTurn: 0,
      isTimeTraveling: false,
      activeTurnIndex: 0,
      turnHistory: [],
      bitemporalState: this.bitemporalStore.getState(),
      score: 0,
      gameStatus: 'playing'
    };

    // Save initial state
    this.saveCurrentState();
  }

  /**
   * Initialize the hex grid with level data
   */
  private initializeGrid(): void {
    // Set up tiles from level
    for (const [key, tile] of this.currentLevel.tiles) {
      const [q, r] = key.split(',').map(Number);
      this.hexGrid.setTile({ q, r, s: -q - r }, tile.type);
    }
  }

  /**
   * Get current game state
   */
  getGameState(): GameState {
    return {
      ...this.gameState,
      bitemporalState: this.bitemporalStore.getState()
    };
  }

  /**
   * Save current grid state to bitemporal store
   */
  saveCurrentState(): void {
    const turnState: TurnState = {
      turnNumber: this.bitemporalStore.getCurrentTurn(),
      timestamp: Date.now(),
      characters: new Map(this.hexGrid.getAllCharacters().map(char => [char.id, char])),
      pizzas: new Map(this.hexGrid.getAllPizzas().map(pizza => [pizza.id, pizza])),
      tiles: this.getDynamicTiles(),
      timelineId: this.bitemporalStore.getActiveTimelineId()
    };

    this.bitemporalStore.saveTurnState(turnState);
    this.gameState.turnHistory.push(turnState);
  }

  /**
   * Get only dynamic tiles (ones that have changed from default)
   */
  private getDynamicTiles(): Map<string, Tile> {
    const dynamicTiles = new Map<string, Tile>();
    
    // Compare current tiles with level defaults
    for (const tile of this.hexGrid.getAllTiles()) {
      const key = `${tile.position.q},${tile.position.r}`;
      const defaultTile = this.currentLevel.tiles.get(key);
      
      // If tile type has changed, it's dynamic
      if (!defaultTile || defaultTile.type !== tile.type) {
        dynamicTiles.set(key, tile);
      }
    }

    return dynamicTiles;
  }

  /**
   * Advance to next turn
   */
  advanceTurn(): void {
    // Fire turn end callbacks
    this.turnEndCallbacks.forEach(cb => cb(this.gameState.currentTurn));

    // Advance bitemporal store
    this.bitemporalStore.advanceTurn();
    
    // Update game state
    this.gameState.currentTurn = this.bitemporalStore.getCurrentTurn();
    this.gameState.activeTurnIndex = this.gameState.currentTurn;

    // Apply ghost states
    this.applyGhostStates();

    // Save new state
    this.saveCurrentState();

    // Fire turn start callbacks
    this.turnStartCallbacks.forEach(cb => cb(this.gameState.currentTurn));

    // Check if level is complete after advancing
    this.checkLevelComplete();
  }

  /**
   * Apply ghost states to the grid
   */
  private applyGhostStates(): void {
    const currentTurn = this.bitemporalStore.getCurrentTurn();
    const mergedState = this.bitemporalStore.getMergedState(currentTurn);
    
    // Clear current entities
    this.hexGrid.clearEntities();

    // Apply merged characters
    for (const character of mergedState.characters.values()) {
      this.hexGrid.addCharacter(character);
    }

    // Apply merged pizzas
    for (const pizza of mergedState.pizzas.values()) {
      this.hexGrid.addPizza(pizza);
    }

    // Apply merged tiles (last-write-wins for conflicts)
    for (const [, tile] of mergedState.tiles) {
      this.hexGrid.setTile(tile.position, tile.type);
    }
  }

  /**
   * Start time reversal
   */
  startTimeReversal(): void {
    if (this.gameState.currentTurn === 0) {
      throw new Error('Cannot reverse time at turn 0');
    }

    const newTimelineId = this.bitemporalStore.startTimeReversal();
    this.gameState.isTimeTraveling = true;

    // Record time reversal event
    const event: StateChangeEvent = {
      type: 'time_reverse' as StateChangeType,
      turnNumber: this.gameState.currentTurn,
      timelineId: newTimelineId,
      timestamp: Date.now(),
      data: { fromTurn: this.gameState.currentTurn }
    };
    this.bitemporalStore.recordEvent(event);
  }

  /**
   * Stop time reversal
   */
  stopTimeReversal(): void {
    this.bitemporalStore.stopTimeReversal();
    this.gameState.isTimeTraveling = false;
  }

  /**
   * Move a character
   */
  moveCharacter(characterId: string, newPosition: { q: number; r: number }): boolean {
    const success = this.hexGrid.moveCharacter(characterId, {
      ...newPosition,
      s: -newPosition.q - newPosition.r
    });

    if (success) {
      const event: StateChangeEvent = {
        type: 'move' as StateChangeType,
        turnNumber: this.gameState.currentTurn,
        timelineId: this.bitemporalStore.getActiveTimelineId(),
        entityId: characterId,
        timestamp: Date.now(),
        data: { newPosition }
      };
      this.bitemporalStore.recordEvent(event);
    }

    return success;
  }

  /**
   * Change a tile (e.g., water to ice)
   */
  changeTile(position: { q: number; r: number }, newType: string): boolean {
    const hex = { ...position, s: -position.q - position.r };
    const success = this.hexGrid.setTile(hex, newType as any);

    if (success) {
      const event: StateChangeEvent = {
        type: 'tile_change' as StateChangeType,
        turnNumber: this.gameState.currentTurn,
        timelineId: this.bitemporalStore.getActiveTimelineId(),
        timestamp: Date.now(),
        data: { position, newType }
      };
      this.bitemporalStore.recordEvent(event);
    }

    return success;
  }

  /**
   * Check if level is complete
   */
  checkLevelComplete(): void {
    // Get all NPCs (customers)
    const npcs = this.hexGrid.getAllCharacters().filter(char => char.type === 'npc');
    
    // If there are no NPCs, we can't check for pizza delivery
    if (npcs.length === 0) {
      // Only check time limit
      const hasTimeRemaining = this.currentLevel.timeLimit === undefined || 
                             this.gameState.currentTurn < this.currentLevel.timeLimit;
      if (!hasTimeRemaining) {
        this.gameState.gameStatus = 'lost';
      }
      return;
    }

    // Check if all NPCs have received their pizzas
    const allPizzasDelivered = this.hexGrid.getAllPizzas().length === 0;
    const hasTimeRemaining = this.currentLevel.timeLimit === undefined || 
                           this.gameState.currentTurn < this.currentLevel.timeLimit;

    if (allPizzasDelivered && npcs.length > 0) {
      this.gameState.gameStatus = 'won';
    } else if (!hasTimeRemaining) {
      this.gameState.gameStatus = 'lost';
    }
  }

  /**
   * Get remaining turns
   */
  getRemainingTurns(): number | null {
    if (this.currentLevel.timeLimit === undefined) {
      return null; // Infinite time
    }
    return Math.max(0, this.currentLevel.timeLimit - this.gameState.currentTurn);
  }

  /**
   * Register callback for turn start
   */
  onTurnStart(callback: (turn: number) => void): void {
    this.turnStartCallbacks.push(callback);
  }

  /**
   * Register callback for turn end
   */
  onTurnEnd(callback: (turn: number) => void): void {
    this.turnEndCallbacks.push(callback);
  }

  /**
   * Get the hex grid
   */
  getHexGrid(): HexGrid {
    return this.hexGrid;
  }

  /**
   * Get all timelines
   */
  getTimelines(): Array<{ id: string; isActive: boolean; branchPoint?: number }> {
    return this.bitemporalStore.getAllTimelines().map(timeline => ({
      id: timeline.id,
      isActive: timeline.id === this.bitemporalStore.getActiveTimelineId(),
      branchPoint: timeline.branchPoint
    }));
  }

  /**
   * Reset game state
   */
  reset(): void {
    this.bitemporalStore.reset();
    this.hexGrid.clearEntities();
    this.initializeGrid();
    
    this.gameState = {
      currentLevel: this.currentLevel.id,
      currentTurn: 0,
      isTimeTraveling: false,
      activeTurnIndex: 0,
      turnHistory: [],
      bitemporalState: this.bitemporalStore.getState(),
      score: 0,
      gameStatus: 'playing'
    };

    this.saveCurrentState();
  }
}