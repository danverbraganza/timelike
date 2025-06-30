import type { 
  TurnState, 
  Timeline, 
  BitemporalGameState,
  StateChangeEvent,
  Character,
  Pizza,
  Tile
} from '../../types/game';
import { v4 as uuidv4 } from 'uuid';

/**
 * BitemporalStore manages the complex state of time travel in the game.
 * It handles multiple timelines, state merging, and ghost replay.
 */
export class BitemporalStore {
  private timelines: Map<string, Timeline>;
  private activeTimelineId: string;
  private currentTurn: number;
  private isReversing: boolean;
  private events: StateChangeEvent[];

  constructor() {
    this.timelines = new Map();
    this.currentTurn = 0;
    this.isReversing = false;
    this.events = [];

    // Create initial timeline
    const initialTimelineId = uuidv4();
    this.activeTimelineId = initialTimelineId;
    this.timelines.set(initialTimelineId, {
      id: initialTimelineId,
      isPlayerControlled: true,
      turns: new Map()
    });
  }

  /**
   * Get the current bitemporal state
   */
  getState(): BitemporalGameState {
    return {
      timelines: new Map(this.timelines),
      activeTimelineId: this.activeTimelineId,
      mergedState: this.getMergedState(this.currentTurn),
      currentTurn: this.currentTurn,
      isReversing: this.isReversing
    };
  }

  /**
   * Save a turn state for the active timeline
   */
  saveTurnState(turnState: TurnState): void {
    const timeline = this.timelines.get(this.activeTimelineId);
    if (!timeline) {
      throw new Error(`Active timeline ${this.activeTimelineId} not found`);
    }

    // Ensure the turn state has the correct timeline ID
    turnState.timelineId = this.activeTimelineId;
    turnState.turnNumber = this.currentTurn;

    // Deep clone the state to ensure immutability
    const clonedState = this.cloneTurnState(turnState);
    timeline.turns.set(this.currentTurn, clonedState);
  }

  /**
   * Advance to the next turn
   */
  advanceTurn(): void {
    if (this.isReversing) {
      this.currentTurn--;
      if (this.currentTurn < 0) {
        this.currentTurn = 0;
        this.isReversing = false;
      }
    } else {
      this.currentTurn++;
    }
  }

  /**
   * Start time reversal, creating a new timeline branch
   */
  startTimeReversal(): string {
    if (this.currentTurn === 0) {
      throw new Error('Cannot reverse time at turn 0');
    }

    // Mark current timeline as no longer player-controlled
    const currentTimeline = this.timelines.get(this.activeTimelineId);
    if (currentTimeline) {
      currentTimeline.isPlayerControlled = false;
    }

    // Create new timeline branching from current point
    const newTimelineId = uuidv4();
    const newTimeline: Timeline = {
      id: newTimelineId,
      parentTimelineId: this.activeTimelineId,
      branchPoint: this.currentTurn,
      isPlayerControlled: true,
      turns: new Map()
    };

    this.timelines.set(newTimelineId, newTimeline);
    this.activeTimelineId = newTimelineId;
    this.isReversing = true;

    return newTimelineId;
  }

  /**
   * Stop time reversal
   */
  stopTimeReversal(): void {
    this.isReversing = false;
  }

  /**
   * Get merged state at a specific turn using last-write-wins
   */
  getMergedState(turnNumber: number): TurnState {
    const mergedCharacters = new Map<string, Character>();
    const mergedPizzas = new Map<string, Pizza>();
    const mergedTiles = new Map<string, Tile>();
    let playerInventory: Pizza | undefined;
    let latestTimestamp = 0;

    // Process all timelines to build merged state
    for (const timeline of this.timelines.values()) {
      const turnState = timeline.turns.get(turnNumber);
      if (!turnState) continue;

      // Last-write-wins: if this state is newer, use it
      if (turnState.timestamp >= latestTimestamp) {
        latestTimestamp = turnState.timestamp;
        
        // Merge characters
        for (const [id, character] of turnState.characters) {
          mergedCharacters.set(id, this.cloneCharacter(character));
        }

        // Merge pizzas
        for (const [id, pizza] of turnState.pizzas) {
          mergedPizzas.set(id, this.clonePizza(pizza));
        }

        // Merge tiles (only dynamic ones)
        for (const [key, tile] of turnState.tiles) {
          mergedTiles.set(key, this.cloneTile(tile));
        }

        // Update player inventory
        if (turnState.playerInventory) {
          playerInventory = this.clonePizza(turnState.playerInventory);
        }
      }
    }

    return {
      turnNumber,
      timestamp: latestTimestamp,
      characters: mergedCharacters,
      pizzas: mergedPizzas,
      tiles: mergedTiles,
      playerInventory,
      timelineId: this.activeTimelineId
    };
  }

  /**
   * Get all ghost states at a specific turn (all timelines except active)
   */
  getGhostStates(turnNumber: number): TurnState[] {
    const ghostStates: TurnState[] = [];

    for (const [timelineId, timeline] of this.timelines) {
      if (timelineId === this.activeTimelineId) continue;

      const turnState = timeline.turns.get(turnNumber);
      if (turnState) {
        ghostStates.push(this.cloneTurnState(turnState));
      }
    }

    return ghostStates;
  }

  /**
   * Get the state from a specific timeline at a specific turn
   */
  getTimelineState(timelineId: string, turnNumber: number): TurnState | null {
    const timeline = this.timelines.get(timelineId);
    if (!timeline) return null;

    const turnState = timeline.turns.get(turnNumber);
    return turnState ? this.cloneTurnState(turnState) : null;
  }

  /**
   * Record a state change event
   */
  recordEvent(event: StateChangeEvent): void {
    this.events.push({ ...event });
  }

  /**
   * Get all events for a specific turn
   */
  getEventsForTurn(turnNumber: number): StateChangeEvent[] {
    return this.events.filter(e => e.turnNumber === turnNumber);
  }

  /**
   * Get all timelines
   */
  getAllTimelines(): Timeline[] {
    return Array.from(this.timelines.values());
  }

  /**
   * Check if we're currently reversing time
   */
  isReversingTime(): boolean {
    return this.isReversing;
  }

  /**
   * Get current turn number
   */
  getCurrentTurn(): number {
    return this.currentTurn;
  }

  /**
   * Get active timeline ID
   */
  getActiveTimelineId(): string {
    return this.activeTimelineId;
  }

  /**
   * Reset to initial state
   */
  reset(): void {
    this.timelines.clear();
    this.currentTurn = 0;
    this.isReversing = false;
    this.events = [];

    // Create new initial timeline
    const initialTimelineId = uuidv4();
    this.activeTimelineId = initialTimelineId;
    this.timelines.set(initialTimelineId, {
      id: initialTimelineId,
      isPlayerControlled: true,
      turns: new Map()
    });
  }

  // Helper methods for deep cloning
  private cloneTurnState(state: TurnState): TurnState {
    return {
      turnNumber: state.turnNumber,
      timestamp: state.timestamp,
      characters: new Map(Array.from(state.characters.entries()).map(
        ([id, char]) => [id, this.cloneCharacter(char)]
      )),
      pizzas: new Map(Array.from(state.pizzas.entries()).map(
        ([id, pizza]) => [id, this.clonePizza(pizza)]
      )),
      tiles: new Map(Array.from(state.tiles.entries()).map(
        ([key, tile]) => [key, this.cloneTile(tile)]
      )),
      playerInventory: state.playerInventory ? this.clonePizza(state.playerInventory) : undefined,
      timelineId: state.timelineId,
      parentTurnNumber: state.parentTurnNumber
    };
  }

  private cloneCharacter(character: Character): Character {
    return {
      ...character,
      position: { ...character.position }
    };
  }

  private clonePizza(pizza: Pizza): Pizza {
    return {
      ...pizza,
      position: { ...pizza.position }
    };
  }

  private cloneTile(tile: Tile): Tile {
    return {
      ...tile,
      position: { ...tile.position }
    };
  }
}