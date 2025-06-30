import { BitemporalStore } from '../../state/BitemporalStore';
import type { TurnState, Character, Pizza, Tile } from '../../../types/game';
import { TileType } from '../../../types/game';

describe('BitemporalStore', () => {
  let store: BitemporalStore;

  beforeEach(() => {
    store = new BitemporalStore();
  });

  const createMockTurnState = (turnNumber: number, timelineId?: string): TurnState => {
    const char: Character = {
      id: 'player1',
      name: 'Player',
      position: { q: turnNumber, r: 0, s: -turnNumber },
      movementSpeed: 1,
      type: 'player'
    };

    const pizza: Pizza = {
      id: 'pizza1',
      position: { q: 0, r: turnNumber, s: -turnNumber },
      type: 'cheese' as any,
      targetCharacterId: 'npc1'
    };

    const tile: Tile = {
      position: { q: 0, r: 0, s: 0 },
      type: TileType.WATER
    };

    return {
      turnNumber,
      timestamp: Date.now(),
      characters: new Map([['player1', char]]),
      pizzas: new Map([['pizza1', pizza]]),
      tiles: new Map([['0,0', tile]]),
      timelineId: timelineId || store.getActiveTimelineId()
    };
  };

  describe('initialization', () => {
    it('should create an initial timeline', () => {
      const state = store.getState();
      expect(state.timelines.size).toBe(1);
      expect(state.currentTurn).toBe(0);
      expect(state.isReversing).toBe(false);
    });

    it('should set the initial timeline as active and player-controlled', () => {
      const timelines = store.getAllTimelines();
      expect(timelines).toHaveLength(1);
      expect(timelines[0].isPlayerControlled).toBe(true);
      expect(timelines[0].id).toBe(store.getActiveTimelineId());
    });
  });

  describe('saving turn states', () => {
    it('should save a turn state to the active timeline', () => {
      const turnState = createMockTurnState(0);
      store.saveTurnState(turnState);

      const state = store.getState();
      const timeline = state.timelines.get(state.activeTimelineId);
      expect(timeline?.turns.size).toBe(1);
      expect(timeline?.turns.get(0)).toBeDefined();
    });

    it('should deep clone the turn state', () => {
      const turnState = createMockTurnState(0);
      store.saveTurnState(turnState);

      // Modify original
      turnState.characters.get('player1')!.position.q = 999;

      const savedState = store.getTimelineState(store.getActiveTimelineId(), 0);
      expect(savedState?.characters.get('player1')?.position.q).toBe(0);
    });
  });

  describe('turn advancement', () => {
    it('should advance turns forward normally', () => {
      expect(store.getCurrentTurn()).toBe(0);
      store.advanceTurn();
      expect(store.getCurrentTurn()).toBe(1);
      store.advanceTurn();
      expect(store.getCurrentTurn()).toBe(2);
    });

    it('should advance turns backward when reversing', () => {
      // Move forward first
      store.advanceTurn();
      store.advanceTurn();
      expect(store.getCurrentTurn()).toBe(2);

      // Start reversing
      store.startTimeReversal();
      store.advanceTurn();
      expect(store.getCurrentTurn()).toBe(1);
      store.advanceTurn();
      expect(store.getCurrentTurn()).toBe(0);
    });

    it('should stop reversing at turn 0', () => {
      store.advanceTurn();
      store.startTimeReversal();
      store.advanceTurn(); // Goes to turn 0
      store.advanceTurn(); // Should stay at 0 and stop reversing
      
      expect(store.getCurrentTurn()).toBe(0);
      expect(store.isReversingTime()).toBe(false);
    });
  });

  describe('time reversal', () => {
    it('should create a new timeline when starting reversal', () => {
      store.advanceTurn();
      const initialTimelineId = store.getActiveTimelineId();
      
      const newTimelineId = store.startTimeReversal();
      
      expect(newTimelineId).not.toBe(initialTimelineId);
      expect(store.getAllTimelines()).toHaveLength(2);
    });

    it('should mark old timeline as not player-controlled', () => {
      store.advanceTurn();
      const initialTimelineId = store.getActiveTimelineId();
      
      store.startTimeReversal();
      
      const timelines = store.getAllTimelines();
      const oldTimeline = timelines.find(t => t.id === initialTimelineId);
      const newTimeline = timelines.find(t => t.id === store.getActiveTimelineId());
      
      expect(oldTimeline?.isPlayerControlled).toBe(false);
      expect(newTimeline?.isPlayerControlled).toBe(true);
    });

    it('should set branch point correctly', () => {
      store.advanceTurn();
      store.advanceTurn();
      store.advanceTurn(); // Turn 3
      
      store.startTimeReversal();
      
      const newTimeline = store.getAllTimelines().find(
        t => t.id === store.getActiveTimelineId()
      );
      expect(newTimeline?.branchPoint).toBe(3);
    });

    it('should throw error when reversing at turn 0', () => {
      expect(() => store.startTimeReversal()).toThrow('Cannot reverse time at turn 0');
    });
  });

  describe('merged state with last-write-wins', () => {
    it('should merge states from multiple timelines', () => {
      // Timeline 1: Save state at turn 1
      store.advanceTurn();
      const state1 = createMockTurnState(1);
      state1.timestamp = 1000;
      store.saveTurnState(state1);

      // Create timeline 2
      store.startTimeReversal();
      
      // Timeline 2: Save different state at turn 1
      const state2 = createMockTurnState(1);
      state2.characters.get('player1')!.position.q = 5;
      state2.timestamp = 2000; // Newer timestamp
      store.saveTurnState(state2);

      const merged = store.getMergedState(1);
      expect(merged.characters.get('player1')?.position.q).toBe(5); // Last write wins
    });

    it('should handle tile state changes correctly', () => {
      // Turn 1: Water tile
      store.advanceTurn();
      const state1 = createMockTurnState(1);
      state1.tiles.set('0,0', {
        position: { q: 0, r: 0, s: 0 },
        type: TileType.WATER
      });
      state1.timestamp = 1000;
      store.saveTurnState(state1);

      // Turn 2: Freeze water to ice
      store.advanceTurn();
      store.startTimeReversal();
      
      const state2 = createMockTurnState(2);
      state2.tiles.set('0,0', {
        position: { q: 0, r: 0, s: 0 },
        type: TileType.BLOCKED // Using BLOCKED as "ice" for this test
      });
      state2.timestamp = 2000;
      store.saveTurnState(state2);

      const merged = store.getMergedState(2);
      expect(merged.tiles.get('0,0')?.type).toBe(TileType.BLOCKED);
    });
  });

  describe('ghost states', () => {
    it('should return ghost states from non-active timelines', () => {
      // Save states in timeline 1
      store.advanceTurn();
      store.saveTurnState(createMockTurnState(1));
      store.advanceTurn();
      store.saveTurnState(createMockTurnState(2));

      // Create timeline 2
      store.startTimeReversal();

      // Check ghost states
      const ghosts = store.getGhostStates(1);
      expect(ghosts).toHaveLength(1);
      expect(ghosts[0].turnNumber).toBe(1);
    });

    it('should not include active timeline in ghost states', () => {
      store.advanceTurn();
      store.saveTurnState(createMockTurnState(1));

      const ghosts = store.getGhostStates(1);
      expect(ghosts).toHaveLength(0);
    });
  });

  describe('event recording', () => {
    it('should record and retrieve events', () => {
      const event = {
        type: 'move' as any,
        turnNumber: 1,
        timelineId: store.getActiveTimelineId(),
        entityId: 'player1',
        data: { newPosition: { q: 1, r: 0 } },
        timestamp: Date.now()
      };

      store.recordEvent(event);
      const events = store.getEventsForTurn(1);
      
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('move');
      expect(events[0].entityId).toBe('player1');
    });

    it('should filter events by turn number', () => {
      store.recordEvent({
        type: 'move' as any,
        turnNumber: 1,
        timelineId: store.getActiveTimelineId(),
        timestamp: Date.now(),
        data: {}
      });

      store.recordEvent({
        type: 'pickup' as any,
        turnNumber: 2,
        timelineId: store.getActiveTimelineId(),
        timestamp: Date.now(),
        data: {}
      });

      expect(store.getEventsForTurn(1)).toHaveLength(1);
      expect(store.getEventsForTurn(2)).toHaveLength(1);
      expect(store.getEventsForTurn(3)).toHaveLength(0);
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      // Make some changes
      store.advanceTurn();
      store.saveTurnState(createMockTurnState(1));
      store.startTimeReversal();
      store.recordEvent({
        type: 'move' as any,
        turnNumber: 1,
        timelineId: store.getActiveTimelineId(),
        timestamp: Date.now(),
        data: {}
      });

      // Reset
      store.reset();

      expect(store.getCurrentTurn()).toBe(0);
      expect(store.getAllTimelines()).toHaveLength(1);
      expect(store.getEventsForTurn(1)).toHaveLength(0);
      expect(store.isReversingTime()).toBe(false);
    });
  });

  describe('complex time travel scenario', () => {
    it('should handle the toy scenario from the spec', () => {
      // Player moves right from 0 to 5
      for (let i = 0; i <= 5; i++) {
        const state = createMockTurnState(i);
        state.characters.get('player1')!.position.q = i;
        store.saveTurnState(state);
        if (i < 5) store.advanceTurn();
      }

      expect(store.getCurrentTurn()).toBe(5);

      // Start time reversal at turn 5
      const timeline2 = store.startTimeReversal();

      // Move backwards in time while moving right in space
      for (let turn = 4; turn >= 0; turn--) {
        store.advanceTurn(); // Goes backwards
        const state = createMockTurnState(turn);
        state.characters.get('player1')!.position.q = 10 - turn; // 6, 7, 8, 9, 10
        state.timelineId = timeline2;
        store.saveTurnState(state);
      }

      expect(store.getCurrentTurn()).toBe(0);
      expect(store.isReversingTime()).toBe(true); // Still reversing at 0
      
      // One more advance to stop reversing
      store.advanceTurn();
      expect(store.getCurrentTurn()).toBe(0);
      expect(store.isReversingTime()).toBe(false); // Now stopped

      // Check merged state at turn 0
      const merged = store.getMergedState(0);
      const ghosts = store.getGhostStates(0);

      // Player should be at position 10 (from timeline 2, last write)
      expect(merged.characters.get('player1')?.position.q).toBe(10);

      // Ghost should be at position 0 (from timeline 1)
      expect(ghosts).toHaveLength(1);
      expect(ghosts[0].characters.get('player1')?.position.q).toBe(0);
    });
  });
});